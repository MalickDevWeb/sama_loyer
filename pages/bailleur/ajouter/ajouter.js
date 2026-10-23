// pages/bailleur/ajouter/ajouter.js
import { addStoredLogement } from '../../../utils/helpers/store';
import { formatMoney } from '../../../utils/mocks/logements';
import { getMedia } from '../../../utils/mocks/media';
import { requireBailleurAccess } from '../../../utils/helpers/store';

const MAX_PHOTOS = 8;
const DEMO_MEDIA = getMedia('nouvelle-annonce');
const DEMO_PHOTOS = DEMO_MEDIA.gallery.slice(0, 3).map((g) => g.url);

// Photos + compteur affiché (le WXML n'utilise que des variables simples)
const photoState = (photos) => ({
  photos,
  photoCount: photos.length,
  canAddPhoto: photos.length < MAX_PHOTOS,
  coverPhoto: photos[0] || ''
});

// Vidéo + affiche de la miniature
const videoState = (video) => ({ video, videoPoster: video ? video.poster : '', hasVideo: !!video });

Page({
  data: {
    // En-tête calé sur la capsule WeChat (valeurs recalculées dans onLoad)
    headStyle: 'padding-top: 44px;',
    navStyle: 'height: 32px; padding-right: 100px;',
    bodyStyle: 'padding-top: 124px;',
    step: 1, // 1 : le logement → 2 : photos et atouts → 3 : confirmation

    // Étape 1 : Type & Quartier
    typeList: ['Chambre salon', 'Chambre simple', 'Studio', 'Appartement F2', 'Maison'],
    selectedType: 'Chambre salon',
    quartierList: ['Ouakam', 'Pikine', 'Ngor', 'Yoff', 'Almadies', 'Grand Yoff', 'Mermoz', 'Liberté 6'],
    selectedQuartier: 'Ouakam',
    adresseDetail: '',

    // Étape 1 (suite) : Loyer & Caution
    loyer: 65000,
    cautionMonths: 1,
    loyerFormatted: '65 000',
    cautionFormatted: '65 000',
    totalEntreeFormatted: '130 000',

    // Étape 2 : Équipements & Description
    equipements: [
      { id: 'eq1', label: 'Toilettes privées', checked: true },
      { id: 'eq2', label: 'Compteur Woyofal individuel', checked: true },
      { id: 'eq3', label: 'Eau courante SDE', checked: true },
      { id: 'eq4', label: 'Balcon privatif', checked: false },
      { id: 'eq5', label: 'Climatisation', checked: false },
      { id: 'eq6', label: 'Meublé', checked: false }
    ],
    description: '',

    // Étape 2 : Photos & Vidéo (pré-remplies avec des médias de démo, remplaçables)
    // Mêmes clés que photoState() / videoState(), écrites en clair pour l'éditeur WXML
    photos: DEMO_PHOTOS,
    photoCount: DEMO_PHOTOS.length,
    canAddPhoto: true,
    coverPhoto: DEMO_PHOTOS[0],
    video: DEMO_MEDIA.video, // { src, poster } | null
    videoPoster: DEMO_MEDIA.video.poster,
    hasVideo: true,
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      const statusBarHeight = sys.statusBarHeight || 20;
      const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const navTop = menu && menu.top ? menu.top : statusBarHeight + 6;
      const navHeight = menu && menu.height ? menu.height : 32;
      const capsuleSpace = menu && menu.left ? sys.windowWidth - menu.left + 8 : 100;
      // Hauteur de l'en-tête : barre de navigation + barre de progression (~40 px)
      const bodyTop = navTop + navHeight + 48;
      const initialStep = options && options.step ? Math.min(Math.max(Number(options.step) || 1, 1), 2) : 1;
      this.setData({
        headStyle: `padding-top: ${navTop}px;`,
        navStyle: `height: ${navHeight}px; padding-right: ${capsuleSpace}px;`,
        bodyStyle: `padding-top: ${bodyTop}px;`,
        step: initialStep
      });
    } catch (e) {}

    this.updateFinancialSummary();
  },

  updateFinancialSummary() {
    const loyer = Number(this.data.loyer) || 0;
    const caution = loyer * (this.data.cautionMonths || 1);
    const total = loyer + caution;
    this.setData({
      loyerFormatted: formatMoney(loyer),
      cautionFormatted: formatMoney(caution),
      totalEntreeFormatted: formatMoney(total)
    });
  },

  onClose() {
    if (this.data.step === 2) {
      this.setData({ step: this.data.step - 1 });
      return;
    }
    if (this.backToAnnonces()) return;
    wx.redirectTo({
      url: '/pages/bailleur/home/home'
    });
  },

  // Ouvert depuis « Mes annonces » : on revient simplement en arrière (la liste se recharge dans onShow)
  backToAnnonces() {
    const pages = getCurrentPages();
    const prev = pages.length > 1 ? pages[pages.length - 2] : null;
    if (prev && prev.route === 'pages/bailleur/annonces/annonces') {
      wx.navigateBack();
      return true;
    }
    return false;
  },

  // --- Étape 1 : le logement ------------------------------------------------
  onSelectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  onSelectQuartier(e) {
    this.setData({ selectedQuartier: e.currentTarget.dataset.quartier });
  },

  onInputAdresse(e) {
    this.setData({ adresseDetail: e.detail.value || '' });
  },

  onInputLoyer(e) {
    const val = Number(e.detail.value) || 0;
    this.setData({ loyer: val }, () => {
      this.updateFinancialSummary();
    });
  },

  onSelectCaution(e) {
    const months = Number(e.currentTarget.dataset.months) || 1;
    this.setData({ cautionMonths: months }, () => {
      this.updateFinancialSummary();
    });
  },

  // --- Étape 2 : équipements, description, photos et vidéo -------------------
  onToggleEquipment(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.equipements.map(eq => {
      if (eq.id === id) {
        return { ...eq, checked: !eq.checked };
      }
      return eq;
    });
    this.setData({ equipements: updated });
  },

  onInputDescription(e) {
    this.setData({ description: e.detail.value || '' });
  },

  // Photos et vidéo réelles (galerie ou appareil photo)
  onAddPhotos() {
    const left = MAX_PHOTOS - this.data.photos.length;
    if (left <= 0) {
      wx.showToast({ title: `${MAX_PHOTOS} photos maximum`, icon: 'none' });
      return;
    }
    wx.chooseMedia({
      count: left,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      sizeType: ['compressed'],
      success: (res) => {
        const added = (res.tempFiles || []).map((f) => f.tempFilePath);
        this.setData(photoState(this.data.photos.concat(added)));
      }
    });
  },

  onPreviewPhoto(e) {
    const i = Number(e.currentTarget.dataset.index) || 0;
    wx.previewImage({ urls: this.data.photos, current: this.data.photos[i] });
  },

  onRemovePhoto(e) {
    const i = Number(e.currentTarget.dataset.index);
    this.setData(photoState(this.data.photos.filter((_, k) => k !== i)));
  },

  onPickVideo() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      success: (res) => {
        const f = (res.tempFiles || [])[0];
        if (!f) return;
        this.setData(videoState({ src: f.tempFilePath, poster: f.thumbTempFilePath || '' }));
      }
    });
  },

  onPlayVideo() {
    const { video } = this.data;
    if (!video || !video.src) return;
    if (wx.previewMedia) {
      wx.previewMedia({ sources: [{ url: video.src, type: 'video', poster: video.poster }] });
    } else {
      wx.showToast({ title: 'Lecture indisponible ici', icon: 'none' });
    }
  },

  onRemoveVideo() {
    this.setData(videoState(null));
  },

  onNextStep() {
    if (!this.data.selectedType) {
      wx.showToast({ title: 'Choisis un type de logement', icon: 'none' });
      return;
    }
    if (!Number(this.data.loyer)) {
      wx.showToast({ title: 'Indique le montant du loyer', icon: 'none' });
      return;
    }
    this.setData({ step: 2 });
    wx.pageScrollTo && wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  onPublishListing() {
    if (this.data.photos.length === 0) {
      wx.showToast({ title: 'Ajoute au moins une photo', icon: 'none' });
      return;
    }
    wx.showLoading({ title: 'Publication...' });

    const selectedEquips = this.data.equipements
      .filter(eq => eq.checked)
      .map(eq => eq.label);

    const placeStr = this.data.adresseDetail
      ? `${this.data.selectedQuartier}, ${this.data.adresseDetail}`
      : `${this.data.selectedQuartier}, Dakar`;

    const loyer = Number(this.data.loyer) || 60000;
    const caution = loyer * (this.data.cautionMonths || 1);

    // Enregistrement effectif dans le Store local !
    addStoredLogement({
      cover: this.data.photos[0] || '',
      title: `${this.data.selectedType} à ${this.data.selectedQuartier}`,
      typeLabel: this.data.selectedType,
      place: placeStr,
      zone: this.data.selectedQuartier.toLowerCase(),
      price: loyer,
      caution: caution,
      avance: loyer,
      equipements: selectedEquips.length ? selectedEquips : ['Toilettes privées', 'Compteur Woyofal'],
      description: this.data.description || `${this.data.selectedType} situé à ${placeStr}.`,
      tint: '#FDE8EE',
      bailleurName: 'Moussa Diop',
      phone: '771234567'
    });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ step: 3 });
      wx.pageScrollTo && wx.pageScrollTo({ scrollTop: 0, duration: 0 });
    }, 600);
  },

  // Repart d'un formulaire vierge pour une nouvelle annonce
  onAddAnother() {
    this.setData({
      step: 1,
      adresseDetail: '',
      description: '',
      ...photoState([]),
      ...videoState(null)
    });
    wx.pageScrollTo && wx.pageScrollTo({ scrollTop: 0, duration: 0 });
  },

  onVoirAnnonces() {
    if (this.backToAnnonces()) return;
    wx.redirectTo({
      url: '/pages/bailleur/annonces/annonces'
    });
  }
});
