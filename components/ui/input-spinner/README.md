# Input Spinner

## Purpose

A numeric quantity selector with minus and plus buttons. The value is clamped between configurable `min` and `max` bounds, and buttons are visually dimmed and disabled at the limits. Internally uses `osn-icon` for the circle-minus and circle-plus icons.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `value` | `Number` | `1` | Current numeric value. |
| `min` | `Number` | `1` | Minimum allowed value. The minus button is disabled at this value. |
| `max` | `Number` | `99` | Maximum allowed value. The plus button is disabled at this value. |
| `name` | `String` | `''` | Field name included in the `change` event detail, useful for form binding. |
| `containerClass` | `String` | `''` | Additional CSS class(es) on the outer wrapper. |
| `iconClass` | `String` | `''` | CSS class(es) applied to both icon button wrappers. |
| `valueClass` | `String` | `''` | CSS class(es) applied to the numeric value display. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ name, value }` | Fired when the user taps minus or plus and the value changes. |

## Slots

None.

## Usage

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

## See Also

- [Icon component](../icons/base/README.md) -- used internally for the +/- buttons
- [Input component](../input/README.md) -- text/date input
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
