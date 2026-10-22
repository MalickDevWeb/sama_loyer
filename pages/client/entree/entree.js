import { getLogementById } from '../../../utils/mocks/logements';
import { buildContratEntree, buildQuittance } from '../../../utils/mocks/contrats';
import { addStoredRentedHome } from '../../../utils/helpers/store';
import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';

function fmt(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function digits(s) {
  const d = String(s || '').replace(/\D/g, '');
  return d ? Number(d) : 0;
}

Page({
  data: {
    statusBarHeight: 20,
    // Logement et montants
    logement: { id: '', title: '', place: '', bailleur: '', tint: '' },
    loyerText: '',
    avanceText: '',
    cautionText: '',
    cautionSub: '',
    fraisText: '',
    totalText: '',
    minText: '',
    presets: [],
    contrat: { numero: '', subtitle: '', bailleur: '', keys: [], articles: [] },
    // Étapes : 1 récapitulatif · 2 contrat · 3 paiement
    step: 1,
    agree: false,
    signed: false,
    // Contrat complet
    contractOpen: false,
    open: { 0: true },
    playing: false,
    // Paiement
    mode: 'full',
    amount: 0,
    other: '',
    badAmount: false,
    chosen: 0,
    chosenText: '',
    restBeforeText: '',
    nextText: '',
    nextEnabled: true,
    // Max it (simulation) : null | confirm | redirect | maxit
    mx: null,
    mxAmountText: '',
    mxLabel: '',
    // Terminé
    paid: 0,
    done: false,
    hasRest: false,
    doneTitle: '',
    doneText: '',
    paidText: '',
    restText: '',
    progress: 0,
    receipts: [],
    toast: ''
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    const id = options && options.id ? decodeURIComponent(options.id) : 'icotaf-01';
    const l = getLogementById(id) || getLogementById('icotaf-01');

    this.total = (l.avance || 0) + (l.caution || 0) + (l.frais || 0);
    this.min = l.avance || l.price;
    this.firstPay = 0;
    this.payNow = 0;

    this.setData({
      logement: { id: l.id, title: l.title, place: l.place, bailleur: l.bailleurName, tint: l.tint },
      loyerText: `${fmt(l.price)} F`,
      avanceText: `${fmt(l.avance)} F`,
      cautionText: `${fmt(l.caution)} F`,
      cautionSub: `${Math.round(l.caution / l.price)} mois · rendue à ton départ`,
      fraisText: l.frais ? `${fmt(l.frais)} F` : 'Aucun',
      totalText: `${fmt(this.total)} F`,
      minText: `${fmt(this.min)} F`,
      presets: [
        { value: this.min, label: fmt(this.min), sub: 'L’avance' },
        { value: Math.round(((this.min + l.caution) / 2) / 5000) * 5000, label: '', sub: 'Une partie' },
        { value: l.caution, label: fmt(l.caution), sub: 'La caution' }
      ].map((p) => ({ ...p, label: p.label || fmt(p.value) })),
      contrat: buildContratEntree(l),
      amount: this.min
    });
    this.refresh();
  },

  onUnload() {
    clearTimeout(this.mxTimer);
    clearTimeout(this.signTimer);
    clearTimeout(this.toastTimer);
  },

  /** Recalcule tout ce qui dépend du choix de paiement et de l'étape */
  refresh() {
    const { step, agree, mode, amount, other, paid } = this.data;
    const custom = digits(other);
    const chosen = mode === 'full' ? this.total : (custom || amount);
    const badAmount = mode === 'part' && custom > 0 && (custom < this.min || custom >= this.total);
    const ok = step === 1 || (step === 2 && agree) || (step === 3 && !badAmount);

    let nextText = 'C’est clair, continuer';
    if (step === 2) nextText = agree ? 'Continuer' : 'Accepte le contrat pour continuer';
    if (step === 3) nextText = badAmount ? 'Montant non valide' : `Payer ${fmt(chosen)} F avec Max it`;

    const done = paid > 0;
    const rest = this.total - paid;
    let receipts = [];
    if (done) {
      if (paid >= this.total && this.firstPay === this.total) {
        receipts = [
          { label: 'Avance du 1er mois', sub: `${fmt(this.min)} F · Max it` },
          { label: `Caution`, sub: `${fmt(this.total - this.min)} F · Max it` }
        ];
      } else {
        receipts.push({ label: 'Acompte d’entrée', sub: `${fmt(this.firstPay)} F · Max it` });
        if (paid >= this.total) receipts.push({ label: 'Solde d’entrée', sub: `${fmt(this.total - this.firstPay)} F · Max it` });
      }
    }

    const bailleur = this.data.logement.bailleur;
    this.setData({
      chosen,
      chosenText: `${fmt(chosen)} F`,
      badAmount,
      nextEnabled: ok,
      nextText,
      restBeforeText: `${fmt(this.total - chosen)} F`,
      done,
      hasRest: done && rest > 0,
      doneTitle: rest > 0 ? 'Logement réservé !' : 'Bienvenue chez toi !',
      doneText: rest > 0
        ? 'Le logement est bloqué pour toi. Paie le reste avant le 1er novembre pour recevoir les clés.'
        : `Tout est payé. ${bailleur} t’attend le 1er novembre.`,
      paidText: `${fmt(paid)} F`,
      restText: `${fmt(rest)} F`,
      progress: Math.round((paid / this.total) * 100),
      receipts
    });
  },

  say(msg) {
    clearTimeout(this.toastTimer);
    this.setData({ toast: msg });
    this.toastTimer = setTimeout(() => this.setData({ toast: '' }), 2400);
  },

  /* --- Navigation -------------------------------------------------------- */
  onBackHeader() {
    wx.navigateBack({ fail: () => wx.switchTab({ url: '/pages/client/home/home' }) });
  },

  onPrevStep() {
    this.setData({ step: this.data.step - 1 }, () => this.refresh());
  },

  onNext() {
    if (!this.data.nextEnabled) return;
    if (this.data.step < 3) {
      this.setData({ step: this.data.step + 1 }, () => this.refresh());
      return;
    }
    this.openMaxit(this.data.chosen);
  },

  onSeeLoyer() {
    wx.switchTab({ url: '/pages/client/loyers/loyers' });
  },

  /* --- Étape 2 : contrat ------------------------------------------------- */
  onToggleAgree() {
    this.setData({ agree: !this.data.agree }, () => this.refresh());
  },

  onOpenContract() {
    this.setData({ contractOpen: true });
  },

  onCloseContract() {
    this.setData({ contractOpen: false, playing: false });
  },

  onToggleArticle(e) {
    const i = e.currentTarget.dataset.index;
    this.setData({ open: { ...this.data.open, [i]: !this.data.open[i] } });
  },

  onToggleAudio() {
    this.setData({ playing: !this.data.playing });
  },

  onDownloadContract() {
    this.say('Contrat téléchargé (PDF)');
  },

  onSignContract() {
    this.setData({ signed: true, agree: true }, () => this.refresh());
    this.signTimer = setTimeout(() => {
      this.setData({ contractOpen: false, playing: false });
      this.say('Contrat signé. Tu peux continuer.');
    }, 700);
  },

  /* --- Étape 3 : paiement ------------------------------------------------ */
  onPickFull() {
    this.setData({ mode: 'full' }, () => this.refresh());
  },

  onPickPart() {
    this.setData({ mode: 'part' }, () => this.refresh());
  },

  onPickAmount(e) {
    this.setData({ amount: Number(e.currentTarget.dataset.value), other: '' }, () => this.refresh());
  },

  onOtherInput(e) {
    const v = digits(e.detail.value);
    this.setData({ other: v ? fmt(v) : '' }, () => this.refresh());
    return v ? fmt(v) : '';
  },

  /* --- Max it (simulation) ----------------------------------------------- */
  openMaxit(amount) {
    this.payNow = amount;
    let label = 'Acompte d’entrée';
    if (this.data.paid > 0) label = 'Solde d’entrée';
    else if (amount >= this.total) label = 'Avance + caution';
    this.setData({
      mx: 'confirm',
      mxAmountText: fmt(amount),
      mxLabel: `${label} · ${this.data.logement.place.split(',')[0]}`
    });
  },

  onPayRest() {
    this.openMaxit(this.total - this.data.paid);
  },

  onMxGo() {
    this.setData({ mx: 'redirect' });
    this.mxTimer = setTimeout(() => this.setData({ mx: 'maxit' }), 1600);
  },

  onMxValidate() {
    if (!this.firstPay) this.firstPay = this.payNow;
    const newPaid = this.data.paid + this.payNow;
    this.setData({ mx: null, paid: newPaid }, () => {
      this.refresh();
      try {
        const l = this.data.logement;
        const fullL = getLogementById(l.id) || l;
        const profile = storage.get(STORAGE_KEYS.USER_PROFILE, null) || {};
        addStoredRentedHome(fullL, newPaid, {
          locataireName: profile.fullName || 'Awa Diop',
          phone: profile.phone || '+221 77 123 45 12'
        });
      } catch (e) {
        console.warn('[Entree] addStoredRentedHome error:', e);
      }
    });
  },

  onViewReceipt(e) {
    const idx = Number(e.currentTarget.dataset.index) || 0;
    const r = this.data.receipts[idx];
    if (!r) return;
    const profile = storage.get(STORAGE_KEYS.USER_PROFILE, null) || {
      fullName: 'Awa Diop',
      phone: '+221 77 123 45 12'
    };
    const l = this.data.logement;
    const quittance = buildQuittance(
      { id: l.id, name: l.title, place: l.place, owner: l.bailleur, rent: this.total },
      { label: r.label, amount: this.payNow || this.total, ref: `REC-ENTREE-${Math.floor(1000 + Math.random() * 9000)}` },
      profile
    );
    this.setData({ quittance });
  },

  onCloseReceipt() {
    this.setData({ quittance: null });
  },

  onDownloadReceipt() {
    wx.showLoading({ title: 'Génération PDF...' });
    setTimeout(() => {
      wx.hideLoading();
      this.say('Quittance officielle d’entrée téléchargée');
    }, 600);
  },

  onMxClose() {
    clearTimeout(this.mxTimer);
    this.setData({ mx: null });
  },

  noop() {}
});
