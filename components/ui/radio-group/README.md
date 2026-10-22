# Radio Group

## Purpose

A single-select option group that renders a list of radio-style items with a circular indicator. Each option can project custom content via named slots, and the selected value is highlighted with configurable active/inactive classes.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `options` | `Array` | -- | Array of option objects. Each object should have at minimum a `value` property and optionally a `slot` name for custom content (e.g., `[{ value: 'a', slot: 'opt-a' }]`). |
| `value` | `String` | `''` | The currently selected value. |
| `containerClass` | `String` | `''` | CSS class(es) on the outer wrapper. |
| `itemClass` | `String` | `''` | CSS class(es) applied to every option row. |
| `activeClass` | `String` | `''` | CSS class(es) applied to the currently selected option row. |
| `inactiveClass` | `String` | `''` | CSS class(es) applied to all non-selected option rows. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value }` | Fired when the user taps an option. `value` is the option's `value` property. |

## Slots

| Slot | Description |
|------|-------------|
| `<item.slot>` | Each option can declare a `slot` name in the `options` array. Provide a named slot matching that name to render custom label content for the option. |

## Usage

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

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
