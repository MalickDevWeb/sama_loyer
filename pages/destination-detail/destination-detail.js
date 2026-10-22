import { toggleFavoriteId } from '../../utils/helpers/favorites';
import { isValidPackageId, loadPackage } from '../../utils/helpers/catalog';
import { toDestinationDetailView } from '../../utils/helpers/destination';
import { navigateToLocked, navigateWithLock } from '../../utils/helpers/navigation';
import { Bus } from '../../utils/event/index.js';

const app = getApp();

Page({
  data: {
    destination: null,
    isLiked: false,
    pageState: 'loading',
    errorMessage: '',
    canRetry: false,
    pageTopOffset: 32,
    showPreview: false,
    previewIndex: 0,
    previewGallery: [],
  },

  async onLoad(options = {}) {
    const sysInfo = wx.getSystemInfoSync();
    const statusBarHeight = sysInfo.statusBarHeight || 20;

    this.setData({
      pageTopOffset: statusBarHeight + 16,
    });

    this.destinationId = options.id || '';
    if (!isValidPackageId(this.destinationId)) {
      this.setData({
        pageState: 'error',
        canRetry: false,
        errorMessage: 'Identifiant de destination absent ou invalide.',
      });
      return;
    }

    await this.loadDestination();
  },

  async loadDestination() {
    this.setData({
      pageState: 'loading',
      destination: null,
      errorMessage: '',
      canRetry: true,
      showPreview: false,
    });
    try {
      const destination = await loadPackage(this.destinationId);
      if (!destination) {
        this.setData({
          pageState: 'notFound',
          errorMessage: "Destination introuvable. Retournez à l'accueil pour choisir une destination disponible.",
          canRetry: false,
        });
        return;
      }

      const normalizedDestination = toDestinationDetailView(destination);
      this.packageData = destination;
      this.setData({
        destination: normalizedDestination,
        isLiked: Boolean(destination.like),
        pageState: 'success',
        errorMessage: '',
        canRetry: false,
      });
    } catch (error) {
      const isNotFound = error && (error.status === 404 || error.code === 'NOT_FOUND');
      this.setData({
        pageState: isNotFound ? 'notFound' : 'error',
        errorMessage: isNotFound
          ? "Destination introuvable. Retournez à l'accueil pour choisir une destination disponible."
          : (error && error.message) || 'Impossible de charger cette destination. Réessayez.',
        canRetry: !isNotFound,
      });
    }
  },

  retryLoad() {
    if (this.data.canRetry) this.loadDestination();
  },

  handleBack() {
    navigateWithLock(this, () => new Promise((resolve, reject) => {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({ success: resolve, fail: reject });
        return;
      }
      wx.switchTab({ url: '/pages/home/home', success: resolve, fail: reject });
    }), '_backLocked');
  },

  handleToggleLike() {
    const { destination, isLiked } = this.data;

    if (!destination || this._likeLocked) {
      return;
    }

    this._likeLocked = true;
    setTimeout(() => {
      this._likeLocked = false;
    }, 300);

    const nextLiked = !isLiked;

    // 1. Sauvegarder dans le stockage persistant
    toggleFavoriteId(destination.id, nextLiked);

    // 2. Mettre à jour app.globalData.DESTINATIONS
    const updatedDestinations = (app.globalData.DESTINATIONS || []).map((item) => (
      String(item.id) === String(destination.id)
        ? { ...item, like: nextLiked }
        : item
    ));

    app.globalData.DESTINATIONS = updatedDestinations;

    this.setData({
      isLiked: nextLiked,
      destination: {
        ...destination,
        like: nextLiked,
      },
    });
  },

  handleReserve() {
    const { destination } = this.data;

    if (!destination || !destination.id) return;
    const pkg = this.packageData;
    Bus.setState('booking.package-context', {
      ...pkg,
      location: pkg.subtitle || pkg.location || ''
    });
    navigateToLocked(this, `/pages/booking/booking?destinationId=${destination.id}`, '_bookingLocked');
  },

  handlePreviewGallery(event) {
    const destination = this.data.destination;

    if (!destination) return;

    const gallery = Array.isArray(destination.gallery)
      ? destination.gallery.filter((img) => typeof img === 'string' && img.length > 0)
      : [];

    if (gallery.length === 0) {
      wx.showToast({
        title: 'Aucune image',
        icon: 'none',
      });
      return;
    }

    let index = Number(event.currentTarget.dataset.index);

    if (!Number.isFinite(index) || index < 0 || index >= gallery.length) {
      index = 0;
    }

    this.setData({
      showPreview: true,
      previewIndex: index,
      previewGallery: gallery,
    });
  },

  closePreview() {
    this.setData({
      showPreview: false,
    });
  },

  prevPreviewImage() {
    const { previewIndex, previewGallery } = this.data;
    const length = previewGallery.length;

    this.setData({
      previewIndex: (previewIndex - 1 + length) % length,
    });
  },

  nextPreviewImage() {
    const { previewIndex, previewGallery } = this.data;
    const length = previewGallery.length;

    this.setData({
      previewIndex: (previewIndex + 1) % length,
    });
  },

  onPreviewChange(e) {
    this.setData({
      previewIndex: e.detail.current,
    });
  },
});
