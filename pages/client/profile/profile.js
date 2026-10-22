import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { getFavoriteIds } from '../../../utils/helpers/favorites';
import { getVisites } from '../../../utils/helpers/visites';
import { getConversations } from '../../../utils/mocks/conversations';

const NOTIFS = [
  { id: 'msg', label: 'Nouveaux messages', sub: 'Quand un bailleur te répond' },
  { id: 'visit', label: 'Réponses aux visites', sub: 'Acceptée, refusée ou modifiée' },
  { id: 'new', label: 'Nouvelles annonces', sub: 'Dans tes quartiers préférés' },
  { id: 'price', label: 'Baisses de prix', sub: 'Sur tes favoris' }
];

const DEFAULT_PREFS = {
  notifs: { msg: true, visit: true, new: true, price: false },
  lang: 'fr',
  zones: 'Pikine, Ouakam',
  budget: 'Jusqu’à 60 000 FCFA / mois'
};

const DEFAULT_USER_PROFILE = {
  fullName: 'Awa Diop',
  phone: '77 123 45 12',
  email: 'awa.diop@orange.sn',
  job: 'Ingénieure Télécoms',
  city: 'Dakar',
  verified: true
};

const ALL_ZONES = [
  'Plateau', 'Almadies', 'Ngor', 'Ouakam', 'Mermoz', 'Fann-Point E',
  'Sacré-Cœur', 'Yoff', 'Liberté 6', 'Parcelles Assainies', 'Grand Yoff',
  'Pikine', 'Guédiawaye', 'Rufisque', 'Keur Massar'
];

const BUDGET_OPTIONS = [
  'Moins de 40 000 FCFA / mois',
  '40 000 – 70 000 FCFA / mois',
  'Jusqu’à 60 000 FCFA / mois',
  '70 000 – 120 000 FCFA / mois',
  '120 000 – 250 000 FCFA / mois',
  'Plus de 250 000 FCFA / mois'
];

function setTabBarVisible(page, visible) {
  try {
    if (visible) wx.showTabBar({ animation: false });
    else wx.hideTabBar({ animation: false });
  } catch (e) {}

  try {
    if (page && typeof page.getTabBar === 'function') {
      const tb = page.getTabBar();
      if (tb && typeof tb.setVisible === 'function') {
        tb.setVisible(visible);
      } else if (tb) {
        tb.setData({ hidden: !visible });
      }
    }
  } catch (e) {}
}

function loadPrefs() {
  const saved = storage.get(STORAGE_KEYS.PROFILE_PREFS, null);
  if (!saved || typeof saved !== 'object') return JSON.parse(JSON.stringify(DEFAULT_PREFS));
  return {
    notifs: Object.assign({}, DEFAULT_PREFS.notifs, saved.notifs),
    lang: saved.lang || DEFAULT_PREFS.lang,
    zones: saved.zones || DEFAULT_PREFS.zones,
    budget: saved.budget || DEFAULT_PREFS.budget
  };
}

function loadUserProfile() {
  const saved = storage.get(STORAGE_KEYS.USER_PROFILE, null);
  if (!saved || typeof saved !== 'object') return Object.assign({}, DEFAULT_USER_PROFILE);
  return Object.assign({}, DEFAULT_USER_PROFILE, saved);
}

function getInitials(name) {
  if (!name) return 'AD';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

Page({
  data: {
    statusBarHeight: 44,
    userName: 'Awa Diop',
    userPhone: '+221 77 123 45 12',
    userInitials: 'AD',
    userProfile: {},
    stats: { favoris: 0, visites: 0, conversations: 0 },
    notifs: [],
    lang: 'fr', // 'fr' | 'wo'
    langs: [
      { id: 'fr', label: 'Français' },
      { id: 'wo', label: 'Wolof' }
    ],
    prefs: {
      zones: 'Pikine, Ouakam',
      budget: 'Jusqu’à 60 000 FCFA / mois'
    },

    // Modals d'édition interactive
    activeModal: '', // '' | 'info' | 'phone' | 'zones' | 'budget' | 'help' | 'security' | 'support'
    editForm: {
      fullName: '',
      phone: '',
      email: '',
      job: '',
      city: ''
    },
    allZones: ALL_ZONES,
    tempZones: [],
    budgetOptions: BUDGET_OPTIONS,
    tempBudget: '',

    confirmLogout: false
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 44 });
    } catch (e) {}

    this.prefs = loadPrefs();
    this.refreshUserProfile();
    this.renderPrefs();
  },

  onShow() {
    setCustomTabBarActive(this, 'profile');
    setTabBarVisible(this, true);
    this.refreshUserProfile();
    this.setData({
      stats: {
        favoris: getFavoriteIds().length,
        visites: getVisites().length,
        conversations: getConversations().length
      }
    });
  },

  onHide() {
    setTabBarVisible(this, true);
  },

  onUnload() {
    setTabBarVisible(this, true);
  },

  refreshUserProfile() {
    const profile = loadUserProfile();
    const initials = getInitials(profile.fullName);
    const phoneDisplay = profile.phone.startsWith('+221') ? profile.phone : `+221 ${profile.phone}`;

    this.setData({
      userProfile: profile,
      userName: profile.fullName,
      userInitials: initials,
      userPhone: phoneDisplay
    });
  },

  renderPrefs() {
    this.setData({
      lang: this.prefs.lang,
      prefs: {
        zones: this.prefs.zones || DEFAULT_PREFS.zones,
        budget: this.prefs.budget || DEFAULT_PREFS.budget
      },
      notifs: NOTIFS.map((n) => ({ ...n, on: !!this.prefs.notifs[n.id] }))
    });
  },

  savePrefs() {
    storage.set(STORAGE_KEYS.PROFILE_PREFS, this.prefs);
    this.renderPrefs();
  },

  // --- MON COMPTE : INFORMATIONS PERSONNELLES -------------------------------
  onOpenPersonalInfo() {
    setTabBarVisible(this, false);
    const profile = this.data.userProfile;
    this.setData({
      activeModal: 'info',
      editForm: {
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        email: profile.email || '',
        job: profile.job || '',
        city: profile.city || ''
      }
    });
  },

  onInputFullName(e) {
    this.setData({ 'editForm.fullName': e.detail.value });
  },

  onSavePersonalInfo() {
    setTabBarVisible(this, true);
    const name = (this.data.editForm.fullName || '').trim();
    if (!name) {
      wx.showToast({ title: 'Veuillez renseigner votre nom', icon: 'none' });
      return;
    }

    const updated = {
      ...this.data.userProfile,
      fullName: name
    };

    storage.set(STORAGE_KEYS.USER_PROFILE, updated);
    this.refreshUserProfile();
    this.setData({ activeModal: '' });

    wx.showToast({
      title: 'Nom mis à jour',
      icon: 'success'
    });
  },

  // --- MON COMPTE : NUMÉRO DE TÉLÉPHONE --------------------------------------
  onOpenPhone() {
    setTabBarVisible(this, false);
    const profile = this.data.userProfile;
    const cleanPhone = (profile.phone || '').replace(/^\+221\s*/, '');
    this.setData({
      activeModal: 'phone',
      editForm: {
        ...this.data.editForm,
        phone: cleanPhone
      }
    });
  },

  // --- PRÉFÉRENCES : QUARTIERS PRÉFÉRÉS -------------------------------------
  onOpenZones() {
    setTabBarVisible(this, false);
    const current = (this.prefs.zones || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    this.setData({
      activeModal: 'zones',
      tempZones: current
    });
  },

  onToggleZone(e) {
    const zone = e.currentTarget.dataset.zone;
    let list = this.data.tempZones.slice();
    const idx = list.indexOf(zone);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(zone);
    }
    this.setData({ tempZones: list });
  },

  onSaveZones() {
    setTabBarVisible(this, true);
    if (this.data.tempZones.length === 0) {
      wx.showToast({ title: 'Sélectionnez au moins un quartier', icon: 'none' });
      return;
    }
    this.prefs.zones = this.data.tempZones.join(', ');
    this.savePrefs();
    this.setData({ activeModal: '' });
    wx.showToast({ title: 'Quartiers enregistrés', icon: 'success' });
  },

  // --- PRÉFÉRENCES : BUDGET HABITUEL ----------------------------------------
  onOpenBudget() {
    setTabBarVisible(this, false);
    this.setData({
      activeModal: 'budget',
      tempBudget: this.prefs.budget || BUDGET_OPTIONS[2]
    });
  },

  onSelectBudget(e) {
    this.setData({ tempBudget: e.currentTarget.dataset.budget });
  },

  onSaveBudget() {
    setTabBarVisible(this, true);
    this.prefs.budget = this.data.tempBudget;
    this.savePrefs();
    this.setData({ activeModal: '' });
    wx.showToast({ title: 'Budget enregistré', icon: 'success' });
  },

  // --- AIDE & SUPPORT -------------------------------------------------------
  onOpenHelp() {
    setTabBarVisible(this, false);
    this.setData({ activeModal: 'help' });
  },

  onOpenSecurity() {
    setTabBarVisible(this, false);
    this.setData({ activeModal: 'security' });
  },

  onOpenSupport() {
    setTabBarVisible(this, false);
    this.setData({ activeModal: 'support' });
  },

  onCallSupport() {
    wx.makePhoneCall({
      phoneNumber: '1444',
      fail: () => {
        wx.showModal({
          title: 'Assistance Orange',
          content: 'Composez le 1444 depuis votre mobile Orange pour joindre le support Sama Loyer.',
          showCancel: false,
          confirmColor: '#C8235F'
        });
      }
    });
  },

  onCopySupportWhatsApp() {
    wx.setClipboardData({
      data: '+221 77 000 00 00',
      success: () => {
        wx.showToast({ title: 'Numéro WhatsApp copié', icon: 'success' });
      }
    });
  },

  onCloseModal() {
    setTabBarVisible(this, true);
    this.setData({ activeModal: '' });
  },

  // --- NOTIFICATIONS & LANGUE -----------------------------------------------
  onToggleNotif(e) {
    const id = e.currentTarget.dataset.id;
    this.prefs.notifs[id] = !this.prefs.notifs[id];
    this.savePrefs();
  },

  onSelectLang(e) {
    const lang = e.currentTarget.dataset.lang;
    if (lang === this.prefs.lang) return;
    this.prefs.lang = lang;
    this.savePrefs();
    wx.showToast({
      title: lang === 'wo' ? 'Kàllaama : Wolof' : 'Langue : Français',
      icon: 'none'
    });
  },

  onSoon() {
    wx.showToast({ title: 'Bientôt disponible', icon: 'none' });
  },

  onNavFavoris() {
    wx.navigateTo({ url: '/pages/client/favoris/favoris' });
  },

  onNavVisites() {
    wx.switchTab({ url: '/pages/client/visites/visites' });
  },

  onNavMessages() {
    wx.switchTab({ url: '/pages/client/messages/messages' });
  },

  onSwitchToBailleur() {
    storage.set(STORAGE_KEYS.USER_ROLE, 'bailleur');
    wx.reLaunch({ url: '/pages/bailleur/home/home' });
  },

  onAskLogout() {
    setTabBarVisible(this, false);
    this.setData({ confirmLogout: true });
  },

  onCancelLogout() {
    setTabBarVisible(this, true);
    this.setData({ confirmLogout: false });
  },

  onLogout() {
    setTabBarVisible(this, true);
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.TOKEN_EXPIRY);
    this.setData({ confirmLogout: false });
    wx.showToast({ title: 'Tu es déconnecté·e', icon: 'none' });
    wx.reLaunch({ url: '/pages/client/home/home' });
  },

  noop() {}
});
