> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 🧭 Guide Avancé : Navigation Sécurisée, Behaviors WeChat & Logique Métier

> **Origine & Éprouvé en Production :** Issu de l'architecture de billetterie ATS Explore (`mp-ats-app`), ce document présente les patterns indispensables pour concevoir des parcours utilisateurs robustes, factoriser du code via les Behaviors natifs et gérer des calculs métier complexes (pénalités, favoris, tokens OAuth2).

---

## 🚦 1. Navigation Sécurisée : Le Piège des 10 Pages WeChat

WeChat impose une contrainte stricte sur la pile d'historique de navigation :
* **Limite maximale :** 10 pages simultanées sur la pile (`getCurrentPages().length <= 10`).
* **Comportement par défaut :** Dès que la pile atteint 10 pages, tout appel à `wx.navigateTo` **échoue silencieusement** sans ouvrir la page, bloquant complètement l'utilisateur !

### La Solution : Le Wrapper `navigateToSafe`
Le wrapper vérifie la taille de la pile. Si le plafond de 10 est atteint, il bascule automatiquement sur `wx.redirectTo` pour remplacer la page courante au lieu d'échouer.

```javascript
/**
 * Navigation sécurisée évitant le blocage à 10 pages
 * @param {string} url - URL de la page cible
 */
export function navigateToSafe(url) {
  return new Promise((resolve, reject) => {
    const pages = getCurrentPages();

    if (pages.length >= 10) {
      console.warn('[Nav] Pile pleine (10 pages) : bascule sur redirectTo');
      wx.redirectTo({ url, success: resolve, fail: reject });
      return;
    }

    wx.navigateTo({
      url,
      success: resolve,
      fail: (err) => {
        // En cas d'échec inattendu, fallback de secours sur redirectTo
        console.warn('[Nav] navigateTo a échoué, tentative redirectTo :', err.errMsg);
        wx.redirectTo({ url, success: resolve, fail: reject });
      }
    });
  });
}
```

### Protection Anti-Double Clic (`navigateWithLock`)
Sur mobile, un utilisateur tapote souvent deux fois rapidement sur un bouton, ce qui ouvre deux fois la même page sur la pile.

```javascript
/**
 * Verrouille la navigation pendant un court délai pour bloquer le double-tap
 */
export function navigateWithLock(pageInstance, navigationFn, cooldownMs = 500) {
  if (!pageInstance || pageInstance._isNavigating) return false;
  pageInstance._isNavigating = true;

  try {
    navigationFn();
  } finally {
    setTimeout(() => {
      pageInstance._isNavigating = false;
    }, cooldownMs);
  }
}
```

---

## 🧩 2. WeChat Behaviors : Les Mixins Officiels Sans Duplication

Les **Behaviors** sont le mécanisme officiel de WeChat pour partager des variables de `data`, des `methods` et des hooks de cycle de vie entre plusieurs pages ou composants sans faire d'héritage lourd.

### Exemple Majeur : Le `loadingBehavior` (`utils/behaviors/loading.js`)

```javascript
import { normalizeApiError } from '../errors/index.js';

export const loadingBehavior = Behavior({
  data: {
    isLoading: false,
    hasError: false,
    errorMessage: ''
  },

  methods: {
    /**
     * Enveloppe n'importe quelle action asynchrone avec gestion automatique du loading
     * @param {Function} asyncFn - Fonction à exécuter
     * @param {Object} [options]
     * @param {string} [options.loadingText] - Message wx.showLoading optionnel
     */
    async withLoading(asyncFn, options = {}) {
      this.setData({ isLoading: true, hasError: false, errorMessage: '' });

      if (options.loadingText) {
        wx.showLoading({ title: options.loadingText, mask: true });
      }

      try {
        const result = await asyncFn();
        return result;
      } catch (err) {
        const normalized = normalizeApiError(err);
        this.setData({ hasError: true, errorMessage: normalized.message });
        throw err;
      } finally {
        if (options.loadingText) wx.hideLoading();
        this.setData({ isLoading: false });
      }
    }
  }
});
```

### Utilisation dans une Page ou un Composant :
```javascript
import { loadingBehavior } from '../../utils/behaviors/loading.js';
import { monAPI } from '../../utils/apis/index.js';

Page({
  behaviors: [loadingBehavior],

  async onLoad() {
    // 💡 this.isLoading, this.hasError et this.withLoading sont automatiquement disponibles !
    await this.withLoading(async () => {
      const data = await monAPI.getData();
      this.setData({ items: data });
    }, { loadingText: 'Chargement...' });
  }
});
```

---

## 🔐 3. Token OAuth2 avec Marge d'Expiration (Refresh Buffer)

Dans les applications mobiles, envoyer un token qui expire dans 2 secondes risque de générer une erreur 401 si le paquet HTTP prend 3 secondes à arriver sur le serveur.

### Le Pattern du Buffer d'Anticipation (`AUTH_CONFIG.REFRESH_BUFFER_MS`)
On anticipe le rafraîchissement 60 secondes **avant** la mort effective du token :

```javascript
const REFRESH_BUFFER_MS = 60 * 1000; // 60 secondes
let cachedToken = null;
let tokenExpiry = 0;

export async function authenticate() {
  const now = Date.now();

  // Le token n'est considéré valide que si : now < (expiration réelle - 60s)
  if (cachedToken && now < (tokenExpiry - REFRESH_BUFFER_MS)) {
    return cachedToken;
  }

  // Renouvellement transparent
  const response = await fetchNewTokenFromServer();
  cachedToken = response.access_token;
  tokenExpiry = now + (response.expires_in * 1000);

  return cachedToken;
}
```

---

## 📊 4. Logique Métier : Barèmes d'Annulation & Pénalités

Dans une billetterie (vols, trains, cars), le montant remboursable dépend du nombre de jours restant avant le départ :

```javascript
export const CANCELLATION_BANDS = [
  { label: '30 jours ou plus', refundPercent: 100 },
  { label: 'De 10 à 29 jours', refundPercent: 90 },
  { label: 'De 7 à 9 jours',   refundPercent: 70 },
  { label: 'De 3 à 6 jours',   refundPercent: 50 },
  { label: 'Moins de 3 jours', refundPercent: 0 }
];

/**
 * Calcule le nombre exact de jours avant le départ sans piège UTC
 * @param {string} dateStr - Date format YYYY-MM-DD
 */
export function getDaysBeforeDeparture(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return null;
  const departure = new Date(`${dateStr}T00:00:00`);
  return Math.floor((departure.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

/**
 * Calcule les pénalités et le montant remboursé
 */
export function calculateCancellation(departureDateStr, totalAmount, currency = 'XOF') {
  const days = getDaysBeforeDeparture(departureDateStr);
  if (days === null || !totalAmount) return null;

  let bandIndex = 0;
  if (days < 3) bandIndex = 4;
  else if (days < 7) bandIndex = 3;
  else if (days < 10) bandIndex = 2;
  else if (days < 30) bandIndex = 1;

  const band = CANCELLATION_BANDS[bandIndex];
  const feePercent = 100 - band.refundPercent;
  const feeAmount = Math.round(totalAmount * (feePercent / 100));
  const refundAmount = Math.max(0, totalAmount - feeAmount);

  return {
    days,
    feePercent,
    refundPercent: band.refundPercent,
    feeAmount,
    feeLabel: `${feeAmount.toLocaleString('fr-FR')} ${currency}`,
    refundAmount,
    refundLabel: `${refundAmount.toLocaleString('fr-FR')} ${currency}`
  };
}
```

---

## ❤️ 5. Favoris Optimistes avec Double Cache (Mémoire + Disque)

Pour garantir que l'icône de favoris (cœur) s'allume ou s'éteint **instantanément à 0 milliseconde de latence** sans attendre une requête réseau :

```javascript
const FAVORITES_STORAGE_KEY = 'app_favorite_ids';
let memoryFavorites = null;

function getStoredIds() {
  if (memoryFavorites === null) {
    try {
      const stored = wx.getStorageSync(FAVORITES_STORAGE_KEY);
      memoryFavorites = Array.isArray(stored) ? stored.map(String) : [];
    } catch {
      memoryFavorites = [];
    }
  }
  return memoryFavorites;
}

export const FavoritesService = {
  isFavorite(id) {
    return getStoredIds().includes(String(id));
  },

  toggle(id) {
    const list = getStoredIds();
    const strId = String(id);
    const index = list.indexOf(strId);
    let nextList;

    if (index >= 0) {
      nextList = list.filter((i) => i !== strId); // Retirer
    } else {
      nextList = [...list, strId]; // Ajouter
    }

    memoryFavorites = nextList;
    wx.setStorage({ key: FAVORITES_STORAGE_KEY, data: nextList });
    return nextList.includes(strId);
  }
};
```

