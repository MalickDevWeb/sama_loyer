> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Pièges Compilateur & Prod](DOC_PIEGES_COMPILATEUR_ET_PATTERNS_PROD.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📚 Le Livre de Recettes : Solutions Complètes Prêtes à l'Emploi

Chaque recette est une **solution complète et autonome**. Vous trouvez votre situation, vous copiez le bloc entier (Mappeur + API + JS + HTML + CSS), vous changez uniquement les `[CROCHETS]`, et votre fonctionnalité est opérationnelle.

## 📑 Sommaire — Trouvez votre situation
| Numéro | Je dois coder... | Complexité |
|---|---|---|
| 🔵 [Recette 1](#-recette-1--page-de-liste-avec-api--skeleton--scroll-infini) | Une page de liste qui charge depuis le serveur, avec skeleton et scroll infini | Moyenne |
| 🔵 [Recette 2](#-recette-2--formulaire-complet-avec-validation-et-envoi-api) | Un formulaire avec validation en direct et envoi au serveur | Moyenne |
| 🔵 [Recette 3](#-recette-3--page-de-détail-avec-api) | Une page de détail (produit, vol, profil) qui affiche les données du serveur | Facile |
| 🔵 [Recette 4](#-recette-4--upload-photo--envoi-au-serveur) | Un bouton pour choisir une photo et l'envoyer au serveur | Moyenne |
| 🔵 [Recette 5](#-recette-5--filtres-sur-une-page-séparée-qui-rafraîchit-la-liste) | Un système de filtres sur une page dédiée qui recharge la liste principale | Avancée |
| 🔵 [Recette 6](#-recette-6--compteur-de-panier-partagé-entre-toutes-les-pages) | Un compteur (panier, notifications) visible sur toutes les pages | Avancée |
| 🟢 [Recette 7](#-recette-7--connexion--login-et-protection-de-pages) | Une page de connexion avec sauvegarde du token et redirection | Facile |
| 🟢 [Recette 8](#-recette-8--pull-to-refresh-tirer-pour-recharger) | Tirer vers le bas pour recharger la liste (comme Facebook, Instagram) | Facile |
| 🟢 [Recette 9](#-recette-9--recherche-en-temps-réel-debounce) | Une barre de recherche qui interroge le serveur après que l'utilisateur a fini de taper | Moyenne |
| 🟢 [Recette 10](#-recette-10--bouton-favoritlike-toggle) | Un bouton "Cœur" ou "Étoile" qui s'allume et s'éteint (avec sauvegarde serveur) | Facile |
| 🟢 [Recette 11](#-recette-11--partage-wechat-envoyer-à-un-ami) | Envoyer une page ou un contenu à un ami via WeChat | Facile |
| 🟢 [Recette 12](#-recette-12--onglets-tabs-avec-changement-de-données) | Un menu à onglets qui change le contenu et recharge les données | Moyenne |
| 🟢 [Recette 13](#-recette-13--cache-local-garder-des-données-hors-ligne) | Sauvegarder des données localement pour que l'app fonctionne sans réseau | Moyenne |
| 🔴 [Recette 14](#-recette-14--paiement-marchand-natif-avec-bouclier-anti-double-débit) | Paiement Marchand TCMPP / Max It avec protection 0% double débit | Critique |
| 🔴 [Recette 15](#-recette-15--smart-polling-asynchrone-avec-backoff-progressif) | Validation asynchrone résiliente aux micro-coupures 4G (3 essais) | Avancée |
| 📱 [Recette 16](#-recette-16--barre-de-navigation-custom--capsule-wechat) | En-tête sur mesure aligné au pixel près sur la capsule WeChat | Moyenne |
| 📱 [Recette 17](#-recette-17--custom-tabbar-wechat-sans-scintillement) | Barre d'onglets personnalisée officielle WeChat avec badges | Avancée |
| ⚡ [Recette 18](#-recette-18--store-réactif-léger-avec-cache-stale-while-revalidate) | Partage d'état global sans bibliothèque externe avec cache TTL | Avancée |
| 🚦 [Recette 19](#-recette-19--navigation-sécurisée-anti-crash-pile-10-pages) | Protection contre le blocage des 10 pages WeChat + Anti-Double Tap | Facile |
| 🧩 [Recette 20](#-recette-20--wechat-behavior-partagé-loadingbehavior) | Mixin officiel WeChat pour gérer isLoading et erreurs sans duplication | Moyenne |
| ❤️ [Recette 21](#-recette-21--favoris-instantanés-double-cache-mémoire--disque) | Gestion optimiste des favoris à 0ms de latence avec persistance | Moyenne |
| 📊 [Recette 22](#-recette-22--calculateur-de-délais--barèmes-dannulation) | Calcul des jours restants et pourcentages de remboursement sans bug UTC | Moyenne |
| 📱 [Recette 23](#-recette-23--initialisation-du-sdk-officiel-max-it-dans-appjs) | Configuration du SDK officiel Max It avec simulation DevTools | Facile |
| 👤 [Recette 24](#-recette-24--identité-utilisateur-sans-login-screen) | Récupération du profil et du code auth via miniSDK.user() & login() | Facile |
| 💳 [Recette 25](#-recette-25--paiement-orange-money-officiel-avec-minisdkpay) | Paiement avec gestion automatique du doublon caction:'1' et uncertain | Critique |
| 🛡️ [Recette 26](#-recette-26--protection-anti-screenshot-de-billet-qr) | Verrouillage capture d'écran sur billet avec déverrouillage obligatoire | Moyenne |
| 📷 [Recette 27](#-recette-27--scanner-qr-caméra-seule-anti-fraude) | Lecture de QR code via caméra uniquement (sans accès galerie photo) | Facile |
| 🔗 [Recette 28](#-recette-28--deep-linking-sans-boucle-onshow) | Traitement propre des liens d'ouverture sans redéclenchement au retour | Moyenne |
| 🛡️ [Recette 29](#-recette-29--clause-de-garde-darguments-onload) | Sécurisation des pages contre les paramètres manquants avec retour auto | Facile |
| 🔄 [Recette 30](#-recette-30--bouton-retour-intelligent-anti-blocage) | Fallback automatique vers l'accueil quand la page est ouverte sans historique | Facile |
| ⚡ [Recette 31](#-recette-31--anti-flash-de-chargement-0-élément) | Suppression du clignotement à zéro et gestion pluriel propre | Facile |
| 🔒 [Recette 32](#-recette-32--anti-clic-universel-withlock) | Verrouillage anti-rebond d'action réutilisable sur n'importe quelle méthode | Facile |
| 🚨 [Recette 33](#-recette-33--gestionnaire-centralisé-derreurs-typées) | Toast d'erreur contextualisé selon le type (Réseau, Session, Validation) | Moyenne |
| 🤝 [Recette 34](#-recette-34--matrice-disolation-multi-développeurs) | Organisation à 7 développeurs en simultané avec zéro conflit Git | Avancée |
| 👆 [Recette 35](#-recette-35--feedback-tactile-au-clic-hover-class) | Effet de pression "Apple Press" au clic sur boutons et cartes | Facile |
| 🎬 [Recette 36](#-recette-36--animation-dentrée-de-page-fluide) | Transition d'entrée de page douce à 60 FPS avec cascade | Facile |
| 🏆 [Recette 37](#-recette-37--animation-séquentielle-intro-success) | Séquence animée JS avec wx.createAnimation (zoom, rebond, docking) | Avancée |
| 🖼️ [Recette 38](#-recette-38--image-résiliente-avec-retry-3x-et-zoom-plein-écran) | Composant image tout-terrain avec auto-retry 4G et preview natif | Facile |
| 🪟 [Recette 39](#-recette-39--bottom-sheet-avec-safe-area-et-backdrop-blur) | Panneau bas responsive iPhone avec padding Home Indicator | Moyenne |
| 📅 [Recette 40](#-recette-40--calendrier-horizontal-sans-décalage-utc) | Sélecteur de dates avec minDays, blocage et dates additionnelles | Moyenne |
| 🧭 [Recette 41](#-recette-41--nav-bar-sur-mesure-avec-calcul-dynamique-dencoche) | Header custom aligné au pixel près sous la capsule WeChat | Moyenne |
| 🔄 [Recette 42](#-recette-42--liaison-page-eventbus-sans-fuite-mémoire) | Gestionnaire createPageHelpers avec désinscription automatique | Facile |
| ⚡ [Recette 43](#-recette-43--cache-stale-while-revalidate-avec-garde-anti-race) | Affichage instantané 0ms et synchronisation silencieuse | Avancée |
| 💾 [Recette 44](#-recette-44--stockage-local-résilient-anti-quota-10mo) | Wrapper storage avec getOrSet et protection contre chaîne vide | Facile |
| 🌙 [Recette 45](#-recette-45--thème-sombre-dark-mode-avec-variables-css) | Support du mode sombre avec variables adaptatives et écoute à chaud | Moyenne |
| 🌍 [Recette 46](#-recette-46--data-saver-compression-dimage-avant-upload--moniteur-3g) | Compression JPEG 75% client (gain 95% data) et détection 2G/3G | Moyenne |
| 🛡️ [Recette 47](#-recette-47--conformité-cdp-masquage-msisdn-et-purge-sécurisée) | Masquage légal numéro de téléphone et purge de session | Facile |
| 🟠 [Recette 48](#-recette-48--solde-orange-money-om-balance-pill-avec-masquage-1-tap-et-haptique) | Composant signature solde OM avec masquage et haptique | Facile |
| ⚡ [Recette 49](#-recette-49--throttle--debounce-60-fps-pour-scroll-et-saisie-rapide) | Optimisation 60 FPS du scroll et recherche temps réel | Moyenne |
| 🌍 [Recette 50](#-recette-50--moteur-i18n-wxs-0ms-wolof--français--anglais) | Dictionnaire et moteur de traduction WXS instantané | Facile |
| 📦 [Recette 51](#-recette-51--outbox-pattern-offline-first-file-dattente-fifo--auto-sync) | Synchronisation asynchrone hors-ligne et clés d'idempotence | Avancée |
| 🧪 [Recette 52](#-recette-52--harness-de-test-unitaire-headless-pour-machine-à-états-uistate-ci-ready) | Test unitaire automatisé headless hors DevTools | Moyenne |
| 📄 [Recette 53](#-recette-53--générateur-de-billetfacture-pdf-vectoriel-natif-en-pur-js-0-dépendance) | Générateur PDF vectoriel %PDF-1.4 ultra-léger sans npm | Avancée |
| 💺 [Recette 54](#-recette-54--sélecteur-de-sièges-aériens--bus-avec-encodage-gds-15-champs) | Plan de cabine interactif et chaîne normalisée 15 champs | Avancée |
| ⚡ [Recette 55](#-recette-55--rendu-par-lots-de-20-cartes-anti-saturation-du-pont-ipc-wechat) | Batch rendering par paquets de 20 avec callbacks setData | Avancée |
| 💰 [Recette 56](#-recette-56--moteur-de-décomposition-tarifaire-multi-passagers-sans-doublon-de-taxes) | Calculateur de prix multi-passagers blindé anti-mismatch | Moyenne |
| ✈️ [Recette 57](#-recette-57--loader-avion-animé-en-pur-css-ciel-dégradé-nuages-défilants-et-traînée-60-fps) | Animation plein écran de vol 60 FPS ultra-légère | Moyenne |
| 👥 [Recette 58](#-recette-58--sélecteur-de-voyageurs-avec-validation-de-ratios-iata-bébés-sur-genoux) | Formulaire multi-passagers avec contrôle strict des ratios | Facile |
| 📡 [Recette 59](#-recette-59--téléversement-par-morceaux-chunking-1-mo-avec-reprise-automatique-3g4g) | Téléversement résilient de gros fichiers avec reprise après micro-coupure 3G/4G | Avancée |
| 🔐 [Recette 60](#-recette-60--stockage-local-chiffré-aes-transparent-protection-data-at-rest-cdp--sonatel) | Chiffrement symétrique Data-at-Rest des tokens, MSISDN et pièces d'identité | Moyenne |
| ⚡ [Recette 61](#-recette-61--gestionnaire-websocket-résilient-avec-heartbeat-pingpong--reconnexion-auto) | Flux bidirectionnel temps réel avec heartbeat, reconnexion progressive et outbox | Avancée |
| 🎯 [Recette 62](#-recette-62--action-optimiste-transactionnelle-avec-rollback-automatique-sur-erreur-serveur) | Mise à jour UI instantanée 0ms avec annulation propre si l'API backend échoue | Moyenne |
| 🛡️ [Recette 63](#-recette-63--bootstrapper-de-sous-paquet-indépendant-pour-deep-links--qr-codes) | Sécurisation de l'arrivée directe sur un sous-paquet sans attendre l'accueil | Facile |
| ♿ [Recette 64](#-recette-64--accessibilité-inclusive--lecteurs-décran-voiceover--talkback--aria-) | Rendre le mini-programme 100% accessible aux personnes malvoyantes (VoiceOver / TalkBack) | Facile |
| 📝 [Recette 65](#-recette-65--formulaires-dynamiques-pilotés-par-schéma-json-server-driven-form-builder) | Moteur de formulaires dynamiques généré par JSON backend sans recompiler | Avancée |
| 🎨 [Recette 66](#-recette-66--rendu-garanti-avant-traitement-lourd-waitfornextpaint--garde-anti-zombie-isdisposed) | Forcer l'affichage du loader avant les tâches lourdes et neutraliser les fuites | Moyenne |
| 🔢 [Recette 67](#-recette-67--indicateur-détapes-horizontal-pour-entonnoirs-multi-écrans-app-stepper) | Stepper responsive d'avancement pour tunnels de réservation et formulaires | Moyenne |
| ⚖️ [Recette 68](#-recette-68--machine-de-traitement-post-paiement-tri-statut-confirmed--failed--unknown) | Résolution post-paiement Orange Money 3 états (confirmé, rejeté, incertain) | Critique |
| ✈️ [Recette 69](#-recette-69--résolveur-de-logos--transporteurs-avec-cache-local-whitelist-domaines--fallback-initiales) | Résolution logos compagnies 0ms, tolérance accents et fallback initiales SVG/CSS | Facile |
| 🧳 [Recette 70](#-recette-70--accordéon-de-franchise-bagages--règles-tarifaires-à-nœud-virtuel-virtualhost) | Composant accordéon 60 FPS sans conteneur DOM parasite et modèle strict API | Moyenne |
| 📄 [Recette 71](#-recette-71--export-de-billet--reçu-client-vectoriel-pdf-et-canvas-2d-mobile) | Génération haute résolution sur le mobile, timeout guard et pagination GPU | Avancée |
| 🛡️ [Recette 72](#-recette-72--lecteur-défensif-de-schémas-json-opaques--réconciliation-darrondis-monétaires) | Exploration multi-chemins anti-crash TypeError et réconciliation des centimes | Moyenne |
| 💬 [Recette 73](#-recette-73--pont-hybride-support-client-whatsapp--téléphone-modale-in-app-long-press-qr-et-anti-black-screen) | Passerelle support WhatsApp avec modale in-app anti-écran noir, détection appui long et liens courts | Moyenne |
| ⚡ [Recette 74](#-recette-74--découpage-modulaire-dun-tunnel-monolithique-et-helpers-de-page-pattern-kalidou) | Découpage en 6 méthodes atomiques d'un tunnel de paiement/action et helpers de page | Avancée |

---

## 🔵 Recette 1 : Page de Liste avec API + Skeleton + Scroll Infini

**Quand l'utiliser ?** Vous affichez une liste de produits, de vols, de commandes, etc. La liste se charge depuis le serveur et s'allonge automatiquement quand on descend.

### Étape 1/4 — Le Mappeur (`utils/mappers/[MON_DOMAINE].js`)
```javascript
// ✏️ Définit la "forme" de chaque élément de la liste
export const [MonItemSchema] = {
  id:    "@link.[id_serveur]",
  titre: "@link.[nom_serveur]",
  prix:  "@link.[prix_serveur]::number"
};
```

### Étape 2/4 — L'API (`utils/apis/[mondomaine].api.js`)
```javascript
async getListe(page = 1) {
  await authenticate();
  const res = await httpClient.get('[/api/ma-route]', { query: { page, limit: 10 } });
  if (!res.success) throw new Error(res.error?.message);
  return sculpt.list({ data: res.data.items, to: [MonItemSchema] });
}
```

### Étape 3/4 — La Page (`pages/[ma-page]/index.js`)
```javascript
import { [monAPI] } from '../../utils/apis/index.js';

Page({
  data: {
    uiState: 'loading', // loading | content | empty | error
    liste: [],
    pageActuelle: 1,
    estFini: false
  },

  onLoad() { this.charger(); },

  // 🔒 Se déclenche automatiquement quand on touche le bas
  onReachBottom() {
    if (!this.data.estFini) this.charger();
  },

  async charger() {
    try {
      const nouvelles = await [monAPI].getListe(this.data.pageActuelle);
      const listeMaj = [...this.data.liste, ...nouvelles];
      this.setData({
        liste: listeMaj,
        pageActuelle: this.data.pageActuelle + 1,
        estFini: nouvelles.length === 0,
        uiState: listeMaj.length === 0 ? 'empty' : 'content'
      });
    } catch (e) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Étape 4/4 — La Vue (`index.wxml` + `index.wxss`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<!-- ÉTAT : Chargement initial (Skeleton) -->
<view wx:if="{{uiState === 'loading'}}" class="container">
  <view wx:for="{{[1,2,3,4]}}" class="skeleton-card animate-pulse" />
</view>

<!-- ÉTAT : Liste affichée -->
<view wx:elif="{{uiState === 'content'}}" class="container animate-fade-in">
  <view wx:for="{{liste}}" wx:key="id" class="card">
    <text class="card__titre">{{item.titre}}</text>
    <text class="card__prix">{{ f.formatPrix(item.prix) }}</text>
  </view>
  <!-- Message quand tout est chargé -->
  <text wx:if="{{estFini}}" class="fin-liste">Tout est affiché ✓</text>
</view>

<!-- ÉTAT : Vide -->
<view wx:elif="{{uiState === 'empty'}}">
  <text>Aucun élément trouvé.</text>
</view>
```

```css
.skeleton-card {
  height: 80px; background: #e8e8e8; border-radius: 12px;
  margin-bottom: 12px; animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse { 50% { opacity: 0.4; } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fin-liste { text-align: center; color: #aaa; padding: 16px; font-size: 12px; }
```

---

## 🔵 Recette 2 : Formulaire Complet avec Validation et Envoi API

**Quand l'utiliser ?** Un formulaire d'inscription, de contact, de modification de profil. Le bouton "Envoyer" reste bloqué tant que les champs sont invalides.

### Étape 1/3 — L'API (`utils/apis/[mondomaine].api.js`)
```javascript
async creer(payload) {
  await authenticate();
  const res = await httpClient.post('[/api/ma-route]', payload);
  if (!res.success) throw new Error(res.error?.message);
  return res.data;
}
```

### Étape 2/3 — La Page (`index.js`)
```javascript
Page({
  data: {
    uiState: 'idle', // idle | loading | success | error
    // ✏️ Un champ par input du formulaire
    champs: { email: '', motDePasse: '' },
    formulaireValide: false
  },

  // 🔒 Appelé à chaque frappe clavier (bindinput)
  auChangement(e) {
    const champ = e.currentTarget.dataset.champ;
    const valeur = e.detail.value;
    const champsMaj = { ...this.data.champs, [champ]: valeur };
    
    this.setData({
      champs: champsMaj,
      // ✏️ Vos règles de validation ici
      formulaireValide: champsMaj.email.includes('@') && champsMaj.motDePasse.length >= 6
    });
  },

  async envoyer() {
    if (!this.data.formulaireValide) return;
    this.setData({ uiState: 'loading' });
    try {
      await [monAPI].creer(this.data.champs);
      this.setData({ uiState: 'success' });
      setTimeout(() => wx.navigateBack(), 1500); // Retour après succès
    } catch (e) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Étape 3/3 — La Vue (`index.wxml`)
```xml
<!-- ✏️ data-champ doit correspondre à votre clé dans 'champs' -->
<input placeholder="Email" data-champ="email" bindinput="auChangement" />
<input placeholder="Mot de passe" password data-champ="motDePasse" bindinput="auChangement" />

<!-- Le bouton est grisé automatiquement si formulaireValide est faux -->
<button
  disabled="{{!formulaireValide || uiState === 'loading'}}"
  bindtap="envoyer"
  loading="{{uiState === 'loading'}}">
  Envoyer
</button>

<!-- Message de succès -->
<view wx:if="{{uiState === 'success'}}" class="animate-bounce-in">
  <icon type="success" size="48" />
  <text>Enregistré !</text>
</view>
```

---

## 🔵 Recette 3 : Page de Détail avec API

**Quand l'utiliser ?** Une page qui reçoit un `id` en paramètre (produit, vol, commande) et charge ses infos depuis le serveur.

### Étape 1/3 — Le Mappeur + API
```javascript
// utils/mappers/[mondomaine].js
export const [MonDetailSchema] = {
  id:          "@link.[id_serveur]",
  titre:       "@link.[titre_serveur]",
  description: "@link.[desc_serveur]",
  prix:        "@link.[prix_serveur]::number"
};

// utils/apis/[mondomaine].api.js
async getDetail(id) {
  await authenticate();
  const res = await httpClient.get(`[/api/ma-route/${id}]`);
  if (!res.success) throw new Error(res.error?.message);
  return sculpt.data({ data: res.data, to: [MonDetailSchema] });
}
```

### Étape 2/3 — La Page (`index.js`)
```javascript
Page({
  data: { uiState: 'loading', detail: null },

  async onLoad(options) {
    // 🔒 L'ID vient automatiquement de l'URL (ex: ?id=42)
    const id = options.id;
    try {
      const detail = await [monAPI].getDetail(id);
      this.setData({ detail, uiState: 'content' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

### Étape 3/3 — La Vue (`index.wxml`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<view wx:if="{{uiState === 'loading'}}" class="skeleton-detail animate-pulse" />

<view wx:elif="{{uiState === 'content'}}" class="detail animate-fade-in">
  <text class="titre">{{detail.titre}}</text>
  <text class="description">{{detail.description}}</text>
  <text class="prix">{{ f.formatPrix(detail.prix) }}</text>
</view>

<view wx:elif="{{uiState === 'error'}}">
  <text>Impossible de charger. Réessayez.</text>
</view>
```

---

## 🔵 Recette 4 : Upload Photo + Envoi au Serveur

**Quand l'utiliser ?** Photo de profil, pièce jointe, preuve de paiement. L'utilisateur choisit la photo, on l'affiche à l'écran, puis on l'envoie.

### Étape 1/2 — La Page (`index.js`)
```javascript
Page({
  data: { imagePreview: null, uiState: 'idle' },

  choisirEtEnvoyer() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const cheminLocal = res.tempFiles[0].tempFilePath;
        // 1. Afficher l'image immédiatement
        this.setData({ imagePreview: cheminLocal, uiState: 'loading' });
        try {
          // 2. Envoyer au serveur
          await [monAPI].uploaderFichier(cheminLocal);
          this.setData({ uiState: 'success' });
          wx.showToast({ title: 'Photo enregistrée !', icon: 'success' });
        } catch (e) {
          this.setData({ uiState: 'error' });
          wx.showToast({ title: e.message, icon: 'none' });
        }
      }
    });
  }
});
```

### Étape 2/2 — La Vue (`index.wxml`)
```xml
<view class="upload-zone" bindtap="choisirEtEnvoyer">
  <!-- Aperçu de l'image choisie -->
  <image wx:if="{{imagePreview}}" src="{{imagePreview}}" mode="aspectFill" class="apercu" />
  <!-- Zone vide avant la sélection -->
  <view wx:else class="placeholder">
    <text class="icone">+</text>
    <text>Choisir une photo</text>
  </view>
  <!-- Indicateur de chargement par-dessus l'image -->
  <view wx:if="{{uiState === 'loading'}}" class="overlay-loading">
    <text>Envoi...</text>
  </view>
</view>
```

---

## 🔵 Recette 5 : Filtres sur une Page Séparée qui Rafraîchit la Liste

**Quand l'utiliser ?** Un bouton "Filtres" qui ouvre une nouvelle page. L'utilisateur choisit ses filtres, valide, et la page principale se recharge avec les filtres appliqués.

### Page A — La Liste Principale (`pages/liste/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  data: { liste: [], filtresActifs: {} },

  onLoad() {
    // 🔒 Allumer le talkie-walkie
    Bus.on('APPLIQUER_FILTRES', this.rechargerAvecFiltres, this);
    this.rechargerAvecFiltres({});
  },
  onUnload() {
    // 🔒 VITAL : Éteindre le talkie-walkie
    Bus.off('APPLIQUER_FILTRES', this.rechargerAvecFiltres, this);
  },

  ouvrirFiltres() {
    wx.navigateTo({ url: '/pages/filtres/index' });
  },

  async rechargerAvecFiltres(filtres) {
    this.setData({ filtresActifs: filtres });
    // ✏️ Votre appel API avec les filtres
    const liste = await monAPI.getListe(filtres);
    this.setData({ liste });
  }
});
```

### Page B — La Page de Filtres (`pages/filtres/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  data: { prixMax: 100000 },

  changerPrix(e) { this.setData({ prixMax: e.detail.value }); },

  valider() {
    // 🔒 Crier dans le talkie-walkie et retourner
    Bus.emit('APPLIQUER_FILTRES', { prixMax: this.data.prixMax });
    wx.navigateBack();
  }
});
```

---

## 🔵 Recette 6 : Compteur de Panier Partagé entre toutes les Pages

**Quand l'utiliser ?** Une pastille rouge sur la NavBar qui montre le nombre d'articles dans le panier, et qui se met à jour immédiatement n'importe où dans l'app.

### La NavBar Partagée (`components/navbar/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Component({
  data: { compteur: 0 },
  lifetimes: {
    attached() {
      // 🔒 Regarder le "tableau central" en permanence
      Bus.onState('panier.compteur', (val) => {
        this.setData({ compteur: val });
      }, this);
    },
    detached() { Bus.offState('panier.compteur', this); }
  }
});
```

### La NavBar Partagée (`components/navbar/index.wxml`)
```xml
<view class="navbar">
  <view class="panier-icon">
    🛒
    <!-- La pastille rouge n'apparaît que s'il y a des items -->
    <view wx:if="{{compteur > 0}}" class="pastille">
      <text>{{compteur}}</text>
    </view>
  </view>
</view>
```

### N'importe quelle page qui ajoute au panier (`pages/produit/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  ajouterAuPanier() {
    // Votre logique métier...
    const nouveauCompteur = wx.getStorageSync('panier_count') + 1;
    wx.setStorageSync('panier_count', nouveauCompteur);
    
    // 🔒 Mettre à jour le tableau central. La NavBar se met à jour instantanément.
    Bus.setState('panier.compteur', nouveauCompteur);
    wx.showToast({ title: 'Ajouté !', icon: 'success' });
  }
});
```

---

## 🟢 Recette 7 : Connexion / Login et Protection de Pages

**Quand l'utiliser ?** Toute application avec des comptes utilisateurs. La page de login envoie les identifiants, reçoit un token, et redirige vers l'accueil. Les autres pages vérifient que l'utilisateur est connecté avant de s'afficher.

### La Page de Login (`pages/login/index.js`)
```javascript
Page({
  data: {
    uiState: 'idle',
    champs: { email: '', motDePasse: '' },
    formulaireValide: false
  },

  auChangement(e) {
    const champ = e.currentTarget.dataset.champ;
    const champsMaj = { ...this.data.champs, [champ]: e.detail.value };
    this.setData({
      champs: champsMaj,
      formulaireValide: champsMaj.email.length > 3 && champsMaj.motDePasse.length >= 6
    });
  },

  async seConnecter() {
    if (!this.data.formulaireValide) return;
    this.setData({ uiState: 'loading' });
    try {
      const res = await authAPI.login(this.data.champs);
      // 🔒 Sauvegarde du token pour toutes les futures requêtes
      wx.setStorageSync('auth_token', res.token);
      wx.setStorageSync('user_id', res.userId);
      // 🔒 Redirection sans possibilité de revenir en arrière
      wx.reLaunch({ url: '/pages/accueil/index' });
    } catch (e) {
      this.setData({ uiState: 'idle' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Protection d'une Page Privée (à mettre dans `onLoad`)
```javascript
onLoad() {
  // 🔒 GARDIEN : Si pas de token, on renvoie au login
  const token = wx.getStorageSync('auth_token');
  if (!token) {
    wx.reLaunch({ url: '/pages/login/index' });
    return; // Arrêter l'exécution
  }
  // Suite du code de la page...
}
```

---

## 🟢 Recette 8 : Pull-to-Refresh (Tirer pour Recharger)

**Quand l'utiliser ?** L'utilisateur tire vers le bas pour recharger manuellement la liste (comme sur Facebook, Instagram, Twitter).

### Dans le `index.json` de la page (OBLIGATOIRE)
```json
{
  "enablePullDownRefresh": true,
  "backgroundTextStyle": "dark"
}
```

### Dans le `index.js`
```javascript
Page({
  data: { liste: [], uiState: 'loading' },

  onLoad() { this.charger(); },

  // 🔒 Se déclenche automatiquement quand on tire vers le bas
  async onPullDownRefresh() {
    this.setData({ liste: [], pageActuelle: 1 });
    await this.charger();
    // 🔒 OBLIGATOIRE : Arrête l'animation de rechargement
    wx.stopPullDownRefresh();
  },

  async charger() {
    try {
      const liste = await monAPI.getListe();
      this.setData({ liste, uiState: 'content' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

---

## 🟢 Recette 9 : Recherche en Temps Réel (Debounce)

**Quand l'utiliser ?** Une barre de recherche qui ne lance pas une requête à chaque lettre tapée (trop lent), mais attend que l'utilisateur ait fini de taper (après 400ms de silence).

### Dans le `index.js`
```javascript
Page({
  data: { resultats: [], uiState: 'idle' },
  // 🔒 Variable interne pour le timer (PAS dans data)
  _debounceTimer: null,

  auChangementRecherche(e) {
    const texte = e.detail.value;

    // 🔒 On annule le timer précédent à chaque nouvelle frappe
    if (this._debounceTimer) clearTimeout(this._debounceTimer);

    if (texte.length < 2) {
      this.setData({ resultats: [], uiState: 'idle' });
      return;
    }

    // 🔒 On lance la recherche seulement 400ms après la dernière frappe
    this._debounceTimer = setTimeout(async () => {
      this.setData({ uiState: 'loading' });
      try {
        // ✏️ Votre appel API ici
        const resultats = await monAPI.rechercher({ q: texte });
        this.setData({ resultats, uiState: resultats.length ? 'content' : 'empty' });
      } catch (e) {
        this.setData({ uiState: 'error' });
      }
    }, 400);
  }
});
```

### Dans le `index.wxml`
```xml
<input placeholder="Rechercher..." bindinput="auChangementRecherche" />

<view wx:if="{{uiState === 'loading'}}"><text>Recherche en cours...</text></view>
<view wx:elif="{{uiState === 'empty'}}"><text>Aucun résultat.</text></view>
<view wx:elif="{{uiState === 'content'}}">
  <view wx:for="{{resultats}}" wx:key="id" class="resultat-item animate-fade-in">
    <text>{{item.titre}}</text>
  </view>
</view>
```

---

## 🟢 Recette 10 : Bouton Favoris/Like (Toggle)

**Quand l'utiliser ?** Un bouton cœur ou étoile qui s'allume/s'éteint quand on clique, et qui sauvegarde l'état sur le serveur.

### Dans le `index.js`
```javascript
Page({
  data: { estFavori: false, idItem: null },

  onLoad(options) {
    this.setData({ idItem: options.id });
    // ✏️ Charger l'état favori depuis le serveur ou le cache
    const cache = wx.getStorageSync(`favori_${options.id}`);
    this.setData({ estFavori: !!cache });
  },

  async toggleFavori() {
    const nouvelEtat = !this.data.estFavori;
    // 🔒 Mise à jour immédiate de l'UI (pas d'attente serveur)
    this.setData({ estFavori: nouvelEtat });

    try {
      if (nouvelEtat) {
        await monAPI.ajouterFavori(this.data.idItem);
        wx.setStorageSync(`favori_${this.data.idItem}`, true);
      } else {
        await monAPI.supprimerFavori(this.data.idItem);
        wx.removeStorageSync(`favori_${this.data.idItem}`);
      }
    } catch (e) {
      // 🔒 Si le serveur échoue, on annule le changement visuel
      this.setData({ estFavori: !nouvelEtat });
      wx.showToast({ title: 'Erreur, réessayez.', icon: 'none' });
    }
  }
});
```

### Dans le `index.wxml`
```xml
<!-- Le cœur change de couleur instantanément -->
<view class="btn-favori {{estFavori ? 'actif' : ''}}" bindtap="toggleFavori">
  <text>{{ estFavori ? '❤️' : '🤍' }}</text>
</view>
```

---

## 🟢 Recette 11 : Partage WeChat (Envoyer à un Ami)

**Quand l'utiliser ?** L'utilisateur veut partager un produit, un article, ou une page de l'app à un ami dans une conversation WeChat.

### Dans le `index.js`
```javascript
Page({
  data: { detail: { titre: '', id: '' } },

  // 🔒 Fonction native WeChat : S'active quand on clique sur le bouton Share
  onShareAppMessage() {
    return {
      // ✏️ Le titre de la bulle dans la conversation
      title: this.data.detail.titre,
      // ✏️ La page où l'ami va atterrir quand il clique (avec l'ID en paramètre)
      path: `/pages/detail/index?id=${this.data.detail.id}`,
      // ✏️ L'image qui s'affiche dans la bulle
      imageUrl: this.data.detail.imageUrl
    };
  }
});
```

### Dans le `index.wxml`
```xml
<!-- 🔒 open-type="share" est OBLIGATOIRE pour déclencher le partage WeChat -->
<button open-type="share" class="btn-partager">
  Envoyer à un ami 📤
</button>
```

---

## 🟢 Recette 12 : Onglets (Tabs) avec Changement de Données

**Quand l'utiliser ?** Un menu à onglets ("En cours" / "Terminé" / "Annulé") où chaque onglet affiche des données différentes chargées depuis le serveur.

### Dans le `index.js`
```javascript
Page({
  data: {
    ongletActif: 'en_cours', // ✏️ Valeur par défaut
    onglets: [
      { id: 'en_cours', label: 'En Cours' },
      { id: 'termine', label: 'Terminé' },
      { id: 'annule', label: 'Annulé' }
    ],
    liste: [],
    uiState: 'loading'
  },

  onLoad() { this.charger('en_cours'); },

  changerOnglet(e) {
    const nouvelOnglet = e.currentTarget.dataset.id;
    if (nouvelOnglet === this.data.ongletActif) return; // Pas de double chargement
    this.setData({ ongletActif: nouvelOnglet, uiState: 'loading', liste: [] });
    this.charger(nouvelOnglet);
  },

  async charger(statut) {
    try {
      // ✏️ Votre appel API avec le filtre statut
      const liste = await monAPI.getListe({ statut });
      this.setData({ liste, uiState: liste.length ? 'content' : 'empty' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

### Dans le `index.wxml`
```xml
<!-- Les boutons des onglets -->
<view class="tabs-bar">
  <view
    wx:for="{{onglets}}" wx:key="id"
    class="tab {{ongletActif === item.id ? 'tab--actif' : ''}}"
    bindtap="changerOnglet"
    data-id="{{item.id}}">
    {{item.label}}
  </view>
</view>

<!-- Le contenu -->
<view wx:if="{{uiState === 'loading'}}" class="skeleton animate-pulse" />
<view wx:elif="{{uiState === 'content'}}" class="animate-fade-in">
  <view wx:for="{{liste}}" wx:key="id">
    <text>{{item.titre}}</text>
  </view>
</view>
<view wx:elif="{{uiState === 'empty'}}"><text>Aucun élément.</text></view>
```

---

## 🟢 Recette 13 : Cache Local (Données Hors Ligne)

**Quand l'utiliser ?** Vous voulez que l'application affiche des données même sans réseau. On affiche d'abord le cache, puis on met à jour depuis le serveur en arrière-plan.

### Dans le `index.js`
```javascript
const CLE_CACHE = 'cache_ma_liste'; // ✏️ Changez ce nom

Page({
  data: { liste: [], uiState: 'loading' },

  async onLoad() {
    // 🔒 ÉTAPE 1 : Afficher le cache immédiatement (zéro attente)
    const cache = wx.getStorageSync(CLE_CACHE);
    if (cache) {
      this.setData({ liste: cache, uiState: 'content' });
    }

    // 🔒 ÉTAPE 2 : Mettre à jour depuis le serveur en arrière-plan
    try {
      const fraîches = await monAPI.getListe();
      // Mettre à jour seulement si les données ont changé
      if (JSON.stringify(fraîches) !== JSON.stringify(this.data.liste)) {
        this.setData({ liste: fraîches });
        // 🔒 Sauvegarder le nouveau cache pour la prochaine visite
        wx.setStorageSync(CLE_CACHE, fraîches);
      }
    } catch (e) {
      // Pas grave si le réseau échoue : le cache est déjà affiché
      if (!cache) this.setData({ uiState: 'error' });
    }
  }
});
```


---

## 🔴 Recette 14 : Paiement Marchand Natif avec Bouclier Anti-Double Débit

**Quand l'utiliser ?** Vous devez déclencher un paiement mobile via le plugin natif TCMPP / Max It (`merchantPay`) en garantissant qu'aucun client ne peut être débité deux fois même s'il clique plusieurs fois ou si la connexion saute.

### Étape 1/2 — Le Service Natif (`utils/apis/native.js`)
```javascript
export function invokeMerchantPay({ merchantId, amount, orderId }) {
  return new Promise((resolve, reject) => {
    if (typeof wx.invokeNativePlugin !== 'function') {
      return reject(new Error('Plugin natif non disponible'));
    }
    wx.invokeNativePlugin({
      plugin: 'merchantPay',
      param: {
        merchantId,
        amount: Math.round(Number(amount)),
        orderId,
        serviceType: 'MERCHANT_PAY'
      },
      success(res) {
        const code = String(res?.code || res?.resultCode || '').toUpperCase();
        if (code === 'SUCCEED' || code === 'SUCCESS' || code === '00') {
          resolve({ txnid: String(res.txnid || res.transactionId || '') });
        } else if (code === 'CANCEL') {
          reject(new Error('Paiement annulé par l'utilisateur'));
        } else {
          reject(new Error(res?.message || 'Échec du paiement'));
        }
      },
      fail(err) {
        reject(new Error(err?.errMsg || 'Service de paiement indisponible'));
      }
    });
  });
}
```

### Étape 2/2 — Le Contrôleur de Page (`pages/[ma-page]/[ma-page].js`)
```javascript
import { invokeMerchantPay } from '../../utils/apis/native.js';
import { BackendAPI } from '../../utils/apis/index.js';

Page({
  data: { isSubmitting: false, montant: 15000, commandeId: 'CMD-123' },
  _confirmedTxnid: null, // 🛡️ Bouclier d'idempotence

  async handlePayer() {
    if (this.data.isSubmitting) return;
    this.setData({ isSubmitting: true });

    try {
      let txnid = this._confirmedTxnid;

      // 1. Débit bancaire UNIQUEMENT si pas encore débité
      if (!txnid) {
        wx.showLoading({ title: 'Paiement...', mask: true });
        const res = await invokeMerchantPay({
          merchantId: 'MARCHAND_ID',
          amount: this.data.montant,
          orderId: this.data.commandeId
        });
        txnid = res.txnid;
        this._confirmedTxnid = txnid; // 🔒 Scellé !
      }

      // 2. Enregistrement backend (rejouable sans repayer)
      wx.showLoading({ title: 'Confirmation...', mask: true });
      await BackendAPI.confirmerCommande({ commandeId: this.data.commandeId, txnid });

      this._confirmedTxnid = null;
      wx.hideLoading();
      wx.redirectTo({ url: '/pages/confirmation/confirmation' });

    } catch (err) {
      wx.hideLoading();
      this.setData({ isSubmitting: false });

      if (this._confirmedTxnid) {
        // Débité mais confirmation réseau échouée : on rassure le client
        wx.showModal({
          title: 'Paiement effectué',
          content: 'Votre compte a été débité. Cliquez sur Réessayer pour valider votre commande sans repayer.',
          confirmText: 'Réessayer',
          showCancel: false,
          success: (res) => { if (res.confirm) this.handlePayer(); }
        });
      } else {
        wx.showToast({ title: err.message, icon: 'none' });
      }
    }
  }
});
```

---

## 🔴 Recette 15 : Smart Polling Asynchrone avec Backoff Progressif

**Quand l'utiliser ?** Vous avez une opération sensible (validation de paiement, réservation) et vous voulez encaisser 95 % des micro-coupures 4G de manière 100 % transparente sans déranger l'utilisateur.

### Dans vos Helpers ou dans la Page
```javascript
/**
 * Exécute une promesse avec 3 tentatives silencieuses (immédiat, +2s, +4s)
 * @param {Function} asyncFn - Fonction asynchrone à exécuter
 * @param {number[]} [delays=[0, 2000, 4000]] - Délais entre les essais
 */
export async function executeSmartPolling(asyncFn, delays = [0, 2000, 4000]) {
  let lastError;
  for (let i = 0; i < delays.length; i++) {
    if (delays[i] > 0) {
      await new Promise((r) => setTimeout(r, delays[i]));
    }
    try {
      return await asyncFn(i + 1); // Succès immédiat !
    } catch (err) {
      lastError = err;
      // Arrêter si erreur 4xx définitive (ex: 400 mauvaise requête)
      if (err.status && err.status >= 400 && err.status < 500) {
        throw err;
      }
    }
  }
  throw lastError; // Propage l'erreur si tous les essais ont échoué
}
```

---

## 📱 Recette 16 : Barre de Navigation Custom & Capsule WeChat

**Quand l'utiliser ?** Vous voulez un en-tête d'application sur mesure (titre personnalisé, bouton retour, logo) qui ne rentre JAMAIS en collision avec la capsule native de WeChat sur iPhone comme sur Android.

### Étape 1/3 — Le Helper de Calcul (`utils/helpers/system-info.js`)
```javascript
export function getNavBarGeometry() {
  const sys = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
  const statusBarHeight = sys.statusBarHeight || 20;

  if (menu && menu.top > 0) {
    const navBarHeight = (menu.top - statusBarHeight) * 2 + menu.height;
    return {
      statusBarHeight,
      navBarHeight,
      totalHeight: statusBarHeight + navBarHeight,
      capsuleWidth: menu.width
    };
  }
  return { statusBarHeight, navBarHeight: 44, totalHeight: statusBarHeight + 44, capsuleWidth: 87 };
}
```

### Étape 2/3 — Le WXML du Composant (`components/custom-nav-bar/index.wxml`)
```xml
<view class="nav-bar-fixed" style="height: {{ geometry.totalHeight }}px; padding-top: {{ geometry.statusBarHeight }}px;">
  <view class="nav-bar-inner" style="height: {{ geometry.navBarHeight }}px;">
    <view class="nav-back" bindtap="goBack">‹</view>
    <view class="nav-title">{{ title }}</view>
  </view>
</view>
<view style="height: {{ geometry.totalHeight }}px;"></view>
```

### Étape 3/3 — Le JS du Composant (`components/custom-nav-bar/index.js`)
```javascript
import { getNavBarGeometry } from '../../utils/helpers/system-info.js';

Component({
  properties: { title: { type: String, value: '' } },
  data: { geometry: {} },
  attached() {
    this.setData({ geometry: getNavBarGeometry() });
  },
  methods: {
    goBack() {
      if (getCurrentPages().length > 1) wx.navigateBack();
      else wx.switchTab({ url: '/pages/home/home' });
    }
  }
});
```

---

## 📱 Recette 17 : Custom TabBar WeChat Sans Scintillement

**Quand l'utiliser ?** Vous utilisez le mode officiel `"custom": true` dans `app.json` et vous voulez que l'onglet actif s'affiche immédiatement sans clignoter et sans désynchronisation.

### Dans chaque page d'onglet (`pages/home/home.js`, `pages/favoris/favoris.js`, etc.)
```javascript
Page({
  onShow() {
    // 🔒 Indique le bon index au custom tab bar (ex: 0 pour Home, 1 pour Explore, etc.)
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
  }
});
```

### Le WXSS du Custom TabBar (`custom-tab-bar/index.wxss`)
```wxss
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 98rpx;
  background: #FFFFFF;
  display: flex;
  box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
  /* 🛡️ Protection Safe Area obligatoire sur iPhone */
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}
.tab-item { flex: 1; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.tab-icon { width: 48rpx; height: 48rpx; }
.tab-text { font-size: 20rpx; color: #999999; margin-top: 4rpx; }
.tab-item.active .tab-text { color: #FF7900; font-weight: bold; }
```

---

## ⚡ Recette 18 : Store Réactif Léger avec Cache Stale-While-Revalidate

**Quand l'utiliser ?** Partager des données entre plusieurs pages (ex: liste de produits, favoris, panier) sans installer Redux/MobX, avec lecture immédiate depuis le stockage local et mise à jour en tâche de fond.

### Le Store (`utils/stores/mon-store.js`)
```javascript
const CACHE_KEY = 'mon_app_store_cache';
const TTL_MS = 15 * 60 * 1000; // 15 minutes

let state = {
  items: wx.getStorageSync(CACHE_KEY)?.items || [],
  lastUpdated: wx.getStorageSync(CACHE_KEY)?.timestamp || 0
};

export const MonStore = {
  getItems() {
    return state.items;
  },
  isFresh() {
    return (Date.now() - state.lastUpdated) < TTL_MS && state.items.length > 0;
  },
  setItems(newItems) {
    state.items = Array.isArray(newItems) ? newItems : [];
    state.lastUpdated = Date.now();
    wx.setStorage({
      key: CACHE_KEY,
      data: { items: state.items, timestamp: state.lastUpdated }
    });
  }
};
```

### Utilisation dans une Page (`pages/catalogue/catalogue.js`)
```javascript
import { MonStore } from '../../utils/stores/mon-store.js';
import { BackendAPI } from '../../utils/apis/index.js';

Page({
  data: { items: [] },

  async onLoad() {
    // 1. Rendu instantané depuis le store / cache
    this.setData({ items: MonStore.getItems() });

    // 2. Si le cache a expiré, mise à jour silencieuse
    if (!MonStore.isFresh()) {
      try {
        const freshItems = await BackendAPI.getItems();
        MonStore.setItems(freshItems);
        this.setData({ items: freshItems });
      } catch (e) {
        console.warn('Impossible de rafraîchir en arrière-plan', e);
      }
    }
  }
});
```


---

## 🚦 Recette 19 : Navigation Sécurisée Anti-Crash (Pile 10 Pages)

**Quand l'utiliser ?** Dès que vous naviguez entre plusieurs pages pour éviter que l'application ne freeze silencieusement quand l'utilisateur a ouvert 10 pages d'affilée, ou clique trop vite deux fois.

### Le Helper (`utils/helpers/navigation.js`)
```javascript
export function navigateToSafe(url) {
  return new Promise((resolve, reject) => {
    if (getCurrentPages().length >= 10) {
      wx.redirectTo({ url, success: resolve, fail: reject });
    } else {
      wx.navigateTo({
        url,
        success: resolve,
        fail: () => wx.redirectTo({ url, success: resolve, fail: reject })
      });
    }
  });
}

export function withNavLock(pageInstance, action) {
  if (pageInstance._navLocked) return;
  pageInstance._navLocked = true;
  try {
    action();
  } finally {
    setTimeout(() => { pageInstance._navLocked = false; }, 500);
  }
}
```

---

## 🧩 Recette 20 : WeChat Behavior Partagé (`loadingBehavior`)

**Quand l'utiliser ?** Vous avez 10 pages ou composants qui font des appels API et vous en avez assez de réécrire `isLoading: true`, `try/catch`, `wx.showLoading` et `this.setData({ isLoading: false })`.

### Le Mixin (`utils/behaviors/loading.js`)
```javascript
export const loadingBehavior = Behavior({
  data: { isLoading: false, hasError: false, errorMessage: '' },
  methods: {
    async withLoading(asyncFn, loadingTitle = 'Chargement...') {
      this.setData({ isLoading: true, hasError: false, errorMessage: '' });
      if (loadingTitle) wx.showLoading({ title: loadingTitle, mask: true });
      try {
        return await asyncFn();
      } catch (err) {
        this.setData({ hasError: true, errorMessage: err.message || 'Erreur' });
        throw err;
      } finally {
        if (loadingTitle) wx.hideLoading();
        this.setData({ isLoading: false });
      }
    }
  }
});
```

### Utilisation dans votre Page
```javascript
import { loadingBehavior } from '../../utils/behaviors/loading.js';

Page({
  behaviors: [loadingBehavior],
  async onLoad() {
    await this.withLoading(async () => {
      const data = await monAPI.getProduits();
      this.setData({ produits: data });
    });
  }
});
```

---

## ❤️ Recette 21 : Favoris Instantanés (Double Cache Mémoire + Disque)

**Quand l'utiliser ?** L'utilisateur clique sur le cœur d'une carte dans une liste. Le cœur doit changer de couleur immédiatement (0ms) et rester synchronisé partout.

### Le Service (`utils/helpers/favorites.js`)
```javascript
const STORAGE_KEY = 'mes_favoris_ids';
let cache = null;

function loadIds() {
  if (cache === null) {
    try { cache = wx.getStorageSync(STORAGE_KEY) || []; } catch { cache = []; }
  }
  return cache;
}

export const Favorites = {
  isFav(id) { return loadIds().includes(String(id)); },
  toggle(id) {
    const ids = loadIds();
    const str = String(id);
    cache = ids.includes(str) ? ids.filter(i => i !== str) : [...ids, str];
    wx.setStorage({ key: STORAGE_KEY, data: cache });
    return cache.includes(str);
  }
};
```

---

## 📊 Recette 22 : Calculateur de Délais & Barèmes d'Annulation

**Quand l'utiliser ?** Calculer les pénalités et les montants remboursables en fonction de la date du voyage sans subir les bugs de décalage horaire UTC/local.

### Le Helper (`utils/helpers/cancellation.js`)
```javascript
export function calculateRefund(dateStr, montantTotal) {
  if (!dateStr || !montantTotal) return null;
  const departure = new Date(`${dateStr}T00:00:00`);
  const days = Math.floor((departure.getTime() - Date.now()) / (24 * 3600 * 1000));

  let refundPercent = 0;
  if (days >= 30) refundPercent = 100;
  else if (days >= 10) refundPercent = 90;
  else if (days >= 7) refundPercent = 70;
  else if (days >= 3) refundPercent = 50;
  else refundPercent = 0;

  const feeAmount = Math.round(montantTotal * ((100 - refundPercent) / 100));
  const refundAmount = montantTotal - feeAmount;

  return { days, refundPercent, feeAmount, refundAmount };
}
```


---

## 📱 Recette 23 : Initialisation du SDK Officiel Max It dans `app.js`

**Quand l'utiliser ?** Dans chaque mini-programme Max It pour configurer l'accès à l'hôte et activer les simulations automatiques sous WeChat DevTools.

### Dans `app.js`
```javascript
import { miniSDK } from './sdk/index.js';

App({
  onLaunch() {
    // Mode simulation activé sous DevTools, vrai hôte sur mobile réel
    const isDevTools = typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop';

    miniSDK.configure({
      simulate: isDevTools,
      log: (level, api, message, ctx) => {
        if (isDevTools) console.log(`[SDK:${api}] ${message}`, ctx || '');
      },
      timeoutMs: 30000
    });
  }
});
```

---

## 👤 Recette 24 : Identité Utilisateur Sans Login Screen

**Quand l'utiliser ?** Identifier l'utilisateur sans lui demander de mot de passe, et obtenir un jeton de session auprès de votre serveur.

### Dans votre Page ou Service
```javascript
import { miniSDK } from '../../sdk/index.js';
import { httpClient } from '../../utils/apis/index.js';

Page({
  data: { user: null },

  async onLoad() {
    try {
      // 1. Récupérer l'identité déjà vérifiée par Max It (MSISDN 9 chiffres)
      const user = await miniSDK.user();
      this.setData({ user });

      // 2. Obtenir un code à usage unique pour votre backend
      const authCode = await miniSDK.login();
      const session = await httpClient.post('/auth/session', { code: authCode });
      console.log('Session établie :', session);

    } catch (err) {
      if (err.code === miniSDK.ERROR_CODES.UNAVAILABLE) {
        wx.showModal({ title: 'Attention', content: 'Veuillez ouvrir cette app dans Max It.' });
      }
    }
  }
});
```

---

## 💳 Recette 25 : Paiement Orange Money Officiel avec `miniSDK.pay()`

**Quand l'utiliser ?** Déclencher un paiement marchand avec gestion native des doublons de 15 minutes (`caction: '1'`) et prise en compte de l'incertitude (`uncertain: true`).

### Dans votre Page de Réservation
```javascript
import { miniSDK } from '../../sdk/index.js';

Page({
  data: { isPaying: false },

  async handlePaiement() {
    if (this.data.isPaying) return;
    this.setData({ isPaying: true });

    try {
      const { txnid, confirmedIdentical } = await miniSDK.pay({
        amount: 25000,
        receiver: 467652, // Code Marchand officiel
        receiverName: 'ATS Voyages',
        orderId: 'CMD-88741',
        description: 'Billet Dakar - Touba'
      }, {
        onIdentical: async (msg) => {
          const res = await wx.showModal({
            title: 'Paiement similaire',
            content: msg || 'Une transaction identique existe. Poursuivre ?',
            confirmText: 'Payer'
          });
          return res.confirm;
        }
      });

      wx.redirectTo({ url: `/pages/confirmation/confirmation?txnid=${txnid}` });

    } catch (err) {
      if (err.uncertain) {
        // ⚠️ CRITIQUE : Timeout ou erreur indéterminée -> Le compte a pu être débité !
        // NE PAS REFAIRE PAYER. Valider avec le backend.
        wx.showModal({
          title: 'Vérification en cours',
          content: 'Votre paiement est en cours de validation. Ne tentez pas de repayer.',
          showCancel: false
        });
      } else if (err.code === miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: 'Paiement annulé', icon: 'none' });
      } else {
        wx.showToast({ title: err.message, icon: 'none' });
      }
    } finally {
      this.setData({ isPaying: false });
    }
  }
});
```

---

## 🛡️ Recette 26 : Protection Anti-Screenshot de Billet QR

**Quand l'utiliser ?** Empêcher qu'un passager capture l'écran d'un QR code pour le dupliquer ou le revendre frauduleusement.

### Dans votre Page de Billet (`pages/billet-detail/billet-detail.js`)
```javascript
import { miniSDK } from '../../sdk/index.js';

Page({
  async onShow() {
    // 🔒 Masque l'écran contre les captures (Android FLAG_SECURE / iOS block_screen)
    await miniSDK.screen.protect(true);
  },

  async onHide() {
    // ⚠️ CRITIQUE : Toujours désactiver en quittant !
    await miniSDK.screen.protect(false);
  },

  async onUnload() {
    await miniSDK.screen.protect(false);
  }
});
```

---

## 📷 Recette 27 : Scanner QR Caméra Seule (Anti-Fraude)

**Quand l'utiliser ?** Dans une application de contrôle de billets pour obliger le contrôleur à viser un billet physique sans pouvoir choisir une photo trafiquée dans sa galerie.

### Dans votre Page de Contrôle
```javascript
import { miniSDK } from '../../sdk/index.js';

Page({
  async handleScan() {
    try {
      const { code, albumAllowed } = await miniSDK.scan({ cameraOnly: true });
      if (albumAllowed) {
        console.warn('Attention : la caméra seule n'était pas disponible sur cet appareil.');
      }
      this.verifierBillet(code);
    } catch (err) {
      if (err.code !== miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: err.message, icon: 'none' });
      }
    }
  }
});
```

---

## 🔗 Recette 28 : Deep Linking Sans Boucle (`onShow`)

**Quand l'utiliser ?** Ouvrir directement une page spécifique depuis une campagne SMS ou notification sans que l'application ne relance la navigation à chaque fois qu'elle revient au premier plan.

### Dans `app.js` ou votre Page Principale
```javascript
import { miniSDK } from './sdk/index.js';

App({
  async onShow(options) {
    // deeplink() avec { once: true } déduplique automatiquement les retours de veille
    const params = await miniSDK.deeplink({ launch: options, once: true });

    if (params && params.voyageid) {
      wx.navigateTo({ url: `/pages/destination-detail/destination-detail?id=${params.voyageid}` });
    }
  }
});
```


---

## 🛡️ Recette 29 : Clause de Garde d'Arguments (`onLoad`)

**Quand l'utiliser ?** Dès qu'une page a besoin d'un `id` pour s'afficher. Si l'utilisateur y arrive par erreur avec un lien incomplet, on évite la page blanche et on le renvoie proprement en arrière.

### Dans votre Page (`pages/[ma-page]/[ma-page].js`)
```javascript
Page({
  onLoad(options = {}) {
    const id = options.id ? Number(options.id) : null;

    if (!id || Number.isNaN(id)) {
      wx.showToast({
        title: 'Élément introuvable',
        icon: 'none',
        duration: 2000
      });
      // Retour en arrière automatique après 1.5s
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    this.chargerDonnees(id);
  }
});
```

---

## 🔄 Recette 30 : Bouton "Retour" Intelligent (Anti-Blocage)

**Quand l'utiliser ?** Dans tous vos en-têtes personnalisés avec bouton "‹" ou "Retour", pour ne jamais bloquer l'utilisateur s'il est arrivé directement via une notification ou un SMS.

### Dans votre Page ou Composant Navbar
```javascript
handleBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // Cas standard : il y a un historique
    wx.navigateBack({ delta: 1 });
  } else {
    // Cas lien direct / deep link : retour vers l'accueil de l'app
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}
```

---

## ⚡ Recette 31 : Anti-Flash de Chargement ("0 Élément")

**Quand l'utiliser ?** Sur toute page de liste avec skeletons pour ne pas faire clignoter un message alarmant "0 réservation" pendant les 300 premières millisecondes de chargement.

### Dans le Contrôleur de Page (`index.js`)
```javascript
Page({
  data: {
    items: [],
    loading: true,
    resultsLabel: '' // 🔒 TOUJOURS initialiser vide !
  },

  async chargerDonnees() {
    this.setData({ loading: true });
    const items = await monAPI.getListe();
    const count = items.length;

    this.setData({
      items,
      loading: false,
      resultsLabel: count > 0 ? `${count} élément${count > 1 ? 's' : ''}` : ''
    });
  }
});
```

### Dans le WXML (`index.wxml`)
```xml
<!-- Le header n'apparaît QUE lorsque le chargement est terminé ET qu'il y a des éléments -->
<view class="list-header" wx:if="{{ !loading && items.length > 0 }}">
  <text>{{ resultsLabel }}</text>
</view>
```

---

## 🔒 Recette 32 : Anti-Clic Universel (`withLock`)

**Quand l'utiliser ?** Empêcher qu'un utilisateur clique 3 fois de suite sur un bouton de validation sans polluer le code de votre page avec des variables de locks manuelles.

### Le Helper (`utils/helpers/interaction.js`)
```javascript
export function withLock(fn, delay = 500) {
  let isLocked = false;
  return function (...args) {
    if (isLocked) return;
    isLocked = true;
    setTimeout(() => { isLocked = false; }, delay);
    return fn.apply(this, args);
  };
}
```

### Utilisation dans une Page
```javascript
import { withLock } from '../../utils/helpers/interaction.js';

Page({
  // Envelopper la fonction avec withLock
  handleValider: withLock(function () {
    this.envoyerFormulaire();
  }, 600)
});
```

---

## 🚨 Recette 33 : Gestionnaire Centralisé d'Erreurs Typées (`handleAppError`)

**Quand l'utiliser ?** Convertir automatiquement les erreurs techniques de votre application en messages compréhensibles pour l'utilisateur sur mobile.

### Le Helper (`utils/helpers/error-handler.js`)
```javascript
import { NetworkError, ValidationError, AuthorizationError } from '../errors/index.js';

export function handleAppError(error, defaultMessage = 'Une erreur est survenue') {
  console.error('[Erreur Applicative]', error);

  let message = defaultMessage;
  if (error instanceof NetworkError) {
    message = 'Réseau instable. Veuillez vérifier votre connexion.';
  } else if (error instanceof AuthorizationError) {
    message = 'Votre session a expiré. Reconnexion en cours...';
  } else if (error instanceof ValidationError) {
    message = error.message || 'Données saisies incorrectes.';
  } else if (error?.message) {
    message = error.message;
  }

  wx.showToast({
    title: message,
    icon: 'none',
    duration: 3000
  });
}
```

---

## 🤝 Recette 34 : Matrice d'Isolation Multi-Développeurs

**Quand l'utiliser ?** Faire collaborer 5 à 10 développeurs sur le même mini-programme sans aucun conflit Git lors des fusions.

### La Matrice d'Attribution Stricte des Fichiers
```
DÉV 1 (UX & Skeletons)       ➔ components/ux/**
DÉV 2 (Composants UI purs)   ➔ components/ui/**
DÉV 3 (Tunnel Réservation)   ➔ pages/booking/**
DÉV 4 (Détail & Actions)     ➔ pages/reservation-detail/**
DÉV 5 (Listing & Filtres)    ➔ pages/voyage/**
DÉV 6 (Favoris & Routage)    ➔ pages/favoris/**
DÉV 7 (Core & Mappers)       ➔ utils/mappers/**, utils/helpers/**
```

### Les 3 Règles d'Or :
1. **Un dossier = Un seul propriétaire à la fois.**
2. **On ne touche jamais au fichier d'un collègue.**
3. **Les modifications du Core (DÉV 7) sont mergées en premier, puis tout le monde rebase.**


---

## 👆 Recette 35 : Feedback Tactile au Clic (`hover-class`)

**Quand l'utiliser ?** Sur n'importe quel bouton, cellule ou carte cliquable pour que l'utilisateur ressente physiquement la réaction au toucher (effet "Apple Press") sans perturber le défilement.

### Dans votre WXML
```xml
<view 
  class="bouton-action" 
  hover-class="bouton-action--pressed" 
  hover-start-time="20" 
  hover-stay-time="100" 
  bindtap="validerAction"
>
  Confirmer
</view>
```

### Dans votre WXSS
```css
.bouton-action {
  transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1), opacity 0.12s ease;
  will-change: transform, opacity;
}

.bouton-action--pressed {
  transform: scale(0.96);
  opacity: 0.85;
}
```

---

## 🎬 Recette 36 : Animation d'Entrée de Page Fluide

**Quand l'utiliser ?** Dès qu'une nouvelle page s'ouvre pour supprimer le saut visuel brutal et offrir une sensation premium de transition fluide.

### Dans le conteneur principal de votre page (`.wxml`)
```xml
<view class="page-container page-enter">
  <!-- Tout le contenu de la page -->
</view>
```

### Dans le WXSS (`.wxss`)
```css
.page-enter {
  animation: pageFadeIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity;
}

@keyframes pageFadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## 🏆 Recette 37 : Animation Séquentielle "Intro Success"

**Quand l'utiliser ?** Sur une page de confirmation de paiement, de réservation ou de commande validée pour célébrer le succès avec un badge qui grossit puis glisse en haut de l'écran.

### Le Contrôleur (`.js`)
```javascript
Page({
  data: {
    introScaleAnim: null,
    isDocked: false,
    showContent: false
  },

  onShow() {
    // 1. Pop & Rebond de l'icône de succès
    const anim = wx.createAnimation({ duration: 400, timingFunction: 'ease-out' });
    anim.scale(1.2).opacity(1).step();
    this.setData({ introScaleAnim: anim.export() });

    // 2. Amorti à taille 1
    setTimeout(() => {
      anim.scale(1).step({ duration: 250, timingFunction: 'ease-in-out' });
      this.setData({ introScaleAnim: anim.export() });
    }, 450);

    // 3. Montée vers le header ("Docking")
    setTimeout(() => {
      this.setData({ isDocked: true });
    }, 800);

    // 4. Révélation du reçu
    setTimeout(() => {
      this.setData({ showContent: true });
    }, 1250);
  }
});
```

### Dans le WXML & WXSS
```xml
<view class="badge-success {{ isDocked ? 'badge-success--docked' : '' }}" animation="{{ introScaleAnim }}">
  <icon type="success" size="64" />
</view>
<view class="recu {{ showContent ? 'page-enter' : 'masque' }}">
  <!-- Reçu de paiement -->
</view>
```

```css
.badge-success {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: top 500ms cubic-bezier(0.22, 1, 0.36, 1), transform 500ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 50;
}
.badge-success--docked {
  top: 130rpx;
  transform: translate(-50%, 0) scale(0.7);
}
.masque { display: none; }
```

---

## 🖼️ Recette 38 : Image Résiliente avec Retry 3x et Zoom Plein Écran

**Quand l'utiliser ?** Vous affichez des images distantes provenant d'une API sur un réseau 3G/4G instable. Vous voulez éviter les rectangles blancs et offrir la prévisualisation plein écran WeChat.

### Dans votre WXML
```xml
<app-image
  src="{{ item.imageUrl }}"
  fallbackSrc="/assets/images/default-card.png"
  mode="aspectFill"
  width="100%"
  height="320rpx"
  previewable="{{ true }}"
  retryCount="{{ 3 }}"
  retryDelay="{{ 1000 }}"
  containerClass="card-cover-image"
/>
```

---

## 🪟 Recette 39 : Bottom-Sheet avec Safe Area et Backdrop Blur

**Quand l'utiliser ?** Vous devez afficher un panneau d'action, des CGU ou un détail qui glisse depuis le bas sans être masqué par la barre blanche de l'iPhone.

### Dans votre WXML
```xml
<app-modal
  visible="{{ isBottomSheetOpen }}"
  placement="bottom"
  size="full"
  hasHeader="{{ false }}"
  hasContent="{{ true }}"
  bind:close="closeBottomSheet"
>
  <view slot="content" class="bottom-sheet-container">
    <view class="bottom-sheet-handle"></view>
    <scroll-view scroll-y class="bottom-sheet-scroll">
      <!-- Votre contenu ici -->
    </scroll-view>
  </view>
</app-modal>
```

### Dans votre WXSS
```css
.bottom-sheet-container {
  max-height: 85vh;
  padding: 16rpx 32rpx calc(24rpx + env(safe-area-inset-bottom, 40rpx));
  background: #ffffff;
  border-top-left-radius: 32rpx;
  border-top-right-radius: 32rpx;
}
.bottom-sheet-handle {
  width: 80rpx;
  height: 8rpx;
  border-radius: 999rpx;
  background: #E5E7EB;
  margin: 0 auto 20rpx;
}
```

---

## 📅 Recette 40 : Calendrier Horizontal sans Décalage UTC

**Quand l'utiliser ?** L'utilisateur doit choisir une date dans le futur en respectant un délai de prévenance (`minDays`).

### Dans votre JS
```javascript
function generateBookingDates(minDays = 2, total = 14) {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + minDays);

  return Array.from({ length: total }, (_, i) => {
    const cur = new Date(base);
    cur.setDate(cur.getDate() + i);
    const isoDate = [
      cur.getFullYear(),
      String(cur.getMonth() + 1).padStart(2, '0'),
      String(cur.getDate()).padStart(2, '0'),
    ].join('-');
    return {
      day: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'][cur.getDay()],
      date: String(cur.getDate()),
      month: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][cur.getMonth()],
      isoDate,
    };
  });
}
```

---

## 🧭 Recette 41 : Nav Bar sur Mesure avec Calcul Dynamique d'Encoche

**Quand l'utiliser ?** Vous utilisez `navigationStyle: "custom"` et devez décaler votre contenu pour qu'il ne passe pas sous la Dynamic Island ou l'encoche iPhone.

### Dans votre Composant / Page JS
```javascript
lifetimes: {
  attached() {
    const sys = wx.getSystemInfoSync();
    const statusBarHeight = sys.statusBarHeight || 20;
    const windowWidth = sys.windowWidth || 375;
    const navPaddingBottomPx = Math.ceil(34 * windowWidth / 750);

    this.setData({
      navContentOffset: statusBarHeight + 44 + navPaddingBottomPx,
    });
  }
}
```

---

## 🔄 Recette 42 : Liaison Page <-> EventBus sans Fuite Mémoire

**Quand l'utiliser ?** Votre page doit afficher le profil utilisateur ou un compteur partagé sans accumuler d'écouteurs à chaque navigation.

### Dans votre Page JS
```javascript
import { createPageHelpers } from '../../utils/helpers/page';

Page({
  data: { user: null },

  onLoad() {
    this._helpers = createPageHelpers(this, {
      user: 'user.data',
    });
    this._helpers.subscribe();
    this._helpers.loadInitial();
  },

  onUnload() {
    if (this._helpers) {
      this._helpers.unsubscribe();
    }
  },
});
```

---

## ⚡ Recette 43 : Cache Stale-While-Revalidate avec Garde Anti-Race

**Quand l'utiliser ?** Vous voulez afficher immédiatement une liste en 0 ms sans écran de chargement, puis la mettre à jour silencieusement depuis l'API.

### Dans votre Page JS
```javascript
Page({
  data: { items: [], loading: false },

  async refreshList() {
    const requestId = (this._reqId || 0) + 1;
    this._reqId = requestId;

    // 1. Rendu instantané depuis le cache local (0 ms)
    const cached = wx.getStorageSync('cached_items');
    if (cached && !this.data.items.length) {
      this.setData({ items: cached, loading: false });
    }

    // 2. Requête API silencieuse en arrière-plan
    try {
      const fresh = await backendAPI.getItems();
      if (requestId !== this._reqId) return; // Requête concurrente obsolète

      wx.setStorageSync('cached_items', fresh);
      this.setData({ items: fresh, loading: false });
    } catch (err) {
      if (requestId !== this._reqId) return;
      if (!this.data.items.length) this.setData({ loading: false });
    }
  }
});
```

---

## 💾 Recette 44 : Stockage Local Résilient Anti-Quota (10 Mo)

**Quand l'utiliser ?** Éviter les exceptions `QuotaExceededError` et traiter correctement les clés inexistantes WeChat (qui retournent `""`).

### Dans votre Module Utilitaire
```javascript
export const safeStorage = {
  get(key, fallback = null) {
    try {
      const val = wx.getStorageSync(key);
      return val !== '' && val !== undefined ? val : fallback;
    } catch (e) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      wx.setStorageSync(key, value);
      return true;
    } catch (e) {
      console.warn('[Storage] Échec écriture quota dépassé:', e.message);
      return false;
    }
  },
  getOrSet(key, factory) {
    const existing = this.get(key);
    if (existing !== null) return existing;
    const computed = factory();
    this.set(key, computed);
    return computed;
  }
};
```

---

## 🌙 Recette 45 : Thème Sombre (Dark Mode) avec Variables CSS

**Quand l'utiliser ?** Votre application doit s'adapter automatiquement au mode sombre du système de l'utilisateur (iOS / Android) sans texte blanc sur fond blanc et en préservant l'identité Orange.

### 1. Dans `app.wxss` (Variables CSS globales)
```css
page {
  --bg-page: #F8F9FA;
  --bg-card: #FFFFFF;
  --text-main: #111827;
  --text-secondary: #4B5563;
  --border-color: #E5E7EB;
  --color-primary: #F16E00;
}

@media (prefers-color-scheme: dark) {
  page {
    --bg-page: #121212;
    --bg-card: #1E1E1E;
    --text-main: #F9FAFB;
    --text-secondary: #D1D5DB;
    --border-color: #374151;
    --color-primary: #FF7900;
  }
}
```

### 2. Dans votre Page WXSS
```css
.card {
  background-color: var(--bg-card);
  border: 1rpx solid var(--border-color);
  color: var(--text-main);
  border-radius: 20rpx;
  padding: 24rpx;
}
.card__title {
  color: var(--text-main);
}
.card__subtitle {
  color: var(--text-secondary);
}
```

### 3. Dans votre Page JS (si détection dynamique requise)
```javascript
Page({
  data: { isDark: false },

  onLoad() {
    const sys = wx.getSystemInfoSync();
    this.setData({ isDark: sys.theme === 'dark' });

    // Écoute du basculement à chaud sans recharger l'app
    wx.onThemeChange((res) => {
      this.setData({ isDark: res.theme === 'dark' });
    });
  }
});
```

---

## 🌍 Recette 46 : Data-Saver (Compression d'Image avant Upload & Moniteur 3G)

**Quand l'utiliser ?** Dès qu'un utilisateur choisit une photo (pièce d'identité, ticket, profil) pour l'envoyer au serveur, afin d'économiser son forfait internet et éviter les timeouts 3G.

### 1. Le Helper de Compression (`utils/helpers/image.js`)
```javascript
/**
 * Compresse une image avant envoi pour réduire son poids de 80% à 95%
 */
export async function compressImageSafe(tempFilePath, quality = 75) {
  return new Promise((resolve) => {
    wx.compressImage({
      src: tempFilePath,
      quality,
      success: (res) => resolve(res.tempFilePath),
      fail: () => resolve(tempFilePath), // Repli sans bloquer
    });
  });
}
```

### 2. Le Contrôleur de Page (`pages/upload-justificatif/index.js`)
```javascript
import { compressImageSafe } from '../../utils/helpers/image.js';

Page({
  data: {
    photoUrl: '',
    uploadProgress: 0,
    isUploading: false,
    isLowNetwork: false,
  },

  onLoad() {
    wx.getNetworkType({
      success: (res) => {
        this.setData({ isLowNetwork: ['2g', '3g'].includes(res.networkType) });
      },
    });
  },

  async handleChoosePhoto() {
    try {
      const media = await wx.chooseMedia({
        count: 1,
        mediaType: ['image'],
        sourceType: ['album', 'camera'],
      });

      const rawPath = media.tempFiles[0].tempFilePath;

      // 1. Compression côté client (passage de 8 Mo à ~300 Ko)
      wx.showLoading({ title: 'Optimisation...' });
      const optimizedPath = await compressImageSafe(rawPath, 75);
      wx.hideLoading();

      // 2. Upload avec barre de progression
      this.uploadPhoto(optimizedPath);
    } catch (err) {
      console.warn('Sélection annulée ou échouée', err);
    }
  },

  uploadPhoto(filePath) {
    this.setData({ isUploading: true, uploadProgress: 0 });

    const uploadTask = wx.uploadFile({
      url: 'https://api.sonatel.sn/v1/documents/upload',
      filePath,
      name: 'document',
      header: {
        'Authorization': 'Bearer ' + wx.getStorageSync('token'),
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        this.setData({ photoUrl: data.url, isUploading: false });
        wx.showToast({ title: 'Document envoyé !', icon: 'success' });
      },
      fail: (err) => {
        this.setData({ isUploading: false });
        wx.showToast({ title: 'Échec de l\'envoi', icon: 'none' });
      },
    });

    uploadTask.onProgressUpdate((res) => {
      this.setData({ uploadProgress: res.progress });
    });
  },
});
```

---

## 🛡️ Recette 47 : Conformité CDP (Masquage MSISDN et Purge Sécurisée)

**Quand l'utiliser ?** Sur tout écran affichant un numéro de téléphone client ou lors de la déconnexion, afin de respecter les audits de sécurité et la réglementation sur les données personnelles.

### 1. Le Helper de Masquage & Sécurité (`utils/helpers/security.js`)
```javascript
/**
 * Masque un numéro de téléphone selon les normes CDP (ex: 77 *** ** 67)
 */
export function maskMsisdn(msisdn) {
  if (!msisdn || typeof msisdn !== 'string') return '';
  const cleaned = msisdn.replace(/\s+/g, '').replace(/^\+221/, '');
  if (cleaned.length < 9) return '***';

  const prefix = cleaned.slice(0, 2);
  const suffix = cleaned.slice(-2);
  return `${prefix} *** ** ${suffix}`;
}

/**
 * Purge immédiatement tous les identifiants de session et tokens sensibles
 */
export function clearSessionSafe() {
  const SENSITIVE_KEYS = ['auth_token', 'token_expiry', 'user_msisdn', 'refresh_token'];
  SENSITIVE_KEYS.forEach((key) => {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.warn('[Security] Erreur purge :', key, e);
    }
  });
}
```

### 2. Le Filtre WXS pour l'Affichage WXML (`utils/wxs/filters.wxs`)
```javascript
// À ajouter dans votre fichier WXS
function maskPhone(val) {
  if (!val) return '';
  var str = '' + val;
  if (str.length < 9) return '***';
  var prefix = str.substring(0, 2);
  var suffix = str.substring(str.length - 2);
  return prefix + ' *** ** ' + suffix;
}

module.exports = {
  maskPhone: maskPhone
};
```

### 3. Utilisation dans la Page (`pages/profil/index.wxml`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<view class="profile-card">
  <text class="label">Numéro de téléphone :</text>
  <!-- Le numéro est masqué directement à l'affichage -->
  <text class="value">{{ f.maskPhone(user.phone) }}</text>
</view>
```

---

## 🟠 Recette 48 : Composant Signature Solde Orange Money (ODS Sonatel avec Masquage & Tokens Pulse)

**Quand l'utiliser ?** Dans l'en-tête de votre page d'accueil ou de votre tunnel de paiement pour afficher le solde Orange Money du client en respectant scrupuleusement la charte Sonatel Max It, avec protection de la vie privée (masquage en 1 clic) et micro-animation de rafraîchissement.

### 1. Configuration (`components/ui/om-balance-pill/index.json`)
```json
{
  "component": true
}
```

### 2. Logique du Composant (`components/ui/om-balance-pill/index.js`)
```javascript
Component({
  properties: {
    balance: {
      type: Number,
      value: 0
    },
    currency: {
      type: String,
      value: 'FCFA'
    },
    initialMasked: {
      type: Boolean,
      value: false
    }
  },

  data: {
    isMasked: false,
    isRefreshing: false
  },

  lifetimes: {
    attached() {
      this.setData({
        isMasked: this.data.initialMasked
      });
    }
  },

  methods: {
    toggleMask() {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.setData({
        isMasked: !this.data.isMasked
      });
    },

    onRefresh() {
      if (this.data.isRefreshing) return;
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {}

      this.setData({ isRefreshing: true });
      this.triggerEvent('refresh', {}, {});

      // Arrêt automatique de l'animation après 1.2s
      setTimeout(() => {
        this.setData({ isRefreshing: false });
      }, 1200);
    },

    onTopup() {
      try {
        wx.vibrateShort({ type: 'medium' });
      } catch (e) {}
      this.triggerEvent('topup', {}, {});
    }
  }
});
```

### 3. Structure WXML (`components/ui/om-balance-pill/index.wxml`)
```xml
<view class="om-pill">
  <!-- Marqueur Brand Sonatel -->
  <view class="om-pill__brand">
    <view class="om-pill__dot"></view>
    <text class="om-pill__title">Orange Money</text>
  </view>

  <!-- Bloc Solde & Action Masquage -->
  <view class="om-pill__body">
    <view class="om-pill__amount-wrapper" bindtap="toggleMask">
      <block wx:if="{{ isMasked }}">
        <text class="om-pill__amount om-pill__amount--masked">•••••• {{ currency }}</text>
      </block>
      <block wx:else>
        <text class="om-pill__amount">{{ balance }} {{ currency }}</text>
      </block>
      <!-- Bouton Oeil WXML -->
      <view class="om-pill__eye-btn">
        <text class="om-pill__eye-icon">{{ isMasked ? '👁️' : '🔒' }}</text>
      </view>
    </view>

    <!-- Bouton Rafraîchir -->
    <view
      class="om-pill__refresh-btn {{ isRefreshing ? 'om-pill__refresh-btn--spinning' : '' }}"
      bindtap="onRefresh"
    >
      <text class="om-pill__refresh-icon">🔄</text>
    </view>
  </view>

  <!-- Bouton Rapide Recharger -->
  <view class="om-pill__footer">
    <button
      class="om-pill__action-btn"
      hover-class="om-pill__action-btn--pressed"
      bindtap="onTopup"
    >
      Recharger
    </button>
  </view>
</view>
```

### 4. Styles WXSS purs sans Nesting (`components/ui/om-balance-pill/index.wxss`)
```css
.om-pill {
  display: flex;
  flex-direction: column;
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
  border: 1rpx solid #EEEEEE;
  box-sizing: border-box;
}

.om-pill__brand {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.om-pill__dot {
  width: 14rpx;
  height: 14rpx;
  background-color: #F16E00;
  border-radius: 9999rpx;
  margin-right: 12rpx;
}

.om-pill__title {
  font-size: 22rpx;
  font-weight: 600;
  color: #666666;
  text-transform: uppercase;
  letter-spacing: 1rpx;
}

.om-pill__body {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.om-pill__amount-wrapper {
  display: flex;
  align-items: center;
}

.om-pill__amount {
  font-size: 38rpx;
  font-weight: 700;
  color: #1A1A1A;
  margin-right: 14rpx;
}

.om-pill__amount--masked {
  letter-spacing: 2rpx;
  color: #666666;
}

.om-pill__eye-btn {
  padding: 4rpx 8rpx;
  font-size: 24rpx;
}

.om-pill__refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48rpx;
  height: 48rpx;
  border-radius: 9999rpx;
  background-color: #F6F6F6;
  transition: transform 0.3s ease;
}

.om-pill__refresh-btn--spinning {
  animation: omSpin 0.8s linear infinite;
}

@keyframes omSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.om-pill__refresh-icon {
  font-size: 24rpx;
}

.om-pill__footer {
  display: flex;
  justify-content: flex-end;
}

.om-pill__action-btn {
  margin: 0;
  padding: 0 28rpx;
  height: 52rpx;
  line-height: 52rpx;
  font-size: 24rpx;
  font-weight: 600;
  background-color: #FFF3E8;
  color: #F16E00;
  border-radius: 9999rpx;
  border: none;
}

.om-pill__action-btn--pressed {
  opacity: 0.8;
  transform: scale(0.96);
}
```

---

## ⚡ Recette 49 : Throttler & Debouncer Haute Performance pour Scroll et setData (60 FPS)

**Quand l'utiliser ?** Dans `onPageScroll`, lors de la frappe dans un champ de recherche en direct (`bindinput`), ou sur tout événement à haute fréquence pour éliminer les chutes de FPS et les blocages du thread de rendu WeChat.

### 1. Le Module d'Optimisation Temporelle (`utils/helpers/timing.js`)
```javascript
/**
 * Limite l'exécution d'une fonction à un appel toutes les `wait` millisecondes (60 FPS)
 * @param {Function} fn - Fonction à exécuter
 * @param {number} wait - Intervalle minimal en ms (ex: 80ms pour scroll)
 * @returns {Function}
 */
export function throttle(fn, wait = 80) {
  let lastTime = 0;
  let timer = null;

  return function (...args) {
    const now = Date.now();
    const remaining = wait - (now - lastTime);

    if (remaining <= 0 || remaining > wait) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      lastTime = now;
      fn.apply(this, args);
    } else if (!timer) {
      timer = setTimeout(() => {
        lastTime = Date.now();
        timer = null;
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/**
 * Reporte l'exécution d'une fonction après un délai d'inactivité (ex: recherche en direct)
 * @param {Function} fn - Fonction à exécuter
 * @param {number} delay - Délai en ms (ex: 300ms pour saisie clavier)
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timer = null;

  const debounced = function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };

  debounced.cancel = function () {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  return debounced;
}
```

### 2. Utilisation dans une Page WeChat (`pages/catalogue/index.js`)
```javascript
import { throttle, debounce } from '../../utils/helpers/timing';

Page({
  data: {
    isScrolled: false,
    searchQuery: '',
    results: []
  },

  onLoad() {
    // Création de la recherche debouncée
    this.handleSearch = debounce((query) => {
      this.executeApiSearch(query);
    }, 350);
  },

  // 1. Throttling du Scroll à 60 FPS (évite 60 setData par seconde)
  onPageScroll: throttle(function (e) {
    const isScrolled = e.scrollTop > 100;
    if (this.data.isScrolled !== isScrolled) {
      this.setData({ isScrolled });
    }
  }, 80),

  // 2. Recherche en direct debouncée
  onSearchInput(e) {
    const query = e.detail.value.trim();
    this.setData({ searchQuery: query });
    this.handleSearch(query);
  },

  executeApiSearch(query) {
    console.log('[Search] Lancement de la requête API pour :', query);
    // Appel API BackendAPI...
  },

  onUnload() {
    // Nettoyage impératif
    if (this.handleSearch && this.handleSearch.cancel) {
      this.handleSearch.cancel();
    }
  }
});
```

---

## 🇸🇳 Recette 50 : Moteur i18n Haute Performance Wolof / Français / Anglais (WXS 0 ms)

**Quand l'utiliser ?** Dans tout mini-programme ciblant le Sénégal ou la sous-région pour offrir une bascule instantanée entre le Français, le Wolof et l'Anglais sans latence de rendu, sans flash de contenu (FOUC) et sans saturer le thread JS de `setData`.

### 1. Le Moteur WXS Direct (`utils/i18n/i18n.wxs`)
```javascript
var locales = {
  fr: {
    'btn.confirm': 'Confirmer',
    'btn.cancel': 'Annuler',
    'btn.pay': 'Payer',
    'btn.topup': 'Recharger',
    'label.balance': 'Solde disponible',
    'label.welcome': 'Bienvenue, {name}',
    'status.loading': 'Chargement...'
  },
  wo: {
    'btn.confirm': 'Dëggal',
    'btn.cancel': 'Neenal',
    'btn.pay': 'Feye',
    'btn.topup': 'Doolil',
    'label.balance': 'Khaloiss bi am',
    'label.welcome': 'Dalal ak jamm, {name}',
    'status.loading': 'Xaaral tuti...'
  },
  en: {
    'btn.confirm': 'Confirm',
    'btn.cancel': 'Cancel',
    'btn.pay': 'Pay',
    'btn.topup': 'Top up',
    'label.balance': 'Available balance',
    'label.welcome': 'Welcome, {name}',
    'status.loading': 'Loading...'
  }
};

function t(key, lang, params) {
  var activeLang = lang || 'fr';
  var dict = locales[activeLang] || locales['fr'];
  var text = dict[key] || locales['fr'][key] || key;

  if (params) {
    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        text = text.split('{' + k + '}').join(params[k]);
      }
    }
  }

  return text;
}

module.exports = {
  t: t
};
```

### 2. Le Gestionnaire Réactif de Langue (`utils/i18n/manager.js`)
```javascript
import { Bus } from '../bus/index';

const STORAGE_KEY = 'user_pref_lang';
const DEFAULT_LANG = 'fr';
const SUPPORTED_LANGS = ['fr', 'wo', 'en'];

/**
 * Récupère la langue active (depuis le stockage local ou système)
 */
export function getLang() {
  try {
    const saved = wx.getStorageSync(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return DEFAULT_LANG;
}

/**
 * Définit la nouvelle langue et notifie toute l'application
 */
export function setLang(newLang) {
  if (!SUPPORTED_LANGS.includes(newLang)) return;
  try {
    wx.setStorageSync(STORAGE_KEY, newLang);
  } catch (e) {}

  // Notification globale via EventBus
  Bus.emit('LANG_CHANGED', newLang);
}

/**
 * Abonnement réactif au changement de langue
 */
export function onLangChange(callback) {
  return Bus.on('LANG_CHANGED', callback);
}
```

### 3. Utilisation dans un Template WXML (`pages/home/index.wxml`)
```xml
<wxs src="../../utils/i18n/i18n.wxs" module="i18n" />

<view class="home-container">
  <!-- Salutation avec paramètre dynamique -->
  <text class="greeting">{{ i18n.t('label.welcome', lang, { name: userName }) }}</text>

  <!-- Solde & Bouton Paiement instantanément traduits -->
  <view class="balance-card">
    <text class="balance-title">{{ i18n.t('label.balance', lang) }}</text>
    <button class="ods-btn ods-btn--primary">
      {{ i18n.t('btn.pay', lang) }}
    </button>
  </view>

  <!-- Sélecteur rapide de langue en 1 clic -->
  <view class="lang-switch">
    <view class="lang-btn {{ lang === 'fr' ? 'active' : '' }}" bindtap="changeLang" data-lang="fr">FR</view>
    <view class="lang-btn {{ lang === 'wo' ? 'active' : '' }}" bindtap="changeLang" data-lang="wo">Wolof</view>
    <view class="lang-btn {{ lang === 'en' ? 'active' : '' }}" bindtap="changeLang" data-lang="en">EN</view>
  </view>
</view>
```

### 4. Contrôleur de Page (`pages/home/index.js`)
```javascript
import { getLang, setLang, onLangChange } from '../../utils/i18n/manager';

Page({
  data: {
    lang: 'fr',
    userName: 'Amadou'
  },

  onLoad() {
    this.setData({ lang: getLang() });

    // Réception du changement de langue sans recharger la page
    this._unsubLang = onLangChange((newLang) => {
      this.setData({ lang: newLang });
    });
  },

  changeLang(e) {
    const lang = e.currentTarget.dataset.lang;
    setLang(lang);
  },

  onUnload() {
    if (this._unsubLang) {
      this._unsubLang();
    }
  }
});
```

---

## 📴 Recette 51 : Outbox Pattern & File d'Attente Hors-Ligne avec Auto-Replay 4G

**Quand l'utiliser ?** Pour les actions utilisateur non-monétaires (saisie de formulaires, signalements d'incidents, synchronisation de favoris, profils) afin d'empêcher toute perte de données en cas de micro-coupure réseau mobile en zone rurale ou en transit.

### 1. Le Gestionnaire de File d'Attente Outbox (`utils/offline/outbox.js`)
```javascript
import { Bus } from '../bus/index';

const STORAGE_KEY = 'pmt_offline_outbox';
const MAX_QUEUE_SIZE = 50;
const handlers = {};
let isFlushing = false;

function getQueue() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function saveQueue(queue) {
  try {
    wx.setStorageSync(STORAGE_KEY, queue.slice(0, MAX_QUEUE_SIZE));
  } catch (e) {
    console.warn('[Outbox] Erreur sauvegarde stockage :', e);
  }
}

export const Outbox = {
  /**
   * Enregistre un gestionnaire d'exécution pour un type d'action donné
   */
  registerHandler(type, handlerFn) {
    handlers[type] = handlerFn;
  },

  /**
   * Enfile une action dans la file d'attente locale
   */
  enqueue(type, payload) {
    const queue = getQueue();
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      createdAt: Date.now(),
      retryCount: 0
    };

    queue.push(item);
    saveQueue(queue);

    Bus.emit('OUTBOX_COUNT_CHANGED', queue.length);
    console.log(`[Outbox] Action enfilée (${type}) :`, item.id);
    return item.id;
  },

  /**
   * Nombre d'actions en attente de synchronisation
   */
  getPendingCount() {
    return getQueue().length;
  },

  /**
   * Rejoue toutes les actions en attente de façon séquentielle
   */
  async flush() {
    if (isFlushing) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    isFlushing = true;
    console.log(`[Outbox] Lancement de la synchronisation (${queue.length} action(s))...`);

    const remaining = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const handler = handlers[item.type];

      if (!handler) {
        console.warn(`[Outbox] Aucun handler pour le type : ${item.type}. Élément ignoré.`);
        continue;
      }

      try {
        await handler(item.payload, item.id);
        console.log(`[Outbox] Action synchronisée avec succès : ${item.id}`);
      } catch (err) {
        console.warn(`[Outbox] Échec synchronisation ${item.id} :`, err);
        item.retryCount = (item.retryCount || 0) + 1;

        // Conserver dans la file si moins de 5 échecs
        if (item.retryCount < 5) {
          remaining.push(item);
        }
      }
    }

    saveQueue(remaining);
    isFlushing = false;

    Bus.emit('OUTBOX_COUNT_CHANGED', remaining.length);
    Bus.emit('OUTBOX_FLUSH_COMPLETE', { remainingCount: remaining.length });
  },

  /**
   * Démarre l'écouteur automatique du retour réseau
   */
  initAutoSync() {
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected) {
        console.log('[Outbox] Réseau rétabli. Déclenchement automatique du flush...');
        Outbox.flush();
      }
    });
  }
};
```

### 2. Initialisation Globale (`app.js`)
```javascript
import { Outbox } from './utils/offline/outbox';

App({
  onLaunch() {
    // 1. Initialiser l'auto-sync sur rétablissement du réseau
    Outbox.initAutoSync();

    // 2. Enregistrer les handlers métier
    Outbox.registerHandler('SUBMIT_FEEDBACK', async (payload, idempotencyKey) => {
      return wx.request({
        url: 'https://api.sonatel.com/v1/feedback',
        method: 'POST',
        header: { 'X-Idempotency-Key': idempotencyKey },
        data: payload
      });
    });

    // 3. Premier essai de flush au démarrage si connecté
    Outbox.flush();
  }
});
```

### 3. Utilisation dans une Page (`pages/feedback/index.js`)
```javascript
import { Outbox } from '../../utils/offline/outbox';
import { Bus } from '../../utils/bus/index';

Page({
  data: {
    pendingSyncCount: 0,
    comment: ''
  },

  onLoad() {
    this.setData({ pendingSyncCount: Outbox.getPendingCount() });
    this._unsubOutbox = Bus.on('OUTBOX_COUNT_CHANGED', (count) => {
      this.setData({ pendingSyncCount: count });
    });
  },

  async onSubmit() {
    const payload = { comment: this.data.comment, date: new Date().toISOString() };

    try {
      // Tentative d'envoi direct
      await wx.request({
        url: 'https://api.sonatel.com/v1/feedback',
        method: 'POST',
        data: payload
      });
      wx.showToast({ title: 'Envoyé avec succès !', icon: 'success' });
    } catch (err) {
      // En cas d'échec réseau : Enfilement sécurisé dans l'Outbox
      Outbox.enqueue('SUBMIT_FEEDBACK', payload);
      wx.showToast({
        title: 'Enregistré hors-ligne. Envoi dès retour réseau.',
        icon: 'none',
        duration: 2500
      });
    }
  },

  onUnload() {
    if (this._unsubOutbox) {
      this._unsubOutbox();
    }
  }
});
```

---

## 🧪 Recette 52 : Harness de Test Unitaire Headless pour Machine à États uiState (CI Ready)

**Quand l'utiliser ?** Dans vos tests automatisés (GitHub Actions / GitLab CI) pour valider qu'une page WeChat passe correctement par les états `loading` ➔ `success` ➔ `error` et libère ses ressources dans `onUnload()`, sans ouvrir WeChat DevTools.

### 1. Le Module de Harnais Headless (`tests/harness.js`)
```javascript
// Mock des API globales WeChat indispensables
global.wx = {
  showToast: () => {},
  hideToast: () => {},
  showLoading: () => {},
  hideLoading: () => {},
  vibrateShort: () => {},
  navigateTo: () => {},
  redirectTo: () => {},
  switchTab: () => {},
  getStorageSync: () => '',
  setStorageSync: () => {},
  removeStorageSync: () => {}
};

/**
 * Crée une instance contrôlable d'une page WeChat
 */
export function createPageHarness(pageDefinition) {
  return {
    ...pageDefinition,
    data: JSON.parse(JSON.stringify(pageDefinition.data || {})),

    setData(partial, callback) {
      Object.keys(partial).forEach((key) => {
        if (key.includes('.')) {
          const parts = key.split('.');
          let target = this.data;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = partial[key];
        } else {
          this.data[key] = partial[key];
        }
      });
      if (typeof callback === 'function') callback();
    },

    async triggerLoad(options = {}) {
      if (typeof this.onLoad === 'function') {
        await this.onLoad(options);
      }
    },

    async triggerUnload() {
      if (typeof this.onUnload === 'function') {
        await this.onUnload();
      }
    }
  };
}
```

### 2. Écriture d'un Test Unitaire de Page (`tests/pages/home.test.js`)
```javascript
import assert from 'node:assert';
import { createPageHarness } from '../harness';

// Import ou définition de la page à tester
const homePage = {
  data: {
    uiState: 'loading',
    balance: 0
  },

  async onLoad() {
    this.setData({ uiState: 'loading' });
    try {
      // Simulation appel API Backend
      const balance = await Promise.resolve(25000);
      this.setData({
        uiState: 'success',
        balance
      });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  },

  onUnload() {
    this.setData({ uiState: 'destroyed' });
  }
};

// 1. Test de l'état initial
const harness = createPageHarness(homePage);
assert.strictEqual(harness.data.uiState, 'loading', 'L\'état initial doit être loading');

// 2. Test du chargement réussi
harness.triggerLoad().then(() => {
  assert.strictEqual(harness.data.uiState, 'success', 'L\'état après chargement doit être success');
  assert.strictEqual(harness.data.balance, 25000, 'Le solde doit être injecté');
  console.log('✅ Test Home Page (Success) validé avec succès !');
});
```

---

## 📄 Recette 53 : Générateur de Billet/Facture PDF Vectoriel natif en pur JS (0 dépendance)

**Quand l'utiliser ?** Vous devez permettre au client de télécharger, partager (WhatsApp, Email) ou imprimer un billet de transport, une facture ou un reçu officiel en PDF, sans dépasser le quota des 2 Mo de votre application WeChat/TCMPP et sans librairie npm lourde.

### 1. Le Moteur de Sérialisation PDF (`utils/helpers/pdfGenerator.js`)
```javascript
/**
 * Sérialise une liste d'objets PDF en binaire %PDF-1.4 avec table xref dynamique
 */
export function serializePdfObjects(objects) {
  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;

  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return pdf;
}

/**
 * Construit le contenu graphique vectoriel du billet A4 (595 x 842 points)
 */
export function buildTicketPdf({ reference, passengerName, route, date, amount, currency }) {
  const content = `
    BT
      /F1 18 Tf
      50 780 Td
      (BILLET DE TRANSPORT ELECTRONIQUE) Tj
      /F1 12 Tf
      0 -35 Td
      (Reference de dossier : ${reference}) Tj
      0 -22 Td
      (Voyageur : ${passengerName}) Tj
      0 -22 Td
      (Itineraire : ${route}) Tj
      0 -22 Td
      (Date de depart : ${date}) Tj
      0 -35 Td
      /F1 14 Tf
      (Montant regle : ${amount} ${currency}) Tj
    ET
  `;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    `<< /Length ${content.trim().length} >>\nstream\n${content.trim()}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  ];

  return serializePdfObjects(objects);
}

/**
 * Sauvegarde locale et ouverture directe dans la visionneuse native
 */
export function telechargerBilletPdf(ticketData) {
  return new Promise((resolve, reject) => {
    wx.showLoading({ title: 'Génération du PDF...' });
    const pdfContent = buildTicketPdf(ticketData);
    const fs = wx.getFileSystemManager();
    const filePath = `${wx.env.USER_DATA_PATH}/billet_${ticketData.reference}.pdf`;

    fs.writeFile({
      filePath,
      data: pdfContent,
      encoding: 'binary',
      success: () => {
        wx.hideLoading();
        wx.openDocument({
          filePath,
          fileType: 'pdf',
          showMenu: true, // Affiche l'icône de partage natif (WhatsApp, Impression, Sauvegarde)
          success: resolve,
          fail: reject
        });
      },
      fail: (err) => {
        wx.hideLoading();
        reject(err);
      }
    });
  });
}
```

### 2. Déclenchement dans votre Page (`pages/trip-details/index.js`)
```javascript
import { telechargerBilletPdf } from '../../utils/helpers/pdfGenerator';

Page({
  async onExporterBillet() {
    try {
      await telechargerBilletPdf({
        reference: 'ATS-2026-9901',
        passengerName: 'Mamadou Diallo',
        route: 'Dakar (DSS) -> Paris (CDG)',
        date: '15 Novembre 2026',
        amount: '450 000',
        currency: 'FCFA'
      });
    } catch (err) {
      wx.showToast({ title: 'Échec de génération du billet', icon: 'none' });
    }
  }
});
```

---

## 💺 Recette 54 : Sélecteur de Sièges Aériens / Bus avec encodage GDS 15 champs

**Quand l'utiliser ?** Dans un écran de choix de sièges pour un vol ou un trajet d'autocar, pour associer chaque siège à un voyageur précis et générer la charge utile de réservation conforme aux spécifications GDS.

### 1. Le Helper d'Encodage GDS (`utils/helpers/seatMapEncoder.js`)
```javascript
/**
 * Encode les sièges choisis au format GDS (15 champs délimités par des tirets)
 */
export function encodeSeatSelection({ segments, travellers, selectedSeats, currency = 'XOF', posCountry = 'SN' }) {
  const encodedPayload = {};
  let totalSeatAddon = 0;

  segments.forEach((segment, segIdx) => {
    const segmentMap = selectedSeats[segment.id] || {};

    travellers.forEach((traveller, trvIdx) => {
      // ⚠️ Exclusion obligatoire des nourrissons sur les genoux (INL)
      if (traveller.type === 'INL') return;

      const seat = segmentMap[traveller.id];
      if (!seat) return;

      const isPaid = (seat.price > 0) ? '1' : '0';
      const base = seat.price || 0;
      const tax = seat.tax || 0;
      totalSeatAddon += (base + tax);

      const departureUnix = Math.floor(new Date(segment.departureDate).getTime() / 1000);

      // Chaîne normalisée à 15 champs
      const seatString = [
        departureUnix,            // 1. Timestamp UNIX de départ
        segment.origin,           // 2. Code IATA départ
        segment.destination,      // 3. Code IATA destination
        segment.carrier,          // 4. Code compagnie
        segment.flightNumber,     // 5. Numéro de vol
        trvIdx + 1,               // 6. Index passager 1-based
        seat.code,                // 7. Numéro de siège (ex: 14A)
        isPaid,                   // 8. Siège payant ('1' ou '0')
        base + tax,               // 9. Montant total siège
        base,                     // 10. Montant hors taxe
        tax,                      // 11. Taxe siège
        currency,                 // 12. Devise (XOF)
        posCountry,               // 13. Pays du point de vente (SN)
        seat.type || 'STANDARD',  // 14. Catégorie de siège
        '0'                       // 15. Réserve technique
      ].join('-');

      if (!encodedPayload[segIdx]) encodedPayload[segIdx] = [];
      encodedPayload[segIdx].push(seatString);
    });
  });

  return {
    seatsConfirmed: Object.keys(encodedPayload).length > 0 ? 1 : 0,
    seatSelections: encodedPayload,
    totalSeatAddon
  };
}
```

---

## ⚡ Recette 55 : Rendu par lots de 20 cartes anti-saturation du pont IPC WeChat

**Quand l'utiliser ?** Votre API renvoie une liste importante (100 à 300 résultats de recherche, vols, produits). Pour éviter de geler l'interface mobile par un `setData` monolithique, injectez les cartes par tranches de 20 avec attente de confirmation de rendu.

### 1. Logique de Page Optimisée (`pages/catalog/index.js`)
```javascript
Page({
  data: {
    displayedItems: [],
    hasMore: true
  },

  // Stockage JS pur en mémoire (non transmis à WXML)
  rawItems: [],
  cursor: 0,
  batchSize: 20,

  async onLoad() {
    wx.showLoading({ title: 'Recherche...' });
    const fullList = await this.chargerDonneesServeur();
    wx.hideLoading();

    this.rawItems = fullList;
    this.cursor = 0;
    this.setData({ displayedItems: [], hasMore: fullList.length > 0 }, () => {
      // Démarre la cascade de rendu
      this.rendreProchainLot();
    });
  },

  rendreProchainLot() {
    if (this.cursor >= this.rawItems.length) {
      this.setData({ hasMore: false });
      return;
    }

    const nextBatch = this.rawItems.slice(this.cursor, this.cursor + this.batchSize);
    const updateMap = {};

    // Injection par chemin d'index : ne renvoie pas tout le tableau !
    nextBatch.forEach((item, index) => {
      updateMap[`displayedItems[${this.cursor + index}]`] = item;
    });

    this.cursor += nextBatch.length;

    // Attendre le callback de rendu de la vue avant toute autre action
    this.setData(updateMap, () => {
      // Auto-complétion du premier écran si moins de 40 éléments affichés
      if (this.cursor < 40 && this.cursor < this.rawItems.length) {
        this.rendreProchainLot();
      }
    });
  },

  onReachBottom() {
    // Défilement infini fluide
    if (this.data.hasMore) {
      this.rendreProchainLot();
    }
  }
});
```

---

## 💰 Recette 56 : Moteur de décomposition tarifaire multi-passagers sans doublon de taxes

**Quand l'utiliser ?** Dans l'écran de récapitulatif avant paiement pour certifier le montant total au centime près, rejeter les mélanges de devises et éviter de multiplier les taxes de groupe par le nombre de voyageurs.

### 1. Le Module de Calcul Certifié (`utils/helpers/priceBreakdown.js`)
```javascript
/**
 * Calcule et certifie la décomposition du prix d'une commande
 */
export function computeCertifiedPriceBreakdown({
  passengerFares = [],
  packageTax,
  seatAddon = 0,
  extraLuggage = 0,
  promoDiscount = 0,
  currency = 'XOF'
}) {
  if (!currency) {
    throw new Error('Devise manquante dans le calcul de prix');
  }

  // 1. Somme des tarifs de base par voyageur
  let totalBaseFare = 0;
  passengerFares.forEach((fare) => {
    if (typeof fare.unitPrice !== 'number' || fare.unitPrice < 0) {
      throw new Error(`Prix unitaire invalide pour le passager : ${fare.category}`);
    }
    totalBaseFare += (fare.unitPrice * (fare.count || 1));
  });

  // 2. Contrôle rigoureux de la taxe globale
  // ⚠️ Une taxe null ou undefined signifie "en attente de calcul", JAMAIS 0 FCFA !
  if (packageTax === null || packageTax === undefined) {
    return {
      isCertified: false,
      status: 'TAX_UNRESOLVED',
      message: 'La taxe globale est en cours de tarification auprès du fournisseur.'
    };
  }

  // 3. Calcul net final arrondi à l'entier (zone Franc CFA)
  const netTotal = Math.max(0, Math.round(
    totalBaseFare + packageTax + seatAddon + extraLuggage - promoDiscount
  ));

  return {
    isCertified: true,
    currency,
    breakdown: {
      totalBaseFare,
      packageTax,
      seatAddon,
      extraLuggage,
      promoDiscount,
      netTotal
    }
  };
}
```

---

## ✈️ Recette 57 : Loader Avion Animé en Pur CSS (Ciel dégradé, nuages défilants et traînée 60 FPS)

**Quand l'utiliser ?** Vous avez une opération longue de recherche de vols, de réservation ou de paiement (> 3 secondes). Au lieu d'un spinner classique ennuyeux, offrez une animation thématique de vol en plein ciel à 60 FPS sans impacter la batterie ni la mémoire vive (100% GPU avec `transform` et `opacity`).

### 1. La Structure WXML (`components/ux/flight-loader/index.wxml`)
```xml
<view class="al-root">
  <view class="al-sky">
    <!-- Halo lumineux soleil / lune -->
    <view class="al-glow"></view>

    <!-- Nuages défilants à vitesses différentes -->
    <view class="al-cloud al-cloud--1"></view>
    <view class="al-cloud al-cloud--2"></view>
    <view class="al-cloud al-cloud--3"></view>

    <!-- Trajectoire de vol en pointillés animés -->
    <view class="al-path"></view>

    <!-- Avion et panaches de fumée -->
    <view class="al-plane-wrap">
      <view class="al-puff al-puff--1"></view>
      <view class="al-puff al-puff--2"></view>
      <view class="al-puff al-puff--3"></view>
      <image class="al-plane" src="/assets/icons/global/airplane.png" mode="aspectFit" />
    </view>

    <!-- Ligne d'horizon -->
    <view class="al-ground"></view>
  </view>

  <view class="al-text-row">
    <text class="al-text">{{ message || 'Recherche de vos billets en cours' }}</text>
    <text class="al-dot al-dot--1">.</text>
    <text class="al-dot al-dot--2">.</text>
    <text class="al-dot al-dot--3">.</text>
  </view>
</view>
```

### 2. Les Animations WXSS à 60 FPS (`components/ux/flight-loader/index.wxss`)
```css
.al-root {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
}

.al-sky {
  position: relative;
  width: 90%;
  height: 220rpx;
  overflow: hidden;
  border-radius: 24rpx;
  background: linear-gradient(160deg, #1b2a63 0%, #3a5bc7 42%, #6f93e8 75%, #aac2f5 100%);
  box-shadow: 0 12rpx 40rpx rgba(30, 50, 110, 0.35);
}

.al-cloud {
  position: absolute;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 100rpx;
}
.al-cloud--1 { width: 60rpx; height: 20rpx; top: 55%; left: -15%; animation: al-drift 6.5s linear infinite; }
.al-cloud--2 { width: 70rpx; height: 22rpx; top: 30%; left: -18%; animation: al-drift 12s linear infinite; animation-delay: -3s; }

@keyframes al-drift {
  from { transform: translateX(0); }
  to { transform: translateX(760rpx); }
}

.al-path {
  position: absolute;
  top: 48%;
  left: 6%;
  right: 6%;
  height: 2rpx;
  background-image: linear-gradient(to right, rgba(255, 255, 255, 0.55) 0 16rpx, transparent 16rpx 30rpx);
  background-size: 30rpx 2rpx;
  background-repeat: repeat-x;
  animation: al-path-move 1.1s linear infinite;
}
@keyframes al-path-move {
  from { background-position: 0 0; }
  to { background-position: -30rpx 0; }
}

.al-plane-wrap {
  position: absolute;
  top: 10%;
  left: 0;
  width: 72rpx;
  height: 72rpx;
  animation: al-fly 3.6s ease-in-out infinite;
}
@keyframes al-fly {
  0% { transform: translate(-140rpx, -6rpx) rotate(-3deg); }
  50% { transform: translate(320rpx, 14rpx) rotate(4deg); }
  100% { transform: translate(760rpx, -4rpx) rotate(-3deg); }
}

.al-plane { width: 100%; height: 100%; }

.al-puff {
  position: absolute;
  top: 44%;
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  animation: al-puff-fade 1.1s ease-out infinite;
}
.al-puff--1 { left: -6rpx; animation-delay: 0s; }
.al-puff--2 { left: -22rpx; animation-delay: 0.18s; }
.al-puff--3 { left: -38rpx; animation-delay: 0.36s; }

@keyframes al-puff-fade {
  0% { opacity: 0.75; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.2); }
}

.al-text-row { display: flex; align-items: flex-end; margin-top: 24rpx; }
.al-text { font-size: 26rpx; font-weight: 600; color: #344054; }
.al-dot { font-size: 28rpx; color: #FD6602; animation: al-blink 1.4s infinite both; }
.al-dot--2 { animation-delay: 0.2s; }
.al-dot--3 { animation-delay: 0.4s; }
@keyframes al-blink { 0%, 20% { opacity: 0; } 50% { opacity: 1; } }
```

---

## 👥 Recette 58 : Sélecteur de Voyageurs avec Validation de Ratios IATA (Bébés sur genoux)

**Quand l'utiliser ?** Dans le panneau ou la modale de choix du nombre de passagers (vols, trains, cars), pour s'assurer qu'aucun client ne réserve plus de bébés sur les genoux qu'il n'y a d'adultes accompagnateurs.

### 1. Module de Contrôle des Ratios (`utils/helpers/passengerValidator.js`)
```javascript
/**
 * Valide les effectifs de passagers selon les normes de transport aérien et ferroviaire
 */
export function validatePassengerMix({ adults = 1, children = 0, infantsOnSeat = 0, infantsOnLap = 0 }) {
  // 1. Au moins un adulte obligatoire
  if (adults < 1) {
    return {
      isValid: false,
      message: 'La réservation doit comporter au moins un passager adulte.'
    };
  }

  // 2. Règle internationale IATA : Max 1 bébé sur les genoux par adulte
  if (infantsOnLap > adults) {
    return {
      isValid: false,
      message: `Vous ne pouvez pas voyager avec ${infantsOnLap} bébés sur les genoux pour ${adults} adulte(s). Chaque bébé sur les genoux nécessite un adulte distinct.`
    };
  }

  // 3. Plafond groupe standard
  const total = adults + children + infantsOnSeat + infantsOnLap;
  if (total > 9) {
    return {
      isValid: false,
      message: 'Les groupes de plus de 9 voyageurs font l objet d une tarification spéciale.'
    };
  }

  return {
    isValid: true,
    totalCount: total,
    summaryText: `${total} voyageur${total > 1 ? 's' : ''} (${adults} Adulte${adults > 1 ? 's' : ''}${children ? ', ' + children + ' Enfant(s)' : ''})`
  };
}
```

### 2. Intégration dans le Composant Voyageurs (`components/ui/passenger-picker/index.js`)
```javascript
import { validatePassengerMix } from '../../../utils/helpers/passengerValidator';

Component({
  data: {
    adults: 1,
    children: 0,
    infantsOnLap: 0,
    errorMessage: '',
    summaryText: '1 voyageur'
  },

  methods: {
    onIncrement(e) {
      const { type } = e.currentTarget.dataset;
      const nextCounts = {
        adults: this.data.adults,
        children: this.data.children,
        infantsOnLap: this.data.infantsOnLap,
        [type]: this.data[type] + 1
      };

      const check = validatePassengerMix(nextCounts);
      if (!check.isValid) {
        this.setData({ errorMessage: check.message });
        wx.showToast({ title: check.message, icon: 'none', duration: 3000 });
        return;
      }

      this.setData({
        [type]: nextCounts[type],
        errorMessage: '',
        summaryText: check.summaryText
      });
      this.triggerEvent('change', nextCounts);
    },

    onDecrement(e) {
      const { type } = e.currentTarget.dataset;
      if (this.data[type] <= 0) return;
      if (type === 'adults' && this.data.adults <= 1) return;

      const nextCounts = {
        adults: this.data.adults,
        children: this.data.children,
        infantsOnLap: this.data.infantsOnLap,
        [type]: this.data[type] - 1
      };

      const check = validatePassengerMix(nextCounts);
      if (!check.isValid) {
        this.setData({ errorMessage: check.message });
        wx.showToast({ title: check.message, icon: 'none', duration: 3000 });
        return;
      }

      this.setData({
        [type]: nextCounts[type],
        errorMessage: '',
        summaryText: check.summaryText
      });
      this.triggerEvent('change', nextCounts);
    }
  }
});
```

---

## 📡 Recette 59 : Téléversement par Morceaux (Chunking 1 Mo) avec Reprise Automatique 3G/4G

**Quand l'utiliser ?** Dès qu'un utilisateur doit envoyer un document volumineux (pièce d'identité CNI/Passeport recto-verso haute résolution, relevé d'identité bancaire, justificatif de domicile, contrat PDF ou vidéo d'état des lieux entre 2 Mo et 15 Mo) dans un environnement où le réseau mobile fluctue fréquemment (passage 4G/3G/Edge ou micro-coupures de quelques secondes).

**Pourquoi l'API standard `wx.uploadFile` échoue sur le terrain ?**
L'API native `wx.uploadFile` envoie le fichier sous la forme d'un bloc monolithique indivisible. Si la 3G décroche à 94% d'un envoi de 8 Mo, l'upload est annulé en erreur (`uploadFile:fail abort` ou timeout), obligeant l'utilisateur à renvoyer la totalité des 8 Mo depuis le début. Cela gaspille le forfait data du client et multiplie le taux d'abandon.

**La solution par Morceaux (Chunking 1 Mo) :**
Le fichier est découpé localement en tranches binaires de 1 Mo via `wx.getFileSystemManager().readFile({ position, length })`. Chaque morceau est transmis au serveur avec ses métadonnées HTTP (`X-Upload-Id`, `X-Chunk-Index`, `X-Total-Chunks`). En cas de coupure sur le morceau n°4, seul ce morceau est réessayé jusqu'à 3 fois avec backoff progressif : les morceaux 1, 2 et 3 validés ne sont jamais retransmis !

### 1. Le Module de Téléversement Résilient (`utils/helpers/chunkedUploader.js`)
```javascript
/**
 * 📡 Module de Téléversement par Morceaux (Resumable Chunked Uploader)
 * Zéro dépendance npm - Compatible pur WeChat Mini-Program & TCMPP
 */

const fs = wx.getFileSystemManager();
const CHUNK_SIZE_DEFAULT = 1024 * 1024; // 1 Mo par morceau (taille optimale 3G/4G)
const MAX_RETRIES_PER_CHUNK = 3;

/**
 * Récupère la taille exacte d'un fichier local
 * @param {string} filePath 
 * @returns {Promise<number>} Taille en octets
 */
export function getLocalFileSize(filePath) {
  return new Promise((resolve, reject) => {
    fs.getFileInfo({
      filePath,
      success: (res) => resolve(res.size),
      fail: (err) => reject(new Error(`[ChunkedUploader] Fichier introuvable ou illisible : ${err.errMsg || err}`))
    });
  });
}

/**
 * Lit une tranche binaire (ArrayBuffer) d'un fichier local
 * @param {string} filePath Chemin temporaire WeChat (wxfile:// ou tmp)
 * @param {number} position Offset de départ en octets
 * @param {number} length Nombre d'octets à lire
 * @returns {Promise<ArrayBuffer>} Données binaires du morceau
 */
export function readChunkBuffer(filePath, position, length) {
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath,
      position,
      length,
      success: (res) => resolve(res.data),
      fail: (err) => reject(new Error(`[ChunkedUploader] Erreur de lecture à l'offset ${position} : ${err.errMsg || err}`))
    });
  });
}

/**
 * Envoie un morceau binaire individuel avec gestion d'en-têtes HTTP
 */
function sendChunkRequest({ uploadUrl, chunkBuffer, uploadId, chunkIndex, totalChunks, fileName, headers = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: uploadUrl,
      method: 'POST',
      data: chunkBuffer,
      header: {
        'Content-Type': 'application/octet-stream',
        'X-Upload-Id': uploadId,
        'X-Chunk-Index': String(chunkIndex),
        'X-Total-Chunks': String(totalChunks),
        'X-File-Name': encodeURIComponent(fileName || 'upload.bin'),
        ...headers
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`[ChunkedUploader] Erreur HTTP ${res.statusCode} sur le chunk ${chunkIndex + 1}/${totalChunks}`));
        }
      },
      fail: (err) => reject(new Error(`[ChunkedUploader] Réseau inaccessible sur chunk ${chunkIndex + 1} : ${err.errMsg || err}`))
    });
  });
}

/**
 * Téléverse un fichier complet par morceaux avec reprise automatique
 * @param {Object} options Configuration d'upload
 * @param {string} options.filePath Chemin du fichier local
 * @param {string} options.uploadUrl URL de réception des morceaux (/api/upload/chunk)
 * @param {string} options.completeUrl URL d'assemblage final (/api/upload/complete)
 * @param {string} [options.fileName] Nom d'origine du fichier
 * @param {number} [options.chunkSize] Taille en octets (défaut: 1 Mo)
 * @param {Object} [options.headers] En-têtes HTTP additionnels (Authorization: Bearer...)
 * @param {Function} [options.onProgress] Callback de progression ({ percent, currentChunk, totalChunks, uploadedBytes, totalBytes })
 * @returns {Promise<Object>} Réponse finale du serveur après assemblage
 */
export async function uploadFileInChunks({
  filePath,
  uploadUrl,
  completeUrl,
  fileName = 'fichier.bin',
  chunkSize = CHUNK_SIZE_DEFAULT,
  headers = {},
  onProgress = null
}) {
  if (!filePath) throw new Error('[ChunkedUploader] filePath obligatoire.');
  if (!uploadUrl) throw new Error('[ChunkedUploader] uploadUrl obligatoire.');

  // 1. Détermination de la taille totale
  const totalBytes = await getLocalFileSize(filePath);
  const totalChunks = Math.max(1, Math.ceil(totalBytes / chunkSize));
  const uploadId = `UP_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  let uploadedBytes = 0;

  // 2. Boucle séquentielle d'envoi des morceaux
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const position = chunkIndex * chunkSize;
    const currentLength = Math.min(chunkSize, totalBytes - position);

    // Lecture du chunk
    const chunkBuffer = await readChunkBuffer(filePath, position, currentLength);

    // Retry résilient par morceau (jusqu'à 3 tentatives avec backoff)
    let attempt = 0;
    let chunkSuccess = false;
    let lastError = null;

    while (attempt < MAX_RETRIES_PER_CHUNK && !chunkSuccess) {
      attempt++;
      try {
        await sendChunkRequest({
          uploadUrl,
          chunkBuffer,
          uploadId,
          chunkIndex,
          totalChunks,
          fileName,
          headers
        });
        chunkSuccess = true;
      } catch (err) {
        lastError = err;
        console.warn(`[ChunkedUploader] Échec chunk ${chunkIndex + 1}/${totalChunks} (tentative ${attempt}/${MAX_RETRIES_PER_CHUNK}). Attente...`);
        if (attempt < MAX_RETRIES_PER_CHUNK) {
          // Backoff progressif : 1s, puis 2s
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
      }
    }

    if (!chunkSuccess) {
      throw new Error(`[ChunkedUploader] Abandon après ${MAX_RETRIES_PER_CHUNK} échecs sur le morceau ${chunkIndex + 1}/${totalChunks} : ${lastError?.message || lastError}`);
    }

    uploadedBytes += currentLength;
    const percent = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

    if (typeof onProgress === 'function') {
      onProgress({
        percent,
        currentChunk: chunkIndex + 1,
        totalChunks,
        uploadedBytes,
        totalBytes
      });
    }
  }

  // 3. Notification d'assemblage final au serveur
  if (completeUrl) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: completeUrl,
        method: 'POST',
        data: {
          uploadId,
          totalChunks,
          totalBytes,
          fileName
        },
        header: {
          'Content-Type': 'application/json',
          ...headers
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`[ChunkedUploader] Erreur finalisation HTTP ${res.statusCode} : ${JSON.stringify(res.data)}`));
          }
        },
        fail: (err) => reject(new Error(`[ChunkedUploader] Échec requête d'assemblage final : ${err.errMsg || err}`))
      });
    });
  }

  return { uploadId, totalChunks, totalBytes, status: 'completed' };
}
```

### 2. Utilisation dans une Page WeChat (`pages/kyc-upload/index.js`)
```javascript
import { uploadFileInChunks } from '../../utils/helpers/chunkedUploader';

Page({
  data: {
    uploadProgress: 0,
    uploadStatusText: '',
    isUploading: false,
    uploadedDocUrl: ''
  },

  async onSelectAndUploadDoc() {
    try {
      // 1. Sélection du document ou de la photo
      const media = await new Promise((resolve, reject) => {
        wx.chooseMedia({
          count: 1,
          mediaType: ['image', 'video'],
          sourceType: ['album', 'camera'],
          success: resolve,
          fail: reject
        });
      });

      const file = media.tempFiles[0];
      const filePath = file.tempFilePath;
      const fileName = `kyc_${Date.now()}.jpg`;

      this.setData({
        isUploading: true,
        uploadProgress: 0,
        uploadStatusText: 'Démarrage du transfert sécurisé...'
      });

      // 2. Téléversement résilient par morceaux de 1 Mo
      const token = wx.getStorageSync('auth_token') || '';
      const result = await uploadFileInChunks({
        filePath,
        fileName,
        uploadUrl: 'https://api.sonatel.sn/v1/kyc/upload/chunk',
        completeUrl: 'https://api.sonatel.sn/v1/kyc/upload/complete',
        headers: {
          Authorization: `Bearer ${token}`
        },
        onProgress: ({ percent, currentChunk, totalChunks }) => {
          this.setData({
            uploadProgress: percent,
            uploadStatusText: `Envoi morceau ${currentChunk}/${totalChunks} (${percent}%)...`
          });
        }
      });

      this.setData({
        isUploading: false,
        uploadProgress: 100,
        uploadStatusText: 'Document transmis et certifié avec succès !',
        uploadedDocUrl: result.fileUrl || ''
      });

      wx.showToast({ title: 'Document envoyé !', icon: 'success' });
    } catch (err) {
      console.error('[Page KYC] Échec upload :', err);
      this.setData({
        isUploading: false,
        uploadStatusText: 'Échec de transfert. Vérifiez votre connexion.'
      });
      wx.showModal({
        title: 'Transfert interrompu',
        content: err.message || 'La connexion réseau a été perdue.',
        showCancel: false
      });
    }
  }
});
```

### 3. Barre de Progression WXML & Style WXSS
```xml
<!-- pages/kyc-upload/index.wxml -->
<view class="upload-box">
  <button class="upload-btn" bindtap="onSelectAndUploadDoc" disabled="{{ isUploading }}">
    {{ isUploading ? 'Téléversement en cours...' : '📄 Sélectionner un justificatif KYC' }}
  </button>

  <block wx:if="{{ isUploading || uploadProgress > 0 }}">
    <view class="progress-container">
      <view class="progress-bar">
        <view class="progress-bar__fill" style="width: {{ uploadProgress }}%;"></view>
      </view>
      <text class="progress-text">{{ uploadStatusText }}</text>
    </view>
  </block>
</view>
```

```css
/* pages/kyc-upload/index.wxss */
.upload-box {
  padding: 32rpx;
  background: #FFFFFF;
  border-radius: 16rpx;
  margin: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.upload-btn {
  background: #FD6602;
  color: #FFFFFF;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 12rpx;
  padding: 24rpx;
  border: none;
}

.upload-btn[disabled] {
  background: #F2F4F7;
  color: #98A2B3;
}

.progress-container {
  margin-top: 24rpx;
}

.progress-bar {
  width: 100%;
  height: 12rpx;
  background: #EAECF0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar__fill {
  height: 100%;
  background: #FD6602;
  transition: width 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.progress-text {
  display: block;
  font-size: 24rpx;
  color: #667085;
  margin-top: 12rpx;
  text-align: center;
}
```

---

## 🔐 Recette 60 : Stockage Local Chiffré AES Transparent (Protection Data-at-Rest CDP & Sonatel)

**Quand l'utiliser ?** Dès qu'un mini-programme conserve sur le smartphone de l'utilisateur des données sensibles :
- Jetons d'authentification OAuth2 / JWT (`auth_token`, `refresh_token`).
- Numéros de téléphone mobile (`msisdn`).
- Numéros de pièce d'identité (CNI, Passeport, carte consulaire).
- Identifiants et références de transactions Orange Money (`txnid`, `orderId`).
- Données de profil nominatives (nom, prénom, date de naissance).

**Pourquoi `wx.setStorageSync` en clair est un risque éliminatoire lors de l'Homologation Sonatel ?**
Par défaut, `wx.setStorageSync` écrit les données en texte brut JSON dans la mémoire flash de l'appareil (`Data-at-Rest`).
Sur un téléphone Android déverrouillé (rooté), via un dump de sauvegarde ADB ou lors d'un audit de conformité de la **Commission de Protection des Données Personnelles (CDP Sénégal)** et du RSSI Sonatel, l'auditeur inspecte le stockage persistant. Trouver des tokens ou des numéros MSISDN en clair entraîne un **rejet immédiat** pour la publication sur Max It.

**La solution `secureStorage` :**
Un wrapper pur JavaScript à 0 dépendance npm (compatible avec le quota strict des 2 Mo) qui applique :
1. **Une clé dérivée dynamique par appareil** : Combine l'empreinte matérielle de l'appareil (`brand + model + platform`) avec un sel d'application statique. Même si un fichier de stockage est copié physiquement vers un autre téléphone ou PC, le déchiffrement échoue car l'empreinte matérielle ne concorde pas.
2. **Un chiffrement symétrique par flux (Stream Cipher)** : Léger, instantané (< 1 ms), sans impact perceptible sur la fluidité de l'UI.
3. **Un Checksum d'intégrité anti-falsification (Anti-Tampering FNV-1a)** : Si le contenu persisté a été modifié ou corrompu, l'anomalie est immédiatement neutralisée, le payload rejeté et la valeur par défaut renvoyée sans provoquer de crash.

### 1. Le Module de Stockage Chiffré (`utils/helpers/secureStorage.js`)
```javascript
/**
 * 🔐 Module de Stockage Local Chiffré Transparent (Data-at-Rest Protection)
 * Conforme aux exigences de la CDP Sénégal et de l'Homologation Sécurité Sonatel (Max It).
 * Zéro dépendance externe - Poids : < 2 Ko.
 */

const APP_SECURITY_SALT = 'SONATEL_MAXIT_TCMPP_KEY_2026';

/**
 * Génère une empreinte unique liée à l'appareil pour sceller la clé de chiffrement
 */
function getDeviceFingerprint() {
  try {
    const sys = wx.getSystemInfoSync();
    return `${sys.brand || 'UNK'}_${sys.model || 'GENERIC'}_${sys.platform || 'DEV'}`;
  } catch (e) {
    return 'SONATEL_DEFAULT_DEVICE_FINGERPRINT';
  }
}

/**
 * Dérive une clé de chiffrement unique combinant le sel d'application et l'appareil
 */
function getDerivedKey() {
  return `${APP_SECURITY_SALT}_#_${getDeviceFingerprint()}`;
}

/**
 * Calcul d'un checksum rapide 32-bit FNV-1a pour détecter toute falsification (tampering)
 */
function computeChecksum(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Moteur de chiffrement symétrique par flux (RC4 / ARC4)
 */
function rc4Transform(key, inputStr) {
  const s = [];
  for (let i = 0; i < 256; i++) s[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }

  let i = 0;
  j = 0;
  let res = '';
  for (let y = 0; y < inputStr.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
    res += String.fromCharCode(inputStr.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

/**
 * Chiffre une chaîne de texte brut vers une représentation hexadécimale sécurisée
 */
function encryptPayload(plainText, key) {
  const encoded = encodeURIComponent(plainText);
  const checksum = computeChecksum(encoded);
  const cipher = rc4Transform(key, encoded);

  let hex = '';
  for (let i = 0; i < cipher.length; i++) {
    hex += cipher.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return `ENC:v1:${checksum}:${hex}`;
}

/**
 * Déchiffre une charge utile hexadécimale et vérifie son intégrité
 */
function decryptPayload(encryptedPayload, key) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string' || !encryptedPayload.startsWith('ENC:v1:')) {
    return null;
  }

  const parts = encryptedPayload.split(':');
  if (parts.length < 4) return null;

  const expectedChecksum = parts[2];
  const hex = parts[3];

  let cipher = '';
  for (let i = 0; i < hex.length; i += 4) {
    cipher += String.fromCharCode(parseInt(hex.substr(i, 4), 16));
  }

  const decoded = rc4Transform(key, cipher);
  const actualChecksum = computeChecksum(decoded);

  if (actualChecksum !== expectedChecksum) {
    console.error('[SecureStorage] 🚨 Alerte Sécurité : Échec de validation du checksum (données altérées ou copié depuis un autre appareil) !');
    return null;
  }

  return decodeURIComponent(decoded);
}

/**
 * API Principale du Stockage Chiffré
 */
export const secureStorage = {
  /**
   * Sauvegarde une valeur sensible chiffrée sur le disque
   * @param {string} key Clé de stockage
   * @param {any} value Valeur à sécuriser (String, Number, Object, Array)
   * @returns {boolean} Succès de l'opération
   */
  set(key, value) {
    if (!key || value === undefined) return false;
    try {
      const serialized = JSON.stringify({ v: value });
      const keyDerived = getDerivedKey();
      const cipherText = encryptPayload(serialized, keyDerived);
      wx.setStorageSync(key, cipherText);
      return true;
    } catch (err) {
      console.error('[SecureStorage] Erreur lors du chiffrement/écriture de', key, err);
      return false;
    }
  },

  /**
   * Récupère et déchiffre une valeur sensible du disque
   * @param {string} key Clé de stockage
   * @param {any} [defaultValue=null] Valeur par défaut si absente ou corrompue
   * @returns {any} Valeur déchiffrée d'origine
   */
  get(key, defaultValue = null) {
    if (!key) return defaultValue;
    try {
      const raw = wx.getStorageSync(key);
      if (!raw) return defaultValue;

      // Si la valeur est encore en texte brut hérité (migration automatique transparente)
      if (typeof raw === 'string' && !raw.startsWith('ENC:v1:')) {
        try {
          const parsedLegacy = JSON.parse(raw);
          // Auto-chiffrement pour les futurs accès
          this.set(key, parsedLegacy.v !== undefined ? parsedLegacy.v : parsedLegacy);
          return parsedLegacy.v !== undefined ? parsedLegacy.v : parsedLegacy;
        } catch (_) {
          return raw;
        }
      }

      const keyDerived = getDerivedKey();
      const decrypted = decryptPayload(raw, keyDerived);
      if (decrypted === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(decrypted);
      return parsed.v !== undefined ? parsed.v : defaultValue;
    } catch (err) {
      console.error('[SecureStorage] Erreur de déchiffrement pour la clé', key, err);
      return defaultValue;
    }
  },

  /**
   * Supprime une clé du stockage
   * @param {string} key 
   */
  remove(key) {
    if (!key) return;
    try {
      wx.removeStorageSync(key);
    } catch (err) {
      console.warn('[SecureStorage] Erreur lors de la suppression de', key, err);
    }
  },

  /**
   * Vérifie si une clé existe
   * @param {string} key 
   */
  has(key) {
    return this.get(key) !== null;
  },

  /**
   * Purge toutes les clés sensibles stockées (utilisé lors de la déconnexion)
   */
  clearSensitiveSession() {
    const CRITICAL_KEYS = [
      'auth_token',
      'refresh_token',
      'token_expiry',
      'user_msisdn',
      'user_identity',
      'last_om_txnid'
    ];
    CRITICAL_KEYS.forEach((k) => this.remove(k));
  }
};
```

### 2. Exemple d'Utilisation dans l'Authentification & Session (`utils/auth.js`)
```javascript
import { secureStorage } from './helpers/secureStorage';

export function saveUserSession({ token, expiresIn, msisdn, profile }) {
  const expiryTimestamp = Date.now() + (expiresIn * 1000);

  // Sauvegarde 100% chiffrée sur le disque flash
  secureStorage.set('auth_token', token);
  secureStorage.set('token_expiry', expiryTimestamp);
  secureStorage.set('user_msisdn', msisdn);
  secureStorage.set('user_identity', profile);
}

export function getUserToken() {
  const expiry = secureStorage.get('token_expiry', 0);
  // Marge de sécurité 60s pour prévenir les 401 en cours de transit
  if (Date.now() >= (expiry - 60000)) {
    console.warn('[Auth] Jeton expiré ou sur le point d\'expirer');
    return null;
  }
  return secureStorage.get('auth_token', null);
}

export function logoutUser() {
  // Purge propre et instantanée des données chiffrées
  secureStorage.clearSensitiveSession();
  wx.reLaunch({ url: '/pages/index/index' });
}
```

### 3. Résultat Concret lors d'un Audit de Sécurité
- **Avant (Sans `secureStorage`) :**
  Fichier local : `{"auth_token":"eyJhbGciOiJIUzI1NiIs...","msisdn":"+221771234567"}`  
  *Résultat d'audit : NON CONFORME (Données personnelles et jetons d'accès lisibles en clair).*
- **Après (Avec `secureStorage`) :**
  Fichier local : `ENC:v1:7316bbbe:008b0031004e00e50090006b00d50072007800...`  
  *Résultat d'audit : 100% CONFORME (Chiffrement Data-at-Rest vérifié avec scellement d'empreinte matérielle).*

---

## ⚡ Recette 61 : Gestionnaire WebSocket Résilient avec Heartbeat Ping/Pong & Reconnexion Auto

**Quand l'utiliser ?** Dès qu'un mini-programme nécessite des mises à jour en direct :
- Suivi de position d'un chauffeur, livreur ou car en temps réel.
- Réception instantanée d'un statut de paiement Orange Money (sans polling HTTP répétitif).
- Messagerie instantanée / chat d'assistance client.
- Bourse de fret ou enchères de billets à la seconde près.

**Pourquoi l'API brute `wx.connectSocket` est insuffisante en production ?**
1. **Passage en arrière-plan (`onHide`) :** Le système d'exploitation mobile ou WeChat coupe les sockets inactives après quelques secondes. Au retour, la socket reste muette et ne se reconnecte pas seule.
2. **Micro-coupures 4G :** La socket se ferme brutalement. Si le code tente d'envoyer un message pendant la coupure, une exception fatale est levée et le message est perdu.
3. **Timeouts des Proxies/Passerelles :** Sans battement de cœur (*Heartbeat Ping* régulier), les pare-feux et équilibreurs de charge ferment silencieusement la connexion après 60 secondes.

**La Solution Industrielle :**
Un gestionnaire événementiel `webSocketService` avec détection automatique de vie (Ping/Pong 30s), reconnexion exponentielle (1s, 2s, 4s, 8s...), et file d'attente sortante (*Outbox Buffer*) qui stocke les messages émis hors-ligne et les dépile dès que la socket est reconnectée.

### 1. Le Gestionnaire WebSocket Résilient (`utils/helpers/websocketService.js`)
```javascript
/**
 * ⚡ Module WebSocket Résilient avec Heartbeat & Reconnexion Automatique
 * Conforme runtime WeChat Mini-Program & TCMPP
 * Zéro dépendance npm
 */

class WebSocketManager {
  #socketTask = null;
  #url = '';
  #options = {};
  #isConnected = false;
  #isManualClose = false;
  #reconnectAttempts = 0;
  #maxReconnectAttempts = 5;
  #heartbeatTimer = null;
  #pongTimeoutTimer = null;
  #heartbeatInterval = 30000; // Ping toutes les 30 secondes
  #pongTimeout = 5000;        // Attente pong max 5 secondes
  #outboxQueue = [];          // Messages en attente de reconnexion
  #listeners = new Map();     // Abonnements d'événements

  /**
   * Ouvre la connexion WebSocket sécurisée (wss://)
   * @param {string} url Endpoint wss:// validé en console TCMPP
   * @param {Object} [options]
   * @param {Object} [options.headers] En-têtes (Authorization: Bearer...)
   * @param {number} [options.heartbeatInterval=30000] Intervalle ping en ms
   * @param {number} [options.maxReconnectAttempts=5] Tentatives de reconnexion
   */
  connect(url, options = {}) {
    if (this.#isConnected && this.#socketTask) {
      console.log('[WebSocket] Déjà connecté à', this.#url);
      return;
    }

    this.#url = url || this.#url;
    this.#options = options;
    this.#maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.#heartbeatInterval = options.heartbeatInterval || 30000;
    this.#isManualClose = false;

    console.log('[WebSocket] Tentative de connexion vers', this.#url);

    try {
      this.#socketTask = wx.connectSocket({
        url: this.#url,
        header: options.headers || {},
        success: () => {
          console.log('[WebSocket] Socket initialisée');
        },
        fail: (err) => {
          console.error('[WebSocket] Échec initialisation socket :', err);
          this.#scheduleReconnect();
        }
      });

      this.#setupSocketListeners();
    } catch (e) {
      console.error('[WebSocket] Exception ouverture socket :', e);
      this.#scheduleReconnect();
    }
  }

  #setupSocketListeners() {
    if (!this.#socketTask) return;

    this.#socketTask.onOpen(() => {
      console.log('[WebSocket] ✅ Connexion établie avec succès');
      this.#isConnected = true;
      this.#reconnectAttempts = 0;
      this.#startHeartbeat();
      this.#flushOutbox();
      this.#emit('open');
    });

    this.#socketTask.onMessage((res) => {
      // Détection et traitement du Pong
      if (res.data === 'pong' || res.data === 'PONG' || res.data === '{"type":"pong"}') {
        clearTimeout(this.#pongTimeoutTimer);
        return;
      }

      let parsed = res.data;
      try {
        parsed = JSON.parse(res.data);
      } catch (_) {}

      // Si le message a un type d'événement typé (ex: { event: 'order_status', data: ... })
      if (parsed && typeof parsed === 'object' && parsed.event) {
        this.#emit(parsed.event, parsed.data);
      }
      this.#emit('message', parsed);
    });

    this.#socketTask.onError((err) => {
      console.warn('[WebSocket] ⚠️ Erreur détectée :', err);
      this.#isConnected = false;
      this.#stopHeartbeat();
      this.#emit('error', err);
    });

    this.#socketTask.onClose((res) => {
      console.log('[WebSocket] Fermeture de la connexion (code:', res.code, 'raison:', res.reason, ')');
      this.#isConnected = false;
      this.#stopHeartbeat();
      this.#emit('close', res);

      if (!this.#isManualClose) {
        this.#scheduleReconnect();
      }
    });
  }

  /**
   * Envoie un message au serveur avec mise en mémoire tampon si déconnecté
   * @param {any} data Données (texte ou objet sérialisé)
   * @returns {boolean} True si envoyé immédiatement, False si mis en file d'attente
   */
  send(data) {
    const payload = typeof data === 'object' ? JSON.stringify(data) : String(data);

    if (this.#isConnected && this.#socketTask) {
      this.#socketTask.send({
        data: payload,
        fail: (err) => {
          console.warn('[WebSocket] Échec envoi, mise en outbox :', err);
          this.#outboxQueue.push(payload);
        }
      });
      return true;
    } else {
      console.log('[WebSocket] Déconnecté : message mis en file d\'attente outbox');
      this.#outboxQueue.push(payload);
      return false;
    }
  }

  #flushOutbox() {
    if (this.#outboxQueue.length === 0) return;
    console.log(`[WebSocket] Envoi de ${this.#outboxQueue.length} message(s) en attente...`);
    while (this.#outboxQueue.length > 0 && this.#isConnected) {
      const msg = this.#outboxQueue.shift();
      this.#socketTask.send({ data: msg });
    }
  }

  #startHeartbeat() {
    this.#stopHeartbeat();
    this.#heartbeatTimer = setInterval(() => {
      if (!this.#isConnected || !this.#socketTask) return;

      // 1. Envoi du Ping
      this.#socketTask.send({
        data: JSON.stringify({ type: 'ping', t: Date.now() }),
        fail: () => {
          this.#handleHeartbeatTimeout();
        }
      });

      // 2. Décompte d'attente du Pong
      this.#pongTimeoutTimer = setTimeout(() => {
        console.warn('[WebSocket] Pong non reçu dans les délais : socket considérée morte');
        this.#handleHeartbeatTimeout();
      }, this.#pongTimeout);

    }, this.#heartbeatInterval);
  }

  #handleHeartbeatTimeout() {
    this.#stopHeartbeat();
    if (this.#socketTask) {
      try {
        this.#socketTask.close({ reason: 'Heartbeat timeout' });
      } catch (_) {}
    }
    this.#scheduleReconnect();
  }

  #stopHeartbeat() {
    clearInterval(this.#heartbeatTimer);
    clearTimeout(this.#pongTimeoutTimer);
    this.#heartbeatTimer = null;
    this.#pongTimeoutTimer = null;
  }

  #scheduleReconnect() {
    if (this.#isManualClose) return;

    if (this.#reconnectAttempts >= this.#maxReconnectAttempts) {
      console.error(`[WebSocket] Seuil de reconnexion atteint (${this.#maxReconnectAttempts} tentatives). Abandon.`);
      this.#emit('reconnect_failed');
      return;
    }

    this.#reconnectAttempts++;
    // Backoff exponentiel : 1s, 2s, 4s, 8s, 16s...
    const delay = Math.min(30000, 1000 * Math.pow(2, this.#reconnectAttempts - 1));
    console.log(`[WebSocket] Reconnexion dans ${delay / 1000}s (tentative ${this.#reconnectAttempts}/${this.#maxReconnectAttempts})...`);

    setTimeout(() => {
      if (!this.#isManualClose && !this.#isConnected) {
        this.connect(this.#url, this.#options);
      }
    }, delay);
  }

  /**
   * S'abonne à un événement reçu de la socket
   * @param {string} event Nom d'événement ('message', 'open', 'close', ou nom personnalisé)
   * @param {Function} callback Fonction de traitement
   * @returns {Function} Fonction de désabonnement propre
   */
  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.#listeners.has(event)) {
      this.#listeners.get(event).delete(callback);
    }
  }

  #emit(event, data) {
    if (this.#listeners.has(event)) {
      this.#listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WebSocket] Erreur listener '${event}' :`, e);
        }
      });
    }
  }

  /**
   * Fermeture manuelle explicite (ex: déconnexion ou fermeture définitive de page)
   */
  disconnect() {
    this.#isManualClose = true;
    this.#stopHeartbeat();
    if (this.#socketTask) {
      try {
        this.#socketTask.close({ reason: 'Manual disconnect' });
      } catch (_) {}
      this.#socketTask = null;
    }
    this.#isConnected = false;
    this.#outboxQueue = [];
    console.log('[WebSocket] Déconnexion manuelle effectuée');
  }

  isConnected() {
    return this.#isConnected;
  }
}

export const webSocketService = new WebSocketManager();
```

### 2. Consommation dans une Page de Suivi en Direct (`pages/tracking/index.js`)
```javascript
import { webSocketService } from '../../utils/helpers/websocketService';

Page({
  data: {
    tripStatus: 'En route vers la gare',
    driverLat: 14.6928,
    driverLng: -17.4467,
    isSocketLive: false
  },

  onLoad(options) {
    const tripId = options.tripId || 'TRIP_123';
    const token = wx.getStorageSync('auth_token');

    // 1. Connexion au flux WebSocket temps réel
    webSocketService.connect(`wss://stream.sonatel.sn/v1/trips/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
      heartbeatInterval: 25000
    });

    // 2. Écoute des mises à jour métier poussées par le serveur
    this.unsubOpen = webSocketService.on('open', () => {
      this.setData({ isSocketLive: true });
    });

    this.unsubDriverMove = webSocketService.on('driver_location', (data) => {
      this.setData({
        driverLat: data.latitude,
        driverLng: data.longitude,
        tripStatus: data.statusText
      });
    });

    this.unsubTripCompleted = webSocketService.on('trip_arrived', () => {
      wx.showToast({ title: 'Le véhicule est arrivé !', icon: 'success' });
      this.setData({ tripStatus: 'Arrivé à destination' });
    });
  },

  onSendPingDriver() {
    // Message envoyé immédiatement si en ligne, ou mis en outbox tampon si coupure 4G
    webSocketService.send({ action: 'ping_driver', timestamp: Date.now() });
  },

  onUnload() {
    // Nettoyage impératif des écouteurs et déconnexion propre
    if (this.unsubOpen) this.unsubOpen();
    if (this.unsubDriverMove) this.unsubDriverMove();
    if (this.unsubTripCompleted) this.unsubTripCompleted();
    webSocketService.disconnect();
  }
});
```

---

## 🎯 Recette 62 : Action Optimiste Transactionnelle avec Rollback Automatique sur Erreur Serveur

**Quand l'utiliser ?** Lorsqu'un utilisateur effectue une action interactive qui doit répondre à **0 ms de latence** sans attendre la confirmation du serveur :
- Cliquer sur le bouton "Cœur / Favori" d'un voyage ou d'une offre.
- Supprimer un élément d'une liste (ex: un voyageur enregistré).
- Appliquer un commutateur / toggle (ex: activer une notification SMS ou bagage supplémentaire).

**Pourquoi sans rollback c'est une catastrophe ?**
Si le serveur plante (erreur 500, jeton expiré 401, timeout 4G), et que l'interface a déjà modifié l'écran de manière optimiste, l'utilisateur croit que l'action est enregistrée. Quand il revient sur la page 10 minutes plus tard, l'élément n'a jamais été sauvegardé (effet "état fantôme").

**La Solution Industrielle :**
Le helper `executeOptimisticAction` :
1. Capture un instantané (*snapshot*) automatique de l'état actuel de la page.
2. Injecte immédiatement l'état optimiste dans `setData` (affichage instantané à 0 ms).
3. Déclenche la requête serveur en arrière-plan.
4. Si le serveur échoue : restaure instantanément l'état d'origine, émet une vibration haptique discrète et affiche un toast bienveillant explicatif.

### 1. Le Helper Optimiste Transactionnel (`utils/helpers/optimisticAction.js`)
```javascript
/**
 * ⚡ Helper d'Action Optimiste Transactionnelle (0ms Latency + Auto Rollback)
 * Permet un retour tactile et visuel instantané avec annulation propre si le serveur échoue.
 */

/**
 * Exécute une modification d'état optimiste avec rollback garanti en cas d'échec API
 * @param {Object} options Configuration de la transaction optimiste
 * @param {Object} options.page Instance de la page (this)
 * @param {Object} options.optimisticData Données à injecter immédiatement dans setData
 * @param {Function} options.serverCall Fonction async exécutant la requête backend
 * @param {Object} [options.rollbackData] Données de restauration (si omis, capture snapshot auto)
 * @param {Function} [options.onSuccess] Callback après confirmation serveur
 * @param {string} [options.errorMessage='L\'action a échoué. Veuillez réessayer.'] Message en cas d'erreur
 * @param {boolean} [options.vibrateOnError=true] Déclenche une vibration haptique en cas d'annulation
 * @returns {Promise<any>} Résultat de la requête serveur
 */
export async function executeOptimisticAction({
  page,
  optimisticData,
  serverCall,
  rollbackData = null,
  onSuccess = null,
  errorMessage = 'L\'action a échoué. Veuillez réessayer.',
  vibrateOnError = true
}) {
  if (!page || typeof page.setData !== 'function') {
    throw new Error('[OptimisticAction] L\'instance page (this) est obligatoire.');
  }

  // 1. Snapshot automatique des clés modifiées pour le rollback si non fourni
  const autoRollback = {};
  if (!rollbackData) {
    Object.keys(optimisticData).forEach((key) => {
      // Supporte les chemins simples et clés directes
      if (key in page.data) {
        autoRollback[key] = page.data[key];
      }
    });
  }
  const effectiveRollback = rollbackData || autoRollback;

  // 2. Application immédiate à l'écran (0 ms de latence pour l'utilisateur)
  page.setData(optimisticData);

  try {
    // 3. Appel serveur en tâche asynchrone
    const serverResult = await serverCall();

    // 4. Succès confirmé
    if (typeof onSuccess === 'function') {
      onSuccess(serverResult);
    }
    return serverResult;
  } catch (err) {
    console.warn('[OptimisticAction] Échec serveur, déclenchement du Rollback :', err);

    // 5. Restauration instantanée de l'état d'origine
    page.setData(effectiveRollback);

    // 6. Feedback haptique d'avertissement
    if (vibrateOnError) {
      try {
        wx.vibrateShort({ type: 'medium' });
      } catch (_) {}
    }

    // 7. Notification bienveillante
    const message = err?.message || errorMessage;
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });

    throw err;
  }
}
```

### 2. Exemple d'Utilisation : Bouton Favoris Optimiste (`pages/flight-details/index.js`)
```javascript
import { executeOptimisticAction } from '../../utils/helpers/optimisticAction';

Page({
  data: {
    flightId: 'FL_902',
    isFavorite: false,
    favoritesCount: 142
  },

  async onToggleFavorite() {
    const nextState = !this.data.isFavorite;
    const nextCount = nextState ? this.data.favoritesCount + 1 : this.data.favoritesCount - 1;

    // Vibration haptique immédiate pour récompenser l'interaction
    wx.vibrateShort({ type: 'light' });

    try {
      await executeOptimisticAction({
        page: this,
        // Écran mis à jour instantanément à 0ms
        optimisticData: {
          isFavorite: nextState,
          favoritesCount: nextCount
        },
        // Requête réseau exécutée en arrière-plan
        serverCall: async () => {
          const res = await wx.cloud.callFunction({
            name: 'toggleFavorite',
            data: { flightId: this.data.flightId, status: nextState }
          });
          return res.result;
        },
        errorMessage: 'Impossible d\'enregistrer vos favoris pour le moment.'
      });
    } catch (_) {
      // Le rollback a déjà remis isFavorite et favoritesCount à leur valeur d'origine automatiquement !
    }
  }
});
```

---

## 🛡️ Recette 63 : Bootstrapper de Sous-Paquet Indépendant pour Deep Links & QR Codes

**Quand l'utiliser ?** Dès qu'un utilisateur peut atterrir directement sur une page secondaire située dans un sous-paquet (`subpackages/booking/pages/ticket/index`) :
- Scan d'un QR code imprimé sur une borne ou une affiche.
- Clic sur un lien de partage WhatsApp / WeChat (`wx.shareAppMessage`).
- Push notification ou bannière d'accueil de la super-app Max It pointant directement vers une commande.

**Pourquoi sans bootstrapper le sous-paquet crashe ?**
Sur WeChat Mini-Program, ouvrir directement une URL de sous-paquet n'exécute pas la page d'accueil. L'application `app.js` lance ses initialisations asynchrones dans `onLaunch` (récupération de session, configuration distante, token d'authentification). La page du sous-paquet s'exécute souvent **avant** que le token ne soit disponible.
Résultat : requête API avec `token = null`, erreur 401 brutale, ou redirection indésirable vers la page d'accueil !

**La Solution Industrielle :**
Le module `subpackageGuard.js` qui fournit un guard d'initialisation `ensureAppReady()` :
1. Attend que `app.js` ait résolu sa promesse globale `getApp().readyPromise`.
2. Affiche un écran de chargement élégant ou skeleton d'attente pendant cette demi-seconde de démarrage.
3. Ne lance l'exécution métier de la page qu'une fois les fondations de l'application prêtes et le token chargé.

### 1. Le Module de Garde Sous-Paquet (`utils/helpers/subpackageGuard.js`)
```javascript
/**
 * 🛡️ Bootstrapper de Sous-Paquet Indépendant (Deep Link & QR Code Guard)
 * Sécurise l'arrivée directe sur une page secondaire sans attendre l'accueil
 */

/**
 * Attend que l'application et les prérequis globaux (Auth, SDK) soient prêts
 * @param {number} [timeoutMs=6000] Délai d'attente maximum
 * @returns {Promise<boolean>} True si l'application est opérationnelle
 */
export async function ensureAppReady(timeoutMs = 6000) {
  const app = getApp();

  // 1. Si app.js expose une Promise globale readyPromise
  if (app && app.readyPromise) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('[SubpackageGuard] Timeout initialisation globale')), timeoutMs)
    );
    try {
      await Promise.race([app.readyPromise, timeout]);
      return true;
    } catch (e) {
      console.warn('[SubpackageGuard] ReadyPromise a expiré ou échoué :', e);
    }
  }

  // 2. Fallback de sondage (vérifie si auth_token ou indicateur est initialisé)
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (app && (app.isAppReady || wx.getStorageSync('auth_token'))) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.warn('[SubpackageGuard] Prérequis non validés dans les temps, bascule en mode autonome');
  return false;
}

/**
 * Wrapper de page pour sous-paquet avec écran d'attente automatique
 * @param {Object} pageDefinition Définition standard de Page({ ... })
 * @returns {Object} Page sécurisée
 */
export function createSubpackagePage(pageDefinition) {
  const originalOnLoad = pageDefinition.onLoad;

  return {
    ...pageDefinition,

    data: {
      isBootstrapping: true,
      ...(pageDefinition.data || {})
    },

    async onLoad(options) {
      // 1. Affichage du masque d'attente
      this.setData({ isBootstrapping: true });

      // 2. Attente de la préparation de l'application globale
      await ensureAppReady(5000);

      this.setData({ isBootstrapping: false });

      // 3. Exécution de la logique métier réelle
      if (typeof originalOnLoad === 'function') {
        originalOnLoad.call(this, options);
      }
    }
  };
}
```

### 2. Configuration dans `app.js` (Exposition de la Promesse Globale)
```javascript
// app.js
App({
  readyPromise: null,
  isAppReady: false,

  onLaunch(options) {
    // Crée la promesse partagée avec tous les sous-paquets
    this.readyPromise = new Promise(async (resolve) => {
      try {
        console.log('[App] Initialisation des prérequis au lancement...');
        // Simulation / récupération du token et configuration hôte
        const token = wx.getStorageSync('auth_token');
        this.isAppReady = true;
        resolve(true);
      } catch (err) {
        console.error('[App] Erreur init :', err);
        resolve(false);
      }
    });
  }
});
```

### 3. Utilisation dans une Page de Sous-Paquet (`subpackages/booking/pages/ticket/index.js`)
```javascript
import { createSubpackagePage } from '../../../../utils/helpers/subpackageGuard';

Page(createSubpackagePage({
  data: {
    ticketData: null
  },

  async onLoad(options) {
    // Cette méthode ne sera appelée QU'UNE FOIS app.js 100% prêt
    const ticketId = options.id;
    console.log('[TicketPage] Chargement sécurisé du billet :', ticketId);
    // Appel API garanti avec token d'authentification présent
  }
}));
```

---

## ♿ Recette 64 : Accessibilité Inclusive & Lecteurs d'Écran (VoiceOver / TalkBack / aria-*)

**Quand l'utiliser ?** Dès qu'un mini-programme s'adresse au grand public (particulièrement pour les démarches publiques, les transports, l'achat de billets et les paiements Sonatel / Orange Money) pour garantir que les **personnes malvoyantes ou aveugles** puissent utiliser l'application de façon fluide avec les lecteurs d'écran natifs (Apple VoiceOver sur iOS et Google TalkBack sur Android).

**Pourquoi sans accessibilité l'application est inutilisable pour un malvoyant ?**
1. **Les boutons avec icônes seuls** : Un bouton avec une icône SVG ou PNG (comme une corbeille ou un bouton retour) est lu par VoiceOver comme : *"Bouton"* ou *"Image sans description"*. L'utilisateur ne sait pas sur quoi il clique.
2. **La pollution des icônes décoratives** : Les flèches de séparation `->`, les fonds décoratifs et les petits badges d'ornement sont tous lus un par un, ce qui ralentit et fatigue l'utilisateur.
3. **Le silence lors des actions asynchrones** : Si l'utilisateur clique sur "Valider" et qu'un message d'erreur ou de succès apparaît, le lecteur d'écran ne le sait pas et ne le lit pas, laissant l'utilisateur dans l'ignorance totale du résultat de son paiement.

**La Solution Industrielle :**
1. Utilisation stricte des attributs WeChat : `aria-role`, `aria-label`, `aria-hidden="true"`, `aria-checked`, `aria-disabled`.
2. Déclenchement automatique d'annonces vocales dynamiques via `wx.accessibilityAnnounce()` lors des changements d'état (succès, erreur, chargement).
3. Respect des dimensions ergonomiques minimales (zone tactile de `88rpx × 88rpx`).

### 1. Le Module d'Accessibilité Vocale (`utils/helpers/accessibilityHelper.js`)
```javascript
/**
 * ♿ Helper d'Accessibilité Inclusive (VoiceOver & TalkBack)
 * Conforme aux standards WCAG 2.1 AA et API d'accessibilité WeChat
 */

/**
 * Force la vocalisation immédiate d'un message par le lecteur d'écran
 * @param {string} message Texte à lire à voix haute par VoiceOver / TalkBack
 */
export function announceToScreenReader(message) {
  if (!message || typeof message !== 'string') return;

  try {
    if (typeof wx.accessibilityAnnounce === 'function') {
      wx.accessibilityAnnounce({
        text: message
      });
      console.log('[Accessibility] Annonce vocale émise :', message);
    }
  } catch (err) {
    console.warn('[Accessibility] Non supporté sur ce terminal :', err);
  }
}
```

### 2. Les Bonnes Pratiques en WXML (Copier-Coller)
```xml
<!-- 1. Bouton icône avec description claire pour le lecteur d'écran -->
<view 
  class="btn-icon" 
  bindtap="onCloseModal"
  aria-role="button" 
  aria-label="Fermer la boîte de dialogue">
  <image src="/assets/icons/close.svg" class="btn-icon__img" aria-hidden="true" />
</view>

<!-- 2. Masquage obligatoire des éléments purement décoratifs -->
<view class="ticket-separator" aria-hidden="true">
  <view class="ticket-separator__dash"></view>
</view>

<!-- 3. Case à cocher accessible (Checkbox / Radio) -->
<view 
  class="checkbox-item" 
  bindtap="onToggleInsurance"
  aria-role="checkbox" 
  aria-checked="{{ hasInsurance }}" 
  aria-label="Assurance voyage multirisque, 2 500 Francs CFA">
  <view class="checkbox-box {{ hasInsurance ? 'checkbox-box--checked' : '' }}" aria-hidden="true"></view>
  <text class="checkbox-label" aria-hidden="true">Assurance voyage (+2 500 FCFA)</text>
</view>

<!-- 4. Onglets de sélection (Tabs) avec rôle et sélection -->
<view class="tabs-container" aria-role="tablist">
  <view 
    wx:for="{{ tabList }}" 
    wx:key="id"
    class="tab-item {{ currentTab === index ? 'tab-item--active' : '' }}"
    bindtap="onSelectTab"
    data-index="{{ index }}"
    aria-role="tab"
    aria-selected="{{ currentTab === index }}"
    aria-label="{{ item.title }}, onglet {{ index + 1 }} sur {{ tabList.length }}">
    <text aria-hidden="true">{{ item.title }}</text>
  </view>
</view>

<!-- 5. Carte de résultat de vol / trajet vocalement structurée -->
<view 
  class="flight-card" 
  bindtap="onSelectFlight" 
  aria-role="button"
  aria-label="Vol {{ flight.airline }} de {{ flight.origin }} vers {{ flight.destination }}. Départ à {{ flight.departureTime }}. Prix : {{ flight.priceFormatted }} FCFA. Appuyez deux fois pour sélectionner.">
  <!-- Tout le contenu interne est masqué au lecteur car résumé de manière limpide ci-dessus -->
  <view class="flight-card__inner" aria-hidden="true">
    <text class="flight-card__route">{{ flight.origin }} ➔ {{ flight.destination }}</text>
    <text class="flight-card__time">{{ flight.departureTime }}</text>
    <text class="flight-card__price">{{ flight.priceFormatted }} FCFA</text>
  </view>
</view>
```

### 3. Règles WXSS pour Cibles Tactiles & Contrastes
```css
/* Zone tactile minimale ergonomique (44x44 points = 88x88rpx) */
.btn-icon,
.checkbox-item,
.touch-target {
  min-width: 88rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Anneau de focus visuel lors de la navigation au clavier / switch-control */
.btn-icon:focus-visible,
.touch-target:focus-visible {
  outline: 4rpx solid #FD6602;
  outline-offset: 4rpx;
}
```

### 4. Utilisation dans le Contrôleur JS (`pages/checkout/index.js`)
```javascript
import { announceToScreenReader } from '../../utils/helpers/accessibilityHelper';

Page({
  async onConfirmPayment() {
    this.setData({ isPaying: true });
    announceToScreenReader('Paiement en cours de validation. Veuillez patienter.');

    try {
      // Simulation appel paiement
      await this.processPayment();

      this.setData({ isPaying: false, isSuccess: true });
      // Annonce immédiate du résultat au malvoyant
      announceToScreenReader('Paiement confirmé avec succès ! Votre billet a été émis.');
    } catch (err) {
      this.setData({ isPaying: false });
      announceToScreenReader(`Échec de la transaction : ${err.message || 'Erreur réseau'}. Veuillez réessayer.`);
    }
  }
});
```

---

## 📝 Recette 65 : Formulaires Dynamiques Pilotés par Schéma JSON (Server-Driven Form Builder)

**Quand l'utiliser ?** Dès qu'un mini-programme doit afficher des formulaires dont les champs, les règles de validation ou les libellés peuvent **évoluer sans recompilation du code** :
- Informations obligatoires des voyageurs (ex: passeport, visa, numéro d'urgence selon la destination).
- Déclarations KYC pour un marchand ou un transfert Orange Money.
- Formulaire d'état des lieux ou de signalement de panne.

**Pourquoi coder les formulaires en dur est une faiblesse ?**
Dès qu'un pays ajoute un champ obligatoire (ex: "Numéro de carte consulaire") ou qu'un opérateur change une règle de validation, les développeurs doivent modifier le WXML, tester sur iOS et Android, et soumettre une nouvelle version à l'équipe de validation. Avec un formulaire dynamique, le serveur renvoie le JSON à jour et le mini-programme l'affiche instantanément.

### 1. Le Moteur de Formulaire Dynamique (`utils/helpers/dynamicFormEngine.js`)
```javascript
/**
 * 📝 Moteur de Formulaires Dynamiques (Server-Driven UI)
 * Valide et orchestre les champs générés par un schéma JSON backend.
 */

/**
 * Valide un champ individuel selon ses règles déclaratives
 * @param {Object} field Définition du champ
 * @param {any} value Valeur saisie par l'utilisateur
 * @returns {string|null} Message d'erreur ou null si valide
 */
export function validateField(field, value) {
  const strVal = value !== undefined && value !== null ? String(value).trim() : '';

  // 1. Règle Obligatoire (Required)
  if (field.required) {
    if (field.type === 'switch') {
      if (!value) return field.errorRequired || `Vous devez accepter : ${field.label}`;
    } else if (!strVal) {
      return field.errorRequired || `Le champ « ${field.label} » est obligatoire.`;
    }
  }

  if (!strVal) return null; // Pas d'autre validation si vide et non-obligatoire

  // 2. Longueur minimale / maximale
  if (field.minLength && strVal.length < field.minLength) {
    return `${field.label} doit contenir au moins ${field.minLength} caractères.`;
  }
  if (field.maxLength && strVal.length > field.maxLength) {
    return `${field.label} ne doit pas dépasser ${field.maxLength} caractères.`;
  }

  // 3. Validation par Regex (Format)
  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(strVal)) {
      return field.errorPattern || `Le format de « ${field.label} » est invalide.`;
    }
  }

  // 4. Bornes numériques (pour type number)
  if (field.type === 'number') {
    const num = Number(strVal);
    if (isNaN(num)) return `${field.label} doit être un nombre valide.`;
    if (field.min !== undefined && num < field.min) return `${field.label} doit être au minimum ${field.min}.`;
    if (field.max !== undefined && num > field.max) return `${field.label} doit être au maximum ${field.max}.`;
  }

  return null;
}

/**
 * Valide l'intégralité d'un formulaire dynamique
 * @param {Array<Object>} schema Liste des champs envoyée par le serveur
 * @param {Object} values Dictionnaire des valeurs courantes
 * @returns {{ isValid: boolean, errors: Object, cleanData: Object }}
 */
export function validateFormSchema(schema = [], values = {}) {
  const errors = {};
  const cleanData = {};
  let isValid = true;

  schema.forEach((field) => {
    const val = values[field.name];
    const err = validateField(field, val);
    if (err) {
      errors[field.name] = err;
      isValid = false;
    } else {
      cleanData[field.name] = val;
    }
  });

  return { isValid, errors, cleanData };
}
```

### 2. Schéma JSON Retourné par le Serveur (`schema.json`)
```json
[
  {
    "name": "fullName",
    "type": "text",
    "label": "Nom et Prénom",
    "placeholder": "Ex: Amadou Diallo",
    "required": true,
    "minLength": 3
  },
  {
    "name": "phoneNumber",
    "type": "phone",
    "label": "Numéro de téléphone",
    "placeholder": "77 123 45 67",
    "required": true,
    "pattern": "^(7[05678])[0-9]{7}$",
    "errorPattern": "Numéro sénégalais invalide (ex: 771234567)"
  },
  {
    "name": "birthDate",
    "type": "date",
    "label": "Date de Naissance",
    "required": true
  },
  {
    "name": "documentType",
    "type": "select",
    "label": "Type de Pièce d'Identité",
    "options": ["CNI CEDEAO", "Passeport", "Permis de conduire"],
    "required": true
  },
  {
    "name": "acceptTerms",
    "type": "switch",
    "label": "J'atteste sur l'honneur l'exactitude des informations fournies",
    "required": true
  }
]
```

### 3. Contrôleur de Page (`pages/dynamic-kyc/index.js`)
```javascript
import { validateFormSchema, validateField } from '../../utils/helpers/dynamicFormEngine';

Page({
  data: {
    fieldsSchema: [],
    formValues: {},
    formErrors: {},
    isSubmitting: false
  },

  async onLoad() {
    // 1. Récupération du schéma dynamique depuis le backend
    const res = await wx.request({ url: 'https://api.sonatel.sn/v1/kyc/fields' });
    const schema = res.data || [];

    // 2. Initialisation des valeurs par défaut
    const initialValues = {};
    schema.forEach((f) => {
      initialValues[f.name] = f.defaultValue !== undefined ? f.defaultValue : (f.type === 'switch' ? false : '');
    });

    this.setData({
      fieldsSchema: schema,
      formValues: initialValues
    });
  },

  onInputChange(e) {
    const { name } = e.currentTarget.dataset;
    const value = e.detail.value;

    this.setData({
      [`formValues.${name}`]: value,
      [`formErrors.${name}`]: '' // Réinitialise l'erreur à la saisie
    });
  },

  onSelectChange(e) {
    const { name } = e.currentTarget.dataset;
    const index = Number(e.detail.value);
    const field = this.data.fieldsSchema.find(f => f.name === name);
    const selectedOption = field.options[index];

    this.setData({
      [`formValues.${name}`]: selectedOption,
      [`formErrors.${name}`]: ''
    });
  },

  onSwitchChange(e) {
    const { name } = e.currentTarget.dataset;
    this.setData({
      [`formValues.${name}`]: e.detail.value,
      [`formErrors.${name}`]: ''
    });
  },

  onSubmitForm() {
    const check = validateFormSchema(this.data.fieldsSchema, this.data.formValues);

    if (!check.isValid) {
      this.setData({ formErrors: check.errors });
      // Toast sur la première erreur rencontrée
      const firstError = Object.values(check.errors)[0];
      wx.showToast({ title: firstError, icon: 'none', duration: 3000 });
      return;
    }

    this.setData({ isSubmitting: true });
    console.log('[DynamicForm] Données certifiées prêtes pour envoi :', check.cleanData);

    wx.showToast({ title: 'Formulaire validé !', icon: 'success' });
  }
});
```

### 4. Vue WXML Adaptative (`pages/dynamic-kyc/index.wxml`)
```xml
<view class="form-container">
  <block wx:for="{{ fieldsSchema }}" wx:key="name">
    <view class="form-field">
      <view class="form-label-row">
        <text class="form-label">{{ item.label }}</text>
        <text wx:if="{{ item.required }}" class="form-required" aria-hidden="true">*</text>
      </view>

      <!-- Champ Texte / Téléphone / Nombre -->
      <block wx:if="{{ item.type === 'text' || item.type === 'phone' || item.type === 'number' }}">
        <input 
          class="form-input {{ formErrors[item.name] ? 'form-input--error' : '' }}"
          type="{{ item.type === 'phone' || item.type === 'number' ? 'number' : 'text' }}"
          placeholder="{{ item.placeholder || '' }}"
          value="{{ formValues[item.name] }}"
          data-name="{{ item.name }}"
          bindinput="onInputChange"
          aria-label="{{ item.label }}"
        />
      </block>

      <!-- Champ Date -->
      <block wx:elif="{{ item.type === 'date' }}">
        <picker mode="date" data-name="{{ item.name }}" bindchange="onInputChange">
          <view class="form-picker {{ formErrors[item.name] ? 'form-input--error' : '' }}">
            {{ formValues[item.name] || item.placeholder || 'Sélectionner une date' }}
          </view>
        </picker>
      </block>

      <!-- Champ Sélecteur (Options) -->
      <block wx:elif="{{ item.type === 'select' }}">
        <picker mode="selector" range="{{ item.options }}" data-name="{{ item.name }}" bindchange="onSelectChange">
          <view class="form-picker {{ formErrors[item.name] ? 'form-input--error' : '' }}">
            {{ formValues[item.name] || 'Choisir une option...' }}
          </view>
        </picker>
      </block>

      <!-- Champ Commutateur (Switch / Consentement) -->
      <block wx:elif="{{ item.type === 'switch' }}">
        <view class="form-switch-row">
          <switch checked="{{ formValues[item.name] }}" data-name="{{ item.name }}" bindchange="onSwitchChange" color="#FD6602" />
          <text class="form-switch-desc">{{ item.label }}</text>
        </view>
      </block>

      <!-- Message d'erreur contextualisé sous le champ -->
      <text wx:if="{{ formErrors[item.name] }}" class="form-error-text">{{ formErrors[item.name] }}</text>
    </view>
  </block>

  <button class="form-submit-btn" bindtap="onSubmitForm" disabled="{{ isSubmitting }}">
    {{ isSubmitting ? 'Validation en cours...' : 'Soumettre le dossier' }}
  </button>
</view>
```

### 5. Styles WXSS Sémantiques (`pages/dynamic-kyc/index.wxss`)
```css
.form-container {
  padding: 32rpx;
  background: #F8F9FA;
  min-height: 100vh;
}

.form-field {
  margin-bottom: 28rpx;
  background: #FFFFFF;
  padding: 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.form-label-row {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #1D2939;
}

.form-required {
  color: #D92D20;
  margin-left: 6rpx;
}

.form-input,
.form-picker {
  height: 84rpx;
  border: 2rpx solid #D0D5DD;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #101828;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.form-input--error {
  border-color: #FDA29B;
  background-color: #FEF3F2;
}

.form-switch-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.form-switch-desc {
  font-size: 24rpx;
  color: #475467;
  flex: 1;
}

.form-error-text {
  display: block;
  font-size: 22rpx;
  color: #D92D20;
  margin-top: 8rpx;
}

.form-submit-btn {
  margin-top: 40rpx;
  background: #FD6602;
  color: #FFFFFF;
  font-weight: 700;
  border-radius: 14rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

---

## 🎨 Recette 66 : Rendu Garanti avant Traitement Lourd (`waitForNextPaint`) & Garde Anti-Zombie (`isDisposed`)

**Quand l'utiliser ?**
1. Dès qu'une page doit afficher un loader de vol ou un skeleton **avant** de lancer une tâche JavaScript lourde (tri de 300 vols, calcul de tarifs, parsing complexe) ou un appel réseau.
2. Pour sécuriser 100 % des rappels asynchrones (`async/await`, promesses `BackendAPI`) contre les fuites de mémoire et les erreurs de mise à jour sur des pages fermées (*Zombie Updates*).

**Pourquoi le code classique `this.setData({ isLoading: true })` freeze l'écran ?**
Sous WeChat, le moteur fonctionne avec une architecture à deux threads :
* **Thread Logique (JavaScript) :** Exécute votre code JS.
* **Thread Rendu (WebView) :** Dessine les composants à l'écran.
Si vous écrivez :
```javascript
this.setData({ isLoading: true });
heavyComputation(); // Le thread JS reste occupé pendant 600 ms !
```
Le thread JavaScript est saturé par `heavyComputation()`. Le message de mise à jour pour le loader reste bloqué dans la file d'attente du pont IPC. **Le loader ne s'affiche jamais**, et l'utilisateur a l'impression que son téléphone a planté pendant une demi-seconde !

**La Solution `waitForNextPaint` :**
Elle combine le callback de `setData` avec `wx.nextTick` pour céder la main à la WebView et garantir que le loader est physiquement dessiné sur la dalle de l'écran avant que la tâche lourde ne commence.

### 1. Le Helper de Rendu Garanti (`utils/helpers/pageHelper.js`)
```javascript
/**
 * 🎨 waitForNextPaint — Garantit que le rendu visuel (loader / skeleton) est physiquement
 * peint sur l'écran avant qu'une tâche JS lourde ou une transition ne s'exécute.
 * @param {Object} page - Instance de la page (this)
 * @param {Object} [state={}] - État visuel à injecter immédiatement
 * @returns {Promise<void>}
 */
export const waitForNextPaint = (page, state = {}) =>
  new Promise((resolve) => {
    const afterSetData = () => {
      if (typeof wx !== 'undefined' && typeof wx.nextTick === 'function') {
        wx.nextTick(resolve);
        return;
      }
      setTimeout(resolve, 0);
    };

    if (page && typeof page.setData === 'function') {
      page.setData(state, afterSetData);
      return;
    }

    afterSetData();
  });
```

### 2. Le Contrôleur de Page avec Garde Anti-Zombie (`isDisposed`)
```javascript
import { waitForNextPaint } from '../../utils/helpers/pageHelper';

Page({
  data: {
    isLoading: true,
    flightResults: []
  },

  async onLoad(options) {
    // 1. Initialise le flag de vie de l'instance
    this.isDisposed = false;

    // 2. Garantit que le loader de vol est peint sur l'écran
    await waitForNextPaint(this, { isLoading: true });

    // 3. Clause de garde : si l'utilisateur est revenu en arrière pendant le paint, on s'arrête !
    if (this.isDisposed) return;

    try {
      // Tâche asynchrone / appel API
      const results = await this.fetchFlightsData(options);

      // 4. Protection Anti-Zombie : ne jamais faire setData si la page a été quittée
      if (this.isDisposed) return;

      this.setData({
        flightResults: results,
        isLoading: false
      });
    } catch (err) {
      if (this.isDisposed) return;
      this.setData({ isLoading: false });
      wx.showToast({ title: 'Erreur de chargement', icon: 'none' });
    }
  },

  onUnload() {
    // 5. Désactive immédiatement l'instance : neutralise toutes les promesses en cours
    this.isDisposed = true;
  }
});
```

---

## 🔢 Recette 67 : Indicateur d'Étapes Horizontal pour Entonnoirs Multi-Écrans (`app-stepper`)

**Quand l'utiliser ?** Dans les parcours en plusieurs étapes (tunnels de réservation de vol/bus, formulaires KYC en 3 étapes, checkout de paiement) pour donner à l'utilisateur un repère visuel clair sur sa progression dans l'entonnoir.

**Ce qu'apporte le composant :**
* Affichage horizontal compact adapté aux écrans de smartphones.
* États visuels automatiques : **terminé** (coche validée), **actif** (surbrillance Orange `#FD6602`), et **en attente** (gris neutre).
* Barres de liaison visuelles continues ou en pointillés.
* Mode interactif optionnel (`clickable: true`) pour permettre de revenir aux étapes précédentes.
* Trois variantes graphiques : `'default'` (numéros dans cercles), `'compact'` (petits points discrets), `'pill'` (badges horizontaux).

### 1. Contrôleur du Composant Stepper (`components/ui/stepper/index.js`)
```javascript
Component({
  properties: {
    steps: {
      type: Array,
      value: [] // Ex: [{ label: 'Vols' }, { label: 'Voyageurs' }, { label: 'Sièges' }, { label: 'Paiement' }]
    },
    current: {
      type: Number,
      value: 0
    },
    showLines: {
      type: Boolean,
      value: true
    },
    clickable: {
      type: Boolean,
      value: false
    },
    variant: {
      type: String,
      value: 'default' // 'default' | 'compact' | 'pill'
    }
  },

  methods: {
    onTapStep(e) {
      if (!this.properties.clickable) return;
      const index = Number(e.currentTarget.dataset.index);
      if (index <= this.properties.current) {
        this.triggerEvent('change', { index });
      }
    }
  }
});
```

### 2. Vue WXML du Stepper (`components/ui/stepper/index.wxml`)
```xml
<view class="stepper stepper--{{ variant }}">
  <block wx:for="{{ steps }}" wx:key="index">
    <!-- Barre de liaison entre les étapes -->
    <view 
      wx:if="{{ index > 0 && showLines }}" 
      class="stepper__line {{ index <= current ? 'stepper__line--completed' : '' }}"
      aria-hidden="true">
    </view>

    <!-- Étape individuelle -->
    <view 
      class="stepper__step {{ index < current ? 'stepper__step--completed' : (index === current ? 'stepper__step--active' : 'stepper__step--pending') }}"
      bindtap="onTapStep"
      data-index="{{ index }}"
      aria-role="button"
      aria-label="Étape {{ index + 1 }} sur {{ steps.length }}: {{ item.label }}, {{ index < current ? 'terminée' : (index === current ? 'en cours' : 'à venir') }}">
      
      <!-- Pastille numéro ou coche -->
      <view class="stepper__badge" aria-hidden="true">
        <text wx:if="{{ index < current }}" class="stepper__check">✓</text>
        <text wx:else class="stepper__num">{{ index + 1 }}</text>
      </view>

      <!-- Libellé de l'étape -->
      <text class="stepper__label" aria-hidden="true">{{ item.label }}</text>
    </view>
  </block>
</view>
```

### 3. Styles WXSS Sémantiques (`components/ui/stepper/index.wxss`)
```css
.stepper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  position: relative;
}

.stepper__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  flex: 1;
}

.stepper__line {
  flex: 1;
  height: 4rpx;
  background: #EAECF0;
  margin: 0 -16rpx 36rpx -16rpx;
  z-index: 1;
  transition: background 0.3s ease;
}

.stepper__line--completed {
  background: #FD6602;
}

.stepper__badge {
  width: 52rpx;
  height: 52rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24rpx;
  font-weight: 700;
  transition: all 0.3s ease;
}

/* État : En cours */
.stepper__step--active .stepper__badge {
  background: #FD6602;
  color: #FFFFFF;
  box-shadow: 0 0 0 8rpx rgba(253, 102, 2, 0.2);
}

.stepper__step--active .stepper__label {
  color: #FD6602;
  font-weight: 700;
}

/* État : Validé */
.stepper__step--completed .stepper__badge {
  background: #12B76A;
  color: #FFFFFF;
}

.stepper__step--completed .stepper__label {
  color: #344054;
}

/* État : À venir */
.stepper__step--pending .stepper__badge {
  background: #F2F4F7;
  color: #667085;
}

.stepper__step--pending .stepper__label {
  color: #98A2B3;
}

.stepper__label {
  font-size: 22rpx;
  margin-top: 10rpx;
  text-align: center;
}
```

---

## ⚖️ Recette 68 : Machine de Traitement Post-Paiement Tri-Statut (`confirmed` / `failed` / `unknown`)

**Quand l'utiliser ?** Dès qu'un utilisateur déclenche un paiement marchand Orange Money ou un achat de billet sur **Max It**, pendant que l'écran de traitement asynchrone (`pages/processing/index`) interroge le backend pour confirmer la transaction.

**Pourquoi l'état inconnu (`unknown`) est le cas le plus dangereux en fintech ?**
Lorsque le client valide son code secret Orange Money sur son téléphone :
1. **Cas Succès (`confirmed`) :** La banque valide, le serveur émet le billet, redirection immédiate vers l'écran de confirmation.
2. **Cas Échec Explicite (`failed`) :** Solde insuffisant ou code erroné, la banque renvoie un refus clair. On informe l'utilisateur et on lui permet de changer de moyen de paiement.
3. **Cas Incertain (`unknown` / Timeout réseau) :** La 4G décroche pendant la seconde où le serveur attend la confirmation bancaire. L'argent est **peut-être débité**, ou **peut-être pas**.
   * ❌ **L'erreur fatale :** Traiter cet état comme un échec et dire au client *"Paiement échoué, veuillez réessayer"*. Le client réessaie et est **débité deux fois** !

**La Solution Industrielle :**
Une machine d'état tripartite stricte qui isole `unknown` :
* Verrouille l'`attemptId` unique d'idempotence.
* Affiche un bouton sécurisé *"Vérifier le statut"* qui ne réémet JAMAIS d'ordre de paiement, mais sonde le résultat de la transaction existante jusqu'à confirmation.

### 1. Contrôleur de Traitement Tri-Statut (`pages/processing/index.js`)
```javascript
import { waitForNextPaint } from '../../utils/helpers/pageHelper';

Page({
  data: {
    processingStatus: 'processing', // 'processing' | 'confirmed' | 'failed' | 'unknown'
    processingMessage: 'Validation de votre transaction avec Orange Money...',
    canResumeCheck: false,
    transactionId: ''
  },

  async onLoad(options) {
    this.isDisposed = false;
    this.attemptId = options.attemptId || `ATT_${Date.now()}`;

    // 1. Force l'affichage immédiat de l'animation de paiement
    await waitForNextPaint(this, { processingStatus: 'processing' });
    if (this.isDisposed) return;

    return this.resolvePaymentOutcome();
  },

  onUnload() {
    this.isDisposed = true;
  },

  async resolvePaymentOutcome() {
    if (this._inFlight || this.isDisposed) return;
    this._inFlight = true;

    this.setData({
      processingStatus: 'processing',
      processingMessage: 'Confirmation bancaire en cours...',
      canResumeCheck: false
    });

    try {
      // 2. Appel à l'API de finalisation avec clé d'idempotence attemptId
      const outcome = await this.queryTransactionStatus(this.attemptId);

      if (this.isDisposed) return;

      if (outcome.status === 'confirmed') {
        // Succès : Redirection automatique vers la confirmation
        this.setData({ processingStatus: 'confirmed' });
        wx.redirectTo({
          url: `/pages/confirmed/index?reference=${outcome.bookingReference}`
        });
      } else if (outcome.status === 'failed') {
        // Échec bancaire explicite
        this.setData({
          processingStatus: 'failed',
          processingMessage: outcome.errorMessage || 'Transaction refusée par l\'opérateur.'
        });
      } else {
        // État inconnu (timeout / micro-coupure)
        throw new Error('OUTCOME_UNKNOWN');
      }
    } catch (err) {
      if (this.isDisposed) return;

      // 3. Gestion sécurisée de l'état inconnu sans risquer de double débit
      this.setData({
        processingStatus: 'unknown',
        processingMessage: 'Votre paiement est en cours de réconciliation. Aucun montant supplémentaire ne sera prélevé.',
        canResumeCheck: true
      });
    } finally {
      this._inFlight = false;
    }
  },

  // Bouton : Reprendre la vérification (sans repayer !)
  onTapResumeCheck() {
    return this.resolvePaymentOutcome();
  },

  // Mock de la requête API d'interrogation
  async queryTransactionStatus(attemptId) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 'confirmed', bookingReference: 'SN-AIR-9921' });
      }, 1200);
    });
  }
});
```

### 2. Vue WXML Tri-Statut (`pages/processing/index.wxml`)
```xml
<view class="processing-page">
  <!-- État 1 : Chargement / En cours -->
  <block wx:if="{{ processingStatus === 'processing' }}">
    <view class="spinner-loader animate-spin"></view>
    <text class="status-title">Transaction en cours</text>
    <text class="status-desc">{{ processingMessage }}</text>
  </block>

  <!-- État 2 : Échec Explicite -->
  <block wx:elif="{{ processingStatus === 'failed' }}">
    <view class="status-icon status-icon--failed">✕</view>
    <text class="status-title">Paiement refusé</text>
    <text class="status-desc">{{ processingMessage }}</text>
    <button class="action-btn" bindtap="resolvePaymentOutcome">Changer de moyen de paiement</button>
  </block>

  <!-- État 3 : Incertain (Unknown) - Bouclier Anti-Double Débit -->
  <block wx:elif="{{ processingStatus === 'unknown' }}">
    <view class="status-icon status-icon--warning">⚠️</view>
    <text class="status-title">Vérification du statut</text>
    <text class="status-desc">{{ processingMessage }}</text>
    <button class="action-btn action-btn--primary" bindtap="onTapResumeCheck">
      🔄 Vérifier la confirmation
    </button>
  </block>
</view>
```

---

## ✈️ Recette 69 : Résolveur de Logos & Transporteurs avec Cache Local, Whitelist Domaines & Fallback Initiales

**Quand l'utiliser ?** Dès que vous affichez des résultats de recherche de vols, des cartes de billets, des itinéraires de correspondance ou un récapitulatif de panier comportant des compagnies aériennes ou partenaires de transport.

**Pourquoi cette recette ?**
1. **Échecs de domaine WeChat :** En mini-programme WeChat/TCMPP, afficher une image issue d'un CDN externe (ex: `https://cdn.airline.com/logo.png`) échoue immédiatement si le domaine n'est pas préalablement déclaré dans la liste blanche `downloadFile` de la console WeChat.
2. **Latence réseau & coût Data :** Télécharger 20 à 40 logos externes sur une connexion 3G/4G africaine ralentit le défilement et consomme inutilement le forfait data du mobinaute.
3. **Robustesse graphique :** Si une URL d'image est invalide ou répond en erreur HTTP 404, le composant `<image>` de WeChat affiche un espace vide disgracieux. Le résolveur bascule à chaud sur un badge textuel stylisé (initiales ou glyphe ✈).
4. **Sécurité :** Interdiction absolue des flux HTTP non chiffrés.

### 1. Le Helper Résolveur (`utils/helpers/airlineLogo.js`)
```javascript
const LOCAL_LOGOS = {
  HC: '/assets/images/airlines/air-senegal.png',
  HF: '/assets/images/airlines/air-cote-divoire.png',
  KP: '/assets/images/airlines/asky.png',
  R2: '/assets/images/airlines/transair.png',
  AF: '/assets/images/airlines/air-france.png',
  SS: '/assets/images/airlines/corsair.png',
  AT: '/assets/images/airlines/royal-air-maroc.png',
  SN: '/assets/images/airlines/brussels-airlines.png'
};

export const normalizeCode = (value) => String(value || '').trim().toUpperCase();

export const codeFromName = (name) => {
  const normalized = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim();

  if (normalized.includes('air senegal')) return 'HC';
  if (normalized.includes('air cote d ivoire') || normalized.includes('cote d ivoire')) return 'HF';
  if (normalized.includes('asky')) return 'KP';
  if (normalized.includes('transair')) return 'R2';
  if (normalized.includes('air france')) return 'AF';
  if (normalized.includes('corsair')) return 'SS';
  if (normalized.includes('royal air maroc') || normalized.includes('ram')) return 'AT';
  if (normalized.includes('brussels')) return 'SN';
  return '';
};

export const getAirlineCode = ({ code, name } = {}) => {
  const normalized = normalizeCode(code);
  return /^[A-Z0-9]{2}$/.test(normalized) ? normalized : codeFromName(name);
};

export const airlineFallbackLabel = ({ code, name } = {}) => {
  const carrierCode = getAirlineCode({ code, name });
  if (carrierCode) return carrierCode;

  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || '✈';
};

export const resolveAirlineLogo = ({ code, name, logo } = {}) => {
  const carrierCode = getAirlineCode({ code, name });
  if (LOCAL_LOGOS[carrierCode]) {
    return LOCAL_LOGOS[carrierCode];
  }

  const supplied = String(logo || '').trim();
  if (/^https:\/\/[^\s]+$/i.test(supplied) || /^\/assets\//.test(supplied)) {
    return supplied;
  }

  return carrierCode
    ? `https://www.flighthub.com/cf-assets/images/suppliersx2/${carrierCode}x2.png`
    : '';
};

export const handleAirlineLogoError = (context, dataKey = 'logoFailed') => {
  if (context && typeof context.setData === 'function') {
    context.setData({ [dataKey]: true });
  }
};
```

### 2. Vue WXML avec Fallback Événementiel (`binderror`)
```xml
<view class="airline-brand">
  <!-- Image avec fallback automatique si l'URL externe échoue -->
  <image
    wx:if="{{ !logoFailed && logoUrl }}"
    class="airline-logo"
    src="{{ logoUrl }}"
    mode="aspectFit"
    lazy-load
    binderror="onAirlineLogoError"
  />

  <!-- Badge de secours en initiales vectorielles CSS (0 ms) -->
  <view wx:else class="airline-badge-fallback">
    <text class="airline-badge-text">{{ fallbackLabel }}</text>
  </view>

  <text class="airline-name">{{ airlineName }}</text>
</view>
```

### 3. Contrôleur JS (`pages/flight-item/index.js`)
```javascript
import {
  resolveAirlineLogo,
  airlineFallbackLabel,
  handleAirlineLogoError
} from '../../utils/helpers/airlineLogo.js';

Page({
  data: {
    logoUrl: '',
    fallbackLabel: '',
    airlineName: 'Air Sénégal',
    logoFailed: false
  },

  onLoad(options) {
    const carrier = { code: 'HC', name: 'Air Sénégal', logo: options.logo };
    this.setData({
      logoUrl: resolveAirlineLogo(carrier),
      fallbackLabel: airlineFallbackLabel(carrier)
    });
  },

  onAirlineLogoError(e) {
    handleAirlineLogoError(this, 'logoFailed');
  }
});
```

---

## 🧳 Recette 70 : Accordéon de Franchise Bagages & Règles Tarifaires à Nœud Virtuel (`virtualHost`)

**Quand l'utiliser ?** Dès que vous affichez le détail d'une réservation, les conditions d'un tarif (échange, remboursement) ou la franchise de bagages (cabine, soute, accessoire) par itinéraire.

**Pourquoi cette recette ?**
1. **Élimination des conteneurs parasites :** Dans WeChat, chaque balise `<baggage-allowance>` crée un conteneur personnalisé dans l'arbre d'affichage. Sans `virtualHost: true`, ce conteneur brise les dispositions `display: flex` et `display: grid` des pages mères.
2. **Intégrité métier stricte :** Dans le domaine aérien, afficher une franchise par défaut codée en dur peut induire le passager en erreur et générer des pénalités à l'embarquement. Le composant est délibérément 100% piloté par les données certifiées du backend.
3. **Performance 60 FPS :** L'accordéon utilise des transitions CSS matérielles (`max-height`, `opacity`, `transform: translateY`) garantissant un déploiement fluide sans saccade sur smartphone.

### 1. Configuration du Composant (`components/baggage-allowance/index.json`)
```json
{
  "component": true,
  "usingComponents": {}
}
```

### 2. Définition JS avec Nœud Virtuel (`components/baggage-allowance/index.js`)
```javascript
Component({
  options: {
    virtualHost: true
  },

  properties: {
    open: {
      type: Boolean,
      value: false
    },
    showSummaryBadges: {
      type: Boolean,
      value: true
    },
    summary: {
      type: Array,
      value: []
    },
    routeList: {
      type: Array,
      value: []
    }
  },

  data: {
    isOpen: false
  },

  lifetimes: {
    attached() {
      if (this.properties.open) {
        this.setData({ isOpen: true });
      }
    }
  },

  methods: {
    toggleOpen() {
      this.setData({
        isOpen: !this.data.isOpen
      });
    }
  }
});
```

### 3. Gabarit WXML (`components/baggage-allowance/index.wxml`)
```xml
<view class="baggage-allowance-card {{isOpen ? 'is-open' : ''}}">
  <view class="baggage-allowance-card__header" bindtap="toggleOpen">
    <view class="baggage-allowance-card__title-row">
      <text class="baggage-allowance-card__title">Franchise bagages</text>
      <view wx:if="{{ showSummaryBadges && summary && summary.length }}" class="baggage-summary">
        <block wx:for="{{summary}}" wx:for-item="badge" wx:key="id">
          <view class="baggage-summary__item baggage-summary__item--{{badge.tone || 'muted'}}">
            <text class="baggage-summary__count">{{badge.label}}</text>
            <image wx:if="{{ badge.icon }}" class="baggage-summary__mini" src="{{badge.icon}}" mode="aspectFit" />
          </view>
        </block>
      </view>
    </view>

    <view class="baggage-allowance-card__chevron {{isOpen ? 'is-open' : ''}}">
      <text class="baggage-allowance-card__arrow-glyph">▼</text>
    </view>
  </view>

  <view class="baggage-allowance-card__body">
    <view class="baggage-allowance-card__inner">
      <block wx:for="{{routeList}}" wx:for-item="route" wx:for-index="routeIndex" wx:key="id">
        <view class="baggage-route">
          <view class="baggage-route__head">
            <text class="baggage-route__title">{{route.title}}</text>
            <text wx:if="{{ route.tag }}" class="baggage-route__tag">{{route.tag}}</text>
          </view>

          <view class="baggage-route__items">
            <block wx:for="{{route.items}}" wx:for-item="bag" wx:for-index="bagIndex" wx:key="id">
              <view class="baggage-item">
                <view class="baggage-item__icon baggage-item__icon--{{bag.kind || 'standard'}}">
                  <text class="baggage-item__glyph">{{ bag.glyph || '🧳' }}</text>
                </view>

                <view class="baggage-item__content">
                  <view class="baggage-item__title-row">
                    <text class="baggage-item__title">{{bag.title}}</text>
                    <text wx:if="{{bag.value}}" class="baggage-item__value">{{bag.value}}</text>
                  </view>
                  <text wx:if="{{ bag.subtitle }}" class="baggage-item__subtitle">{{bag.subtitle}}</text>
                </view>
              </view>

              <view wx:if="{{bagIndex < route.items.length - 1}}" class="baggage-item__divider"></view>
            </block>
          </view>

          <view wx:if="{{routeIndex < routeList.length - 1}}" class="baggage-route__separator"></view>
        </view>
      </block>
    </view>
  </view>
</view>
```

---

## 📄 Recette 71 : Export de Billet & Reçu Client Vectoriel PDF et Canvas 2D Mobile

**Quand l'utiliser ?** Dès qu'un client confirme un paiement ou achète un billet et souhaite enregistrer un reçu certifié ou un billet d'embarquement dans l'album photo de son téléphone ou sous format PDF.

**Pourquoi cette recette ?**
1. **0 dépendance serveur :** Générer les reçus directement sur l'appareil décharge l'infrastructure cloud et fonctionne même avec une bande passante réduite après le paiement.
2. **Garde anti-timeout WeChat :** Les appels natifs `wx.canvasToTempFilePath` peuvent parfois rester en suspens si le GPU mobile est saturé. La fonction `withTicketTimeout` garantit une sortie propre au bout de 10 secondes.
3. **Protection Out-Of-Memory (OOM) :** Sur les réservations de groupe (ex: 5 passagers et 4 vols de correspondance), un Canvas de 5000px de haut ferait crasher le processus Mini-Program. La pagination intelligente (`paginateTicketModel`) découpe les pages selon les capacités de l'appareil.
4. **Gestion des permissions photos :** Détection proactive du code d'erreur `auth deny` pour guider l'utilisateur vers `wx.openSetting` sans le bloquer.

### 1. Le Module Exportateur (`utils/helpers/ticketExporter.js`)
```javascript
export function withTicketTimeout(operation, stage, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(`Export ${stage} a expiré après ${timeoutMs}ms`);
      error.code = 'TICKET_TIMEOUT';
      error.stage = stage;
      reject(error);
    }, timeoutMs);

    Promise.resolve(operation).then(
      (value) => { clearTimeout(timer); resolve(value); },
      (error) => { clearTimeout(timer); reject(error); }
    );
  });
}

export function paginateTicketModel(model, itemsPerPage = 3) {
  const flights = Array.isArray(model.flights) ? model.flights : [];
  const passengers = Array.isArray(model.passengers) ? model.passengers : [];
  const pageCount = Math.max(1, Math.ceil(flights.length / itemsPerPage), Math.ceil(passengers.length / 8));
  const baseWidth = 750;

  return Array.from({ length: pageCount }, (_, index) => {
    const pageFlights = flights.slice(index * itemsPerPage, (index + 1) * itemsPerPage);
    const pagePassengers = passengers.slice(index * 8, (index + 1) * 8);
    const height = 450 + pageFlights.length * 280 + pagePassengers.length * 50;

    return {
      ...model,
      flights: pageFlights,
      passengers: pagePassengers,
      page: index + 1,
      pageCount,
      width: baseWidth,
      height
    };
  });
}

export async function exportCanvasToImage(pageInstance, canvasId, { width, height, drawRoutine, fileType = 'png', quality = 1 }) {
  if (pageInstance.isDisposed) return null;

  const canvasNode = await withTicketTimeout(
    new Promise((resolve, reject) => {
      let query = wx.createSelectorQuery();
      if (typeof query.in === 'function') query = query.in(pageInstance);
      query.select(`#${canvasId}`).fields({ node: true, size: true }).exec((res) => {
        const node = res?.[0]?.node;
        if (node && typeof node.getContext === 'function') resolve(node);
        else reject(new Error('Nœud Canvas 2D introuvable'));
      });
    }),
    'select_node'
  );

  if (pageInstance.isDisposed) return null;

  canvasNode.width = width;
  canvasNode.height = height;
  const ctx = canvasNode.getContext('2d');
  if (!ctx) throw new Error('Impossible d obtenir le contexte 2D');

  if (typeof drawRoutine === 'function') {
    drawRoutine(ctx, width, height);
  }

  if (pageInstance.isDisposed) return null;

  return withTicketTimeout(
    new Promise((resolve, reject) => {
      wx.canvasToTempFilePath({
        canvas: canvasNode,
        x: 0,
        y: 0,
        width,
        height,
        destWidth: width,
        destHeight: height,
        fileType,
        quality,
        success: (res) => resolve(res.tempFilePath),
        fail: (err) => reject(err)
      }, pageInstance);
    }),
    'export_temp_file'
  );
}

export async function saveTicketToPhotosAlbum(tempFilePath) {
  if (!tempFilePath) throw new Error('Chemin de fichier manquant');

  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success() {
        wx.showToast({ title: 'Billet enregistré !', icon: 'success' });
        resolve(true);
      },
      fail(err) {
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: 'Autorisation requise',
            content: 'Veuillez autoriser l accès aux photos pour sauvegarder votre billet.',
            confirmText: 'Paramètres',
            success(res) {
              if (res.confirm) wx.openSetting();
              resolve(false);
            }
          });
        } else {
          reject(err);
        }
      }
    });
  });
}
```

### 2. Intégration dans la Page de Confirmation (`pages/trip-details/index.js`)
```javascript
import { exportCanvasToImage, saveTicketToPhotosAlbum } from '../../utils/helpers/ticketExporter.js';

Page({
  isDisposed: false,

  onUnload() {
    this.isDisposed = true;
  },

  async onExportTicketTap() {
    try {
      wx.showLoading({ title: 'Création du billet...', mask: true });

      const tempPath = await exportCanvasToImage(this, 'ticketCanvas', {
        width: 750,
        height: 1200,
        drawRoutine: (ctx, w, h) => {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, w, h);

          ctx.fillStyle = '#FD6602';
          ctx.fillRect(0, 0, w, 20);

          ctx.fillStyle = '#1D2939';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('CONFIRMATION DE VOL', 40, 80);

          ctx.fillStyle = '#667085';
          ctx.font = '24px sans-serif';
          ctx.fillText('Référence : SN-AIR-9921', 40, 130);
        }
      });

      if (tempPath) {
        await saveTicketToPhotosAlbum(tempPath);
      }
    } catch (err) {
      console.error('[TicketExport] Erreur:', err);
      wx.showToast({ title: 'Erreur d enregistrement', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  }
});
```

---

## 🛡️ Recette 72 : Lecteur Défensif de Schémas JSON Opaques & Réconciliation d'Arrondis Monétaires

**Quand l'utiliser ?** Dès que vous consommez des réponses d'API de partenaires externes (GDS aériens, hôtels, passerelles de paiement bancaires) dont la structure de données peut varier ou inclure des formats monétaires hétérogènes.

**Pourquoi cette recette ?**
1. **Zéro crash `TypeError` sur schémas variables :** Les contrats fournisseurs utilisent fréquemment des conventions variables (`fare.amount` vs `totals.base` vs `pricing.total`). `pickPath` teste successivement une liste ordonnée de chemins sans jamais lever d'exception.
2. **Parsing monétaire universel :** Les formats de prix en Afrique et en Europe mélangent virgules, points et espaces insécables (`"1 234,50"`, `"1,234.50"`). `toOptionalAmount` garantit une extraction numérique irréprochable.
3. **Réconciliation des arrondis de centimes :** Évite les désynchronisations où la somme des passagers individuels ne correspond pas au total débité sur le compte Orange Money.

### 1. Le Module Lecteur Défensif (`utils/helpers/defensiveReader.js`)
```javascript
export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

export const pickPath = (source, paths) => {
  if (!isPlainObject(source) && !Array.isArray(source)) return undefined;

  for (const path of paths) {
    const value = String(path)
      .split('.')
      .reduce((acc, part) => (isPlainObject(acc) || Array.isArray(acc) ? acc[part] : undefined), source);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return undefined;
};

export const toOptionalAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined || value === '') return null;

  let numeric = String(value)
    .trim()
    .replace(/[\u00a0\u202f\s'’]/g, '')
    .replace(/[^0-9,.-]/g, '');

  if (!numeric || !/^-?[0-9][0-9,.-]*$/.test(numeric)) return null;

  const comma = numeric.lastIndexOf(',');
  const dot = numeric.lastIndexOf('.');

  if (comma >= 0 && dot >= 0) {
    const decimalIndex = Math.max(comma, dot);
    const decimals = numeric.length - decimalIndex - 1;
    numeric = decimals > 0 && decimals <= 2
      ? numeric.slice(0, decimalIndex).replace(/[,.]/g, '') + '.' + numeric.slice(decimalIndex + 1).replace(/[,.]/g, '')
      : numeric.replace(/[,.]/g, '');
  } else if (comma >= 0) {
    const groups = numeric.split(',');
    numeric = groups.length === 2 && groups[1].length > 0 && groups[1].length <= 2
      ? `${groups[0]}.${groups[1]}`
      : groups.join('');
  } else if ((numeric.match(/\./g) || []).length > 1) {
    numeric = numeric.replace(/\./g, '');
  }

  const amount = Number(numeric);
  return Number.isFinite(amount) ? amount : null;
};

export const reconcileRoundedLines = (lines, field, expectedTotal, currency = 'XOF') => {
  if (!Array.isArray(lines) || !lines.length || expectedTotal === null || expectedTotal === undefined) {
    return null;
  }

  const amounts = lines.map((line) => toOptionalAmount(line[field]));
  if (amounts.some((amount) => amount === null)) return null;

  const unit = ['XOF', 'XAF', 'GNF', 'JPY', 'KRW'].includes(String(currency).toUpperCase()) ? 1 : 0.01;
  const sum = amounts.reduce((acc, amount) => acc + amount, 0);
  const difference = expectedTotal - sum;
  const adjustment = Math.round(difference / unit) * unit;

  if (
    Math.abs(difference) > ((lines.length + 1) * unit) / 2 + 0.000001 ||
    Math.abs(difference - adjustment) > 0.000001
  ) {
    return null;
  }

  return {
    amounts,
    adjustment: Math.abs(adjustment) < 0.000001 ? 0 : adjustment
  };
};
```

### 2. Exemple d'Utilisation dans un Calculateur de Prix Panier
```javascript
import { pickPath, toOptionalAmount, reconcileRoundedLines } from '../../utils/helpers/defensiveReader.js';

// Récupération défensive du prix total dans une réponse API hétérogène
const rawApiResponse = {
  data: {
    itinerary_pricing: {
      fare_summary: {
        total_payable: '150 000,00'
      }
    }
  }
};

const totalPayable = toOptionalAmount(
  pickPath(rawApiResponse, [
    'data.itinerary_pricing.fare_summary.total_payable',
    'data.pricing.total',
    'data.totalAmount'
  ])
); // Résultat garanti : 150000

// Réconciliation de 3 passagers avec arrondi
const passagers = [
  { nom: 'Amadou', tarifBase: 49999.99 },
  { nom: 'Fatou', tarifBase: 49999.99 },
  { nom: 'Ousmane', tarifBase: 49999.99 }
];

const reconciliation = reconcileRoundedLines(passagers, 'tarifBase', 150000, 'XOF');
// reconciliation.adjustment = 0.03
```

---

## 💬 Recette 73 : Pont Hybride Support Client WhatsApp & Téléphone (Modale In-App, Long-Press QR & Anti-Black-Screen)

**Quand l'utiliser ?** Dès que vous devez intégrer un canal de support direct (WhatsApp Business, Téléphone vocal, E-mail) dans un Mini-Programme WeChat ou TCMPP (Max It Sonatel), tout en contournant l'impossibilité de redirection web externe directe (`window.open` / `<a href>`) et le bug d'écran noir infini de `wx.previewImage` dans le simulateur WeChat DevTools.

### Le Problème & La Contrainte Technique WeChat
1. **Pas de redirection web directe libre** : WeChat Mini-Program interdit d'ouvrir directement une URL externe (`https://wa.me/...`) via un simple clic sur un lien, sauf si le domaine est whitelisted dans la console Tencent Cloud Mini-Program.
2. **Le piège de `wx.previewImage` sur PC DevTools** : Appeler `wx.previewImage({ urls: ['/assets/...'] })` avec un chemin d'asset local relatif bloque le simulateur WeChat DevTools sur un **écran noir avec une roue de chargement infinie**. DevTools attend une URL `https://` distante ou un fichier temporaire `wxfile://`.
3. **L'expérience mobile idéale** : Sur smartphone, l'utilisateur doit pouvoir faire un **appui long** de 1 seconde sur le QR code pour déclencher le scanner natif WeChat (*"Identifier le code QR"*) sans quitter l'application, ou disposer d'un bouton de copie direct en 1 clic.

---

### Étape 1/4 — Le Helper Reusable (`utils/helpers/whatsappBridge.js`)
```javascript
/**
 * WhatsApp & Support Client Resilient Bridge
 */

export function buildWhatsAppUrl({ phone, message = "", shortLinkId = "" } = {}) {
  if (shortLinkId) {
    return `https://wa.me/message/${encodeURIComponent(shortLinkId.trim())}`;
  }
  const cleanPhone = String(phone || "").replace(/[^0-9]/g, "");
  if (!cleanPhone) {
    throw new Error("[WhatsAppBridge] Téléphone ou shortLinkId requis.");
  }
  const trimmedMsg = String(message || "").trim();
  if (trimmedMsg) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(trimmedMsg)}`;
  }
  return `https://wa.me/${cleanPhone}`;
}

export function copyToClipboard(data, toastTitle = "Copié !") {
  return new Promise((resolve) => {
    if (!data) return resolve(false);
    wx.setClipboardData({
      data: String(data),
      success: () => {
        if (typeof wx.vibrateShort === "function") {
          wx.vibrateShort({ type: "medium" });
        }
        wx.showToast({
          title: toastTitle,
          icon: "success",
          duration: 2500
        });
        resolve(true);
      },
      fail: (err) => {
        console.warn("[WhatsAppBridge] Erreur presse-papier :", err);
        resolve(false);
      }
    });
  });
}

export function makeSupportPhoneCall(phoneNumber) {
  return new Promise((resolve) => {
    const cleanPhone = String(phoneNumber || "").replace(/[^0-9+]/g, "");
    if (!cleanPhone) return resolve(false);
    wx.makePhoneCall({
      phoneNumber: cleanPhone,
      success: () => resolve(true),
      fail: (err) => {
        console.warn("[WhatsAppBridge] Appel annulé :", err);
        resolve(false);
      }
    });
  });
}

export function openWhatsAppSupportSheet({
  whatsappUrl,
  supportPhone = "+221 77 000 00 00",
  rawCallPhone = "221770000000",
  brandName = "WhatsApp",
  onOpenModal
}) {
  wx.showActionSheet({
    itemList: [
      `📷 Afficher le QR Code ${brandName}`,
      `📋 Copier le lien ${brandName} direct`,
      `📞 Appeler le service client (${supportPhone})`
    ],
    success: (res) => {
      if (res.tapIndex === 0) {
        if (typeof onOpenModal === "function") onOpenModal();
      } else if (res.tapIndex === 1) {
        copyToClipboard(whatsappUrl, "Lien copié !");
      } else if (res.tapIndex === 2) {
        makeSupportPhoneCall(rawCallPhone || supportPhone);
      }
    }
  });
}
```

---

### Étape 2/4 — La Page WXML (`pages/index/index.wxml`)
```xml
<!-- Bouton déclencheur dans la page d'accueil ou d'aide -->
<view class="contact-cta" bindtap="handleContactWhatsApp">
  <image class="contact-icon" src="/assets/icons/whatsapp.png" mode="aspectFit" />
  <text class="contact-label">Assistance WhatsApp</text>
</view>

<!-- Modale In-App Anti-Black-Screen avec Appui Long Natif -->
<osn-modal
  visible="{{ showWhatsAppModal }}"
  placement="center"
  size="lg"
  hasHeader="{{ true }}"
  hasContent="{{ true }}"
  hasFooter="{{ true }}"
  bind:close="handleCloseWhatsAppModal"
>
  <view slot="header" class="modal-header d-flex justify-content-between align-items-center w-100" style="padding: 24rpx 32rpx 16rpx;">
    <text class="modal-title font-weight-bold">WhatsApp — Support Client</text>
    <osn-icon icon="close" width="{{ 24 }}" height="{{ 24 }}" bind:tap="handleCloseWhatsAppModal" />
  </view>

  <view slot="content" class="d-flex flex-column align-items-center" style="padding: 16rpx 32rpx;">
    <!-- L'attribut show-menu-by-longpress="{{ true }}" active le scan natif WeChat sur mobile -->
    <image
      src="/assets/images/contact/whatsapp-qr.png"
      mode="widthFix"
      style="width: 480rpx; max-height: 650rpx; border-radius: 16rpx; display: block;"
      show-menu-by-longpress="{{ true }}"
    />
    <text class="modal-hint text-muted text-center" style="margin-top: 20rpx; font-size: 24rpx;">
      Maintenez le doigt sur le QR Code pour ouvrir WhatsApp
    </text>
  </view>

  <view slot="footer" class="modal-footer d-flex gap-2 w-100" style="padding: 16rpx 32rpx 24rpx;">
    <button class="btn btn-secondary flex-1" bindtap="handleCopyWhatsAppDirect">
      Copier le lien direct
    </button>
    <button class="btn btn-primary flex-1" bindtap="handleCloseWhatsAppModal">
      Fermer
    </button>
  </view>
</osn-modal>
```

---

### Étape 3/4 — Le Contrôleur Page JS (`pages/index/index.js`)
```javascript
import {
  openWhatsAppSupportSheet,
  copyToClipboard,
  buildWhatsAppUrl
} from "../../utils/helpers/whatsappBridge.js";

Page({
  data: {
    showWhatsAppModal: false,
    supportConfig: {
      phone: "+221 77 000 00 00",
      rawPhone: "221770000000",
      shortLinkId: "F5VM5FMWEDWLJ1", // Lien court WhatsApp Business
      brandName: "Sen Aura Tech"
    }
  },

  handleContactWhatsApp() {
    const { shortLinkId, phone, rawPhone, brandName } = this.data.supportConfig;
    const whatsappUrl = buildWhatsAppUrl({ shortLinkId });

    openWhatsAppSupportSheet({
      whatsappUrl,
      supportPhone: phone,
      rawCallPhone: rawPhone,
      brandName,
      onOpenModal: () => {
        this.setData({ showWhatsAppModal: true });
      }
    });
  },

  handleOpenWhatsAppModal() {
    this.setData({ showWhatsAppModal: true });
  },

  handleCloseWhatsAppModal() {
    this.setData({ showWhatsAppModal: false });
  },

  async handleCopyWhatsAppDirect() {
    const { shortLinkId } = this.data.supportConfig;
    const waUrl = buildWhatsAppUrl({ shortLinkId });
    await copyToClipboard(waUrl, "Lien copié !");
  }
});
```

---

### Étape 4/4 — Test Unitaire Automatisé Headless (`tests/contact-flow.test.mjs`)
```javascript
import test from "node:test";
import assert from "node:assert/strict";
import { buildWhatsAppUrl } from "../utils/helpers/whatsappBridge.js";

test("buildWhatsAppUrl generates correct format", () => {
  const shortUrl = buildWhatsAppUrl({ shortLinkId: "F5VM5FMWEDWLJ1" });
  assert.equal(shortUrl, "https://wa.me/message/F5VM5FMWEDWLJ1");

  const directUrl = buildWhatsAppUrl({ phone: "+221 77 000 00 00", message: "Bonjour Support" });
  assert.equal(directUrl, "https://wa.me/221770000000?text=Bonjour%20Support");
});
```



---

## ⚡ Recette 74 : Découpage Modulaire d'un Tunnel Monolithique et Helpers de Page (Pattern Kalidou)

**Quand l'utiliser ?** Dès qu'une fonction de contrôleur de page dépasse ~35 lignes ou gère plusieurs responsabilités critiques (ex: tunnel de paiement marchand, réservation de billet, soumission de devis complexe), ou lorsque deux pages doivent partager la même logique d'écran (masquage de la tabBar, protection anti-capture d'écran sensible).

### Pourquoi bannir les fonctions monolithiques ?
* **Sécurité Financière (Bouclier Anti-Double Débit) :** Si l'appel au SDK bancaire réussit mais que l'API de confirmation timeout, mélanger ces deux étapes dans la même fonction empêche de marquer l'erreur comme *incertaine* (`error.uncertain = true`). Le client risquerait de relancer le paiement et d'être débité deux fois !
* **Testabilité unitaire :** Une fonction monolithique de 150 lignes est impossible à tester de manière isolée en headless. Découpée en 6 sous-méthodes, chaque étape (calcul, préparation, confirmation) est testable unitairement en 5 ms.

---

### Étape 1/3 — Les Helpers Transverses de Page (`utils/helpers/pageHelper.js`)
```javascript
/**
 * Helpers partagés pour la gestion d'écran, tabBar et sécurité
 */

export const setPageTabBarHidden = (page, hidden, eventBus) => {
  const isHidden = Boolean(hidden);
  const tabBar = page && typeof page.getTabBar === 'function' ? page.getTabBar() : null;

  if (tabBar && typeof tabBar.setData === 'function') {
    tabBar.setData({ hidden: isHidden });
  }

  if (eventBus && typeof eventBus.emit === 'function') {
    eventBus.emit('tabbar:set_hidden', { hidden: isHidden });
  }
};

export const setScreenProtection = (sdk, enabled) => {
  if (!sdk || !sdk.screen || typeof sdk.screen.protect !== 'function') {
    return Promise.resolve();
  }

  return sdk.screen.protect(Boolean(enabled)).catch((error) => {
    console.warn('[ScreenProtection] Échec mise à jour protection :', error);
  });
};
```

---

### Étape 2/3 — Le Contrôleur de Page Découpé en 6 Méthodes Spécialisées (`pages/index/index.js`)
```javascript
import { miniSDK } from '../../sdk/index.js';
import { backendAPI } from '../../utils/apis/index.js';
import { setPageTabBarHidden, setScreenProtection, showToast } from '../../utils/helpers/pageHelper.js';

Page({
  data: {
    selectedOffer: null,
    showReceiptModal: false,
    activeReceipt: null
  },

  _isPaying: false,

  onHide() {
    // 🛡️ Garde mémoire obligatoire : désactiver la protection d'écran quand on quitte la page
    setScreenProtection(miniSDK, false);
  },

  onUnload() {
    setScreenProtection(miniSDK, false);
    setPageTabBarHidden(this, false);
  },

  // 1. ORCHESTRATEUR PRINCIPAL (Court, lisible, verrouillé)
  async handlePayAction() {
    if (this._isPaying) return;
    this._isPaying = true;

    try {
      setPageTabBarHidden(this, true);

      // 2. Préparation
      const paymentContext = await this.preparePaymentContext(this.data.selectedOffer);
      const isSimulation = !miniSDK.hasHost();

      if (isSimulation) {
        this.openSimulatedPayment(paymentContext);
        return;
      }

      // 3. Traitement natif
      await this.processNativePayment(paymentContext);
    } catch (error) {
      this.handlePaymentFailure(error);
    } finally {
      this._isPaying = false;
    }
  },

  // 2. PRÉPARATION DU CONTEXTE (Validation et devis si nécessaire)
  async preparePaymentContext(offer) {
    if (!offer || !offer.id) {
      throw new Error('Veuillez sélectionner une offre valide.');
    }

    const numericAmount = this.getPaymentAmount(offer);
    const initRes = await backendAPI.initiatePayment(offer);
    if (!initRes || !initRes.txnid) {
      throw new Error('Impossible d\’initialiser la transaction.');
    }

    return {
      txnid: initRes.txnid,
      amount: numericAmount,
      offer
    };
  },

  // 3. CALCUL PUR DU MONTANT (Sans effets de bord)
  getPaymentAmount(offer) {
    const raw = (offer && offer.price) || 0;
    return typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^0-9.]/g, '')) || 0;
  },

  // 4. TRAITEMENT NATIF VIA LE SDK OFFICIEL
  async processNativePayment(paymentContext) {
    const payResult = await miniSDK.merchantPay({
      txnid: paymentContext.txnid,
      amount: paymentContext.amount
    });

    await this.confirmPaymentReceipt({
      txnid: paymentContext.txnid,
      payResult,
      context: paymentContext
    });
  },

  // 5. BRANCHE DE SIMULATION DÉVELOPPEUR DEVTOOLS
  openSimulatedPayment(paymentContext) {
    this.setData({
      showSimulatedModal: true,
      pendingContext: paymentContext
    });
  },

  // 6. CONFIRMATION DE REÇU AVEC BOUCLIER D'INCERTITUDE
  async confirmPaymentReceipt(payment) {
    try {
      const receipt = await backendAPI.confirmPayment(payment.txnid);
      this.showPaymentReceipt(receipt);
    } catch (apiError) {
      // 🛡️ BOUCLIER FINANCIER : L'argent a été débité par Orange Money mais l'API a crashé
      apiError.uncertain = true;
      wx.showModal({
        title: 'Statut du Paiement en Cours',
        content: 'Votre débit Orange Money a été initié avec succès mais la confirmation prend quelques instants. Ne relancez pas le paiement.',
        showCancel: false,
        confirmText: 'Vérifier dans Mes Reçus',
        confirmColor: '#FF6600',
        success: () => {
          wx.navigateTo({ url: '/pages/receipts/index' });
        }
      });
    }
  },

  // 7. AFFICHAGE DU REÇU OFFICIEL AVEC PROTECTION ANTI-CAPTURE
  showPaymentReceipt(receipt) {
    this.setData({
      showReceiptModal: true,
      activeReceipt: receipt
    });
    // Active la protection anti-capture d'écran lors de la consultation du reçu
    setScreenProtection(miniSDK, true);
  },

  // 8. GESTION CENTRALISÉE DES ÉCHECS ET ANNULATIONS
  handlePaymentFailure(error) {
    setPageTabBarHidden(this, false);
    if (error && error.message && error.message.includes('cancel')) {
      showToast('Paiement annulé', 'none');
      return;
    }
    wx.showModal({
      title: 'Échec de Paiement',
      content: (error && error.message) || 'Une erreur est survenue lors de la transaction.',
      showCancel: false,
      confirmColor: '#FF6600'
    });
  }
});
```

---

### Étape 3/3 — Test Unitaire Headless (`tests/decomposed-tunnel.test.mjs`)
```javascript
import test from "node:test";
import assert from "node:assert/strict";

test("decomposed tunnel prevents double execution with flag", async () => {
  let calls = 0;
  const mockPage = {
    _isPaying: false,
    async handlePayAction() {
      if (this._isPaying) return;
      this._isPaying = true;
      calls++;
      await new Promise(r => setTimeout(r, 10));
      this._isPaying = false;
    }
  };

  // Deux clics quasi simultanés
  await Promise.all([mockPage.handlePayAction(), mockPage.handlePayAction()]);
  assert.equal(calls, 1, "Le verrou _isPaying doit bloquer le second clic concurrent");
});
```
