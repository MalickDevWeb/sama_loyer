# Icon (Base)

## Purpose

Renders an icon image from the global icon sprite directory (`/assets/icons/global/`). The component automatically constructs the image path from the `icon` name, supports configurable dimensions, and can optionally display a coloured background circle behind the icon.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `icon` | `String` | `''` | Icon file name (without extension). The component loads `/assets/icons/global/<icon>.png`. |
| `width` | `Number` | `50` | Icon image width in `rpx`. |
| `height` | `Number` | `50` | Icon image height in `rpx`. |
| `enableBg` | `Boolean` | `false` | When `true`, shows a circular background behind the icon. |
| `bgColor` | `String` | `'#F3F3F3'` | Background colour applied when `enableBg` is `true`. |
| `containerClass` | `String` | `''` | Additional CSS class(es) on the outer wrapper. |

> **Note:** The outer container dimensions are automatically calculated as `width + 40rpx` by `height + 40rpx` to provide padding around the icon.

## Events

None.

## Slots

None.

## Usage

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

## See Also

- [Image component](../../image/README.md) -- used internally by the icon component
- [Components Overview](../../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../../docs/14-recipes.md#adding-a-new-component)
