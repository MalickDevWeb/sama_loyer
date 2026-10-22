# EventBus Guide

The EventBus is the state management and event system for this boilerplate. It's a singleton (`Bus`) shared across all pages and components via `app.globalData.eventBus`.

## Architecture

```
utils/event/
├── builder.js       # EventBus class (622 lines)
├── validator.js     # Input validation (event names, keys, callbacks)
├── types/
│   └── index.js     # JSDoc type definitions
└── index.js         # Bus singleton facade (exports Bus)
```

## Events vs State

| | Events | State |
|-|--------|-------|
| **Purpose** | Notify that something happened | Store a value |
| **Persistence** | Fire-and-forget | Persists until changed/removed |
| **Late subscribers** | Miss past events (unless replayed) | Can read current value anytime |
| **API** | `emit()` / `on()` | `setState()` / `getState()` / `onState()` |
| **Use for** | Actions, notifications | Data that pages need to read |

**Rule of thumb:** If a page needs to read the value on load, use **state**. If it's a one-time notification, use **events**.

## Event API

### Subscribe

```javascript
// Basic subscription
const unsub = Bus.on('user.loaded', (data) => {
  console.log('User loaded:', data);
});

// With options
const unsub = Bus.on('payment.completed', handler, {
  once: true,        // Auto-unsubscribe after first call
  priority: 10,      // Higher priority = called first (default: 0)
  namespace: 'checkout',  // For bulk cleanup
});

// One-time shorthand
Bus.once('user.loaded', handler);
```

### Emit

```javascript
// Emit with data
await Bus.emit('user.loaded', { id: 123, name: 'John' });

// Emit without data
await Bus.emit('data.refresh');
```

`emit()` is async because it runs through middleware.

### Unsubscribe

```javascript
// Using the returned function (recommended)
const unsub = Bus.on('event', handler);
unsub();  // Clean up

// By namespace (bulk cleanup)
Bus.offNamespace('checkout');  // Removes all listeners in 'checkout' namespace
```

### Wildcard Matching

```javascript
// Match one segment
Bus.on('user.*', handler);  // Matches: user.loaded, user.updated

// Match all remaining segments
Bus.on('payment.**', handler);  // Matches: payment.started, payment.step.completed
```

## State API

### Set State

```javascript
Bus.setState('user.data', { name: 'John', id: 123 });

// Silent (don't notify subscribers)
Bus.setState('internal.flag', true, true);
```

Every `setState()` automatically emits:
- `state.{key}` — e.g., `state.user.data`
- `state.changed` — global change notification

### Get State

```javascript
const user = Bus.getState('user.data');
const theme = Bus.getState('app.theme', 'light');  // with default
```

### Subscribe to State Changes

```javascript
const unsub = Bus.onState('user.data', (change) => {
  // change = { key, value, oldValue, timestamp }
  this.setData({ user: change.value });
});
```

### Remove State

```javascript
Bus.removeState('user.data');  // Emits state.user.data.removed
```

## Middleware

Middleware intercepts every `emit()` call. Use it for logging, auth guards, or rate limiting.

```javascript
// Add logging middleware
const removeMiddleware = Bus.use(async (eventData) => {
  console.log(`[Event] ${eventData.event}`, eventData.data);
});

// Cancel an event
Bus.use(async (eventData) => {
  if (eventData.event === 'purchase' && !isAuthenticated()) {
    eventData.cancelled = true;  // Prevents event from reaching listeners
  }
});

// Remove middleware
removeMiddleware();
```

## Replay

Late-joining components can catch up on events they missed:

```javascript
// Replay all 'user.*' events
const count = Bus.replay('user.*', (data, eventName) => {
  console.log(`Replayed ${eventName}:`, data);
});

// With filter
Bus.replay('payment.*', handler, (eventData) => {
  return eventData.timestamp > Date.now() - 60000;  // Last 60 seconds only
});
```

## History

```javascript
// Get all event history
const events = Bus.getEventHistory();

// Get history for specific event
const userEvents = Bus.getEventHistory('user.loaded');

// Get state change history
const stateChanges = Bus.getStateHistory('user.data');
```

## Configuration

```javascript
Bus.setDebug(true);                    // Log all operations to console
Bus.setStrictMode(false);              // Log errors instead of throwing
Bus.setHistoryRecording(true, 500);    // Record history, max 500 entries
Bus.clear();                           // Reset everything
```

## Patterns in This Boilerplate

### Pattern 1: Manual Subscription (pages/index)

```javascript
async onLoad() {
  await app.globalData.initPromise;
  const userData = Bus.getState(STATE_KEYS.USER_DATA);
  this.setData({ userName: userData?.fullName });

  this._unsubUser = Bus.onState(STATE_KEYS.USER_DATA, (change) => {
    this.setData({ userName: change.value?.fullName });
  });
},
onUnload() {
  if (typeof this._unsubUser === 'function') this._unsubUser();
}
```

### Pattern 2: Helper-Based Subscription (pages/demo)

```javascript
async onLoad() {
  await app.globalData.initPromise;
  this._helpers = createPageHelpers(this, {
    userName: STATE_KEYS.USER_NAME,  // page data key → EventBus state key
  });
  this._helpers.subscribe();
  this._helpers.loadInitial();
},
onUnload() {
  this._helpers?.unsubscribe();
}
```

## Common Mistakes

1. **Forgetting to unsubscribe in onUnload** — Causes memory leaks and stale callbacks
2. **Using `emit()` for data that pages need on load** — Use `setState()` instead
3. **Sending huge objects via state** — EventBus stores references, but `setData()` serializes. Keep state lean.
4. **Awaiting `emit()` in performance-critical paths** — `emit()` runs async middleware. Fire-and-forget if you don't need the result.

## Full API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `Bus.on(event, callback, options?)` | `() => void` | Subscribe to event |
| `Bus.once(event, callback, options?)` | `() => void` | Subscribe once |
| `Bus.off(event, listenerId)` | `boolean` | Unsubscribe by ID |
| `Bus.offNamespace(namespace)` | `number` | Remove all listeners in namespace |
| `Bus.emit(event, data?)` | `Promise<boolean>` | Emit event through middleware |
| `Bus.setState(key, value, silent?)` | `boolean` | Set state value |
| `Bus.getState(key, defaultValue?)` | `any` | Get state value |
| `Bus.onState(key, callback, options?)` | `() => void` | Subscribe to state changes |
| `Bus.removeState(key)` | `boolean` | Remove state key |
| `Bus.use(middleware)` | `() => void` | Add middleware |
| `Bus.replay(event, callback, filter?)` | `number` | Replay past events |
| `Bus.getEventHistory(event?)` | `EventData[]` | Get event history |
| `Bus.getStateHistory(key?)` | `StateChange[]` | Get state history |
| `Bus.setDebug(enabled)` | `void` | Toggle debug logging |
| `Bus.setStrictMode(enabled)` | `void` | Toggle strict validation |
| `Bus.setHistoryRecording(enabled, max?)` | `void` | Configure history |
| `Bus.clear()` | `void` | Reset all data |
| `Bus.stats()` | `Object` | Get statistics |

## See Also

- [App Lifecycle](04-app-lifecycle.md) — Where state keys and events are defined
- [Behaviors Guide](11-behaviors-guide.md) — Alternative for component-local state
