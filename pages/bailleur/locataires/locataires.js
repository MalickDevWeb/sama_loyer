import {
  getStoredLocataires,
  confirmLocataireCashPayment,
  getAvailableBailleurAnnonces,
  addStoredLocataire
} from '../../../utils/helpers/store';
import { requireBailleurAccess } from '../../../utils/helpers/store';
import { COLORS } from '../../../utils/constants/theme';
import { saveToAlbum } from '../../../utils/helpers/qr-canvas';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';
import { backendAPI } from '../../../utils/apis/index.js';

// pages/bailleur/locataires/locataires.js
// Loyer mensuel lu dans « Studio · Pikine Rue 10 · 95 000 F »
function rentOf(l) {
  const last = String(l.property || '').split(' · ').pop();
  return Number(last.replace(/\D/g, '')) || 0;
}

function fmt(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Date du jour au format du sélecteur de date (AAAA-MM-JJ)
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 771234567 → « 77 123 45 67 »
function formatPhone(digits) {
  return String(digits || '').replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
}

// Chiffres d'un numéro saisi, sans l'indicatif : « +221 77 123 45 67 » → « 771234567 »
function phoneDigits(q) {
  return String(q || '').replace(/\D/g, '').replace(/^221(?=\d{9}$)/, '');
}

// Recherche du locataire vierge (un seul champ : nom OU numéro)
const EMPTY_TENANT_SEARCH = {
  tenantQuery: '',
  tenantResults: [], // { id, name, phone, phoneText, initials, contactOf }
  tenant: null, // personne choisie
  tenantNewPhone: '', // numéro complet sans compte : invitation par SMS, nom à saisir
  tenantNoMatch: false // nom tapé sans résultat
};

// Formulaire « Nouvelle location » vierge
function emptyNewLoc(annonces) {
  const first = annonces[0];
  return {
    annonceId: first ? first.id : '',
    name: '',
    phone: '',
    rent: first ? String(first.rent) : '',
    cautionMonths: 1,
    startDate: todayIso()
  };
}

const INITIAL_LOCATAIRES = [
  {
    id: 'cheikh',
    name: 'Cheikh Fall',
    initials: 'CF',
    avatarBg: '#5B45B2',
    property: 'Studio · Pikine Rue 10 · 95 000 F',
    status: 'a_confirmer',
    statusLabel: 'À confirmer',
    bannerType: 'warning',
    bannerText: "Cheikh dit avoir payé 95 000 F en espèces le 20 oct. L'as-tu bien reçu ?",
    cautionDetenue: '190 000 F',
    phone: '77 456 78 90'
  },
  {
    id: 'modou',
    name: 'Modou Ndiaye',
    initials: 'MN',
    avatarBg: '#9A6A15',
    property: 'Appartement F2 · Technopole · 85 000 F',
    status: 'en_retard',
    statusLabel: 'En retard',
    bannerType: 'danger',
    bannerText: 'Loyer attendu le 5 oct. · 17 jours de retard.',
    cautionDetenue: '170 000 F',
    phone: '78 123 45 67'
  },
  {
    id: 'ibou',
    name: 'Ibou Sarr',
    initials: 'IS',
    avatarBg: '#007C3D',
    property: 'Chambre · Thiaroye · 45 000 F',
    status: 'payes',
    statusLabel: 'Payé',
    bannerType: 'success',
    bannerText: 'Payé le 3 oct. · Max it (payé par son frère) · reçu envoyé',
    cautionDetenue: '45 000 F',
    phone: '77 333 44 55'
  },
  {
    id: 'famille_ba',
    name: 'Famille Ba',
    initials: 'FB',
    avatarBg: '#0F1E3D',
    property: 'Maison · Pikine Nord · 160 000 F',
    status: 'payes',
    statusLabel: 'Payé',
    bannerType: 'success',
    bannerText: 'Payé le 5 oct. · Max it · reçu envoyé',
    cautionDetenue: '320 000 F',
    phone: '77 555 66 77'
  }
];

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    uiState: 'content', // 'loading' | 'content' | 'error'
    statusBarHeight: 44,
    activeFilter: 'all', // 'all' | 'a_confirmer' | 'en_retard' | 'payes'

    kpi: {
      monthTitle: "Loyers d'octobre",
      montantRecu: '205 000 F',
      montantTotal: '385 000 F',
      nbPayes: 2,
      nbAConfirmer: 1,
      nbEnRetard: 1,
      totalCount: 4
    },

    locataires: INITIAL_LOCATAIRES,
    filteredLocataires: INITIAL_LOCATAIRES,
    filters: [],
    detail: null, // locataire affiché dans la fenêtre de détail

    // Fenêtre « Nouvelle location » (bouton +)
    newLocOpen: false,
    freeAnnonces: [], // annonces encore libres : { id, title, place, rent }
    newLoc: { annonceId: '', name: '', phone: '', rent: '', cautionMonths: 1, startDate: '' },
    newLocCautionText: '',
    ...EMPTY_TENANT_SEARCH,

    // Invitation prête : QR code + lien à partager ({ name, firstName, phoneText, link, isNewAccount })
    invite: null,

    problemes: [
      {
        id: 'prob1',
        title: 'Fuite d’eau dans la douche',
        sub: 'Ibou Sarr · Chambre Thiaroye · Signalé hier',
        statusLabel: 'Artisan dépêché',
        statusClass: 'status-artisan'
      },
      {
        id: 'prob2',
        title: 'Disjoncteur différentiel qui saute',
        sub: 'Famille Ba · Maison Pikine · Signalé le 12 oct.',
        statusLabel: 'Résolu',
        statusClass: 'status-resolu'
      }
    ]
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}

    this.loadLocataires();
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-locataires' });
    }
    this.loadLocataires();
  },

  async loadLocataires() {
    this.setData({ uiState: 'loading' });
    let locataires = [];
    try {
      locataires = await backendAPI.getBailleurLocataires();
    } catch (e) {
      locataires = getStoredLocataires();
    }
    this.setData({ locataires, uiState: 'content' }, () => {
      this.applyFilter(this.data.activeFilter);
    });
  },

  // Synthèse (montants réels) + compteurs des filtres, recalculés à chaque changement
  computeKpi() {
    const list = this.data.locataires;
    const count = (s) => list.filter(l => l.status === s).length;
    // Un locataire invité n'a pas encore signé : son loyer n'est pas encore attendu
    const total = list.filter(l => l.status !== 'invite').reduce((a, l) => a + rentOf(l), 0);
    const recu = list.filter(l => l.status === 'payes').reduce((a, l) => a + rentOf(l), 0);
    const nbPayes = count('payes');
    const nbAConfirmer = count('a_confirmer');
    const nbEnRetard = count('en_retard');
    return {
      kpi: Object.assign({}, this.data.kpi, {
        totalCount: list.length,
        nbPayes,
        nbAConfirmer,
        nbEnRetard,
        montantRecu: `${fmt(recu)} F`,
        montantTotal: `${fmt(total)} F`,
        pct: total ? Math.round((recu / total) * 100) : 0
      }),
      filters: [
        { id: 'all', label: 'Tous', count: list.length },
        { id: 'a_confirmer', label: 'À confirmer', count: nbAConfirmer },
        { id: 'en_retard', label: 'En retard', count: nbEnRetard },
        { id: 'payes', label: 'Payés', count: nbPayes }
      ]
    };
  },

  onSelectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.applyFilter(filter);
  },

  applyFilter(filter) {
    let list = this.data.locataires;
    if (filter === 'a_confirmer') {
      list = list.filter(l => l.status === 'a_confirmer');
    } else if (filter === 'en_retard') {
      list = list.filter(l => l.status === 'en_retard');
    } else if (filter === 'payes') {
      list = list.filter(l => l.status === 'payes');
    }
    // La fenêtre de détail suit les changements de statut (paiement confirmé, etc.)
    const detail = this.data.detail
      ? (this.data.locataires.find(l => l.id === this.data.detail.id) || null)
      : null;
    this.setData(Object.assign({ filteredLocataires: list, detail }, this.computeKpi()));
  },

  // Fenêtre de détail : toutes les infos et actions d'un locataire
  onOpenLocataire(e) {
    const id = e.currentTarget.dataset.id;
    const detail = this.data.locataires.find(l => l.id === id);
    if (detail) this.setData({ detail });
  },

  onCloseLocataire() {
    this.setData({ detail: null });
  },

  noop() {},

  // --- Nouvelle location (bouton +) ------------------------------------------
  onOpenNewLoc() {
    const freeAnnonces = getAvailableBailleurAnnonces();
    const newLoc = emptyNewLoc(freeAnnonces);
    this.setData(Object.assign(
      { newLocOpen: true, freeAnnonces, newLoc, newLocCautionText: this.cautionText(newLoc) },
      EMPTY_TENANT_SEARCH
    ));
  },

  onCloseNewLoc() {
    clearTimeout(this.searchTimer);
    this.setData({ newLocOpen: false });
  },

  onUnload() {
    clearTimeout(this.searchTimer);
  },

  // --- Recherche du locataire : un seul champ, nom OU numéro ------------------
  onTenantSearch(e) {
    const q = e.detail.value || '';
    this.setData({ tenantQuery: q });
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.runTenantSearch(q), 250);
  },

  async runTenantSearch(q) {
    const seq = (this.searchSeq = (this.searchSeq || 0) + 1);
    const results = await backendAPI.searchLocataires(q);
    if (seq !== this.searchSeq) return; // une frappe plus récente a déjà relancé la recherche

    const digits = phoneDigits(q);
    const isPhone = /^[\d\s+]+$/.test(q.trim()) && digits.length > 0;
    const fullPhone = isPhone && /^7\d{8}$/.test(digits);
    this.setData({
      tenantResults: results.map((u) => ({
        id: u.id,
        name: u.name,
        phone: u.phone,
        phoneText: formatPhone(u.phone),
        initials: u.name.split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join(''),
        contactOf: u.contactOf || 'Compte Max it'
      })),
      // Numéro complet sans compte : on l'invite quand même par SMS
      tenantNewPhone: fullPhone && results.length === 0 ? digits : '',
      tenantNoMatch: !isPhone && q.trim().length >= 2 && results.length === 0
    });
  },

  onPickTenant(e) {
    const u = this.data.tenantResults.find((x) => x.id === e.currentTarget.dataset.id);
    if (!u) return;
    this.updateNewLoc({ name: u.name, phone: u.phone });
    this.setData(Object.assign({}, EMPTY_TENANT_SEARCH, { tenant: u }));
  },

  // Numéro sans compte : le bailleur saisit seulement le nom
  onTenantNewName(e) {
    this.updateNewLoc({ name: e.detail.value || '', phone: this.data.tenantNewPhone });
  },

  onChangeTenant() {
    this.updateNewLoc({ name: '', phone: '' });
    this.setData(EMPTY_TENANT_SEARCH);
  },

  cautionText(newLoc) {
    const rent = Number(newLoc.rent) || 0;
    return `${fmt(rent * (newLoc.cautionMonths || 1))} F`;
  },

  updateNewLoc(patch) {
    const newLoc = Object.assign({}, this.data.newLoc, patch);
    this.setData({ newLoc, newLocCautionText: this.cautionText(newLoc) });
  },

  // Choisir le logement pré-remplit le loyer de l'annonce
  onPickNewLocAnnonce(e) {
    const a = this.data.freeAnnonces.find((x) => x.id === e.currentTarget.dataset.id);
    if (a) this.updateNewLoc({ annonceId: a.id, rent: String(a.rent) });
  },

  onNewLocInput(e) {
    const field = e.currentTarget.dataset.field;
    const value = String(e.detail.value || '').replace(/\D/g, '');
    this.updateNewLoc({ [field]: value });
    return value;
  },

  onNewLocCaution(e) {
    this.updateNewLoc({ cautionMonths: Number(e.currentTarget.dataset.months) || 1 });
  },

  onNewLocDate(e) {
    this.updateNewLoc({ startDate: e.detail.value });
  },

  onGoAjouterAnnonce() {
    this.setData({ newLocOpen: false });
    wx.navigateTo({ url: '/pages/bailleur/ajouter/ajouter' });
  },

  onSubmitNewLoc() {
    const l = this.data.newLoc;
    let error = '';
    if (!l.annonceId) error = 'Choisis le logement';
    else if (!/^7\d{8}$/.test(l.phone)) error = 'Cherche le locataire par son nom ou son numéro';
    else if (String(l.name).trim().length < 2) error = 'Indique le nom du locataire';
    else if (!(Number(l.rent) > 0)) error = 'Indique le loyer mensuel';
    if (error) {
      wx.showToast({ title: error, icon: 'none' });
      return;
    }
    // Numéro sans compte Max it : le lien et le QR sont le moyen principal de le faire entrer
    const isNewAccount = !this.data.tenant;
    wx.showLoading({ title: 'Création de l’invitation...' });
    setTimeout(() => {
      wx.hideLoading();
      const created = addStoredLocataire(l);
      this.setData({ newLocOpen: false, activeFilter: 'all' });
      this.loadLocataires();
      this.openInvite(created, isNewAccount);
    }, 600);
  },

  // Fenêtre « Invitation prête » : QR à scanner sur place, lien à envoyer
  openInvite(loc, isNewAccount) {
    if (!loc || !loc.inviteLink) {
      wx.showToast({ title: 'Invitation renvoyée par SMS', icon: 'success' });
      return;
    }
    this.setData({
      detail: null,
      invite: {
        name: loc.name,
        firstName: String(loc.name).split(/\s+/)[0],
        phoneText: loc.phone,
        link: loc.inviteLink,
        isNewAccount: !!isNewAccount
      }
    });
  },

  onCloseInvite() {
    this.setData({ invite: null });
  },

  onCopyInviteLink() {
    wx.setClipboardData({
      data: this.data.invite.link,
      success: () => wx.showToast({ title: 'Lien copié', icon: 'success' })
    });
  },

  // Message prêt à coller dans WhatsApp ou un SMS
  onShareInvite() {
    const inv = this.data.invite;
    wx.setClipboardData({
      data: `Bonjour ${inv.firstName}, voici ton invitation SAMA LOYER pour ta location : signe le contrat et paie ton entrée avec Max it ici ${inv.link}`,
      success: () => wx.showToast({ title: 'Message copié pour WhatsApp', icon: 'none' })
    });
  },

  onSaveInviteQr() {
    const qr = this.selectComponent('#invite-qr');
    if (!qr) return;
    qr.toTempFile()
      .then(saveToAlbum)
      .then(() => wx.showToast({ title: 'QR enregistré dans la galerie', icon: 'success' }))
      .catch(() => wx.showToast({ title: 'Enregistrement impossible', icon: 'none' }));
  },

  onRenvoyerInvitation() {
    const loc = this.data.detail;
    this.openInvite(loc, false);
  },

  // Actions Cheikh Fall (À confirmer)
  onConfirmerPaiementCheikh() {
    wx.showLoading({ title: 'Confirmation...' });
    setTimeout(() => {
      wx.hideLoading();
      confirmLocataireCashPayment('cheikh');
      this.loadLocataires();

      wx.showToast({
        title: 'Reçu officiel envoyé !',
        icon: 'success'
      });
    }, 600);
  },

  onRefuserPaiementCheikh() {
    wx.showModal({
      title: 'Espèces non reçues',
      content: 'Voulez-vous notifier Cheikh Fall que vous n’avez pas encore perçu les 95 000 F ?',
      confirmText: 'Notifier',
      cancelText: 'Annuler',
      confirmColor: COLORS.berry,
      success: (res) => {
        if (res.confirm) {
          wx.showToast({ title: 'Notification envoyée', icon: 'success' });
        }
      }
    });
  },

  // Actions Modou Ndiaye (En retard)
  onSendRappel() {
    wx.showActionSheet({
      itemList: [
        'Envoyer un SMS de rappel officiel',
        'Envoyer un message vocal en Wolof (automatique)',
        'Appeler directement Modou (+221 78 123 45 67)'
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.showToast({ title: 'SMS de rappel envoyé', icon: 'success' });
        } else if (res.tapIndex === 1) {
          wx.showToast({ title: 'Rappel vocal en Wolof envoyé', icon: 'success' });
        } else if (res.tapIndex === 2) {
          wx.makePhoneCall({ phoneNumber: '781234567' });
        }
      }
    });
  },

  onMarquerPayeModou() {
    wx.showLoading({ title: 'Validation...' });
    setTimeout(() => {
      wx.hideLoading();
      const updated = this.data.locataires.map(l => {
        if (l.id === 'modou') {
          return {
            ...l,
            status: 'payes',
            statusLabel: 'Payé',
            bannerType: 'success',
            bannerText: 'Payé le 22 oct. · Reçu certifié transmis'
          };
        }
        return l;
      });

      this.setData({ locataires: updated });
      this.applyFilter(this.data.activeFilter);

      wx.showToast({ title: 'Loyer validé !', icon: 'success' });
    }, 600);
  },

  // Écrire au locataire
  onEcrireLocataire(e) {
    const locataire = e.currentTarget.dataset.locataire;
    wx.showActionSheet({
      itemList: [
        `Appeler ${locataire.name} (${locataire.phone})`,
        `Ouvrir la conversation SAMA`,
        `Contacter via WhatsApp`
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: locataire.phone.replace(/\s+/g, '') });
        } else if (res.tapIndex === 1) {
          wx.navigateTo({
            url: `/pages/bailleur/conversation/conversation?id=${locataire.id}&name=${encodeURIComponent(locataire.name)}`
          });
        } else if (res.tapIndex === 2) {
          wx.setClipboardData({
            data: `Bonjour ${locataire.name}, message de votre bailleur Sama Loyer.`,
            success: () => {
              wx.showToast({ title: 'Copié pour WhatsApp', icon: 'success' });
            }
          });
        }
      }
    });
  }
});
