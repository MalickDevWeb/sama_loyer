# Storage Guide

## wx Storage Basics

- **Synchronous API** — `wx.getStorageSync` / `wx.setStorageSync`
- **10 MB quota** per mini-program
- **Persistent** — data survives app restarts and updates
- **Can throw** — quota exceeded, data corruption, platform bugs

## Storage Wrapper (`utils/storage.js`)

Safe wrappers that never throw. Every method catches errors silently and returns a sensible default.

### API Reference

| Method | Returns | Description |
|--------|---------|-------------|
| `storage.get(key, default?)` | `any` | Read value, returns `default` on failure |
| `storage.set(key, value)` | `boolean` | Write value, returns `true` on success |
| `storage.remove(key)` | `boolean` | Delete key, returns `true` on success |
| `storage.clear()` | `boolean` | Delete all storage |
| `storage.info()` | `Promise<{currentSize, limitSize}>` | Usage in KB |
| `storage.getOrSet(key, factory)` | `any` | Read or compute + cache |

### Examples

```javascript
import { storage } from '../../utils/storage';

// Basic read/write
storage.set('user_prefs', { theme: 'dark', lang: 'en' });
const prefs = storage.get('user_prefs', { theme: 'light' });

// Cache-or-compute pattern
const deviceId = storage.getOrSet('device_id', () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
});

// Check usage
const { currentSize, limitSize } = await storage.info();
console.log(`Using ${currentSize}KB of ${limitSize}KB`);
```

### Why Use the Wrapper?

| Raw `wx.getStorageSync` | `storage.get()` |
|------------------------|-----------------|
| Throws on failure | Returns default value |
| Returns `''` for missing keys | Returns default value |
| No usage tracking | `storage.info()` available |
| No cache-or-compute | `storage.getOrSet()` |

## Storage Keys Convention

Defined in `utils/constants/index.js`:

```javascript
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'app_access_token',
  TOKEN_EXPIRY: 'app_token_expiry',
  USER_DATA: 'app_user_data',
};
```

**Convention:** Prefix all keys with `app_` to avoid collisions with other mini-programs or libraries.

## See Also

- [API Layer](06-api-layer.md) — Token storage uses `STORAGE_KEYS`
- [App Lifecycle](04-app-lifecycle.md) — Storage used during initialization
