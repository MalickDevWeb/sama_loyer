import { STORAGE_KEYS } from '../../utils/constants/index';

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
    wx.switchTab({ url: '/pages/favoris/favoris' });
  },

  onNavVisites() {
    wx.switchTab({ url: '/pages/visites/visites' });
  },

  onNavMessages() {
    wx.switchTab({ url: '/pages/messages/messages' });
  },

  onSwitchToBailleur() {
    wx.showLoading({ title: 'Chargement...' });
    wx.setStorageSync(STORAGE_KEYS.USER_ROLE, 'bailleur');
    
    setTimeout(() => {
      wx.hideLoading();
      wx.reLaunch({
        url: '/pages/bailleur/home'
      });
    }, 400);
  }
});
