Page({
  data: {
    statusBarHeight: 44,
    activeTabFilter: 'tous', // 'tous' | 'dispo'
    favoritesList: [
      {
        id: 'f1',
        isPremium: true,
        price: '65 000 FCFA',
        unit: '/ mois',
        title: 'Chambre salon avec douche intérieure',
        place: 'Icotaf, Pikine',
        status: 'disponible',
        statusLabel: 'Disponible',
        registeredAt: "Enregistré aujourd’hui",
        bg: '#FCE8EF'
      },
      {
        id: 'f2',
        isPremium: true,
        price: '95 000 FCFA',
        unit: '/ mois',
        title: 'Studio meublé, entrée indépendante',
        place: 'Pikine Rue 10, Pikine',
        status: 'disponible',
        statusLabel: 'Disponible',
        registeredAt: 'Enregistré hier',
        bg: '#EAF2FB'
      },
      {
        id: 'f3',
        isPremium: false,
        price: '180 000 FCFA',
        unit: '/ mois',
        title: 'Appartement F3 lumineux',
        place: 'Pikine Technopole, Pikine',
        status: 'price-drop',
        priceDropLabel: 'Le prix a baissé de 20 000 F',
        registeredAt: 'Enregistré il y a 3 j',
        bg: '#F7EFE8'
      },
      {
        id: 'f4',
        isPremium: false,
        price: '45 000 FCFA',
        unit: '/ mois',
        title: 'Chambre indépendante',
        place: 'Guinaw Rails, Pikine',
        status: 'rented',
        statusLabel: 'Déjà loué',
        registeredAt: 'Enregistré il y a 5 j',
        bg: '#EBF4EE'
      }
    ],
    filteredList: []
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}

    this.applyFilter('tous');
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'favoris' });
    }
  },

  onFilterSelect(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeTabFilter: filter });
    this.applyFilter(filter);
  },

  applyFilter(filter) {
    let list = this.data.favoritesList;
    if (filter === 'dispo') {
      list = list.filter(item => item.status !== 'rented');
    }
    this.setData({ filteredList: list });
  },

  onRemoveFavorite(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Retirer des favoris ?',
      content: 'Ce logement sera retiré de ta liste.',
      confirmText: 'Retirer',
      confirmColor: '#C8235F',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.favoritesList.filter(item => item.id !== id);
          this.setData({ favoritesList: updated });
          this.applyFilter(this.data.activeTabFilter);
          wx.showToast({ title: 'Favori retiré', icon: 'success' });
        }
      }
    });
  },

  onCardTap(e) {
    wx.navigateTo({
      url: '/pages/logement-detail/logement-detail'
    });
  }
});
