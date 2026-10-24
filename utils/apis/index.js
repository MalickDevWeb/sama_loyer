// ============================================================================
// SAMA LOYER BACKEND API SERVICE
// Point d'entrée centralisé pour l'API REST Sama Loyer.
//
// Architecture modulaire WeChat PMT :
//   1. Endpoints & Services Locataire (utils/apis/locataire.js)
//   2. Endpoints & Services Bailleur (utils/apis/bailleur.js)
//   3. Façade unifiée BackendAPI & rétrocompatibilité totale
//   4. Déballage sécurisé des réponses (utils/apis/response.js)
// ============================================================================

import { httpClient } from './http.js';
import { invalidateCache } from './cache.js';
import { Bus } from '../event/index.js';
import { EVENTS } from '../event/keys.js';

import {
  LOCATAIRE_ENDPOINTS,
  LocataireAPI,
  locataireAPI
} from './locataire.js';

import {
  BAILLEUR_ENDPOINTS,
  BailleurAPI,
  bailleurAPI
} from './bailleur.js';

// Re-exports modulaires
export { LOCATAIRE_ENDPOINTS, LocataireAPI, locataireAPI };
export { BAILLEUR_ENDPOINTS, BailleurAPI, bailleurAPI };
export { extractApiResponse, unwrapApiResponse } from './response.js';

/**
 * Registre global des Endpoints REST combinant Locataire et Bailleur.
 * Garantit 100% de rétrocompatibilité avec les imports existants.
 */
export const ENDPOINTS = {
  ...LOCATAIRE_ENDPOINTS,
  ...BAILLEUR_ENDPOINTS
};

/**
 * Service central unifié Sama Loyer.
 * Offre un accès direct à toutes les opérations, ainsi qu'aux sous-domaines typés
 * `backendAPI.locataire` et `backendAPI.bailleur`.
 */
class BackendAPI {
  /** @type {LocataireAPI} */
  locataire = locataireAPI;

  /** @type {BailleurAPI} */
  bailleur = bailleurAPI;

  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  // ==========================================================================
  // 1. ESPACE LOCATAIRE / CANDIDAT (Délégation transparente)
  // ==========================================================================

  getLogements(filters = {}, options = {}) {
    return this.locataire.getLogements(filters, options);
  }

  getLogementDetail(id, options = {}) {
    return this.locataire.getLogementDetail(id, options);
  }

  getLogementById(id, options = {}) {
    return this.locataire.getLogementById(id, options);
  }

  getLoyers(options = {}) {
    return this.locataire.getLoyers(options);
  }

  payLoyer(loyerId, payload = {}) {
    return this.locataire.payLoyer(loyerId, payload);
  }

  getVisites(options = {}) {
    return this.locataire.getVisites(options);
  }

  createVisite(payload) {
    return this.locataire.createVisite(payload);
  }

  getFavorites(options = {}) {
    return this.locataire.getFavorites(options);
  }

  addFavorite(logementId) {
    return this.locataire.addFavorite(logementId);
  }

  removeFavorite(logementId) {
    return this.locataire.removeFavorite(logementId);
  }

  syncFavoritesBatch(actions = []) {
    return this.locataire.syncFavoritesBatch(actions);
  }

  // ==========================================================================
  // 2. ESPACE BAILLEUR / PROPRIÉTAIRE (Délégation transparente)
  // ==========================================================================

  getBailleurAnnonces(options = {}) {
    return this.bailleur.getBailleurAnnonces(options);
  }

  getBailleurLocataires(options = {}) {
    return this.bailleur.getBailleurLocataires(options);
  }

  searchLocataires(q) {
    return this.bailleur.searchLocataires(q);
  }

  getComplianceConfig(options = {}) {
    return this.bailleur.getComplianceConfig(options);
  }

  // ==========================================================================
  // 3. GESTION DE SESSION & CACHE
  // ==========================================================================

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
