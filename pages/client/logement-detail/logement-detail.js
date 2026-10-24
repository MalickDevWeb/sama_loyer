import { LOGEMENTS, getLogementById, toLogementDetail } from '../../../utils/mocks/logements';
import { isFavorite, toggleFavoriteId } from '../../../utils/helpers/favorites';
import { COLORS } from '../../../utils/constants/theme';
import { takeNavData } from '../../../utils/helpers/nav-data';
import { backendAPI } from '../../../utils/apis/index.js';
import { parseSamaLink } from '../../../utils/helpers/sama-links';
import { getStoredRentedHomes } from '../../../utils/helpers/store';
import { storage } from '../../../utils/storage.js';
import { STORAGE_KEYS } from '../../../utils/constants/index';

// Fiche affichée si l'id est absent ou inconnu
const DEFAULT_LOGEMENT = toLogementDetail(getLogementById('icotaf-01') || LOGEMENTS[0]);

Page({
  data: {
    uiState: 'content', // 'loading' | 'content' | 'error'
    statusBarHeight: 24,
    headerTop: 54,
    logement: DEFAULT_LOGEMENT,
    currentSlideIndex: 0,
    isExpandedDesc: false,
    isFavorite: true,
    heartPop: false, // petite animation du cœur au clic
    solidHeader: false, // barre du haut blanche une fois la photo dépassée
    showShare: false,
    playingVideo: false,
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
    // QR SAMA LOYER scanné avec Max it : le lien arrive dans options.q
    const scanned = options && options.q ? parseSamaLink(options.q) : null;
    if (scanned) {
      storage.set(STORAGE_KEYS.USER_ROLE, 'client');
      // Invitation du bailleur → contrat à signer et entrée à payer
      if (scanned.type === 'invite' && scanned.logementId) {
        wx.redirectTo({ url: `/pages/client/entree/entree?id=${encodeURIComponent(scanned.logementId)}` });
        return;
      }
      // Affiche de la chambre scannée par son locataire → paiement du loyer
      const home = getStoredRentedHomes().find((h) => h.id === `rented-${scanned.logementId}`);
      if (home) {
        wx.reLaunch({ url: `/pages/client/loyers/loyers?id=${encodeURIComponent(home.id)}` });
        return;
      }
      // Sinon : fiche du logement (visite, location)
      options = Object.assign({}, options, { id: scanned.logementId });
    }

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
    // Logement transmis par la page précédente (évite un appel), sinon chargé par son id
    const passed = takeNavData(options);
    const found = passed || (options && options.id ? getLogementById(decodeURIComponent(options.id)) : null);
    const logement = found ? toLogementDetail(found) : DEFAULT_LOGEMENT;

    this.setData({
      uiState: 'content',
      headerTop: top,
      logement,
      isFavorite: isFavorite(logement.id)
    });

    if (!passed && options && options.id) {
      this.fetchDetailFromApi(decodeURIComponent(options.id));
    }
  },

  async fetchDetailFromApi(id) {
    try {
      const data = await backendAPI.getLogementById(id);
      if (data) {
        this.setData({ logement: toLogementDetail(data) });
      }
    } catch (e) {
      // Le fallback initial reste affiché
    }
  },

  onBackTap() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({ url: '/pages/client/home/home' });
    }
  },

  // --- Barre du haut ------------------------------------------------------------
  onDetailScroll(e) {
    const solid = e.detail.scrollTop > 240;
    if (solid !== this.data.solidHeader) this.setData({ solidHeader: solid });
  },

  // --- Partage ---------------------------------------------------------------------
  shareLink() {
    return `https://samaloyer.sn/logement/${this.data.logement.id}`;
  },

  shareText() {
    const l = this.data.logement;
    return `🏠 ${l.title} · ${l.price} FCFA / mois\n📍 ${l.placeDetails}\nVu sur SAMA LOYER : ${this.shareLink()}`;
  },

  onShareTap() {
    this.setData({ showShare: true });
  },

  onCloseShare() {
    this.setData({ showShare: false });
  },

  onShareWhatsApp() {
    wx.setClipboardData({
      data: this.shareText(),
      success: () => {
        this.setData({ showShare: false });
        wx.showToast({ title: 'Message copié, colle-le dans WhatsApp', icon: 'none', duration: 2500 });
      }
    });
  },

  onCopyLink() {
    wx.setClipboardData({
      data: this.shareLink(),
      success: () => {
        this.setData({ showShare: false });
        wx.showToast({ title: 'Lien copié', icon: 'success' });
      }
    });
  },

  onShareMore() {
    wx.showShareMenu({ withShareTicket: true, menus: ['shareAppMessage', 'shareTimeline'] });
    this.setData({ showShare: false });
    wx.showToast({ title: 'Touche ••• en haut pour plus d’options', icon: 'none', duration: 2500 });
  },

  // Carte envoyée par « À un proche » (bouton open-type="share") et le menu •••
  onShareAppMessage() {
    const l = this.data.logement;
    this.setData({ showShare: false });
    return {
      title: `${l.title} · ${l.price} FCFA / mois`,
      path: `/pages/client/logement-detail/logement-detail?id=${l.id}`,
      imageUrl: l.slides && l.slides[0] ? l.slides[0].url : ''
    };
  },

  onShareTimeline() {
    const l = this.data.logement;
    return { title: `${l.title} · ${l.price} FCFA / mois`, query: `id=${l.id}` };
  },

  // --- J'aime ----------------------------------------------------------------------
  onToggleFavorite() {
    const fav = !this.data.isFavorite;
    this.setData({ isFavorite: fav, heartPop: fav });
    toggleFavoriteId(this.data.logement.id, fav);
    if (fav && wx.vibrateShort) wx.vibrateShort({ type: 'light' });
    clearTimeout(this.popTimer);
    this.popTimer = setTimeout(() => this.setData({ heartPop: false }), 400);

    wx.showToast({
      title: fav ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris',
      icon: 'none'
    });
  },

  // --- Vidéo de visite -----------------------------------------------------------
  onPlayVideo() {
    this.setData({ playingVideo: true });
  },

  onCloseVideo() {
    this.setData({ playingVideo: false });
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

  // Glisser dans la galerie (photos / vidéo)
  onSwiperChange(e) {
    if (e.detail.source === 'touch' || e.detail.source === 'autoplay' || e.detail.current !== this.data.currentSlideIndex) {
      this.setData({ currentSlideIndex: e.detail.current });
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
      confirmColor: COLORS.navy,
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
                confirmText: 'WhatsApp'
              });
            }
          });
        } else if (res.tapIndex === 2) {
          wx.navigateTo({ url: `/pages/client/chat/chat?logementId=${encodeURIComponent(this.data.logement.id)}` });
        }
      }
    });
  },

  // Payer caution + avance : parcours « Entrer dans le logement »
  onPayCaution() {
    wx.navigateTo({
      url: `/pages/client/entree/entree?id=${encodeURIComponent(this.data.logement.id)}`
    });
  },

  onLouerSansVisite() {
    wx.navigateTo({
      url: `/pages/client/louer-sans-visite/louer-sans-visite?id=${encodeURIComponent(this.data.logement.id)}`
    });
  },

  onOpenVisitModal() {
    wx.navigateTo({
      url: `/pages/client/demande-visite/demande?id=${encodeURIComponent(this.data.logement.id)}`
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
        confirmText: 'Voir messages',
        confirmColor: COLORS.berry,
        cancelText: 'Fermer',
        success: (res) => {
          if (res.confirm) {
            wx.switchTab({ url: '/pages/client/messages/messages' });
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
  },

  noop() {}
});

