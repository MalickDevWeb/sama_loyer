# Tab Bar

## Purpose

`app-tab-bar` renders horizontal tab navigation from a list of tab items. Its responsibility is to display tabs, show the active state, and navigate to the selected tab URL.

Each page owns its content. For example, `home`, `explorer`, `favoris`, and `voyage` each render their own content, then reuse the same component with a different `activeTab`.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `tabs` | `Array` | `[]` | Tab list. Each item uses `{ id, label, iconImage?, url? }`. |
| `activeTab` | `String` | `''` | Id of the active tab. |
| `navigationType` | `String` | `'redirectTo'` | Navigation method used when a tab has a `url`: `navigateTo`, `redirectTo`, `switchTab`, or `reLaunch`. |
| `containerClass` | `String` | `''` | Extra CSS class for the tab row. |
| `itemClass` | `String` | `''` | Extra CSS class for each tab item. |
| `activeItemClass` | `String` | `''` | Extra CSS class applied only to the active tab item. |
| `iconClass` | `String` | `''` | Extra CSS class for icons. |
| `labelClass` | `String` | `''` | Extra CSS class for labels. |

## Event

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ tab }` | Fired before navigation. Useful if a page wants to track the change. |

## Usage

### WXML

```xml
<app-tab-bar
  tabs="{{ tabs }}"
  activeTab="{{ activeTab }}"
/>
```

### JS

```js
import { MAIN_TABS } from '../../utils/constants/index';

Page({
  data: {
    activeTab: 'home',
    tabs: MAIN_TABS
  }
});
```

## Page Navigation

URLs are centralized in `MAIN_TABS`:

```js
export const MAIN_TABS = [
  { id: 'home', label: 'Accueil', iconImage: '/assets/icons/home.png', url: '/pages/home/home' },
  { id: 'explorer', label: 'Explorer', iconImage: '/assets/icons/explore.png', url: '/pages/explorer/explorer' },
  { id: 'favorites', label: 'Favoris', iconImage: '/assets/icons/favoris.png', url: '/pages/favoris/favoris' },
  { id: 'voyages', label: 'Voyages', iconImage: '/assets/icons/voyage.png', url: '/pages/voyage/voyage' }
];
```

Each page sets its active tab:

```js
Page({
  data: {
    activeTab: 'explorer',
    tabs: MAIN_TABS
  }
});
```

### JSON

```json
{
  "usingComponents": {
    "app-tab-bar": "/components/ui/tab-bar/index"
  }
}
```

## Styling

Two styling options are supported:

- pass camelCase properties, for example `itemClass="home-tab-item"`;
- use WeChat external classes, for example `item-class="home-tab-item"`.

```xml
<app-tab-bar
  tabs="{{ tabs }}"
  activeTab="{{ activeTab }}"
  itemClass="home-tab-item"
  activeItemClass="home-tab-item-active"
/>
```

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
