// ============================================================================
// CACHE DES APPELS API (en mémoire, dans l'EventBus)
// - Un résultat est réutilisé pendant sa durée de vie (ttl) : revenir sur une
//   page ne refait pas l'appel.
// - Deux demandes identiques en même temps ne font qu'un seul appel réseau.
// - Après une écriture (paiement, nouvelle visite…), invalidateCache() force
//   le prochain chargement.
// Le cache vit le temps de la session (il disparaît quand l'appli est fermée).
// ============================================================================

import { Bus } from '../../event/index.js';

const PREFIX = 'cache.';

/**
 * Durées de vie en cache centralisées (en millisecondes)
 */
export const TTL = {
  DEFAULT: 5 * 60 * 1000,          // 5 minutes (défaut)
  PERSONAL: 60 * 1000,             // 1 minute (données personnelles : loyers, visites, favoris, locataires)
  LOGEMENTS: 5 * 60 * 1000,        // 5 minutes (catalogue logements)
  LOGEMENT_DETAIL: 10 * 60 * 1000, // 10 minutes (fiche détaillée d'un bien)
  SETTINGS: 5 * 60 * 1000          // 5 minutes (règles de conformité / configuration)
};

/**
 * Durées de vie spécifiques à l'espace Locataire
 */
export const LOCATAIRE_TTL = {
  LOGEMENTS: TTL.LOGEMENTS,
  LOGEMENT_DETAIL: TTL.LOGEMENT_DETAIL,
  PERSONAL: TTL.PERSONAL
};

/**
 * Durées de vie spécifiques à l'espace Bailleur
 */
export const BAILLEUR_TTL = {
  PERSONAL: TTL.PERSONAL,
  SETTINGS: TTL.SETTINGS
};

const inFlight = new Map(); // clé -> promesse en cours
const keys = new Set(); // clés présentes (pour invalider par préfixe)

/**
 * Renvoie la valeur en cache si elle est encore fraîche, sinon appelle fetcher().
 * @param {string} key - Clé unique de la donnée (ex. 'logement:icotaf-01')
 * @param {Function} fetcher - Fonction async qui fait l'appel API
 * @param {Object} [options]
 * @param {number} [options.ttl] - Durée de vie en ms (5 min par défaut)
 * @param {boolean} [options.force] - true pour ignorer le cache (tirer pour rafraîchir)
 * @returns {Promise<*>}
 */
export function cached(key, fetcher, options = {}) {
  const { ttl = TTL.DEFAULT, force = false } = options;
  const entry = Bus.getState(PREFIX + key, null);
  if (!force && entry && Date.now() - entry.at < ttl) {
    return Promise.resolve(entry.value);
  }
  if (inFlight.has(key)) return inFlight.get(key);

  const request = Promise.resolve()
    .then(fetcher)
    .then((value) => {
      setCache(key, value);
      return value;
    })
    .finally(() => inFlight.delete(key));
  inFlight.set(key, request);
  return request;
}

/**
 * Met une valeur en cache sans appel (ex. donnée reçue d'une autre page).
 * @param {string} key
 * @param {*} value
 */
export function setCache(key, value) {
  keys.add(key);
  Bus.setState(PREFIX + key, { value, at: Date.now() }, true);
}

/**
 * Supprime du cache toutes les clés qui commencent par prefix.
 * @param {string} prefix - ex. 'loyers' ou 'logement:' ; vide = tout le cache
 */
export function invalidateCache(prefix = '') {
  keys.forEach((key) => {
    if (key.startsWith(prefix)) {
      Bus.removeState(PREFIX + key);
      keys.delete(key);
    }
  });
}

