> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📱 Manuel Exhaustif de A à Z : SDK Officiel Max It (`@sonatel-os/maxit-mini-sdk`)

> **Référentiel Officiel Sonatel Shared Foundations :** Package `npm: @sonatel-os/maxit-mini-sdk` (v0.1.5).  
> Ce document est le **guide maître universel** pour intégrer l'application hôte Max It (Orange Sonatel). Que vous soyez développeur débutant, lead tech ou agent IA, ce manuel détaille **chaque méthode, chaque configuration et les 10 cas de terrain concrets** avec des explications simples, du code prêt pour la production et les pièges mortels à éviter.

---

## 📑 Table des Matières

1. [💡 Pourquoi ce SDK Existe : Les 6 Pièges Mortels de l'Hôte Max It](#-1-pourquoi-ce-sdk-existe--les-6-pièges-mortels-de-lhôte-max-it)
2. [🌍 Architecture Globale & Schéma de Fonctionnement](#-2-architecture-globale--schéma-de-fonctionnement)
3. [📦 Installation & Déploiement Zéro-Dépendance](#-3-installation--déploiement-zéro-dépendance)
4. [⚙️ Configuration Globale dans `app.js` (`miniSDK.configure`)](#-4-configuration-globale-dans-appjs-minisdkconfigure)
5. [🎯 Les 10 Cas d'Usage de Terrain de A à Z](#-5-les-10-cas-dusage-de-terrain-de-a-à-z)
   - [Cas 1 : Identification Sans Écran de Login (`miniSDK.user()`)](#cas-1--identification-sans-écran-de-login-minisdkuser)
   - [Cas 2 : Échange de Jeton d'Authentification Backend (`miniSDK.login()`)](#cas-2--échange-de-jeton-dauthentification-backend-minisdklogin)
   - [Cas 3 : Paiement Marchand Orange Money Standard (`miniSDK.pay()`)](#cas-3--paiement-marchand-orange-money-standard-minisdkpay)
   - [Cas 4 : Résolution du Doublon sous 15 Minutes (`handlers.onIdentical`)](#cas-4--résolution-du-doublon-sous-15-minutes-handlersonidentical)
   - [Cas 5 : Coupure Réseau & Statut Incertain (`err.uncertain === true`)](#cas-5--coupure-réseau--statut-incertain-erruncertain--true)
   - [Cas 6 : Sélection dans le Répertoire Téléphonique (`miniSDK.contacts()`)](#cas-6--sélection-dans-le-répertoire-téléphonique-minisdkcontacts)
   - [Cas 7 : Accueil & Routage par Deep Link Sans Boucle (`miniSDK.deeplink()`)](#cas-7--accueil--routage-par-deep-link-sans-boucle-minisdkdeeplink)
   - [Cas 8 : Scanner QR Code Sécurisé Anti-Fraude (`miniSDK.scan()`)](#cas-8--scanner-qr-code-sécurisé-anti-fraude-minisdkscan)
   - [Cas 9 : Bouclier Anti-Capture d'Écran (`miniSDK.screen.protect()`)](#cas-9--bouclier-anti-capture-décran-minisdkscreenprotect)
   - [Cas 10 : Développement Hors-Ligne dans DevTools (`simulate: true`)](#cas-10--développement-hors-ligne-dans-devtools-simulate-true)
6. [🚨 Matrice Exhaustive des Erreurs `HostError`](#-6-matrice-exhaustive-des-erreurs-hosterror)
7. [🧰 Boîte à Outils Métier (`miniSDK.helpers` & `supports`)](#-7-boîte-à-outils-métier-minisdkhelpers--supports)
8. [🏗️ Intégration dans l'Architecture Complète PMT](#-8-intégration-dans-larchitecture-complète-pmt)
9. [❓ FAQ & Bonnes Pratiques pour Débutants](#-9-faq--bonnes-pratiques-pour-débutants)

---

## 💡 1. Pourquoi ce SDK Existe : Les 6 Pièges Mortels de l'Hôte Max It

Historiquement, un mini-programme communique avec l'application hôte Max It (Orange Sonatel) via la commande brute propriétaire `wx.invokeNativePlugin`. Cependant, ce canal natif est truffé de pièges techniques qui ont causé de multiples pannes en production dans les premières applications :

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    LES 6 PIÈGES HISTORIQUES DU CANAL BRUT                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 1. Le faux succès { result: 'fail' }                                            │
│    L'hôte répond parfois à un échec dans le callback success au lieu de fail !  │
│                                                                                 │
│ 2. Le verrouillage 15 min sur transaction identique                             │
│    Un 2e paiement identique est bloqué. Pour forcer la relance, l'hôte exige    │
│    caction: '1' en CHAÎNE DE CARACTÈRES. Un nombre 1 fait planter le serveur !  │
│                                                                                 │
│ 3. Le crash de contactList avec data                                            │
│    Passer un champ { data: ... } fait renvoyer une liste vide par l'hôte.       │
│                                                                                 │
│ 4. Le MSISDN pollué et hétérogène                                               │
│    Le numéro arrive sous toutes les formes : +221 77..., 00221..., espaces...    │
│                                                                                 │
│ 5. Le block_screen persistant et destructeur d'UX                               │
│    La protection d'écran est globale à l'hôte. Si votre page s'en va sans la    │
│    désactiver, TOUTE L'APPLICATION MAX IT RESTE NOIRE pour le client !          │
│                                                                                 │
│ 6. Les Deep Links répétés en boucle infinie                                     │
│    onShow reçoit les mêmes arguments à chaque retour de premier plan,           │
│    provoquant des navigations et commandes en boucle si non dédoublonnées.      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

**La mission du SDK `@sonatel-os/maxit-mini-sdk` :** Encapsuler une bonne fois pour toutes ces spécificités dans un objet JavaScript propre et gelé (`miniSDK`), avec des méthodes qui se lisent comme des phrases anglaises simples, zéro expression régulière manuelle et des erreurs typées fiables.

---

## 🌍 2. Architecture Globale & Schéma de Fonctionnement

```
   ┌────────────────────────────────────────────────────────────┐
   │            Votre Mini-Programme (ATS / Commerce)           │
   │           import { miniSDK } from './sdk/index.js'         │
   └─────────────────────────────┬──────────────────────────────┘
                                 │
     Méthodes claires :          │  Erreurs typées :
     user · login · pay          │  HostError (UNAVAILABLE,
     contacts · deeplink         │  REFUSED, TIMEOUT...)
     screen · scan               │  Drapeau err.uncertain
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │         SDK Officiel Sonatel (@sonatel-os/maxit-mini-sdk)  │
   │  - Détection automatique de l'hôte                         │
   │  - Réessai automatique de warm-up (1 seconde au boot)      │
   │  - Gestionnaire de dialogue doublon (caction: '1')         │
   │  - Normalisation 9 chiffres des numéros sénégalais         │
   │  - Fixtures de simulation pour WeChat DevTools             │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ wx.invokeNativePlugin blindé
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │           Application Hôte Max It (Orange Sonatel)         │
   │   userInfos · login · merchantPay · contactList · block    │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ Saisie Code PIN OM
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │              Cœur Bancaire Orange Money (OM)               │
   └────────────────────────────────────────────────────────────┘
```

---

## 📦 3. Installation & Déploiement Zéro-Dépendance

Dans l'écosystème TCMPP (Tencent Cloud Mini Program Platform) de Max It, le dossier `node_modules` ne doit **jamais** être empaqueté dans les 2 Mo du bundle de production. Le SDK Sonatel a été spécialement conçu pour respecter cette contrainte :

### Commande d'Installation / Mise à Jour

```bash
# Dans le terminal de votre projet de mini-programme :
npx @sonatel-os/maxit-mini-sdk update
```

### Ce qui est généré
Cette commande télécharge et installe **un fichier unique et autonome** dans votre projet :
* `sdk/index.js` (ou `utils/sdk/index.js` si spécifié)
* `sdk/manifest.json` (contenant le hash SHA-256 qui garantit l'intégrité officielle du binaire)

Aucune étape de compilation (Webpack, Vite) n'est requise. TCMPP compresse ce fichier directement avec vos pages.

### Options CLI Utiles

```bash
# Installer dans un dossier spécifique
npx @sonatel-os/maxit-mini-sdk update --dir utils/sdk

# Installer une version précise
npx @sonatel-os/maxit-mini-sdk update 0.1.5

# Vérifier si une mise à jour existe (renvoie code 2 si obsolète)
npx @sonatel-os/maxit-mini-sdk check

# Afficher la version actuellement installée
npx @sonatel-os/maxit-mini-sdk version
```

---

## ⚙️ 4. Configuration Globale dans `app.js` (`miniSDK.configure`)

Appelez `miniSDK.configure()` **une seule fois** au démarrage de votre application dans `app.js` (`onLaunch`). Cet appel est partiel : vous ne passez que les paramètres que vous souhaitez surcharger.

### Code Recommandé pour la Production et le Développement

```javascript
// app.js
import { miniSDK } from './sdk/index.js';

App({
  onLaunch(options) {
    // Détection robuste du mode DevTools
    const isDev = typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop';

    miniSDK.configure({
      // Active les fixtures fictives sur PC dans DevTools (car l'hôte Max It n'y existe pas)
      simulate: isDev,

      // Délai maximal d'attente d'une réponse de l'hôte (30 secondes par défaut)
      timeoutMs: 30000,

      // Logger personnalisé pour tracer les échanges SDK en développement
      log: (level, api, message, ctx) => {
        if (isDev) {
          console.log(`[SDK:${api}] ${message}`, ctx || '');
        }
      },

      // Dialogue personnalisé pour confirmer une transaction identique
      // (Par défaut : utilise la modale native wx.showModal)
      confirm: async (message) => {
        const res = await wx.showModal({
          title: 'Transaction existante',
          content: message,
          confirmText: 'Payer quand même',
          cancelText: 'Annuler',
          confirmColor: '#F16E00' // Orange Sonatel
        });
        return res.confirm;
      }
    });
  }
});
```

### Tableau Exhaustif des Options de Configuration

| Option | Type | Valeur par Défaut | Rôle & Comportement |
|---|---|---|---|
| `simulate` | `boolean` | `false` | Si `true`, répond via des fixtures simulées au lieu d'appeler `wx.invokeNativePlugin`. Indispensable pour travailler sur PC dans WeChat DevTools. |
| `fixtures` | `object` | `DEFAULT_FIXTURES` | Permet de surcharger les réponses fictives pour vos tests (ex: forcer un numéro ou tester un doublon). |
| `log` | `function` | `null` | Fonction de callback `(level, api, message, ctx) => void`. Le SDK reste silencieux tant que vous ne fournissez pas de logger. Une erreur dans le logger ne bloque jamais le SDK. |
| `confirm` | `function` | Modal hôte native | Fonction `(message) => Promise<boolean>` appelée lorsque l'hôte signale une transaction identique. Si elle résout `true`, le SDK retente avec `caction: '1'`. |
| `timeoutMs` | `number` | `30000` (30s) | Délai après lequel l'appel est rejeté avec l'erreur `TIMEOUT` (avec le drapeau `err.uncertain = true`). |

### Tableau Exhaustif des Fixtures par Défaut (`DEFAULT_FIXTURES`)

Lorsque `simulate: true` est actif, le SDK utilise les données suivantes sans nécessiter de téléphone physique :

| Clé de Fixture | Donnée Simulée par Défaut | Description |
|---|---|---|
| `user` | `{ msisdn: '770000001', firstName: 'Dev', lastName: 'User' }` | Identité renvoyée par `miniSDK.user()`. |
| `loginCode` | `'DEV-CODE-0001'` | Code unique renvoyé par `miniSDK.login()`. |
| `txnid` | `() => 'MP-DEV-' + Date.now()` | Générateur d'identifiant de transaction pour `miniSDK.pay()`. |
| `identicalOnce` | `false` | Si vous le passez à `true`, le prochain `miniSDK.pay()` lèvera le dialogue de doublon une fois. |
| `contacts` | 3 contacts sénégalais d'exemple | Liste renvoyée par `miniSDK.contacts()`. |
| `deeplink` | `null` | Paramètres simulés pour `miniSDK.deeplink()`. |
| `scanCode` | `'DEV-SCAN-0001'` | Valeur de QR code renvoyée par `miniSDK.scan()`. |
| `latencyMs` | `300` | Latence artificielle en millisecondes pour reproduire le ressenti réel du réseau. |

---

## 🎯 5. Les 10 Cas d'Usage de Terrain de A à Z

---

### Cas 1 : Identification Sans Écran de Login (`miniSDK.user()`)

#### 🎯 Contexte Métier
Dans un mini-programme hébergé dans Max It, **l'utilisateur est déjà connecté à son compte Orange Money sur son téléphone**. Vous ne devez **JAMAIS** lui demander de saisir son numéro de téléphone ou un mot de passe. Dès l'ouverture de l'application ou sur la page de profil, récupérez son identité officielle directement.

#### 💻 Code Prêt à l'Emploi
```javascript
// pages/profile/index.js
import { miniSDK } from '../../sdk/index.js';

Page({
  data: {
    userMsisdn: '',
    displayName: '',
    isLoading: true
  },

  async onLoad() {
    try {
      // Récupère l'identité avec warm-up automatique (4 tentatives)
      const user = await miniSDK.user();

      this.setData({
        userMsisdn: user.msisdn, // Format garanti : 9 chiffres (ex: "771234567")
        displayName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client Max It',
        isLoading: false
      });
    } catch (err) {
      this.setData({ isLoading: false });
      if (err.code === miniSDK.ERROR_CODES.UNAVAILABLE) {
        // L'app n'est pas ouverte dans Max It (ouvert dans un navigateur standard)
        wx.showModal({
          title: 'Application Max It requise',
          content: 'Veuillez ouvrir ce service directement depuis votre application Max It.',
          showCancel: false
        });
      } else {
        wx.showToast({ title: 'Erreur profil : ' + err.message, icon: 'none' });
      }
    }
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
Le plugin natif hôte met environ 1 seconde à s'initialiser au lancement de l'application. `miniSDK.user()` effectue automatiquement jusqu'à **4 tentatives avec backoff progressif**. De plus, le numéro brut (qui peut contenir `+221`, des espaces ou des tirets) est automatiquement assaini en une chaîne pure de 9 chiffres sénégalais.

#### ⚠️ Le Piège Mortel Débutant
Ne tentez jamais d'inventer un faux numéro de téléphone de secours (ex: `'770000000'`) si `miniSDK.user()` échoue en production. Si l'hôte ne renvoie pas d'utilisateur, rejetez l'accès en invitant à ouvrir l'application dans Max It.

---

### Cas 2 : Échange de Jeton d'Authentification Backend (`miniSDK.login()`)

#### 🎯 Contexte Métier
Votre serveur d'entreprise (API ATS / Agence) a besoin de vérifier que la personne qui navigue est bien la détentrice légitime de la ligne Sonatel. Pour respecter les règles de sécurité bancaire, **aucun secret d'application ne doit transiter dans le mini-programme**. Vous demandez un code à usage unique à l'hôte Max It, et votre backend l'échange contre un jeton de session JWT.

#### 💻 Code Prêt à l'Emploi
```javascript
// utils/auth.js
import { miniSDK } from '../sdk/index.js';
import { BackendAPI } from './api-client.js';

export async function synchroniserSessionBackend() {
  try {
    // 1. Obtenir un code temporaire à usage unique auprès de l'hôte Max It
    const oneTimeCode = await miniSDK.login();

    // 2. Transmettre ce code à votre propre serveur avec votre identifiant d'application
    const response = await BackendAPI.post('/auth/session', {
      code: oneTimeCode,
      appId: 'MP-ATS-SN-2026'
    });

    // 3. Sauvegarder le token de session JWT renvoyé par votre serveur
    wx.setStorageSync('AUTH_TOKEN', response.token);
    return response.token;
  } catch (err) {
    console.error('Échec de la synchronisation de session :', err);
    throw err;
  }
}
```

#### ⚙️ Ce qui se passe en coulisses
Le SDK appelle l'action native `login` de Max It. L'hôte génère un jeton éphémère scellé cryptographiquement et lié au compte de l'utilisateur. Ce jeton a une durée de vie courte (~2 minutes). Votre backend est le seul habilité à contacter le serveur d'authentification Sonatel pour valider ce code.

#### ⚠️ Le Piège Mortel Débutant
Ne stockez jamais de `Client Secret` ou de clé privée d'API dans votre code JavaScript frontend. Seul le code éphémère fourni par `miniSDK.login()` doit voyager depuis le client.

---

### Cas 3 : Paiement Marchand Orange Money Standard (`miniSDK.pay()`)

#### 🎯 Contexte Métier
Sur votre page de commande ou de réservation (billet de transport, panier e-commerce, paiement de facture), l'utilisateur clique sur le bouton "Payer avec Orange Money". L'hôte Max It doit ouvrir son volet sécurisé natif pour demander à l'utilisateur de valider le montant et saisir son code secret PIN.

#### 💻 Code Prêt à l'Emploi
```javascript
// pages/checkout/index.js
import { miniSDK } from '../../sdk/index.js';

Page({
  data: {
    isSubmitting: false
  },

  async executerPaiement() {
    if (this.data.isSubmitting) return; // Bouclier anti-double clic
    this.setData({ isSubmitting: true });

    try {
      const { txnid, confirmedIdentical } = await miniSDK.pay({
        amount: 25000,                // Montant entier en Francs CFA (XOF)
        receiver: 467652,             // Numéro de Code Marchand officiel (numérique)
        receiverName: 'ATS Express',  // Nom affiché en haut du volet de confirmation
        orderId: 'CMD-2026-8812',     // Référence unique de votre commande
        description: 'Billet Dakar - Touba (VIP)' // Description affichée au client
      });

      // ✅ Le paiement est validé avec succès par Orange Money !
      console.log('Transaction OM réussie :', txnid);

      wx.navigateTo({
        url: `/pages/success/index?txnid=${encodeURIComponent(txnid)}&orderId=CMD-2026-8812`
      });

    } catch (err) {
      if (err.uncertain) {
        // ⚠️ CRITIQUE : Coupure réseau ou timeout (voir Cas 5)
        this.gererPaiementIncertain('CMD-2026-8812');
      } else if (err.code === miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: 'Paiement abandonné', icon: 'none' });
      } else {
        // Affiche le message français explicite retourné par le SDK
        wx.showToast({ title: err.message, icon: 'none', duration: 4000 });
      }
    } finally {
      this.setData({ isSubmitting: false });
    }
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
Le SDK vérifie la présence de tous les arguments obligatoires (`amount`, `receiver`, `receiverName`, `orderId`). Il appelle l'action native `merchantPay` de l'hôte Max It. L'application hôte suspend l'affichage du mini-programme et présente son interface native de paiement bancaire sécurisée. Dès la saisie du code PIN, l'hôte renvoie le `txnid` (identifiant de transaction Orange Money) que le SDK normalise automatiquement.

#### ⚠️ Le Piège Mortel Débutant
Ne passez jamais un montant sous forme de nombre à virgule (ex: `25000.50`) ou un montant négatif. En zone UEMOA, le Franc CFA (XOF) est une monnaie sans centimes : passez toujours un entier positif.

---

### Cas 4 : Résolution du Doublon sous 15 Minutes (`handlers.onIdentical`)

#### 🎯 Contexte Métier
Si un client paie un billet de 15 000 FCFA, puis tente de refaire exactement le même paiement (même montant et même compte marchand) dans les 15 minutes qui suivent, les systèmes Orange Money suspectent une fausse manipulation et **bloquent la transaction par défaut**. Pour débloquer ce paiement, l'hôte exige une confirmation explicite avec le paramètre `caction: '1'`.

#### 💻 Code Prêt à l'Emploi
```javascript
// Déclenchement du paiement avec gestion personnalisée du doublon
const { txnid, confirmedIdentical } = await miniSDK.pay({
  amount: 15000,
  receiver: 467652,
  receiverName: 'ATS Billetterie',
  orderId: 'CMD-DOUBLON-01',
  description: 'Second pass voyage'
}, {
  // Callback invoqué UNIQUEMENT si l'hôte signale une transaction identique récente
  onIdentical: async (message) => {
    const dialogRes = await wx.showModal({
      title: 'Paiement similaire détecté',
      content: message || 'Une transaction identique a déjà été enregistrée il y a moins de 15 minutes. Souhaitez-vous vraiment régler une seconde fois ?',
      confirmText: 'Payer à nouveau',
      cancelText: 'Abandonner',
      confirmColor: '#F16E00'
    });

    // Renvoyer true relance la transaction avec caction: '1'
    // Renvoyer false lève une erreur HostError avec le code DECLINED
    return dialogRes.confirm;
  }
});

if (confirmedIdentical) {
  console.log('Ce paiement a été confirmé malgré l avertissement de doublon.');
}
```

#### ⚙️ Ce qui se passe en coulisses
Le SDK intercepte la réponse négative de l'hôte et extrait l'identifiant de transaction d'origine masqué. Si le gestionnaire `onIdentical` résout `true`, le SDK réexécute automatiquement l'appel natif en injectant le paramètre crucial `{ caction: '1' }`. **Attention :** ce paramètre doit impérativement être une chaîne de caractères `'1'`. Si un nombre `1` était envoyé, la vérification de type de l'API Sonatel échouerait. Le SDK s'assure que le type est parfait.

#### ⚠️ Le Piège Mortel Débutant
Sans ce SDK, 90% des développeurs ne savent pas comment contourner ce blocage et leurs clients se retrouvent bloqués pendant 15 minutes devant leur écran de caisse avec un message d'échec incompréhensible.

---

### Cas 5 : Coupure Réseau & Statut Incertain (`err.uncertain === true`)

#### 🎯 Contexte Métier
Le client saisit son code secret Orange Money dans une zone de mauvaise couverture (2G/3G instable). Le serveur Orange Money prélève les 10 000 FCFA sur le compte bancaire, mais au moment où la réponse revient vers le téléphone, la connexion coupe : un `TIMEOUT` se produit côté mini-programme.

> **RÈGLE BANCAIRE VITALE :**  
> Lorsque `err.uncertain === true`, **VOUS NE DEVEZ JAMAIS DIRE AU CLIENT "LE PAIEMENT A ÉCHOUÉ, VEUILLEZ RÉESSAYER DE PAYER"**.  
> Si le client clique à nouveau sur "Payer", il sera **débité deux fois** !

#### 💻 Code Prêt à l'Emploi (Modèle de Smart Polling de Vérification)
```javascript
// Méthode de résilience en cas de statut incertain
async function gererPaiementIncertain(orderId) {
  wx.showLoading({ title: 'Vérification Orange Money...', mask: true });

  let tentatives = 0;
  const maxTentatives = 5;
  const delais = [2000, 3000, 5000, 8000, 10000]; // Délais progressifs (ms)

  while (tentatives < maxTentatives) {
    await new Promise(resolve => setTimeout(resolve, delais[tentatives]));

    try {
      // Interroger VOTRE backend qui vérifie directement auprès de l'API Sonatel
      const verification = await BackendAPI.get(`/orders/${orderId}/payment-status`);

      if (verification.status === 'PAID') {
        wx.hideLoading();
        wx.redirectTo({
          url: `/pages/success/index?orderId=${orderId}&txnid=${verification.txnid}`
        });
        return;
      }

      if (verification.status === 'FAILED') {
        wx.hideLoading();
        wx.showModal({
          title: 'Paiement non débité',
          content: 'Le paiement n a pas pu aboutir. Aucun montant n a été débité.',
          showCancel: false
        });
        return;
      }
    } catch (e) {
      console.warn('Tentative de polling échouée :', e);
    }

    tentatives++;
  }

  // Si après 5 essais rien n'est certain : inviter à contacter le service client
  wx.hideLoading();
  wx.showModal({
    title: 'Paiement en cours de traitement',
    content: 'Votre compte Orange Money est peut-être débité. Veuillez vérifier vos SMS Orange Money avant de tenter un nouveau paiement.',
    showCancel: false
  });
}
```

#### ⚙️ Ce qui se passe en coulisses
Toute erreur dont le code est `TIMEOUT` ou `HOST_ERROR` positionne automatiquement le booléen `err.uncertain = true` dans l'objet `HostError`. Cela avertit immédiatement votre code applicatif que l'argent a potentiellement bougé.

#### ⚠️ Le Piège Mortel Débutant
Afficher un simple `wx.showToast({ title: 'Échec du paiement' })` lors d'un timeout est la première cause de réclamations au support client chez Orange Money. Traitez systématiquement le drapeau `err.uncertain`.

---

### Cas 6 : Sélection dans le Répertoire Téléphonique (`miniSDK.contacts()`)

#### 🎯 Contexte Métier
Sur une page de recharge de crédit, d'envoi de pass internet ou d'achat d'un billet pour un ami ou un membre de sa famille, proposez au client de piocher directement dans les contacts enregistrés sur son téléphone portable sans avoir à taper les 9 chiffres à la main.

#### 💻 Code Prêt à l'Emploi
```javascript
// pages/recharge/index.js
import { miniSDK } from '../../sdk/index.js';

Page({
  data: {
    selectedName: '',
    selectedMsisdn: ''
  },

  async choisirContact() {
    try {
      wx.showLoading({ title: 'Chargement des contacts...' });
      
      // Récupère la liste propre des contacts du téléphone
      const contacts = await miniSDK.contacts();
      wx.hideLoading();

      if (!contacts || contacts.length === 0) {
        wx.showToast({ title: 'Aucun contact trouvé', icon: 'none' });
        return;
      }

      // Exemple : Afficher les contacts dans une liste de sélection
      const noms = contacts.map(c => `${c.name} (${c.msisdn[0] || 'Sans numéro'})`);
      const res = await wx.showActionSheet({ itemList: noms.slice(0, 6) }); // 6 premiers

      const contactChoisi = contacts[res.tapIndex];
      this.setData({
        selectedName: contactChoisi.name,
        selectedMsisdn: contactChoisi.msisdn[0] // Numéro normalisé propre
      });

    } catch (err) {
      wx.hideLoading();
      if (err.code !== miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: 'Impossible d accéder aux contacts', icon: 'none' });
      }
    }
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
Historiquement, si vous appeliez `wx.invokeNativePlugin('contactList', { data: {} })`, l'hôte Max It renvoyait un tableau vide à cause de la présence du champ `data`. Le SDK n'envoie strictement rien dans la charge utile native, ce qui garantit la restitution fidèle du carnet d'adresses. De plus, chaque numéro de téléphone associé à un contact est normalisé au format 9 chiffres.

#### ⚠️ Le Piège Mortel Débutant
Ne tentez pas de formater les numéros vous-même avec des expressions régulières complexes : le SDK gère déjà les préfixes `+221`, `00221`, les espaces et les parenthèses.

---

### Cas 7 : Accueil & Routage par Deep Link Sans Boucle (`miniSDK.deeplink()`)

#### 🎯 Contexte Métier
Votre client reçoit un SMS promotionnel d'Orange ou un lien WhatsApp contenant une offre spéciale :  
`https://maxit.sn/app/mp-ats?extendData={"promo":"TABASKI2026","seat":"VIP"}`  
À l'ouverture du mini-programme, vous devez extraire ces paramètres pour afficher directement la bonne vue.

#### 💻 Code Prêt à l'Emploi
```javascript
// pages/index/index.js
import { miniSDK } from '../../sdk/index.js';

Page({
  async onShow() {
    // Récupère les paramètres d'ouverture actuels
    const launchOptions = wx.getEnterOptionsSync();

    // Décode les données complexes en garantissant une lecture UNIQUE
    const params = await miniSDK.deeplink({ launch: launchOptions });

    if (params && params.promo) {
      console.log('Code promo reçu via Deep Link :', params.promo);
      this.appliquerCodePromotionnel(params.promo);
    }
  },

  appliquerCodePromotionnel(code) {
    wx.showToast({ title: `Code ${code} activé !`, icon: 'success' });
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
L'hôte Max It transmet parfois ses paramètres dans `extendData`, parfois dans `referrerInfo.extraData`, et parfois dans la query standard sous forme de chaîne JSON encodée. Pire : `onShow` est rappelé à chaque fois que l'utilisateur minimise et rouvre l'application. `miniSDK.deeplink()` unifie toutes ces sources et **mémorise la lecture** pour ne jamais réappliquer la même action deux fois par inadvertance.

#### ⚠️ Le Piège Mortel Débutant
Sans déduplication, si le deep link effectue une redirection (`wx.navigateTo`), l'utilisateur se retrouve renvoyé de force sur la page de promotion à chaque fois qu'il revient sur l'application !

---

### Cas 8 : Scanner QR Code Sécurisé Anti-Fraude (`miniSDK.scan()`)

#### 🎯 Contexte Métier
Vous développez une application pour un contrôleur de bus ou un vérificateur de billets à l'entrée d'un événement. Pour lutter contre la fraude, le contrôleur doit **obligatoirement viser le billet physique avec l'appareil photo**. Il est strictement interdit d'importer une capture d'écran depuis la galerie de photos de l'appareil.

#### 💻 Code Prêt à l'Emploi
```javascript
// pages/controleur/scanner.js
import { miniSDK } from '../../sdk/index.js';

Page({
  async scannerBilletPhysique() {
    try {
      // Force l'utilisation de l'appareil photo uniquement (anti-fraude)
      const { code, albumAllowed } = await miniSDK.scan({ cameraOnly: true });

      console.log('Contenu du QR Code scanné :', code);
      console.log('L album photo était-il autorisé ?', albumAllowed); // false

      this.validerBilletSurBackend(code);

    } catch (err) {
      if (err.code !== miniSDK.ERROR_CODES.CANCELLED) {
        wx.showToast({ title: 'Erreur scanner : ' + err.message, icon: 'none' });
      }
    }
  },

  async validerBilletSurBackend(qrPayload) {
    wx.showLoading({ title: 'Contrôle en cours...' });
    // Appel de validation API...
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
Le SDK utilise la méthode native `wx.scanCode` en forçant `onlyFromCamera: true`. Si l'hôte Max It dispose de son propre scanner natif enrichi, le SDK délègue vers le plugin hôte de manière transparente.

#### ⚠️ Le Piège Mortel Débutant
Utiliser `wx.scanCode` sans spécifier `onlyFromCamera: true` permet à un voyageur mal intentionné d'emprunter le téléphone du contrôleur et de choisir une image de billet falsifiée enregistrée dans sa galerie.

---

### Cas 9 : Bouclier Anti-Capture d'Écran (`miniSDK.screen.protect()`)

#### 🎯 Contexte Métier
Votre page affiche un e-billet de transport muni d'un QR code dynamique ou un reçu de virement confidentiel. Pour empêcher la revente illicite de captures d'écran du billet sur WhatsApp, vous souhaitez bloquer les screenshots et les enregistrements vidéo de l'écran.

#### 💻 Code Prêt à l'Emploi
```javascript
// pages/ticket/display.js
import { miniSDK } from '../../sdk/index.js';

Page({
  async onShow() {
    // 🔒 1. Verrouiller les captures dès que l'écran du billet apparaît
    try {
      await miniSDK.screen.protect(true);
      console.log('Protection anti-capture activée.');
    } catch (err) {
      console.warn('Impossible de verrouiller la capture :', err);
    }
  },

  async onHide() {
    // ⚠️ 2. RÈGLE VITALE : Déverrouiller impérativement lorsque l'écran se masque !
    await this.desactiverProtection();
  },

  async onUnload() {
    // ⚠️ 3. RÈGLE VITALE : Déverrouiller impérativement lorsque la page est détruite !
    await this.desactiverProtection();
  },

  async desactiverProtection() {
    try {
      await miniSDK.screen.protect(false);
      console.log('Protection anti-capture désactivée.');
    } catch (err) {
      console.warn('Erreur déverrouillage écran :', err);
    }
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
Sur iOS et Android, l'hôte applique un filtre noir de sécurité système (`FLAG_SECURE` sur Android et masquage dans le switcher sur iOS).  
**ATTENTION PARTICULIÈRE :** Cette protection est appliquée au niveau de la fenêtre globale de l'application hôte Max It.

#### ⚠️ Le Piège Mortel Débutant
Si vous oubliez d'appeler `miniSDK.screen.protect(false)` dans `onHide()` et `onUnload()`, **l'ensemble de l'application Max It reste protégée par un écran noir** même lorsque le client revient sur son écran d'accueil bancaire ou consulte son solde ! Ne négligez jamais ces deux méthodes de cycle de vie.

---

### Cas 10 : Développement Hors-Ligne dans DevTools (`simulate: true`)

#### 🎯 Contexte Métier
Vous développez sur votre ordinateur de bureau dans WeChat DevTools. Dans cet environnement d'émulation PC, `wx.invokeNativePlugin` n'existe pas. Sans le SDK, chaque appel de paiement ou d'identité plante instantanément avec une erreur système. Le mode `simulate: true` vous permet de coder 100% de vos écrans sans avoir besoin de déployer sur un smartphone physique à chaque modification.

#### 💻 Code Prêt à l'Emploi
```javascript
// app.js (Configuration avancée des scénarios de test dans DevTools)
import { miniSDK } from './sdk/index.js';

App({
  onLaunch() {
    const isDev = typeof __wxConfig !== 'undefined' && __wxConfig.envVersion === 'develop';

    if (isDev) {
      miniSDK.configure({
        simulate: true,
        fixtures: {
          // 1. Simuler une utilisatrice précise
          user: {
            msisdn: '781234567',
            firstName: 'Awa',
            lastName: 'Ndiaye',
            fullName: 'Awa Ndiaye'
          },

          // 2. Simuler un cas où le paiement va lever le dialogue de doublon
          identicalOnce: true,

          // 3. Simuler une latence réseau 3G réaliste (1,5 seconde)
          latencyMs: 1500
        },
        log: (level, api, message, ctx) => {
          console.info(`%c[DevTools:${api}] ${message}`, 'color: #F16E00; font-weight: bold;', ctx || '');
        }
      });
    }
  }
});
```

#### ⚙️ Ce qui se passe en coulisses
Le SDK court-circuite les commandes natives et répond immédiatement (après le délai de `latencyMs`) avec les structures JSON exactes produites par les téléphones récents en production.

#### ⚠️ Le Piège Mortel Débutant
Vérifiez toujours que `simulate` est conditionné à l'environnement de développement (`__wxConfig.envVersion === 'develop'`). Ne livrez jamais une version en production avec `simulate: true` en dur !

---

## 🚨 6. Matrice Exhaustive des Erreurs `HostError`

Toute méthode du SDK rejette une instance d'erreur typée `HostError`. Vous pouvez interroger ses propriétés de manière déterministe sans jamais avoir à analyser des chaînes de texte françaises par des `err.message.includes(...)`.

### Propriétés d'un objet `HostError`

* `err.code` : Chaîne constante identifiant la cause (ex: `'TIMEOUT'`, `'CANCELLED'`).
* `err.message` : Message en français rédigé avec bienveillance, directement affichable au client dans un toast.
* `err.uncertain` : Booléen (`true` ou `false`). Indique si la transaction bancaire est dans un état indéterminé.
* `err.raw` : L'objet brut d'origine retourné par l'hôte Max It (pour analyse fine dans vos logs de monitoring).

### Tableau des Codes d'Erreurs Officiels

| Code d'Erreur (`err.code`) | Cause Réelle de l'Échec | `err.uncertain` | Action Applicative Recommandée |
|---|---|:---:|---|
| `UNAVAILABLE` | L'application n'est pas exécutée à l'intérieur du conteneur Max It. | `false` | Afficher un écran invitant à ouvrir le service dans l'application Max It. |
| `CANCELLED` | L'utilisateur a volontairement fermé le volet de paiement ou annulé la saisie de son code PIN. | `false` | Ne rien faire de bloquant, laisser l'utilisateur sur le panier ou proposer un autre moyen. |
| `REFUSED` | Le cœur bancaire a rejeté l'opération : solde insuffisant, code secret erroné ou plafond atteint. | `false` | Afficher directement `err.message` via `wx.showToast` (message explicite pour le client). |
| `DECLINED` | L'utilisateur a refusé de confirmer la transaction en doublon lors de l'alerte des 15 minutes. | `false` | Transaction annulée en toute sécurité. Ne pas débiter. |
| `TIMEOUT` | L'hôte ou le réseau n'a pas répondu dans le délai imparti (`timeoutMs`). | **`true`** | **NE PAS REDEMANDER DE PAYER.** Lancer le Smart Polling de vérification auprès de votre backend. |
| `HOST_ERROR` | L'hôte Max It a répondu avec une erreur inattendue ou un code statut non répertorié. | **`true`** | Traiter avec la même prudence qu'un timeout. Vérifier le statut avant toute nouvelle tentative. |

---

## 🧰 7. Boîte à Outils Métier (`miniSDK.helpers` & `supports`)

Le SDK exporte des fonctions utilitaires hautement optimisées et conformes aux réglementations de protection des données (CDP Sénégal) :

### 1. `miniSDK.supports(featureName)`
Permet de tester si une fonctionnalité est supportée par la version actuelle de l'application hôte Max It de l'utilisateur avant de l'appeler :

```javascript
if (miniSDK.supports('screenProtect')) {
  await miniSDK.screen.protect(true);
} else {
  console.log('Protection d écran non supportée sur ce terminal ancien.');
}
```

### 2. `miniSDK.helpers.normaliseMsisdn(rawNumber)`
Convertit n'importe quelle saisie utilisateur ou chaîne hôte au format strict à 9 chiffres :

```javascript
import { miniSDK } from './sdk/index.js';

miniSDK.helpers.normaliseMsisdn('+221 77 123 45 67'); // "771234567"
miniSDK.helpers.normaliseMsisdn('00221781234567');    // "781234567"
miniSDK.helpers.normaliseMsisdn('76-987.65.43');      // "769876543"
```

### 3. `miniSDK.helpers.isSenegalMobile(digits)`
Valide si une chaîne de 9 chiffres correspond à un numéro mobile valide d'un opérateur sénégalais (Orange 77/78, Free 76, Expresso 70, Promobile 75) :

```javascript
miniSDK.helpers.isSenegalMobile('771234567'); // true
miniSDK.helpers.isSenegalMobile('781234567'); // true
miniSDK.helpers.isSenegalMobile('338210000'); // false (téléphone fixe)
```

### 4. `miniSDK.helpers.maskParams(params)`
Masque automatiquement les numéros de téléphone et coordonnées bancaires pour respecter les normes de sécurité lors de la transmission des logs :

```javascript
const logsSafe = miniSDK.helpers.maskParams({
  orderId: 'CMD-1',
  msisdn: '771234567'
});
// logsSafe vaut : { orderId: 'CMD-1', msisdn: '77 *** ** 67' }
```

---

## 🏗️ 8. Intégration dans l'Architecture Complète PMT

Voici comment combiner le SDK Max It avec les autres briques du skill `wechat-pmt` (Client HTTP résilient, mappers `json-sculpt` et machine à états UX) au sein d'une page de paiement complète :

```javascript
// pages/order-pay/index.js
import { miniSDK } from '../../sdk/index.js';
import { BackendAPI } from '../../utils/apis/backend.api.js';
import { mapOrderConfirmation } from '../../utils/mappers/order.js';

Page({
  data: {
    uiState: 'idle', // 'idle' | 'paying' | 'verifying' | 'success' | 'error'
    order: null,
    errorMessage: ''
  },

  onLoad(options) {
    if (!options.orderId) {
      wx.navigateBack();
      return;
    }
    this.orderId = options.orderId;
    this.chargerDetailsCommande();
  },

  async chargerDetailsCommande() {
    try {
      const raw = await BackendAPI.get(`/orders/${this.orderId}`);
      this.setData({ order: raw });
    } catch (err) {
      this.setData({ uiState: 'error', errorMessage: 'Impossible de charger la commande.' });
    }
  },

  async onValiderPaiement() {
    if (this.data.uiState === 'paying') return;
    this.setData({ uiState: 'paying' });

    try {
      // 1. Appel du paiement officiel Max It
      const { txnid } = await miniSDK.pay({
        amount: this.data.order.totalAmount,
        receiver: 467652,
        receiverName: 'ATS Billetterie',
        orderId: this.orderId,
        description: `Règlement commande ${this.orderId}`
      });

      // 2. Notification de confirmation à votre backend métier
      const rawSuccess = await BackendAPI.post(`/orders/${this.orderId}/confirm`, { txnid });
      const confirmation = mapOrderConfirmation(rawSuccess);

      this.setData({
        uiState: 'success',
        confirmation
      });

    } catch (err) {
      if (err.uncertain) {
        // En cas de statut incertain, basculer en mode vérification automatique
        this.setData({ uiState: 'verifying' });
        await this.procederVerificationBackend();
      } else if (err.code === miniSDK.ERROR_CODES.CANCELLED) {
        this.setData({ uiState: 'idle' });
        wx.showToast({ title: 'Paiement annulé', icon: 'none' });
      } else {
        this.setData({
          uiState: 'error',
          errorMessage: err.message
        });
      }
    }
  },

  async procederVerificationBackend() {
    // Smart Polling 3 essais vers votre backend
    // Si confirmé -> uiState = 'success', sinon invitation au calme
  }
});
```

---

## ❓ 9. FAQ & Bonnes Pratiques pour Débutants

### Q1 : Dois-je créer un formulaire d'inscription avec mot de passe ?
**Non, jamais.** Dans l'écosystème Max It, l'utilisateur a déjà été authentifié par l'opérateur Sonatel au niveau de sa carte SIM et de son application mobile. Utilisez `miniSDK.user()` pour obtenir son identité et `miniSDK.login()` pour authentifier votre session backend.

### Q2 : Pourquoi mes collègues et moi avons des montants bloqués sur transaction identique ?
Parce que vous testez plusieurs fois le même paiement de test avec la même référence de commande et le même montant. Utilisez le gestionnaire `onIdentical` documenté au [Cas 4](#cas-4--résolution-du-doublon-sous-15-minutes-handlersonidentical), et le SDK débloquera la situation automatiquement.

### Q3 : Pourquoi mes tests plantent-ils dans WeChat DevTools ?
Parce que WeChat DevTools simule WeChat classique, et non l'application Max It de Sonatel. Dans `app.js`, configurez `simulate: true` lorsque vous êtes en environnement de développement (`develop`). Vous bénéficierez de données factices complètes sans avoir besoin d'un vrai téléphone.

### Q4 : Que faire si le client ferme son application pendant le paiement ?
Rien de grave si votre backend applique le principe d'idempotence et que votre application écoute les statuts avec le drapeau `err.uncertain`. Orange Money notifie également les marchands par Webhook IPN (Instant Payment Notification) de serveur à serveur.

---

> 🔗 **Ressources complémentaires :**
> - [Guide de Résilience & Bouclier Anti-Double Débit](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md)
> - [Matrice des Erreurs Production TCMPP & OM](DOC_MATRICE_ERREURS_PROD_TCMPP.md)
> - [Recettes Prêtes à l'Emploi](DOC_RECETTES_COPIER_COLLER.md)
