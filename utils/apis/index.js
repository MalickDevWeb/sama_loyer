// ============================================================================
// SAMA LOYER BACKEND API SERVICE
// Centralized access to the Sama Loyer REST endpoints via BackendAPI singleton.
// Implémente le pattern préconisé par la skill WeChat PMT :
//   1. Routing (ENDPOINTS)
//   2. Schéma Json-Sculpt (utils/mappers)
//   3. Méthodes de service typées avec gestion d'erreurs normalisées
//   4. Fallback transparent vers le store local pour résilience totale en démo
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import { sculpt } from '../json-sculpt/sculpt.js';
import { normalizeApiError } from '../errors/index.js';
import {
  LogementCardSchema,
  LogementDetailSchema,
  LoyerSchema,
  VisiteSchema
} from '../mappers/index.js';

// Fallback local pour garantir 100% de disponibilité sans serveur backend actif
import { getAllLogements, getLogementById as getMockLogementById } from '../mocks/logements.js';
import {
  getStoredRawVisites,
  getStoredBailleurAnnonces,
  getStoredLocataires,
  recordRentPayment
} from '../helpers/store.js';
import { RENTED_HOMES } from '../mocks/loyers.js';
import { cached, invalidateCache } from './cache.js';
import { Bus } from '../event/index.js';
import { EVENTS } from '../event/keys.js';

// Durée de vie en cache des lectures (ms)
const TTL = {
  LOGEMENTS: 5 * 60 * 1000,
  LOGEMENT_DETAIL: 10 * 60 * 1000,
  PERSONAL: 60 * 1000 // loyers, visites, données du bailleur : changent plus souvent
};

export const ENDPOINTS = {
  LOGEMENTS: '/api/v1/logements',
  LOGEMENT_DETAIL: (id) => `/api/v1/logements/${id}`,
  LOYERS: '/api/v1/loyers',
  LOYER_PAY: (id) => `/api/v1/loyers/${id}/pay`,
  VISITES: '/api/v1/visites',
  VISITE_CREATE: '/api/v1/visites',
  BAILLEUR_ANNONCES: '/api/v1/bailleur/annonces',
  BAILLEUR_LOCATAIRES: '/api/v1/bailleur/locataires',
  AUTH_MAXIT: '/api/v1/auth/maxit',
};

function extractApiResponse(res, fallbackMessage) {
  if (!res || res.success !== true) {
    throw normalizeApiError({
      status: Number(res?.status) >= 400 ? res.status : undefined,
      body: res?.error || res,
      metadata: { response: res },
    }, fallbackMessage);
  }

  const body = res.data;
  if (body === null || body === undefined) {
    throw normalizeApiError({ status: 502, code: 'INVALID_API_RESPONSE', metadata: { response: res } }, fallbackMessage);
  }

  if (body && typeof body === 'object' && (
    body.success === false || Number(body.data && body.data.status) >= 400
  )) {
    throw normalizeApiError({
      status: Number(body.data && body.data.status) >= 400 ? body.data.status : res.status,
      body,
      metadata: { response: res },
    }, fallbackMessage);
  }

  return body;
}

/**
 * Service singleton pour toutes les opérations API Sama Loyer.
 * Gère l'authentification OAuth2 Max it, la sérialisation et le mapping Json-Sculpt.
 *
 * @class BackendAPI
 */
class BackendAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  #sculpt(data, schema, fallbackMessage) {
    try {
      return sculpt.data({ data, to: schema });
    } catch (error) {
      throw normalizeApiError({
        status: 502,
        code: 'SCULPT_ERROR',
        message: error.message,
        metadata: { cause: error },
      }, fallbackMessage);
    }
  }

  // ==========================================================================
  // 1. LOGEMENTS & RECHERCHE
  // ==========================================================================

  /**
   * Récupère la liste des logements (avec filtres optionnels).
   * @param {Object} [filters]
   * @returns {Promise<Array>}
   */
  async #fetchLogements(filters = {}) {
    try {
      await authenticate();
      const res = await this.#client.get(ENDPOINTS.LOGEMENTS, { params: filters });
      const body = extractApiResponse(res, 'Impossible de récupérer les logements');
      const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      return this.#sculpt(items, LogementCardSchema, 'Erreur de transformation des logements');
    } catch (err) {
      // Fallback local résilient
      const fallbackItems = getAllLogements();
      return this.#sculpt(fallbackItems, LogementCardSchema, 'Erreur fallback logements');
    }
  }

  /**
   * Récupère la fiche détaillée d'un logement par son identifiant.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async #fetchLogementDetail(id) {
    try {
      await authenticate();
      const res = await this.#client.get(ENDPOINTS.LOGEMENT_DETAIL(id));
      const body = extractApiResponse(res, `Impossible de charger le logement #${id}`);
      return this.#sculpt(body.data || body, LogementDetailSchema, 'Erreur de transformation du détail logement');
    } catch (err) {
      // Fallback local résilient
      const item = getMockLogementById(id) || getAllLogements()[0];
      return this.#sculpt(item, LogementDetailSchema, 'Erreur fallback détail logement');
    }
  }

  // ==========================================================================
  // 2. LOYERS & PAIEMENT TRANCHES
  // ==========================================================================

  /**
   * Récupère la liste des loyers du locataire connecté.
   * @returns {Promise<Array>}
   */
  async #fetchLoyers() {
    try {
      await authenticate();
      const res = await this.#client.get(ENDPOINTS.LOYERS);
      const body = extractApiResponse(res, 'Impossible de charger vos loyers');
      const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      return this.#sculpt(items, LoyerSchema, 'Erreur de transformation des loyers');
    } catch (err) {
      return this.#sculpt(RENTED_HOMES, LoyerSchema, 'Erreur fallback loyers');
    }
  }

  /**
   * Valide un paiement (total ou par tranche) via Orange Money.
   * @param {string} loyerId
   * @param {Object} payload { amount, trancheIndex, paymentMethod }
   * @returns {Promise<Object>}
   */
  async payLoyer(loyerId, payload = {}) {
    try {
      await authenticate();
      const res = await this.#client.post(ENDPOINTS.LOYER_PAY(loyerId), payload);
      const body = extractApiResponse(res, 'Échec de la validation du paiement');
      invalidateCache('loyers');
      return body.data || body;
    } catch (err) {
      // Enregistrement local résilient pour la démo (publie RENT_PAID -> cache vidé)
      recordRentPayment(loyerId, payload.amount || 0);
      return { success: true, transactionId: 'OM-SN-' + Date.now(), mode: 'offline_fallback' };
    }
  }

  // ==========================================================================
  // 3. VISITES
  // ==========================================================================

  /**
   * Récupère les visites programmées.
   * @returns {Promise<Array>}
   */
  async #fetchVisites() {
    try {
      await authenticate();
      const res = await this.#client.get(ENDPOINTS.VISITES);
      const body = extractApiResponse(res, 'Impossible de charger vos visites');
      const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      return this.#sculpt(items, VisiteSchema, 'Erreur de transformation des visites');
    } catch (err) {
      const rawVisites = getStoredRawVisites();
      return this.#sculpt(rawVisites, VisiteSchema, 'Erreur fallback visites');
    }
  }

  /**
   * Crée une nouvelle demande de visite.
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createVisite(payload) {
    try {
      await authenticate();
      const res = await this.#client.post(ENDPOINTS.VISITE_CREATE, payload);
      const body = extractApiResponse(res, 'Impossible de réserver ce créneau');
      invalidateCache('visites');
      return this.#sculpt(body.data || body, VisiteSchema, 'Erreur de transformation de la visite');
    } catch (err) {
      return { success: true, id: 'vis-' + Date.now(), ...payload };
    }
  }

  // ==========================================================================
  // 4. ESPACE BAILLEUR
  // ==========================================================================

  /**
   * Récupère les annonces du propriétaire connecté.
   * @returns {Promise<Array>}
   */
  async #fetchBailleurAnnonces() {
    try {
      await authenticate();
      const res = await this.#client.get(ENDPOINTS.BAILLEUR_ANNONCES);
      const body = extractApiResponse(res, 'Impossible de charger vos annonces');
      return body.data || body;
    } catch (err) {
      return getStoredBailleurAnnonces();
    }
  }

  /**
   * Récupère la liste des locataires du propriétaire.
   * @returns {Promise<Array>}
   */
  async #fetchBailleurLocataires() {
    try {
      await authenticate();
      const res = await this.#client.get(ENDPOINTS.BAILLEUR_LOCATAIRES);
      const body = extractApiResponse(res, 'Impossible de charger vos locataires');
      return body.data || body;
    } catch (err) {
      return getStoredLocataires();
    }
  }

  // ==========================================================================
  // LECTURES AVEC CACHE (utils/apis/cache.js)
  // Les pages appellent ces méthodes. Option { force: true } pour ignorer le cache
  // (ex. « tirer pour rafraîchir »).
  // ==========================================================================

  getLogements(filters = {}, options = {}) {
    return cached(`logements:${JSON.stringify(filters)}`, () => this.#fetchLogements(filters), { ttl: TTL.LOGEMENTS, ...options });
  }

  getLogementDetail(id, options = {}) {
    return cached(`logement:${id}`, () => this.#fetchLogementDetail(id), { ttl: TTL.LOGEMENT_DETAIL, ...options });
  }

  getLoyers(options = {}) {
    return cached('loyers', () => this.#fetchLoyers(), { ttl: TTL.PERSONAL, ...options });
  }

  getVisites(options = {}) {
    return cached('visites', () => this.#fetchVisites(), { ttl: TTL.PERSONAL, ...options });
  }

  getBailleurAnnonces(options = {}) {
    return cached('bailleur:annonces', () => this.#fetchBailleurAnnonces(), { ttl: TTL.PERSONAL, ...options });
  }

  getBailleurLocataires(options = {}) {
    return cached('bailleur:locataires', () => this.#fetchBailleurLocataires(), { ttl: TTL.PERSONAL, ...options });
  }

  resetSession() {
    this.#client.resetSession();
    invalidateCache();
  }
}

export const backendAPI = new BackendAPI();
export { BackendAPI };

// ============================================================================
// COHÉRENCE DU CACHE : chaque écriture publie son événement (store.js) ;
// on vide alors le cache concerné pour que la prochaine lecture soit à jour.
// ============================================================================
Bus.on(EVENTS.RENT_PAID, () => invalidateCache('loyers'));
Bus.on(EVENTS.VISITES_CHANGED, () => invalidateCache('visites'));
Bus.on(EVENTS.LOGEMENTS_CHANGED, () => {
  invalidateCache('logement');
  invalidateCache('bailleur:annonces');
});
Bus.on(EVENTS.LOCATAIRES_CHANGED, () => invalidateCache('bailleur:locataires'));
