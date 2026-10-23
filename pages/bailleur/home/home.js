import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 44,
    bailleurName: 'Moussa',
    initials: 'MD',
    phone: '+221 77 123 45 67',
    showProfileModal: false,
    kpis: {
      annoncesEnLigne: 3,
      annoncesValidation: 1,
      demandesVisite: 4,
      demandesATraiter: 2,
      logementsLoues: 2,
      totalLogements: 6,
      loyersRecus: '205 000 F'
    }
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
      this.getTabBar().setData({ activeTab: 'b-home' });
    }
  },

  onGoAjouter() {
    wx.navigateTo({
      url: '/pages/bailleur/ajouter/ajouter'
    });
  },

  onGoDemandes() {
    wx.redirectTo({
      url: '/pages/bailleur/demandes/demandes'
    });
  },

  onGoAnnonces() {
    wx.redirectTo({
      url: '/pages/bailleur/annonces/annonces'
    });
  },

  onGoClients() {
    wx.redirectTo({
      url: '/pages/bailleur/locataires/locataires'
    });
  },

  onGoPremium() {
    wx.redirectTo({
      url: '/pages/bailleur/premium/premium'
    });
  },

  onGoHistorique() {
    wx.navigateTo({
      url: '/pages/bailleur/locataires/locataires'
    });
  },

  onOpenProfileModal() {
    this.setData({ showProfileModal: true });
    if (wx.vibrateShort) wx.vibrateShort();
  },

  onCloseProfileModal() {
    this.setData({ showProfileModal: false });
  },

  onSwitchToClient() {
    wx.showLoading({ title: 'Chargement...' });
    storage.set(STORAGE_KEYS.USER_ROLE, 'client');
    setTimeout(() => {
      wx.hideLoading();
      wx.reLaunch({
        url: '/pages/client/home/home'
      });
    }, 400);
  },

  noop() {}
});

