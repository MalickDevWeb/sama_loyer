import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

const CONVERSATIONS_DATA = [
  {
    id: 'moussa-d',
    initial: 'MD',
    name: 'Moussa D.',
    time: '10:43',
    property: 'Chambre salon · Icotaf, Pikine · 65 000 F',
    snippet: 'Je vous enverrai l’adresse exacte vendr...',
    unread: 2,
    visiteBadge: 'Visite demandée · sam. 24, 16 h',
    avatarBg: '#0F1E3D'
  },
  {
    id: 'awa-n',
    initial: 'AN',
    name: 'Awa N.',
    time: 'Hier',
    property: 'Studio meublé · Pikine Rue 10 · 95 000 F',
    snippet: 'Oui, le studio est toujours disponible.',
    unread: 1,
    avatarBg: '#C8235F'
  },
  {
    id: 'ibrahima-s',
    initial: 'IS',
    name: 'Ibrahima S.',
    time: 'Lun.',
    property: 'Appartement F3 · Pikine Technopole · 180 000 F',
    snippet: 'Vous : Les factures sont-elles comprises ?',
    unread: 0,
    avatarBg: '#4A5568'
  },
  {
    id: 'fatou-k',
    initial: 'FK',
    name: 'Fatou K.',
    time: '18 oct.',
    property: 'Chambre indépendante · Guinaw Rails · 45 000 F',
    snippet: 'Désolée, la chambre vient d’être louée.',
    unread: 0,
    avatarBg: '#2D3748'
  }
];

Page({
  data: {
    statusBarHeight: 24,
    activeFilter: 'all', // 'all' | 'unread'
    searchQuery: '',
    conversations: CONVERSATIONS_DATA
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
      url: `/pages/messages/chat?id=${id}`
    });
  }
});
