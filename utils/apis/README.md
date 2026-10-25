# API Layer — SAMA LOYER

HTTP network architecture, OAuth2 authentication, caching policy, and TCMPP / Max it native plugin integration.

Compliant with **SOLID** principles and WeChat Mini-Program (PMT) modular architecture standards.

---

## Directory Structure

```text
utils/apis/
├── endpoints/                   # [Routing Contracts]
│   ├── locataire.js             # Tenant & Candidate API routes
│   ├── bailleur.js              # Landlord & Property management API routes
│   ├── common.js                # Shared routes (zones, uploads, health)
│   └── index.js                 # Unified endpoints registry (Object.freeze)
├── auth.js                      # Max it OAuth2 authentication (client credentials)
├── http.js                      # Unified HTTP client with session tracking & Max it headers
├── response.js                  # Extraction, unwrapping { success, data, meta } & RFC 7807 error normalization
├── cache.js                     # Reactive in-memory cache (centralized TTL, in-flight request deduplication)
├── locataire.js                 # Tenant domain service (json-sculpt mappers, offline resilience)
├── bailleur.js                  # Landlord domain service (listings, dashboard KPI, tenants, KYC)
├── native.js                    # Orange Max it native plugins bridge (wx.invokeNativePlugin)
└── index.js                     # Central unified Facade (BackendAPI / backendAPI)
```

---

## File Responsibilities

| File / Folder | Primary Export | Responsibility (SOLID / SRP) |
| :--- | :--- | :--- |
| `endpoints/` | `LOCATAIRE_ENDPOINTS`, `BAILLEUR_ENDPOINTS`, `ENDPOINTS` | **Pure Routing**: Immutable URLs and route builders. |
| `auth.js` | `authenticate()`, `setAccessToken()` | **Security**: OAuth2 token exchange and background auto-refresh. |
| `http.js` | `httpClient`, `HttpClient` | **Transport**: Typed `wx.request` wrappers with session tracking. |
| `response.js` | `extractApiResponse()`, `unwrapApiResponse()` | **Data Integrity**: Safe payload unwrapping and application error interception. |
| `cache.js` | `cached()`, `invalidateCache()`, `TTL` | **Performance**: Reactive EventBus caching and concurrency deduplication. |
| `locataire.js` | `locataireAPI`, `LocataireAPI` | **Tenant Domain**: Listings, Orange Money rent, visits and favorites. |
| `bailleur.js` | `bailleurAPI`, `BailleurAPI` | **Landlord Domain**: Listings, KPI dashboard, tenants, cash rent and compliance. |
| `native.js` | `invokePlugin()`, `withRetry()` | **Native Bridge**: Direct access to Orange Max it super-app native features. |
| `index.js` | `backendAPI`, `BackendAPI` | **Facade**: Unified backward-compatible entry point aggregating both domains. |
