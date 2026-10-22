import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

const PREMIUM_LISTINGS = [
  {
    id: 'icotaf-01',
    title: 'Chambre salon',
    place: 'Icotaf, Pikine',
    price: '65 000 FCFA / mois',
    badge: 'Disponible',
    isFavorite: true,
    bg: '#F5EFE6'
  },
  {
    id: 'thiaroye-01',
    title: 'Chambre salon',
    place: 'Thiaroye Azur, Pikine',
    price: '55 000 FCFA / mois',
    badge: 'Disponible',
    isFavorite: false,
    bg: '#E3E9F5'
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
    bg: '#FCE7F0'
  },
  {
    id: 'thiaroye-01',
    title: 'Chambre salon carrelée',
    place: 'Thiaroye Azur, Pikine',
    price: '55 000 FCFA / mois',
    tags: ['Toilettes privées', 'Électricité'],
    status: 'Publié hier · Disponible',
    isFavorite: false,
    bg: '#E2F0EA'
  },
  {
    id: 'guinaw-01',
    title: 'Chambre indépendante',
    place: 'Guinaw Rails, Pikine',
    price: '45 000 FCFA / mois',
    tags: ['Économique', 'Proche bus'],
    status: 'Publié il y a 3 jours · Disponible',
    isFavorite: false,
    bg: '#F3ECE1'
  }
];

Page({
  data: {
    statusBarHeight: 24,
    searchQuery: 'Chambre à Pikine',
    activeCategory: 'chambre', // 'tous' | 'chambre' | 'studio'
    premiumListings: PREMIUM_LISTINGS,
    listings: ALL_SEARCH_LISTINGS,
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
      this.setData({
        searchQuery: `Chambre à ${decodeURIComponent(options.place)}`
      });
    }
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

  onCategorySelect(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ activeCategory: cat });
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
    this.setData({ listings: updated });
    wx.showToast({ title: 'Favoris mis à jour', icon: 'none' });
  }
});
