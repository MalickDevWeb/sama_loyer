import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import {
  getBailleurAccount,
  isBailleurActivated,
  isBailleurExpired,
  canStartBailleurTrial,
  activateBailleurAccount,
  renewBailleurSubscription,
  formatLongDate,
  BAILLEUR_PLANS
} from '../../../utils/helpers/store';

const MX_REDIRECT_MS = 1600;

function fmt(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

Page({
  data: {
    statusBarHeight: 44,
    bailleurName: 'Moussa',
    historyOpen: false,
    // Première connexion : espace grisé tant que l'essai ou l'abonnement n'est pas choisi
    locked: false,
    expired: false, // essai / abonnement terminé : il faut repayer
    canTrial: true, // l'essai gratuit n'est offert qu'une fois
    mx: '', // '' | confirm | redirect | maxit | done
    activatedPlan: '',
    activatedUntil: '',
    proPriceText: `${fmt(BAILLEUR_PLANS.pro.price)} F`,
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
    this.syncAccount();
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-home' });
    }
  },

  onUnload() {
    clearTimeout(this.mxTimer);
  },

  syncAccount() {
    const account = getBailleurAccount();
    this.setData({
      locked: !isBailleurActivated(),
      expired: isBailleurExpired(),
      canTrial: canStartBailleurTrial(),
      bailleurName: account && account.fullName ? account.fullName.split(' ')[0] : this.data.bailleurName
    });
  },

  // --- Activation : essai gratuit ou abonnement Max it --------------------------
  onStartTrial() {
    if (!canStartBailleurTrial()) return;
    this.activate('trial');
  },

  onSubscribe() {
    this.setData({ mx: 'confirm' });
  },

  onMxGo() {
    this.setData({ mx: 'redirect' });
    clearTimeout(this.mxTimer);
    this.mxTimer = setTimeout(() => this.setData({ mx: 'maxit' }), MX_REDIRECT_MS);
  },

  onMxValidate() {
    this.setData({ mx: '' });
    this.activate('pro');
  },

  onMxClose() {
    clearTimeout(this.mxTimer);
    this.setData({ mx: '' });
  },

  activate(plan) {
    // Pro = paiement Max it : même logique que « Gérer mon abonnement » (+30 jours, historique)
    const account = plan === 'pro' ? renewBailleurSubscription() : activateBailleurAccount(plan);
    this.syncAccount();
    this.setData({
      mx: 'done',
      activatedPlan: plan,
      activatedUntil: formatLongDate(account.expiresAt)
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

  onToggleHistory() {
    this.setData({ historyOpen: !this.data.historyOpen });
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
