import { getContratForHome, CONTRAT_ACTUEL } from '../../../utils/mocks/contrats';
import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 20,
    contrat: CONTRAT_ACTUEL,
    homeId: '',
    open: { 0: true, 1: true },
    allOpen: false,
    playing: false,
    showSignModal: false,
    signedSuccess: false,
    toast: ''
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    const homeId = options && options.id ? options.id : null;
    const profile = storage.get(STORAGE_KEYS.USER_PROFILE, null) || {
      fullName: 'Awa Diop',
      phone: '+221 77 123 45 12'
    };

    const contrat = getContratForHome(homeId, profile);
    this.setData({ contrat, homeId });
  },

  onUnload() {
    clearTimeout(this.toastTimer);
    clearTimeout(this.audioTimer);
  },

  say(msg) {
    clearTimeout(this.toastTimer);
    this.setData({ toast: msg });
    this.toastTimer = setTimeout(() => this.setData({ toast: '' }), 2400);
  },

  onBack() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/client/loyers/loyers' })
    });
  },

  onToggleAudio() {
    const isPlaying = !this.data.playing;
    this.setData({ playing: isPlaying });
    if (isPlaying) {
      this.say('Lecture audio en Wolof (Max it Voice)');
      clearTimeout(this.audioTimer);
      this.audioTimer = setTimeout(() => {
        this.setData({ playing: false });
      }, 7000);
    }
  },

  onToggleArticle(e) {
    const i = e.currentTarget.dataset.index;
    const open = { ...this.data.open, [i]: !this.data.open[i] };
    const all = (this.data.contrat.articles || []).every((a, k) => open[k]);
    this.setData({ open, allOpen: all });
  },

  onToggleAll() {
    const open = {};
    const nextState = !this.data.allOpen;
    if (nextState) {
      (this.data.contrat.articles || []).forEach((a, k) => { open[k] = true; });
    }
    this.setData({ open, allOpen: nextState });
  },

  onOpenSign() {
    this.setData({ showSignModal: true });
  },

  onCloseSign() {
    this.setData({ showSignModal: false });
  },

  onConfirmSign() {
    this.setData({
      showSignModal: false,
      signedSuccess: true,
      'contrat.signedLabel': 'Signé électroniquement via Orange Max it · Actif'
    });
    wx.showToast({
      title: 'Bail certifié & signé !',
      icon: 'success'
    });
  },

  onShare() {
    wx.setClipboardData({
      data: `Bail numérique SAMA LOYER ${this.data.contrat.numero} · ${this.data.contrat.subtitle} (Certifié Max it)`,
      success: () => this.say('Lien du bail copié dans le presse-papier')
    });
  },

  onDownload() {
    wx.showLoading({ title: 'Génération PDF...' });
    setTimeout(() => {
      wx.hideLoading();
      this.say('Contrat officiel téléchargé (PDF certifié)');
    }, 600);
  }
});
