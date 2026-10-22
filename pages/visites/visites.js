Page({
  data: {
    statusBarHeight: 44,
    activeFilter: 'all', // all | pending | accepted | rejected
    visitesList: [
      {
        id: 'v1',
        status: 'accepted',
        statusLabel: 'Acceptée',
        statusClass: 'status-accepted',
        dateLabel: 'Sam. 24 oct. · 16 h',
        title: 'Chambre salon avec douche intérieure',
        place: 'Icotaf, Pikine · 65 000 F',
        bailleur: 'Bailleur : Moussa D.',
        note: "Adresse : Icotaf, à côté de la pharmacie du marché. Moussa t’attendra devant le portail bleu.",
        canNavigate: true,
        canMessage: true,
      },
      {
        id: 'v2',
        status: 'pending',
        statusLabel: 'En attente',
        statusClass: 'status-pending',
        dateLabel: 'Lun. 26 oct. · 18 h',
        title: 'Studio meublé, entrée indépendante',
        place: 'Pikine Rue 10 · 95 000 F',
        bailleur: 'Bailleur : Awa N.',
        note: 'Envoyée il y a 1 h. Le bailleur répond en général sous 24 h.',
        canCancel: true,
      },
      {
        id: 'v3',
        status: 'pending',
        statusLabel: 'En attente',
        statusClass: 'status-pending',
        dateLabel: 'Sam. 24 oct. · 10 h',
        title: 'Appartement F3 lumineux',
        place: 'Pikine Technopole · 180 000 F',
        bailleur: 'Bailleur : Ibrahima S.',
        note: 'Envoyée hier. Pas encore de réponse.',
        canCancel: true,
      },
      {
        id: 'v4',
        status: 'rejected',
        statusLabel: 'Refusée',
        statusClass: 'status-rejected',
        dateLabel: 'Jeu. 22 oct. · 15 h',
        title: 'Chambre indépendante',
        place: 'Guinaw Rails · 45 000 F',
        bailleur: 'Bailleur : Fatou K.',
        note: 'Motif : Le logement a déjà été attribué.',
        canCancel: false,
      }
    ],
    filteredList: []
  },

  onLoad() {
    try {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 44
      });
    } catch (e) {}

    this.applyFilter('all');
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'visites' });
    }
  },

  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.applyFilter(filter);
  },

  applyFilter(filter) {
    let list = this.data.visitesList;
    if (filter === 'pending') {
      list = list.filter(v => v.status === 'pending');
    } else if (filter === 'accepted') {
      list = list.filter(v => v.status === 'accepted');
    } else if (filter === 'rejected') {
      list = list.filter(v => v.status === 'rejected');
    }
    this.setData({ filteredList: list });
  },

  onOpenItineraire(e) {
    wx.openLocation({
      latitude: 14.7570,
      longitude: -17.3980,
      name: 'Icotaf, Pikine',
      address: 'À côté de la pharmacie du marché, Pikine'
    });
  },

  onOpenMessage(e) {
    wx.navigateTo({
      url: '/pages/messages/chat?id=MD'
    });
  },

  onCancelDemande(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Annuler la demande ?',
      content: 'Cette visite sera supprimée et le bailleur sera prévenu.',
      confirmText: 'Oui, annuler',
      cancelText: 'Non',
      confirmColor: '#C8235F',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.visitesList.filter(item => item.id !== id);
          this.setData({ visitesList: updated });
          this.applyFilter(this.data.activeFilter);
          wx.showToast({ title: 'Demande annulée', icon: 'success' });
        }
      }
    });
  }
});

