# Center

## Objectif

Un composant utilitaire de mise en page qui centre son contenu enfant à la fois horizontalement et verticalement en utilisant flexbox. Il prend en charge des dimensions fixes facultatives et un mode inline pour les contenus de type texte. Utilise `virtualHost: true` pour ne pas créer de nœud wrapper supplémentaire dans le DOM.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `customClass` | `String` | `''` | Classe(s) CSS supplémentaires ajoutées au conteneur de centrage. |
| `width` | `String` | `''` | Largeur explicite optionnelle (par ex. `'200rpx'`, `'100%'`). Si vide, le composant prend la largeur du parent. |
| `height` | `String` | `''` | Hauteur explicite optionnelle. Si vide, le composant prend la hauteur du parent. |
| `inline` | `Boolean` | `false` | Si `true`, le conteneur utilise `inline-flex` pour pouvoir s'aligner en ligne avec le contenu environnant. |

## Événements

Aucun.

## Slots

| Slot | Description |
|------|-------------|
| (default) | Le contenu à centrer. |

## Utilisation

```xml
<!-- WXML -->
<!-- Centrage largeur complète, hauteur fixe -->
<app-center width="100%" height="300rpx">
  <text>Centered content</text>
</app-center>

<!-- Centrage inline -->
<app-center inline="{{true}}" customClass="my-badge">
  <text>3</text>
</app-center>
```

```json
{
  "usingComponents": {
    "app-center": "/components/ui/center/index"
  }
}
```

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
