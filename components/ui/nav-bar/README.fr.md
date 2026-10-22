# Barre de navigation

## Objectif

Une barre de navigation personnalisée qui gère les insets de la zone sûre de la status bar, affiche un titre configurable et propose un bouton retour optionnel appelant `wx.navigateBack()`. Prend en charge un mode transparent pour les pages hero/image.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `title` | `String` | `''` | Texte affiché au centre de la barre de navigation. |
| `showBack` | `Boolean` | `true` | Si `true`, rend une flèche de retour qui navigue vers la page précédente. |
| `transparent` | `Boolean` | `false` | Si `true`, applique un style de fond transparent à la barre. |

## Événements

Aucun (le bouton retour navigue via `wx.navigateBack()` en interne).

## Slots

Aucun.

## Utilisation

```xml
<!-- WXML -->
<app-nav-bar title="My Page" />

<!-- Barre transparente sans bouton retour (par ex. page d'accueil) -->
<app-nav-bar title="Home" showBack="{{false}}" transparent="{{true}}" />
```

```json
{
  "usingComponents": {
    "app-nav-bar": "/components/ui/nav-bar/index"
  }
}
```

## Comportement interne

- À l'attachement, le composant lit `wx.getSystemInfoSync().statusBarHeight` et l'applique en padding supérieur pour que la barre soit sous la status bar.
- La hauteur fixe du contenu de la barre est de `44px`.

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
