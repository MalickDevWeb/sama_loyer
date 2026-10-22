# Modal

## Purpose

A versatile dialog/overlay component supporting center and bottom-sheet placements, configurable backdrop colour and blur, multiple size presets, and three named slots for header, content, and footer. Uses `multipleSlots` and `apply-shared` style isolation so parent styles can flow in.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `visible` | `Boolean` | `false` | Controls whether the modal is shown. |
| `placement` | `String` | `'center'` | Where the dialog appears -- `'center'` or `'bottom'` (bottom sheet). |
| `size` | `String` | `'md'` | Width preset -- `'sm'` (60%), `'md'` (80%), `'lg'` (90%), or `'full'` (100%). |
| `overlayColor` | `String` | `'#000'` | Backdrop hex colour. |
| `overlayOpacity` | `Number` | `0.5` | Backdrop opacity (0--1). |
| `blur` | `Number` | `6` | Backdrop `backdrop-filter: blur()` value in pixels. |
| `backdropClosable` | `Boolean` | `true` | When `true`, tapping the overlay fires the `close` event. |
| `containerClass` | `String` | `''` | Additional CSS class(es) on the dialog container. |
| `overlayClass` | `String` | `''` | Additional CSS class(es) on the overlay backdrop. |
| `hasHeader` | `Boolean` | `false` | Set to `true` to render the `header` slot wrapper. |
| `hasContent` | `Boolean` | `false` | Set to `true` to render the `content` slot wrapper. |
| `hasFooter` | `Boolean` | `false` | Set to `true` to render the `footer` slot wrapper. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `close` | -- | Fired when the user taps the backdrop (only when `backdropClosable` is `true`). |

## Slots

| Slot | Description |
|------|-------------|
| `header` | Modal header area (requires `hasHeader="{{true}}"` to render). |
| `content` | Modal body area (requires `hasContent="{{true}}"` to render). |
| `footer` | Modal footer area, typically for action buttons (requires `hasFooter="{{true}}"` to render). |

## Usage

```xml
<!-- WXML -->
<app-modal
  visible="{{ showDialog }}"
  placement="center"
  size="md"
  hasHeader="{{true}}"
  hasContent="{{true}}"
  hasFooter="{{true}}"
  bind:close="onCloseModal"
>
  <view slot="header">Confirm Action</view>
  <view slot="content">Are you sure you want to proceed?</view>
  <view slot="footer">
    <app-button type="secondary" bind:onPress="onCloseModal">Cancel</app-button>
    <app-button type="primary" bind:onPress="onConfirm">OK</app-button>
  </view>
</app-modal>

<!-- Bottom sheet -->
<app-modal visible="{{ showSheet }}" placement="bottom" size="full" bind:close="onCloseSheet">
  <!-- ... -->
</app-modal>
```

```json
{
  "usingComponents": {
    "app-modal": "/components/ui/modal/index"
  }
}
```

## See Also

- [Button component](../button/README.md) -- commonly used inside modal footers
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
