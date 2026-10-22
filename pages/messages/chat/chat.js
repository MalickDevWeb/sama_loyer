Page({
  data: {
    statusBarHeight: 24,
    inputText: '',
    messages: [
      {
        id: 'm1',
        sender: 'client',
        text: 'Bonjour, la chambre d’Icotaf est-elle toujours disponible ?',
        time: '09:58 · Lu'
      },
      {
        id: 'm2',
        sender: 'bailleur',
        text: 'Bonjour ! Oui, elle est libre à partir du 1er novembre.',
        time: '10:15'
      },
      {
        id: 'm3',
        isEvent: true,
        eventTitle: 'Demande de visite envoyée',
        eventDate: 'Samedi 24 octobre à 16 h'
      },
      {
        id: 'm4',
        sender: 'bailleur',
        text: 'D’accord, samedi 16 h ça me va.',
        time: '10:42'
      },
      {
        id: 'm5',
        sender: 'bailleur',
        text: 'Je vous enverrai l’adresse exacte vendredi.',
        time: '10:43'
      }
    ],
    quickReplies: [
      'Je confirme la visite',
      '💳 Payer loyer / caution',
      'Les factures sont-elles comprises ?'
    ]
  },

  onLoad() {
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
        wx.switchTab({ url: '/pages/messages/messages' });
      }
    });
  },

  onPropertyBannerTap() {
    wx.navigateTo({
      url: '/pages/logement-detail/logement-detail?id=icotaf-01'
    });
  },

  onCall() {
    wx.makePhoneCall({ phoneNumber: '771234567' });
  },

  onWhatsApp() {
    wx.setClipboardData({
      data: 'Bonjour Moussa, je vous écris concernant la chambre à Icotaf Pikine.',
      success: () => {
        wx.showToast({ title: 'Copié pour WhatsApp', icon: 'success' });
      }
    });
  },

  onQuickReplyTap(e) {
    const text = e.currentTarget.dataset.text;
    if (text.includes('Payer')) {
      wx.navigateTo({ url: '/pages/loyers/loyers' });
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

