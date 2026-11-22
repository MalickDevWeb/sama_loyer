> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# ❓ FAQ : Les Questions / Réponses pour ne Jamais Faire d'Erreur

Cherchez votre question dans la liste. La réponse vous dit exactement quoi faire.

## 📑 Catégories
- [🎨 UI & Composants](#-ui--composants)
- [🔌 API & Réseau](#-api--réseau)
- [🚌 Communication entre composants](#-communication-entre-composants)
- [💄 WXS & Formatage](#-wxs--formatage)
- [🎬 Animations & CSS](#-animations--css)
- [🐛 Débogage](#-débogage)
- [🔐 Sécurité & Authentification](#-sécurité--authentification)
- [⚡ Performance](#-performance)
- [🤝 Travail en Équipe & Git](#-travail-en-équipe--git)
- [💳 Paiement Marchand & Résilience Réseau](#-paiement-marchand--résilience-réseau)
- [📱 Responsive iPhone Réel & Custom TabBar](#-responsive-iphone-réel--custom-tabbar)
- [🧭 Navigation & Behaviors WeChat](#-navigation--behaviors-wechat)
- [📱 SDK Officiel Max It (@sonatel-os/maxit-mini-sdk)](#-sdk-officiel-max-it-sonatel-osmaxit-mini-sdk)
- [🛠️ Pièges Compilateur & Robustesse](#-pièges-compilateur--robustesse)
- [🚀 Patterns Avancés & Cache SWR](#-patterns-avancés--cache-swr)

---

## 🎨 UI & Composants

**Q : Ma page ne s'affiche pas, l'écran est blanc. Que faire ?**
> Vérifiez `uiState`. Si sa valeur est `'loading'` et que le skeleton est invisible (mauvaise classe CSS), l'écran paraît vide. Changez temporairement `uiState: 'content'` dans le `.js` pour forcer l'affichage du contenu.

---

**Q : J'ai mis `onLoad()` dans mon composant mais rien ne se passe. Pourquoi ?**
> `onLoad()` n'existe **pas** dans les composants. C'est le piège le plus classique. Utilisez `lifetimes: { attached() { ... } }` à la place.
```javascript
// ❌ FAUX dans un composant
onLoad() { this.charger(); }

// ✅ CORRECT dans un composant
lifetimes: {
  attached() { this.charger(); }
}
```

---

**Q : Comment passer une donnée de ma Page vers un de mes Composants ?**
> Utilisez `properties` dans le composant et passez la valeur dans le WXML de la page.
```javascript
// Dans le composant : déclarez la propriété attendue
Component({ properties: { monItem: { type: Object, value: null } } });
```
```xml
<!-- Dans la page : passez la valeur -->
<mon-composant monItem="{{laVariableDeMaPage}}" />
```

---

**Q : Comment faire en sorte qu'un composant change d'aspect quand sa `property` change ?**
> Utilisez `observers` dans le composant. Il surveille la propriété et réagit automatiquement.
```javascript
Component({
  properties: { estActif: Boolean },
  observers: {
    'estActif': function(nouvelleValeur) {
      // Se déclenche automatiquement quand estActif change
      this.setData({ couleur: nouvelleValeur ? 'vert' : 'gris' });
    }
  }
});
```

---

**Q : Mon `wx:for` sur une liste ne se met pas à jour quand je modifie un seul élément.**
> Vous devez mettre à jour l'élément de manière ciblée avec la syntaxe `liste[index].champ`.
```javascript
// ❌ LENT : Remplace toute la liste
this.setData({ liste: nouvelleListe });

// ✅ RAPIDE : Met à jour uniquement l'élément à l'index 2
this.setData({ [`liste[2].estFavori`]: true });
```

---

**Q : J'ai plusieurs `setData()` dans la même fonction. Est-ce normal ?**
> Non. Plusieurs `setData()` consécutifs ralentissent l'application. Regroupez-les en UN SEUL appel.
```javascript
// ❌ LENT : 3 appels séparés
this.setData({ uiState: 'content' });
this.setData({ liste: data });
this.setData({ total: data.length });

// ✅ RAPIDE : 1 seul appel
this.setData({ uiState: 'content', liste: data, total: data.length });
```

---

**Q : Pourquoi `wx.previewImage()` bloque-t-il sur un écran noir infini dans WeChat DevTools sur PC ?**
> `wx.previewImage` sur PC attend des URL distantes `https://` ou des fichiers temporaires `wxfile://`. Si on lui passe un chemin relatif d'asset local (`/assets/...`), le lecteur d'image natif de WeChat n'arrive pas à le résoudre et boucle sur un écran noir avec une roue de chargement.
> **Solution recommandée (Recette 73) :** Afficher l'image ou le QR Code dans une modale in-app (`<whatsapp-modal>` ou `<osn-modal>`) avec l'attribut `show-menu-by-longpress="{{ true }}"` sur la balise `<image>`. Sur mobile, l'utilisateur fait un appui long d'1 seconde pour identifier le QR code et ouvrir WhatsApp directement, et sur simulateur PC DevTools l'image s'affiche instantanément à 100%.
```xml
<!-- Modale In-App avec détection appui long natif -->
<image
  src="/assets/images/contact/whatsapp-qr.png"
  mode="widthFix"
  show-menu-by-longpress="{{ true }}"
/>
```

---

**Q : Comment afficher un texte différent si une liste est vide ou si elle a des items ?**
> Utilisez `wx:if` et `wx:else` directement dans le WXML.
```xml
<view wx:if="{{liste.length > 0}}">
  <view wx:for="{{liste}}" wx:key="id">...</view>
</view>
<view wx:else>
  <text>Aucun élément pour le moment.</text>
</view>
```

---

## 🔌 API & Réseau

**Q : J'appelle l'API mais j'obtiens une erreur 401. Pourquoi ?**
> Vous n'avez pas appelé `await authenticate()` avant votre requête. Cette fonction gère le token d'accès automatiquement.
```javascript
async getMonDonnee() {
  await authenticate(); // ← NE JAMAIS OUBLIER CETTE LIGNE
  const res = await httpClient.get('/api/ma-route');
  ...
}
```

---

**Q : La réponse du serveur arrive mais ma donnée est `undefined` dans la page. Pourquoi ?**
> Le chemin `@link.xxx` dans votre Mappeur est probablement incorrect. Utilisez `dd(res.data)` juste après l'appel API pour voir la structure exacte de ce que le serveur envoie, puis corrigez votre Schema.
```javascript
const res = await httpClient.get('/api/ma-route');
dd(res.data); // ← STOPPEZ ICI ET INSPECTEZ LA STRUCTURE RÉELLE
```

---

**Q : J'ai créé ma méthode API mais la page dit que la fonction n'existe pas.**
> Vous avez probablement oublié d'exporter votre classe dans le Hub Central.
```javascript
// utils/apis/index.js ← CE FICHIER EST OBLIGATOIRE
export { monAPI } from './mondomaine.api.js'; // ← Avez-vous ajouté cette ligne ?
```

---

**Q : Ma requête POST ne fonctionne pas. Le serveur dit que les données sont vides.**
> Vérifiez que vous passez bien un objet `payload` à `httpClient.post()`.
```javascript
// ❌ FAUX : On oublie de passer les données
const res = await httpClient.post('/api/ma-route');

// ✅ CORRECT
const res = await httpClient.post('/api/ma-route', { email: 'test@test.com' });
```

---

**Q : L'utilisateur voit l'écran de chargement indéfiniment après une erreur réseau.**
> Vous n'avez pas changé `uiState` dans le bloc `catch`. Il reste bloqué sur `'loading'`.
```javascript
try {
  const data = await monAPI.getData();
  this.setData({ data, uiState: 'content' });
} catch (e) {
  this.setData({ uiState: 'error' }); // ← SANS CETTE LIGNE, L'ÉCRAN RESTE SUR LOADING
  wx.showToast({ title: e.message, icon: 'none' });
}
```

---

**Q : Je dois envoyer plusieurs requêtes API en même temps. Comment faire sans ralentir ?**
> Utilisez `Promise.all()` pour les lancer en parallèle au lieu de les lancer une par une.
```javascript
// ❌ LENT : Séquentiel (attend la fin de chacune avant la suivante)
const user = await userAPI.getProfile();
const vols = await flightAPI.getMyFlights();

// ✅ RAPIDE : Parallèle (les deux partent en même temps)
const [user, vols] = await Promise.all([
  userAPI.getProfile(),
  flightAPI.getMyFlights()
]);
```

---

## 🚌 Communication entre Composants

**Q : J'utilise `Bus.emit()` mais ma Page ne reçoit jamais le signal. Pourquoi ?**
> Vous avez probablement oublié d'appeler `Bus.on()` dans `onLoad()`. La page doit "allumer son talkie-walkie" avant de pouvoir recevoir.
```javascript
onLoad() {
  Bus.on('MON_EVENEMENT', this.maFonction, this); // ← OBLIGATOIRE
}
```

---

**Q : Ma Page reçoit le même signal plusieurs fois (en boucle ou doublons). Pourquoi ?**
> Vous avez oublié `Bus.off()` dans `onUnload()`. L'écouteur s'accumule à chaque visite de la page.
```javascript
onUnload() {
  Bus.off('MON_EVENEMENT', this.maFonction, this); // ← OBLIGATOIRE pour arrêter d'écouter
}
```

---

**Q : J'essaie de modifier une variable de la Page depuis un Composant directement. Est-ce correct ?**
> Non. Un composant ne doit **jamais** accéder directement aux données de sa page. Il doit "crier" avec `triggerEvent` et laisser la page décider quoi faire.
```javascript
// ❌ TRÈS MAUVAISE PRATIQUE
this.triggerEvent('noop'); // puis accéder à this.getPage().setData(...)

// ✅ CORRECT : Le composant crie un événement, la page écoute et réagit
this.triggerEvent('item_supprime', { id: this.properties.item.id });
```

---

**Q : Quand utiliser `Bus.emit` vs `Bus.setState` ?**
> Simple :
> - `Bus.emit` = Pour déclencher une **ACTION** ponctuelle. ("Recharge-toi !", "Déconnecte-toi !")
> - `Bus.setState` = Pour partager une **DONNÉE PERSISTANTE**. (Panier, Profil, Thème)

---

## 💄 WXS & Formatage

**Q : Mon fichier `.wxs` affiche une erreur de syntaxe mais mon code a l'air correct.**
> Le WXS utilise du **JavaScript ES5 uniquement**. Pas de `const`, `let`, `=>`, ni de déstructuration.
```javascript
// ❌ INTERDIT dans un .wxs
const formater = (prix) => prix + ' FCFA';

// ✅ CORRECT dans un .wxs
var formater = function(prix) { return prix + ' FCFA'; };
module.exports = { formater: formater };
```

---

**Q : J'ai créé mon fichier `.wxs` mais le filtre ne s'applique pas dans le WXML.**
> Vérifiez que vous avez bien importé le WXS ET utilisé le bon `module` (le nom que vous avez choisi).
```xml
<!-- L'attribut module="f" définit le nom d'accès -->
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<!-- Vous devez utiliser "f." pour appeler vos fonctions -->
<text>{{ f.formater(item.prix) }}</text>
```

---

**Q : Mon WXS reçoit `undefined` comme valeur. Pourquoi ?**
> La donnée n'est pas encore chargée quand le WXS s'exécute. Ajoutez une vérification dans votre fonction WXS.
```javascript
var formater = function(prix) {
  if (!prix && prix !== 0) return '--'; // Protection si la valeur est undefined
  return prix + ' FCFA';
};
```

---

## 🎬 Animations & CSS

**Q : Mon animation `.animate-fade-in` ne se joue qu'une seule fois et plus jamais.**
> C'est normal. CSS rejoue l'animation quand l'élément apparaît via `wx:if`. Si l'élément reste visible, l'animation ne se rejoue pas. Pour forcer le rejeu, retirez temporairement et remettez la classe via `setData`.

---

**Q : Le contenu de ma page est caché derrière la barre de navigation de l'iPhone.**
> Vous avez oublié le `safe-area-inset-bottom`. Ajoutez cette ligne CSS sur votre barre fixe.
```css
.ma-barre-du-bas {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom); /* ← LA LIGNE MAGIQUE */
}
```

---

**Q : Mon animation se joue mais elle est saccadée (choppante) sur un vrai téléphone.**
> Utilisez uniquement `transform` et `opacity` pour les animations. Évitez `width`, `height`, `top`, `left`.
```css
/* ❌ LENT : Fait travailler le CPU */
@keyframes lent { from { height: 0; } to { height: 200px; } }

/* ✅ RAPIDE : Utilise le GPU du téléphone */
@keyframes rapide { from { transform: translateY(100%); } to { transform: translateY(0); } }
```

---

## 🐛 Débogage

**Q : Je ne sais pas si le problème vient de l'API ou de mon code. Comment savoir ?**
> Placez `dd(res)` juste après l'appel API pour voir la réponse brute avant tout traitement.
```javascript
const res = await httpClient.get('/api/route');
dd(res); // ← Si res.success est true et res.data a les bonnes données, l'API est OK.
         //    Le problème est alors dans votre Mappeur ou votre WXML.
```

---

**Q : Mon `console.log` n'affiche rien dans WeChat DevTools.**
> Vérifiez que vous êtes dans l'onglet **Console** du WeChat DevTools. Aussi, vérifiez que le filtre de logs n'est pas sur "Errors only".

---

**Q : L'application plante et je ne vois pas d'erreur claire. Comment trouver le bug ?**
> Ajoutez le filet de sécurité global dans `app.js` :
```javascript
onLaunch() {
  wx.onError((err) => console.error('[GLOBAL]', err));
  wx.onUnhandledRejection((res) => console.error('[PROMISE]', res.reason));
}
```

---

## 🔐 Sécurité & Authentification

**Q : Comment vérifier si l'utilisateur est connecté avant d'afficher une page ?**
> Vérifiez le token au début de `onLoad()`. Si absent, redirigez vers le Login.
```javascript
onLoad() {
  const token = wx.getStorageSync('auth_token');
  if (!token) {
    wx.reLaunch({ url: '/pages/login/index' });
    return; // ← IMPORTANT : Arrête l'exécution du reste de onLoad
  }
  // Suite du code normal...
}
```

---

**Q : Le token expire pendant que l'utilisateur utilise l'app. Que faire ?**
> Gérez l'erreur 401 dans votre `httpClient` et émettez un signal global de déconnexion.
```javascript
// Dans utils/apis/http.js
if (res.statusCode === 401) {
  wx.removeStorageSync('auth_token');
  Bus.emit('DECONNEXION_FORCEE');
}
// Dans app.js
Bus.on('DECONNEXION_FORCEE', () => wx.reLaunch({ url: '/pages/login/index' }));
```

---

## ⚡ Performance

**Q : Mon application est lente quand j'affiche une longue liste. Comment l'optimiser ?**
> Utilisez `recycle-view` (liste recyclée) pour les très longues listes, ou assurez-vous d'utiliser `wx:key` sur votre `wx:for`.
```xml
<!-- TOUJOURS mettre wx:key sur les listes. Utilisez un identifiant unique. -->
<view wx:for="{{liste}}" wx:key="id">...</view>
```

---

**Q : J'appelle `setData()` 10 fois par seconde (ex: dans un timer). Est-ce correct ?**
> Non. `setData()` est coûteux. Pour les mises à jour fréquentes (timer, position GPS), utilisez des variables JavaScript normales et appelez `setData` seulement pour rafraîchir l'affichage.
```javascript
// ❌ LENT : setData à chaque seconde
this.timer = setInterval(() => { this.setData({ secondes: this.data.secondes - 1 }); }, 1000);

// ✅ OK : setData seulement quand nécessaire pour l'affichage
this._secondes = 60; // Variable JS simple, pas dans data
this.timer = setInterval(() => {
  this._secondes--;
  if (this._secondes % 5 === 0) this.setData({ affichage: this._secondes }); // Mise à jour toutes les 5s
}, 1000);
```

---

## 🤝 Travail en Équipe & Git

**Q : Je veux modifier un fichier partagé (`app.js`, `utils/`, `components/navbar/`). Puis-je le faire ?**
> **Seulement si c'est explicitement demandé et validé par l'équipe.** Avant de modifier un fichier partagé, prévenez vos collègues sur le chat d'équipe pour éviter les conflits Git.

---

**Q : J'ai un conflit Git sur un fichier. Comment éviter que ça se reproduise ?**
> Respectez la règle de l'isolation :
> - Chaque développeur travaille dans son dossier de page/composant.
> - Pour ajouter un endpoint API, on crée/modifie son propre fichier `.api.js` (pas celui des autres).
> - On n'exporte dans `utils/apis/index.js` qu'une seule ligne (la sienne).

---

**Q : Quel message de commit utiliser ?**
> Utilisez ce format standard :
```
type(scope): description courte en français

Types : feat (nouvelle fonctionnalité), fix (bug), refactor, docs, style
Exemples :
  feat(vols): ajout de la page liste des vols
  fix(panier): correction du compteur qui doublait
  docs(recettes): ajout recette scroll infini
```



---

## 💳 Paiement Marchand & Résilience Réseau

**Q : Comment être sûr à 100% qu'un client ne sera jamais débité deux fois sur Orange Money ?**
> Scellez immédiatement le reçu `this._confirmedTxnid = txnid` dès le retour de `wx.invokeNativePlugin`. Si l'enregistrement backend échoue ensuite à cause d'une coupure 4G, le bouton "Réessayer" vérifie d'abord `if (this._confirmedTxnid)` : il saute intégralement l'appel de débit Orange Money et rejoue uniquement l'enregistrement backend avec la preuve déjà obtenue. Zéro franc supplémentaire prélevé !

---

**Q : L'utilisateur a été débité, mais l'app affichait une erreur "Délai dépassé". Pourquoi ?**
> Vous avez probablement mis un timeout arbitraire (`setTimeout` de 30 secondes via `Promise.race`) sur le paiement natif. Si l'utilisateur met 35 secondes pour taper son code PIN secret sur le clavier sécurisé Orange Money, le JavaScript déclenche une fausse erreur alors que le SDK natif valide le paiement juste après. **Règle absolue :** Ne mettez aucun timeout artificiel JS sur l'appel du plugin natif `merchantPay`.

---

**Q : Que faire si le réseau 4G se coupe pile au moment de la confirmation du billet ?**
> Utilisez le **Smart Polling à 3 essais** (immédiat, +2s, +4s). Si au bout des 3 essais le réseau est toujours mort, affichez une modale explicite : *"Votre compte a bien été débité, mais la connexion a été ralentie. Cliquez sur Réessayer pour valider votre billet sans repayer."*

---

## 📱 Responsive iPhone Réel & Custom TabBar

**Q : Sur iPhone, mon bouton "Payer" en bas d'écran est à moitié masqué ou difficile à cliquer. Pourquoi ?**
> C'est l'absence de gestion du Home Indicator (la barre virtuelle des iPhone récents). Ajoutez impérativement dans votre WXSS du footer fixé :
> `padding-bottom: calc(24rpx + env(safe-area-inset-bottom));`.
> Et veillez à ajouter un padding équivalent au conteneur de scroll de la page pour ne pas cacher le dernier élément.

---

**Q : Pourquoi mon Custom TabBar affiche le mauvais onglet sélectionné ou clignote au changement de page ?**
> Lors d'un `wx.switchTab`, WeChat peut réinstancier le composant de la barre d'onglets. La règle officielle pour éliminer tout clignotement est d'ajouter dans le cycle de vie `onShow()` de **chaque page d'onglet** :
> ```javascript
> onShow() {
>   if (typeof this.getTabBar === 'function' && this.getTabBar()) {
>     this.getTabBar().setData({ selected: MON_INDEX });
>   }
> }
> ```

---

**Q : Pourquoi ma page est coupée en bas et ne scrolle pas sur iPhone alors que le simulateur était parfait ?**
> Vous avez probablement mis `height: 100vh; overflow: hidden;`. Sur un appareil réel avec encoche ou Dynamic Island, la hauteur utile est inférieure à `100vh`. Remplacez toujours `height: 100vh` par `min-height: 100vh;` et laissez le flux de document s'exprimer naturellement.


---

## 🧭 Navigation & Behaviors WeChat

**Q : Mon `wx.navigateTo` ne fonctionne plus après avoir cliqué sur plusieurs liens. Aucun message d'erreur. Pourquoi ?**
> Vous avez atteint la limite fatidique imposée par WeChat : **10 pages maximum sur la stack de navigation** (`getCurrentPages().length >= 10`). Au-delà, WeChat ignore l'appel. Utilisez le helper `navigateToSafe(url)` qui bascule automatiquement sur `wx.redirectTo` lorsque la pile atteint 10 pages.

---

**Q : L'utilisateur double-clique sur un bouton et la même page s'ouvre 2 fois. Comment l'empêcher ?**
> Utilisez un verrou de navigation avec cooldown (`navigateWithLock`) ou un drapeau d'instance `this._isNavigating = true` déverrouillé au bout de 500ms.

---

**Q : Comment partager du code (méthodes et variables de data) entre plusieurs composants sans héritage ?**
> Utilisez les **Behaviors** natifs de WeChat via `Behavior({ data, methods, lifetimes })`. Dans votre composant ou page, ajoutez simplement `behaviors: [monBehavior]`. C'est le standard officiel recommandé par WeChat.

---

**Q : Pourquoi mon token OAuth2 expire pendant l'envoi d'une requête et renvoie 401 ?**
> Si vous vérifiez seulement `tokenExpiry > Date.now()`, un token qui expire dans 2 secondes sera jugé valide, mais expirera pendant la transmission réseau de 3 secondes. Utilisez un **Buffer de rafraîchissement d'au moins 60 secondes** : le token n'est considéré valide que si `Date.now() < (tokenExpiry - 60000)`.


---

## 📱 SDK Officiel Max It (@sonatel-os/maxit-mini-sdk)

**Q : Pourquoi mon callback `success` de `wx.invokeNativePlugin` est appelé alors que l'opération a échoué ?**
> C'est un comportement historique de l'hôte Max It : il enveloppe souvent l'erreur dans un objet `{ result: 'fail', message: '...' }` passé au callback `success`. Le SDK officiel traite cette anomalie nativement et la transforme en véritable rejet `HostError`.

---

**Q : Pourquoi mon deuxième paiement avec le même montant est bloqué pendant 15 minutes ?**
> L'hôte Max It bloque automatiquement les doublons stricts pour protéger le client. Pour forcer la poursuite si l'utilisateur le confirme, l'hôte exige `caction: '1'` (impérativement sous forme de chaîne de caractères, un nombre `1` échouant au typage serveur). `miniSDK.pay()` s'en charge automatiquement via son handler `onIdentical`.

---

**Q : Après avoir fermé ma page de billet, tout le reste de l'application Max It reste noir / flouté. Pourquoi ?**
> Vous avez activé `screen.protect(true)` (ou le plugin natif `block_screen`) sans le désactiver en partant ! La protection d'écran est globale à l'application hôte. Vous devez IMPÉRATIVEMENT appeler `await miniSDK.screen.protect(false)` dans les hooks `onHide()` et `onUnload()`.

---

**Q : Que signifie l'indicateur `err.uncertain === true` sur une erreur de paiement ?**
> Cela signifie qu'un timeout ou une coupure réseau est survenue alors que la demande était déjà transmise à la banque. **L'argent a très bien pu être prélevé du compte Orange Money.** Ne proposez JAMAIS à l'utilisateur de cliquer à nouveau sur "Payer" sans avoir préalablement vérifié le statut de la commande côté backend.

---

**Q : Pourquoi `contactList` me renvoie une liste vide ?**
> Si vous passez un champ `data: {}` à l'appel natif `contactList`, l'hôte plante silencieusement et renvoie un tableau vide. Le SDK officiel appelle le plugin avec un paramètre vide pour garantir le renvoi de la liste.


---

## 🛠️ Pièges Compilateur & Robustesse

**Q : TCMPP DevTools affiche une erreur 404 sur un fichier de police locale avec le suffixe `-do-not-use-local-path-`. Comment régler ça ?**
> Le compilateur WeChat/TCMPP interdit formellement les fichiers de polices locales (`.ttf`, `.woff`) dans les feuilles de style WXSS. Supprimez les blocs `@font-face` locaux de `app.wxss` et utilisez les polices natives du système : `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`.

---

**Q : J'ai une erreur `SyntaxError: Unexpected token ILLEGAL` au démarrage alors que mon code JS ou JSON est parfaitement valide. Pourquoi ?**
> Votre fichier a été enregistré sous Windows avec un **BOM UTF-8 (`\uFEFF`)** invisible en tête de fichier. Le moteur JavaScript de WeChat ne supporte pas ce caractère. Réenregistrez votre fichier en UTF-8 sans BOM (UTF-8 Plain).

---

**Q : Pourquoi mon bouton Retour personnalisé ne fait rien du tout sur certains écrans ?**
> Si l'utilisateur a accédé directement à l'écran depuis un SMS, une notification ou un scan QR, la pile ne contient qu'une seule page (`getCurrentPages().length === 1`). `wx.navigateBack()` ne peut donc pas reculer. Utilisez le pattern du **Retour Intelligent** : vérifiez `getCurrentPages().length > 1`, sinon basculez sur `wx.switchTab({ url: '/pages/home/home' })`.

---

**Q : Pourquoi mon écran affiche brièvement "0 résultat" avant d'afficher la liste ?**
> Vous avez initialisé votre variable dans `data` avec `'0 résultat'`. Initialisez-la toujours avec une chaîne vide `resultsLabel: ''`, et masquez le bandeau tant que `loading` est actif via `wx:if="{{ !loading && items.length > 0 }}"`.

---

## 🚀 Patterns Avancés & Cache SWR

**Q : Pourquoi `new Date('2026-03-20')` affiche le 19 mars sur certains téléphones ? (Piège du fuseau UTC)**
> En JavaScript, `new Date('YYYY-MM-DD')` est interprété comme minuit UTC. Sur un appareil physique dont le fuseau horaire applique un décalage négatif ou lors de conversions d'heures locales, minuit UTC devient 23h00 ou 22h00 la veille (ex: 19 mars).  
> **Solution :** Toujours construire la date en forçant l'heure locale complète : `new Date(`${isoDate}T00:00:00`) ` ou instancier via `new Date(year, monthIndex, day)`.

---

**Q : Pourquoi `wx.getStorageSync('cle_inexistante')` me renvoie `""` au lieu de `null` ou `undefined` ? (Piège du Storage WeChat)**
> C'est une particularité historique du moteur WeChat : l'appel natif `wx.getStorageSync` renvoie une chaîne vide `""` lorsqu'une clé n'existe pas, et non pas `null`.  
> **Solution :** Ne testez jamais `if (val === null)`. Utilisez le wrapper `SafeStorage` (Recette 44) qui normalise automatiquement la valeur :  
> ```javascript
> const data = (raw === '' || raw === null || raw === undefined) ? defaultValue : raw;
> ```

---

**Q : Pourquoi mes images réseau distantes échouent silencieusement sur le réseau mobile 4G ?**
> Sur un réseau mobile instable, des micro-coupures peuvent interrompre le flux HTTP de l'image, déclenchant l'événement `binderror` sur la balise WeChat `<image>`.  
> **Solution :** Utilisez le composant résilient (Recette 38) avec **auto-retry à 3 essais** et backoff progressif (500ms, 1s, 2s). Ajoutez un timestamp en paramètre d'URL (`url?_retry=16725312`) pour forcer WeChat à contourner le cache corrompu de l'image.

---

**Q : Comment éviter qu'une requête lente n'écrase des données fraîches lors d'un pull-to-refresh rapide ? (Garde anti-race condition)**
> Si l'utilisateur tire l'écran vers le bas (pull-to-refresh) alors qu'une première requête est déjà en transit, la première requête (lente) risque de se résoudre APRÈS la seconde (rapide) et d'écraser les données fraîches avec d'anciennes données périmées.  
> **Solution :** Scellez un identifiant séquentiel de requête d'instance :
> ```javascript
> this._refreshRequestId = (this._refreshRequestId || 0) + 1;
> const currentId = this._refreshRequestId;
> const res = await backendAPI.getItems();
> if (currentId !== this._refreshRequestId) return; // Requête obsolète, ignorée silencieusement !
> this.setData({ items: res });
> ```

---

**Q : Pourquoi ma modale / Bottom-Sheet laisse défiler la page en arrière-plan quand l'utilisateur scrolle ?**
> Par défaut dans WeChat, le geste de scroll traverse le calque d'arrière-plan semi-transparent.  
> **Solution :** Posez impérativement `catchtouchmove="noop"` sur le masque noir d'arrière-plan, et `catchtap="noop"` sur le conteneur blanc de la modale pour éviter que le clic à l'intérieur ne ferme la fenêtre.

---

**Q : Comment générer instantanément une page, un composant ou un service API conforme en 1 ligne de commande ?**
> Le kit intègre la trilogie complète des générateurs industriels automatisés via npm :
> ```bash
> npm run create:page -- pages/historique-commandes
> npm run create:component -- components/ui/order-card
> npm run create:component -- components/ux/order-skeleton --ux
> npm run create:api -- commande
> ```
