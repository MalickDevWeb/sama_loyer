import { getBailleurConversation } from '../../../utils/mocks/bailleur-conversations';
import {
  requireBailleurAccess,
  getStoredBailleurConversation,
  addStoredBailleurMessage,
  markBailleurConversationRead
} from '../../../utils/helpers/store';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    statusBarHeight: 20,
    conv: { name: '', initials: '', color: '#0F1E3D', listing: '', visit: '' },
    firstName: '',
    tag: '',
    tagHired: false,
    messages: [],
    quick: [],
    actions: [],
    draft: '',
    scrollTo: ''
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    const id = options && options.id ? decodeURIComponent(options.id) : 'awa-diop';
    const name = options && options.name ? decodeURIComponent(options.name) : '';
    // Conversation enregistrée (messages déjà échangés) ou nouveau contact
    const base = getBailleurConversation(id, name);
    const received = this.receiveNavData(options); // transmise par la liste Messages
    const stored = received || getStoredBailleurConversation(base.id);
    const conv = stored ? Object.assign({}, base, stored) : base;
    markBailleurConversationRead(conv.id);

    // Actions déjà faites dans cette conversation
    this.done = { addr: false, contract: false, offer: false };
    this.conv = conv;

    this.setData({
      conv,
      firstName: conv.name.split(' ')[0],
      messages: conv.messages.slice(),
      quick: conv.quick || []
    });
    this.refreshActions();
    this.scrollDown();
  },

  refreshActions() {
    const d = this.done;
    const first = this.data.firstName;
    this.setData({
      tag: d.offer ? 'Future locataire · entrée le 1er nov.' : this.conv.tag,
      tagHired: d.offer,
      actions: [
        { id: 'slot', icon: 'cal', label: 'Proposer un créneau', done: false },
        { id: 'addr', icon: 'pin', label: d.addr ? 'Adresse envoyée' : 'Envoyer l’adresse', done: d.addr },
        { id: 'contract', icon: 'doc-small', label: d.contract ? 'Contrat envoyé' : 'Envoyer le contrat', done: d.contract },
        { id: 'offer', icon: 'key', label: d.offer ? 'Logement proposé' : `${first} prend le logement`, done: d.offer }
      ]
    });
  },

  scrollDown() {
    // Fait défiler jusqu'au dernier message
    this.setData({ scrollTo: '' }, () => this.setData({ scrollTo: 'msg-end' }));
  },

  pushEvent(ev) {
    const event = { id: `e-${Date.now()}`, event: true, ...ev };
    this.setData({ messages: [...this.data.messages, event] });
    this.scrollDown();
    addStoredBailleurMessage(this.conv.id, event, this.conv);
  },

  pushMessage(text) {
    const t = String(text || '').trim();
    if (!t) return;
    const newMsg = { id: `m-${Date.now()}`, from: 'me', sender: 'bailleur', text: t, time: now() };
    this.setData({
      messages: [...this.data.messages, newMsg],
      draft: ''
    });
    this.scrollDown();

    // Enregistré côté bailleur uniquement (ne se mélange pas aux discussions du locataire)
    addStoredBailleurMessage(this.conv.id, newMsg, this.conv);
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.reLaunch({ url: '/pages/bailleur/messages/messages' }) });
  },

  onCall() {
    wx.showToast({ title: `Appel de ${this.data.conv.name}…`, icon: 'none' });
  },

  onAction(e) {
    const id = e.currentTarget.dataset.id;
    const first = this.data.firstName;
    if (id === 'slot') {
      this.pushEvent({ text: 'Créneaux proposés', sub: 'Dim. 25 à 11 h · Lun. 26 à 18 h', icon: 'cal', tone: 'blue' });
      return;
    }
    if (this.done[id]) return;
    this.done[id] = true;
    if (id === 'addr') this.pushEvent({ text: 'Adresse exacte envoyée', sub: this.conv.address || 'Adresse du logement', icon: 'pin', tone: 'blue' });
    if (id === 'contract') this.pushEvent({ text: `Contrat envoyé à ${first}`, sub: 'À lire avant de décider', icon: 'doc-small', tone: 'blue' });
    if (id === 'offer') this.pushEvent({ text: `Logement proposé à ${first}`, sub: this.conv.entry || 'Entrée le 1er nov.', icon: 'key', tone: 'green' });
    this.refreshActions();
  },

  onQuick(e) {
    this.pushMessage(e.currentTarget.dataset.text);
  },

  onDraft(e) {
    this.setData({ draft: e.detail.value });
  },

  onSend() {
    if (this.data.draft.trim()) {
      this.pushMessage(this.data.draft);
    } else {
      wx.showToast({ title: 'Maintiens pour un message vocal', icon: 'none' });
    }
  }
});
