import { findConversation } from '../../../utils/mocks/conversations';

Page({
  data: {
    statusBarHeight: 24,
    inputText: '',
    conversation: null,
    messages: [],
    quickReplies: [
      'Je confirme la visite',
      '💳 Payer loyer / caution',
      'Les factures sont-elles comprises ?'
    ]
  },

  onLoad(options) {
    const conversation = findConversation({
      id: options && options.id ? decodeURIComponent(options.id) : '',
      logementId: options && options.logementId ? decodeURIComponent(options.logementId) : ''
    }) || findConversation({ id: 'moussa-d' });
    this.setData({ conversation, messages: conversation.messages });

    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/client/messages/messages' });
      }
    });
  },

  onPropertyBannerTap() {
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(this.data.conversation.logementId)}`
    });
  },

  onCall() {
    wx.makePhoneCall({ phoneNumber: this.data.conversation.phone });
  },

  onWhatsApp() {
    wx.setClipboardData({
      data: `Bonjour ${this.data.conversation.name}, je vous écris concernant « ${this.data.conversation.logementTitle} » à ${this.data.conversation.logementPlace}.`,
      success: () => {
        wx.showToast({ title: 'Copié pour WhatsApp', icon: 'success' });
      }
    });
  },

  onQuickReplyTap(e) {
    const text = e.currentTarget.dataset.text;
    if (text.includes('Payer')) {
      wx.navigateTo({ url: '/pages/client/loyers/loyers' });
      return;
    }
    this.sendMessage(text);
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onSendTap() {
    const text = (this.data.inputText || '').trim();
    if (!text) return;
    this.sendMessage(text);
    this.setData({ inputText: '' });
  },

  sendMessage(text) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const newMsg = {
      id: 'm-' + Date.now(),
      sender: 'client',
      text,
      time
    };

    this.setData({
      messages: [...this.data.messages, newMsg]
    });
  }
});

