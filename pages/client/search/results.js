import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { getFavoritesMap, isFavorite, toggleFavoriteId } from '../../../utils/helpers/favorites';

function withFavorites(items) {
  const favs = getFavoritesMap();
  return items.map((l) => ({ ...l, isFavorite: !!favs[l.id] }));
}

const PREMIUM_LISTINGS = [
  {
    id: 'icotaf-01',
    title: 'Chambre salon',
    place: 'Icotaf, Pikine',
    price: '65 000 FCFA / mois',
    badge: 'Disponible',
    isFavorite: true,
    bg: '#F5EFE6',
    category: 'chambre'
  },
  {
    id: 'thiaroye-01',
    title: 'Chambre salon',
    place: 'Thiaroye Azur, Pikine',
    price: '55 000 FCFA / mois',
    badge: 'Disponible',
    isFavorite: false,
    bg: '#E3E9F5',
    category: 'chambre'
  }
];

const ALL_SEARCH_LISTINGS = [
  {
    id: 'icotaf-01',
    title: 'Chambre salon avec douche intérieure',
    place: 'Icotaf, Pikine',
    price: '65 000 FCFA / mois',
    tags: ['Douche intérieure', 'Eau'],
    status: 'Publié il y a 2 h · Disponible',
    isFavorite: true,
    bg: '#FCE7F0',
    category: 'chambre'
  },
  {
    id: 'thiaroye-01',
    title: 'Chambre salon carrelée',
    place: 'Thiaroye Azur, Pikine',
    price: '55 000 FCFA / mois',
    tags: ['Toilettes privées', 'Électricité'],
    status: 'Publié hier · Disponible',
    isFavorite: false,
    bg: '#E2F0EA',
    category: 'chambre'
  },
  {
    id: 'pikine-rue10',
    title: 'Studio meublé, entrée indépendante',
    place: 'Pikine Rue 10, Pikine',
    price: '95 000 FCFA / mois',
    tags: ['Meublé', 'Entrée indép.'],
    status: 'Publié hier · Disponible',
    isFavorite: false,
    bg: '#EAF2FB',
    category: 'studio'
  },
  {
    id: 'guinaw-01',
    title: 'Chambre indépendante',
    place: 'Guinaw Rails, Pikine',
    price: '45 000 FCFA / mois',
    tags: ['Économique', 'Proche bus'],
    status: 'Publié il y a 3 jours · Disponible',
    isFavorite: false,
    bg: '#F3ECE1',
    category: 'chambre'
  }
];

Page({
  data: {
    statusBarHeight: 24,
    searchQuery: 'Chambre à Pikine',
    headlineText: 'Logements à Pikine',
    activeCategory: 'chambre', // 'tous' | 'chambre' | 'studio'
    premiumListings: PREMIUM_LISTINGS,
    listings: ALL_SEARCH_LISTINGS,
    filteredListings: ALL_SEARCH_LISTINGS,
    sortOption: 'Plus récents',
    showVoiceModal: false,
    showFilterModal: false,
    toast: {
      visible: false,
      hiding: false,
      title: '',
      subtitle: '',
      type: 'search',
      iconClass: 'icon-toast-search'
    }
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}

    if (options && options.place) {
      const p = decodeURIComponent(options.place);
      this.setData({
        searchQuery: `Chambre à ${p}`,
        headlineText: `Logements à ${p}`
      });
    }

    this.filterListings();
  },

  onShow() {
    setCustomTabBarActive(this, 'home');
    this.refreshFavorites();
  },

  // Les favoris peuvent avoir changé sur la fiche logement
  refreshFavorites() {
    this.setData({
      premiumListings: withFavorites(this.data.premiumListings),
      listings: withFavorites(this.data.listings)
    }, () => {
      this.filterListings();
    });
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/client/home/home' });
      }
    });
  },

  onResetFilters() {
    this.setData({
      searchQuery: '',
      activeCategory: 'tous'
    }, () => {
      this.filterListings();
      this.showMagnifiqueToast({
        title: 'Recherche réinitialisée',
        subtitle: `${this.data.filteredListings.length} logements disponibles`,
        type: 'search',
        iconClass: 'icon-toast-search',
        duration: 2000
      });
    });
  },

  onModifyTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/client/home/home' });
      }
    });
  },

  onSearchInput(e) {
    const q = e.detail.value || '';
    this.setData({ searchQuery: q }, () => {
      this.filterListings();
    });
  },

  onSearchConfirm(e) {
    this.filterListings();
    const count = this.data.filteredListings.length;
    this.showMagnifiqueToast({
      title: 'Filtres appliqués',
      subtitle: `${count} logement${count > 1 ? 's' : ''} disponible${count > 1 ? 's' : ''}`,
      type: 'search',
      iconClass: 'icon-toast-search',
      duration: 2500
    });
  },

  onMicTap() {
    this.setData({ showVoiceModal: true });
  },

  onCloseVoiceModal() {
    this.setData({ showVoiceModal: false });
  },

  onSelectVoiceQuery(e) {
    const { query, display, cat } = e.currentTarget.dataset;
    const selected = query || 'Chambre à Pikine';
    this.setData({
      showVoiceModal: false,
      searchQuery: selected,
      activeCategory: cat || 'chambre'
    }, () => {
      this.filterListings();
      const count = this.data.filteredListings.length;
      this.showMagnifiqueToast({
        title: display ? `« ${display} »` : `« ${selected} »`,
        subtitle: `✦ IA SAMA LOYER · ${count} logement${count > 1 ? 's' : ''} trouvé${count > 1 ? 's' : ''}`,
        type: 'voice',
        iconClass: 'icon-toast-mic',
        duration: 3200
      });
    });
  },

  // Bouton ⚙ : ouverture du bottom sheet de choix rapide du type
  onFilterTap() {
    this.setData({ showFilterModal: true });
  },

  onCloseFilterModal() {
    this.setData({ showFilterModal: false });
  },

  onSelectCategoryModal(e) {
    const cat = e.currentTarget.dataset.cat || 'tous';
    this.setData({
      activeCategory: cat,
      showFilterModal: false
    }, () => {
      this.filterListings();
    });
  },

  noop() {},

  onCategorySelect(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ activeCategory: cat }, () => {
      this.filterListings();
    });
  },

  filterListings() {
    const q = (this.data.searchQuery || '').toLowerCase();
    const cat = this.data.activeCategory;

    let res = this.data.listings.filter((item) => {
      // Category match
      if (cat !== 'tous' && item.category !== cat) {
        return false;
      }
      // Query match (place or title)
      if (q && !item.title.toLowerCase().includes(q) && !item.place.toLowerCase().includes(q)) {
        // If query mentions "chambre" and item is chambre
        if (q.includes('chambre') && item.category === 'chambre') return true;
        if (q.includes('studio') && item.category === 'studio') return true;
        return false;
      }
      return true;
    });

    this.setData({ filteredListings: res });
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${id}`
    });
  },

  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const liked = !isFavorite(id);
    toggleFavoriteId(id, liked);
    this.refreshFavorites();
    this.showMagnifiqueToast({
      title: liked ? 'Ajouté aux favoris' : 'Retiré des favoris',
      subtitle: liked ? 'Retrouve ce logement dans tes favoris' : '',
      type: 'heart',
      iconClass: 'icon-toast-heart',
      duration: 2000
    });
  },

  showMagnifiqueToast({ title, subtitle = '', type = 'search', iconClass = 'icon-toast-search', duration = 2600 }) {
    if (this._toastTimer) {
      clearTimeout(this._toastTimer);
      this._toastTimer = null;
    }
    if (this._toastHideTimer) {
      clearTimeout(this._toastHideTimer);
      this._toastHideTimer = null;
    }

    this.setData({
      toast: {
        visible: true,
        hiding: false,
        title,
        subtitle,
        type,
        iconClass
      }
    });

    this._toastTimer = setTimeout(() => {
      this.setData({ 'toast.hiding': true });
      this._toastHideTimer = setTimeout(() => {
        this.setData({
          toast: {
            visible: false,
            hiding: false,
            title: '',
            subtitle: '',
            type: 'search',
            iconClass: 'icon-toast-search'
          }
        });
      }, 280);
    }, duration);
  },

  onDismissToast() {
    if (this._toastTimer) {
      clearTimeout(this._toastTimer);
      this._toastTimer = null;
    }
    if (this._toastHideTimer) {
      clearTimeout(this._toastHideTimer);
      this._toastHideTimer = null;
    }

    this.setData({ 'toast.hiding': true });
    setTimeout(() => {
      this.setData({
        toast: {
          visible: false,
          hiding: false,
          title: '',
          subtitle: '',
          type: 'search',
          iconClass: 'icon-toast-search'
        }
      });
    }, 280);
  }
});
