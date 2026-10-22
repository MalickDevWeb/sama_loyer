import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { getConversations } from '../../../utils/mocks/conversations';

Page({
  data: {
    statusBarHeight: 24,
    activeFilter: 'all', // 'all' | 'unread'
    searchQuery: '',
    conversations: getConversations()
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

  onSelectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
  },

  onOpenChat(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/chat/chat?id=${id}`
    });
  }
});

