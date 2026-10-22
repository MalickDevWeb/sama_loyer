# Barre d'onglets

## Objectif

`app-tab-bar` affiche une navigation horizontale a partir d'une liste d'onglets. Sa responsabilite est de presenter les onglets, d'afficher l'etat actif et de naviguer vers l'URL de l'onglet selectionne.

Le contenu associe a chaque onglet reste dans sa page. Par exemple, `home`, `explorer`, `favoris` et `voyage` affichent chacun leur contenu, puis reutilisent le meme composant en changeant seulement `activeTab`.

## Proprietes

| Propriete | Type | Par defaut | Description |
|----------|------|------------|-------------|
| `tabs` | `Array` | `[]` | Liste des onglets. Chaque item utilise `{ id, label, iconImage?, url? }`. |
| `activeTab` | `String` | `''` | Identifiant de l'onglet actif. |
| `navigationType` | `String` | `'redirectTo'` | Methode de navigation utilisee quand un onglet a une `url`: `navigateTo`, `redirectTo`, `switchTab` ou `reLaunch`. |
| `containerClass` | `String` | `''` | Classe CSS supplementaire pour la ligne d'onglets. |
| `itemClass` | `String` | `''` | Classe CSS supplementaire pour chaque onglet. |
| `activeItemClass` | `String` | `''` | Classe CSS supplementaire appliquee seulement a l'onglet actif. |
| `iconClass` | `String` | `''` | Classe CSS supplementaire pour les icones. |
| `labelClass` | `String` | `''` | Classe CSS supplementaire pour les labels. |

## Evenement

| Evenement | Detail | Description |
|----------|--------|-------------|
| `change` | `{ tab }` | Declenche avant la navigation. Utile si une page veut suivre le changement. |

## Utilisation

### WXML

```xml
<app-tab-bar
  tabs="{{ tabs }}"
  activeTab="{{ activeTab }}"
/>
```

### JS

```js
import { MAIN_TABS } from '../../utils/constants/index';

Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS
  }
});
```

### JSON

```json
{
  "usingComponents": {
    "app-tab-bar": "/components/ui/tab-bar/index"
  }
}
```

## Personnalisation du style

Deux styles sont possibles:

- passer des proprietes camelCase, par exemple `itemClass="home-tab-item"`;
- utiliser les classes externes WeChat, par exemple `item-class="home-tab-item"`.

```xml
<app-tab-bar
  tabs="{{ tabs }}"
  activeTab="{{ activeTab }}"
  itemClass="home-tab-item"
  activeItemClass="home-tab-item-active"
/>
```

## Navigation entre pages

Les URLs sont centralisees dans `MAIN_TABS`:

```js
export const MAIN_TABS = [
  { id: 'home', label: 'Accueil', iconImage: '/assets/icons/home.png', url: '/pages/home/home' },
  { id: 'explorer', label: 'Explorer', iconImage: '/assets/icons/explore.png', url: '/pages/explorer/explorer' },
  { id: 'favorites', label: 'Favoris', iconImage: '/assets/icons/favoris.png', url: '/pages/favoris/favoris' },
  { id: 'voyages', label: 'Voyages', iconImage: '/assets/icons/voyage.png', url: '/pages/voyage/voyage' }
];
```

Chaque page donne son onglet actif:

```js
Page({
  data: {
    activeTab: 'explorer',
    tabs: MAIN_TABS
  }
});
```

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
