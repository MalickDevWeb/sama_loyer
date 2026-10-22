import { getVisites, cancelVisite } from '../../../utils/helpers/visites';

Page({
  data: {
    statusBarHeight: 44,
    activeFilter: 'all', // all | pending | accepted | rejected
    visitesList: [],
    filteredList: []
  },

  onLoad() {
    try {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 44
      });
    } catch (e) {}
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'visites' });
    }
    // Recharge à chaque affichage : une demande peut venir d'être envoyée
    this.setData({ visitesList: getVisites() });
    this.applyFilter(this.data.activeFilter);
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
    const logementId = e.currentTarget.dataset.logementId;
    wx.navigateTo({
      url: `/pages/client/chat/chat?logementId=${encodeURIComponent(logementId || '')}`
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
          cancelVisite(id);
          this.setData({ visitesList: getVisites() });
          this.applyFilter(this.data.activeFilter);
          wx.showToast({ title: 'Demande annulée', icon: 'success' });
        }
      }
    });
  }
});

