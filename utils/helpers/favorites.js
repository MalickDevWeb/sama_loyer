// ============================================================================
// FAVORITES HELPER (Local Storage Persistence)
// Source unique des favoris : liste d'IDs sous STORAGE_KEYS.FAVORITES.
// ============================================================================

import { storage } from '../storage';
import { STORAGE_KEYS } from '../constants/index';
import { DEFAULT_FAVORITE_IDS } from '../mocks/logements';

/**
 * Récupère la liste des IDs favoris depuis le stockage local.
 * Au premier lancement, renvoie les favoris de démo.
 * @returns {Array<string|number>}
 */
export function getFavoriteIds() {
  const saved = storage.get(STORAGE_KEYS.FAVORITES, null);

  if (saved === null) return DEFAULT_FAVORITE_IDS.slice();
  if (Array.isArray(saved)) return saved;

  // Ancien format { [id]: true } — on le convertit en liste
  if (typeof saved === 'object') {
    return Object.keys(saved).filter((id) => saved[id]);
  }
  return [];
}

/**
 * Vérifie si un ID fait partie des favoris.
 * @param {string|number} id
 * @returns {boolean}
 */
export function isFavorite(id) {
  const ids = getFavoriteIds();
  return ids.some((savedId) => String(savedId) === String(id));
}

/**
 * Ajoute ou retire un ID des favoris dans le stockage local.
 * @param {string|number} id - L'ID du logement
 * @param {boolean} isLiked - true pour ajouter, false pour retirer
 * @returns {Array<string|number>} Nouvelle liste d'IDs favoris
 */
export function toggleFavoriteId(id, isLiked) {
  const currentIds = getFavoriteIds();
  let nextIds;

  if (isLiked) {
    if (!currentIds.some((savedId) => String(savedId) === String(id))) {
      nextIds = [...currentIds, id];
    } else {
      nextIds = currentIds;
    }
  } else {
    nextIds = currentIds.filter((savedId) => String(savedId) !== String(id));
  }

  storage.set(STORAGE_KEYS.FAVORITES, nextIds);
  return nextIds;
}

/**
 * Renvoie les favoris sous forme de map { [id]: true }, pratique en WXML.
 * @returns {Object}
 */
export function getFavoritesMap() {
  return getFavoriteIds().reduce((map, id) => {
    map[id] = true;
    return map;
  }, {});
}

/**
 * Applique l'état 'like' (true/false) à une liste de packages
 * en se basant sur les IDs enregistrés dans le stockage local.
 * @param {Array<Object>} packages
 * @returns {Array<Object>}
 */
export function applyFavoritesToPackages(packages = []) {
  if (!Array.isArray(packages)) return [];
  const favoriteIds = getFavoriteIds().map(String);

  return packages.map((pkg) => ({
    ...pkg,
    like: favoriteIds.includes(String(pkg.id)),
  }));
}
