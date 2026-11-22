---
name: wechat-pmt
description: >-
  Expertise complète pour WeChat Mini-Program (PMT / TCMPP) : architecture modulaire anti-conflits,
  intégration API avec json-sculpt mappers, client HTTP BackendAPI, EventBus (Bus), gestion d'erreurs typées,
  bonnes pratiques UI WeChat (WXS ES5, setData optimisé, safe areas env(safe-area-inset-bottom), lifetimes composants),
  skeletons shimmer UX, SDK officiel Sonatel Max It, bouclier anti-double débit Orange Money, animations 60 FPS
  et pont hybride support client WhatsApp / Téléphone anti-black-screen.
---

# ⚡ WeChat PMT : Référentiel d'Architecture & Standards de Production

Ce skill impose les règles strictes d'ingénierie logicielle pour concevoir, structurer et déployer des mini-programmes WeChat et TCMPP (Max It / Orange Money) à l'échelle industrielle.

---

## 🎯 DÉCLENCHEURS IA (LES 10 COMMANDES MAÎTRESSES)

| Commande IA | Domaine | Comportement Strict Imposé à l'IA |
|---|---|---|
| **`@UI-MOCK`** | UI & Prototypage | Crée l'UI en mode Mock-First avec state machine (`uiState`), feedback tactile Apple Press (`hover-class="btn--pressed"`) et animations 60 FPS. Zéro appel API. |
| **`@SKELETON-UX`** | États d'Attente UX | Conçoit les skeletons shimmer wave (`components/ux/`), cartes fantômes, empty-states et error-boundaries. Isolation totale de `components/ui/`. |
| **`@RESPONSIVE-UI`** | Layout iPhone Réel | Dimensionnement iPhone physique : Safe Areas `env(safe-area-inset-bottom)`, suppression de `100vh` rigide, nav bar dynamique calculée sous l'encoche et custom tab bar officiel synchronisé. |
| **`@INTERACTIVE-UI`** | Modales & Dates | Bottom-sheets avec backdrop blur et fermeture sécurisée (`catchtap="noop"`), et calendrier horizontal sans décalage de fuseau UTC avec gestion du délai `minDays`. |
| **`@IMAGE-MEDIA`** | Médias Résilients | Composant image tout-terrain : auto-retry à 3 essais pour réseau 4G instable, cache local de timestamps, fallback d'erreur et zoom plein écran natif WeChat (`wx.previewImage`). |
| **`@STATE-ENGINE`** | État & Cache | Gestion d'état industrielle : liaison déclarative sans fuite mémoire (`createPageHelpers`), Mixin `loadingBehavior` et cache Stale-While-Revalidate à 0 ms avec garde anti-race. |
| **`@SAFE-STORAGE`** | Persistance Locale | Accès stockage sécurisé : contournement du piège natif de la chaîne vide WeChat, protection contre le dépassement du quota de 10 Mo et méthode atomique `getOrSet`. |
| **`@SAFE-NAV`** | Routage WeChat | Sécurise la navigation contre le crash silencieux de la pile à 10 pages (`navigateToSafe`), anti-double clic (`withLock`) et retour intelligent vers Home si historique vide. |
| **`@API-CONNECT`** | Consommation Backend | Connecte l'écran au backend via le workflow strict en 4 étapes (Endpoint, Schema json-sculpt, Méthode BackendAPI, UI), auth OAuth2 avec buffer de sécurité de 60s et erreurs typées. |
| **`@NATIVE-PAY`** | Paiement Orange Money | Déploie le paiement marchand natif avec bouclier bancaire `_confirmedTxnid` (garantie 0% double débit), Smart Polling 4G et gestion des statuts incertains (`err.uncertain`). |
| **`@MAXIT-SDK`** | Façade Sonatel Max It | Intègre le SDK officiel `@sonatel-os/maxit-mini-sdk` : profil sans écran de login (`user()`), contacts, scan caméra seule anti-fraude et protection anti-capture d'écran (`screen.protect`). |
| **`@ANALYTICS-TRACK`** | Télémétrie & Taggage | Suivi d'audience et de conversion conforme Sonatel/Orange : traçage des écrans (`page_view`), clics CTA, tunnel de réservation et paiements avec file d'attente hors-ligne. |
| **`@DARK-MODE`** | Thème & Accessibilité | Support du mode sombre natif WeChat (`theme.json`), variables CSS sémantiques adaptatives et respect des normes de contraste WCAG AA. |
| **`@COMPILER-SAFE`** | Compilateur TCMPP | Élimine les pièges de compilation fatals : zéro BOM UTF-8 (`\uFEFF`), zéro `@font-face` local, clauses de garde obligatoires dans `onLoad` avec retour automatique. |
| **`@TUNNEL-COMPLEXE`** | Billetterie & Funnels | Orchestre les entonnoirs multi-écrans : générateur PDF vectoriel natif 0 dépendance (%PDF-1.4), plan de sièges GDS 15 champs, rendu par lots de 20 (batching anti-freeze IPC) et décomposition tarifaire certifiée. |
| **`@SUPPORT-WHATSAPP`** | Support & WhatsApp | Déploie le pont hybride support client (WhatsApp Business, Téléphone vocal, E-mail) : modale in-app anti-écran noir pour simulateur DevTools, appui long (`show-menu-by-longpress`) et ActionSheet multi-canaux. |
| **`@DECOMPOSE-METHODS`** | Découpage Modulaire | Découpe les tunnels complexes (> 35 lignes) en 6 sous-méthodes atomiques (Pattern Kalidou) avec gestion error.uncertain et helpers de page. |

---

## 🏛️ PÔLE 1 : UI, SKELETONS SHIMMER, ANIMATIONS & RESPONSIVE

### 1.1 Orange Design System (ODS) & Tokens Sonatel
- **Palette Officielle Sonatel** : Orange 500 (`#F16E00`), Orange Vibrant (`#FF7900`), Anthracite (`#1A1A1A`), Fond Max It (`#F6F6F6`), Blanc (`#FFFFFF`).
- **Bouton CTA Principal** : `height: 96rpx; border-radius: 9999rpx; background: #F16E00;` avec feedback tactile obligatoire `hover-class="ods-btn--pressed"` (`transform: scale(0.98); opacity: 0.9;`).
- **Composant Signature** : Le Solde Orange Money `om-balance-pill` avec masquage en 1 clic (`•••••• FCFA` vs `45 250 FCFA`) et rafraîchissement haptique.
- *Référentiel détaillé : [docs/DOC_DESIGN_SYSTEM_ORANGE_SONATEL.md](docs/DOC_DESIGN_SYSTEM_ORANGE_SONATEL.md).*

### 1.2 Règle des 4 Fichiers & Isolation
Chaque page ou composant vit strictement dans son propre dossier avec 4 fichiers :
```
pages/ma-page/
  ├── index.js      ← Logique & Machine à États (uiState)
  ├── index.wxml    ← Structure & Filtres WXS
  ├── index.wxss    ← Styles scopés BEM & Safe Area
  └── index.json    ← Configuration WeChat
```

### 1.3 Skeletons Shimmer & Séparation UI vs UX
- **`components/ui/`** : Composants de présentation purs. Ne portent AUCUN état asynchrone ni skeleton.
- **`components/ux/`** : Composants d'état et d'attente (Skeletons, Empty-states, Error-boundaries).
- **Animation Shimmer Universelle** : Utiliser la classe `.shimmer` avec dégradé fluide à 60 FPS sans bloquer le thread principal.
- **Rendu Garanti avant Traitement Lourd (`waitForNextPaint`)** : Utiliser `waitForNextPaint(this, state)` pour garantir que le loader ou skeleton est physiquement peint par la WebView avant d'exécuter un calcul JS bloquant. Toujours associer au flag `this.isDisposed` pour neutraliser les mises à jour zombies après `onUnload`.

### 1.4 Feedback Tactile au Clic (`hover-class`)
- Bannir le CSS `:active` web. Toujours utiliser `hover-class="btn--pressed"` avec `hover-start-time="20"` et `hover-stay-time="100"` (`transform: scale(0.96); opacity: 0.85;`).

### 1.5 Responsive iPhone Réel & Safe Areas
- Tout élément fixé en bas (`position: fixed; bottom: 0;`) DOIT inclure : `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));`.
- Bannir `height: 100vh; overflow: hidden;`. Utiliser `min-height: 100vh;` pour laisser scroller les écrans à encoche et Dynamic Island.
- Remplacer les dimensions fractionnaires issues de Figma (`31.98rpx` → `32rpx`) pour éviter les gaps de sous-pixels sur écrans Retina.
- Bannir le nesting CSS non supporté en WXSS natif.
- Synchroniser l'index du Custom TabBar dans `onShow()` via `this.getTabBar().setData({ selected: INDEX })`.

### 1.6 Composant Image Industriel (`@IMAGE-MEDIA`)
- Utiliser `osn-image` avec `virtualHost: true`, `lazy-load` natif et auto-retry à 3 tentatives (délai exponentiel).
- Gérer l'état de chargement et le fallback d'erreur sans casser la grille de layout.
- Supporter le mode `previewable` avec `wx.previewImage` pour affichage plein écran natif WeChat.
- Mettre en cache local les timestamps de chargement pour éliminer les requêtes redondantes.

### 1.7 Bottom Sheets & Modales Responsives (`@MODAL-SHEET`)
- Utiliser `app-modal` avec slots multiples (`header`, `content`, `footer`) et `styleIsolation: 'apply-shared'`.
- Placements supportés : `'bottom'` (bottom sheet) et `'center'`.
- Pour les bottom-sheets : toujours inclure `max-height: 85vh; padding: 12rpx 32rpx env(safe-area-inset-bottom, 40rpx);`.
- Conversion automatique hex to RGBA dynamique avec backdrop blur et fermeture sur tap de l'overlay (`catchtap="noop"` sur le conteneur interne pour bloquer la propagation).

### 1.8 Sélecteurs Temporels & Calendrier Horizontal (`@DATE-PICKER`)
- Implémenter le sélecteur horizontal de dates avec calcul dynamique à partir de `minDays` (délai de prévenance).
- Détecter et signaler les dates bloquées via trigger d'événement `blocked`.
- Support des dates additionnelles choisies via picker natif avec flag `isAdditional: true`.
- Comparaisons de dates strictes au format ISO `YYYY-MM-DD` à minuit local (`T00:00:00`).

### 1.9 Moteur i18n Régional (Wolof / Français / Anglais) à 0 ms
- Résolution directe des libellés dans le template via WXS ES5 pur (`i18n.t(key, lang, params)`) sans surcharge de `setData`.
- Dictionnaire régional officiel Sonatel Max It (Wolof, Français, Anglais) et bascule réactive 1 tap via `Bus.emit('LANG_CHANGED')`.
- *Référentiel détaillé : [docs/DOC_INTERNATIONALISATION_I18N_WOLOF.md](docs/DOC_INTERNATIONALISATION_I18N_WOLOF.md).*

### 1.10 Accessibilité Inclusive VoiceOver / TalkBack (`@DARK-MODE`)
- Déclarer systématiquement `aria-role="button"` et `aria-label="description explicite"` sur les boutons icônes et actions interactives.
- Masquer impérativement les éléments purement décoratifs (flèches, séparateurs, arrière-plans) avec `aria-hidden="true"`.
- Déclencher `announceToScreenReader(message)` via `wx.accessibilityAnnounce` lors des validations ou erreurs asynchrones.
- Cibles tactiles ergonomiques minimales : `88rpx × 88rpx` (norme WCAG AA / 44×44 points).

---

## 🧠 PÔLE 2 : LOGIQUE MÉTIER, NAVIGATION, STOCKAGE & BEHAVIORS

### 2.1 Navigation Sécurisée (Limite des 10 Pages)
- Ne jamais appeler `wx.navigateTo` à l'aveugle. Utiliser `navigateToSafe()` qui bascule automatiquement sur `wx.redirectTo` quand `getCurrentPages().length >= 10`.
- Retour Intelligent : Si `getCurrentPages().length === 1` (accès direct via deep link ou SMS), basculer sur `wx.switchTab({ url: '/pages/home/home' })` au lieu de bloquer.
- Anti-double tap : Verrouiller toute navigation ou action sensible avec `withLock(fn, 500)`.

### 2.2 Barre de Navigation Custom & Offset Écran (`@CUSTOM-NAVBAR`)
- Calculer dynamiquement le décalage sous la nav bar : `navContentOffset = statusBarHeight + 44 + Math.ceil(34 * windowWidth / 750)`.
- Mode logo centré vs mode titre avec flèche retour via observer de props (`showLogo, logoSrc`).
- Historique de navigation avec fallback vers `app.globalData.navHistory` et redirection vers les pages tabbar via `wx.switchTab`.

### 2.3 WeChat Behaviors (Mixins Officiels)
- Factoriser `isLoading`, `hasError`, `errorMessage` et la méthode `withLoading(asyncFn)` via `loadingBehavior` au lieu de dupliquer du code sur 20 pages.

### 2.4 Liaison Déclarative Page <-> EventBus (`@PAGE-BINDINGS`)
- Utiliser `createPageHelpers(this, stateBindings)` pour mapper automatiquement les clés d'état du Bus vers le `data` de la page.
- Exécuter `subscribe()` et `loadInitial()` dans `onLoad()`, et `unsubscribe()` impérativement dans `onUnload()` pour garantir zéro fuite mémoire.
- Encapsuler les appels critiques avec `retryAsync(fn, { maxRetries, delayMs, page })` pour refléter la progression du retry directement dans l'UI.

### 2.5 Cache Stale-While-Revalidate & Garde Anti-Race (`@STALE-REVALIDATE`)
- Stratégie SWR : afficher immédiatement les données du cache local (TTL 3 à 15 min), puis lancer la synchronisation API en arrière-plan sans bloquer l'interface.
- Bouclier anti-race condition : incrémenter un `_refreshRequestId` à chaque rafraîchissement et rejeter les réponses dont l'ID ne correspond plus à la dernière requête émise.

### 2.6 Persistance Locale Résiliente (`@SAFE-STORAGE`)
- Ne jamais appeler `wx.getStorageSync` directement sans wrapper : WeChat renvoie une chaîne vide `''` pour les clés absentes.
- Protéger les opérations contre le dépassement du quota local de 10 MB.
- Utiliser `storage.getOrSet(key, factory)` pour calculer et mettre en cache paresseusement les données lourdes.
- **Stockage Chiffré Data-at-Rest** : Pour toute donnée sensible (tokens JWT, MSISDN, pièces d'identité, transactions OM), utiliser obligatoirement `secureStorage` (chiffrement symétrique par flux avec empreinte matérielle `brand + model` et checksum anti-falsification FNV-1a conforme aux exigences CDP Sénégal et audits de sécurité Sonatel).

### 2.7 Logique Métier, Favoris & Actions Optimistes
- Traiter les dates sans décalage UTC (`new Date(`${dateStr}T00:00:00`)`).
- Favoris réactifs : Double cache (mémoire synchrone à 0 ms de latence + persistance locale asynchrone).
- **Actions Optimistes Transactionnelles** : Répondre instantanément à 0 ms de latence avec `executeOptimisticAction` et rollback automatique garanti (snapshot, annulation et haptique d'erreur) en cas d'échec API backend.

---

## 🔌 PÔLE 3 : CONSOMMATION API & GESTION DES DONNÉES

### 3.1 Workflow Strict d'Intégration API (SOP)
Exécuter impérativement dans cet ordre :
1. **Routing** : Ajouter l'endpoint dans `ENDPOINTS` de `utils/apis/`.
2. **Schema** : Définir la structure stricte dans `utils/mappers/` avec `json-sculpt`.
3. **Service** : Créer la méthode dans `BackendAPI` (`await authenticate()`, appel `this.#client`, sculpteur de données).
4. **UI** : Consommer dans la page à l'intérieur d'un bloc `try/catch/finally`.

### 3.2 Authentification OAuth2 avec Marge de Sécurité (Buffer 60s)
- Le token n'est considéré valide que si `Date.now() < (expiry - 60000)`. Cela élimine 100 % des erreurs 401 en cours de transit mobile.

### 3.3 Gestion des Erreurs Typées
- Utiliser `handleAppError(error)` pour mapper `NetworkError`, `AuthorizationError`, `ValidationError` vers des messages utilisateur bienveillants.

### 3.4 Data-Saver & Compression Côté Client
- Toute image capturée doit être compressée via `wx.compressImage` (qualité 75) avant upload afin d'économiser 95% du forfait data de l'utilisateur.
- Utiliser `NetworkMonitor` pour détecter les réseaux dégradés 2G/3G et adapter l'UI sans blocage.
- **Téléversement par Morceaux (Chunking 1 Mo)** : Pour les documents volumineux (> 1 Mo : CNI, passeport, relevé, contrat PDF), découper les fichiers en tranches binaires via `wx.getFileSystemManager().readFile` avec reprise automatique séquentielle après micro-coupures 3G/4G (`uploadFileInChunks`), évitant de renvoyer le fichier depuis 0 Ko.

### 3.5 Résilience Hors-Ligne & Outbox Pattern (Offline-First)
- File d'attente FIFO persistante dans `wxStorage` pour toutes les actions non-monétaires (formulaires, favoris, signalements).
- Clé d'idempotence unique par action (`X-Idempotency-Key`) pour éliminer tout risque de doublon au niveau backend.
- Rejeu automatique déclenché sur `wx.onNetworkStatusChange` dès le rétablissement de la 4G/Wi-Fi.
- *Référentiel détaillé : [docs/DOC_OFFLINE_FIRST_ET_OUTBOX_QUEUE.md](docs/DOC_OFFLINE_FIRST_ET_OUTBOX_QUEUE.md).*

### 3.6 Flux Temps Réel & WebSockets Résilients
- Ne jamais utiliser `wx.connectSocket` brut sans orchestrateur : les proxies coupent les connexions au bout de 60s et les micro-coupures 4G font perdre des messages.
- Utiliser `webSocketService` avec détection de vie Heartbeat Ping/Pong (30s), reconnexion exponentielle progressive (1s à 16s) et file d'attente sortante tampon (Outbox buffer).

### 3.7 Formulaires Dynamiques Pilotés par Schéma JSON (Server-Driven UI)
- Adapter et orchestrer les formulaires complexes (KYC, passagers, options) sans recompiler le mini-programme via `validateFormSchema` (`dynamicFormEngine.js`).
- Prise en charge universelle des types `text`, `phone`, `number`, `date`, `select`, `switch` avec contrôle déclaratif des regex et bornes.

---

## ⚙️ PÔLE 4 : INTÉGRATION HÔTE MAX IT, PAIEMENT & SÉCURITÉ

### 4.1 Façade Officielle `@sonatel-os/maxit-mini-sdk`
- Privilégier `miniSDK` pour l'identité (`miniSDK.user()`), le login (`miniSDK.login()`), le paiement et les contacts.
- Activer `simulate: true` sous WeChat DevTools pour tester les fixtures sans terminal physique.

### 4.2 Bouclier Anti-Double Débit Orange Money
- Dès que le plugin natif confirme le débit, sceller immédiatement `this._confirmedTxnid = txnid`.
- En cas de coupure réseau 4G pendant la confirmation backend, le bouton "Réessayer" court-circuite complètement le débit bancaire (0 franc prélevé en plus).
- Utiliser le Smart Polling à 3 essais avec backoff progressif (0s, 2s, 4s).
- Si `err.uncertain === true`, NE JAMAIS redemander de payer immédiatement.
- **Résolution Post-Paiement Tri-Statut** : Isoler strictement les 3 états (`confirmed`, `failed`, `unknown`). En cas d'état incertain (`unknown`), ne jamais afficher d'écran d'échec : conserver l'`attemptId` unique et proposer un bouton "Vérifier le statut" idempotent.

### 4.3 Sécurité des Écrans Sensibles
- Verrouiller la capture d'écran sur les billets QR via `miniSDK.screen.protect(true)`.
- **Règle vitale** : Toujours appeler `miniSDK.screen.protect(false)` dans `onHide()` et `onUnload()`.

### 4.4 Homologation & Conformité CDP Sénégal
- Masquage obligatoire des numéros MSISDN (`77 *** ** 12`) sur tout affichage ou log client (`maskMsisdn`).
- Purge systématique des tokens et identifiants sensibles lors de la déconnexion (`clearSessionSafe`).
- Déclaration stricte des domaines réseaux en HTTPS (TLS 1.2+) sur la Console TCMPP avant mise en production.

---

## 🛠️ PÔLE 5 : COMPILATEUR TCMPP & QUALITÉ D'ÉQUIPE

### 5.1 Pièges Fatals de Compilation
- **Zéro BOM UTF-8** : Tout fichier doit être sauvegardé en UTF-8 sans BOM (`\uFEFF`) sous peine de crash syntaxique.
- **Zéro @font-face local** : Ne jamais charger de `.ttf` locaux dans les WXSS (erreur 404 avec `-do-not-use-local-path-`).
- **Guards dans onLoad** : Valider tout paramètre requis dès l'entrée avec toast d'alerte et retour automatique.
- **Plafond des 2 Mo & Sous-Paquets** : Le paquet principal ne doit jamais dépasser 2 Mo. Tout parcours riche doit être découpé en sous-paquet (`subpackages/`) avec préchargement silencieux `preloadRule` dans `app.json`.
- **Bootstrapper de Sous-Paquet (Deep Links & QR Codes)** : Sécuriser les accès directs aux sous-paquets avec `createSubpackagePage` / `ensureAppReady` pour empêcher l'exécution de la page avant la fin du `onLaunch` d'app.js.
- **Matrice Anti-Panique des 30 Erreurs** : Résolution en 60s des erreurs réseau, domaine, double débit OM et saturation de pile. Voir [docs/DOC_MATRICE_ERREURS_PROD_TCMPP.md](docs/DOC_MATRICE_ERREURS_PROD_TCMPP.md).

### 5.2 Collaboration Multi-Développeurs (Zéro Conflit Git)
- Chaque développeur est propriétaire d'un sous-dossier exclusif.
- Les fichiers partagés (`app.js`, `app.wxss`, `utils/`) ne sont modifiés qu'avec l'accord explicite du Tech Lead.

### 5.3 Outillage & Automatisation CLI
- **`node scripts/skill-doctor.js`** : Valide l'intégrité globale du skill (détection de BOM UTF-8 `\uFEFF`, validation JSON, vérification de l'absence de nesting SCSS en WXSS, exhaustivité des déclencheurs IA).
- **`node scripts/bundle-doctor.js [dossier]` (`npm run analyze`)** : Analyseur statique de performance et bundle (plafond strict des 2 Mo par sous-paquet, détection d'assets locaux > 100 Ko, détection de fuites mémoire et boucles bloquantes). Voir [docs/DOC_AUDIT_PERFORMANCE_ET_BUNDLE.md](docs/DOC_AUDIT_PERFORMANCE_ET_BUNDLE.md).
- **`node scripts/create-page.js <dossier> [--subpackage <nom>] [--with-api]`** : Échafaude immédiatement les 4 fichiers d'une nouvelle page (`.js`, `.wxml`, `.wxss`, `.json`) avec machine à états `uiState`, Safe Area iPhone, classes `hover-class` Apple Press, calcul dynamique des chemins relatifs et câblage optionnel `backendAPI`.
- **`node scripts/create-component.js <dossier> [--ux]`** : Échafaude les 4 fichiers d'un composant (`Component()`, lifetimes strictes, `triggerEvent`, BEM, Safe Areas) en mode présentation ou UX skeleton shimmer.
- **`node scripts/create-api.js <domaine>`** : Échafaude le service API (`utils/apis/<domaine>.api.js`) et son mappeur `json-sculpt` (`utils/mappers/<domaine>.js`) avec endpoints, méthodes CRUD et gestion d'erreurs typées.
- **`node scripts/test-page-harness.js` (`npm run test:harness`)** : Émulateur headless en mémoire pour tester les transitions de machine à états `uiState` (loading -> success -> error) et le nettoyage mémoire de `onUnload()` sans ouvrir WeChat DevTools. Voir [docs/DOC_TESTING_HEADLESS_PAGE_ET_UISTATE.md](docs/DOC_TESTING_HEADLESS_PAGE_ET_UISTATE.md).
- **Snippets IDE VSCode & Cursor** : Auto-complétion instantanée (`.vscode/wechat-pmt.code-snippets`) pour insérer en 1 clic les templates `pmt-page-js`, `pmt-om-pill`, `pmt-i18n-wxs`, `pmt-outbox`, `pmt-throttle-scroll`, `pmt-chunk-upload`, `pmt-secure-storage`, `pmt-websocket`, `pmt-optimistic-action`, `pmt-subpackage-guard`, `pmt-announce-a11y`, `pmt-dynamic-form`, `pmt-wait-paint`, `pmt-stepper`, `pmt-tri-state`, `pmt-airline-logo`, `pmt-baggage-allowance`, `pmt-ticket-export` et `pmt-defensive-reader`.
- **Showcase Playground (`playground/`)** : Mini-programme autonome prêt à être importé dans WeChat DevTools (`touristappid`) pour tester en direct tous les composants ODS Sonatel, Solde OM, i18n Wolof et Outbox hors-ligne.
- **`npm test` / `npm run doctor`** : Automatise l'audit de conformité (zéro BOM UTF-8, syntaxe JSON, WXSS, déclencheurs IA, générateurs, bundle doctor, headless test harness) exécuté par la CI GitHub Actions.

---

## ✈️ PÔLE 6 : TUNNELS DE RÉSERVATION, BILLETTERIE & RENDU HAUTE PERFORMANCE

### 6.1 Générateur de Billet/Facture PDF Vectoriel 0 Dépendance
- Génération binaire directe `%PDF-1.4` avec table `xref` calculée en pur JavaScript (`serializePdfObjects`).
- Zéro dépendance npm (`jspdf`, `pdfkit` interdits pour respecter la limite des 2 Mo).
- Sauvegarde locale via `wx.getFileSystemManager().writeFile` et ouverture native `wx.openDocument({ showMenu: true })`.

### 6.2 Plan de Sièges Interactif & Encodage GDS 15 Champs
- Affectation explicite par voyageur et par tronçon de vol / bus.
- Exclusion obligatoire des nourrissons sur les genoux (`INL` / Lap Infants).
- Sérialisation au format GDS 15 champs : `départUnix-origine-destination-compagnie-numéroVol-indexVoyageur-siège-payant-total-base-taxe-devise-paysPOS-typeSiège-0`.

### 6.3 Rendu par Lots Anti-Freeze IPC (Batch Rendering 20 Cartes)
- Découpage des gros volumes de recherche (100 à 300 résultats) en tranches de 20 cartes injectées par chemins d'index (`displayedFlights[0]`).
- Attente du callback de confirmation `setData` avant d'injecter la tranche suivante pour garantir une fluidité constante à 60 FPS.

### 6.4 Décomposition Tarifaire Certifiée Multi-Lignes
- Absence de taxe (`null` / `undefined`) traitée comme un état d'attente, jamais comme 0 FCFA.
- Bouclier anti-mismatch de devises (interdiction d'additionner des monnaies distinctes).
- Prévention contre la sur-multiplication des taxes de groupe déjà agrégées.

### 6.5 Résolveur de Logos & Transporteurs Résilient (`airlineLogo.js`)
- Mappage prioritaire vers les assets locaux (`HC`, `HF`, `KP`, `R2`, `AF`, `SS`) pour un affichage instantané à 0 ms et 0 data réseau.
- Tolérance aux variations orthographiques et accents via normalisation Unicode NFD.
- Fallback automatique en initiales SVG/CSS lors des erreurs réseau via `binderror="onAirlineLogoError"`.
- Blocage strict des protocoles HTTP non chiffrés.

### 6.6 Composants Déclaratifs à Nœud Virtuel (`virtualHost: true`)
- Suppression de l'enveloppe DOM intermédiaire avec `options: { virtualHost: true }` sur les composants de présentation pour ne pas casser les layouts `flex` et `grid` parents.
- Modèle de franchise bagages et règles tarifaires 100% piloté par API sans mock statique trompeur.
- Déploiement accordéon fluide à 60 FPS basé sur `max-height` dynamique et accélération matérielle CSS.

### 6.7 Lecteur Défensif de Schémas JSON Opaques & Réconciliation d'Arrondis (`defensiveReader.js`)
- Exploration multipath sécurisée sans crash `TypeError` via `pickPath(source, paths)`.
- Parsing universel des montants monétaires (`toOptionalAmount`) supportant les espaces insécables (`\u00a0\u202f`), virgules et points.
- Réconciliation des arrondis de centimes (`reconcileRoundedLines`) pour aligner au centime près les sous-totaux passagers avec le montant débité Orange Money.

### 6.8 Export de Reçu / Billet Client Canvas 2D avec Timeout Guard (`ticketExporter.js`)
- Rendu graphique et conversion PNG/JPG en local sur le smartphone via WeChat Canvas 2D (`exportCanvasToImage`).
- Protection contre les freezes natifs avec `withTicketTimeout` (10s max).
- Pagination dynamique (`paginateTicketModel`) prévenant les dépassements de mémoire GPU (anti-OOM).
- Enregistrement dans l'album photo (`saveTicketToPhotosAlbum`) avec détection `auth deny` et guidage vers `wx.openSetting`.
- *Référentiel détaillé : [docs/DOC_TUNNELS_METIERS_ET_BILLETTERIE_AVANCEE.md](docs/DOC_TUNNELS_METIERS_ET_BILLETTERIE_AVANCEE.md).*

### 6.9 Pont Hybride Support Client WhatsApp & Modale Anti-Black-Screen (`whatsappBridge.js`)
- **Élimination de l'écran noir DevTools :** Bannir `wx.previewImage({ urls: ['/assets/...'] })` pour les assets locaux dans le simulateur PC. Afficher une modale in-app (`<whatsapp-modal>` ou `<osn-modal>`) centrée.
- **Détection Appui Long Mobile (`show-menu-by-longpress`) :** Activer l'attribut natif WeChat sur la balise `<image>` pour permettre à l'utilisateur de scanner le QR code directement depuis l'écran de son smartphone sans second appareil.
- **Support Universel Liens Courts & Messages Pré-remplis :** Construction sécurisée d'URLs WhatsApp avec liens courts Business (`wa.me/message/...`) ou paramètres encodés (`wa.me/<phone>?text=...`).
- **ActionSheet Multi-Canaux Résilient :** Menu natif proposant l'affichage du QR Code, la copie du lien direct (avec vibration haptique et confirmation toast) et l'appel vocal direct (`wx.makePhoneCall`).

### 6.10 Découpage Modulaire des Tunnels Complexes & Helpers de Page (Pattern Kalidou)
- **Bannir les fonctions monolithiques > 35 lignes :** Ne jamais mélanger préparation, calcul, appel SDK, confirmation et gestion d'erreur dans une seule fonction géante.
- **Découpage strict en 6 sous-méthodes atomiques :**
  1. `handlePayAction()` : Orchestrateur pur avec verrou `_isPaying` et gestion `try / catch / finally`.
  2. `preparePaymentContext(offer)` : Validation et devis/initiation de la transaction backend.
  3. `getPaymentAmount(offer)` : Calcul pur sans effets de bord.
  4. `processNativePayment(context)` : Déclenchement du paiement via le SDK officiel (`miniSDK.merchantPay`).
  5. `openSimulatedPayment(context)` : Fallback développeur pour le simulateur WeChat DevTools.
  6. `confirmPaymentReceipt(payment)` : Confirmation backend avec marquage `error.uncertain = true` en cas de timeout post-débit (bouclier anti-double débit).
  7. `handlePaymentFailure(error)` : Gestion centralisée des annulations et échecs avec dialogue d'information bienveillant.
- **Helpers transverses centralisés (`utils/helpers/pageHelper.js`) :**
  - `setPageTabBarHidden(page, hidden, eventBus)` : Contrôle de la visibilité de la Custom TabBar sans scintillement.
  - `setScreenProtection(sdk, enabled)` : Activation/désactivation de la protection anti-capture d'écran (`sdk.screen.protect`) avec désactivation obligatoire dans `onHide` et `onUnload`.
  - `retryAsync(fn, options)` : Relance avec backoff exponentiel pour les opérations post-paiement.
- *Référentiel détaillé : [docs/DOC_RECETTES_COPIER_COLLER.md](docs/DOC_RECETTES_COPIER_COLLER.md#recette-74).*


