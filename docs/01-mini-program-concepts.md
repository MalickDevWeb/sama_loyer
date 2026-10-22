# Mini-Program Concepts for Web Developers

If you've built web apps but never touched a mini-program, this is your starting point. Everything here applies to both WeChat Mini Programs and TCMPP.

## What Is a Mini-Program?

A mini-program is an app-within-an-app. It runs inside a host app (like WeChat or a TCMPP-powered app) and uses the host's runtime instead of a browser.

| Feature | Web App | Mini-Program | React Native |
|---------|---------|-------------|--------------|
| Runs in | Browser | Host app (WeChat, TCMPP) | Native shell |
| DOM access | Yes | No | No |
| File size limit | None | 20 MB | None |
| Installation | None (URL) | None (scanned/shared) | App store |
| APIs | Web APIs | wx.* APIs | Native bridges |
| Offline | Service Workers | Built-in caching | Built-in |

## The Dual-Thread Runtime

This is the single most important concept. Mini-programs run on **two threads**:

```
┌─────────────────┐          ┌──────────────────┐
│   JS Thread      │          │   Render Thread   │
│   (Logic)        │          │   (View)          │
│                  │          │                   │
│  Page data       │──────────│  WXML templates   │
│  Event handlers  │ setData()│  WXSS styles      │
│  API calls       │──────────│  WXS scripts      │
│  Business logic  │          │                   │
└─────────────────┘          └──────────────────┘
```

**What this means:**
- You **cannot** touch the DOM. There is no `document.querySelector`.
- The only way to update the UI is `this.setData({ key: value })`.
- `setData()` serializes data, sends it across threads, and triggers a re-render.
- Fewer `setData()` calls = better performance. Batch your updates.

## File Types

Every page and component consists of up to 4 files:

| Extension | Purpose | Web Equivalent |
|-----------|---------|---------------|
| `.js` | Logic, data, event handlers | JavaScript |
| `.wxml` | Templates (XML-based markup) | HTML/JSX |
| `.wxss` | Styles (CSS subset) | CSS |
| `.json` | Configuration (component declarations, window settings) | N/A |
| `.wxs` | View-thread scripts (ES5 only, fast) | N/A (see below) |

### WXML — Templates

WXML uses directives instead of JavaScript expressions:

```xml
<!-- Conditional rendering -->
<view wx:if="{{ isLoggedIn }}">Welcome, {{ userName }}</view>
<view wx:else>Please log in</view>

<!-- List rendering -->
<view wx:for="{{ items }}" wx:key="id">
  {{ index }}: {{ item.name }}
</view>

<!-- Event binding -->
<button bind:tap="handleTap">Tap me</button>
```

### WXSS — Styles

Standard CSS with one addition: `rpx` (responsive pixels).

- **750rpx = screen width** on any device
- On an iPhone 6 (375pt wide): `1rpx = 0.5px`
- Use `rpx` for layout, `px` for borders and fine details

```css
.card {
  width: 690rpx;      /* ~92% of screen width */
  padding: 24rpx;
  border: 1px solid #eee;  /* fine detail: use px */
  border-radius: 16rpx;
}
```

### WXS — View-Thread Scripts

WXS runs in the **render thread** (not the JS thread), making it faster for display-only logic like formatting dates or computing CSS classes.

**Constraints:**
- ES5 only (no arrow functions, no `let`/`const`, no template literals)
- Cannot call `wx.*` APIs
- Cannot import `.js` modules
- Read-only — cannot modify page data

See [WXS Filters Guide](10-wxs-filters.md) for details.

## Page Lifecycle

```
onLoad(options)     Called once when page is created (receives URL query params)
    │
    ▼
onShow()            Called every time page becomes visible (also on tab switch back)
    │
    ▼
onReady()           Called once when first render completes (DOM-equivalent ready)
    │
    ▼
onHide()            Called when page is hidden (navigating away, tab switch)
    │
    ▼
onUnload()          Called once when page is destroyed (navigateBack, redirectTo)
```

**Key points:**
- `onLoad` receives query parameters: `onLoad(options)` → `options.id` for `/pages/detail/index?id=42`
- `onShow` fires every time you come back to the page (back button, tab switch)
- `onUnload` is where you clean up subscriptions and timers
- `onHide` fires when navigating forward (page stays in stack) or switching tabs

## Component Lifecycle

```
created()           Instance created (no setData yet, properties not available)
    │
    ▼
attached()          Inserted into the page (properties available, can setData)
    │
    ▼
ready()             First render complete
    │
    ▼
detached()          Removed from page (cleanup here)
```

### Component vs Page

```javascript
// Page — uses Page() constructor
Page({
  data: { count: 0 },
  onLoad() { /* lifecycle */ },
  handleTap() { /* event handler */ },
});

// Component — uses Component() constructor
Component({
  properties: {
    title: { type: String, value: '' },    // external props
  },
  data: { internal: false },                // internal state
  methods: {
    handleTap() { /* must be inside methods */ },
  },
  lifetimes: {
    attached() { /* lifecycle hooks are inside lifetimes */ },
  },
});
```

### Slots

Components can accept child content via slots:

```xml
<!-- Component template (my-card.wxml) -->
<view class="card">
  <slot name="header"></slot>
  <slot></slot>  <!-- default slot -->
</view>

<!-- Usage -->
<my-card>
  <view slot="header">Title</view>
  <text>Card body content</text>
</my-card>
```

Enable named slots in component JSON: `"options": { "multipleSlots": true }`

### Behavior() — Mixins

Behaviors let you share data, methods, and lifecycle hooks across pages and components:

```javascript
// Shared behavior
const myBehavior = Behavior({
  data: { shared: true },
  methods: { sharedMethod() { /* ... */ } },
});

// Use in a page or component
Page({
  behaviors: [myBehavior],
  // Now has access to this.data.shared and this.sharedMethod()
});
```

See [Behaviors Guide](11-behaviors-guide.md) for details.

## The wx.* API Surface

| Category | Examples |
|----------|---------|
| **Navigation** | `wx.navigateTo`, `wx.redirectTo`, `wx.switchTab`, `wx.navigateBack`, `wx.reLaunch` |
| **Storage** | `wx.getStorageSync`, `wx.setStorageSync`, `wx.removeStorageSync`, `wx.clearStorageSync` |
| **Network** | `wx.request`, `wx.uploadFile`, `wx.downloadFile`, `wx.connectSocket` |
| **UI** | `wx.showToast`, `wx.showLoading`, `wx.showModal`, `wx.showActionSheet` |
| **Device** | `wx.getSystemInfoSync`, `wx.getNetworkType`, `wx.onNetworkStatusChange` |
| **Media** | `wx.chooseImage`, `wx.previewImage`, `wx.createCameraContext` |
| **Location** | `wx.getLocation`, `wx.openLocation`, `wx.chooseLocation` |

Most `wx.*` APIs use a callback pattern:
```javascript
wx.request({
  url: 'https://api.example.com/data',
  method: 'GET',
  success(res) { console.log(res.data); },
  fail(err) { console.error(err); },
});
```

This boilerplate wraps callbacks in Promises (see [API Layer](06-api-layer.md)).

## TCMPP vs Standard WeChat

TCMPP (Tencent Cloud Mini Program Platform) extends standard WeChat Mini Programs:

| Feature | WeChat | TCMPP |
|---------|--------|-------|
| Host app | WeChat only | Any app using TCMPP SDK |
| Native plugins | Limited | `wx.invokeNativePlugin` for deep native access |
| Distribution | WeChat ecosystem | Your own app ecosystem |
| Dev tools | WeChat DevTools | TCMPP Developer Tools |
| Config file | `project.config.json` | Same, with `TCMPPLibVersion` and `SASappid` fields |

## Web → Mini-Program Translation Table

| Web Concept | Mini-Program Equivalent |
|------------|----------------------|
| `document.querySelector` | `this.selectComponent('#id')` or `wx.createSelectorQuery()` |
| `window.location` | `getCurrentPages()` |
| `window.addEventListener` | `wx.onNetworkStatusChange`, etc. |
| `localStorage` | `wx.getStorageSync` / `wx.setStorageSync` (10 MB limit) |
| `fetch` / `XMLHttpRequest` | `wx.request` |
| `<a href>` | `wx.navigateTo({ url: '...' })` |
| React Context / Redux | EventBus (this boilerplate) or `getApp().globalData` |
| CSS Modules | `styleIsolation` option in Component |
| `npm install` | Supported (enable `nodeModules: true` in project.config.json) |
| Service Worker | Built-in caching (mini-programs are cached on device) |
| `<img>` | `<image>` (different tag name!) |
| `onclick` | `bind:tap` (different event naming!) |
| `className` | `class` (no JSX here) |

## Common Gotchas

1. **10-page stack limit** — `wx.navigateTo` silently fails after 10 pages. This boilerplate's [navigation helpers](12-navigation-guide.md) handle this automatically.
2. **10 MB storage limit** — `wx.setStorageSync` throws on quota exceeded. This boilerplate's [storage wrapper](13-storage-guide.md) catches these errors.
3. **setData() performance** — Sending large objects across threads is expensive. Only send what changed.
4. **No hot module replacement** — The DevTools simulator does auto-refresh, but the entire page reloads.
5. **`<image>` not `<img>`** — Different tag name from HTML.
6. **`bind:tap` not `onclick`** — Different event syntax.
7. **rpx not px** — Use `rpx` for responsive layouts.

## See Also

- [Project Architecture](02-project-architecture.md) — How this boilerplate's pieces fit together
- [Getting Started](03-getting-started.md) — Setup and first run
- [Glossary](16-glossary.md) — Term definitions
