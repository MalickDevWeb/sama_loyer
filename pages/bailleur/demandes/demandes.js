Page({
  data: {
    statusBarHeight: 44,
    activeTab: 'visites', // 'visites' | 'messages' | 'locataires'
    demandes: [
      {
        id: 'd1',
        initials: 'AD',
        avatarBg: '#0F1E3D',
        name: 'Awa Diop',
        property: 'Chambre salon · Icotaf',
        status: 'pending',
        statusLabel: 'À répondre',
        dateLabel: 'Samedi 24 octobre · 16 h',
        message: '« Je travaille à Pikine, je peux venir à pied. »',
        isPending: true
      },
      {
        id: 'd2',
        initials: 'CF',
        avatarBg: '#4743A0',
        name: 'Cheikh Fall',
        property: 'Studio meublé · Pikine Rue 10',
        status: 'accepted',
        statusLabel: 'Acceptée',
        dateLabel: 'Lundi 26 octobre · 18 h',
        notice: "Visite acceptée. Le locataire a reçu l'adresse exacte par SMS.",
        isPending: false
      },
      {
        id: 'd3',
        initials: 'MS',
        avatarBg: '#C8235F',
        name: 'Mariama Sow',
        property: 'Chambre salon · Icotaf',
        status: 'accepted',
        statusLabel: 'Acceptée',
        dateLabel: 'Vendredi 23 octobre · 17 h',
        message: '« Je viendrai avec ma sœur. »',
        notice: "Visite acceptée. Le locataire a reçu l'adresse exacte par SMS.",
        isPending: false
      }
    ],
    messagesList: [
      {
        id: 'AD',
        initials: 'AD',
        avatarBg: '#0F1E3D',
        name: 'Awa Diop',
        property: 'Chambre salon · Icotaf · 65 000 F',
        lastMessage: 'Je vous enverrai l’adresse exacte vendredi.',
        time: '10:43',
        unread: 2,
        event: 'Visite demandée · sam. 24, 16 h'
      },
      {
        id: 'FK',
        initials: 'FK',
        avatarBg: '#C8235F',
        name: 'Fatou K.',
        property: 'Chambre · Thiaroye · 45 000 F',
        lastMessage: 'Merci pour la quittance de loyer reçue !',
        time: 'Hier',
        unread: 0,
        event: 'Locataire active'
      }
    ],
    locataires: [
      {
        id: 'c1',
        initials: 'FK',
        avatarBg: '#C8235F',
        name: 'Fatou K.',
        property: 'Chambre · Thiaroye',
        rent: '45 000 F',
        phone: '77 123 45 67',
        phoneRaw: '771234567',
        statusLabel: 'Loyer payé (Octobre)',
        statusClass: 'badge-green',
        paymentDetail: 'Payé le 3 oct. via Wave'
      },
      {
        id: 'c2',
        initials: 'FB',
        avatarBg: '#0F1E3D',
        name: 'Famille Ba',
        property: 'Maison · Pikine Nord',
        rent: '160 000 F',
        phone: '78 234 56 78',
        phoneRaw: '782345678',
        statusLabel: 'Loyer payé (Octobre)',
        statusClass: 'badge-green',
        paymentDetail: 'Payé le 5 oct. via Orange Money'
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
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-messages' });
    }
  },

  onSelectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onAccept(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.demandes.map(d => {
      if (d.id === id) {
        return {
          ...d,
          isPending: false,
          status: 'accepted',
          statusLabel: 'Acceptée',
          notice: "Visite acceptée. Le locataire a reçu l'adresse exacte par SMS."
        };
      }
      return d;
    });

    this.setData({ demandes: updated });
    wx.showToast({
      title: 'Visite acceptée !',
      icon: 'success'
    });
  },

  onRefuse(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Refuser cette demande ?',
      content: 'Le locataire sera notifié avec bienveillance.',
      confirmText: 'Refuser',
      confirmColor: '#C8235F',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.demandes.filter(d => d.id !== id);
          this.setData({ demandes: updated });
          wx.showToast({ title: 'Demande refusée' });
        }
      }
    });
  },

  onOpenHoraires() {
    wx.navigateTo({ url: '/pages/bailleur/horaires/horaires' });
  },

  onProposeHoraire(e) {
    wx.navigateTo({
      url: '/pages/bailleur/conversation/conversation?id=AD'
    });
  },

  onOpenChat(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/bailleur/conversation/conversation?id=${id}&name=${encodeURIComponent(name || '')}`
    });
  },

  onCallClient(e) {
    const phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: () => {}
    });
  },

  onWhatsAppClient(e) {
    const name = e.currentTarget.dataset.name;
    const phone = e.currentTarget.dataset.phone;
    wx.setClipboardData({
      data: `Bonjour ${name}, message de votre bailleur Sama Loyer.`,
      success: () => {
        wx.showModal({
          title: 'WhatsApp 💬',
          content: `Le message pré-rempli pour ${name} (${phone}) a été copié.`,
          confirmText: 'OK',
          showCancel: false
        });
      }
    });
  },

  onGoClientsPage() {
    wx.navigateTo({
      url: '/pages/bailleur/locataires/locataires'
    });
  }
});
