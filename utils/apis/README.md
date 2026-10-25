# API Layer — SAMA LOYER

HTTP network architecture, OAuth2 authentication, caching policy, and TCMPP / Max it native plugin integration.

Compliant with **SOLID** principles and **Domain-Driven Design (DDD)** modular packaging.

---

## Modular Directory Structure

```text
utils/apis/
├── core/                        📁 [Technical Foundation & Infrastructure]
│   ├── http.js                  # Typed HTTP client with session tracking & Max it headers
│   ├── auth.js                  # Max it OAuth2 authentication (client credentials)
│   ├── cache.js                 # Reactive in-memory cache & centralized TTL
│   ├── response.js              # Unwrapping { success, data, meta } & RFC 7807 normalization
│   ├── native.js                # Orange Max it native plugins bridge (wx.invokeNativePlugin)
│   └── index.js                 # Core module exports
│
├── endpoints/                   📁 [Pure Routing Contracts]
│   ├── locataire.js             # Tenant & Candidate routes (Object.freeze)
│   ├── bailleur.js              # Landlord & Property management routes (Object.freeze)
│   ├── common.js                # Shared routes (zones, uploads, health)
│   └── index.js                 # Unified endpoints registry
│
├── locataire/                   📁 [Tenant Domain Module]
│   ├── endpoints.js             # Domain routes export
│   ├── service.js               # Business service (Listings, Rent, Visits, Favorites)
│   └── index.js                 # Module export
│
├── bailleur/                    📁 [Landlord Domain Module]
│   ├── endpoints.js             # Domain routes export
│   ├── service.js               # Business service (Listings, Dashboard KPI, Tenants, Cash, KYC)
│   └── index.js                 # Module export
│
├── locataire.js                 📄 [Backward-compatible proxy to locataire/index.js]
├── bailleur.js                  📄 [Backward-compatible proxy to bailleur/index.js]
└── index.js                     📄 [Central unified Facade (BackendAPI / backendAPI)]
```
