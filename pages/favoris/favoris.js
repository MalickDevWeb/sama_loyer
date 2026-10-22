import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { STORAGE_KEYS } from '../../utils/constants/index';

const ALL_FAVORITES_MOCK = [
  {
    id: 'icotaf-01',
    title: 'Chambre salon avec douche intérieure',
    typeLabel: 'Chambre salon',
    place: 'Icotaf, Pikine — Dakar',
    price: '65 000',
    unit: 'FCFA / mois',
    verified: true,
    bg: '#F5EFE6',
    dateAdded: 'Ajouté aujourd’hui',
    caution: '130 000 FCFA'
  },
  {
    id: 1,
    title: 'Avec toilettes privées',
    typeLabel: 'Chambre salon',
    place: 'Ouakam, Cité Avion',
    price: '60 000',
    unit: 'FCFA / mois',
    verified: true,
    bg: '#FBE3EC',
    dateAdded: 'Ajouté hier',
    caution: '60 000 FCFA'
  },
  {
    id: 5,
    title: 'Studio meublé standing',
    typeLabel: 'Studio',
    place: 'Point E — Dakar',
    price: '150 000',
    unit: 'FCFA / mois',
    verified: true,
    bg: '#E3E9F5',
    dateAdded: 'Ajouté il y a 3 jours',
    caution: '150 000 FCFA'
  }
];

Page({
  data: {
    statusBarHeight: 24,
    favoritesList: ALL_FAVORITES_MOCK
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}
  },

  onShow() {
    setCustomTabBarActive(this, 'favorites');
    this.refreshFavorites();
  },

  refreshFavorites() {
    try {
      const favs = wx.getStorageSync(STORAGE_KEYS.FAVORITES) || {};
      const filtered = ALL_FAVORITES_MOCK.filter((item) => favs[item.id] !== false);
      this.setData({ favoritesList: filtered });
    } catch (e) {}
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/logement-detail/logement-detail?id=${id}`
    });
  },

  onRemoveFavorite(e) {
    const id = e.currentTarget.dataset.id;
    try {
      const favs = wx.getStorageSync(STORAGE_KEYS.FAVORITES) || {};
      favs[id] = false;
      wx.setStorageSync(STORAGE_KEYS.FAVORITES, favs);
    } catch (err) {}

    const updated = this.data.favoritesList.filter((item) => item.id !== id);
    this.setData({ favoritesList: updated });
    wx.showToast({ title: 'Retiré des favoris', icon: 'none' });
  },

  onGoToHome() {
    wx.switchTab({ url: '/pages/home/home' });
  }
});
