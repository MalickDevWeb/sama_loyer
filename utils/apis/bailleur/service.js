// ============================================================================
// SAMA LOYER — API SERVICE BAILLEUR (PROPRIÉTAIRE)
// Service complet pour l'ensemble des routes de l'espace gestionnaire bailleur :
//   - Compte bailleur, abonnement, KYC et Dashboard
//   - Gestion des annonces immobilières (CRUD, confirmation, masquage, boost, créneaux)
//   - Traitement des demandes de visites (acceptation / refus avec notification)
//   - Gestion des locataires, contrats, encaissement en espèces et caution
//   - Configuration des règles de conformité (pièces exigées)
// ============================================================================

import { httpClient } from '../core/http.js';
import { authenticate } from '../core/auth.js';
import { extractApiResponse } from '../core/response.js';
import { cached, invalidateCache, BAILLEUR_TTL } from '../core/cache.js';
import { Bus } from '../../event/index.js';
import { EVENTS } from '../../event/keys.js';
import { BAILLEUR_ENDPOINTS } from './endpoints.js';

// Fallbacks locaux résilients en mode démo / hors ligne
import {
  getStoredBailleurAnnonces,
  confirmBailleurAnnonce,
  addStoredLogement,
  updateStoredLogement,
  getStoredLocataires,
  addStoredLocataire,
  confirmLocataireCashPayment,
  searchTenantCandidates,
  getStoredRawVisites,
  updateStoredVisiteStatus,
  getBailleurAccount,
  activateBailleurAccount,
  renewBailleurSubscription,
  getBailleurPayments,
  addBailleurBoost,
  getComplianceConfig,
  setComplianceConfig,
  getBailleurKyc,
  submitBailleurKyc
} from '../../helpers/store.js';

// Ré-exports centralisés
export { BAILLEUR_TTL };
export { BAILLEUR_ENDPOINTS };

/**
 * Service API pour l'espace Bailleur
 */
export class BailleurAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  // ==========================================================================
  // 1. COMPTE, ABONNEMENT, KYC & DASHBOARD
  // ==========================================================================

  /**
   * Récupère le tableau de bord avec les KPI clés du bailleur
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getDashboard(options = {}) {
    return cached('bailleur:dashboard', async () => {
      try {
        await authenticate();
        const res = await this.#client.get(BAILLEUR_ENDPOINTS.DASHBOARD);
        const body = extractApiResponse(res, 'Impossible de charger le tableau de bord');
        return body.data || body;
      } catch (err) {
        // Calcul du tableau de bord depuis les données locales
        const annonces = getStoredBailleurAnnonces();
        const locataires = getStoredLocataires();
        const visites = getStoredRawVisites();
        const loyerTotal = locataires.reduce((acc, l) => acc + (l.rent || 0), 0);

        return {
          annoncesCount: annonces.length,
          locatairesCount: locataires.length,
          loyerTotal,
          visitesEnAttente: visites.filter((v) => v.status === 'en_attente').length,
          tauxOccupation: annonces.length > 0 ? Math.round((locataires.length / annonces.length) * 100) : 100
        };
      }
    }, { ttl: BAILLEUR_TTL.PERSONAL, ...options });
  }

  /**
   * Récupère les informations du compte bailleur et statut d'abonnement
   * @param {Object} [options]
   * @returns {Promise<Object>}
   */
  async getCompte(options = {}) {
    return cached('bailleur:compte', async () => {
      try {
        await authenticate();
        const res = await this.#client.get(BAILLEUR_ENDPOINTS.COMPTE);
        const body = extractApiResponse(res, 'Impossible de charger votre compte bailleur');
        return body.data || body;
      } catch (err) {
        return getBailleurAccount();
      }
    }, { ttl: BAILLEUR_TTL.PERSONAL, ...options });
  }

  /**
   * Active le compte bailleur avec un plan d'abonnement
   * @param {string} plan - 'trial' | 'mensuel' | 'annuel'
   * @returns {Promise<Object>}
   */
  async activateCompte(plan = 'mensuel') {
    invalidateCache('bailleur:compte');
    invalidateCache('bailleur:dashboard');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.COMPTE_ACTIVATION, { plan });
      const body = extractApiResponse(res, 'Échec de l’activation du compte');
      return body.data || body;
    } catch (err) {
      return activateBailleurAccount(plan);
    }
  }

  /**
   * Renouvelle l'abonnement bailleur via Orange Money
   * @returns {Promise<Object>}
   */
  async renewAbonnement() {
    invalidateCache('bailleur:compte');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.ABONNEMENT_RENOUVELLEMENT);
      const body = extractApiResponse(res, 'Échec du renouvellement');
      return body.data || body;
    } catch (err) {
      return renewBailleurSubscription();
    }
  }

  /**
   * Récupère l'historique des paiements et reversements du bailleur
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async getPaiements(options = {}) {
    return cached('bailleur:paiements', async () => {
      try {
        await authenticate();
        const res = await this.#client.get(BAILLEUR_ENDPOINTS.PAIEMENTS);
        const body = extractApiResponse(res, 'Impossible de charger l’historique des paiements');
        return Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      } catch (err) {
        return getBailleurPayments();
      }
    }, { ttl: BAILLEUR_TTL.PERSONAL, ...options });
  }

  /**
   * Récupère le statut de vérification KYC du propriétaire
   * @returns {Promise<Object>}
   */
  async getKyc() {
    try {
      await authenticate();
      const res = await this.#client.get(BAILLEUR_ENDPOINTS.VERIFICATION);
      const body = extractApiResponse(res, 'Impossible de charger le dossier KYC');
      return body.data || body;
    } catch (err) {
      return getBailleurKyc();
    }
  }

  /**
   * Soumet les pièces justificatives du bailleur pour validation
   * @param {Object} [payload]
   * @returns {Promise<Object>}
   */
  async submitKyc(payload = {}) {
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.VERIFICATION, payload);
      const body = extractApiResponse(res, 'Échec de la soumission du dossier');
      return body.data || body;
    } catch (err) {
      return submitBailleurKyc();
    }
  }

  // ==========================================================================
  // 2. GESTION DES ANNONCES IMMOBILIÈRES
  // ==========================================================================

  async #fetchBailleurAnnonces() {
    try {
      await authenticate();
      const res = await this.#client.get(BAILLEUR_ENDPOINTS.ANNONCES);
      const body = extractApiResponse(res, 'Impossible de charger vos annonces');
      return body.data || body;
    } catch (err) {
      return getStoredBailleurAnnonces();
    }
  }

  getAnnonces(options = {}) {
    return cached('bailleur:annonces', () => this.#fetchBailleurAnnonces(), {
      ttl: BAILLEUR_TTL.PERSONAL,
      ...options
    });
  }

  getBailleurAnnonces(options = {}) {
    return this.getAnnonces(options);
  }

  /**
   * Récupère le détail d'une annonce bailleur
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getAnnonceDetail(id) {
    return cached(`bailleur:annonce:${id}`, async () => {
      try {
        await authenticate();
        const res = await this.#client.get(BAILLEUR_ENDPOINTS.ANNONCE_DETAIL(id));
        const body = extractApiResponse(res, `Impossible de charger l'annonce #${id}`);
        return body.data || body;
      } catch (err) {
        const annonces = getStoredBailleurAnnonces();
        return annonces.find((a) => String(a.id) === String(id)) || annonces[0] || null;
      }
    }, { ttl: BAILLEUR_TTL.PERSONAL });
  }

  /**
   * Crée une nouvelle annonce immobilière
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createAnnonce(payload) {
    invalidateCache('bailleur:annonces');
    invalidateCache('logements');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.ANNONCES, payload);
      const body = extractApiResponse(res, 'Impossible de publier cette annonce');
      return body.data || body;
    } catch (err) {
      return addStoredLogement(payload);
    }
  }

  /**
   * Met à jour une annonce immobilière existante
   * @param {string} id
   * @param {Object} patch
   * @returns {Promise<Object>}
   */
  async updateAnnonce(id, patch) {
    invalidateCache('bailleur:annonces');
    invalidateCache(`bailleur:annonce:${id}`);
    invalidateCache(`logement:${id}`);
    try {
      await authenticate();
      const res = await this.#client.put(BAILLEUR_ENDPOINTS.ANNONCE_DETAIL(id), patch);
      const body = extractApiResponse(res, 'Impossible de modifier l’annonce');
      return body.data || body;
    } catch (err) {
      return updateStoredLogement(id, patch);
    }
  }

  /**
   * Confirme la disponibilité d'une annonce (re-validation périodique)
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async confirmAvailability(id) {
    invalidateCache('bailleur:annonces');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.ANNONCE_CONFIRM_AVAILABILITY(id));
      const body = extractApiResponse(res, 'Confirmation impossible');
      return body.data || body;
    } catch (err) {
      confirmBailleurAnnonce(id);
      return { success: true, id, confirmedAt: Date.now() };
    }
  }

  /**
   * Masque temporairement une annonce de la recherche publique
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async hideAnnonce(id) {
    invalidateCache('bailleur:annonces');
    invalidateCache('logements');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.ANNONCE_HIDE(id));
      const body = extractApiResponse(res, 'Impossible de masquer l’annonce');
      return body.data || body;
    } catch (err) {
      return updateStoredLogement(id, { hidden: true });
    }
  }

  /**
   * Réactive une annonce masquée
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unhideAnnonce(id) {
    invalidateCache('bailleur:annonces');
    invalidateCache('logements');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.ANNONCE_UNHIDE(id));
      const body = extractApiResponse(res, 'Impossible de réactiver l’annonce');
      return body.data || body;
    } catch (err) {
      return updateStoredLogement(id, { hidden: false });
    }
  }

  /**
   * Applique une option de mise en avant (Boost) sur une annonce
   * @param {string} id
   * @param {Object} option - { type, durationDays }
   * @returns {Promise<Object>}
   */
  async boostAnnonce(id, option = {}) {
    invalidateCache('bailleur:annonces');
    invalidateCache('logements');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.ANNONCE_BOOSTS(id), option);
      const body = extractApiResponse(res, 'Échec de l’activation du boost');
      return body.data || body;
    } catch (err) {
      return addBailleurBoost({ logementId: id, ...option });
    }
  }

  /**
   * Met à jour les créneaux horaires de visites d'un logement
   * @param {string} id
   * @param {Array<string>} horaires
   * @returns {Promise<Object>}
   */
  async updateHorairesVisite(id, horaires = []) {
    invalidateCache('bailleur:annonces');
    try {
      await authenticate();
      const res = await this.#client.put(BAILLEUR_ENDPOINTS.ANNONCE_HORAIRES(id), { horaires });
      const body = extractApiResponse(res, 'Impossible de mettre à jour les horaires');
      return body.data || body;
    } catch (err) {
      return updateStoredLogement(id, { horairesVisites: horaires });
    }
  }

  // ==========================================================================
  // 3. GESTION DES VISITES REÇUES
  // ==========================================================================

  /**
   * Récupère la liste des demandes de visites reçues par le bailleur
   * @param {Object} [options]
   * @returns {Promise<Array>}
   */
  async getVisites(options = {}) {
    return cached('bailleur:visites', async () => {
      try {
        await authenticate();
        const res = await this.#client.get(BAILLEUR_ENDPOINTS.VISITES);
        const body = extractApiResponse(res, 'Impossible de charger les demandes de visites');
        return Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
      } catch (err) {
        return getStoredRawVisites();
      }
    }, { ttl: BAILLEUR_TTL.PERSONAL, ...options });
  }

  /**
   * Accepte une demande de visite et notifie le candidat
   * @param {string} id
   * @param {string} [note]
   * @returns {Promise<Object>}
   */
  async acceptVisite(id, note = '') {
    invalidateCache('bailleur:visites');
    invalidateCache('visites');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.VISITE_ACCEPT(id), { note });
      const body = extractApiResponse(res, 'Impossible d’accepter la visite');
      return body.data || body;
    } catch (err) {
      return updateStoredVisiteStatus(id, 'confirmee', note);
    }
  }

  /**
   * Refuse ou propose un report pour une visite
   * @param {string} id
   * @param {string} [reason]
   * @returns {Promise<Object>}
   */
  async rejectVisite(id, reason = '') {
    invalidateCache('bailleur:visites');
    invalidateCache('visites');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.VISITE_REJECT(id), { reason });
      const body = extractApiResponse(res, 'Impossible de refuser la visite');
      return body.data || body;
    } catch (err) {
      return updateStoredVisiteStatus(id, 'refusee', reason);
    }
  }

  // ==========================================================================
  // 4. LOCATAIRES, CANDIDATS & CONTRATS
  // ==========================================================================

  async #fetchBailleurLocataires() {
    try {
      await authenticate();
      const res = await this.#client.get(BAILLEUR_ENDPOINTS.LOCATAIRES);
      const body = extractApiResponse(res, 'Impossible de charger vos locataires');
      return body.data || body;
    } catch (err) {
      return getStoredLocataires();
    }
  }

  getLocataires(options = {}) {
    return cached('bailleur:locataires', () => this.#fetchBailleurLocataires(), {
      ttl: BAILLEUR_TTL.PERSONAL,
      ...options
    });
  }

  getBailleurLocataires(options = {}) {
    return this.getLocataires(options);
  }

  /**
   * Ajoute un nouveau locataire et associe son contrat
   * @param {Object} payload
   * @returns {Promise<Object>}
   */
  async createLocataire(payload) {
    invalidateCache('bailleur:locataires');
    invalidateCache('bailleur:dashboard');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.LOCATAIRES, payload);
      const body = extractApiResponse(res, 'Impossible d’ajouter ce locataire');
      return body.data || body;
    } catch (err) {
      return addStoredLocataire(payload);
    }
  }

  /**
   * Recherche un candidat locataire par nom ou téléphone
   * @param {string} q
   * @returns {Promise<Array>}
   */
  async searchLocataires(q) {
    try {
      await authenticate();
      const res = await this.#client.get(BAILLEUR_ENDPOINTS.TENANT_SEARCH, { query: { q } });
      const body = extractApiResponse(res, 'Recherche impossible');
      return Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
    } catch (err) {
      return searchTenantCandidates(q);
    }
  }

  /**
   * Enregistre un paiement de loyer perçu en espèces (hors Orange Money)
   * Génère immédiatement la quittance certifiée
   * @param {string} loyerId
   * @param {Object} [payload]
   * @returns {Promise<Object>}
   */
  async recordCashPayment(loyerId, payload = {}) {
    invalidateCache('bailleur:locataires');
    invalidateCache('loyers');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.CASH_PAYMENT(loyerId), payload);
      const body = extractApiResponse(res, 'Impossible d’enregistrer le paiement en espèces');
      return body.data || body;
    } catch (err) {
      return confirmLocataireCashPayment(loyerId);
    }
  }

  /**
   * Émet un préavis légal de fin de bail pour un contrat
   * @param {string} contratId
   * @param {Object} payload - { reason, effectiveDate }
   * @returns {Promise<Object>}
   */
  async sendContractNotice(contratId, payload = {}) {
    invalidateCache('bailleur:locataires');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.CONTRAT_NOTICE(contratId), payload);
      const body = extractApiResponse(res, 'Impossible d’émettre le préavis');
      return body.data || body;
    } catch (err) {
      return { success: true, contratId, noticeSent: true, effectiveDate: payload.effectiveDate || Date.now() };
    }
  }

  /**
   * Enregistre la restitution de dépôt de garantie / caution
   * @param {string} contratId
   * @param {Object} payload - { refundAmount, deductions }
   * @returns {Promise<Object>}
   */
  async refundDeposit(contratId, payload = {}) {
    invalidateCache('bailleur:locataires');
    try {
      await authenticate();
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.DEPOSIT_REFUND(contratId), payload);
      const body = extractApiResponse(res, 'Échec de la restitution de caution');
      return body.data || body;
    } catch (err) {
      return { success: true, contratId, refunded: true, ...payload };
    }
  }

  // ==========================================================================
  // 5. CONFORMITÉ & RÈGLEMENTATION
  // ==========================================================================

  async #fetchComplianceConfig() {
    try {
      await authenticate();
      const res = await this.#client.get(BAILLEUR_ENDPOINTS.SETTINGS_COMPLIANCE);
      const body = extractApiResponse(res, 'Impossible de charger les pièces exigées');
      const config = body.data || body;
      setComplianceConfig(config);
      return getComplianceConfig();
    } catch (err) {
      return getComplianceConfig();
    }
  }

  getComplianceConfig(options = {}) {
    return cached('settings:compliance', () => this.#fetchComplianceConfig(), {
      ttl: BAILLEUR_TTL.SETTINGS,
      ...options
    });
  }

  // --- COLOCATION & CONFIGURATION CHAMBRES ------------------------------------

  async updateColocConfig(logementId, config = {}) {
    invalidateCache(`logement:${logementId}`);
    try {
      const res = await this.#client.post(BAILLEUR_ENDPOINTS.COLOC_CONFIG(logementId), config);
      return extractApiResponse(res, 'Impossible de modifier la configuration colocation');
    } catch (error) {
      return { success: true, logementId, config, simulated: true };
    }
  }

  async getColocOccupants(logementId) {
    try {
      const res = await this.#client.get(BAILLEUR_ENDPOINTS.COLOC_OCCUPANTS(logementId));
      return extractApiResponse(res, 'Impossible de charger les occupants');
    } catch (error) {
      return { logementId, groups: [], occupants: [] };
    }
  }
}

export const bailleurAPI = new BailleurAPI();

// Invalidation réactive du cache par événement
Bus.on(EVENTS.LOGEMENTS_CHANGED, () => {
  invalidateCache('bailleur:annonces');
  invalidateCache('bailleur:dashboard');
});
Bus.on(EVENTS.LOCATAIRES_CHANGED, () => {
  invalidateCache('bailleur:locataires');
  invalidateCache('bailleur:dashboard');
});
