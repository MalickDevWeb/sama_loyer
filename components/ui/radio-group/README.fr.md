# Groupe de radio

## Objectif

Un groupe d'options à sélection unique qui rend une liste d'éléments de type radio avec un indicateur circulaire. Chaque option peut projeter du contenu personnalisé via des slots nommés, et la valeur sélectionnée est mise en évidence avec des classes actives/inactives configurables.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `options` | `Array` | -- | Tableau d'objets option. Chaque objet doit avoir au minimum `value` et éventuellement un nom de `slot` pour le contenu personnalisé (par ex. `[{ value: 'a', slot: 'opt-a' }]`). |
| `value` | `String` | `''` | Valeur actuellement sélectionnée. |
| `containerClass` | `String` | `''` | Classe(s) CSS sur le wrapper externe. |
| `itemClass` | `String` | `''` | Classe(s) CSS appliquées à chaque ligne d'option. |
| `activeClass` | `String` | `''` | Classe(s) CSS appliquées à l'option sélectionnée. |
| `inactiveClass` | `String` | `''` | Classe(s) CSS appliquées aux options non sélectionnées. |

## Événements

| Événement | Détail | Description |
|-------|--------|-------------|
| `change` | `{ value }` | Déclenché quand l'utilisateur tape une option. `value` est la valeur de l'option. |

## Slots

| Slot | Description |
|------|-------------|
| `<item.slot>` | Chaque option peut déclarer un nom de `slot` dans `options`. Fournissez un slot nommé correspondant pour rendre un contenu personnalisé pour l'option. |

## Utilisation

```xml
<!-- WXML -->
<app-radio-group
  options="{{ paymentOptions }}"
  value="{{ selectedPayment }}"
  activeClass="bg-primary-light"
  bind:change="onPaymentChange"
>
  <view slot="credit-card">
    <text>Credit Card</text>
  </view>
  <view slot="paypal">
    <text>PayPal</text>
  </view>
</app-radio-group>
```

```js
// JS
Page({
  data: {
    selectedPayment: 'credit-card',
    paymentOptions: [
      { value: 'credit-card', slot: 'credit-card' },
      { value: 'paypal', slot: 'paypal' }
    ]
  },
  onPaymentChange(e) {
    this.setData({ selectedPayment: e.detail.value });
  }
});
```

```json
{
  "usingComponents": {
    "app-radio-group": "/components/ui/radio-group/index"
  }
}
```

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
