// ============================================================================
// SAMA LOYER — API SERVICE BAILLEUR (PROPRIÉTAIRE)
// Endpoints et méthodes d'accès dédiés aux propriétaires bailleurs :
//   - Gestion des annonces immobilières
//   - Suivi des locataires et contrats
//   - Recherche de candidats locataires certifiés
//   - Configuration des règles de conformité (pièces exigées)
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import { extractApiResponse } from './response.js';
import { cached, invalidateCache } from './cache.js';
import { Bus } from '../event/index.js';
import { EVENTS } from '../event/keys.js';
import {
  getStoredBailleurAnnonces,
  getStoredLocataires,
  getComplianceConfig,
  setComplianceConfig,
  searchTenantCandidates
} from '../helpers/store.js';

// Durée de vie en cache (ms)
export const BAILLEUR_TTL = {
  PERSONAL: 60 * 1000,
  SETTINGS: 5 * 60 * 1000
};

/**
 * Endpoints REST réservés à l'espace Bailleur / Propriétaire
 */
export const BAILLEUR_ENDPOINTS = {
  ANNONCES: '/api/v1/bailleur/annonces',
  BAILLEUR_ANNONCES: '/api/v1/bailleur/annonces', // alias rétrocompatible
  LOCATAIRES: '/api/v1/bailleur/locataires',
  BAILLEUR_LOCATAIRES: '/api/v1/bailleur/locataires', // alias rétrocompatible
  TENANT_SEARCH: '/api/v1/bailleur/tenant-search',
  BAILLEUR_TENANT_SEARCH: '/api/v1/bailleur/tenant-search', // alias rétrocompatible
  SETTINGS_COMPLIANCE: '/api/v1/settings/compliance',
  COMPLIANCE: '/api/v1/settings/compliance' // alias court
};

/**
 * Service API pour l'espace Bailleur
 */
export class BailleurAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  // --- ANNONCES DU PROPRIÉTAIRE ---------------------------------------------

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

  // --- LOCATAIRES DU PROPRIÉTAIRE -------------------------------------------

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

  // --- RECHERCHE DE CANDIDATS LOCATAIRES ------------------------------------

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

  // --- CONFORMITÉ & RÈGLEMENTATION -------------------------------------------

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
}

export const bailleurAPI = new BailleurAPI();

// Invalidation réactive du cache par événement
Bus.on(EVENTS.LOGEMENTS_CHANGED, () => invalidateCache('bailleur:annonces'));
Bus.on(EVENTS.LOCATAIRES_CHANGED, () => invalidateCache('bailleur:locataires'));
