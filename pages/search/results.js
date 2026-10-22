import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

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
    sortOption: 'Plus récents'
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
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/home/home' });
      }
    });
  },

  onModifyTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/home/home' });
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
    wx.showToast({
      title: 'Filtres appliqués',
      icon: 'none'
    });
  },

  onMicTap() {
    wx.showActionSheet({
      itemList: [
        '🇸🇳 Dafa ma bëgg chambre ci Pikine 65 000 F',
        '🇫🇷 Recherche chambre ou studio à Pikine',
        '🇫🇷 Studio meublé 95 000 F max'
      ],
      success: (res) => {
        const queries = [
          'Chambre à Pikine 65 000 F',
          'Chambre ou studio à Pikine',
          'Studio meublé à Pikine'
        ];
        const selected = queries[res.tapIndex] || 'Chambre à Pikine';
        this.setData({
          searchQuery: selected,
          activeCategory: res.tapIndex === 2 ? 'studio' : 'chambre'
        }, () => {
          this.filterListings();
          wx.showToast({
            title: 'Vocal reconnu !',
            icon: 'success'
          });
        });
      }
    });
  },

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
      url: `/pages/logement-detail/logement-detail?id=${id}`
    });
  },

  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.listings.map((l) => (l.id === id ? { ...l, isFavorite: !l.isFavorite } : l));
    this.setData({ listings: updated }, () => {
      this.filterListings();
    });
    wx.showToast({ title: 'Favoris mis à jour', icon: 'none' });
  }
});
