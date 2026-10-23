> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

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

