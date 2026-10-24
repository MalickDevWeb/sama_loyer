import { getLogementById, FAVORITE_SAVED_LABELS } from '../../../utils/mocks/logements';
import { getFavoriteIds, toggleFavoriteId, reconcileFavoritesWithBackend } from '../../../utils/helpers/favorites';
import { t, i18nBehavior } from '../../../utils/i18n/index';
import { navigateWithData } from '../../../utils/helpers/nav-data';

const UNDO_DELAY_MS = 4000;

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function statusText(l) {
  if (l.status === 'price-drop') return l.priceDropLabel;
  if (l.status === 'rented') return l.statusLabel;
  return t('common.available');
}

// Construit les cartes à partir des IDs favoris et du catalogue
function buildFavoritesList(rawById = {}) {
  return getFavoriteIds()
    .map(getLogementById)
    .filter(Boolean)
    .map((l) => {
      rawById[l.id] = l; // logement complet, transmis au détail
      return {
        id: l.id,
        isPremium: !!l.isPremium,
        price: formatMoney(l.price),
        title: l.title,
        place: l.place,
        status: l.status || 'disponible',
        statusText: statusText(l),
        saved: FAVORITE_SAVED_LABELS[l.id] || t('favoris.savedToday'),
        bg: l.tint,
        cover: l.cover
      };
    });
}

function subtitleFor(n) {
  if (n === 0) return t('favoris.subtitleNone');
  if (n === 1) return t('favoris.subtitleOne');
  return t('favoris.subtitle', { count: n });
}

Page({
  behaviors: [i18nBehavior],

  data: {
    statusBarHeight: 44,
    filter: 'tous', // 'tous' | 'dispo'
    subtitle: '',
    visible: [],
    lastRemoved: ''
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 44 });
    } catch (e) {}
  },

  onShow() {
    // Recharge à chaque affichage : les favoris changent sur les autres pages
    this.refresh();
  },

  onUnload() {
    clearTimeout(this.undoTimer);
  },

  refresh() {
    // Logements complets par id : transmis tels quels au détail (pas de rechargement)
    this.rawById = {};
    const all = buildFavoritesList(this.rawById);
    const visible = this.data.filter === 'dispo' ? all.filter((f) => f.status !== 'rented') : all;
    this.setData({ visible, subtitle: subtitleFor(all.length) });
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/client/profile/profile' })
    });
  },

  onFilterSelect(e) {
    this.setData({ filter: e.currentTarget.dataset.filter }, () => this.refresh());
  },

  onRemoveFavorite(e) {
    const id = e.currentTarget.dataset.id;
    toggleFavoriteId(id, false);
    this.setData({ lastRemoved: id });
    this.refresh();
    clearTimeout(this.undoTimer);
    this.undoTimer = setTimeout(() => this.setData({ lastRemoved: '' }), UNDO_DELAY_MS);
  },

  onUndo() {
    const id = this.data.lastRemoved;
    if (!id) return;
    clearTimeout(this.undoTimer);
    toggleFavoriteId(id, true);
    this.setData({ lastRemoved: '' });
    this.refresh();
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    navigateWithData(
      `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(id)}`,
      this.rawById && this.rawById[id]
    );
  },

  onSearchHome() {
    wx.switchTab({ url: '/pages/client/home/home' });
  }
});
