import { getLogementById } from '../../utils/mocks/logements';
import { getFavoriteIds, toggleFavoriteId } from '../../utils/helpers/favorites';

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Construit les cartes à partir des IDs favoris et du catalogue
function buildFavoritesList() {
  return getFavoriteIds()
    .map(getLogementById)
    .filter(Boolean)
    .map((l) => ({
      id: l.id,
      isPremium: !!l.isPremium,
      price: `${formatMoney(l.price)} FCFA`,
      unit: '/ mois',
      title: l.title,
      place: l.place,
      status: l.status || 'disponible',
      statusLabel: l.statusLabel || 'Disponible',
      priceDropLabel: l.priceDropLabel || '',
      registeredAt: 'Enregistré',
      bg: l.tint
    }));
}

Page({
  data: {
    statusBarHeight: 44,
    activeTabFilter: 'tous', // 'tous' | 'dispo'
    favoritesList: [],
    filteredList: []
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
      this.getTabBar().setData({ activeTab: 'favoris' });
    }
    // Recharge à chaque affichage : les favoris changent sur les autres pages
    this.setData({ favoritesList: buildFavoritesList() });
    this.applyFilter(this.data.activeTabFilter);
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
          toggleFavoriteId(id, false);
          this.setData({ favoritesList: buildFavoritesList() });
          this.applyFilter(this.data.activeTabFilter);
          wx.showToast({ title: 'Favori retiré', icon: 'success' });
        }
      }
    });
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/logement-detail/logement-detail?id=${encodeURIComponent(id)}`
    });
  }
});
