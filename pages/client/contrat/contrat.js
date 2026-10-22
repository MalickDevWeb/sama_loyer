import { CONTRAT_ACTUEL } from '../../../utils/mocks/contrats';

Page({
  data: {
    statusBarHeight: 20,
    contrat: CONTRAT_ACTUEL,
    open: { 0: true },
    allOpen: false,
    playing: false,
    toast: ''
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}
  },

  onUnload() {
    clearTimeout(this.toastTimer);
  },

  say(msg) {
    clearTimeout(this.toastTimer);
    this.setData({ toast: msg });
    this.toastTimer = setTimeout(() => this.setData({ toast: '' }), 2400);
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/client/loyers/loyers' }) });
  },

  onToggleAudio() {
    this.setData({ playing: !this.data.playing });
  },

  onToggleArticle(e) {
    const i = e.currentTarget.dataset.index;
    const open = { ...this.data.open, [i]: !this.data.open[i] };
    this.setData({ open, allOpen: this.data.contrat.articles.every((a, k) => open[k]) });
  },

  onToggleAll() {
    const open = {};
    if (!this.data.allOpen) this.data.contrat.articles.forEach((a, k) => { open[k] = true; });
    this.setData({ open, allOpen: !this.data.allOpen });
  },

  onShare() {
    wx.setClipboardData({
      data: `Contrat de location ${this.data.contrat.numero} · ${this.data.contrat.subtitle}`,
      success: () => this.say('Lien du contrat copié')
    });
  },

  onDownload() {
    this.say('Contrat téléchargé (PDF)');
  }
});
