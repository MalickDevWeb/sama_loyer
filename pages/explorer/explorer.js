import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { waitForAppInit } from '../../utils/helpers/app-init';
import { navigateToLocked } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { applyFavoritesToPackages, toggleFavoriteId } from '../../utils/helpers/favorites';

import {
  DEFAULT_FILTERS,
  getCatalogDestinations,
  loadDestinations,
  loadCategoryFilters,
  syncGlobalDestinations,
  updateDestinationLike,
} from '../../utils/helpers/catalog';

const app = getApp();

function formatResultsLabel(count) {
  return `${count} destination${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}`;
}

function getFilteredDestinations(destinations, query, searchValue, activeFilter) {
  const currentQuery = query === undefined || query === null ? searchValue : query;
  return filterDestinations(destinations, currentQuery, activeFilter);
}

Page({
  data: {
    activeTab: 'explorer',
    tabs: MAIN_TABS,
    query: '',
    searchValue: '',
    activeFilter: 'all',
    filters: DEFAULT_FILTERS,
    allDestinations: [],
    visibleDestinations: [],
    resultsLabel: 'Chargement des destinations…',
    loading: true,
    loadError: false,
  },

  onLoad() {
    this.loadFilters();
    this.refreshDestinations();
  },

  async loadFilters() {
    const filters = await loadCategoryFilters();

    const nextActiveFilter = filters.some((filter) => filter.id === this.data.activeFilter)
      ? this.data.activeFilter
      : 'all';

    this.setData({
      filters,
      activeFilter: nextActiveFilter,
    }, () => {
      this.applyFilters();
    });
  },

  async onShow() {
    setCustomTabBarActive(this, 'explorer');
    await this.refreshDestinations();
  },

  async refreshDestinations() {
    const shouldShowLoading = !this._catalogLoaded;
    if (shouldShowLoading) this.setData({ loading: true, loadError: false });
    try {
      await waitForAppInit(app);
      const rawDestinations = Array.isArray(app.globalData.DESTINATIONS) && app.globalData.DESTINATIONS.length
        ? app.globalData.DESTINATIONS
        : getCatalogDestinations();

      const destinations = applyFavoritesToPackages(rawDestinations);
      app.globalData.DESTINATIONS = destinations;
      this._catalogLoaded = true;
      const loadError = Boolean(app.globalData.CATALOG_ERROR);
      const visibleDestinations = getFilteredDestinations(
        destinations,
        this.data.query,
        this.data.searchValue,
        this.data.activeFilter
      );
      this.setData({
        allDestinations: destinations,
        visibleDestinations,
        resultsLabel: formatResultsLabel(visibleDestinations.length),
        loading: false,
        loadError,
      });
    } catch (error) {
      console.error('[Explorer] Erreur chargement destinations:', error);
      this.setData({ loading: false, loadError: true, resultsLabel: 'Chargement impossible' });
    }
  },

  async retryLoading() {
    this.setData({ loading: true, loadError: false, resultsLabel: 'Chargement des destinations…' });
    app.globalData.CATALOG_ERROR = false;
    try {
      const destinations = await loadDestinations({
        fallback: [],
        onError: () => { app.globalData.CATALOG_ERROR = true; },
      });
      syncGlobalDestinations(app, destinations);
      this._catalogLoaded = true;
      const loadError = Boolean(app.globalData.CATALOG_ERROR);
      const visibleDestinations = getFilteredDestinations(
        destinations,
        this.data.query,
        this.data.searchValue,
        this.data.activeFilter
      );
      this.setData({
        allDestinations: destinations,
        visibleDestinations,
        resultsLabel: formatResultsLabel(visibleDestinations.length),
        loading: false,
        loadError,
      });
    } catch (error) {
      console.error('[Explorer] Erreur chargement destinations:', error);
      this.setData({ loading: false, loadError: true, resultsLabel: 'Chargement impossible' });
    }
  },

  applyFilters() {
    const { allDestinations, query, searchValue, activeFilter } = this.data;
    const currentQuery = query === undefined || query === null ? searchValue : query;
    const visibleDestinations = filterDestinations(
      allDestinations,
      currentQuery,
      activeFilter
    );

    this.setData({
      visibleDestinations,
      resultsLabel: formatResultsLabel(visibleDestinations.length),
    });
  },

  onInput(event) {
    const query = event.detail.value || '';
    this.setData({ query, searchValue: query }, () => {
      this.applyFilters();
    });
  },

  onSearchInput(event) {
    this.onInput(event);
  },

  onSearch() {
    this.applyFilters();
  },

  handleFilterChange(event) {
    this.setData({
      activeFilter: event.detail.id || 'all',
    }, () => {
      this.applyFilters();
    });
  },

  handleCardPress(event) {
    const { destination } = event.detail || {};

    if (!destination || !destination.id) {
      return;
    }
    navigateToLocked(this, `/pages/destination-detail/destination-detail?id=${destination.id}`, '_openingDestinationDetail');
  },

  handleDestinationLike(event) {
    const { destination, like } = event.detail;

    if (!destination) {
      return;
    }

    toggleFavoriteId(destination.id, like);

    const sourceDestinations = Array.isArray(app.globalData.DESTINATIONS) && app.globalData.DESTINATIONS.length
      ? app.globalData.DESTINATIONS
      : (this.data.allDestinations || []);

    const updatedDestinations = applyFavoritesToPackages(sourceDestinations);
    app.globalData.DESTINATIONS = updatedDestinations;

    this.setData({
      allDestinations: updatedDestinations,
    }, () => {
      this.applyFilters();
    });

    updateDestinationLike(destination.id, like);
  },
});
