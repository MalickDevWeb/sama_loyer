import { STORAGE_KEYS } from '../../utils/constants/index';

const DEFAULT_LOGEMENT = {
  id: 'icotaf-01',
  title: 'Chambre salon avec douche intérieure',
  tagPremium: true,
  typeLabel: 'Chambre salon',
  publishedAgo: 'Publié il y a 2 h',
  place: 'Icotaf, Pikine — Dakar',
  placeDetails: 'Icotaf, Pikine — près du marché',
  price: '65 000',
  dispoDate: 'Disponible dès le 1er novembre 2026',
  dispoConfirmed: 'Confirmé par le bailleur le 20 octobre',
  
  // Prix et conditions
  loyerMensuel: '65 000 FCFA',
  caution: '130 000 FCFA',
  avance: '65 000 FCFA',
  fraisAgence: 'Aucun',
  totalEntree: '195 000 FCFA',
  conditions: [
    'Contrat de location écrit, durée minimale 6 mois',
    'Eau et électricité : compteurs séparés, à la charge du locataire',
    'Pour 1 à 2 personnes'
  ],

  // Description
  descriptionShort: 'Grande chambre carrelée avec un salon séparé, une douche intérieure et des toilettes privées. Le logement est au rez-de-chaussée d\'une maison...',
  descriptionFull: 'Grande chambre carrelée avec un salon séparé, une douche intérieure et des toilettes privées. Le logement est au rez-de-chaussée d\'une maison familiale calme, à 5 minutes à pied du marché et des arrêts de bus. Idéal pour jeune couple ou travailleur cherchant un cadre propre et sécurisé.',

  // Équipements
  equipements: [
    { id: 'douche', label: 'Douche intérieure', icon: 'douche' },
    { id: 'wc', label: 'Toilettes privées', icon: 'wc' },
    { id: 'eau', label: 'Accès à l\'eau', icon: 'eau' },
    { id: 'elec', label: 'Électricité', icon: 'elec' },
    { id: 'cour', label: 'Cour partagée', icon: 'cour' },
    { id: 'placard', label: 'Placard intégré', icon: 'placard' }
  ],

  // Bailleur
  bailleur: {
    name: 'Moussa D.',
    initial: 'MD',
    verified: true,
    responseTime: 'Répond en général en moins d\'une heure',
    phone: '771234567'
  },

  // Slides
  slides: [
    { id: 1, label: 'Salon', bg: '#F5EFE6' },
    { id: 2, label: 'Chambre', bg: '#FCE7F0' },
    { id: 3, label: 'Douche', bg: '#E3E9F5' },
    { id: 4, label: 'Cour', bg: '#E2F0EA' },
    { id: 5, label: 'Vidéo visite', isVideo: true, bg: '#F0EBFA' }
  ]
};

Page({
  data: {
    statusBarHeight: 24,
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
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}

    // Check if favorited
    try {
      const favs = wx.getStorageSync(STORAGE_KEYS.FAVORITES) || {};
      if (favs[this.data.logement.id] !== undefined) {
        this.setData({ isFavorite: !!favs[this.data.logement.id] });
      }
    } catch (e) {}
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
    try {
      const favs = wx.getStorageSync(STORAGE_KEYS.FAVORITES) || {};
      favs[this.data.logement.id] = fav;
      wx.setStorageSync(STORAGE_KEYS.FAVORITES, favs);
    } catch (e) {}

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
          wx.switchTab({ url: '/pages/voyage/voyage' });
        }
      }
    });
  },

  onOpenVisitModal() {
    this.setData({ showVisitModal: true });
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
            wx.switchTab({ url: '/pages/voyage/voyage' });
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

