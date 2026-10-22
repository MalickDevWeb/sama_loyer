Page({
  data: {
    statusBarHeight: 44,
    activeTab: 'visites', // 'visites' | 'messages'
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
        avatarBg: '#4A5568',
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
      this.getTabBar().setData({ activeTab: 'b-demandes' });
    }
  },

  onSelectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (tab === 'messages') {
      wx.navigateTo({
        url: '/pages/messages/messages'
      });
    }
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

  onProposeHoraire(e) {
    wx.navigateTo({
      url: '/pages/messages/chat?id=AD'
    });
  }
});
