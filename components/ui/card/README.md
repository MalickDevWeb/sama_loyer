# Card

## Purpose

A simple container component that wraps its children in a bordered, rounded card layout. Use it to visually group related content such as list items, form sections, or summary blocks.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `containerClass` | `String` | `''` | Additional CSS class(es) appended to the card wrapper for custom styling. |

## Events

None.

## Slots

| Slot | Description |
|------|-------------|
| (default) | All card content -- headings, body text, actions, etc. |

## Usage

```xml
<!-- WXML -->
<app-card containerClass="p-3">
  <view class="fw-bold">Order #1234</view>
  <view>Status: Shipped</view>
</app-card>
```

```json
{
  "usingComponents": {
    "app-card": "/components/ui/card/index"
  }
}
```

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
