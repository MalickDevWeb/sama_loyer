Page({
  data: {
    statusBarHeight: 44,
    selectedOption: 'boost30',
    selectedPrice: '15 000',
    boostOptions: [
      {
        id: 'boost7',
        title: 'Boost 7 jours',
        sub: '1 annonce en haut des recherches',
        price: '5 000',
        badge: ''
      },
      {
        id: 'boost30',
        title: 'Boost 30 jours',
        sub: '1 annonce · le plus choisi',
        price: '15 000',
        badge: 'Le plus choisi'
      },
      {
        id: 'renew',
        title: 'Renouveler Premium',
        sub: '1 mois · 3 annonces mises en avant',
        price: '25 000',
        badge: ''
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
      this.getTabBar().setData({ activeTab: 'b-premium' });
    }
  },

  onSelectOption(e) {
    const id = e.currentTarget.dataset.id;
    const option = this.data.boostOptions.find(o => o.id === id);
    if (option) {
      this.setData({
        selectedOption: id,
        selectedPrice: option.price
      });
    }
  },

  onPayAction() {
    wx.showLoading({ title: 'Orange Money...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: 'Paiement sécurisé Orange Money',
        content: `Confirmer le règlement de ${this.data.selectedPrice} FCFA pour activer votre option ?`,
        confirmText: 'Payer',
        confirmColor: '#C8235F',
        cancelText: 'Annuler',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({
              title: 'Option activée avec succès !',
              icon: 'success'
            });
          }
        }
      });
    }, 400);
  }
});
