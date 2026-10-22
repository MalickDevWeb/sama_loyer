import { Bus } from '../../utils/event/index.js';

function safeDecode(value) {
  if (!value) {
    return '';
  }

  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function createScaleAnimation(scale, opacity, duration, timingFunction) {
  const animation = wx.createAnimation({
    duration,
    timingFunction,
    delay: 0,
    transformOrigin: '50% 50% 0',
  });

  animation
    .opacity(opacity)
    .scale(scale)
    .step();

  return animation.export();
}

Page({
  data: {
    reference: '',
    amount: '',
    status: 'confirmed',
    statusTitle: 'Confirmée !',
    statusSubtitle: 'Votre aventure commence maintenant ! Préparez-vous pour une expérience inoubliable.',
    showIntroSuccess: true,
    introDocked: false,
    introLeaving: false,
    isStaticSuccessVisible: false,
    isContentVisible: false,
    introSuccessAnimation: null,
  },

  onLoad(options = {}) {
    // 1. Récupération des données du Bus (post-paiement)
    const bookingData = Bus.getState('booking.created.data');
    if (bookingData) Bus.removeState('booking.created.data'); // Nettoyage de la RAM
    
    // 2. Fusion (Le Bus est prioritaire, l'URL sert de secours)
    const data = bookingData || {};
    // Les données proviennent maintenant du payload API complet !
    const status = data.status || safeDecode(options.status) || 'confirmed';
    const reference = data.bookingRef || safeDecode(options.reference);
    const amount = data.total || safeDecode(options.amount); 
    let statusTitle = 'Confirmée !';
    let statusSubtitle = 'Votre aventure commence maintenant ! Préparez-vous pour une expérience inoubliable.';
    if (status === 'pending_payment') {
      statusTitle = 'Enregistrée !';
      statusSubtitle = 'Votre réservation a bien été reçue. Le paiement est en cours de traitement.';
    }
    this.setData({
      reference,
      amount,
      status,
      statusTitle,
      statusSubtitle,
    });
    this.resetIntroAnimationState();
  },

  onShow() {
    if (this._hasPlayedIntro) {
      return;
    }

    this._hasPlayedIntro = true;
    this.startIntroAnimation();
  },

  onUnload() {
    this.clearIntroTimers();
  },

  resetIntroAnimationState() {
    this.clearIntroTimers();
    this._introTimers = [];

    this.setData({
      showIntroSuccess: true,
      introDocked: false,
      introLeaving: false,
      isStaticSuccessVisible: false,
      isContentVisible: false,
      introSuccessAnimation: createScaleAnimation(0.2, 0.08, 0, 'linear'),
    });
  },

  startIntroAnimation() {
    this.queueIntroStep(() => {
      this.setData({
        introSuccessAnimation: createScaleAnimation(
          1.25,
          1,
          420,
          'ease-out'
        ),
      });
    }, 50);

    this.queueIntroStep(() => {
      this.setData({
        introSuccessAnimation: createScaleAnimation(
          1,
          1,
          280,
          'ease-in-out'
        ),
      });
    }, 500);

    this.queueIntroStep(() => {
      this.setData({
        introDocked: true,
      });
    }, 820);

    this.queueIntroStep(() => {
      this.setData({
        isStaticSuccessVisible: true,
        introLeaving: true,
      });
    }, 1200);

    this.queueIntroStep(() => {
      this.setData({
        showIntroSuccess: false,
        isContentVisible: true,
      });
    }, 1360);
  },

  queueIntroStep(callback, delay) {
    const timer = setTimeout(callback, delay);
    this._introTimers.push(timer);
  },

  clearIntroTimers() {
    if (!this._introTimers || !this._introTimers.length) {
      this._introTimers = [];
      return;
    }

    this._introTimers.forEach((timer) => clearTimeout(timer));
    this._introTimers = [];
  },

  handleDownloadReceipt() {
    wx.showToast({
      title: 'Reçu en préparation',
      icon: 'none',
    });
  },

  handleContactWhatsApp() {
    wx.showToast({
      title: 'WhatsApp bientôt disponible',
      icon: 'none',
    });
  },

  handleGoHome() {
    wx.reLaunch({
      url: '/pages/home/home',
    });
  },
});
