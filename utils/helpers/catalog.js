import { backendAPI } from '../apis/index.js';
import { applyFavoritesToPackages } from './favorites.js';
import {
  getDestinations,
  getRecommendedDestinations,
  getFilters,
  setDestinations,
  setRecommendedDestinations,
  setFilters,
  updateDestinationLike as updateStoredDestinationLike,
} from '../stores/catalog-store.js';

const DEFAULT_FILTERS = [
  { id: 'all', label: 'Tous' },
  { id: 'dakar', label: 'Dakar' },
  { id: 'saly', label: 'Saly' },
  { id: 'sine-saloum', label: 'Sine Saloum' },
  { id: 'saint-louis', label: 'Saint Louis' },
  { id: 'lompoul', label: 'Lompoul' },
  { id: 'experience-locale', label: 'Experience Locale' },
];

export async function loadDestinations({ fallback = [], onError } = {}) {
  try {
    return setDestinations(await backendAPI.getPackages());
  } catch (error) {
    console.warn('[Catalog] Packages API failed, using fallback destinations:', error);
    if (typeof onError === 'function') onError(error);
    return setDestinations(fallback);
  }
}

export async function loadPackages() {
  return setDestinations(await backendAPI.getPackages());
}

export async function loadPackage(id) {
  if (!isValidPackageId(id)) throw new Error('Identifiant du package invalide');
  return applyFavoritesToPackages([await backendAPI.getPackage(id)])[0];
}

export async function loadFeaturedDestinations() {
  return applyFavoritesToPackages(await backendAPI.getFeaturedPackages());
}

export function isValidPackageId(value) {
  if (typeof value === 'string' && !/^\d+$/.test(value)) return false;
  const id = Number(value);
  return value !== '' && value !== null && value !== undefined && Number.isSafeInteger(id) && id > 0;
}

export async function loadRecommendedDestinations() {
  try {
    return setRecommendedDestinations(await backendAPI.getRecommendedPackages());
  } catch (error) {
    console.warn('[Catalog] Recommended packages API failed:', error);
    throw error;
  }
}

export async function loadCategoryFilters({ force = false } = {}) {
  const cachedFilters = getFilters();
  if (!force && cachedFilters.length > 0) return cachedFilters;

  try {
    const categories = await backendAPI.getCategories();
    const filters = categories.length ? [{ id: 'all', label: 'Tous' }, ...categories] : DEFAULT_FILTERS;
    return setFilters(filters);
  } catch (error) {
    console.warn('[Catalog] Categories API failed, using default filters:', error);
    return setFilters(DEFAULT_FILTERS);
  }
}

export function getCatalogDestinations() {
  return getDestinations();
}

export function getCatalogRecommendedDestinations() {
  return getRecommendedDestinations();
}

export function updateDestinationLike(id, like) {
  return updateStoredDestinationLike(id, like);
}

export function syncGlobalDestinations(app, destinations = getDestinations()) {
  if (app && app.globalData) app.globalData.DESTINATIONS = destinations;
  return destinations;
}

export { DEFAULT_FILTERS };
