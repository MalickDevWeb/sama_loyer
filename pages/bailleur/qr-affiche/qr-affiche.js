// pages/bailleur/qr-affiche/qr-affiche.js
// Affiche QR à imprimer pour un logement : collée à l'entrée de la chambre.
// Logement libre → les visiteurs voient l'annonce et demandent une visite.
// Logement loué → le locataire scanne pour payer son loyer avec Max it.
import { getStoredBailleurAnnonces, requireBailleurAccess } from '../../../utils/helpers/store';
import { logementLink, shortCode } from '../../../utils/helpers/sama-links';
import { getCanvas, drawPoster, exportCanvas, saveToAlbum } from '../../../utils/helpers/qr-canvas';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';

// Affiche dessinée hors écran à 620 px × densité 2 = 1 240 px de large (impression A6 nette)
const POSTER_WIDTH = 620;
const POSTER_SCALE = 2;

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    poster: null, // { title, place, priceText, rented, link, code }
    canvasWidth: POSTER_WIDTH,
    canvasHeight: Math.round(POSTER_WIDTH * 1.414),
    posterImage: '', // PNG exporté : c'est lui qui est affiché (le canvas reste caché)
    posterStyle: '', // taille de l'aperçu calculée pour tenir dans l'écran (sans défilement)
    canvasFailed: false,
    saving: false
  },

  onLoad(options) {
    const id = options && options.id ? decodeURIComponent(options.id) : '';
    const annonces = getStoredBailleurAnnonces();
    const a = annonces.find((x) => x.id === id) || annonces[0];
    if (!a) {
      wx.showToast({ title: 'Logement introuvable', icon: 'none' });
      return;
    }
    this.setData({
      poster: {
        title: a.title,
        place: String(a.placeName || '').replace(/\s*·\s*$/, ''),
        priceText: `${a.price} / mois`,
        rented: a.type === 'loue',
        link: logementLink(a.id),
        code: shortCode(a.id)
      }
    });
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    requireBailleurAccess();
  },

  onReady() {
    this.renderPoster();
  },

  // Dessin hors écran puis export en image : l'image défile normalement avec la page
  renderPoster() {
    if (!this.data.poster) return;
    getCanvas(this, '#qa-canvas', POSTER_SCALE)
      .then(({ canvas, ctx, width }) => {
        drawPoster(ctx, width, this.data.poster);
        return exportCanvas(canvas);
      })
      .then((posterImage) => this.setData({ posterImage }, () => this.fitPoster()))
      .catch(() => this.setData({ canvasFailed: true }));
  },

  // Plus grande affiche (format A6, 1 : 1,414) qui tient dans l'espace restant
  fitPoster() {
    wx.createSelectorQuery()
      .select('.qa-preview')
      .boundingClientRect((box) => {
        if (!box || !box.width || !box.height) return;
        let height = box.height;
        let width = height / 1.414;
        if (width > box.width) {
          width = box.width;
          height = width * 1.414;
        }
        this.setData({ posterStyle: `width: ${Math.floor(width)}px; height: ${Math.floor(height)}px;` });
      })
      .exec();
  },

  // Le canvas est remis dans la page (wx:if) avant de redessiner
  onRetryPoster() {
    this.setData({ canvasFailed: false, posterImage: '' }, () => this.renderPoster());
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.redirectTo({ url: '/pages/bailleur/annonces/annonces' }) });
  },

  // Image PNG dans la galerie : à imprimer (A6 ou A5) ou à envoyer à un imprimeur
  onSavePoster() {
    const { posterImage, saving } = this.data;
    if (!posterImage || saving) return;
    this.setData({ saving: true });
    saveToAlbum(posterImage)
      .then(() => {
        wx.showModal({
          title: 'Affiche enregistrée',
          content: 'Elle est dans ta galerie. Imprime-la (format A6 ou A5), plastifie-la si possible et colle-la à l’entrée du logement.',
          showCancel: false,
          confirmText: 'Compris',
          confirmColor: '#C8235F'
        });
      })
      .catch((err) => {
        const denied = err && err.errMsg && err.errMsg.indexOf('auth') !== -1;
        wx.showToast({
          title: denied ? 'Autorise l’accès à la galerie dans les réglages' : 'Enregistrement impossible',
          icon: 'none'
        });
      })
      .then(() => this.setData({ saving: false }));
  },

  onPreviewPoster() {
    const { posterImage } = this.data;
    if (posterImage) wx.previewImage({ urls: [posterImage], current: posterImage });
  },

  onCopyLink() {
    wx.setClipboardData({
      data: this.data.poster.link,
      success: () => wx.showToast({ title: 'Lien copié', icon: 'success' })
    });
  }
});
