# Constantes

Valeurs de configuration centralisées. Aucune valeur magique ou chaîne dure dans le code.

## Exports

| Constante | Type | Objectif |
|----------|------|---------|
| `__DEV__` | `boolean` | Indicateur de mode développement. Mis à `false` en production. |
| `STORAGE_KEYS` | `Object` | Noms des clés de stockage local : `ACCESS_TOKEN`, `TOKEN_EXPIRY`, `USER_DATA` |
| `AUTH_CONFIG` | `Object` | Paramètres d'authentification : `REFRESH_BUFFER_MS` (5000), `DEFAULT_EXPIRY_SEC` (200), `GRANT_TYPE` |
| `HTTP_CONFIG` | `Object` | Paramètres HTTP : `DEFAULT_TIMEOUT_MS` (30000), `SESSION_PREFIX`, en-têtes de suivi |
| `ERROR_MESSAGES` | `Object` | Messages d'erreur destinés à l'utilisateur (anglais) |
| `SUCCESS_MESSAGES` | `Object` | Messages de succès destinés à l'utilisateur (anglais) |
| `MAIN_TABS` | `Array` | Configuration de la navigation principale utilisée par `app-tab-bar` |

## Ajouter une nouvelle constante

```javascript
// Dans utils/constants/index.js
export const MY_CONFIG = {
  SETTING_A: 'value',
  SETTING_B: 42,
};
```

## Voir aussi

- [Getting Started](../../docs/03-getting-started.md) — vue d'ensemble de la configuration
