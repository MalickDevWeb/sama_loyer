import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { enrichConversation } from '../../../utils/mocks/conversations';
import { getStoredConversations } from '../../../utils/helpers/store';
import { EVENTS } from '../../../utils/event/keys';
import { busBehavior } from '../../../utils/behaviors/index';
import { i18nBehavior } from '../../../utils/i18n/index';
import { navigateWithData } from '../../../utils/helpers/nav-data';

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
  // listen() : abonnement EventBus coupé automatiquement à la fermeture
  behaviors: [busBehavior, i18nBehavior],

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
    this.listen(EVENTS.MESSAGES_CHANGED, ({ side }) => {
      if (side === 'client') this.reload();
    });
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

  // La conversation est transmise à la discussion : pas de rechargement
  onOpenChat(e) {
    const id = e.currentTarget.dataset.id;
    const conversation = (this.all || []).find((c) => c.id === id);
    navigateWithData(`/pages/client/chat/chat?id=${id}`, conversation);
  },

  onSearchHome() {
    wx.switchTab({ url: '/pages/client/home/home' });
  }
});
