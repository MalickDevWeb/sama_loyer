# App Lifecycle

`app.js` is the entry point for the entire mini-program. It runs once and stays alive for the app's lifetime.

## STATE_KEYS and EVENTS

Defined at the top of `app.js`, these are the contract for EventBus state and events:

```javascript
const STATE_KEYS = {
  APP_INITIALIZED: 'app.initialized',    // boolean — true when init completes
  APP_LOADING: 'app.loading',            // boolean — true during initialization
  NETWORK_CONNECTED: 'network.connected',// boolean — current connectivity
  NETWORK_TYPE: 'network.type',          // string — 'wifi', '4g', 'none', etc.
  USER_DATA: 'user.data',               // object — { msisdn, fullName }
  USER_NAME: 'user.name',               // string — display name
};

const EVENTS = {
  USER_LOADED: 'user.loaded',            // fired when user data is ready
  USER_NOT_FOUND: 'user.not_found',      // fired when no user found
  DATA_REFRESH: 'data.refresh',          // trigger data reload
  NETWORK_CHANGE: 'network.change',      // fired on connectivity change
  APP_ERROR: 'app.error',                // fired on any uncaught error
};
```

**To extend:** Add your keys to `STATE_KEYS` and `EVENTS`, then use them in pages via `app.globalData.STATE_KEYS`.

## onLaunch() Flow

```javascript
onLaunch() {
  Bus.setState(STATE_KEYS.APP_LOADING, true);
  Bus.setState(STATE_KEYS.APP_INITIALIZED, false);

  this.checkForUpdates();        // 1. Force-update check
  this.setupNetworkListener();   // 2. Network monitoring

  // 3. Async init stored as Promise
  this.globalData.initPromise = this.initializeApp()
    .catch((error) => console.error('[App] Init failed:', error))
    .finally(() => Bus.setState(STATE_KEYS.APP_LOADING, false));
},
```

### The initPromise Pattern

**Problem:** Pages load before app data is ready. If a page reads user data in `onLoad()`, it may get `undefined`.

**Solution:** Store the initialization as a Promise. Pages `await` it:

```javascript
// In any page's onLoad:
async onLoad() {
  await app.globalData.initPromise;  // Blocks until app init completes
  const user = Bus.getState(STATE_KEYS.USER_DATA);
  this.setData({ userName: user?.fullName });
}
```

## initializeApp()

The async initialization chain:

```javascript
async initializeApp() {
  // 1. Get user from native layer (with retry + exponential backoff)
  const { msisdn, fullName } = await nativeService.getUserInfos()
    .catch(() => ({ msisdn: null, fullName: null }));

  if (!msisdn) {
    Bus.emit(EVENTS.USER_NOT_FOUND);
    return;  // Optionally redirect to onboarding
  }

  // 2. Store in EventBus — all subscribed pages get notified
  Bus.setState(STATE_KEYS.USER_DATA, { msisdn, fullName });
  Bus.setState(STATE_KEYS.USER_NAME, fullName);

  // 3. Mark as initialized
  Bus.setState(STATE_KEYS.APP_INITIALIZED, true);
  Bus.emit(EVENTS.USER_LOADED);
}
```

**Customize this** for your app: add API calls, load config, setup background tasks.

## Update Manager

Mini-programs are cached on-device. Without explicit update checks, users can be stuck on old versions indefinitely.

```javascript
checkForUpdates() {
  if (!wx.getUpdateManager) return;
  const updateManager = wx.getUpdateManager();

  updateManager.onUpdateReady(() => {
    wx.showModal({
      title: 'Update Available',
      content: 'A new version is ready. Restart to apply.',
      showCancel: false,
      success: () => updateManager.applyUpdate(),
    });
  });
}
```

## Network Monitoring

Tracks connectivity so pages can react to offline/online transitions:

```javascript
setupNetworkListener() {
  // Initial state
  wx.getNetworkType({
    success: (res) => {
      Bus.setState(STATE_KEYS.NETWORK_TYPE, res.networkType);
      Bus.setState(STATE_KEYS.NETWORK_CONNECTED, res.networkType !== 'none');
    },
  });

  // Listen for changes
  wx.onNetworkStatusChange((res) => {
    Bus.setState(STATE_KEYS.NETWORK_TYPE, res.networkType);
    Bus.setState(STATE_KEYS.NETWORK_CONNECTED, res.isConnected);
    Bus.emit(EVENTS.NETWORK_CHANGE, { type: res.networkType, connected: res.isConnected });
  });
}
```

**Usage in a page:**
```javascript
const unsub = Bus.onState(STATE_KEYS.NETWORK_CONNECTED, (change) => {
  if (!change.value) showToast('You are offline', 'error');
});
```

## Error Handlers

Three global catchers:

| Handler | Catches | Example |
|---------|---------|---------|
| `onError(msg)` | Uncaught synchronous JS errors | Undefined variable access |
| `onUnhandledRejection(res)` | Forgotten `.catch()` on Promises | Unhandled API failure |
| `onPageNotFound(res)` | Navigation to non-existent pages | Redirects to home |

All errors emit `EVENTS.APP_ERROR` for centralized handling (analytics, monitoring).

## globalData

Accessible from any page via `getApp().globalData`:

```javascript
globalData: {
  eventBus: Bus,           // The EventBus singleton
  initPromise: null,       // Resolves when initialization completes
  STATE_KEYS,              // State key constants
  EVENTS,                  // Event name constants
}
```

## onShow / onHide

```javascript
onShow() {
  // App came to foreground — resume background tasks
  if (Bus.getState(STATE_KEYS.APP_INITIALIZED)) {
    // e.g., refresh data, restart timers
  }
},
onHide() {
  // App went to background — pause tasks, clear timers
},
```

## Extending app.js

### Adding a new state key

1. Add to `STATE_KEYS`:
   ```javascript
   const STATE_KEYS = {
     ...existing,
     MY_DATA: 'my.data',
   };
   ```
2. Set it during initialization or in a page:
   ```javascript
   Bus.setState(STATE_KEYS.MY_DATA, value);
   ```
3. Subscribe in pages:
   ```javascript
   Bus.onState(STATE_KEYS.MY_DATA, (change) => { ... });
   ```

### Adding initialization steps

Add to `initializeApp()`:
```javascript
async initializeApp() {
  // ...existing code...

  // Your new step:
  const config = await backendAPI.getConfig();
  Bus.setState('app.config', config);
}
```

## See Also

- [EventBus Guide](05-eventbus-guide.md) — Full API reference
- [API Layer](06-api-layer.md) — How `nativeService.getUserInfos()` works
- [Mini-Program Concepts](01-mini-program-concepts.md) — App lifecycle basics
