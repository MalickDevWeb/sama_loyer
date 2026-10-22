# Errors

Custom error hierarchy with status codes, error codes, and metadata.
All classes extend `AppError`, which extends native `Error`.

## Classes

| Class | Status Code | Code | Use Case |
|-------|------------|------|----------|
| `AppError` | 500 | `APP_ERROR` | Base class — catch-all for unexpected failures |
| `ValidationError` | 400 | `VALIDATION_ERROR` | Invalid input, malformed data, business rule violations |
| `AuthorizationError` | 401 | `AUTHORIZATION_ERROR` | Authentication or permission failures |
| `NetworkError` | 0 | `NETWORK_ERROR` | Connectivity, timeout, HTTP transport failures |
| `NotFoundError` | 404 | `NOT_FOUND` | Missing resources |
| `ExternalServiceError` | 502 | `EXTERNAL_SERVICE_ERROR` | Third-party API or integration failures |

## Usage

```javascript
import { ValidationError, NetworkError } from '../../utils/errors/index';

// Throw with optional metadata
throw new ValidationError('Email is required', { field: 'email' });

// Catch and inspect
try {
  await fetchUser(id);
} catch (err) {
  if (err instanceof NetworkError) {
    console.error(err.code, err.metadata);
  }
}

// Serialize for logging
console.log(JSON.stringify(err));
// { "name": "ValidationError", "message": "...", "statusCode": 400, "code": "VALIDATION_ERROR", "metadata": {...}, "timestamp": 1708300000000 }
```

## Conventions

- Use `ERROR_MESSAGES` from `utils/constants/index.js` for user-facing strings
- Pass contextual metadata (field names, IDs, service names) for debugging
- Use `err.toJSON()` or `JSON.stringify(err)` for structured logging

## See Also

- [Project Architecture: Error Handling](../../docs/02-project-architecture.md#error-handling-strategy)
- [Troubleshooting](../../docs/15-troubleshooting.md)
