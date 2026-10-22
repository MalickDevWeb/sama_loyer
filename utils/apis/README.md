# API Layer

HTTP communication, authentication, and native plugin integration.

## Modules

| File | Export | Purpose |
|------|--------|---------|
| `http.js` | `httpClient` | HTTP client with session tracking |
| `auth.js` | `authenticate()` | OAuth2 client credentials flow |
| `native.js` | `nativeService`, `invokePlugin`, `withRetry` | Native plugin wrappers |
| `index.js` | `backendAPI` | Service layer (your business API) |

## Quick Reference

```javascript
import { backendAPI } from '../../utils/apis/index';
import { nativeService } from '../../utils/apis/native';

// API call (auth handled automatically)
const items = await backendAPI.getItems({ limit: 10 });

// Native plugin call
const user = await nativeService.getUserInfos();
```

## See Also

- [API Layer Guide](../../docs/06-api-layer.md) — Full documentation
- [JSON Sculpt Guide](../../docs/07-json-sculpt-guide.md) — Response transformation
