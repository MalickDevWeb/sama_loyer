# Constants

Centralized configuration values. No magic numbers or strings anywhere in the codebase.

## Exports

| Constant | Type | Purpose |
|----------|------|---------|
| `__DEV__` | `boolean` | Development mode flag. Set to `false` for production. |
| `STORAGE_KEYS` | `Object` | Local storage key names: `ACCESS_TOKEN`, `TOKEN_EXPIRY`, `USER_DATA` |
| `AUTH_CONFIG` | `Object` | Auth settings: `REFRESH_BUFFER_MS` (5000), `DEFAULT_EXPIRY_SEC` (200), `GRANT_TYPE` |
| `HTTP_CONFIG` | `Object` | HTTP settings: `DEFAULT_TIMEOUT_MS` (30000), `SESSION_PREFIX`, tracking headers |
| `ERROR_MESSAGES` | `Object` | User-facing error strings (English) |
| `SUCCESS_MESSAGES` | `Object` | User-facing success strings (English) |
| `MAIN_TABS` | `Array` | Main navigation configuration used by `app-tab-bar` |

## Adding a New Constant

```javascript
// In utils/constants/index.js
export const MY_CONFIG = {
  SETTING_A: 'value',
  SETTING_B: 42,
};
```

## See Also

- [Getting Started](../../docs/03-getting-started.md) — Configuration overview
