import { getLogementById } from '../../../utils/mocks/logements';

const MEDIA = [
  { id: 'photos', label: 'Les 4 photos', sub: 'Salon, chambre, douche, cour', icon: 'photo', tint: '#FBE3EC' },
  { id: 'video', label: 'La vidéo de visite', sub: '0:28 · filmée par le bailleur', icon: 'play-line', tint: '#E3E9F5' }
];

const GUARDS = [
  { t: 'Bailleur vérifié', d: 'Son identité a été contrôlée par SAMA LOYER.' },
  { t: 'Annonce validée', d: 'Photos et vidéo vérifiées par notre équipe avant publication.' },
  { t: 'Paiement tracé avec Max it', d: 'Chaque paiement a un reçu. Jamais d’argent en main propre.' },
  { t: '48 h pour signaler un problème', d: 'Si le logement ne correspond pas à l’annonce à ton arrivée, signale-le : notre équipe examine ton dossier.' }
];

const CHECKS = ['J’ai regardé toutes les photos et la vidéo', 'Je loue sans avoir visité, en connaissance de cause'];

Page({
  data: {
    statusBarHeight: 20,
    logementId: 'icotaf-01',
    media: [],
    guards: GUARDS,
    checks: [],
    ready: false,
    todoText: '',
    showMediaRequiredModal: false,
    toast: {
      visible: false,
      hiding: false,
      title: '',
      subtitle: '',
      type: 'warning'
    }
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    const id = options && options.id ? decodeURIComponent(options.id) : 'icotaf-01';
    this.setData({ logementId: getLogementById(id) ? id : 'icotaf-01' });

    this.seen = {};
    this.ok = {};
    this.refresh();
  },

  refresh() {
    const seenAll = MEDIA.every((m) => this.seen[m.id]);
    const okAll = CHECKS.every((c, i) => this.ok[i]);
    this.setData({
      media: MEDIA.map((m) => ({ ...m, seen: !!this.seen[m.id] })),
      checks: CHECKS.map((label, i) => ({ label, on: !!this.ok[i], locked: i === 0 && !seenAll })),
      ready: seenAll && okAll,
      todoText: !seenAll ? 'Regarde d’abord les photos et la vidéo' : 'Coche les 2 cases pour continuer'
    });
  },

  onBack() {
    wx.navigateBack({
      fail: () => wx.redirectTo({ url: `/pages/client/logement-detail/logement-detail?id=${this.data.logementId}` })
    });
  },

  onOpenMedia(e) {
    const id = e.currentTarget.dataset.id;
    this.seen[id] = true;
    this.refresh();
    
    this.showFloatingToast({
      title: id === 'video' ? 'Vidéo validée 🎬' : 'Photos validées 📸',
      subtitle: id === 'video' ? 'Visite vidéo (0:28) visionnée' : 'Les 4 photos ont été consultées',
      type: 'success',
      duration: 2200
    });
  },

  onToggleCheck(e) {
    const i = Number(e.currentTarget.dataset.index);
    if (this.data.checks[i].locked) {
      if (wx.vibrateShort) wx.vibrateShort();
      this.setData({ showMediaRequiredModal: true });
      return;
    }
    this.ok[i] = !this.ok[i];
    this.refresh();
  },

  onBottomBarTap() {
    if (!this.data.ready) {
      const seenAll = MEDIA.every((m) => this.seen[m.id]);
      if (!seenAll) {
        if (wx.vibrateShort) wx.vibrateShort();
        this.setData({ showMediaRequiredModal: true });
      } else {
        this.showFloatingToast({
          title: 'Confirmation requise',
          subtitle: 'Coche les 2 cases pour continuer vers la location',
          type: 'warning',
          duration: 2500
        });
      }
    }
  },

  onCloseMediaModal() {
    this.setData({ showMediaRequiredModal: false });
  },

  onViewPhotosFromModal() {
    this.seen['photos'] = true;
    this.refresh();
    this.setData({ showMediaRequiredModal: false });
    this.showFloatingToast({
      title: 'Photos validées 📸',
      subtitle: 'Les 4 photos ont été consultées avec succès',
      type: 'success',
      duration: 2200
    });
  },

  onViewVideoFromModal() {
    this.seen['video'] = true;
    this.refresh();
    this.setData({ showMediaRequiredModal: false });
    this.showFloatingToast({
      title: 'Vidéo validée 🎬',
      subtitle: 'La vidéo de visite (0:28) a été visionnée',
      type: 'success',
      duration: 2200
    });
  },

  onConfirmAllSeenFromModal() {
    this.seen['photos'] = true;
    this.seen['video'] = true;
    this.ok[0] = true; // Coche automatiquement la première case
    this.refresh();
    this.setData({ showMediaRequiredModal: false });
    this.showFloatingToast({
      title: 'Vérification complète ✨',
      subtitle: 'Photos et vidéo validées · Case cochée',
      type: 'success',
      duration: 2500
    });
  },

  onVideoCall() {
    wx.navigateTo({ url: `/pages/client/chat/chat?logementId=${this.data.logementId}` });
  },

  onContinue() {
    if (!this.data.ready) return;
    wx.navigateTo({ url: `/pages/client/entree/entree?id=${this.data.logementId}&remote=1` });
  },

  // Notification flottante stylée SAMA LOYER
  showFloatingToast({ title, subtitle = '', type = 'warning', duration = 2400 }) {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    if (this._toastHideTimer) clearTimeout(this._toastHideTimer);

    this.setData({
      toast: {
        visible: true,
        hiding: false,
        title,
        subtitle,
        type
      }
    });

    this._toastTimer = setTimeout(() => {
      this.setData({ 'toast.hiding': true });
      this._toastHideTimer = setTimeout(() => {
        this.setData({
          toast: {
            visible: false,
            hiding: false,
            title: '',
            subtitle: '',
            type: 'warning'
          }
        });
      }, 260);
    }, duration);
  },

  onDismissToast() {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    if (this._toastHideTimer) clearTimeout(this._toastHideTimer);
    this.setData({
      toast: {
        visible: false,
        hiding: false,
        title: '',
        subtitle: '',
        type: 'warning'
      }
    });
  }
});
