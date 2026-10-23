import { BAILLEUR_CONVERSATIONS } from '../../../utils/mocks/bailleur-conversations';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { requireBailleurAccess } from '../../../utils/helpers/store';

const count = (kind) => BAILLEUR_CONVERSATIONS.filter((c) => c.kind === kind).length;

// Statut affiché dans la liste : « Candidate », « Locataire »… (1re partie du tag)
const CONVERSATIONS = BAILLEUR_CONVERSATIONS.map((c) => ({ ...c, status: String(c.tag || '').split(' · ')[0] }));

Page({
  data: {
    statusBarHeight: 20,
    filter: 'all', // all | cand | loc
    tabs: [
      { id: 'all', label: 'Tous' },
      { id: 'cand', label: `Candidats (${count('cand')})` },
      { id: 'loc', label: `Locataires (${count('loc')})` }
    ],
    conversations: CONVERSATIONS,
    pendingVisits: 2
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    setCustomTabBarActive(this, 'b-messages');
  },

  onFilter(e) {
    const filter = e.currentTarget.dataset.id;
    this.setData({
      filter,
      conversations: CONVERSATIONS.filter((c) => filter === 'all' || c.kind === filter)
    });
  },

  onOpenVisits() {
    wx.redirectTo({ url: '/pages/bailleur/demandes/demandes' });
  },

  onOpenConversation(e) {
    wx.navigateTo({ url: `/pages/bailleur/conversation/conversation?id=${e.currentTarget.dataset.id}` });
  }
});
