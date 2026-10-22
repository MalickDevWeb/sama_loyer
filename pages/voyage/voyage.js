import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';

Page({
  data: {
    statusBarHeight: 24,
    activeFilter: 'all', // 'all' | 'visits' | 'pending'
    unreadTotal: 2,
    conversations: [
      {
        id: 'conv-1',
        bailleurName: 'Mamadou Diallo',
        bailleurInitial: 'MD',
        verified: true,
        propertyTitle: 'Chambre salon avec toilettes privées',
        propertyPlace: 'Ouakam, Cité Avion',
        propertyPrice: '60 000 F/mois',
        lastMessage: 'Bonjour Awa, la chambre est disponible pour une visite demain à 16h.',
        time: '10:42',
        unread: 1,
        status: 'Visite proposée',
        statusType: 'success', // success | info | warning
        phone: '771234567',
        messages: [
          { sender: 'client', text: 'Bonjour, je suis intéressée par votre chambre à Ouakam Cité Avion.', time: '09:15' },
          { sender: 'bailleur', text: 'Bonjour Awa ! Oui elle est encore disponible, loyer 60 000 F CFA avec compteur Woyofal individuel.', time: '09:30' },
          { sender: 'client', text: 'Parfait, est-il possible de visiter demain ?', time: '10:10' },
          { sender: 'bailleur', text: 'Bonjour Awa, la chambre est disponible pour une visite demain à 16h.', time: '10:42' }
        ]
      },
      {
        id: 'conv-2',
        bailleurName: 'Aïssatou Sow',
        bailleurInitial: 'AS',
        verified: true,
        propertyTitle: 'Chambre salon carrelée',
        propertyPlace: 'Ouakam, Tonghor',
        propertyPrice: '55 000 F/mois',
        lastMessage: 'Oui le compteur Woyofal est bien individuel. Vous pouvez passer ce soir.',
        time: 'Hier',
        unread: 1,
        status: 'Réponse reçue',
        statusType: 'info',
        phone: '782345678',
        messages: [
          { sender: 'client', text: 'Bonjour Madame Sow, le compteur Woyofal est-il individuel ou partagé ?', time: 'Hier 14:20' },
          { sender: 'bailleur', text: 'Oui le compteur Woyofal est bien individuel. Vous pouvez passer ce soir.', time: 'Hier 15:45' }
        ]
      },
      {
        id: 'conv-3',
        bailleurName: 'Fatou Diop',
        bailleurInitial: 'FD',
        verified: true,
        propertyTitle: 'Studio meublé standing',
        propertyPlace: 'Point E',
        propertyPrice: '150 000 F/mois',
        lastMessage: 'Dossier validé pour le studio. Rendez-vous confirmé pour samedi 11h.',
        time: 'Lundi',
        unread: 0,
        status: 'Visite confirmée',
        statusType: 'success',
        phone: '705678901',
        messages: [
          { sender: 'client', text: 'Bonjour, mon dossier pour le studio au Point E est prêt.', time: 'Lundi 11:00' },
          { sender: 'bailleur', text: 'Dossier validé pour le studio. Rendez-vous confirmé pour samedi 11h.', time: 'Lundi 14:10' }
        ]
      }
    ],
    selectedConversation: null,
    showChatModal: false,
    newMessageText: ''
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
    setCustomTabBarActive(this, 'voyages');
  },

  onSelectFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
  },

  onOpenChat(e) {
    const conv = e.currentTarget.dataset.conv;
    if (!conv) return;

    // Mark as read
    const updatedConversations = this.data.conversations.map((c) => {
      if (c.id === conv.id) {
        return { ...c, unread: 0 };
      }
      return c;
    });

    const unreadCount = updatedConversations.reduce((acc, c) => acc + (c.unread || 0), 0);

    this.setData({
      selectedConversation: { ...conv, unread: 0 },
      conversations: updatedConversations,
      unreadTotal: unreadCount,
      showChatModal: true
    });
  },

  onCloseChat() {
    this.setData({ showChatModal: false, selectedConversation: null, newMessageText: '' });
  },

  onMessageInput(e) {
    this.setData({ newMessageText: e.detail.value || '' });
  },

  onSendMessage() {
    const text = (this.data.newMessageText || '').trim();
    if (!text || !this.data.selectedConversation) return;

    const conv = this.data.selectedConversation;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newMsg = {
      sender: 'client',
      text,
      time: timeStr
    };

    const updatedMessages = [...(conv.messages || []), newMsg];
    const updatedConv = {
      ...conv,
      messages: updatedMessages,
      lastMessage: text,
      time: timeStr
    };

    const updatedList = this.data.conversations.map((c) => (c.id === conv.id ? updatedConv : c));

    this.setData({
      selectedConversation: updatedConv,
      conversations: updatedList,
      newMessageText: ''
    });

    // Auto-reply simulation from bailleur after 1.5s
    setTimeout(() => {
      const reply = {
        sender: 'bailleur',
        text: 'Bien reçu ! Je note et je vous recontacte.',
        time: timeStr
      };
      const listWithReply = this.data.conversations.map((c) => {
        if (c.id === conv.id) {
          return {
            ...c,
            messages: [...c.messages, reply],
            lastMessage: reply.text
          };
        }
        return c;
      });
      this.setData({
        conversations: listWithReply,
        selectedConversation: {
          ...this.data.selectedConversation,
          messages: [...this.data.selectedConversation.messages, reply],
          lastMessage: reply.text
        }
      });
    }, 1200);
  },

  onCallBailleur() {
    const conv = this.data.selectedConversation;
    if (!conv || !conv.phone) return;
    wx.makePhoneCall({
      phoneNumber: conv.phone,
      fail: () => {
        wx.showToast({ title: `Numéro : ${conv.phone}`, icon: 'none' });
      }
    });
  },

  onWhatsAppBailleur() {
    const conv = this.data.selectedConversation;
    if (!conv) return;
    const msg = `Bonjour ${conv.bailleurName}, je vous écris depuis SAMA LOGEMENT concernant "${conv.propertyTitle}".`;
    wx.setClipboardData({
      data: msg,
      success: () => {
        wx.showModal({
          title: 'Message prêt pour WhatsApp 💬',
          content: `Le texte pour ${conv.bailleurName} (${conv.phone}) a été copié. Vous pouvez l'envoyer directement.`,
          showCancel: false,
          confirmText: 'Parfait'
        });
      }
    });
  },

  onConfirmVisit() {
    const conv = this.data.selectedConversation;
    if (!conv) return;

    wx.showModal({
      title: 'Confirmer la visite 📅',
      content: `Voulez-vous confirmer le créneau proposé pour la visite de "${conv.propertyTitle}" à ${conv.propertyPlace} ?`,
      confirmText: 'Confirmer',
      confirmColor: '#009B4D',
      cancelText: 'Reporter',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.conversations.map((c) => {
            if (c.id === conv.id) {
              return { ...c, status: 'Visite confirmée', statusType: 'success' };
            }
            return c;
          });
          this.setData({
            conversations: updated,
            selectedConversation: { ...conv, status: 'Visite confirmée', statusType: 'success' }
          });
          wx.showToast({ title: 'Visite confirmée !', icon: 'success' });
        }
      }
    });
  }
});
