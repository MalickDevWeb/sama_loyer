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
  lang: 'fr'
};

function loadPrefs() {
  const saved = storage.get(STORAGE_KEYS.PROFILE_PREFS, null);
  if (!saved || typeof saved !== 'object') return JSON.parse(JSON.stringify(DEFAULT_PREFS));
  return {
    notifs: Object.assign({}, DEFAULT_PREFS.notifs, saved.notifs),
    lang: saved.lang || DEFAULT_PREFS.lang
  };
}

Page({
  data: {
    statusBarHeight: 44,
    userName: 'Awa Diop',
    userPhone: '+221 77 ••• •• 12',
    userInitials: 'AD',
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
    confirmLogout: false
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 44 });
    } catch (e) {}
    this.prefs = loadPrefs();
    this.renderPrefs();
  },

  onShow() {
    setCustomTabBarActive(this, 'profile');
    // Les compteurs changent sur les autres pages
    this.setData({
      stats: {
        favoris: getFavoriteIds().length,
        visites: getVisites().length,
        conversations: getConversations().length
      }
    });
  },

  renderPrefs() {
    this.setData({
      lang: this.prefs.lang,
      notifs: NOTIFS.map((n) => ({ ...n, on: !!this.prefs.notifs[n.id] }))
    });
  },

  savePrefs() {
    storage.set(STORAGE_KEYS.PROFILE_PREFS, this.prefs);
    this.renderPrefs();
  },

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
    // Favoris n'est pas un onglet : navigateTo (switchTab échouerait)
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
    this.setData({ confirmLogout: true });
  },

  onCancelLogout() {
    this.setData({ confirmLogout: false });
  },

  // Favoris, visites et messages restent en local ; seule la session est effacée
  onLogout() {
    storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storage.remove(STORAGE_KEYS.TOKEN_EXPIRY);
    this.setData({ confirmLogout: false });
    wx.showToast({ title: 'Tu es déconnecté·e', icon: 'none' });
    wx.reLaunch({ url: '/pages/client/home/home' });
  },

  noop() {}
});
