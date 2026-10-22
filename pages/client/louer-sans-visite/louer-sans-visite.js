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
    todoText: ''
  },

  onLoad(options) {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({ statusBarHeight: sys.statusBarHeight || 20 });
    } catch (e) {}

    const id = options && options.id ? decodeURIComponent(options.id) : 'icotaf-01';
    this.setData({ logementId: getLogementById(id) ? id : 'icotaf-01' });

    // État de l'écran (hors data : pas affiché tel quel)
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
    wx.showToast({ title: id === 'video' ? 'Vidéo regardée' : 'Photos regardées', icon: 'none' });
  },

  onToggleCheck(e) {
    const i = Number(e.currentTarget.dataset.index);
    if (this.data.checks[i].locked) {
      wx.showToast({ title: 'Regarde d’abord les photos et la vidéo', icon: 'none' });
      return;
    }
    this.ok[i] = !this.ok[i];
    this.refresh();
  },

  onVideoCall() {
    wx.navigateTo({ url: `/pages/client/chat/chat?logementId=${this.data.logementId}` });
  },

  onContinue() {
    if (!this.data.ready) return;
    wx.navigateTo({ url: `/pages/client/entree/entree?id=${this.data.logementId}&remote=1` });
  }
});
