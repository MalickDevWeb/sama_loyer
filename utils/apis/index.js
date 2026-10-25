// ============================================================================
// SAMA LOYER BACKEND API SERVICE
// Point d'entrée centralisé pour l'API REST Sama Loyer.
//
// Architecture modulaire (Option B - Domain-Driven Design) :
//   1. core/       : Infrastructure technique (http, auth, cache, response, native)
//   2. endpoints/  : Registre centralisé des contrats de routage
//   3. locataire/  : Module métier Locataire (endpoints, service)
//   4. bailleur/   : Module métier Bailleur (endpoints, service)
//   5. Façade unifiée BackendAPI avec composition dynamique
// ============================================================================

import { httpClient, invalidateCache } from './core/index.js';
import { locataireAPI, LocataireAPI } from './locataire/index.js';
import { bailleurAPI, BailleurAPI } from './bailleur/index.js';

// Re-exports des modules d'infrastructure technique (core)
export {
  httpClient,
  HttpClient,
  authenticate,
  setAccessToken,
  clearAccessToken,
  cached,
  setCache,
  invalidateCache,
  TTL,
  LOCATAIRE_TTL,
  BAILLEUR_TTL,
  extractApiResponse,
  unwrapApiResponse,
  nativeService,
  invokePlugin,
  withRetry,
  isDevtools
} from './core/index.js';

// Re-exports des endpoints centralisés
export {
  LOCATAIRE_ENDPOINTS,
  BAILLEUR_ENDPOINTS,
  COMMON_ENDPOINTS,
  ENDPOINTS
} from './endpoints/index.js';

// Re-exports des services de domaines
export { LocataireAPI, locataireAPI } from './locataire/index.js';
export { BailleurAPI, bailleurAPI } from './bailleur/index.js';

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

  /** @type {import('./core/http').HttpClient} */
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
