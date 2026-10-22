// pages/bailleur/locataires/locataires.js
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
    bannerText: 'Payé le 3 oct. · Wave (payé par son frère) · reçu envoyé',
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
    bannerText: 'Payé le 5 oct. · Orange Money · reçu envoyé',
    cautionDetenue: '320 000 F',
    phone: '77 555 66 77'
  }
];

Page({
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

    this.applyFilter('all');
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-locataires' });
    }
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
    this.setData({ filteredLocataires: list });
  },

  // Actions Cheikh Fall (À confirmer)
  onConfirmerPaiementCheikh() {
    wx.showLoading({ title: 'Confirmation...' });
    setTimeout(() => {
      wx.hideLoading();
      const updated = this.data.locataires.map(l => {
        if (l.id === 'cheikh') {
          return {
            ...l,
            status: 'payes',
            statusLabel: 'Payé',
            bannerType: 'success',
            bannerText: 'Payé le 20 oct. · Espèces (confirmé) · reçu envoyé'
          };
        }
        return l;
      });

      this.setData({
        locataires: updated,
        'kpi.nbPayes': 3,
        'kpi.nbAConfirmer': 0,
        'kpi.montantRecu': '300 000 F'
      });
      this.applyFilter(this.data.activeFilter);

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
      confirmColor: '#C8235F',
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

      this.setData({
        locataires: updated,
        'kpi.nbPayes': this.data.kpi.nbPayes + 1,
        'kpi.nbEnRetard': 0,
        'kpi.montantRecu': '290 000 F'
      });
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
          wx.navigateTo({ url: `/pages/client/chat/chat?id=${locataire.id}` });
        } else if (res.tapIndex === 2) {
          wx.setClipboardData({
            data: `Bonjour ${locataire.name}, message de votre bailleur Sama Logement.`,
            success: () => {
              wx.showToast({ title: 'Copié pour WhatsApp', icon: 'success' });
            }
          });
        }
      }
    });
  }
});
