function formatVideoTime(secs) {
  const s = Math.max(0, Math.floor(secs || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return String(m).padStart(2, '0') + ':' + String(rem).padStart(2, '0');
}

import { getLogementById } from '../../../utils/mocks/logements';
import { getMedia } from '../../../utils/mocks/media';

const MEDIA = [
  { id: 'photos', label: 'Les 5 photos', sub: 'Salon, chambre, douche, cuisine, extérieur', icon: 'photo', tint: '#FBE3EC' },
  { id: 'video', label: 'La vidéo de visite', sub: 'Filmée par le bailleur', icon: 'play-line', tint: '#E3E9F5' }
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
    video: null,
    videoCurrentTime: 0,
    videoDuration: 0,
    videoCurrentTimeFmt: '00:00',
    videoDurationFmt: '00:00',
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
    const logementId = getLogementById(id) ? id : 'icotaf-01';
    this.setData({ logementId });
    // Mêmes photos et vidéo que sur la fiche du logement
    this.mediaSet = getMedia(logementId);

    this.seen = {};
    this.ok = {};
    this.refresh();
  },

  refresh() {
    const seenAll = MEDIA.every((m) => this.seen[m.id]);
    const okAll = CHECKS.every((c, i) => this.ok[i]);
    this.setData({
      media: MEDIA.map((m) => ({
        ...m,
        seen: !!this.seen[m.id],
        thumb: m.id === 'video' ? this.mediaSet.video.poster : this.mediaSet.gallery[0].url
      })),
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
    if (e.currentTarget.dataset.id === 'video') this.openVideo();
    else this.openPhotos();
  },

  // Galerie plein écran native (glisser entre les photos)
  openPhotos() {
    const urls = this.mediaSet.gallery.map((g) => g.url);
    wx.previewImage({ urls, current: urls[0] });
    this.seen.photos = true;
    this.refresh();
    this.showFloatingToast({
      title: 'Photos validées 📸',
      subtitle: 'Les 5 photos ont été consultées',
      type: 'success',
      duration: 2200
    });
  },

  // Lecteur vidéo en fenêtre ; la vidéo compte comme vue à la fermeture
  openVideo() {
    this.setData({
      video: this.mediaSet.video,
      videoCurrentTime: 0,
      videoDuration: 0,
      videoCurrentTimeFmt: '00:00',
      videoDurationFmt: '00:00'
    });
    this.videoCtx = wx.createVideoContext('lsv-player-video', this);
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

  onCloseVideo() {
    this.setData({ video: null });
    this.seen.video = true;
    this.refresh();
    this.showFloatingToast({
      title: 'Vidéo validée 🎬',
      subtitle: 'La vidéo de visite a été visionnée',
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
    this.setData({ showMediaRequiredModal: false });
    this.openPhotos();
  },

  onViewVideoFromModal() {
    this.setData({ showMediaRequiredModal: false });
    this.openVideo();
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
  },

  noop() {}
});
