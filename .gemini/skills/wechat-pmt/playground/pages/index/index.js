import { getLang, setLang, onLangChange } from '../../utils/i18n/manager';
import { Outbox } from '../../utils/offline/outbox';
import { Bus } from '../../utils/bus/index';

Page({
  data: {
    lang: 'fr',
    uiState: 'success', // 'loading' | 'success' | 'empty'
    pendingOutboxCount: 0,
    services: [
      { id: 1, name: 'Pass Illimix 4G', price: '1 000 FCFA', icon: '📶' },
      { id: 2, name: 'Transfert d’argent', price: '0 Frais', icon: '💸' },
      { id: 3, name: 'Paiement Senelec / Woyofal', price: 'Immédiat', icon: '⚡' }
    ]
  },

  onLoad() {
    this.setData({
      lang: getLang(),
      pendingOutboxCount: Outbox.getPendingCount()
    });

    // Écoute du changement de langue instantané
    this._unsubLang = onLangChange((newLang) => {
      this.setData({ lang: newLang });
    });

    // Écoute du compteur Outbox
    this._unsubOutbox = Bus.on('OUTBOX_COUNT_CHANGED', (count) => {
      this.setData({ pendingOutboxCount: count });
    });
  },

  changeLanguage(e) {
    const selected = e.currentTarget.dataset.lang;
    setLang(selected);
  },

  setUiState(e) {
    const state = e.currentTarget.dataset.state;
    this.setData({ uiState: state });
  },

  testOfflineOutbox() {
    const payload = {
      action: 'FEEDBACK_CLIENT',
      timestamp: new Date().toISOString()
    };
    Outbox.enqueue('DEMO_FEEDBACK', payload);

    wx.showToast({
      title: 'Action enfilée dans l’Outbox locale !',
      icon: 'none',
      duration: 2000
    });
  },

  flushOutboxNow() {
    Outbox.flush();
    wx.showToast({
      title: 'Synchronisation Outbox lancée...',
      icon: 'loading',
      duration: 1000
    });
  },

  onUnload() {
    if (this._unsubLang) this._unsubLang();
    if (this._unsubOutbox) this._unsubOutbox();
  }
});

