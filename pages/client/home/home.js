import { storage } from '../../../utils/storage.js';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import { getAllLogements } from '../../../utils/mocks/logements';
import { getFavoritesMap, getFavoriteIds, toggleFavoriteId } from '../../../utils/helpers/favorites';

const NEAR_ZONES = {
  ouakam: ['ngor', 'mermoz', 'yoff', 'almadies'],
  ngor: ['ouakam', 'yoff', 'almadies'],
  yoff: ['ngor', 'ouakam', 'grand yoff'],
  mermoz: ['ouakam', 'sacre coeur', 'point e'],
  'point e': ['mermoz', 'sacre coeur'],
  'sacre coeur': ['mermoz', 'liberte', 'point e'],
  liberte: ['sacre coeur', 'grand yoff'],
  'grand yoff': ['liberte', 'yoff'],
  pikine: ['thiaroye', 'keur massar', 'grand yoff'],
  thiaroye: ['pikine', 'keur massar'],
  'keur massar': ['pikine', 'thiaroye']
};

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseNaturalQuery(text) {
  const norm = normalize(text);
  let place = '';
  let budget = '';

  const knownZones = [
    { key: 'ouakam', label: 'Ouakam' },
    { key: 'ngor', label: 'Ngor' },
    { key: 'yoff', label: 'Yoff' },
    { key: 'mermoz', label: 'Mermoz' },
    { key: 'point e', label: 'Point E' },
    { key: 'sacre coeur', label: 'Sacré-Cœur' },
    { key: 'liberte', label: 'Liberté 6' },
    { key: 'grand yoff', label: 'Grand Yoff' },
    { key: 'pikine', label: 'Pikine' },
    { key: 'icotaf', label: 'Pikine' },
    { key: 'technopole', label: 'Pikine' },
    { key: 'thiaroye', label: 'Pikine' },
    { key: 'guinaw rails', label: 'Pikine' },
    { key: 'keur massar', label: 'Keur Massar' },
    { key: 'almadies', label: 'Almadies' }
  ];

  for (const z of knownZones) {
    if (norm.includes(z.key)) {
      place = z.label;
      break;
    }
  }

  // Look for budget numbers
  const matchNum = text.match(/(\d[\d\s]{2,}\d)/);
  if (matchNum) {
    budget = matchNum[1].trim();
  } else {
    const simpleNum = text.match(/(\d+)\s*(?:f|cfa|fcfa|mille)?/i);
    if (simpleNum) {
      const val = parseInt(simpleNum[1], 10);
      budget = formatMoney(val < 1000 ? val * 1000 : val);
    }
  }

  return { place, budget };
}

Page({
  data: {
    statusBarHeight: 24,
    place: 'Ouakam',
    budget: '60 000',
    qPlace: 'Ouakam',
    qBudget: 60000,
    formattedBudget: '60 000',
    searchState: 'form', // 'form' | 'loading' | 'results' | 'failed'
    step1Done: false,
    step2Done: false,
    step3Done: false,
    recs: [],
    fallbackListings: [],
    fallbackZones: ['Ngor', 'Yoff', 'Mermoz', 'Grand Yoff'],
    minObservedPrice: '55 000',
    favorites: {},
    favoritesCount: 4,
    toast: {
      visible: false,
      hiding: false,
      title: '',
      subtitle: '',
      type: 'search',
      iconClass: 'icon-toast-search'
    },
    userRole: 'client',
    showVoiceModal: false,
    isRecording: false,
    voiceStatus: 'À l’écoute… (Wolof / Français)',
    voicePrompts: [
      { text: 'Chambre salon à Ouakam, budget 60 000 F', place: 'Ouakam', budget: '60 000', lang: 'FR' },
      { text: 'Dafa ma bëgg chambre 50 000 F ci Ngor', place: 'Ngor', budget: '50 000', lang: 'WO' },
      { text: 'Chambre salon à Pikine Icotaf max 65 000 F', place: 'Pikine', budget: '65 000', lang: 'FR' },
      { text: 'Studio meublé vers Pikine Rue 10, 95 000 F', place: 'Pikine', budget: '95 000', lang: 'FR' },
      { text: 'Dafa ma bëgg appartement F3 Technopole 180 000 F', place: 'Pikine', budget: '180 000', lang: 'WO' },
      { text: 'Studio meublé vers Point E ou Mermoz', place: 'Point E', budget: '150 000', lang: 'FR' }
    ]
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}

    try {
      storage.set(STORAGE_KEYS.USER_ROLE, 'client');
      this.setData({ userRole: 'client' });
    } catch (e) {}

    const favIds = getFavoriteIds();
    this.setData({
      favorites: getFavoritesMap(),
      favoritesCount: favIds.length || 4,
      searchState: 'form'
    });
  },

  onShow() {
    try {
      storage.set(STORAGE_KEYS.USER_ROLE, 'client');
    } catch (e) {}
    setCustomTabBarActive(this, 'home');
    const favIds = getFavoriteIds();
    this.setData({
      favorites: getFavoritesMap(),
      favoritesCount: favIds.length || 4
    });

    if (this.data.searchState === 'form') {
      try { wx.showTabBar({ animation: false }); } catch (e) {}
    }
  },

  // ==========================================
  // RECHERCHE ÉCRITE & CHAMPS DU FORMULAIRE
  // ==========================================
  onPlaceInput(e) {
    this.setData({ place: e.detail.value || '' });
  },

  onClearPlace() {
    this.setData({ place: '' });
  },

  onBudgetInput(e) {
    const raw = e.detail.value || '';
    const digits = raw.replace(/\D/g, '');
    const formatted = digits ? formatMoney(Number(digits)) : '';
    this.setData({ budget: formatted });
  },

  onClearBudget() {
    this.setData({ budget: '' });
  },

  // Clic sur "Rechercher"
  onSearchTap() {
    const pl = this.data.place.trim();
    const b = Number(String(this.data.budget).replace(/\D/g, '')) || 0;
    this.startAiSearch(pl, b);
  },

  // ==========================================
  // SÉQUENCE D'ANALYSE IA ("L'IA cherche pour toi...")
  // ==========================================
  startAiSearch(targetPlace, targetBudgetNum) {
    const pl = (targetPlace !== undefined ? targetPlace : this.data.place).trim();
    const numBudget = targetBudgetNum !== undefined 
      ? targetBudgetNum 
      : (Number(String(this.data.budget).replace(/\D/g, '')) || 0);

    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    // Masque la TabBar pour immersion plein écran fluide
    try {
      wx.hideTabBar({ animation: true });
    } catch (e) {}

    this.setData({
      searchState: 'loading',
      qPlace: pl,
      qBudget: numBudget,
      step1Done: false,
      step2Done: false,
      step3Done: false
    });

    // Étape 1 : Lecture de la demande (400ms)
    setTimeout(() => {
      this.setData({ step1Done: true });
    }, 450);

    // Étape 2 : Comparaison dans le quartier (1100ms)
    setTimeout(() => {
      this.setData({ step2Done: true });
    }, 1100);

    // Étape 3 : Sélection des meilleurs (1700ms)
    setTimeout(() => {
      this.setData({ step3Done: true });
    }, 1700);

    // Finalisation & Transition vers Résultats ou Échec (2100ms)
    setTimeout(() => {
      this.executeAiSearch(pl, numBudget);
    }, 2100);
  },

  // Moteur de scoring et matching IA
  executeAiSearch(qPlace, budget) {
    const q = normalize(qPlace);
    const zoneKey = Object.keys(NEAR_ZONES).find((z) => q && (q.indexOf(z) >= 0 || z.indexOf(q) >= 0)) || '';
    
    // Tentes assorties pour l'illustration des cartes (Rose, Bleu brume, Beige doux)
    const tints = ['#FDEEF2', '#E8EEF5', '#F5EFE6'];

    // 1. Recherche exacte
    const allLogements = getAllLogements();
    const scored = allLogements.map((l) => {
      let s = 0;
      let why = '';
      const inZone = zoneKey && l.zone === zoneKey;
      const nearZone = zoneKey && (NEAR_ZONES[zoneKey] || []).indexOf(l.zone) >= 0;

      if (inZone) {
        s += 50;
        why = 'Dans ton quartier';
      } else if (nearZone) {
        s += 30;
        why = `Juste à côté de ${qPlace || 'ta zone'}`;
      } else if (!q) {
        s += 25;
        why = 'Recommandé à Dakar';
      } else {
        why = 'Bon rapport qualité-prix';
      }

      if (budget > 0) {
        if (l.price <= budget) {
          s += 40 - Math.round(((budget - l.price) / budget) * 15);
          why += ' · dans ton budget';
        } else if (l.price <= budget * 1.08) {
          s += 8;
          why += ' · légèrement au-dessus';
        } else {
          s -= 120; // En dehors du budget
        }
      } else {
        s += 20;
      }

      return Object.assign({}, l, { score: s, why });
    })
      .filter((l) => l.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (scored.length > 0) {
      const recs = scored.map((l, i) => ({
        ...l,
        rank: i + 1,
        formattedPrice: formatMoney(l.price),
        reason: l.why,
        tintBg: tints[i % tints.length]
      }));

      if (wx.vibrateShort) wx.vibrateShort();

      this.setData({
        recs,
        formattedBudget: formatMoney(budget),
        searchState: 'results'
      });
    } else {
      // 2. Recherche échouée ("fail le recherche") -> Proposer alternatives IA
      const fallbackNearby = zoneKey && NEAR_ZONES[zoneKey] 
        ? NEAR_ZONES[zoneKey].map(k => k.charAt(0).toUpperCase() + k.slice(1))
        : ['Ngor', 'Yoff', 'Mermoz', 'Grand Yoff'];

      // Trouver les logements disponibles les plus proches en termes de zone ou budget
      const fallbacks = allLogements.filter(l => {
        if (zoneKey && (l.zone === zoneKey || (NEAR_ZONES[zoneKey] || []).includes(l.zone))) return true;
        return l.price <= (budget > 0 ? budget * 1.3 : 100000);
      })
      .slice(0, 2)
      .map((l, i) => ({
        ...l,
        rank: i + 1,
        formattedPrice: formatMoney(l.price),
        reason: zoneKey && l.zone === zoneKey ? 'Dans ton quartier · budget supérieur' : 'Quartier voisin disponible',
        tintBg: tints[i % tints.length]
      }));

      if (wx.vibrateShort) wx.vibrateShort();

      this.setData({
        recs: [],
        fallbackZones: fallbackNearby,
        fallbackListings: fallbacks,
        searchState: 'failed'
      });
    }
  },

  // Revenir au formulaire pour modifier les critères
  onModifyTap() {
    this.setData({ searchState: 'form' });
    try {
      wx.showTabBar({ animation: true });
    } catch (e) {}
  },

  // Clic sur une suggestion de quartier voisin en cas d'échec
  onSelectFallbackZone(e) {
    const zone = e.currentTarget.dataset.zone;
    if (!zone) return;
    this.setData({ place: zone });
    this.startAiSearch(zone, this.data.qBudget);
  },

  // Aller vers tous les résultats
  onGoToAllResults() {
    wx.navigateTo({
      url: `/pages/client/search/results?place=${encodeURIComponent(this.data.place || 'Ouakam')}&budget=${encodeURIComponent(this.data.budget || '60 000')}`
    });
  },

  // Aller vers les favoris
  onGoToFavorites() {
    wx.navigateTo({
      url: '/pages/client/favoris/favoris'
    });
  },

  // Clic sur une carte logement -> Détail
  onListingTap(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${item.id}`
    });
  },

  // ==========================================
  // RECHERCHE VOCALE (WOLOF ET FRANÇAIS)
  // ==========================================
  onVoiceTap() {
    this.setData({
      showVoiceModal: true,
      isRecording: true,
      voiceStatus: 'À l’écoute… Parlez en wolof ou en français'
    });

    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    try {
      const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
      if (rm) {
        rm.onStart(() => {
          this.setData({ isRecording: true, voiceStatus: 'Enregistrement en cours…' });
        });
        rm.onStop(() => {
          this.setData({ isRecording: false, voiceStatus: 'Traitement vocal IA…' });
        });
        rm.start({ duration: 6000, sampleRate: 16000, format: 'mp3' });
      }
    } catch (err) {}
  },

  onCloseVoiceModal() {
    try {
      const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
      if (rm) rm.stop();
    } catch (e) {}
    this.setData({ showVoiceModal: false, isRecording: false });
  },

  onToggleRecord() {
    if (this.data.isRecording) {
      this.setData({
        isRecording: false,
        voiceStatus: 'Touchez un exemple ci-dessous pour lancer la recherche'
      });
      try {
        const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
        if (rm) rm.stop();
      } catch (e) {}
    } else {
      this.setData({
        isRecording: true,
        voiceStatus: 'À l’écoute… Parlez maintenant'
      });
      if (wx.vibrateShort) wx.vibrateShort();
    }
  },

  onApplyVoicePrompt(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    if (wx.vibrateShort) {
      wx.vibrateShort();
    }

    const parsed = parseNaturalQuery(item.text);
    const targetPlace = parsed.place || item.place || 'Ouakam';
    const targetBudget = parsed.budget || item.budget || '60 000';
    const numBudget = Number(String(targetBudget).replace(/\D/g, '')) || 0;

    this.setData({
      place: targetPlace,
      budget: targetBudget,
      showVoiceModal: false,
      isRecording: false
    });

    this.startAiSearch(targetPlace, numBudget);
  },

  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    const liked = !this.data.favorites[id];
    toggleFavoriteId(id, liked);
    const favIds = getFavoriteIds();
    this.setData({
      favorites: getFavoritesMap(),
      favoritesCount: favIds.length || 0
    });
    
    this.showMagnifiqueToast({
      title: liked ? 'Ajouté aux favoris' : 'Retiré des favoris',
      subtitle: liked ? 'Retrouve ce logement dans tes favoris' : '',
      type: 'heart',
      iconClass: 'icon-toast-heart',
      duration: 2000
    });
  },

  // Toast Flottant Haute Couture
  showMagnifiqueToast({ title, subtitle = '', type = 'search', iconClass = 'icon-toast-search', duration = 2600 }) {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    if (this._toastHideTimer) clearTimeout(this._toastHideTimer);

    this.setData({
      toast: {
        visible: true,
        hiding: false,
        title,
        subtitle,
        type,
        iconClass
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
            type: 'search',
            iconClass: 'icon-toast-search'
          }
        });
      }, 280);
    }, duration);
  },

  onDismissToast() {
    if (this._toastTimer) clearTimeout(this._toastTimer);
    if (this._toastHideTimer) clearTimeout(this._toastHideTimer);

    this.setData({ 'toast.hiding': true });
    setTimeout(() => {
      this.setData({
        toast: {
          visible: false,
          hiding: false,
          title: '',
          subtitle: '',
          type: 'search',
          iconClass: 'icon-toast-search'
        }
      });
    }, 280);
  }
});
