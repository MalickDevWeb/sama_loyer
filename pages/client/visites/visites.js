import { getVisites, cancelVisite } from '../../../utils/helpers/visites';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';

const TABS = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'accepted', label: 'Acceptées' },
  { id: 'rejected', label: 'Refusées' }
];

// Libellés d'onglets avec le nombre de visites par statut
function buildTabs(list) {
  return TABS.map((t) => {
    const n = t.id === 'all' ? list.length : list.filter((v) => v.status === t.id).length;
    return { id: t.id, label: `${t.label} (${n})` };
  });
}

Page({
  data: {
    statusBarHeight: 44,
    activeFilter: 'all', // all | pending | accepted | rejected
    tabs: buildTabs([]),
    visitesList: [],
    filteredList: []
  },

  onLoad() {
    try {
      const sysInfo = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sysInfo.statusBarHeight || 44 });
    } catch (e) {}
  },

  onShow() {
    setCustomTabBarActive(this, 'visites');
    // Recharge à chaque affichage : une demande peut venir d'être envoyée
    this.reload();
  },

  reload() {
    const visitesList = getVisites();
    this.setData({ visitesList, tabs: buildTabs(visitesList) });
    this.applyFilter(this.data.activeFilter);
  },

  onFilterTap(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.applyFilter(filter);
  },

  applyFilter(filter) {
    const list = this.data.visitesList;
    this.setData({ filteredList: filter === 'all' ? list : list.filter((v) => v.status === filter) });
  },

  onOpenLogement(e) {
    const logementId = e.currentTarget.dataset.logementId;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(logementId || '')}`
    });
  },

  onOpenItineraire() {
    wx.openLocation({
      latitude: 14.7570,
      longitude: -17.3980,
      name: 'Icotaf, Pikine',
      address: 'À côté de la pharmacie du marché, Pikine'
    });
  },

  // Visite acceptée : on passe au parcours « Entrer dans le logement »
  onTakeLogement(e) {
    const logementId = e.currentTarget.dataset.logementId;
    wx.navigateTo({
      url: `/pages/client/entree/entree?id=${encodeURIComponent(logementId || '')}`
    });
  },

  onOpenMessage(e) {
    const logementId = e.currentTarget.dataset.logementId;
    wx.navigateTo({
      url: `/pages/client/chat/chat?logementId=${encodeURIComponent(logementId || '')}`
    });
  },

  onCancelDemande(e) {
    cancelVisite(e.currentTarget.dataset.id);
    this.reload();
  },

  onSimilar() {
    wx.navigateTo({ url: '/pages/client/search/results?place=Pikine' });
  },

  onSearchHome() {
    wx.switchTab({ url: '/pages/client/home/home' });
  }
});
