# Image

## Purpose

A feature-rich image component that wraps the native `<image>` element with automatic retry on failure, local cache management, loading and error states, optional full-screen preview, overlay slot, and badge support. It communicates lifecycle events through the app-level event bus under a configurable namespace.

## Properties

### Core

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `src` | `String` | `''` | Image source URL. |
| `fallbackSrc` | `String` | `''` | Alternate URL used when retrying after a load failure. |
| `mode` | `String` | `'aspectFill'` | Image scaling mode (maps to the native `<image>` `mode` attribute). |
| `lazyLoad` | `Boolean` | `true` | Enable lazy loading. |
| `showMenuByLongpress` | `Boolean` | `false` | Show the native context menu on long-press. |

### Styling

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `width` | `String` | `''` | Image width. |
| `height` | `String` | `''` | Image height. |
| `containerClass` | `String` | `''` | CSS class for the outer container. |
| `imageClass` | `String` | `''` | CSS class for the `<image>` element. |
| `containerStyle` | `String` | `''` | Inline style for the outer container. |
| `imageStyle` | `String` | `''` | Inline style for the `<image>` element. |
| `overlayClass` | `String` | `''` | CSS class for the overlay wrapper. |
| `badge` | `String` | `''` | Badge text displayed over the image (e.g., `"NEW"`, `"3"`). |
| `badgeClass` | `String` | `''` | CSS class for the badge element. |
| `badgeStyle` | `String` | `''` | Inline style for the badge element. |

### UX Text

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `loadingText` | `String` | `''` | Text shown during the loading state. |
| `errorText` | `String` | `''` | Text shown when loading fails permanently. |
| `retryText` | `String` | `''` | Text shown alongside the error state to prompt retry. |
| `errorIcon` | `String` | `'⚠️'` | Icon/emoji displayed in the error state. |

### Behavior

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `previewable` | `Boolean` | `false` | When `true`, tapping the image opens a full-screen preview. |
| `previewUrls` | `Array` | `[]` | URLs for the preview gallery. Defaults to the current `src` if empty. |
| `retryCount` | `Number` | `3` | Maximum number of automatic retries on load failure. |
| `retryDelay` | `Number` | `1000` | Delay in milliseconds between retries. |

### Integration

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `cacheKey` | `String` | `''` | Custom cache key. Defaults to `src` when empty. |
| `namespace` | `String` | `'tc-image'` | Event-bus namespace prefix for all emitted events. |

## Events (Event Bus)

Events are emitted via the app-level `eventBus` under the configured `namespace`.

| Event | Payload | Description |
|-------|---------|-------------|
| `image:created` | `{ id, src, loading, error }` | Fired when the component attaches. |
| `image:loaded` | `{ id, src, loading, error }` | Fired after a successful load. |
| `image:error` | `{ id, src, loading, error }` | Fired when all retries are exhausted. |
| `image:retry` | `{ count }` | Fired before each retry attempt. |
| `image:load` | `{ id, detail }` | Fired on the native `<image>` load event. |
| `image:tap` | `{ id, src, loading, error }` | Fired when the image is tapped. |
| `image:longpress` | `{ id, src, loading, error }` | Fired on long-press. |
| `image:destroyed` | `{ id }` | Fired when the component detaches. |

## Slots

| Slot | Description |
|------|-------------|
| `overlay` | Custom overlay content rendered on top of the loaded image. |

## Methods (Public API)

| Method | Description |
|--------|-------------|
| `reload()` | Resets the error/loading state and re-fetches the image from `src`. |
| `getImageInfo()` | Returns `{ id, src, loading, error }` for the current state. |

## Usage

```xml
<!-- WXML -->
<osn-image
  src="https://example.com/photo.jpg"
  fallbackSrc="https://example.com/placeholder.jpg"
  mode="aspectFit"
  previewable="{{true}}"
  retryCount="{{2}}"
  badge="NEW"
  containerClass="rounded"
>
  <view slot="overlay" class="gradient-overlay" />
</osn-image>
```

```json
{
  "usingComponents": {
    "osn-image": "/components/ui/image/index"
  }
}
```

## See Also

- [Icon component](../icons/base/README.md) -- uses `osn-image` internally
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
