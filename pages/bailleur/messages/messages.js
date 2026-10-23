import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { requireBailleurAccess, getStoredBailleurConversations } from '../../../utils/helpers/store';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';
import { EVENTS } from '../../../utils/event/keys';
import { navigateWithData } from '../../../utils/helpers/nav-data';

// Conversations enregistrées ; statut affiché : « Candidate », « Locataire »… (1re partie du tag)
const loadConversations = () =>
  getStoredBailleurConversations().map((c) => ({ ...c, status: String(c.tag || '').split(' · ')[0] }));

const filterTabs = (list) => {
  const count = (kind) => list.filter((c) => c.kind === kind).length;
  return [
    { id: 'all', label: 'Tous' },
    { id: 'cand', label: `Candidats (${count('cand')})` },
    { id: 'loc', label: `Locataires (${count('loc')})` }
  ];
};

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    statusBarHeight: 20,
    filter: 'all', // all | cand | loc
    tabs: filterTabs([]),
    conversations: [],
    pendingVisits: 2
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    // Nouveau message ou discussion lue : la liste se met à jour en direct
    // (listen() vient de busBehavior, inclus dans bailleurGuardBehavior)
    this.listen(EVENTS.MESSAGES_CHANGED, ({ side }) => {
      if (side === 'bailleur') this.reload();
    });
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    setCustomTabBarActive(this, 'b-messages');
    this.reload();
  },

  reload() {
    this.all = loadConversations();
    this.applyFilter(this.data.filter);
  },

  applyFilter(filter) {
    const all = this.all || [];
    this.setData({
      filter,
      tabs: filterTabs(all),
      conversations: all.filter((c) => filter === 'all' || c.kind === filter)
    });
  },

  onFilter(e) {
    this.applyFilter(e.currentTarget.dataset.id);
  },

  onOpenVisits() {
    wx.redirectTo({ url: '/pages/bailleur/demandes/demandes' });
  },

  // La conversation est transmise à la discussion : pas de rechargement
  onOpenConversation(e) {
    const id = e.currentTarget.dataset.id;
    const conv = (this.all || []).find((c) => c.id === id);
    navigateWithData(`/pages/bailleur/conversation/conversation?id=${id}`, conv);
  }
});
