import { applyFavoritesToPackages, toggleFavoriteId } from '../helpers/favorites';

let destinations = [];
let recommendedDestinations = [];
let filters = [];

function normalizeList(value) {
  return Array.isArray(value) ? value : [];
}

export function setDestinations(nextDestinations) {
  destinations = applyFavoritesToPackages(normalizeList(nextDestinations));
  return destinations;
}

export function getDestinations() {
  return applyFavoritesToPackages(destinations);
}

export function updateDestinationLike(id, like) {
  toggleFavoriteId(id, like);

  destinations = applyFavoritesToPackages(destinations);

  return destinations;
}

export function setRecommendedDestinations(nextDestinations) {
  recommendedDestinations = applyFavoritesToPackages(normalizeList(nextDestinations));
  return recommendedDestinations;
}

export function getRecommendedDestinations() {
  return applyFavoritesToPackages(recommendedDestinations);
}

export function setFilters(nextFilters) {
  filters = normalizeList(nextFilters);
  return filters;
}

export function getFilters() {
  return filters;
}

export function resetCatalogStore() {
  destinations = [];
  recommendedDestinations = [];
  filters = [];
}
