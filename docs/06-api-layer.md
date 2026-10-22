# API Layer

The API layer handles all communication with backend services and native plugins.

## Architecture

```
utils/apis/
├── http.js       # HttpClient class — wraps wx.request
├── auth.js       # OAuth2 client credentials — token management
├── native.js     # Native plugin service — wx.invokeNativePlugin wrapper
└── index.js      # BackendAPI class — your service layer
```

## HttpClient (`utils/apis/http.js`)

A singleton HTTP client with session tracking and unified response format.

### Methods

```javascript
import { httpClient } from '../utils/apis/http';

const res = await httpClient.get('/users', { query: { page: 1 } });
const res = await httpClient.post('/users', { name: 'John' });
const res = await httpClient.put('/users/1', { name: 'Jane' });
const res = await httpClient.patch('/users/1', { name: 'Jane' });
const res = await httpClient.delete('/users/1');
```

### Unified Response Format

Every method returns the same shape:

```javascript
{
  success: true,           // boolean — was it a 2xx status?
  data: { ... },           // response body (null on error)
  error: null,             // error object (null on success)
  headers: { ... },        // response headers
  status: 200,             // HTTP status code
}

// On error:
{
  success: false,
  data: null,
  error: { code: 404, message: 'Not found' },
  headers: { ... },
  status: 404,
}
```

### Session Tracking

Every request includes tracking headers:
- `X-Client-Ref`: Session ID (e.g., `APP-a1b2c3d4`) — persists across requests
- `X-Request-Id`: Request ID (e.g., `APP-a1b2c3d4-1`) — unique per request

Call `httpClient.resetSession()` to start a new session.

### Authentication

The client automatically includes `Authorization: Bearer <token>` when a token is set:
```javascript
httpClient.setToken('your-access-token');
```

## Authentication (`utils/apis/auth.js`)

OAuth2 client credentials flow with local caching.

```javascript
import { authenticate } from '../utils/apis/auth';

await authenticate();
// httpClient now has the token — make API calls normally
```

### How It Works

1. Check `wx.getStorageSync` for a cached token
2. If valid (not expired), set it on httpClient and return
3. If expired, POST to `config.AUTH_URL` with client credentials
4. Cache the new token with expiry (minus 5-second buffer)
5. Set on httpClient

### Configuration

Set your credentials in `utils/config.js`:
```javascript
CLIENT_ID: 'your-client-id',
CLIENT_SECRET: 'your-client-secret',
GRANT_TYPE: 'client_credentials',
AUTH_URL: '/oauth/token',
```

## Native Plugin Service (`utils/apis/native.js`)

Wraps `wx.invokeNativePlugin` with Promise-based API and retry logic.

### invokePlugin()

```javascript
import { invokePlugin } from '../utils/apis/native';

// Strict mode (default) — validates { result: 'success', status_code: 200 }
const data = await invokePlugin('apiName', { key: 'value' });

// Non-strict mode — returns raw response
const raw = await invokePlugin('apiName', {}, { strict: false });
```

### withRetry()

Exponential backoff retry for unreliable operations:

```javascript
import { withRetry } from '../utils/apis/native';

const result = await withRetry(
  () => invokePlugin('flaky_api'),
  {
    maxAttempts: 3,    // Total attempts (default: 3)
    baseDelay: 500,    // Initial delay in ms (doubles each retry)
    shouldRetry: (err) => !err.message.includes('cancelled'),
  }
);
```

### getUserInfos()

Built-in user info retrieval with retry:

```javascript
import { nativeService } from '../utils/apis/native';

const { msisdn, fullName } = await nativeService.getUserInfos();
```

In development mode (`__DEV__ = true`), returns mock data if the native plugin fails.

### Adding a New Plugin Wrapper

```javascript
// In utils/apis/native.js:
export const takePhoto = async () => {
  return invokePlugin('takePhoto', {}, { strict: false });
};

// Add to nativeService:
export const nativeService = {
  getUserInfos,
  takePhoto,
};
```

## BackendAPI (`utils/apis/index.js`)

Your application's service layer. Every method handles auth automatically.

```javascript
import { backendAPI } from '../utils/apis/index';

const { items, total } = await backendAPI.getItems({ limit: 10 });
const item = await backendAPI.createItem({ name: 'Widget' });
```

### Adding a New Endpoint

```javascript
// 1. Add to ENDPOINTS
const ENDPOINTS = {
  USERS: '/users',
};

// 2. Add method to BackendAPI class
async getUser(id) {
  await authenticate();
  const res = await this.#client.get(`${ENDPOINTS.USERS}/${id}`);
  if (!res.success) throw new Error(res.error?.message || 'Failed');
  return sculpt.data({ data: res.data, to: UserSchema });
}
```

## Type Definitions

JSDoc types are defined in:
- `types/http.js` — `IUnifiedResponse`, `IAPIClient`
- `types/native.js` — `NativePluginOptions`, `NativeUserInfo`

## See Also

- [JSON Sculpt Guide](07-json-sculpt-guide.md) — Transform API responses
- [App Lifecycle](04-app-lifecycle.md) — Where `authenticate` is called during init
- [Constants](../utils/constants/README.md) — `STORAGE_KEYS`, `AUTH_CONFIG`, `HTTP_CONFIG`
