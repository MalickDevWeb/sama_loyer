# 🧠 Patterns Avancés ATS — Analyse Exhaustive Page par Page

> Source : analyse complète du projet `mp-ats-app` (9 pages, 20+ utils, tous les composants).

---

## 🗺️ ARCHITECTURE GLOBALE

### Flux de données complet
```
app.js (onLaunch)
  ├── nativeService.getUserInfos()          → Bus.setState('user.data', {msisdn, fullName})
  ├── loadDestinations()                    → app.globalData.DESTINATIONS
  ├── recoverPendingPaymentOperations()     → auto-retry paiements perdus
  └── Bus.setState('app.initialized', true) + Bus.emit('user.loaded')

Pages TAB (home/explorer/favoris/voyage)
  ├── onLoad → rafraîchir les données
  ├── onShow → setCustomTabBarActive() + sync favoris depuis cache mémoire
  └── isCatalogCacheFresh() → décider si API ou cache (TTL 15 min)

Pages STACK (destination-detail / booking / booking-confirmation / reservation-detail / reservation-cancellation)
  └── Reçoivent données via Bus.getState() + params URL (bookingRef, destinationId)
```

### Couches de cache (3 niveaux)
```
L1 — Mémoire JS (module-scope)   : cachedFavoriteIds, catalog-store vars (< 0 ms latence)
L2 — wx.Storage (wxStorage)      : ats_catalog_cache (TTL 15 min), ats_booking_list_cache (TTL 3 min)
L3 — API backend                 : authenticate() auto avant chaque appel HTTP
```

---

## 📄 PAGE-PAR-PAGE : PATTERNS & RÈGLES MÉTIER

### 🏠 home.js — Page d'accueil multi-listes

**Particularités :**
- **3 listes parallèles indépendantes** : `packages` (toutes destinations), `featured` (à la une), `recommended` (recommandées)
- Chaque liste a son propre état `loading/error` : `destinationsLoading`, `featuredLoading`, `recommendedLoading`
- **Pattern offline warning anti-spam** : notifier max 1 fois par 30 secondes via `_lastOfflineNotice`
- **Mise à jour like en un seul `setData()`** : mettre à jour les 3 listes simultanément (allDestinations, allFeaturedDestinations, allRecommendedDestinations) pour éviter le clignotement
- En `onShow` : sync favoris depuis mémoire, puis si cache périmé → refresh silencieux (sans skeleton) via `showSkeleton: false`

**Règle critique :**
```js
// ✅ Bon : un seul setData() pour les 3 listes simultanément
this.setData({
  allDestinations,
  allFeaturedDestinations,
  allRecommendedDestinations,
  destinations: filterDestinations(allDestinations, query, activeFilter),
  featuredDestinations: filterDestinations(allFeaturedDestinations, query, activeFilter),
  destinationsRecommended: filterDestinations(allRecommendedDestinations, query, activeFilter),
});
// ❌ Mauvais : 3 setData() séparés → 3 cycles de rendu → clignotement
```

---

### 🔍 explorer.js — Liste filtrée avec waitForAppInit

**Particularités :**
- **`waitForAppInit(app)`** : attend `app.globalData.initPromise` avant d'accéder aux destinations
- Utilise `_catalogLoaded` (flag interne) pour ne montrer le skeleton qu'au premier chargement
- **Pattern stale-while-revalidate** : si cache global disponible → afficher immédiatement → puis revalider
- `retryLoading()` : recharge forçant l'API et reconstruisant `app.globalData.DESTINATIONS`
- Label dynamique : `CATALOG_MESSAGES.RESULTS_AVAILABLE(count)` → "X destinations disponibles"

**Pattern waitForAppInit :**
```js
// À utiliser dans TOUTES les pages qui accèdent à globalData.DESTINATIONS
await waitForAppInit(app);  // résout instantanément si déjà init
const destinations = app.globalData.DESTINATIONS || getCatalogDestinations();
```

---

### 🏖️ destination-detail.js — Detail avec galerie native

**Particularités :**
- **Machine à états `pageState`** : `'loading'` | `'success'` | `'error'` | `'notFound'`
- `pageTopOffset` calculé depuis `wx.getSystemInfoSync().statusBarHeight + 16` pour le header custom
- **Galerie native WeChat** : `showPreview / previewIndex / previewGallery` avec navigation circulaire `(index ± 1 + length) % length`
- Passage de données au booking via **Bus.setState** : `Bus.setState('booking.package-context', pkg)` → évite URL longue
- `_likeLocked` : debounce 300ms pour le toggle favori (évite double-clic)
- Validation d'ID : `isValidPackageId(id)` → retour automatique si invalide

**Pattern passage de contexte via Bus :**
```js
// Dans destination-detail.js (émetteur)
Bus.setState('booking.package-context', { ...pkg, location: pkg.subtitle || pkg.location });
navigateToLocked(this, `/pages/booking/booking?destinationId=${id}`, '_bookingLocked');

// Dans booking.js (récepteur)
const ctx = Bus.getState('booking.package-context');
Bus.removeState('booking.package-context'); // 🔑 Nettoyage immédiat de la RAM
```

---

### 📅 booking.js — Page réservation avec flux paiement bancaire

**Particularités critiques :**
- **Calendrier custom** : `createFutureDates(minDays, 12)` génère 12 dates futures à partir de J+minDays
- Gestion date additional : si l'utilisateur choisit via picker une date hors des 12 proposées → ajout dynamique avec `isAdditional: true`
- **Vérification doublon pré-paiement** : avant tout paiement → `backendAPI.getBookings(phone)` → modal confirmation si doublon détecté
- **Flux paiement en 3 étapes sécurisées** :
  1. `processNativePayment()` → invokePlugin merchantPay → retourne `{txnid}`
  2. `finalizeOrder(txnid)` → `createReservation()` avec retry + pending storage
  3. `Bus.setState('booking.created.data', created)` + `wx.redirectTo('/pages/booking-confirmation')`
- **Preview mode DEV** : `isPreviewMode: __DEV__` → affiche les modales de preview paiement en dev

**Grille de prix par paliers :**
```js
// pricing = { adult: { t1_2, t3_4, t5plus }, child: { t1_2, t3_4, t5plus } }
// Paliers : 1-2 voyageurs → t1_2, 3-4 → t3_4, 5+ → t5plus
const price = calculatePackagePrice(pricing, adults, children);
// price = { adultUnitPrice, childUnitPrice, adultSubtotal, childrenSubtotal, total }
```

---

### ✅ booking-confirmation.js — Animation d'intro orchestrée

**Particularités :**
- **Séquence d'animation** via `_introTimers[]` (array de setTimeout) avec `clearIntroTimers()` dans `onUnload`
- Séquence exacte : 50ms → scale 1.25 → 500ms → scale 1.0 → 820ms → `introDocked=true` → 1200ms → `introLeaving=true` → 1360ms → `isContentVisible=true`
- **Guard `_hasPlayedIntro`** : jouer l'animation une seule fois (évite re-jeu si page revient en foreground)
- Données priorité Bus > URL : `bookingData = Bus.getState('booking.created.data')` puis fallback `options.reference`
- Nettoyage RAM systématique : `Bus.removeState('booking.created.data')`

**Pattern animation wx.createAnimation :**
```js
function createScaleAnimation(scale, opacity, duration, timingFunction) {
  const animation = wx.createAnimation({ duration, timingFunction, transformOrigin: '50% 50% 0' });
  animation.opacity(opacity).scale(scale).step();
  return animation.export();
}
// Stocké dans data.introSuccessAnimation → passé à animation="{{ introSuccessAnimation }}" dans WXML
```

---

### ❤️ favoris.js — Favoris réactifs avec double source

**Particularités :**
- **Source duale** : `app.globalData.DESTINATIONS` (mémoire) ou `loadPackages()` (API si mémoire vide)
- En `onShow` : si destinations en mémoire → sync synchrone instantanée via `_syncAndRenderFavorites` → PAS de flash
- Si mémoire vide (arrivée directe sur favoris) → `refreshFavorites()` avec `waitForAppInit()` + fallback API
- **`_syncAndRenderFavorites(destinations)`** : applique `applyFavoritesToPackages()`, filtre les `like === true`, met à jour `app.globalData.DESTINATIONS` simultanément
- Label : ``${count} destination${count === 1 ? '' : 's'} sauvegardée${count === 1 ? '' : 's'}``

---

### 🧳 voyage.js — Liste réservations stale-while-revalidate

**Particularités :**
- **Pattern SWR (Stale-While-Revalidate)** : afficher immédiatement le cache (3 min TTL) → refresh en arrière-plan
- **Request ID anti-race** : `requestId = ++this._refreshRequestId` → ignorer réponses périmées si nouvelle requête lancée
- Bouton "Retour accueil" : `switchTab('/pages/home/home').catch()`
- Navigate vers detail : `encodeURIComponent(bookingRef)` dans l'URL

```js
// Pattern anti-race condition
const requestId = (this._refreshRequestId || 0) + 1;
this._refreshRequestId = requestId;
// ... après await
if (requestId !== this._refreshRequestId) return; // réponse périmée
```

---

### 📋 reservation-detail.js — Detail avec rebooking et annulation

**Particularités :**
- **`_refreshOnShow`** : si page revient en foreground après annulation → recharger le détail
- **Warning annulation réseau** : `Bus.getState('reservation.cancellation-network-warning')` → afficher modal si bookingRef match
- **Résolution package pour rebooking** : priorité packageId numérique → sinon recherche par titre normalisé via `loadPackageByTitle(title)`
- **`checkRebookingAvailability()`** : cache local d'abord (`app.globalData.DESTINATIONS`) → puis API seulement si `available` absent
- Statut couleur inline : `statusTextColor` calculé selon statut (vert/orange/rouge/gris)
- Passe contexte annulation via Bus : `Bus.setState('reservation.cancellation-context', { bookingRef, reservation, phone, status, total, date, currency, cancellation })`

---

### ❌ reservation-cancellation.js — Annulation avec calcul remboursement

**Particularités critiques :**
- **Bands de remboursement** (depuis `cancellation.js`) :
  - ≥ 30 jours : 100% remboursé
  - 10–29 jours : 90% remboursé
  - 7–9 jours : 70% remboursé
  - 3–6 jours : 50% remboursé
  - < 3 jours : **0% remboursé → annulation en ligne BLOQUÉE**
- **Guard multi-couches** : `saving`, `_cancelInProgress`, `requestSubmitted`, `_confirmationOpen`
- **Recovery après coupure réseau** : si erreur `NETWORK_ERROR` ou `CANCELLATION_OUTCOME_UNKNOWN` → invalider cache liste + `Bus.setState('reservation.cancellation-network-warning')` + `navigateBack()` → page detail recharge et affiche modal
- **Priorité contexte Bus** : charge depuis `Bus.getState('reservation.cancellation-context')` → moins d'appels API
- Après succès : parse `result.refund.refundAmount` pour afficher montant remboursé exact

---

## 🔧 UTILS AVANCÉS — PATTERNS EXTRAITS

### CatalogStore — Module-scope singleton (catalog-store.js)
```js
// Variables module-scope = singleton par session, survivent aux navigations de pages
let destinations = initial.destinations; // initialisé depuis wx.Storage au démarrage
let lastCacheTimestamp = initial.timestamp;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes

export function isCatalogCacheFresh() {
  if (!lastCacheTimestamp || destinations.length === 0) return false;
  return Date.now() - lastCacheTimestamp < CACHE_TTL_MS;
}
// updateDestinationLike() → met à jour destinations + featuredDestinations + recommendedDestinations + app.globalData SIMULTANÉMENT
```

### ReservationListCache — Cache par téléphone (reservation-list-cache.js)
```js
// TTL 3 minutes, clé par téléphone
const KEY_PREFIX = 'ats_booking_list_cache:';
const CACHE_TTL_MS = 3 * 60 * 1000;
// getEntry() valide l'intégrité : chaque reservation doit avoir bookingRef
// isFresh() : age >= 0 && age < TTL
// invalidate() : supprime la clé → force refresh prochain voyage.onShow()
```

### Auth OAuth2 — Buffer anti-401 (auth.js)
```js
// REFRESH_BUFFER_MS = 5000ms → token valide si Date.now() < (expiry - 5s)
// En production, remplacer par 60000ms (60s) pour le mobile
const expiry = now + (expiresIn * 1000) - AUTH_CONFIG.REFRESH_BUFFER_MS;
// Fallback depuis wx.Storage si runtimeToken null (redémarrage app)
// Token sans expiry en storage → lui donner DEFAULT_EXPIRY_SEC (200s)
```

### PendingPayment — Bouclier anti-perte (reservations.js)
```js
// Dès avant le paiement : save dans pendingPaymentStorage
const pending = { id: `booking:${txnid}`, type: 'booking', txnid, payload, packageInfo, attempts: 0 };
pendingPaymentStorage.save(pending);

// Retry avec delays = [0, 2000, 5000] (3 tentatives)
// Si existingReservation trouvé par txnid → récupéré sans doublon
// recoverPendingPaymentOperations() appelé dans app.onLaunch + app.onShow
```

### FilterDestinations — Recherche NFD normalisée (destination-filter.js)
```js
// Normalisation NFD : éé→ee, àà→aa, etc.
function normalizeText(value) {
  return String(value||'').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g,'').replace(/[-_]+/g,' ').trim();
}
// Champs searchables : title, subtitle, category, duration, price, tags[]
// Filtre actif : match par key normalisée (tirets) sur title/subtitle/category/tags
```

### HttpClient — Session tracking (http.js)
```js
// Chaque instance a sessionId: "APP-xxxxxxxx" + requestCount
// Headers: X-Client-Ref (session), X-Request-Id (session-count)
// Timeout configurable par appel : options.config?.timeout || 30000ms
// Toutes les méthodes : get/post/put/patch/delete
```

---

## 🎨 PATTERNS UI AVANCÉS (WXML/WXSS)

### Gallery Preview Native
```wxml
<!-- Pattern galerie native WeChat -->
<swiper wx:if="{{showPreview}}" current="{{previewIndex}}"
  bindchange="onPreviewChange" circular>
  <swiper-item wx:for="{{previewGallery}}" wx:key="index">
    <image src="{{item}}" mode="aspectFit" />
  </swiper-item>
</swiper>
<!-- Navigation circulaire : (index - 1 + length) % length -->
```

### Status Colors Pattern
```js
// Mapping statut → couleur texte inline
const statusTextColor =
  ['cancelled', 'failed'].includes(status) ? '#b42318'       // rouge
  : ['cancellation_requested', 'on_hold'].includes(status) ? '#8a5a00'  // orange
  : ['completed', 'refunded', 'done', 'unknown'].includes(status) ? '#5f6674'  // gris
  : '#0aa347';  // vert (confirmed, upcoming)
```

### isAdditional Date Pattern
```js
// Ajout dynamique d'une date hors-liste au calendrier custom
if (!exists) {
  updatedDates = [...dates, {
    day: DAYS[date.getDay()], date: String(date.getDate()),
    month: MONTHS[date.getMonth()], isoDate, isAdditional: true
  }];
}
// En WXML : wx:if="{{!item.isAdditional || item.isoDate === selectedDateIso}}"
```

---

## 🔑 BUS STATE KEYS — INVENTAIRE COMPLET

| Clé Bus | Émetteur | Consommateurs | Nettoyage |
|---|---|---|---|
| `app.initialized` | app.js | explorer, favoris, voyage | Jamais |
| `app.loading` | app.js | — | auto (finally) |
| `user.data` | app.js | booking, reservations, cancellation | Jamais |
| `user.name` | app.js | — | Jamais |
| `network.connected` | app.js | toutes les pages | auto (listener) |
| `booking.package-context` | destination-detail | booking.onLoad | `Bus.removeState()` immédiat |
| `booking.created.data` | booking (post-paiement) | booking-confirmation.onLoad | `Bus.removeState()` immédiat |
| `booking.status` | booking | — | non nettoyé |
| `reservation.cancellation-context` | reservation-detail | reservation-cancellation.onLoad | `Bus.removeState()` immédiat |
| `reservation.cancellation-network-warning` | reservation-cancellation | reservation-detail.onShow | `Bus.removeState()` après lecture |

**Règle absolue** : Tout `Bus.getState()` de données one-shot DOIT être suivi de `Bus.removeState()` immédiatement.

---

## 📐 SCHÉMAS JSON-SCULPT — MAPPING API → APP

### PackageCardSchema (home/explorer/favoris)
```js
{ id, title, price: mapPrice(), currency, subtitle: '@location',
  duration, image, available, minDays: Number(min_days),
  category: categories[0], tags: categories[] }
```

### PackageDetailSchema (destination-detail + booking)
```js
{ ...PackageCard, rating, reviewCount, pricing: mapPricing(), description, gallery[] }
// pricing = { adult: {t1_2, t3_4, t5plus}, child: {t1_2, t3_4, t5plus} }
```

### ReservationDetailSchema (voyage + reservation-detail)
```js
{ bookingRef: booking_ref, txnid: transaction_id, packageId, phone, status,
  date, adults: travelersAdulte, children: travelersEnfant,
  travelers: adulte+enfant, packageTitle, image, location, total, currency,
  cancellation: { status, label, requestedAt, decidedAt, reason, refund: { retainedPercent, refundAmount, currency } },
  note }
```

---

## ⚡ RÈGLES MÉTIER CRITIQUES EXTRAITES

1. **Date sans décalage UTC** : Toujours `new Date(\`${dateStr}T00:00:00\`)` (jamais `new Date(dateStr)`)
2. **isValidPackageId** : chaîne de chiffres uniquement + Number.isSafeInteger + > 0
3. **isValidBookingDate** : format YYYY-MM-DD + date >= aujourd'hui + minDays respectés
4. **Annulation bloquée < 3 jours** : hardcodé dans `submitReservationCancellation`
5. **Doublon réservation détecté** : vérifier `isReservationStillActive()` + `matchesBookingDetails()` avant paiement
6. **Status `pending_payment` → afficher `confirmed`** : normalisé côté client pour éviter confusion utilisateur
7. **txnid = identifiant de récupération** : en cas de perte réseau, retrouver la réservation par `txnid` dans la liste
8. **`encodeURIComponent(bookingRef)`** dans URL (bookingRef peut contenir des chars spéciaux)
9. **Catalog TTL 15 min, Reservation list TTL 3 min** (SWR pattern)
10. **`loadPackageByTitle()`** : normalisation NFD + slug pour matching flou de titre

---

## 🧩 COMPOSANTS CUSTOM UI/UX

### Composants UI purs (`components/custom/ui/`)
| Composant | Rôle |
|---|---|
| `cancellation-policy` | Affichage des bandes de remboursement |
| `cancellation-schedule` | Planning d'annulation |
| `chip-group` | Filtres par catégorie |
| `custom-tab-bar` | Tab bar custom WeChat |
| `destination-card` | Carte destination avec like |
| `layout` | Wrapper global page (safe areas) |
| `list-destination` | Liste de cartes destinations |
| `reschedule-date-picker` | Calendrier horizontal custom |
| `reservation-card` | Carte réservation avec statut |
| `terms-of-use` | Modal CGU |

### Composants UX / Skeletons (`components/custom/ux/`)
| Composant | Associé à |
|---|---|
| `destination-card-skeleton` | destination-card loading |
| `destination-detail-skeleton` | destination-detail loading |
| `reservation-card-skeleton` | reservation-card loading |
| `reservation-detail-skeleton` | reservation-detail loading |

---

## 🛡️ PATTERNS SÉCURITÉ & RÉSILIENCE

### Guard pattern multi-couches (booking + cancellation)
```js
// Niveau 1 : flag isPaying / saving (UI)
if (this.data.isPaying) return;
// Niveau 2 : flag _cancelInProgress (logique)
if (this._cancelInProgress) return;
// Niveau 3 : flag requestSubmitted (état terminal)
if (this.data.requestSubmitted) return;
// Niveau 4 : _confirmationOpen (modal ouverte)
if (this._confirmationOpen) return;
```

### Stale-While-Revalidate complet (voyage.js)
```js
// 1. Afficher cache immédiatement
const cachedCards = getCachedReservationCards();
if (hasCachedData && !hasCurrentData) this.setData({ reservations: cachedCards, loading: false });
// 2. Revalider en arrière-plan
const result = await getApiReservationCards();
if (requestId !== this._refreshRequestId) return; // anti-race
this.setData({ reservations: result.reservations });
```

### Recovery annulation incertaine
```js
// Après erreur réseau sur cancelBooking → vérifier si déjà annulé
const check = await getReservationByReference(bookingRef);
if (remote && isCancellationSuccessful(remote.status, remote.cancellation?.status)) {
  return { success: true, reservation: remote, ... }; // traitement silencieux
}
```

