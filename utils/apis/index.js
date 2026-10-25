// ============================================================================
// SAMA LOYER BACKEND API SERVICE
// Point d'entrée centralisé pour l'API REST Sama Loyer.
//
// Architecture modulaire WeChat PMT :
//   1. Registre des Endpoints (utils/apis/endpoints/index.js)
//   2. Service Locataire (utils/apis/locataire.js)
//   3. Service Bailleur (utils/apis/bailleur.js)
//   4. Configuration Cache & TTL centralisée (utils/apis/cache.js)
//   5. Façade unifiée BackendAPI & délégation dynamique sans duplication
//   6. Déballage sécurisé des réponses (utils/apis/response.js)
// ============================================================================

import { httpClient } from './http.js';
import { invalidateCache } from './cache.js';
import { locataireAPI, LocataireAPI } from './locataire.js';
import { bailleurAPI, BailleurAPI } from './bailleur.js';

// Re-exports des endpoints centralisés
export {
  LOCATAIRE_ENDPOINTS,
  BAILLEUR_ENDPOINTS,
  COMMON_ENDPOINTS,
  ENDPOINTS
} from './endpoints/index.js';

// Re-exports modulaires par domaine et cache centralisé
export { LocataireAPI, locataireAPI };
export { BailleurAPI, bailleurAPI };
export { TTL, LOCATAIRE_TTL, BAILLEUR_TTL, cached, invalidateCache, setCache } from './cache.js';
export { extractApiResponse, unwrapApiResponse } from './response.js';

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
