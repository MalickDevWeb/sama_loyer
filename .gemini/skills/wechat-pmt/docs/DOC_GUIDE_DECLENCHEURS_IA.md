# 🎛️ Guide Pratique des Déclencheurs IA & Recettes Avancées

> **Référentiel officiel d'activation IA pour WeChat Mini-Program (PMT / TCMPP)**  
> Ce document détaille le rôle de chaque déclencheur, les problèmes résolus et le code prêt à l'emploi.

---

## 📑 Sommaire des Déclencheurs

| Déclencheur | Domaine | Problème Résolu |
|---|---|---|
| **`@IMAGE-MEDIA`** | Médias & Visuels | Écrans blancs, coupures 4G et absence de plein écran |
| **`@MODAL-SHEET`** | UI / Modales | Conflits de Safe Area iPhone et clics fantômes en arrière-plan |
| **`@DATE-PICKER`** | Formulaires & Dates | Bugs de fuseau horaire UTC et sélection de dates expirées |
| **`@CUSTOM-NAVBAR`** | Layout & Navigation | Mauvais alignement avec la capsule WeChat et décalages d'encoche |
| **`@PAGE-BINDINGS`** | État & Cycle de vie | Fuites de mémoire dues aux écouteurs d'événements non fermés |
| **`@STALE-REVALIDATE`** | Performance & Cache | Écrans de chargement bloquants lors des retours sur une page |
| **`@SAFE-STORAGE`** | Persistance Locale | Dépassement de quota 10 MB et piège de la chaîne vide WeChat |
| **`@NATIVE-PAY`** | Paiement Orange Money | Risque de double débit bancaire lors des coupures réseau |
| **`@RESPONSIVE-UI`** | CSS & iPhone physique | Débordements d'écrans à encoche et hauteurs `100vh` rigides |
| **`@CUSTOM-TABBAR`** | Navigation TabBar | Clignotements et désynchronisation d'index d'onglets |
| **`@SAFE-NAV`** | Routage WeChat | Crash silencieux de la pile à 10 pages (`navigateTo`) |
| **`@BEHAVIOR-MIXIN`** | Factorisation JS | Duplication massive de `isLoading` et `errorMessage` |
| **`@UI-MOCK`** | Prototypage UI | Besoin de valider l'UI sans dépendre d'un backend actif |
| **`@API-CONNECT`** | Intégration API | Données brutes non typées et erreurs 401 imprévues |
| **`@FULL-FEATURE`** | Feature End-to-End | Construction complète vue + intégration en une seule passe |
| **`@MAXIT-SDK`** | SDK Sonatel Max It | Intégration hôte complexe (identité, login, contacts, scan) |
| **`@COMPILER-SAFE`** | Compilation TCMPP | Erreurs fatales (BOM UTF-8, @font-face 404, guards) |
| **`@PAGE-ANIM`** | Micro-interactions | Effet tactile "plastique" et absence de feedback 60 FPS |

---

## 🖼️ 1. `@IMAGE-MEDIA` — Gestion d'Images Haute Résilience

### Le Problème
Sur mobile en Afrique de l'Ouest (3G/4G instable), les images distantes échouent souvent à charger, laissant des rectangles blancs disgracieux ou déformant la grille CSS. De plus, les utilisateurs s'attendent à pouvoir agrandir les visuels en plein écran.

### Ce que le Déclencheur Exécute
- Active le composant `osn-image` avec `virtualHost: true` et `lazy-load`.
- Met en place **3 tentatives automatiques** avec backoff exponentiel (1000ms, 2000ms).
- En cas d'échec total, bascule sur `fallbackSrc` sans casser la mise en page.
- Active le zoom plein écran natif WeChat via `wx.previewImage`.
- Enregistre un timestamp dans `tc-image-cache` pour éviter les rechargements inutiles.

### Snippet d'Implémentation Prêt à l'Emploi
```xml
<!-- WXML -->
<app-image
  src="{{ package.imageUrl }}"
  fallbackSrc="/assets/images/default-thumbnail.png"
  mode="aspectFill"
  width="100%"
  height="360rpx"
  previewable="{{ true }}"
  retryCount="{{ 3 }}"
  retryDelay="{{ 1000 }}"
  containerClass="destination-hero-image"
/>
```

---

## 🪟 2. `@MODAL-SHEET` — Bottom-Sheets & Modales Safe-Area

### Le Problème
Les boîtes de dialogue et panneaux glissants faits "maison" sont souvent coupés par le Home Indicator (la barre en bas des iPhone récents). De plus, taper sur le fond sombre déclenche parfois des clics sur les boutons situés sous la modale.

### Ce que le Déclencheur Exécute
- Encapsule le contenu dans `app-modal` avec `styleIsolation: 'apply-shared'`.
- Force la hauteur maximale à `max-height: 85vh;` avec scroll interne fluide.
- Applique automatiquement le padding de sécurité : `env(safe-area-inset-bottom, 40rpx)`.
- Bloque la propagation des clics vers l'arrière-plan via `catchtap="noop"`.
- Calcule dynamiquement le dégradé RGBA et le flou d'arrière-plan (*backdrop blur*).

### Snippet d'Implémentation Prêt à l'Emploi
```xml
<!-- WXML -->
<app-modal
  visible="{{ showTermsModal }}"
  placement="bottom"
  size="full"
  hasHeader="{{ false }}"
  hasContent="{{ true }}"
  bind:close="closeTerms"
>
  <view slot="content" class="modal-sheet-content">
    <view class="modal-drag-handle"></view>
    <scroll-view scroll-y enhanced show-scrollbar="{{ false }}" class="modal-scroll-body">
      <!-- Contenu textuel / CGU / Formulaire -->
    </scroll-view>
  </view>
</app-modal>
```

```css
/* WXSS */
.modal-sheet-content {
  max-height: 85vh;
  padding: 24rpx 32rpx calc(24rpx + env(safe-area-inset-bottom));
  background: #ffffff;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
}
.modal-drag-handle {
  width: 72rpx;
  height: 8rpx;
  background: #E5E7EB;
  border-radius: 999rpx;
  margin: 0 auto 24rpx auto;
}
```

---

## 📅 3. `@DATE-PICKER` — Sélecteur Temporel Horizontal

### Le Problème
Manipuler des dates en JavaScript avec `new Date('2026-12-15')` crée un décalage d'un jour selon le fuseau horaire du terminal. De plus, les réservations doivent respecter un délai minimum de prévenance (`minDays`) sans bloquer les dates futures valides.

### Ce que le Déclencheur Exécute
- Génère les dates avec minuit local strict : `new Date(\`${isoDate}T00:00:00\`)`.
- Calcule dynamiquement les dates autorisées à partir de `today + minDays`.
- Permet l'ajout d'une date hors liste via le sélecteur natif avec le flag `isAdditional: true`.
- Émet un événement `blocked` explicite avec toast d'avertissement si l'utilisateur clique sur une date fermée.

### Snippet d'Implémentation Prêt à l'Emploi
```javascript
// JS : Générateur de dates sécurisé
function createFutureDates(minDays, count = 12) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() + minDays);

  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const isoDate = [
      d.getFullYear(),
      String(d.getMonth() + 1).padStart(2, '0'),
      String(d.getDate()).padStart(2, '0')
    ].join('-');
    return {
      day: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][d.getDay()],
      date: String(d.getDate()),
      month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][d.getMonth()],
      isoDate,
    };
  });
}
```

---

## 🧭 4. `@CUSTOM-NAVBAR` — En-Tête Personnalisé & Dynamic Offset

### Le Problème
Sous WeChat, lorsque `"navigationStyle": "custom"` est déclaré, la barre système disparaît et le contenu remonte sous l'heure et l'encoche de l'iPhone. Un calcul statique en dur provoque des chevauchements sur les iPhone récents (Dynamic Island).

### Ce que le Déclencheur Exécute
- Récupère en temps réel `statusBarHeight` via `wx.getSystemInfoSync()`.
- Calcule la marge exacte : `navContentOffset = statusBarHeight + 44 + Math.ceil(34 * windowWidth / 750)`.
- Gère le bouton retour intelligent : si la pile `getCurrentPages()` est à 1 (arrivée directe deep-link), bascule automatiquement sur `wx.switchTab('/pages/home/home')`.

---

## 🔄 5. `@PAGE-BINDINGS` — Liaison Déclarative Page <-> EventBus

### Le Problème
Souscrire à l'EventBus dans `onLoad` sans conserver la référence pour `unsubscribe` dans `onUnload` crée des fuites de mémoire irréversibles : les pages fermées continuent d'exécuter du code à chaque événement global.

### Ce que le Déclencheur Exécute
- Utilise `createPageHelpers(this, bindings)` pour déclarer le mapping.
- Abonne et initialise les données au montage (`onLoad`).
- Supprime automatiquement 100 % des abonnements au démontage (`onUnload`).

```javascript
// JS Page
import { createPageHelpers } from '../../utils/helpers/page';

Page({
  data: {
    user: null,
    unreadCount: 0,
  },

  onLoad() {
    this._busHelpers = createPageHelpers(this, {
      user: 'user.data',
      unreadCount: 'notifications.unread',
    });
    this._busHelpers.subscribe();
    this._busHelpers.loadInitial();
  },

  onUnload() {
    if (this._busHelpers) {
      this._busHelpers.unsubscribe(); // 🔑 Zéro fuite mémoire
    }
  },
});
```

---

## ⚡ 6. `@STALE-REVALIDATE` — Rendu Instantané (0 ms) & Anti-Race

### Le Problème
Les utilisateurs attendent un retour instantané lorsqu'ils consultent une liste (ex : Mes Réservations). Attendre la réponse réseau à chaque visite donne une impression de lenteur. De plus, si l'utilisateur clique rapidement sur plusieurs onglets, des réponses API désynchronisées peuvent écraser les données récentes.

### Ce que le Déclencheur Exécute
1. Lit le cache mémoire L1 ou `wx.Storage` L2 pour afficher la liste en **0 ms**.
2. Incrémente un jeton de requête unique `_refreshRequestId`.
3. Lance l'appel API en tâche de fond.
4. Si `this._refreshRequestId` a changé entre-temps, la réponse obsolète est immédiatement jetée.
5. Met à jour l'affichage et rafraîchit le cache sans aucun clignotement.

---

## 💾 7. `@SAFE-STORAGE` — Persistance Locale Protégée

### Le Problème
1. L'API native `wx.getStorageSync('cle_inexistante')` renvoie une chaîne vide `""` au lieu de `null` ou `undefined`, faussant les vérifications JavaScript.
2. Si le quota de stockage WeChat (10 Mo) est dépassé, l'application plante avec une exception non gérée.

### Ce que le Déclencheur Exécute
- Encapsule toutes les lectures/écritures dans un `try/catch` transparent.
- Normalise les valeurs absentes vers la valeur par défaut configurée.
- Fournit la méthode atomique `getOrSet(key, factoryFn)`.

---

## 💳 8. `@NATIVE-PAY` — Bouclier Anti-Double Débit Orange Money

### Le Principe Absolu
Dès que le débit bancaire est confirmé par le plugin natif (`res.code === 'SUCCEED'`), l'application scelle immédiatement `this._confirmedTxnid = txnid`.  
Même si la connexion 4G se coupe avant que le serveur marchand ne confirme la réservation, **il est formellement interdit de réinviter l'utilisateur à payer**. Le bouton "Réessayer" lance uniquement une vérification du statut auprès du serveur avec le `txnid` existant.

---

## 🚀 Comment Utiliser ces Déclencheurs au Quotidien ?

Il vous suffit d'insérer le mot-clé directement dans votre requête :

- *"Ajoute une modale pour afficher le détail du billet `@MODAL-SHEET`"*
- *"Affiche la liste des voyages réservés avec le cache instantané `@STALE-REVALIDATE`"*
- *"Génère le composant pour choisir la date de départ `@DATE-PICKER`"*
- *"Gère le paiement de la commande sans risque de double débit `@NATIVE-PAY`"*

L'IA appliquera immédiatement l'ensemble des règles de production sans aucune omission technique.

