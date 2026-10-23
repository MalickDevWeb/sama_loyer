// pages/bailleur/demandes/demandes.js
import { getStoredRawVisites, updateStoredVisiteStatus, getStoredLogements, getStoredConversations, getStoredLocataires } from '../../../utils/helpers/store';
import { formatMoney } from '../../../utils/mocks/logements';
import { requireBailleurAccess } from '../../../utils/helpers/store';
import { COLORS } from '../../../utils/constants/theme';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    statusBarHeight: 44,
    activeTab: 'visites', // 'visites' | 'messages' | 'locataires'
    demandes: [],
    messagesList: [],
    locataires: [],
    expandedMap: {} // { [id]: boolean } pour déplier/replier les demandes
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}

    this.refreshAll();
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-messages' });
    }
    this.refreshAll();
  },

  refreshAll() {
    const rawVisites = getStoredRawVisites();
    const logements = getStoredLogements();

    const formattedDemandes = rawVisites.map(v => {
      const l = logements.find(x => String(x.id) === String(v.logementId)) || {
        title: 'Chambre salon · Icotaf',
        typeLabel: 'Chambre salon',
        place: 'Icotaf, Pikine'
      };

      const isPending = v.status === 'pending';
      const isAccepted = v.status === 'accepted';
      const isRejected = v.status === 'rejected';

      return {
        id: v.id,
        initials: 'AD',
        avatarBg: '#0F1E3D',
        name: v.userName || 'Awa Diop',
        property: `${l.typeLabel || 'Logement'} · ${l.place.split(',')[0]}`,
        status: v.status,
        statusLabel: isPending ? 'À répondre' : (isAccepted ? 'Acceptée' : (isRejected ? 'Refusée' : 'Annulée')),
        dateLabel: v.dateLabel || 'Samedi 24 octobre · 16 h',
        message: v.note || 'Demande de visite',
        isPending: isPending,
        notice: isAccepted ? "Visite acceptée. Le locataire a reçu l'adresse exacte par SMS." : ''
      };
    });

    // Locataires
    const locs = getStoredLocataires().map(l => ({
      id: l.id,
      initials: l.initials || 'LK',
      avatarBg: l.avatarBg || '#C8235F',
      name: l.name,
      property: l.property,
      rent: l.cautionDetenue || '65 000 F',
      phone: l.phone,
      phoneRaw: (l.phone || '').replace(/\s+/g, ''),
      statusLabel: l.statusLabel || 'Loyer payé',
      statusClass: l.status === 'payes' ? 'badge-green' : 'badge-yellow',
      paymentDetail: l.bannerText || 'Payé via Max it'
    }));

    // Messages
    const convs = getStoredConversations().map(c => {
      const msgs = c.messages || [];
      const last = msgs[msgs.length - 1] || {};
      return {
        id: c.id,
        initials: (c.name || 'MD').slice(0, 2).toUpperCase(),
        avatarBg: c.avatarBg || '#0F1E3D',
        name: c.name || 'Locataire',
        property: c.property || 'Chambre salon · 65 000 F',
        lastMessage: last.text || 'Nouvelle conversation',
        time: c.time || '10:43',
        unread: c.unread || 0,
        event: c.visiteBadge || 'Visite demandée'
      };
    });

    this.setData({
      demandes: formattedDemandes,
      locataires: locs,
      messagesList: convs
    });
  },

  onSelectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onToggleExpand(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    const expandedMap = { ...this.data.expandedMap };
    expandedMap[id] = !expandedMap[id];
    this.setData({ expandedMap });
  },

  onAccept(e) {
    const id = e.currentTarget.dataset.id;
    updateStoredVisiteStatus(id, 'accepted');
    this.refreshAll();
    wx.showToast({
      title: 'Visite acceptée !',
      icon: 'success'
    });
  },

  onRefuse(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Refuser cette demande ?',
      content: 'Le locataire sera notifié avec bienveillance.',
      confirmText: 'Refuser',
      confirmColor: COLORS.berry,
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          updateStoredVisiteStatus(id, 'rejected');
          this.refreshAll();
          wx.showToast({ title: 'Demande refusée' });
        }
      }
    });
  },

  onOpenHoraires() {
    wx.navigateTo({ url: '/pages/bailleur/horaires/horaires' });
  },

  onProposeHoraire(e) {
    wx.navigateTo({
      url: '/pages/bailleur/conversation/conversation?id=AD'
    });
  },

  onOpenChat(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/bailleur/conversation/conversation?id=${id || 'AD'}&name=${encodeURIComponent(name || 'Awa Diop')}`
    });
  },

  onCall(e) {
    const phone = e.currentTarget.dataset.phone || '771234567';
    wx.makePhoneCall({ phoneNumber: phone });
  },

  onCallClient(e) {
    const phone = e.currentTarget.dataset.phone || '771234567';
    wx.makePhoneCall({
      phoneNumber: String(phone).replace(/\s+/g, '')
    });
  },

  onWhatsAppClient(e) {
    const { name, phone } = e.currentTarget.dataset || {};
    const cleanPhone = String(phone || '77 123 45 67').replace(/\s+/g, '');
    wx.setClipboardData({
      data: cleanPhone,
      success: () => {
        wx.showModal({
          title: 'WhatsApp · ' + (name || 'Locataire'),
          content: 'Le numéro ' + cleanPhone + ' a été copié. Vous pouvez lui écrire directement sur WhatsApp.',
          showCancel: false,
          confirmText: 'Compris',
          confirmColor: COLORS.navy
        });
      }
    });
  },

  onGoClientsPage() {
    wx.redirectTo({
      url: '/pages/bailleur/locataires/locataires'
    });
  }
});
