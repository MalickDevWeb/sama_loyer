# Icône (Base)

## Objectif

Rend une image d'icône depuis le répertoire global d'icônes (`/assets/icons/global/`). Le composant construit automatiquement le chemin de l'image à partir du nom `icon`, prend en charge des dimensions configurables et peut afficher une pastille de fond colorée derrière l'icône.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `icon` | `String` | `''` | Nom du fichier d'icône (sans extension). Le composant charge `/assets/icons/global/<icon>.png`. |
| `width` | `Number` | `50` | Largeur de l'icône en `rpx`. |
| `height` | `Number` | `50` | Hauteur de l'icône en `rpx`. |
| `enableBg` | `Boolean` | `false` | Si `true`, affiche un fond circulaire derrière l'icône. |
| `bgColor` | `String` | `'#F3F3F3'` | Couleur de fond appliquée lorsque `enableBg` est `true`. |
| `containerClass` | `String` | `''` | Classe(s) CSS supplémentaires sur le wrapper externe. |

> **Note :** Les dimensions du conteneur externe sont calculées automatiquement comme `width + 40rpx` par `height + 40rpx` pour fournir du padding autour de l'icône.

## Événements

Aucun.

## Slots

Aucun.

## Utilisation

```xml
<!-- WXML -->
<osn-icon icon="search" width="{{40}}" height="{{40}}" />

<osn-icon icon="profile" enableBg="{{true}}" bgColor="#E0F0FF" />
```

```json
{
  "usingComponents": {
    "osn-icon": "/components/ui/icons/base/index"
  }
}
```

## Voir aussi

- [Image component](../../image/README.md) — utilisé en interne par le composant icône
- [Components Overview](../../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../../docs/14-recipes.md#adding-a-new-component)
