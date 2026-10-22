# Center

## Purpose

A layout utility component that centers its child content both horizontally and vertically using flexbox. It supports optional fixed dimensions and an inline display mode for text-like content. Uses `virtualHost: true` so it does not create an extra wrapper node in the DOM.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `customClass` | `String` | `''` | Additional CSS class(es) appended to the centering container. |
| `width` | `String` | `''` | Optional explicit width (e.g., `'200rpx'`, `'100%'`). When empty, the component takes the width of its parent. |
| `height` | `String` | `''` | Optional explicit height. When empty, the component takes the height of its parent. |
| `inline` | `Boolean` | `false` | When `true`, the container uses `inline-flex` instead of `flex`, allowing it to sit inline with surrounding text or elements. |

## Events

None.

## Slots

| Slot | Description |
|------|-------------|
| (default) | The content to be centered. |

## Usage

```xml
<!-- WXML -->
<!-- Full-width, full-height centering -->
<app-center width="100%" height="300rpx">
  <text>Centered content</text>
</app-center>

<!-- Inline centering -->
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

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
