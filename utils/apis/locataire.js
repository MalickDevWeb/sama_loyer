// ============================================================================
// SAMA LOYER — API SERVICE LOCATAIRE (CLIENT)
// Endpoints, mappers et méthodes d'accès dédiés aux locataires / candidats :
//   - Recherche et détails des logements
//   - Suivi et paiement des loyers par tranches Orange Money
//   - Réservation et consultation des visites
//   - Gestion résiliente des favoris
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import { sculpt } from '../json-sculpt/sculpt.js';
import { normalizeApiError } from '../errors/index.js';
import { extractApiResponse } from './response.js';
import {
  LogementCardSchema,
  LogementDetailSchema,
  LoyerSchema,
  VisiteSchema
} from '../mappers/index.js';

// Fallbacks locaux résilients en mode démo / hors ligne
import { getAllLogements, getLogementById as getMockLogementById } from '../mocks/logements.js';
import { getStoredRawVisites, recordRentPayment } from '../helpers/store.js';
import { RENTED_HOMES } from '../mocks/loyers.js';
import { cached, invalidateCache, LOCATAIRE_TTL } from './cache.js';
import { storage } from '../storage.js';
import { STORAGE_KEYS } from '../constants/index.js';
import { Bus } from '../event/index.js';
import { EVENTS } from '../event/keys.js';

// Ré-export de la configuration TTL centralisée dans utils/apis/cache.js
export { LOCATAIRE_TTL };

/**
 * Endpoints REST réservés à l'espace Locataire / Client
 */
export const LOCATAIRE_ENDPOINTS = {
  AUTH_MAXIT: '/api/v1/auth/maxit',
  LOGEMENTS: '/api/v1/logements',
  LOGEMENT_DETAIL: (id) => `/api/v1/logements/${id}`,
  LOYERS: '/api/v1/loyers',
  LOYER_PAY: (id) => `/api/v1/loyers/${id}/pay`,
  VISITES: '/api/v1/visites',
  VISITE_CREATE: '/api/v1/visites',
  FAVORITES: '/api/v1/favorites',
  FAVORITE_ADD: (id) => `/api/v1/favorites/${id}`,
  FAVORITE_REMOVE: (id) => `/api/v1/favorites/${id}`,
  FAVORITES_SYNC: '/api/v1/favorites/sync',
};

/**
 * Service API pour l'espace Locataire
 */
export class LocataireAPI {
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

  // --- LOGEMENTS & RECHERCHE ------------------------------------------------

  async #fetchLogements(filters = {}) {
    try {
      await authenticate();
      const res = await this.#client.get(LOCATAIRE_ENDPOINTS.LOGEMENTS, { params: filters });
      const body = extractApiResponse(res, 'Impossible de récupérer les logements');
      const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      return this.#sculpt(items, LogementCardSchema, 'Erreur de transformation des logements');
    } catch (err) {
      const fallbackItems = getAllLogements();
      return this.#sculpt(fallbackItems, LogementCardSchema, 'Erreur fallback logements');
    }
  }

  async #fetchLogementDetail(id) {
    try {
      await authenticate();
      const res = await this.#client.get(LOCATAIRE_ENDPOINTS.LOGEMENT_DETAIL(id));
      const body = extractApiResponse(res, `Impossible de charger le logement #${id}`);
      return this.#sculpt(body.data || body, LogementDetailSchema, 'Erreur de transformation du détail logement');
    } catch (err) {
      const item = getMockLogementById(id) || getAllLogements()[0];
      return this.#sculpt(item, LogementDetailSchema, 'Erreur fallback détail logement');
    }
  }

  getLogements(filters = {}, options = {}) {
    return cached(`logements:${JSON.stringify(filters)}`, () => this.#fetchLogements(filters), {
      ttl: LOCATAIRE_TTL.LOGEMENTS,
      ...options
    });
  }

  getLogementDetail(id, options = {}) {
    return cached(`logement:${id}`, () => this.#fetchLogementDetail(id), {
      ttl: LOCATAIRE_TTL.LOGEMENT_DETAIL,
      ...options
    });
  }

  getLogementById(id, options = {}) {
    return this.getLogementDetail(id, options);
  }

  // --- LOYERS & PAIEMENT TRANCHES -------------------------------------------

  async #fetchLoyers() {
    try {
      await authenticate();
      const res = await this.#client.get(LOCATAIRE_ENDPOINTS.LOYERS);
      const body = extractApiResponse(res, 'Impossible de charger vos loyers');
      const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      return this.#sculpt(items, LoyerSchema, 'Erreur de transformation des loyers');
    } catch (err) {
      return this.#sculpt(RENTED_HOMES, LoyerSchema, 'Erreur fallback loyers');
    }
  }

  getLoyers(options = {}) {
    return cached('loyers', () => this.#fetchLoyers(), {
      ttl: LOCATAIRE_TTL.PERSONAL,
      ...options
    });
  }

  async payLoyer(loyerId, payload = {}) {
    try {
      await authenticate();
      const res = await this.#client.post(LOCATAIRE_ENDPOINTS.LOYER_PAY(loyerId), payload);
      const body = extractApiResponse(res, 'Échec de la validation du paiement');
      invalidateCache('loyers');
      return body.data || body;
    } catch (err) {
      recordRentPayment(loyerId, payload.amount || 0);
      return { success: true, transactionId: 'OM-SN-' + Date.now(), mode: 'offline_fallback' };
    }
  }

  // --- VISITES --------------------------------------------------------------

  async #fetchVisites() {
    try {
      await authenticate();
      const res = await this.#client.get(LOCATAIRE_ENDPOINTS.VISITES);
      const body = extractApiResponse(res, 'Impossible de charger vos visites');
      const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      return this.#sculpt(items, VisiteSchema, 'Erreur de transformation des visites');
    } catch (err) {
      const rawVisites = getStoredRawVisites();
      return this.#sculpt(rawVisites, VisiteSchema, 'Erreur fallback visites');
    }
  }

  getVisites(options = {}) {
    return cached('visites', () => this.#fetchVisites(), {
      ttl: LOCATAIRE_TTL.PERSONAL,
      ...options
    });
  }

  async createVisite(payload) {
    try {
      await authenticate();
      const res = await this.#client.post(LOCATAIRE_ENDPOINTS.VISITE_CREATE, payload);
      const body = extractApiResponse(res, 'Impossible de réserver ce créneau');
      invalidateCache('visites');
      return this.#sculpt(body.data || body, VisiteSchema, 'Erreur de transformation de la visite');
    } catch (err) {
      return { success: true, id: 'vis-' + Date.now(), ...payload };
    }
  }

  // --- FAVORIS RÉSILIENTS ---------------------------------------------------

  async getFavorites(options = {}) {
    return cached(
      'favorites:all',
      async () => {
        try {
          const res = await this.#client.get(LOCATAIRE_ENDPOINTS.FAVORITES);
          const data = extractApiResponse(res, 'Impossible de récupérer les favoris');
          if (Array.isArray(data)) return data.map(String);
          if (data && Array.isArray(data.favorites)) return data.favorites.map(String);
          if (data && Array.isArray(data.items)) return data.items.map(String);
          if (data && Array.isArray(data.data)) return data.data.map(String);
          return [];
        } catch (error) {
          const local = storage.get(STORAGE_KEYS.FAVORITES, null);
          return Array.isArray(local) ? local.map(String) : [];
        }
      },
      { ttl: LOCATAIRE_TTL.PERSONAL, ...options }
    );
  }

  async addFavorite(logementId) {
    invalidateCache('favorites:all');
    try {
      const res = await this.#client.post(LOCATAIRE_ENDPOINTS.FAVORITE_ADD(logementId), { logementId });
      return extractApiResponse(res, 'Impossible d’ajouter le favori');
    } catch (error) {
      return { success: true, id: String(logementId), action: 'add', simulated: true };
    }
  }

  async removeFavorite(logementId) {
    invalidateCache('favorites:all');
    try {
      const res = await this.#client.delete(LOCATAIRE_ENDPOINTS.FAVORITE_REMOVE(logementId));
      return extractApiResponse(res, 'Impossible de retirer le favori');
    } catch (error) {
      return { success: true, id: String(logementId), action: 'remove', simulated: true };
    }
  }

  async syncFavoritesBatch(actions = []) {
    invalidateCache('favorites:all');
    try {
      const res = await this.#client.post(LOCATAIRE_ENDPOINTS.FAVORITES_SYNC, { actions });
      return extractApiResponse(res, 'Impossible de synchroniser les favoris');
    } catch (error) {
      return { success: true, syncedCount: actions.length, simulated: true };
    }
  }
}

export const locataireAPI = new LocataireAPI();

// Invalidation réactive du cache par événement
Bus.on(EVENTS.RENT_PAID, () => invalidateCache('loyers'));
Bus.on(EVENTS.VISITES_CHANGED, () => invalidateCache('visites'));
Bus.on(EVENTS.LOGEMENTS_CHANGED, () => invalidateCache('logement'));
