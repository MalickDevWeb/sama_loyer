import { BAILLEUR_CONVERSATIONS } from '../../../utils/mocks/bailleur-conversations';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';

const count = (kind) => BAILLEUR_CONVERSATIONS.filter((c) => c.kind === kind).length;

Page({
  data: {
    statusBarHeight: 20,
    filter: 'all', // all | cand | loc
    tabs: [
      { id: 'all', label: 'Tous' },
      { id: 'cand', label: `Candidats (${count('cand')})` },
      { id: 'loc', label: `Locataires (${count('loc')})` }
    ],
    conversations: BAILLEUR_CONVERSATIONS,
    pendingVisits: 2
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}
  },

  onShow() {
    setCustomTabBarActive(this, 'b-messages');
  },

  onFilter(e) {
    const filter = e.currentTarget.dataset.id;
    this.setData({
      filter,
      conversations: BAILLEUR_CONVERSATIONS.filter((c) => filter === 'all' || c.kind === filter)
    });
  },

  onOpenVisits() {
    wx.redirectTo({ url: '/pages/bailleur/demandes/demandes' });
  },

  onOpenConversation(e) {
    wx.navigateTo({ url: `/pages/bailleur/conversation/conversation?id=${e.currentTarget.dataset.id}` });
  }
});
