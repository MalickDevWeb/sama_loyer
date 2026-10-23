import { getStoredLocataires, confirmLocataireCashPayment } from '../../../utils/helpers/store';
import { requireBailleurAccess } from '../../../utils/helpers/store';
import { COLORS } from '../../../utils/constants/theme';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';

// pages/bailleur/locataires/locataires.js
// Loyer mensuel lu dans « Studio · Pikine Rue 10 · 95 000 F »
function rentOf(l) {
  const last = String(l.property || '').split(' · ').pop();
  return Number(last.replace(/\D/g, '')) || 0;
}

function fmt(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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

  loadLocataires() {
    this.setData({ locataires: getStoredLocataires() }, () => {
      this.applyFilter(this.data.activeFilter);
    });
  },

  // Synthèse (montants réels) + compteurs des filtres, recalculés à chaque changement
  computeKpi() {
    const list = this.data.locataires;
    const count = (s) => list.filter(l => l.status === s).length;
    const total = list.reduce((a, l) => a + rentOf(l), 0);
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
