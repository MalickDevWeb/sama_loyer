import { storage } from '../../utils/storage.js';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { STORAGE_KEYS } from '../../utils/constants/index';
import { LOGEMENTS as LISTINGS } from '../../utils/mocks/logements';
import { getFavoritesMap, toggleFavoriteId } from '../../utils/helpers/favorites';

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
    searched: true,
    recs: [],
    heading: '',
    summary: '',
    userRole: 'client', // 'client' | 'bailleur'
    favorites: {},
    showVoiceModal: false,
    showDetailModal: false,
    selectedListing: null,
    totalInitialCost: 0,
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
      const role = storage.get(STORAGE_KEYS.USER_ROLE, 'client');
      this.setData({ userRole: role });
    } catch (e) {}

    this.runSearch();
  },

  onShow() {
    setCustomTabBarActive(this, 'home');
    // Les favoris peuvent avoir changé sur une autre page
    this.setData({ favorites: getFavoritesMap() });
  },

  // ==========================================
  // RECHERCHE ÉCRITE (EN DIRECT ET PAR ENTRÉE)
  // ==========================================
  onPlaceInput(e) {
    const val = e.detail.value || '';
    this.setData({ place: val }, () => {
      // Recherche dynamique si plus de 2 caractères
      if (val.trim().length >= 2) {
        this.setData({
          qPlace: val.trim(),
          searched: true
        });
        this.runSearch();
      }
    });
  },

  onClearPlace() {
    this.setData({ place: '', qPlace: '' }, () => {
      this.runSearch();
    });
  },

  onBudgetInput(e) {
    const raw = e.detail.value || '';
    const digits = raw.replace(/\D/g, '');
    const formatted = digits ? formatMoney(Number(digits)) : '';
    this.setData({
      budget: formatted,
      qBudget: Number(digits) || 0
    }, () => {
      if (digits.length >= 4) {
        this.runSearch();
      }
    });
  },

  onClearBudget() {
    this.setData({ budget: '', qBudget: 0 }, () => {
      this.runSearch();
    });
  },

  onSearchTap() {
    const b = Number(String(this.data.budget).replace(/\D/g, '')) || 0;
    this.setData(
      {
        qPlace: this.data.place.trim(),
        qBudget: b,
        searched: true
      },
      () => {
        this.runSearch();
        wx.showToast({
          title: `Recherche : ${this.data.place || 'Dakar'}`,
          icon: 'none',
          duration: 1200
        });
      }
    );
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

    // Gestion de l'enregistreur vocal WeChat si disponible
    try {
      const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
      if (rm) {
        rm.onStart(() => {
          this.setData({ isRecording: true, voiceStatus: 'Enregistrement en cours…' });
        });
        rm.onStop((res) => {
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

    // Extrait critères via moteur NLP Wolof/FR
    const parsed = parseNaturalQuery(item.text);
    const targetPlace = parsed.place || item.place || 'Ouakam';
    const targetBudget = parsed.budget || item.budget || '60 000';
    const numBudget = Number(String(targetBudget).replace(/\D/g, '')) || 0;

    this.setData(
      {
        place: targetPlace,
        budget: targetBudget,
        qPlace: targetPlace,
        qBudget: numBudget,
        showVoiceModal: false,
        isRecording: false,
        searched: true
      },
      () => {
        wx.showToast({
          title: `Reconnu (${item.lang}) : ${targetPlace}`,
          icon: 'success',
          duration: 1500
        });
        this.runSearch();
      }
    );
  },

  // ==========================================
  // MOTEUR DE MATCHING IA SAMA LOGEMENT
  // ==========================================
  runSearch() {
    const q = normalize(this.data.qPlace);
    const budget = this.data.qBudget || 0;
    const zoneKey = Object.keys(NEAR_ZONES).find((z) => q && (q.indexOf(z) >= 0 || z.indexOf(q) >= 0)) || '';
    const tints = ['#FBE3EC', '#E3E9F5', '#F3ECE1'];

    const scored = LISTINGS.map((l) => {
      let s = 0;
      let why = '';
      const inZone = zoneKey && l.zone === zoneKey;
      const nearZone = zoneKey && (NEAR_ZONES[zoneKey] || []).indexOf(l.zone) >= 0;

      if (inZone) {
        s += 50;
        why = 'Dans ton quartier';
      } else if (nearZone) {
        s += 30;
        why = `Juste à côté de ${this.data.qPlace || 'ta zone'}`;
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
        } else if (l.price <= budget * 1.1) {
          s += 10;
          why += ' · un peu au-dessus';
        } else {
          s -= 100;
        }
      } else {
        s += 20;
      }

      return Object.assign({}, l, { score: s, why: why });
    })
      .filter((l) => l.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const recs = scored.map((l, i) => {
      return {
        ...l,
        rank: i + 1,
        formattedPrice: formatMoney(l.price),
        match: Math.min(98, l.score + 8) + ' % pour toi',
        reason: l.why,
        tintBg: tints[i % tints.length]
      };
    });

    const n = recs.length;
    const heading = n ? `Tes ${n} meilleurs logements` : 'Aucun logement trouvé';
    const summary = n
      ? (this.data.qPlace || 'Partout à Dakar') + (budget ? ' · ' + formatMoney(budget) + ' F max' : '')
      : 'Essaie un budget un peu plus élevé ou un quartier voisin.';

    this.setData({
      recs,
      heading,
      summary,
      searched: true
    });
  },

  onGoToAllResults() {
    wx.navigateTo({
      url: `/pages/search/results?place=${encodeURIComponent(this.data.place || 'Ouakam')}&budget=${encodeURIComponent(this.data.budget || '60 000')}`
    });
  },

  onListingTap(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    wx.navigateTo({
      url: `/pages/logement-detail/logement-detail?id=${item.id}`,
      fail: () => {
        const initialTotal = (item.price || 0) + (item.caution || 0) + (item.avance || 0) + (item.frais || 0);
        this.setData({
          selectedListing: item,
          totalInitialCost: initialTotal,
          showDetailModal: true
        });
      }
    });
  },

  onCloseDetailModal() {
    this.setData({ showDetailModal: false, selectedListing: null });
  },

  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    const liked = !this.data.favorites[id];
    toggleFavoriteId(id, liked);
    this.setData({ favorites: getFavoritesMap() });
    wx.showToast({ title: liked ? 'Ajouté aux favoris ❤️' : 'Retiré des favoris', icon: 'none' });
  },

  onSwitchProfile() {
    wx.showActionSheet({
      itemList: ['Voir mon Profil (Awa Diop)', 'Basculer en Espace Bailleur (Moussa D.)'],
      success: (res) => {
        if (res.tapIndex === 0) {
          wx.switchTab({ url: '/pages/profile/profile' });
        } else {
          storage.set(STORAGE_KEYS.USER_ROLE, 'bailleur');
          this.setData({ userRole: 'bailleur' });
          wx.reLaunch({ url: '/pages/bailleur/home/home' });
        }
      }
    });
  }
});
