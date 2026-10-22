# Type Definitions

JSDoc type definitions for the boilerplate's core modules. These provide IDE autocompletion and documentation, not runtime type checking.

## Files

| File | Types Defined |
|------|--------------|
| `http.js` | `IUnifiedResponse`, `IAPIClient`, `IAPIResponse`, `IParams`, `IHeaders`, `IRequestOptions`, HTTP verb callbacks (`IGETVerb`, `IPOSTVerb`, `IPUTVerb`, `IPATCHVerb`, `IDeleteVerb`) |
| `native.js` | `NativePluginOptions`, `NativeUserInfo`, `NativeSuccessCallback`, `NativeFailCallback` |

## Usage

Types are referenced via JSDoc `@type` and `@param` annotations throughout the codebase:

```javascript
/** @type {import('../types/http').IUnifiedResponse} */
const response = await httpClient.get('/api/data');
```

## WeChat API Types

`typings/wx.d.ts` provides TypeScript definitions for all `wx.*` APIs. This enables IDE autocompletion even though the project uses JavaScript.

## Adding New Types

Create a new file in `types/` with JSDoc typedefs:

```javascript
/**
 * @typedef {Object} MyType
 * @property {string} id
 * @property {string} name
 */
```

## See Also

- [API Layer](../docs/06-api-layer.md) — Where these types are used
