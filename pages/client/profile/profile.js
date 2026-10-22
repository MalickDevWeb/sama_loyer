import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 44,
    userName: 'Awa Diop',
    userPhone: '+221 77 ••• •• 12',
    userInitials: 'AD',
    lang: 'fr', // 'fr' | 'wo'
    notifMessages: true,
    notifVisites: true,
    notifAnnonces: true,
    notifPrices: false
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'profile' });
    }
  },

  onSelectLang(e) {
    const lang = e.currentTarget.dataset.lang;
    this.setData({ lang });
    wx.showToast({
      title: lang === 'wo' ? 'Kàllaama : Wolof' : 'Langue : Français',
      icon: 'none'
    });
  },

  onToggleNotif(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({
      [key]: e.detail.value
    });
  },

  onNavFavoris() {
    // Favoris n'est plus un onglet : navigateTo (switchTab échouerait)
    wx.navigateTo({ url: '/pages/client/favoris/favoris' });
  },

  onNavVisites() {
    wx.switchTab({ url: '/pages/client/visites/visites' });
  },

  onNavMessages() {
    wx.switchTab({ url: '/pages/client/messages/messages' });
  },

  onNavLoyers() {
    wx.navigateTo({
      url: '/pages/client/loyers/loyers'
    });
  },

  onSwitchToBailleur() {
    wx.showLoading({ title: 'Chargement...' });
    storage.set(STORAGE_KEYS.USER_ROLE, 'bailleur');
    
    setTimeout(() => {
      wx.hideLoading();
      wx.reLaunch({
        url: '/pages/bailleur/home/home'
      });
    }, 400);
  }
});

