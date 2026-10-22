import { LOGEMENTS, getLogementById, toLogementDetail } from '../../utils/mocks/logements';
import { isFavorite, toggleFavoriteId } from '../../utils/helpers/favorites';

// Fiche affichée si l'id est absent ou inconnu
const DEFAULT_LOGEMENT = toLogementDetail(getLogementById('icotaf-01') || LOGEMENTS[0]);

Page({
  data: {
    statusBarHeight: 24,
    headerTop: 54,
    logement: DEFAULT_LOGEMENT,
    currentSlideIndex: 0,
    isExpandedDesc: false,
    isFavorite: true,
    showVisitModal: false,
    selectedVisitDate: 'Demain à 16h',
    visitSlots: [
      'Demain à 16h',
      'Samedi à 11h',
      'Dimanche à 15h30',
      'Lundi à 17h'
    ]
  },

  onLoad(options) {
    let top = 54;
    try {
      const menuBtn = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      if (menuBtn && menuBtn.bottom) {
        // Position below the native WeChat capsule button with margin
        top = menuBtn.bottom + 10;
      } else {
        const sys = wx.getSystemInfoSync();
        top = (sys.statusBarHeight || 20) + 44;
      }
    } catch (e) {
      top = 54;
    }
    const found = options && options.id ? getLogementById(decodeURIComponent(options.id)) : null;
    const logement = found ? toLogementDetail(found) : DEFAULT_LOGEMENT;

    this.setData({
      headerTop: top,
      logement,
      isFavorite: isFavorite(logement.id)
    });
  },

  onBackTap() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/home/home' });
    }
  },

  onShareTap() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
    wx.showToast({ title: 'Lien de partage copié', icon: 'none' });
  },

  onToggleFavorite() {
    const fav = !this.data.isFavorite;
    this.setData({ isFavorite: fav });
    toggleFavoriteId(this.data.logement.id, fav);

    wx.showToast({
      title: fav ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris',
      icon: 'none'
    });
  },

  onPrevSlide() {
    const total = this.data.logement.slides.length;
    const prev = (this.data.currentSlideIndex - 1 + total) % total;
    this.setData({ currentSlideIndex: prev });
  },

  onNextSlide() {
    const total = this.data.logement.slides.length;
    const next = (this.data.currentSlideIndex + 1) % total;
    this.setData({ currentSlideIndex: next });
  },

  onSelectThumb(e) {
    const idx = Number(e.currentTarget.dataset.index);
    if (!isNaN(idx)) {
      this.setData({ currentSlideIndex: idx });
    }
  },

  onToggleDesc() {
    this.setData({ isExpandedDesc: !this.data.isExpandedDesc });
  },

  onOpenMap() {
    wx.showModal({
      title: 'Localisation approximative 📍',
      content: `${this.data.logement.placeDetails}\n\nPour la sécurité du logement, l’adresse exacte vous sera transmise après la confirmation du créneau de visite.`,
      confirmText: 'D’accord',
      confirmColor: '#0F1E3D',
      showCancel: false
    });
  },

  onContactTap() {
    const bailleur = this.data.logement.bailleur;
    wx.showActionSheet({
      itemList: [
        `Appeler ${bailleur.name} (${bailleur.phone})`,
        `Contacter via WhatsApp`,
        `Envoyer un message SAMA`
      ],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.makePhoneCall({ phoneNumber: bailleur.phone });
        } else if (res.tapIndex === 1) {
          const msg = `Bonjour ${bailleur.name}, je suis intéressé par votre annonce "${this.data.logement.title}" à ${this.data.logement.place}.`;
          wx.setClipboardData({
            data: msg,
            success: () => {
              wx.showModal({
                title: 'WhatsApp 💬',
                content: `Le message pré-rempli pour ${bailleur.name} a été copié. Vous pouvez le coller dans WhatsApp.`,
                showCancel: false,
                confirmText: 'Ouvrir WhatsApp'
              });
            }
          });
        } else if (res.tapIndex === 2) {
          wx.navigateTo({ url: '/pages/messages/chat/chat?id=MD' });
        }
      }
    });
  },

  onPayCaution() {
    wx.navigateTo({
      url: '/pages/loyers/loyers?tab=caution'
    });
  },

  onOpenVisitModal() {
    wx.navigateTo({
      url: '/pages/visites/demande/demande'
    });
  },

  onCloseVisitModal() {
    this.setData({ showVisitModal: false });
  },

  onSelectSlot(e) {
    const slot = e.currentTarget.dataset.slot;
    this.setData({ selectedVisitDate: slot });
  },

  onSubmitVisit() {
    wx.showLoading({ title: 'Envoi de la demande...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ showVisitModal: false });
      wx.showModal({
        title: 'Demande envoyée ! 📅',
        content: `Votre demande pour le créneau "${this.data.selectedVisitDate}" a été transmise à ${this.data.logement.bailleur.name}.\n\nVous recevrez une notification dès sa confirmation.`,
        confirmText: 'Voir mes messages',
        confirmColor: '#C8235F',
        cancelText: 'Fermer',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/messages/messages' });
          }
        }
      });
    }, 900);
  },

  onReportListing() {
    wx.showActionSheet({
      itemList: [
        'Annonce déjà louée / indisponible',
        'Prix différent de l’annonce',
        'Coordonnées ou photos trompeuses',
        'Suspicion de fraude'
      ],
      success: (res) => {
        wx.showToast({
          title: 'Signalement transmis à la modération',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});

