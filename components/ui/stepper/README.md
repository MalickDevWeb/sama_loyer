# Stepper

## Purpose

A step indicator for multi-step flows such as checkout, forms, and onboarding. Displays numbered steps with labels, connecting lines, and completed/active/pending visual states. Steps can be simple strings or objects with labels, values, and disabled flags. Supports three visual variants.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `steps` | `Array` | `[]` | Array of step definitions. Each element can be a plain `String` (used as the label) or an object `{ label, value?, disabled? }`. |
| `current` | `Number\|String` | `0` | The active step, specified as either a numeric index or a step `value` string. |
| `showLines` | `Boolean` | `true` | Whether to render connecting lines between steps. |
| `clickable` | `Boolean` | `false` | When `true`, users can tap a step to navigate to it (fires `change`). |
| `variant` | `String` | `'default'` | Visual style -- `'default'`, `'compact'`, or `'pill'`. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ value, index, label }` | Fired when the user taps a step (only when `clickable` is `true` and the step is not `disabled`). |

## Slots

None.

## Usage

```xml
<!-- WXML: simple string steps -->
<app-stepper
  steps="{{ ['Cart', 'Shipping', 'Payment', 'Done'] }}"
  current="{{1}}"
/>

<!-- WXML: object steps with clickable navigation -->
<app-stepper
  steps="{{ steps }}"
  current="{{ currentStep }}"
  clickable="{{true}}"
  variant="compact"
  bind:change="onStepChange"
/>
```

```js
// JS
Page({
  data: {
    currentStep: 'shipping',
    steps: [
      { label: 'Cart', value: 'cart' },
      { label: 'Shipping', value: 'shipping' },
      { label: 'Payment', value: 'payment', disabled: true },
      { label: 'Confirmation', value: 'confirm', disabled: true }
    ]
  },
  onStepChange(e) {
    this.setData({ currentStep: e.detail.value });
  }
});
```

```json
{
  "usingComponents": {
    "app-stepper": "/components/ui/stepper/index"
  }
}
```

## See Also

- [Typography component](../typography/README.md) -- used internally for step labels
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
