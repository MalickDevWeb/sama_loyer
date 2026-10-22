import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { getConversations } from '../../../utils/mocks/conversations';

const CONVERSATIONS = getConversations();

// Recherche insensible aux accents et à la casse
const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const withAria = (c) => ({
  ...c,
  aria: `Conversation avec ${c.name}${c.unread ? `, ${c.unread} message(s) non lu(s)` : ''}`
});

Page({
  data: {
    statusBarHeight: 24,
    filter: 'all', // 'all' | 'unread'
    query: '',
    tabs: [
      { id: 'all', label: 'Toutes' },
      { id: 'unread', label: `Non lues (${CONVERSATIONS.filter((c) => c.unread).length})` }
    ],
    visible: CONVERSATIONS.map(withAria)
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}
  },

  onShow() {
    setCustomTabBarActive(this, 'messages');
  },

  refresh() {
    const { filter, query } = this.data;
    const q = norm(query);
    const visible = CONVERSATIONS.filter((c) => {
      if (filter === 'unread' && !c.unread) return false;
      return !q || norm(`${c.name} ${c.property}`).includes(q);
    }).map(withAria);
    this.setData({ visible });
  },

  onSelectFilter(e) {
    this.setData({ filter: e.currentTarget.dataset.id }, () => this.refresh());
  },

  onSearchInput(e) {
    this.setData({ query: e.detail.value || '' }, () => this.refresh());
  },

  onOpenChat(e) {
    wx.navigateTo({ url: `/pages/client/chat/chat?id=${e.currentTarget.dataset.id}` });
  },

  onSearchHome() {
    wx.switchTab({ url: '/pages/client/home/home' });
  }
});
