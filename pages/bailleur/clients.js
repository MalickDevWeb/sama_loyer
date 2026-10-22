Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    activeFilter: 'all', // 'all' | 'actif' | 'futur'
    clients: [
      {
        id: 'c1',
        initials: 'FK',
        avatarBg: '#C8235F',
        name: 'Fatou K.',
        phone: '+221 77 123 45 67',
        phoneRaw: '771234567',
        cniStatus: 'CNI vérifiée ✓',
        property: 'Chambre · Thiaroye',
        rent: '45 000 F',
        dateEntry: 'Depuis le 1er Août 2026',
        paymentStatus: 'paid',
        paymentLabel: 'À jour (Octobre)',
        paymentDetail: 'Payé le 3 oct. via Wave',
        receiptNumber: 'SL-2026-089',
        deposit: '45 000 F',
        isCurrent: true
      },
      {
        id: 'c2',
        initials: 'FB',
        avatarBg: '#0F1E3D',
        name: 'Famille Ba',
        phone: '+221 78 234 56 78',
        phoneRaw: '782345678',
        cniStatus: 'CNI vérifiée ✓',
        property: 'Maison · Pikine Nord',
        rent: '160 000 F',
        dateEntry: 'Depuis le 15 Septembre 2026',
        paymentStatus: 'paid',
        paymentLabel: 'À jour (Octobre)',
        paymentDetail: 'Payé le 5 oct. via Orange Money',
        receiptNumber: 'SL-2026-094',
        deposit: '320 000 F (2 mois)',
        isCurrent: true
      },
      {
        id: 'c3',
        initials: 'NL',
        avatarBg: '#D97706',
        name: 'Nouveau Locataire (Dossier validé)',
        phone: '+221 76 345 67 89',
        phoneRaw: '763456789',
        cniStatus: 'Dossier approuvé ✓',
        property: 'Appartement · Technopole',
        rent: '180 000 F',
        dateEntry: 'Prévue le 1er Nov. 2026',
        paymentStatus: 'upcoming',
        paymentLabel: 'Entrée le 1er nov.',
        paymentDetail: 'Caution versée · 1er loyer attendu le 1er nov.',
        receiptNumber: 'SL-2026-102',
        deposit: '180 000 F',
        isCurrent: false
      }
    ],
    filteredClients: [],
    selectedClient: null,
    showModal: false
  },

  onLoad() {
    try {
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const sys = wx.getSystemInfoSync();
      const statusBarHeight = sys.statusBarHeight || 44;
      let navBarHeight = 44;
      if (menuButton && menuButton.top) {
        navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
      }
      this.setData({
        statusBarHeight,
        navBarHeight: Math.max(navBarHeight, 44)
      });
    } catch (e) {}

    this.applyFilter('all');
  },

  onGoBack() {
    wx.navigateBack({
      fail: () => {
        wx.redirectTo({ url: '/pages/bailleur/home' });
      }
    });
  },

  onFilterSelect(e) {
    const f = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: f });
    this.applyFilter(f);
  },

  applyFilter(f) {
    let list = this.data.clients;
    if (f === 'actif') {
      list = list.filter(c => c.isCurrent);
    } else if (f === 'futur') {
      list = list.filter(c => !c.isCurrent);
    }
    this.setData({ filteredClients: list });
  },

  onCallClient(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {}
    });
  },

  onWhatsAppClient(e) {
    const client = e.currentTarget.dataset.client;
    const msg = `Bonjour ${client.name}, concernant votre location "${client.property}" chez Sama Logement.`;
    wx.setClipboardData({
      data: msg,
      success: () => {
        wx.showModal({
          title: 'WhatsApp 💬',
          content: `Le message pré-rempli pour ${client.name} (${client.phone}) a été copié. Vous pouvez ouvrir WhatsApp pour lui écrire.`,
          confirmText: 'Ouvrir WhatsApp',
          confirmColor: '#007C3D'
        });
      }
    });
  },

  onOpenQuittance(e) {
    const client = e.currentTarget.dataset.client;
    wx.showLoading({ title: 'Génération du reçu...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: `Quittance de Loyer #${client.receiptNumber}`,
        content: `Locataire : ${client.name}\nBien : ${client.property}\nMontant : ${client.rent}\nPériode : Octobre 2026\nStatut : PAYÉ ET CERTIFIÉ`,
        confirmText: 'Télécharger PDF',
        confirmColor: '#C8235F',
        cancelText: 'Fermer',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: 'PDF téléchargé', icon: 'success' });
          }
        }
      });
    }, 500);
  },

  onViewClientDetail(e) {
    const client = e.currentTarget.dataset.client;
    this.setData({
      selectedClient: client,
      showModal: true
    });
  },

  onCloseModal() {
    this.setData({
      showModal: false,
      selectedClient: null
    });
  },

  onSendReminder(e) {
    const client = this.data.selectedClient;
    wx.showToast({
      title: `Rappel envoyé à ${client.name}`,
      icon: 'success'
    });
    this.onCloseModal();
  }
});
