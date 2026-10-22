# Couche API

Communication HTTP, authentification et intégration de plugins natifs.

## Modules

| Fichier | Export | Objectif |
|------|--------|---------|
| `http.js` | `httpClient` | Client HTTP avec suivi de session |
| `auth.js` | `authenticate()` | Flux OAuth2 client credentials |
| `native.js` | `nativeService`, `invokePlugin`, `withRetry` | Wrappers de plugins natifs |
| `index.js` | `backendAPI` | Couche de service (votre API métier) |

## Référence rapide

```javascript
import { backendAPI } from '../../utils/apis/index';
import { nativeService } from '../../utils/apis/native';

// Appel API (auth géré automatiquement)
const items = await backendAPI.getItems({ limit: 10 });

// Appel plugin natif
const user = await nativeService.getUserInfos();
```

## Voir aussi

- [API Layer Guide](../../docs/06-api-layer.md) — documentation complète
- [JSON Sculpt Guide](../../docs/07-json-sculpt-guide.md) — transformation des réponses
