import { storage } from '../../../utils/storage.js';
import { setCustomTabBarActive } from '../../../utils/helpers/tab-bar';
import { STORAGE_KEYS } from '../../../utils/constants/index';
import { getAllLogements } from '../../../utils/mocks/logements';
import { getFavoritesMap, getFavoriteIds, toggleFavoriteId } from '../../../utils/helpers/favorites';
import { TINTS } from '../../../utils/constants/theme';

function setTabBarVisible(page, visible) {
  try {
    if (visible) wx.showTabBar({ animation: false });
    else wx.hideTabBar({ animation: false });
  } catch (e) {}

  try {
    if (page && typeof page.getTabBar === 'function') {
      const tb = page.getTabBar();
      if (tb && typeof tb.setVisible === 'function') {
        tb.setVisible(visible);
      } else if (tb) {
        tb.setData({ hidden: !visible });
      }
    }
  } catch (e) {}
}

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
  'keur massar': ['pikine', 'thiaroye'],
  almadies: ['ngor', 'ouakam', 'yoff']
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
    focusField: '', // champ actif (lieu | budget) : halo + icône animée
    statusBarHeight: 24,
    place: 'Ouakam',
    budget: '60 000',

    // Résultats affichés directement sur la même page
    hasSearched: false,
    isSearching: false,
    scrollTarget: '',
    results: [],
    resultsCount: 0,
    searchedPlace: '',
    searchedBudget: '',

    fallbackZones: ['Ouakam', 'Ngor', 'Yoff', 'Mermoz', 'Almadies', 'Pikine'],

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
      { text: 'Chambre salon à Ouakam, max 60 000 F', place: 'Ouakam', budget: '60 000', lang: 'FR' },
      { text: 'Dafa ma bëgg chambre 50 000 F ci Ngor', place: 'Ngor', budget: '50 000', lang: 'WO' },
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
      favoritesCount: favIds.length || 4
    });

    // Lancement de la recherche initiale directement sous les critères
    this.doSearch(this.data.place, 60000);
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

    // Assure l'affichage permanent de la TabBar
    try { wx.showTabBar({ animation: false }); } catch (e) {}
  },

  // ==========================================
  // CHAMPS DU FORMULAIRE
  // ==========================================
  // Mise en avant du champ en cours de saisie (motion design)
  onFieldFocus(e) {
    this.setData({ focusField: e.currentTarget.dataset.field });
  },

  onFieldBlur() {
    this.setData({ focusField: '' });
  },

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

  // ==========================================
  // RECHERCHE DIRECTE SUR LA MÊME PAGE (SANS REDIRECTION)
  // ==========================================
  onSearchTap() {
    this.doSearch(undefined, undefined, true);
  },

  doSearch(targetPlace, targetBudgetNum, shouldScroll = false) {
    if (this.data.isSearching) return;

    const rawPlace = targetPlace !== undefined ? targetPlace : this.data.place;
    const pl = (rawPlace || '').trim();
    const numBudget = targetBudgetNum !== undefined
      ? Number(targetBudgetNum) || 0
      : (Number(String(this.data.budget).replace(/\D/g, '')) || 0);

    const normQuery = normalize(pl);
    const allLogements = getAllLogements();
    const tints = TINTS;

    // Filtrage direct selon la localité et le budget
    const filtered = allLogements.filter((l) => {
      // Filtre lieu
      let matchPlace = true;
      if (normQuery) {
        const normPlace = normalize(l.place);
        const normZone = normalize(l.zone);
        const normTitle = normalize(l.title);
        matchPlace = normPlace.includes(normQuery) || 
                     normZone.includes(normQuery) || 
                     normTitle.includes(normQuery) ||
                     normQuery.includes(normZone);
      }

      // Filtre budget (loyer mensuel <= budget maximum)
      let matchBudget = true;
      if (numBudget > 0) {
        matchBudget = l.price <= numBudget;
      }

      return matchPlace && matchBudget;
    });

    // Mise en forme des résultats
    const results = filtered.map((l, i) => ({
      ...l,
      rank: i + 1,
      formattedPrice: formatMoney(l.price),
      tintBg: tints[i % tints.length],
      isFav: !!this.data.favorites[l.id]
    }));

    if (!shouldScroll) {
      this.setData({
        hasSearched: true,
        results,
        resultsCount: results.length,
        searchedPlace: pl,
        searchedBudget: numBudget > 0 ? formatMoney(numBudget) : ''
      });
      return;
    }

    // Micro-interaction fluide sur le bouton
    this.setData({ isSearching: true });

    setTimeout(() => {
      this.setData({
        isSearching: false,
        hasSearched: true,
        results,
        resultsCount: results.length,
        searchedPlace: pl,
        searchedBudget: numBudget > 0 ? formatMoney(numBudget) : '',
        scrollTarget: 'results-section'
      });

      // Réinitialise la cible après le scroll pour permettre de re-cliquer
      setTimeout(() => {
        this.setData({ scrollTarget: '' });
      }, 500);
    }, 200);
  },

  // ==========================================
  // ACTIONS D'AFFINAGE EN CAS DE RÉSULTAT VIDE OU MODIFICATION
  // ==========================================
  onSelectFallbackZone(e) {
    const zone = e.currentTarget.dataset.zone;
    if (!zone) return;
    this.setData({ place: zone });
    this.doSearch(zone, this.data.budget ? Number(String(this.data.budget).replace(/\D/g, '')) : 0, true);
  },

  onApplyBudgetBump(e) {
    const add = Number(e.currentTarget.dataset.add) || 0;
    const current = Number(String(this.data.budget).replace(/\D/g, '')) || 50000;
    const nextBudget = add > 0 ? current + add : 0;
    const formatted = nextBudget > 0 ? formatMoney(nextBudget) : '';
    this.setData({ budget: formatted });
    this.doSearch(this.data.place, nextBudget, true);
  },

  onResetSearch() {
    this.setData({ place: '', budget: '' });
    this.doSearch('', 0, true);
  },

  // Clic sur une carte logement -> Détail du logement
  onListingTap(e) {
    const item = e.currentTarget.dataset.item;
    if (!item || !item.id) return;

    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${item.id}`
    });
  },

  // ==========================================
  // BASCULE LOCATAIRE <-> BAILLEUR (Image 2)
  // ==========================================
  onSwitchToBailleur() {
    storage.set(STORAGE_KEYS.USER_ROLE, 'bailleur');
    wx.reLaunch({ url: '/pages/bailleur/home/home' });
  },

  // Défilement rapide vers la liste des logements (Image 1)
  onQuickScrollToResults() {
    this.setData({ scrollTarget: 'results-section' });
    setTimeout(() => {
      this.setData({ scrollTarget: '' });
    }, 500);
  },

  // Aller vers les favoris
  onGoToFavorites() {
    wx.navigateTo({
      url: '/pages/client/favoris/favoris'
    });
  },

  // ==========================================
  // RECHERCHE VOCALE SIMPLE (WOLOF ET FRANÇAIS)
  // ==========================================
  onVoiceTap() {
    setTabBarVisible(this, false);
    this.setData({
      showVoiceModal: true,
      isRecording: true,
      voiceStatus: 'À l’écoute… Dis ce que tu cherches'
    });

    try {
      const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
      if (rm) {
        rm.onStart(() => {
          this.setData({ isRecording: true, voiceStatus: 'Enregistrement en cours…' });
        });
        rm.onStop(() => {
          this.setData({ isRecording: false, voiceStatus: 'Touchez pour réécouter ou choisissez un exemple' });
        });
        rm.start({ duration: 5000, sampleRate: 16000, format: 'mp3' });
      }
    } catch (err) {}
  },

  onCloseVoiceModal() {
    try {
      const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
      if (rm) rm.stop();
    } catch (e) {}
    setTabBarVisible(this, true);
    this.setData({ showVoiceModal: false, isRecording: false });
  },

  onToggleRecord() {
    if (this.data.isRecording) {
      this.setData({
        isRecording: false,
        voiceStatus: 'Touchez pour parler ou choisissez un exemple ci-dessous'
      });
      try {
        const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
        if (rm) rm.stop();
      } catch (e) {}
    } else {
      this.setData({
        isRecording: true,
        voiceStatus: 'À l’écoute… Parlez en wolof ou en français'
      });
      try {
        const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
        if (rm) rm.start({ duration: 5000, sampleRate: 16000, format: 'mp3' });
      } catch (e) {}
    }
  },

  onApplyVoicePrompt(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    try {
      const rm = wx.getRecorderManager ? wx.getRecorderManager() : null;
      if (rm) rm.stop();
    } catch (e) {}

    const parsed = parseNaturalQuery(item.text);
    const targetPlace = parsed.place || item.place || 'Ouakam';
    const targetBudget = parsed.budget || item.budget || '60 000';
    const numBudget = Number(String(targetBudget).replace(/\D/g, '')) || 0;

    // Fermeture propre du modal et restauration de la TabBar
    setTabBarVisible(this, true);
    this.setData({
      place: targetPlace,
      budget: targetBudget,
      showVoiceModal: false,
      isRecording: false
    });

    // Lance la recherche avec EXACTEMENT la même animation et le même scroll que la recherche normale
    this.doSearch(targetPlace, numBudget, true);
  },

  // ==========================================
  // GESTION DES FAVORIS DIRECTEMENT SUR LES CARTES
  // ==========================================
  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    const liked = !this.data.favorites[id];
    toggleFavoriteId(id, liked);
    const favIds = getFavoriteIds();
    const favMap = getFavoritesMap();

    // Met à jour les résultats en local
    const updatedResults = this.data.results.map((r) => {
      if (r.id === id) {
        return { ...r, isFav: liked };
      }
      return r;
    });

    this.setData({
      favorites: favMap,
      favoritesCount: favIds.length || 0,
      results: updatedResults
    });

    this.showMagnifiqueToast({
      title: liked ? 'Ajouté aux favoris' : 'Retiré des favoris',
      subtitle: liked ? 'Retrouve ce logement dans tes favoris' : '',
      type: 'heart',
      iconClass: 'icon-toast-heart',
      duration: 2000
    });
  },

  // Toast Flottant SAMA LOYER
  showMagnifiqueToast({ title, subtitle = '', type = 'search', iconClass = 'icon-toast-search', duration = 2400 }) {
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
  },

  noop() {},
  true() {}
});
