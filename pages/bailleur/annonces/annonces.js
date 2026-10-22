// pages/bailleur/annonces/annonces.js
import { getStoredBailleurAnnonces, confirmBailleurAnnonce } from '../../../utils/helpers/store';
import { storage } from '../../../utils/storage';

Page({
  data: {
    statusBarHeight: 44,
    activeFilter: 'all', // all | en_ligne | validation | loue
    annonces: [],
    filteredAnnonces: []
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}

    this.loadAnnonces();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-annonces' });
    }
    this.loadAnnonces();
  },

  loadAnnonces() {
    const annonces = getStoredBailleurAnnonces();
    this.setData({ annonces }, () => {
      this.applyFilter(this.data.activeFilter);
    });
  },

  onFilterSelect(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.applyFilter(filter);
  },

  applyFilter(filter) {
    let list = this.data.annonces;
    if (filter === 'en_ligne') {
      list = list.filter(a => a.type === 'en_ligne');
    } else if (filter === 'validation') {
      list = list.filter(a => a.type === 'validation');
    } else if (filter === 'loue') {
      list = list.filter(a => a.type === 'loue');
    }
    this.setData({ filteredAnnonces: list });
  },

  onConfirmDispo(e) {
    const id = e.currentTarget.dataset.id;
    const updated = confirmBailleurAnnonce(id);

    this.setData({ annonces: updated });
    this.applyFilter(this.data.activeFilter);
    wx.showToast({
      title: 'Disponibilité confirmée (7 jours)',
      icon: 'success'
    });
  },

  onMarkLoue(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Marquer comme loué ?',
      content: 'Ce logement sera retiré des résultats de recherche des locataires.',
      confirmText: "Oui, c'est loué",
      confirmColor: '#0F1E3D',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.annonces.map(a => {
            if (a.id === id) {
              return {
                ...a,
                tag: 'Loué',
                tagClass: 'tag-loue',
                type: 'loue',
                notice: 'Annonce retirée des recherches. Les locataires ne la voient plus.',
                noticeClass: 'notice-gray',
                canRelist: true,
                isConfirmed: false,
                needsConfirm: false
              };
            }
            return a;
          });
          storage.set('sama_bailleur_annonces', updated);
          this.setData({ annonces: updated });
          this.applyFilter(this.data.activeFilter);
          wx.showToast({ title: 'Logement marqué loué' });
        }
      }
    });
  },

  onRelist(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.annonces.map(a => {
      if (a.id === id) {
        return {
          ...a,
          tag: 'En ligne · Vérifié',
          tagClass: 'tag-enligne',
          type: 'en_ligne',
          notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
          noticeClass: 'notice-gray',
          canRelist: false,
          isConfirmed: true,
          needsConfirm: false
        };
      }
      return a;
    });
    storage.set('sama_bailleur_annonces', updated);
    this.setData({ annonces: updated });
    this.applyFilter(this.data.activeFilter);
    wx.showToast({ title: 'Remis en location ✓', icon: 'success' });
  },

  onOpenAdd() {
    wx.navigateTo({
      url: '/pages/bailleur/ajouter/ajouter'
    });
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${id}`
    });
  }
});
