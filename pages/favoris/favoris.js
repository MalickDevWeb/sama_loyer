import { getLogementById } from '../../utils/mocks/logements';
import { getFavoriteIds, toggleFavoriteId } from '../../utils/helpers/favorites';
import { t, i18nBehavior } from '../../utils/i18n/index';

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
      price: `${formatMoney(l.price)} ${t('common.currency')}`,
      unit: t('common.perMonth'),
      title: l.title,
      place: l.place,
      status: l.status || 'disponible',
      statusLabel: l.statusLabel || t('common.available'),
      priceDropLabel: l.priceDropLabel || '',
      registeredAt: t('favoris.saved'),
      bg: l.tint
    }));
}

Page({
  behaviors: [i18nBehavior],

  data: {
    statusBarHeight: 44,
    activeTabFilter: 'tous', // 'tous' | 'dispo'
    favoritesList: [],
    subtitle: '',
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
    // Recharge à chaque affichage : les favoris changent sur les autres pages
    this.setFavorites(buildFavoritesList());
    this.applyFilter(this.data.activeTabFilter);
  },

  setFavorites(list) {
    this.setData({
      favoritesList: list,
      subtitle: t('favoris.subtitle', { count: list.length })
    });
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/profile/profile' });
      }
    });
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
      title: t('favoris.removeTitle'),
      content: t('favoris.removeContent'),
      confirmText: t('favoris.removeConfirm'),
      confirmColor: '#C8235F',
      cancelText: t('common.cancel'),
      success: (res) => {
        if (res.confirm) {
          toggleFavoriteId(id, false);
          this.setFavorites(buildFavoritesList());
          this.applyFilter(this.data.activeTabFilter);
          wx.showToast({ title: t('favoris.removed'), icon: 'success' });
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
