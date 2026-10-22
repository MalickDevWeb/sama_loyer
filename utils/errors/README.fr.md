# Erreurs

Hiérarchie d'erreurs personnalisées avec codes de statut, codes d'erreur et métadonnées.
Toutes les classes étendent `AppError`, qui étend `Error` natif.

## Classes

| Classe | Code de statut | Code | Cas d'utilisation |
|-------|------------|------|----------|
| `AppError` | 500 | `APP_ERROR` | Classe de base — capture tout pour les échecs inattendus |
| `ValidationError` | 400 | `VALIDATION_ERROR` | Entrée invalide, données mal formées, règles métier non respectées |
| `AuthorizationError` | 401 | `AUTHORIZATION_ERROR` | Échecs d'authentification ou de permissions |
| `NetworkError` | 0 | `NETWORK_ERROR` | Problèmes de connectivité, timeout, transport HTTP |
| `NotFoundError` | 404 | `NOT_FOUND` | Ressources manquantes |
| `ExternalServiceError` | 502 | `EXTERNAL_SERVICE_ERROR` | Échecs d'API tierce ou d'intégration |

## Utilisation

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

- Utilisez `ERROR_MESSAGES` depuis `utils/constants/index.js` pour les chaînes destinées à l'utilisateur
- Passez des métadonnées contextuelles (noms de champ, identifiants, noms de service) pour le débogage
- Utilisez `err.toJSON()` ou `JSON.stringify(err)` pour la journalisation structurée

## Voir aussi

- [Project Architecture: Error Handling](../../docs/02-project-architecture.md#error-handling-strategy)
- [Troubleshooting](../../docs/15-troubleshooting.md)
