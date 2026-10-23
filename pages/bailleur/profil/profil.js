// pages/bailleur/profil/profil.js
// Onglet « Profil » du bailleur :
// - Consultation et gestion des abonnements (Premium Max it, mise en avant)
// - Informations du profil centralisées depuis la page d'accueil
// - Bouton de changement de profil vers le profil Locataire
// - Aide, sécurité et assistance client Max it
import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { getBailleurAccount, BAILLEUR_PLANS, formatLongDate } from '../../../utils/helpers/store';

function initialsOf(name) {
  return String(name || '').trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || 'B';
}

function formatPhone(phone) {
  const d = String(phone || '').replace(/\D/g, '');
  return d.length === 9 ? `+221 ${d.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4')}` : phone;
}

Page({
  data: {
    statusBarHeight: 44,
    activeModal: null, // 'help' | 'security' | 'support' | null
    stats: {
      annonces: 3,
      demandes: 4,
      locataires: 2
    },
    profile: {
      fullName: 'Moussa Diop',
      initials: 'MD',
      phone: '+221 77 123 45 67',
      publication: 'Instantanée sans validation'
    },
    subscription: {
      plan: 'Premium mensuel',
      active: true,
      until: '15 novembre 2026',
      highlights: '2 annonces sur 3 mises en avant'
    }
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 44 });
    } catch (e) {}
  },

  onShow() {
    setCustomTabBarActive(this, 'b-profil');
    this.loadAccount();
  },

  // Récupère les informations du compte bailleur depuis le store local
  loadAccount() {
    const account = getBailleurAccount();
    if (!account) return;
    const plan = BAILLEUR_PLANS[account.plan] || BAILLEUR_PLANS.trial;
    const active = account.expiresAt > Date.now();
    this.setData({
      'profile.fullName': account.fullName || 'Moussa Diop',
      'profile.initials': initialsOf(account.fullName || 'Moussa Diop'),
      'profile.phone': formatPhone(account.phone || '771234567'),
      subscription: {
        plan: account.plan === 'trial' ? 'Essai gratuit 30 jours' : plan.label,
        active,
        until: formatLongDate(account.expiresAt),
        highlights: account.plan === 'trial'
          ? 'Passez à Pro avant la fin de l’essai pour préserver vos avantages'
          : '3 annonces mises en avant · Paiement récurrent Max it'
      }
    });
  },

  onGoAnnonces() {
    wx.redirectTo({ url: '/pages/bailleur/annonces/annonces' });
  },

  onGoDemandes() {
    wx.redirectTo({ url: '/pages/bailleur/demandes/demandes' });
  },

  onGoLocataires() {
    wx.redirectTo({ url: '/pages/bailleur/locataires/locataires' });
  },

  // Gestion des abonnements
  onManageSubscription() {
    wx.navigateTo({ url: '/pages/bailleur/premium/premium' });
  },

  // Gestion des horaires de visite
  onOpenHoraires() {
    wx.navigateTo({ url: '/pages/bailleur/horaires/horaires' });
  },

  // Basculer vers le profil locataire
  onSwitchToClient() {
    wx.showLoading({ title: 'Chargement...' });
    storage.set(STORAGE_KEYS.USER_ROLE, 'client');
    setTimeout(() => {
      wx.hideLoading();
      wx.reLaunch({ url: '/pages/client/home/home' });
    }, 400);
  },

  // Modals Aide & Support
  onOpenHelp() {
    this.setData({ activeModal: 'help' });
  },

  onOpenSecurity() {
    this.setData({ activeModal: 'security' });
  },

  onOpenSupport() {
    this.setData({ activeModal: 'support' });
  },

  onCloseModal() {
    this.setData({ activeModal: null });
  },

  onCallSupport() {
    wx.makePhoneCall({
      phoneNumber: '1444',
      fail: () => {
        wx.showToast({ title: 'Composez le 1444 sur votre mobile', icon: 'none' });
      }
    });
  },

  onCopySupportWhatsApp() {
    wx.setClipboardData({
      data: '+221 77 000 00 00',
      success: () => {
        wx.showToast({ title: 'Numéro copié !', icon: 'success' });
      }
    });
  },

  noop() {}
});
