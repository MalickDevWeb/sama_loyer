// pages/loyers/loyers.js
Page({
  data: {
    statusBarHeight: 44,
    selectedLogementId: 'studio', // 'studio' | 'ibou'
    
    // Liste des logements du locataire (multi-logements fidèle au design)
    logements: [
      {
        id: 'studio',
        shortTitle: 'Mon studio',
        fullTitle: 'Studio · Liberté 6',
        place: 'Liberté 6, Dakar',
        bailleurNom: 'Mme Diagne',
        depuis: 'depuis le 1er juin 2026',
        loyer: 80000,
        loyerFormatted: '80 000 F',
        moisActuel: 'Loyer de novembre',
        echeance: 'Avant le 5 novembre · dans 14 jours',
        isPaid: false,
        cautionMontant: '160 000 F',
        cautionDetail: '2 mois · versée le 28 mai',
        cautionBadge: 'Confirmée par le bailleur',
        contratStatut: 'Signé',
        contratDetail: "Jusqu'au 31 mai 2027 · préavis 1 mois",
        avatarBg: '#EEF2F7',
        bailleurPhone: '77 450 12 34',
        historique: [
          {
            id: 'h1',
            title: "Loyer d'octobre",
            date: 'Payé le 3 oct. · Wave',
            amount: '80 000 F',
            isEntry: false,
            ref: 'REC-OCT-2026-8812',
            txId: 'WV-SN-9938102'
          },
          {
            id: 'h2',
            title: 'Loyer de septembre',
            date: 'Payé le 4 sept. · Espèces, confirmé par Mme Diagne',
            amount: '80 000 F',
            isEntry: false,
            ref: 'REC-SEP-2026-7731',
            txId: 'ESP-SN-8829103'
          },
          {
            id: 'h3',
            title: "Loyer d'août",
            date: 'Payé le 2 août · Orange Money',
            amount: '80 000 F',
            isEntry: false,
            ref: 'REC-AOU-2026-6629',
            txId: 'OM-SN-7719204'
          },
          {
            id: 'h4',
            title: 'Loyer de juillet',
            date: 'Payé le 5 juil. · Wave',
            amount: '80 000 F',
            isEntry: false,
            ref: 'REC-JUI-2026-5510',
            txId: 'WV-SN-6609105'
          },
          {
            id: 'h5',
            title: 'Entrée : avance de juin',
            date: 'Payé le 28 mai · Wave',
            amount: '80 000 F',
            isEntry: true,
            ref: 'REC-ENT-2026-4401',
            txId: 'WV-SN-5599106'
          },
          {
            id: 'h6',
            title: 'Entrée : caution (2 mois)',
            date: 'Payé le 28 mai · Wave',
            amount: '160 000 F',
            isEntry: true,
            ref: 'CAU-ENT-2026-4402',
            txId: 'WV-SN-5599107'
          }
        ]
      },
      {
        id: 'ibou',
        shortTitle: 'Chambre de Ibou',
        fullTitle: 'Chambre de Ibou',
        place: 'Thiaroye, Pikine',
        bailleurNom: 'Fatou K.',
        depuis: 'Depuis le 1er octobre 2026',
        loyer: 45000,
        loyerFormatted: '45 000 F',
        moisActuel: 'Loyer de novembre',
        echeance: 'Avant le 10 novembre · dans 19 jours',
        isPaid: false,
        cautionMontant: '45 000 F',
        cautionDetail: '1 mois · versée le 25 sept.',
        cautionBadge: 'Confirmée',
        contratStatut: 'Signé',
        contratDetail: "Jusqu'au 30 sept. 2027 · préavis 1 mois",
        avatarBg: '#EAF5EE',
        bailleurPhone: '77 890 56 78',
        historique: [
          {
            id: 'h21',
            title: "Loyer d'octobre",
            date: 'Payé le 3 oct. · Wave',
            amount: '45 000 F',
            isEntry: false,
            ref: 'REC-OCT-2026-3310',
            txId: 'WV-SN-9988112'
          },
          {
            id: 'h22',
            title: 'Entrée : caution (1 mois)',
            date: 'Payé le 25 sept. · Orange Money',
            amount: '45 000 F',
            isEntry: true,
            ref: 'CAU-ENT-2026-3309',
            txId: 'OM-SN-8877113'
          }
        ]
      }
    ],

    // Logement actif affiché
    currentLogement: null,

    // Synthèse globale
    totalRestant: '125 000 F',
    totalGlobal: '125 000 F',
    nbPayes: 0,
    nbTotal: 2,

    // Modales
    showPayModal: false,
    selectedPaymentMethod: 'orange_money', // 'orange_money' | 'wave'
    showReceiptModal: false,
    activeReceipt: null,
    showContratModal: false,
    showProblemModal: false,
    showDepartModal: false,

    problemCategories: ['Plomberie / Fuite d’eau', 'Électricité / Disjoncteur', 'Serrurerie / Porte', 'Infiltration / Humidité', 'Autre urgence'],
    selectedProblem: 'Plomberie / Fuite d’eau'
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}

    // Initialiser sur le premier logement ou selon le paramètre
    const initialId = options && options.id ? options.id : 'studio';
    this.selectLogementById(initialId);
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'loyers' });
    }
  },

  selectLogementById(id) {
    const log = this.data.logements.find(l => l.id === id) || this.data.logements[0];
    this.setData({
      selectedLogementId: log.id,
      currentLogement: log
    });
    this.updateSynthese();
  },

  onSelectLogementTab(e) {
    const id = e.currentTarget.dataset.id;
    this.selectLogementById(id);
  },

  updateSynthese() {
    let restant = 0;
    let total = 0;
    let payes = 0;

    this.data.logements.forEach(l => {
      total += l.loyer;
      if (!l.isPaid) {
        restant += l.loyer;
      } else {
        payes++;
      }
    });

    const formatNumber = (num) => num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    this.setData({
      totalRestant: formatNumber(restant) + ' F',
      totalGlobal: formatNumber(total) + ' F',
      nbPayes: payes,
      nbTotal: this.data.logements.length
    });
  },

  // Clic sur "Payer mon loyer"
  onOpenPayModal() {
    this.setData({ showPayModal: true });
  },

  onClosePayModal() {
    this.setData({ showPayModal: false });
  },

  onSelectMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ selectedPaymentMethod: method });
  },

  onConfirmPayment() {
    const log = this.data.currentLogement;
    const methodTitle = this.data.selectedPaymentMethod === 'orange_money' ? 'Orange Money' : 'Wave';
    
    wx.showLoading({ title: `Connexion ${methodTitle}...` });

    setTimeout(() => {
      wx.hideLoading();

      // Mettre à jour le logement
      const updatedLogements = this.data.logements.map(item => {
        if (item.id === log.id) {
          const newReceipt = {
            id: 'h-' + Date.now(),
            title: item.moisActuel,
            date: `Payé le ${new Date().getDate()} nov. · ${methodTitle}`,
            amount: item.loyerFormatted,
            isEntry: false,
            ref: 'REC-NOV-2026-' + Math.floor(1000 + Math.random() * 9000),
            txId: (this.data.selectedPaymentMethod === 'orange_money' ? 'OM' : 'WV') + '-SN-' + Math.floor(1000000 + Math.random() * 9000000)
          };
          return {
            ...item,
            isPaid: true,
            historique: [newReceipt, ...item.historique]
          };
        }
        return item;
      });

      const updatedCurrent = updatedLogements.find(l => l.id === log.id);

      this.setData({
        logements: updatedLogements,
        currentLogement: updatedCurrent,
        showPayModal: false
      });

      this.updateSynthese();

      wx.showToast({
        title: 'Loyer réglé avec succès !',
        icon: 'success',
        duration: 2000
      });
    }, 900);
  },

  // Consultation de quittance officielle
  onViewReceipt(e) {
    const receipt = e.currentTarget.dataset.receipt;
    this.setData({
      activeReceipt: receipt,
      showReceiptModal: true
    });
  },

  onCloseReceiptModal() {
    this.setData({ showReceiptModal: false });
  },

  onDownloadPDF() {
    wx.showLoading({ title: 'Génération du PDF...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: 'Quittance téléchargée',
        icon: 'success'
      });
    }, 600);
  },

  // Consultation du contrat de bail
  onViewContrat() {
    this.setData({ showContratModal: true });
  },

  onCloseContratModal() {
    this.setData({ showContratModal: false });
  },

  // 3 Boutons d'action
  onWriteBailleur() {
    const log = this.data.currentLogement;
    wx.showActionSheet({
      itemList: [
        `Appeler ${log.bailleurNom} (${log.bailleurPhone})`,
        `Discuter sur SAMA Messagerie`,
        `Envoyer un message WhatsApp`
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: log.bailleurPhone.replace(/\s+/g, '') });
        } else if (res.tapIndex === 1) {
          wx.navigateTo({ url: '/pages/client/chat/chat?id=bailleur' });
        } else if (res.tapIndex === 2) {
          wx.setClipboardData({
            data: `Bonjour ${log.bailleurNom}, je vous écris concernant mon logement "${log.fullTitle}".`,
            success: () => {
              wx.showToast({ title: 'Message copié', icon: 'success' });
            }
          });
        }
      }
    });
  },

  onReportProblem() {
    this.setData({ showProblemModal: true });
  },

  onCloseProblemModal() {
    this.setData({ showProblemModal: false });
  },

  onSelectProblemCategory(e) {
    this.setData({ selectedProblem: e.currentTarget.dataset.cat });
  },

  onSubmitProblem() {
    wx.showLoading({ title: 'Signalement...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showProblemModal: false });
      wx.showModal({
        title: 'Problème signalé ! 🔧',
        content: `Votre signalement "${this.data.selectedProblem}" a été transmis à ${this.data.currentLogement.bailleurNom}. Un artisan partenaire agréé Sama Logement pourra être dépêché sous 24h.`,
        showCancel: false,
        confirmColor: '#C8235F',
        confirmText: 'D’accord'
      });
    }, 600);
  },

  onPrevenirDepart() {
    this.setData({ showDepartModal: true });
  },

  onCloseDepartModal() {
    this.setData({ showDepartModal: false });
  },

  onConfirmDepart() {
    wx.showLoading({ title: 'Enregistrement du préavis...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showDepartModal: false });
      wx.showModal({
        title: 'Préavis envoyé 🚪',
        content: `Votre préavis légal d'un mois a été notifié à ${this.data.currentLogement.bailleurNom}.\n\nL'état des lieux de sortie est programmé. Votre caution de ${this.data.currentLogement.cautionMontant} vous sera restituée conformément à la loi sénégalaise.`,
        showCancel: false,
        confirmColor: '#0F1E3D',
        confirmText: 'Compris'
      });
    }, 700);
  }
});
