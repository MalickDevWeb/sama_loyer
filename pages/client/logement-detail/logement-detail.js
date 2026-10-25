import { redirectToWhatsApp, redirectToSMS } from '../../../utils/helpers/share-redirect.js';
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

function formatVideoTime(seconds) {
  const s = Math.floor(seconds || 0);
  const m = Math.floor(s / 60);
  const remS = s % 60;
  const mm = m < 10 ? '0' + m : '' + m;
  const ss = remS < 10 ? '0' + remS : '' + remS;
  return `${mm}:${ss}`;
}

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
    showProcheModal: false,
    playingVideo: false,
    videoCurrentTime: 0,
    videoDuration: 0,
    videoCurrentTimeFmt: '00:00',
    videoDurationFmt: '00:00',
    showVisitModal: false,
    selectedVisitDate: 'Demain à 16h',
    visitSlots: [
      'Demain à 16h',
      'Samedi à 11h',
      'Dimanche à 15h30',
      'Lundi à 17h'
    ],
    isColoc: true,
    roomCapacity: 2,
    availablePlacesCount: 1,
    placePrice: 40000,
    placePriceFormatted: '40 000',
    soloPrice: 80000,
    soloPriceFormatted: '80 000',
    genderPolicyLabel: 'Hommes uniquement',
    selectedPlaceNumber: 2,
    places: [
      { id: 'p1', placeNumber: 1, status: 'OCCUPEE', statusLabel: 'Occupé (Awa D.)' },
      { id: 'p2', placeNumber: 2, status: 'DISPONIBLE', statusLabel: 'Disponible' }
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

    const isColoc = Boolean(logement.isColoc);
    const firstAvailable = (logement.places || []).find(p => p.status === 'DISPONIBLE');
    this.setData({
      uiState: 'content',
      headerTop: top,
      logement,
      isColoc,
      roomCapacity: logement.roomCapacity || 2,
      availablePlacesCount: logement.availablePlacesCount || 1,
      placePrice: logement.placePrice || 40000,
      placePriceFormatted: logement.placePriceFormatted || '40 000',
      soloPrice: logement.soloPrice || 80000,
      soloPriceFormatted: logement.soloPriceFormatted || '80 000',
      genderPolicyLabel: logement.genderPolicyLabel || 'Hommes uniquement',
      selectedPlaceNumber: firstAvailable ? firstAvailable.placeNumber : 1,
      places: logement.places || [],
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

  onShareProche() {
    this.setData({
      showShare: false,
      showProcheModal: true
    });
  },

  onCloseProcheModal() {
    this.setData({ showProcheModal: false });
  },

  onShareSMS() {
    this.setData({ showShare: false, showProcheModal: false });
    const l = this.data.logement;
    const msg = `Salam ! Regarde ce logement sur SAMA LOYER : ${l.title} (${l.price} FCFA/mois à ${l.place}). Lien : ${this.shareLink()}`;
    redirectToSMS({
      text: msg
    });
  },

  onShareWhatsApp() {
    this.setData({ showShare: false, showProcheModal: false });
    redirectToWhatsApp({
      text: this.shareText()
    });
  },

  onCopyLink() {
    wx.setClipboardData({
      data: this.shareLink(),
      success: () => {
        this.setData({ showShare: false, showProcheModal: false });
        wx.showToast({ title: 'Lien copié', icon: 'success' });
      }
    });
  },

  onShareMore() {
    this.setData({
      showShare: false,
      showProcheModal: true
    });
  },

  // Carte envoyée par WeChat (bouton open-type="share" ou menu •••)
  onShareAppMessage() {
    const l = this.data.logement;
    this.setData({ showShare: false, showProcheModal: false });
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
    this.setData({
      playingVideo: true,
      videoCurrentTime: 0,
      videoDuration: 0,
      videoCurrentTimeFmt: '00:00',
      videoDurationFmt: '00:00'
    });
    this.videoCtx = wx.createVideoContext('vplayer-video', this);
    if (this.videoCtx) {
      this.videoCtx.play();
    }
  },

  onCloseVideo() {
    if (this.videoCtx) {
      this.videoCtx.stop();
    }
    this.setData({ playingVideo: false });
  },

  onVideoTimeUpdate(e) {
    if (this._isSeeking) return;
    const currentTime = Math.floor(e.detail.currentTime || 0);
    const duration = Math.floor(e.detail.duration || 0);
    this.setData({
      videoCurrentTime: currentTime,
      videoDuration: duration,
      videoCurrentTimeFmt: formatVideoTime(currentTime),
      videoDurationFmt: formatVideoTime(duration)
    });
  },

  onVideoSliderChanging(e) {
    this._isSeeking = true;
    const val = Number(e.detail.value || 0);
    this.setData({
      videoCurrentTime: val,
      videoCurrentTimeFmt: formatVideoTime(val)
    });
  },

  onVideoSliderChange(e) {
    const val = Number(e.detail.value || 0);
    this._isSeeking = false;
    this.setData({
      videoCurrentTime: val,
      videoCurrentTimeFmt: formatVideoTime(val)
    });
    if (this.videoCtx) {
      this.videoCtx.seek(val);
    }
  },

  onVideoRewind10() {
    const target = Math.max(0, (this.data.videoCurrentTime || 0) - 10);
    this.setData({
      videoCurrentTime: target,
      videoCurrentTimeFmt: formatVideoTime(target)
    });
    if (this.videoCtx) {
      this.videoCtx.seek(target);
    }
  },

  onVideoForward10() {
    const maxDur = this.data.videoDuration || 100;
    const target = Math.min(maxDur, (this.data.videoCurrentTime || 0) + 10);
    this.setData({
      videoCurrentTime: target,
      videoCurrentTimeFmt: formatVideoTime(target)
    });
    if (this.videoCtx) {
      this.videoCtx.seek(target);
    }
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
      itemColor: '#0F1E3D',
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
          redirectToWhatsApp({
            text: msg,
            phone: bailleur.phone
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
      itemColor: '#C8235F',
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

  // --- Logiques de Colocation & Lits -------------------------------------------
  onSelectBedPlace(e) {
    const place = e.currentTarget.dataset.place;
    if (place.status === 'OCCUPEE' || place.status === 'RESERVEE') {
      wx.showToast({ title: 'Ce lit est déjà occupé', icon: 'none' });
      return;
    }
    if (place.status === 'BLOQUEE') {
      wx.showToast({ title: 'Place temporairement verrouillée', icon: 'none' });
      return;
    }
    this.setData({ selectedPlaceNumber: place.placeNumber });
  },

  onReservePlace() {
    const num = this.data.selectedPlaceNumber;
    wx.showModal({
      title: `Lit #${num} sélectionné 🛏️`,
      content: `Tu bloques ce lit pour ${this.data.placePriceFormatted} FCFA/mois. Un verrou de 15 minutes est activé pour te permettre de finaliser ton avance avec Orange Money / Wave.`,
      confirmText: 'Payer l\'avance',
      confirmColor: COLORS.berry,
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/client/louer-sans-visite/louer-sans-visite?id=${encodeURIComponent(this.data.logement.id)}&placeNumber=${num}&mode=coloc`
          });
        }
      }
    });
  },

  onPrivatizeSolo() {
    wx.showModal({
      title: 'Privatisation Solo 🏠',
      content: `Prendre l'intégralité de la chambre pour toi seul coûte ${this.data.soloPriceFormatted} FCFA/mois.\n\nSi tu valides, les colocataires en cours de réservation seront intégralement remboursés sans frais sur Orange Money.`,
      confirmText: 'Privatiser',
      confirmColor: COLORS.berry,
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          wx.navigateTo({
            url: `/pages/client/louer-sans-visite/louer-sans-visite?id=${encodeURIComponent(this.data.logement.id)}&mode=solo_privatization`
          });
        }
      }
    });
  },

  onInviteDuoWhatsApp() {
    const l = this.data.logement;
    const shareText = `Salut ! J'ai trouvé cette chambre partagée à ${l.place} (${this.data.placePriceFormatted} FCFA/lit) sur SAMA LOYER. Viens on la prend en binôme : https://samaloyer.sn/logement/${l.id}?coloc=1`;
    wx.setClipboardData({
      data: shareText,
      success: () => {
        wx.showModal({
          title: 'Lien d\'invitation copié ! 📋',
          content: 'Le texte et le lien sécurisé Duo ont été copiés dans ton presse-papier. Ouvre WhatsApp pour l\'envoyer à ton binôme.',
          showCancel: false,
          confirmText: 'Compris',
          confirmColor: COLORS.berry
        });
      }
    });
  },

  noop() {}
});

