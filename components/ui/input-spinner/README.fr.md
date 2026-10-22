# Input Spinner

## Objectif

Un sélecteur de quantité numérique avec boutons moins et plus. La valeur est limitée entre des bornes `min` et `max` configurables, et les boutons se désactivent visuellement aux limites. Utilise `osn-icon` pour les icônes circle-minus et circle-plus.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `value` | `Number` | `1` | Valeur numérique courante. |
| `min` | `Number` | `1` | Valeur minimale autorisée. Le bouton moins est désactivé à cette valeur. |
| `max` | `Number` | `99` | Valeur maximale autorisée. Le bouton plus est désactivé à cette valeur. |
| `name` | `String` | `''` | Nom du champ inclus dans le détail `change`, utile pour le binding de formulaire. |
| `containerClass` | `String` | `''` | Classe(s) CSS supplémentaires sur le wrapper externe. |
| `iconClass` | `String` | `''` | Classe(s) CSS appliquées aux wrappers des boutons icônes. |
| `valueClass` | `String` | `''` | Classe(s) CSS appliquées à l'affichage de la valeur numérique. |

## Événements

| Événement | Détail | Description |
|-------|--------|-------------|
| `change` | `{ name, value }` | Déclenché quand l'utilisateur tape sur moins ou plus et que la valeur change. |

## Slots

Aucun.

## Utilisation

```xml
<!-- WXML -->
<app-input-spinner
  value="{{ quantity }}"
  min="{{1}}"
  max="{{10}}"
  name="qty"
  bind:change="onQuantityChange"
/>
```

```js
// JS
Page({
  data: { quantity: 1 },
  onQuantityChange(e) {
    this.setData({ quantity: e.detail.value });
  }
});
```

```json
{
  "usingComponents": {
    "app-input-spinner": "/components/ui/input-spinner/index"
  }
}
```

## Voir aussi

- [Icon component](../icons/base/README.md) — utilisé pour les boutons +/-
- [Input component](../input/README.md) — champ texte/date
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
