import { MAIN_TABS } from '../../utils/constants/index';
import { filterDestinations } from '../../utils/helpers/destination-filter';
import { navigateToLocked } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { applyFavoritesToPackages, toggleFavoriteId } from '../../utils/helpers/favorites';
import {
  DEFAULT_FILTERS,
  getCatalogRecommendedDestinations,
  loadRecommendedDestinations,
  loadPackages,
  loadFeaturedDestinations,
  loadCategoryFilters,
} from '../../utils/helpers/catalog';


const app = getApp();

function updateLikeInList(destinations, id, like) {
  return (Array.isArray(destinations) ? destinations : []).map((item) => (
    String(item.id) === String(id)
      ? { ...item, like }
      : item
  ));
}

Page({


  /**
   * Fonction appelée au chargement de la page
   */
  onLoad() {
    this.loadFilters();
    this.refreshPackages();
    this.refreshFeatured();
  },

  async refreshPackages() {
    this.setData({ destinationsLoading: true, destinationsError: false });
    try {
      const packages = await loadPackages();
      app.globalData.DESTINATIONS = packages;
      app.globalData.CATALOG_ERROR = false;
      this.setData({ allDestinations: packages }, () => this.applyFilters());

    } catch (error) {
      app.globalData.CATALOG_ERROR = true;
      this.setData({ destinationsError: true });
    } finally {
      this.setData({ destinationsLoading: false });
    }
  },

  async refreshFeatured() {
    this.setData({ featuredLoading: true, featuredError: false, featuredDestinations: [] });
    try {
      const allFeaturedDestinations = await loadFeaturedDestinations();
      this.setData({ allFeaturedDestinations }, () => this.applyFilters());
    } catch (error) {
      this.setData({ featuredError: true });
    } finally {
      this.setData({ featuredLoading: false });
    }
  },

  data: {
    activeTab: 'home',
    tabs: MAIN_TABS,
    query: '',
    allDestinations: [],
    destinations: [],
    destinationsRecommended: [],
    destinationsLoading: true,
    destinationsError: false,
    featuredDestinations: [],
    allFeaturedDestinations: [],
    allRecommendedDestinations: [],
    featuredLoading: true,
    featuredError: false,
    recommendedLoading: true,
    recommendedError: false,
    filters: DEFAULT_FILTERS,
    activeFilter: 'all',
  },

  applyFilters() {
    const allDestinations = Array.isArray(this.data.allDestinations)
      ? this.data.allDestinations
      : [];
      
    const allRecommendedDestinations = Array.isArray(this.data.allRecommendedDestinations)
      ? this.data.allRecommendedDestinations
      : [];

    const destinations = filterDestinations(
      allDestinations,
      this.data.query,
      this.data.activeFilter
    );

    const featuredDestinations = filterDestinations(
      this.data.allFeaturedDestinations,
      this.data.query,
      this.data.activeFilter
    );
    const destinationsRecommended = filterDestinations(
      allRecommendedDestinations,
      this.data.query,
      this.data.activeFilter
    );

    this.setData({ destinations, destinationsRecommended, featuredDestinations });
  },

  async loadFilters() {
    const filters = await loadCategoryFilters();
    const activeFilter = filters.some((filter) => filter.id === this.data.activeFilter)
      ? this.data.activeFilter
      : 'all';
    this.setData({ filters, activeFilter }, () => this.applyFilters());
  },

  async refreshDestinations() {
    this.setData({ recommendedLoading: true, recommendedError: false, destinationsRecommended: [] });
    try {
      await loadRecommendedDestinations();
      this.setData({ allRecommendedDestinations: getCatalogRecommendedDestinations() }, () => this.applyFilters());
    } catch (error) {
      this.setData({ recommendedError: true });
    } finally {
      this.setData({ recommendedLoading: false });
    }
  },

  retryPackages() {
    this.refreshPackages();
  },

  retryFeatured() {
    this.refreshFeatured();
  },

  retryRecommendations() {
    this.refreshDestinations();
  },

  onInput(event) {
    const query = event.detail.value || '';

    this.setData({ query }, () => {
      this.applyFilters();
    });
  },

  onSearch() {
    this.applyFilters();
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

    // 1. Sauvegarder dans le stockage local persistant
    toggleFavoriteId(destination.id, like);

    // 2. Mettre à jour la liste en mémoire
    const updatedDestinations = updateLikeInList(
      this.data.allDestinations,
      destination.id,
      like
    );
    const allFeaturedDestinations = updateLikeInList(
      this.data.allFeaturedDestinations,
      destination.id,
      like
    );
    const allRecommendedDestinations = updateLikeInList(
      this.data.allRecommendedDestinations,
      destination.id,
      like
    );

    app.globalData.DESTINATIONS = updatedDestinations;
    this.setData({
      allDestinations: updatedDestinations,
      allFeaturedDestinations,
      allRecommendedDestinations,
    }, () => {
      this.applyFilters();
    });
  },

  handleFilterChange(event) {
    this.setData({
      activeFilter: event.detail.id || 'all',
    }, () => {
      this.applyFilters();
    });
  },

  handleShowAll() {
    wx.switchTab({
      url: '/pages/explorer/explorer',
    });
  },

  onShow() {
    setCustomTabBarActive(this, 'home');
    const rawDestinations = Array.isArray(app.globalData.DESTINATIONS) && app.globalData.DESTINATIONS.length
      ? app.globalData.DESTINATIONS
      : this.data.allDestinations;

    const allDestinations = applyFavoritesToPackages(rawDestinations);
    // Home keeps three independently loaded card lists in page state. Refresh
    // every projection from persisted favorite IDs when returning from another tab.
    const allFeaturedDestinations = applyFavoritesToPackages(this.data.allFeaturedDestinations);
    const allRecommendedDestinations = applyFavoritesToPackages(this.data.allRecommendedDestinations);
    const catalogRecommendedDestinations = getCatalogRecommendedDestinations();
    app.globalData.DESTINATIONS = allDestinations;

    this.setData({
      allDestinations,
      allFeaturedDestinations,
      allRecommendedDestinations: catalogRecommendedDestinations.length
        ? applyFavoritesToPackages(catalogRecommendedDestinations)
        : allRecommendedDestinations,
    }, () => {
      this.applyFilters();
    });

    this.refreshDestinations();
  }
});
