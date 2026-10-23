import { getLogementById } from '../../../utils/mocks/logements';
import { VISIT_DAYS, VISIT_QUICK_MESSAGES } from '../../../utils/mocks/visites';
import { addVisite, cancelVisite } from '../../../utils/helpers/visites';

const PAGE_SIZE = 8;
const PAGE_COUNT = Math.ceil(VISIT_DAYS.length / PAGE_SIZE);
// Premier jour ouvert : sélectionné par défaut
const FIRST_OPEN_DAY = Math.max(0, VISIT_DAYS.findIndex((d) => d.slots.length));

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

Page({
  data: {
    statusBarHeight: 44,
    logement: null,
    page: 0,
    pageCount: PAGE_COUNT,
    day: FIRST_OPEN_DAY,
    slot: -1,
    days: [],
    slots: [],
    weekLabel: '',
    dayFull: '',
    hasSlot: false,
    choiceText: '',
    msgOpen: false,
    message: '',
    quick: VISIT_QUICK_MESSAGES,
    sent: false,
    selDow: '',
    selNum: '',
    selFull: ''
  },

  onLoad(options) {
    try {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    } catch (e) {}

    const l = getLogementById(options && options.id ? decodeURIComponent(options.id) : 'icotaf-01')
      || getLogementById('icotaf-01');
    this.setData({
      logement: {
        id: l.id,
        title: `${l.typeLabel} · ${l.place}`,
        price: `${formatMoney(l.price)} FCFA / mois`,
        owner: `${l.bailleurName} · répond en moins d'1 h`,
        ownerName: l.bailleurName,
        tint: l.tint,
        cover: l.cover
      }
    });
    this.refresh();
  },

  // Recalcule la grille de jours, les heures et le résumé
  refresh() {
    const { page, day, slot } = this.data;
    const from = page * PAGE_SIZE;
    const list = VISIT_DAYS.slice(from, from + PAGE_SIZE);
    const d = VISIT_DAYS[day];
    const hasSlot = slot >= 0 && slot < d.slots.length;
    const when = hasSlot ? `${d.full} à ${d.slots[slot]}` : '';
    const first = list[0];
    const last = list[list.length - 1];

    this.setData({
      weekLabel: `${first.dow} ${first.num} → ${last.dow} ${last.num}`,
      days: list.map((x, k) => {
        const n = x.slots.length;
        return {
          index: from + k,
          dow: x.dow,
          num: x.num,
          on: from + k === day,
          off: n === 0,
          count: n === 0 ? 'Fermé' : `${n} h`,
          aria: `${x.full}${n === 0 ? ', aucun horaire' : `, ${n} horaire(s)`}`
        };
      }),
      dayFull: d.full,
      slots: d.slots.map((label, i) => ({ label, on: i === slot })),
      hasSlot,
      choiceText: hasSlot ? when : 'Choisis un jour puis une heure',
      selDow: d.dow.toUpperCase().replace('.', ''),
      selNum: d.num,
      selFull: when
    });
  },

  onGoBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      const id = this.data.logement ? this.data.logement.id : '';
      wx.redirectTo({ url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(id)}` });
    }
  },

  onPrevWeek() {
    if (this.data.page > 0) this.setData({ page: this.data.page - 1 }, () => this.refresh());
  },

  onNextWeek() {
    if (this.data.page < PAGE_COUNT - 1) this.setData({ page: this.data.page + 1 }, () => this.refresh());
  },

  onPickDay(e) {
    const index = Number(e.currentTarget.dataset.index);
    if (!VISIT_DAYS[index] || !VISIT_DAYS[index].slots.length) return;
    this.setData({ day: index, slot: -1 }, () => this.refresh());
  },

  onPickSlot(e) {
    this.setData({ slot: Number(e.currentTarget.dataset.index) }, () => this.refresh());
  },

  onWriteOwner() {
    wx.navigateTo({ url: `/pages/client/chat/chat?logementId=${encodeURIComponent(this.data.logement.id)}` });
  },

  onShowMessage() {
    this.setData({ msgOpen: true });
  },

  onQuickMessage(e) {
    const q = e.currentTarget.dataset.text;
    const m = this.data.message;
    this.setData({ message: m ? `${m} ${q}.` : `${q}.` });
  },

  onInputMessage(e) {
    this.setData({ message: e.detail.value });
  },

  onRentRemote() {
    wx.navigateTo({ url: `/pages/client/louer-sans-visite/louer-sans-visite?id=${encodeURIComponent(this.data.logement.id)}` });
  },

  onSubmitDemande() {
    if (!this.data.hasSlot) return;
    const d = VISIT_DAYS[this.data.day];
    const label = `${d.dow} ${d.num} ${d.month} · ${d.slots[this.data.slot]}`;
    const visite = addVisite(this.data.logement.id, label, (this.data.message || '').trim());
    this.sentId = visite.id;
    this.setData({ sent: true });
  },

  // Changer l'horaire : on retire la demande envoyée et on revient au formulaire
  onEditSlot() {
    if (this.sentId) cancelVisite(this.sentId);
    this.sentId = '';
    this.setData({ sent: false });
  },

  onFollowVisits() {
    // Visites est un onglet : switchTab (redirectTo échoue sur un onglet)
    wx.switchTab({ url: '/pages/client/visites/visites' });
  }
});
