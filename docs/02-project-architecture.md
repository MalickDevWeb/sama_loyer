# Project Architecture

## High-Level Overview

```
┌──────────────────────────────────────────────────────────────┐
│                          app.js                               │
│  EventBus (Bus) · initPromise · Error Handlers · Network     │
└──────────────┬───────────────────────────────┬───────────────┘
               │                               │
    ┌──────────▼──────────┐         ┌──────────▼──────────┐
    │       Pages          │         │     Components       │
    │  pages/index/        │         │  components/costumers/ui/      │
    │  pages/demo/         │         │  button, modal,      │
    │                      │         │  nav-bar, stepper... │
    └──────────┬───────────┘         └─────────────────────┘
               │
    ┌──────────▼──────────────────────────────────────────┐
    │                    Utils Layer                        │
    │                                                      │
    │  ┌─────────┐  ┌──────────┐  ┌────────────────────┐  │
    │  │ EventBus │  │ BackendAPI│  │  JSON Sculpt       │  │
    │  │ (state)  │  │ (service) │  │  (transformation)  │  │
    │  └─────────┘  └─────┬─────┘  └────────────────────┘  │
    │                      │                                │
    │            ┌─────────┼─────────┐                      │
    │            │         │         │                      │
    │      ┌─────▼───┐ ┌──▼────┐ ┌──▼──────────┐          │
    │      │ auth.js  │ │http.js│ │ native.js   │          │
    │      │ (OAuth2) │ │(HTTP) │ │ (plugins)   │          │
    │      └──────────┘ └───────┘ └─────────────┘          │
    │                                                      │
    │  storage.js · formatters/ · helpers/ · behaviors/    │
    │  wxs/ · constants/ · config.js                       │
    └──────────────────────────────────────────────────────┘
```

## Data Flow: App Launch → First Render

```
1. App() constructor
   └─► onLaunch()
       ├─► checkForUpdates()              // wx.getUpdateManager
       ├─► setupNetworkListener()          // wx.onNetworkStatusChange
       │   └─► Bus.setState('network.connected', true/false)
       │
       └─► initializeApp()  ──stored as──► globalData.initPromise
           ├─► nativeService.getUserInfos()   // with retry + backoff
           │   └─► invokePlugin('userInfos')  // wx.invokeNativePlugin
           ├─► Bus.setState('user.data', { msisdn, fullName })
           └─► Bus.emit('user.loaded')

2. Page.onLoad()
   └─► await app.globalData.initPromise   // blocks until init completes
       └─► Bus.getState('user.data')      // read current state
       └─► Bus.onState('user.data', cb)   // subscribe to changes
       └─► this.setData({ ... })          // render
```

## Data Flow: API Call

```
Page method
  └─► backendAPI.getItems()
      ├─► authenticate()
      │   ├─► Check cached token in wx.getStorageSync
      │   │   └─► Valid? Return cached token
      │   └─► Expired? POST to AUTH_URL
      │       └─► Cache new token + set expiry
      │       └─► httpClient.setToken(token)g
      │
      ├─► httpClient.get('/items', { query })
      │   └─► wx.request({
      │         headers: {
      │           Authorization: 'Bearer <token>',
      │           X-Client-Ref: '<session-id>',
      │           X-Request-Id: '<session-id>-<count>'
      │         }
      │       })
      │   └─► Returns { success, data, error, headers, status }
      │
      └─► sculpt.data({ data: res.data, to: Schema })
          └─► Transformed, typed domain objects
```

## State Management: EventBus

The EventBus (singleton `Bus`) is the single source of truth for shared app state.

```
┌─────────────┐                    ┌──────────────┐
│   app.js    │                    │   page.js    │
│             │  Bus.setState()    │              │
│ initializeApp──────────────────►│  Bus.onState()│
│             │  'user.data'       │  ↓           │
│             │                    │  setData()   │
└─────────────┘                    └──────────────┘
                                          │
              Bus.emit('user.loaded')     │
              ─────────────────────►  Bus.on() handler
```

**Two subscription patterns in this boilerplate:**

1. **Manual** (pages/index) — Direct `Bus.onState()` + cleanup in `onUnload`
2. **Helper-based** (pages/demo) — `createPageHelpers(this, bindings)` auto-subscribes

## Module Dependency Graph

```
app.js
  ├── utils/event/index.js          (Bus singleton)
  └── utils/apis/native.js          (nativeService)

pages/*
  ├── utils/helpers/page.js          (createPageHelpers, showToast)
  └── utils/behaviors/loading.js     (loadingBehavior)

utils/apis/index.js (BackendAPI)
  ├── utils/apis/auth.js             (authenticate)
  ├── utils/apis/http.js             (httpClient)
  ├── utils/json-sculpt/sculpt.js    (sculpt)
  └── utils/mappers/*.sculpt.js      (schemas)

utils/apis/auth.js
  ├── utils/apis/http.js             (httpClient)
  ├── utils/config.js                (config)
  └── utils/constants/index.js       (STORAGE_KEYS, AUTH_CONFIG)

utils/apis/http.js
  ├── utils/config.js                (config.BASE_URL)
  └── utils/constants/index.js       (HTTP_CONFIG)
```

## Error Handling Strategy

| Layer | Mechanism | Catches |
|-------|-----------|---------|
| `app.js onError` | Global sync handler | Uncaught errors from any page |
| `app.js onUnhandledRejection` | Global async handler | Forgotten `.catch()` on Promises |
| `app.js onPageNotFound` | 404 handler | Navigation to non-existent pages |
| `loadingBehavior.withLoading()` | Page-level try/catch | Async operations with UI feedback |
| `retryAsync()` | Retry with backoff | Flaky API calls |
| `withRetry()` | Native plugin retry | Native plugin timing issues |
| `httpClient` | Unified response format | HTTP errors → `{ success: false, error }` |
| `storage.js` | Silent try/catch | Storage quota and corruption |

## File Naming Conventions

| Pattern | Example | Used For |
|---------|---------|----------|
| `index.js` in folder | `components/ui/button/index.js` | Components, modules |
| 4-file set | `.js`, `.wxml`, `.wxss`, `.json` | Pages and components |
| `*.sculpt.js` | `mappers/example.sculpt.js` | Sculpt transformation schemas |
| `.wxs` | `wxs/filters.wxs` | WXS view-thread scripts |

## See Also

- [App Lifecycle](04-app-lifecycle.md) — Detailed app.js walkthrough
- [EventBus Guide](05-eventbus-guide.md) — Complete state management API
- [API Layer](06-api-layer.md) — HTTP, auth, and native service details
