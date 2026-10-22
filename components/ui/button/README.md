# Button

## Purpose

A styled action button supporting primary and secondary variants with built-in loading spinner, disabled state, and press (touch) animation. Use it for all tap-to-act interactions throughout the mini-program.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `type` | `String` | `'primary'` | Visual variant -- `'primary'` or `'secondary'`. |
| `disabled` | `Boolean` | `false` | Disables the button and prevents tap events. |
| `loading` | `Boolean` | `false` | Shows an inline spinner and disables interaction. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `onPress` | -- | Fired on tap when the button is neither `disabled` nor `loading`. |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Button label / inner content. Shown next to the spinner when `loading` is `true`. |

## Usage

```xml
<!-- WXML -->
<app-button type="primary" loading="{{ submitting }}" bind:onPress="handleSubmit">
  Submit
</app-button>

<app-button type="secondary" disabled="{{ !canProceed }}" bind:onPress="handleCancel">
  Cancel
</app-button>
```

```json
{
  "usingComponents": {
    "app-button": "/components/ui/button/index"
  }
}
```

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
