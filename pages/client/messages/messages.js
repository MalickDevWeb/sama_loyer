import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { enrichConversation } from '../../../utils/mocks/conversations';
import { getStoredConversations } from '../../../utils/helpers/store';
import { Bus } from '../../../utils/event/index';
import { EVENTS } from '../../../utils/event/keys';

// Conversations enregistrées (dernier message et non-lus à jour)
const loadConversations = () => getStoredConversations().map(enrichConversation).filter(Boolean);

const unreadTabs = (list) => [
  { id: 'all', label: 'Toutes' },
  { id: 'unread', label: `Non lues (${list.filter((c) => c.unread).length})` }
];

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
    tabs: unreadTabs([]),
    visible: []
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}

    // Nouveau message ou discussion lue : la liste se met à jour en direct
    this.offMessages = Bus.on(EVENTS.MESSAGES_CHANGED, ({ side }) => {
      if (side === 'client') this.reload();
    });
  },

  onUnload() {
    if (this.offMessages) this.offMessages();
  },

  onShow() {
    setCustomTabBarActive(this, 'messages');
    this.reload();
  },

  reload() {
    this.all = loadConversations();
    this.setData({ tabs: unreadTabs(this.all) }, () => this.refresh());
  },

  refresh() {
    const { filter, query } = this.data;
    const q = norm(query);
    const visible = (this.all || []).filter((c) => {
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
