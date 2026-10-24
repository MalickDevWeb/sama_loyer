// ============================================================================
// SAMA LOYER BACKEND API SERVICE
// Point d'entrée centralisé pour l'API REST Sama Loyer.
//
// Architecture modulaire WeChat PMT :
//   1. Endpoints & Services Locataire (utils/apis/locataire.js)
//   2. Endpoints & Services Bailleur (utils/apis/bailleur.js)
//   3. Configuration Cache & TTL centralisée (utils/apis/cache.js)
//   4. Façade unifiée BackendAPI & délégation dynamique sans duplication
//   5. Déballage sécurisé des réponses (utils/apis/response.js)
// ============================================================================

import { httpClient } from './http.js';
import { invalidateCache } from './cache.js';

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

// Re-exports modulaires par domaine et cache centralisé
export { LOCATAIRE_ENDPOINTS, LocataireAPI, locataireAPI };
export { BAILLEUR_ENDPOINTS, BailleurAPI, bailleurAPI };
export { TTL, LOCATAIRE_TTL, BAILLEUR_TTL, cached, invalidateCache, setCache } from './cache.js';
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
 * Offre un accès distinct aux sous-domaines typés:
 *   - backendAPI.locataire (LocataireAPI)
 *   - backendAPI.bailleur  (BailleurAPI)
 *
 * Les méthodes des deux domaines sont automatiquement et dynamiquement
 * composées sur BackendAPI.prototype pour garantir 100% de rétrocompatibilité
 * sans aucune duplication de code.
 */
class BackendAPI {
  /** @type {LocataireAPI} */
  locataire = locataireAPI;

  /** @type {BailleurAPI} */
  bailleur = bailleurAPI;

  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  resetSession() {
    this.#client.resetSession();
    invalidateCache();
  }
}

// Composition dynamique des méthodes de domaines sur BackendAPI.prototype
function attachDomainMethods(targetClass, sourceInstance) {
  const proto = Object.getPrototypeOf(sourceInstance);
  for (const name of Object.getOwnPropertyNames(proto)) {
    if (name === 'constructor' || name.startsWith('#')) continue;
    const desc = Object.getOwnPropertyDescriptor(proto, name);
    if (desc && typeof desc.value === 'function') {
      targetClass.prototype[name] = function(...args) {
        return sourceInstance[name](...args);
      };
    }
  }
}

attachDomainMethods(BackendAPI, locataireAPI);
attachDomainMethods(BackendAPI, bailleurAPI);

export const backendAPI = new BackendAPI();
export { BackendAPI };
