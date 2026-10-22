import { findConversation } from '../../../utils/mocks/conversations';

function now() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Heure + accusé : le dernier message envoyé est « Envoyé », les précédents « Lu »
function withMeta(messages) {
  const last = messages.length - 1;
  return messages.map((m, i) => {
    if (m.isEvent) return m;
    const mine = m.sender === 'client';
    const time = String(m.time || '').replace(/ · Lu$/, '');
    const tick = mine ? (i === last ? ' · Envoyé' : ' · Lu') : '';
    return { ...m, mine, meta: time + tick };
  });
}

Page({
  data: {
    statusBarHeight: 24,
    inputText: '',
    conversation: null,
    messages: [],
    scrollTo: '',
    quickReplies: [
      'Je confirme la visite',
      'Les factures sont-elles comprises ?',
      'Puis-je venir avec un proche ?'
    ]
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}

    const conversation = findConversation({
      id: options && options.id ? decodeURIComponent(options.id) : '',
      logementId: options && options.logementId ? decodeURIComponent(options.logementId) : ''
    }) || findConversation({ id: 'moussa-d' });
    this.raw = conversation.messages.slice();
    this.setData({ conversation, messages: withMeta(this.raw) });
    this.scrollDown();
  },

  scrollDown() {
    // Fait défiler jusqu'au dernier message
    this.setData({ scrollTo: '' }, () => this.setData({ scrollTo: 'msg-end' }));
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/client/messages/messages' })
    });
  },

  onPropertyBannerTap() {
    // Logement déjà loué (conversation ouverte depuis Mon loyer) : pas de fiche annonce
    if (!this.data.conversation.logementId) {
      wx.switchTab({ url: '/pages/client/loyers/loyers' });
      return;
    }
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(this.data.conversation.logementId)}`
    });
  },

  onCall() {
    wx.makePhoneCall({ phoneNumber: this.data.conversation.phone });
  },

  onWhatsApp() {
    const c = this.data.conversation;
    wx.setClipboardData({
      data: `Bonjour ${c.name}, je vous écris concernant « ${c.logementTitle} » à ${c.logementPlace}.`,
      success: () => wx.showToast({ title: 'Copié pour WhatsApp', icon: 'success' })
    });
  },

  onAttach() {
    wx.showToast({ title: 'Envoi de photo bientôt disponible', icon: 'none' });
  },

  onQuickReplyTap(e) {
    this.sendMessage(e.currentTarget.dataset.text);
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onSendTap() {
    const text = (this.data.inputText || '').trim();
    if (!text) {
      wx.showToast({ title: 'Maintiens pour un message vocal', icon: 'none' });
      return;
    }
    this.sendMessage(text);
  },

  sendMessage(text) {
    this.raw.push({ id: `m-${Date.now()}`, sender: 'client', text, time: now() });
    this.setData({ messages: withMeta(this.raw), inputText: '' });
    this.scrollDown();
  }
});
