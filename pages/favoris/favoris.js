import { MAIN_TABS } from '../../utils/constants/index';
import { navigateToLocked } from '../../utils/helpers/navigation';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { waitForAppInit } from '../../utils/helpers/app-init';
import { applyFavoritesToPackages, toggleFavoriteId } from '../../utils/helpers/favorites';
import { loadPackages } from '../../utils/helpers/catalog';

const app = getApp();

function formatFavoritesLabel(count) {
  return `${count} destination${count === 1 ? '' : 's'} sauvegardée${count === 1 ? '' : 's'}`;
}

Page({
  data: {
    activeTab: 'favorites',
    tabs: MAIN_TABS,
    allDestinations: [],
    favoriteDestinations: [],
    resultsLabel: 'Chargement des favoris…',
    loading: true,
  },

  onLoad() {
    this.refreshFavorites();
  },

  onShow() {
    setCustomTabBarActive(this, 'favorites');

    const rawDestinations = Array.isArray(app.globalData.DESTINATIONS) && app.globalData.DESTINATIONS.length
      ? app.globalData.DESTINATIONS
      : [];

    if (rawDestinations.length > 0) {
      const syncedDestinations = applyFavoritesToPackages(rawDestinations);
      app.globalData.DESTINATIONS = syncedDestinations;
      const favoriteDestinations = syncedDestinations.filter((item) => Boolean(item.like));

      this.setData({
        allDestinations: syncedDestinations,
        favoriteDestinations,
        resultsLabel: formatFavoritesLabel(favoriteDestinations.length),
        loading: false,
      });
      return;
    }

    this.refreshFavorites();
  },

  onHide() {
    if (!this.data.favoriteDestinations || this.data.favoriteDestinations.length === 0) {
      this.setData({ loading: true, resultsLabel: 'Chargement des favoris…' });
    }
  },

  async refreshFavorites() {
    if (!this.data.favoriteDestinations || this.data.favoriteDestinations.length === 0) {
      this.setData({ loading: true, resultsLabel: 'Chargement des favoris…' });
    }

    try {
      await waitForAppInit(app);

      let destinations = Array.isArray(app.globalData.DESTINATIONS) && app.globalData.DESTINATIONS.length
        ? app.globalData.DESTINATIONS
        : [];

      // Si les données de l'API n'ont pas encore été chargées (ex: arrivée directe sur favoris)
      if (destinations.length === 0) {
        try {
          destinations = await loadPackages();
          app.globalData.DESTINATIONS = destinations;
        } catch (error) {
          console.error('[Favoris] Erreur chargement packages API:', error);
        }
      }

      // Applique l'état des favoris persistés dans le stockage local
      const syncedDestinations = applyFavoritesToPackages(destinations);
      app.globalData.DESTINATIONS = syncedDestinations;

      const favoriteDestinations = syncedDestinations.filter((item) => Boolean(item.like));
      this._favoritesLoaded = true;

      this.setData({
        allDestinations: syncedDestinations,
        favoriteDestinations,
        resultsLabel: formatFavoritesLabel(favoriteDestinations.length),
        loading: false,
      });
    } catch (error) {
      console.error('[Favoris] Erreur rafraîchissement favoris:', error);
      this.setData({ loading: false });
    }
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

    // 2. Mettre à jour allDestinations global
    const sourceDestinations = Array.isArray(this.data.allDestinations)
      ? this.data.allDestinations
      : [];
    const updatedDestinations = sourceDestinations.map((item) => (
      String(item.id) === String(destination.id)
        ? { ...item, like }
        : item
    ));

    app.globalData.DESTINATIONS = updatedDestinations;

    // 3. Filtrer pour la vue des favoris
    const favoriteDestinations = updatedDestinations.filter((item) => Boolean(item.like));

    this.setData({
      allDestinations: updatedDestinations,
      favoriteDestinations,
      resultsLabel: formatFavoritesLabel(favoriteDestinations.length),
    });
  },
});
