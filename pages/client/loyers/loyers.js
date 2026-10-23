import { RENT_MONTH, PROBLEM_CATEGORIES } from '../../../utils/mocks/loyers';
import { buildQuittance } from '../../../utils/mocks/contrats';
import { getStoredRentedHomes, recordRentPayment } from '../../../utils/helpers/store';
import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';

const MX_REDIRECT_MS = 1600;

function fmt(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function todayShort() {
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const d = new Date();
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// La barre d'onglets passerait au-dessus des fenêtres Max it et reçu : on la masque
function setTabBarVisible(visible) {
  try {
    if (visible) wx.showTabBar({ animation: true });
    else wx.hideTabBar({ animation: true });
  } catch (e) {}
}

Page({
  data: {
    statusBarHeight: 44,
    selectedId: '',
    subtitle: '',
    totalLeft: '',
    totalLeftLabel: '',
    paidCount: '',
    segments: [],
    homes: [],
    cur: {},
    history: [],
    historyOpen: false,
    mx: '', // '' | confirm | redirect | maxit | done
    mxLabel: '',
    receipt: null
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 44 });
    } catch (e) {}

    const rentedHomes = getStoredRentedHomes();
    this.paid = storage.get(STORAGE_KEYS.RENT_PAID, {}) || {};
    const initial = options && options.id && rentedHomes.some((h) => h.id === options.id)
      ? options.id
      : (rentedHomes[0] ? rentedHomes[0].id : '');
    this.setData({
      selectedId: initial,
      subtitle: `${rentedHomes.length} logement${rentedHomes.length > 1 ? 's' : ''} · paiements via Max it`
    }, () => this.refresh());
  },

  onShow() {
    setCustomTabBarActive(this, 'loyers');
    this.paid = storage.get(STORAGE_KEYS.RENT_PAID, {}) || {};
    this.refresh();
  },

  onUnload() {
    clearTimeout(this.mxTimer);
  },

  refresh() {
    const rentedHomes = getStoredRentedHomes();
    if (!rentedHomes || rentedHomes.length === 0) {
      this.setData({
        subtitle: '0 logement',
        totalLeft: '0 F',
        totalLeftLabel: 'Aucun logement loué',
        paidCount: '0 / 0',
        segments: [],
        homes: [],
        cur: {},
        history: []
      });
      return;
    }
    const paid = this.paid || {};
    const total = rentedHomes.reduce((a, h) => a + h.rent, 0);
    const left = rentedHomes.reduce((a, h) => a + (paid[h.id] ? 0 : h.rent), 0);
    const paidN = rentedHomes.filter((h) => paid[h.id]).length;
    const h = rentedHomes.find((x) => x.id === this.data.selectedId) || rentedHomes[0];
    const isPaid = !!paid[h.id];

    const history = (h.history || []).slice();
    if (isPaid && !history.some(r => r.id === 'r-nov')) {
      history.unshift({
        id: 'r-nov',
        label: `Loyer de ${RENT_MONTH}`,
        sub: `Payé le ${todayShort()} · Max it`,
        amount: h.rent,
        kind: 'rent',
        ref: `REC-NOV-2026-${String(h.id).toUpperCase()}`
      });
    }

    this.setData({
      subtitle: `${rentedHomes.length} logement${rentedHomes.length > 1 ? 's' : ''} · paiements via Max it`,
      totalLeft: left ? `${fmt(left)} F` : 'Tout est payé',
      totalLeftLabel: left ? `restent à payer sur ${fmt(total)} F` : `pour ${RENT_MONTH}`,
      paidCount: `${paidN} / ${rentedHomes.length} payé(s)`,
      segments: rentedHomes.map((x) => ({ id: x.id, weight: x.rent, paid: !!paid[x.id] })),
      homes: rentedHomes.map((x) => ({
        id: x.id,
        name: x.name,
        rent: fmt(x.rent),
        tint: x.tint,
        on: x.id === h.id,
        paid: !!paid[x.id]
      })),
      cur: {
        id: h.id,
        name: h.name,
        place: h.place,
        owner: h.owner,
        since: h.since,
        due: h.due,
        rentText: fmt(h.rent),
        depositText: fmt(h.deposit),
        depositInfo: h.depositInfo,
        contract: h.contract,
        paid: isPaid
      },
      mxLabel: `Loyer de ${RENT_MONTH} · ${h.name}`,
      history: history.map((r) => ({ ...r, amountText: `${fmt(r.amount)} F` }))
    });
  },

  currentHome() {
    const rentedHomes = getStoredRentedHomes();
    return rentedHomes.find((x) => x.id === this.data.selectedId) || rentedHomes[0] || {};
  },

  onSelectHome(e) {
    this.setData({ selectedId: e.currentTarget.dataset.id }, () => this.refresh());
  },

  // --- Paiement Max it (simulation) -----------------------------------------
  onOpenPay() {
    setTabBarVisible(false);
    this.setData({ mx: 'confirm' });
  },

  onMxGo() {
    this.setData({ mx: 'redirect' });
    clearTimeout(this.mxTimer);
    this.mxTimer = setTimeout(() => this.setData({ mx: 'maxit' }), MX_REDIRECT_MS);
  },

  onMxValidate() {
    const cur = this.currentHome();
    recordRentPayment(this.data.selectedId, cur.rent);
    this.paid = storage.get(STORAGE_KEYS.RENT_PAID, {}) || {};
    this.setData({ mx: 'done' });
    this.refresh();
  },

  onMxClose() {
    clearTimeout(this.mxTimer);
    this.setData({ mx: '' });
    setTabBarVisible(true);
  },

  // --- Reçus & Quittances ----------------------------------------------------
  onViewReceipt(e) {
    const r = this.data.history[Number(e.currentTarget.dataset.index) || 0];
    if (!r) return;
    setTabBarVisible(false);
    const cur = this.currentHome();
    const profile = storage.get(STORAGE_KEYS.USER_PROFILE, null) || {
      fullName: 'Awa Diop',
      phone: '+221 77 123 45 12'
    };
    const quittance = buildQuittance(cur, r, profile);
    this.setData({ receipt: r, quittance });
  },

  onCloseReceipt() {
    this.setData({ receipt: null, quittance: null });
    setTabBarVisible(true);
  },

  onDownloadReceipt() {
    wx.showLoading({ title: 'Génération PDF...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({ title: 'Quittance officielle téléchargée', icon: 'success' });
    }, 600);
  },

  onShareReceipt() {
    if (!this.data.quittance) return;
    wx.setClipboardData({
      data: `Quittance certifiée SAMA LOYER ${this.data.quittance.quittanceNo} · ${this.data.quittance.logementTitle} (${this.data.quittance.totalPayeText}) · Acquitté Orange Money`,
      success: () => wx.showToast({ title: 'Lien de quittance copié', icon: 'success' })
    });
  },

  // --- Contrat, bailleur, problème, départ --------------------------------------
  // Écran « Mon contrat » : contrat complet dynamique, articles, signatures
  onViewContrat() {
    wx.navigateTo({ url: `/pages/client/contrat/contrat?id=${this.data.selectedId}` });
  },

  onWriteBailleur() {
    wx.navigateTo({ url: `/pages/client/chat/chat?id=${this.currentHome().conversationId}` });
  },

  onReportProblem() {
    const h = this.currentHome();
    wx.showActionSheet({
      itemList: PROBLEM_CATEGORIES,
      success: (res) => {
        wx.showModal({
          title: 'Problème signalé',
          content: `« ${PROBLEM_CATEGORIES[res.tapIndex]} » a été envoyé à ${h.owner}. Tu seras prévenu·e de sa réponse dans Messages.`,
          showCancel: false,
          confirmColor: '#C8235F',
          confirmText: 'D’accord'
        });
      }
    });
  },

  onPrevenirDepart() {
    const h = this.currentHome();
    wx.showModal({
      title: 'Prévenir de ton départ ?',
      content: `${h.owner} recevra ton préavis d’un mois pour « ${h.name} ». Ta caution de ${fmt(h.deposit)} F te sera rendue après l’état des lieux.`,
      confirmText: 'Prévenir',
      confirmColor: '#C8235F',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) wx.showToast({ title: 'Préavis envoyé', icon: 'success' });
      }
    });
  },

  onToggleHistory() {
    this.setData({ historyOpen: !this.data.historyOpen });
  },

  noop() {}
});
