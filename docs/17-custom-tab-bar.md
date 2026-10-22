# Custom TabBar WeChat

Ce document explique la migration du tabbar de l'application vers le mode officiel `custom tabBar` de WeChat.

## Objectif

L'objectif etait de garder le style visuel du tabbar deja cree dans le projet, tout en utilisant le mecanisme natif WeChat pour les pages a onglets.

Concretement :

- WeChat connait maintenant les pages tabbar via `app.json`.
- Le rendu natif standard est remplace par notre propre rendu avec `"custom": true`.
- Le style existant du composant `components/costumers/ui/tab-bar` est conserve.
- Les navigations vers les onglets utilisent `wx.switchTab`, comme l'exige WeChat.

## Architecture

Le tabbar est maintenant compose de trois couches.

### 1. Declaration native WeChat

Fichier : `app.json`

```json
{
  "tabBar": {
    "custom": true,
    "list": [
      { "pagePath": "pages/home/home", "text": "Accueil" },
      { "pagePath": "pages/explorer/explorer", "text": "Explorer" },
      { "pagePath": "pages/favoris/favoris", "text": "Favoris" },
      { "pagePath": "pages/voyage/voyage", "text": "Voyages" }
    ]
  }
}
```

La propriete `"custom": true` indique a WeChat de ne pas afficher son tabbar standard. WeChat charge alors automatiquement le dossier special `custom-tab-bar/`.

### 2. Point d'entree officiel WeChat

Dossier : `custom-tab-bar/`

Ce dossier est requis par WeChat pour un tabbar personnalise. Le chemin est impose par le runtime WeChat : il doit rester a la racine du projet.

Dans cette app, ce dossier racine est seulement un wrapper technique. Il monte le vrai composant UI situe dans `components/costumers/ui/custom-tab-bar/`.

| Fichier | Role |
|--------|------|
| `custom-tab-bar/index.json` | Declare le composant `app-custom-tab-bar` |
| `custom-tab-bar/index.wxml` | Monte `<app-custom-tab-bar />` |
| `custom-tab-bar/index.js` | Relaye l'onglet actif via `setActiveTab()` pour `getTabBar()` |

### 3. Composant UI du custom tabbar

Dossier : `components/costumers/ui/custom-tab-bar/`

C'est ici que se trouve l'implementation reelle du custom tabbar.

| Fichier | Role |
|--------|------|
| `components/costumers/ui/custom-tab-bar/index.json` | Declare le composant visuel `app-tab-bar` |
| `components/costumers/ui/custom-tab-bar/index.wxml` | Monte notre composant `<app-tab-bar />` |
| `components/costumers/ui/custom-tab-bar/index.js` | Synchronise l'onglet actif selon la route courante |

Le rendu est volontairement tres simple :

```xml
<app-tab-bar
  tabs="{{ tabs }}"
  activeTab="{{ activeTab }}"
  bind:change="handleChange"
/>
```

### 4. Composant visuel existant

Dossier : `components/ui/tab-bar/`

C'est le composant qui porte le style de l'application :

- conteneur fixe en bas de l'ecran ;
- capsule blanche avec ombre ;
- onglet actif en vert ;
- icones existantes ;
- libelle visible sur l'onglet actif.

Ce composant n'a pas ete remplace par le tabbar natif standard. Il est maintenant utilise comme rendu officiel du `custom tabBar` WeChat.

## Fichiers et pages modifies

Voici la liste des fichiers touches par cette migration et leur role.

### Configuration et override WeChat

| Fichier | Modification |
|--------|--------------|
| `app.json` | Ajout de `tabBar.custom: true` et declaration des 4 pages du tabbar natif WeChat |
| `custom-tab-bar/index.json` | Declaration du wrapper `app-custom-tab-bar` dans le dossier special WeChat |
| `custom-tab-bar/index.wxml` | Rendu du wrapper officiel WeChat |
| `custom-tab-bar/index.js` | Relai de l'etat actif expose a `page.getTabBar()` |
| `components/costumers/ui/custom-tab-bar/index.json` | Declaration du composant `app-tab-bar` utilise par l'implementation UI |
| `components/costumers/ui/custom-tab-bar/index.wxml` | Rendu du tabbar custom avec le composant existant `<app-tab-bar />` |
| `components/costumers/ui/custom-tab-bar/index.js` | Synchronisation automatique de l'onglet actif selon la route courante |

### Layout et composants partages

| Fichier | Modification |
|--------|--------------|
| `components/costumers/ui/layout/index.wxml` | Suppression du rendu direct de `<app-tab-bar />` pour eviter un double tabbar |
| `components/costumers/ui/layout/index.json` | Suppression de la dependance locale a `app-tab-bar` |
| `components/costumers/ui/layout/index.js` | Conservation des anciennes props `showTabBar`, `activeTab` et `tabs` pour compatibilite |
| `components/costumers/ui/layout/index.wxss` | Nettoyage de la classe vide liee a l'ancien rendu du tabbar |
| `components/ui/nav-bar/index.js` | Fallback vers Home avec `wx.switchTab` et gestion des anciennes routes tabbar |
| `utils/helpers/tab-bar.js` | Nouveau helper `setCustomTabBarActive()` pour mettre a jour l'onglet actif |

### Pages modifiees

| Page | Modification |
|------|--------------|
| `pages/home/home.js` | Ajout de `setCustomTabBarActive(this, 'home')` dans `onShow()` et passage du bouton "voir tout" en `wx.switchTab` |
| `pages/explorer/explorer.js` | Ajout de `setCustomTabBarActive(this, 'explorer')` dans `onShow()` |
| `pages/favoris/favoris.js` | Ajout de `setCustomTabBarActive(this, 'favorites')` dans `onShow()` |
| `pages/voyage/voyage.js` | Ajout de `setCustomTabBarActive(this, 'voyages')` dans `onShow()` |
| `pages/destination-detail/destination-detail.js` | Fallback retour vers Home avec `wx.switchTab` |
| `app.js` | Redirection 404 vers Home avec `wx.switchTab` |

### Documentation

| Fichier | Modification |
|--------|--------------|
| `docs/17-custom-tab-bar.md` | Ajout du guide dedie a cette migration |
| `README.fr.md` | Ajout du lien vers le guide |
| `README.md` | Ajout du lien vers le guide |

## Synchronisation de l'onglet actif

Le fichier `components/costumers/ui/custom-tab-bar/index.js` construit une table entre les routes et les ids des onglets a partir de `MAIN_TABS`.

```javascript
const ROUTE_TO_TAB = MAIN_TABS.reduce((routes, tab) => {
  routes[tab.url.replace(/^\//, '')] = tab.id;
  return routes;
}, {});
```

Quand le tabbar est attache ou quand une page redevient visible, il lit la route courante avec `getCurrentPages()` puis met a jour `activeTab`.

Les pages principales appellent aussi le helper `setCustomTabBarActive()` dans `onShow()`. Ce helper utilise `page.getTabBar()` pour recuperer le wrapper racine WeChat, puis appelle `setActiveTab()` :

```javascript
onShow() {
  setCustomTabBarActive(this, 'home');
}
```

Cela evite les decalages d'etat quand on revient sur une page tabbar depuis une autre page.

## Pages tabbar

Les quatre pages gerees par le tabbar sont :

| Onglet | Route | Id |
|--------|-------|----|
| Accueil | `pages/home/home` | `home` |
| Explorer | `pages/explorer/explorer` | `explorer` |
| Favoris | `pages/favoris/favoris` | `favorites` |
| Voyages | `pages/voyage/voyage` | `voyages` |

La source de verite fonctionnelle reste `MAIN_TABS` dans `utils/constants/index.js`.

## Navigation

Une page declaree dans `app.json > tabBar.list` doit etre ouverte avec `wx.switchTab`.

Exemple :

```javascript
wx.switchTab({
  url: '/pages/explorer/explorer',
});
```

Il ne faut pas utiliser `wx.navigateTo` ou `wx.redirectTo` vers une page tabbar. WeChat refuse ces navigations.

Les changements realises incluent donc :

- le bouton "voir tout" de Home utilise `wx.switchTab` vers Explorer ;
- le retour fallback vers Home utilise `wx.switchTab` ;
- le `nav-bar` detecte si l'ancienne route est une page tabbar et utilise `wx.switchTab` dans ce cas.

## Role du layout

Avant, `app-layout` rendait directement le composant `<app-tab-bar />`.

Maintenant, ce n'est plus le role du layout. Le layout garde seulement :

- la nav bar ;
- le slot de contenu de page.

Le tabbar est declenche par WeChat via `custom-tab-bar/`, puis rendu par le composant `components/costumers/ui/custom-tab-bar/`. Cela evite un double affichage du tabbar tout en gardant l'implementation dans le systeme de composants UI.

## Ajouter ou modifier un onglet

Pour ajouter un nouvel onglet :

1. Ajouter la page dans `app.json > pages`.
2. Ajouter l'entree dans `app.json > tabBar.list`.
3. Ajouter l'entree correspondante dans `MAIN_TABS`.
4. Dans la page, appeler `setCustomTabBarActive(this, '<id>')` dans `onShow()`.
5. Utiliser `wx.switchTab({ url: '/pages/...' })` pour naviguer vers cette page.

Les `id` doivent rester identiques entre `MAIN_TABS`, la page et le tabbar.

## Points de vigilance

- `custom-tab-bar/` doit rester a la racine du projet, car WeChat cherche ce chemin automatiquement.
- La logique UI du custom tabbar doit rester dans `components/costumers/ui/custom-tab-bar/`.
- Les URLs de `MAIN_TABS` doivent correspondre aux `pagePath` de `app.json`.
- Les pages tabbar ne peuvent pas recevoir de query params via `switchTab`.
- Le composant `components/costumers/ui/tab-bar` reste reutilisable, mais le rendu global de navigation passe par `components/costumers/ui/custom-tab-bar/`.
- Il faut tester visuellement dans WeChat DevTools, car le rendu exact du custom tabbar depend du runtime WeChat.

## Verification effectuee

Les controles suivants ont ete faits apres implementation :

- JSON valide pour `app.json`, `components/costumers/ui/layout/index.json`, `custom-tab-bar/index.json` et `components/costumers/ui/custom-tab-bar/index.json`.
- Syntaxe JavaScript valide sur les fichiers modifies.
- `git diff --check` sans erreur.
- Verification que `<app-tab-bar />` n'est rendu que par `components/costumers/ui/custom-tab-bar/`.
