# Définitions de types

Définitions de type JSDoc pour les modules principaux du boilerplate. Elles fournissent l'autocomplétion et la documentation dans l'IDE, pas de vérification de type à l'exécution.

## Fichiers

| Fichier | Types définis |
|------|--------------|
| `http.js` | `IUnifiedResponse`, `IAPIClient`, `IAPIResponse`, `IParams`, `IHeaders`, `IRequestOptions`, callbacks de verbes HTTP (`IGETVerb`, `IPOSTVerb`, `IPUTVerb`, `IPATCHVerb`, `IDeleteVerb`) |
| `native.js` | `NativePluginOptions`, `NativeUserInfo`, `NativeSuccessCallback`, `NativeFailCallback` |

## Utilisation

Les types sont référencés via les annotations JSDoc `@type` et `@param` dans tout le code :

```javascript
/** @type {import('../types/http').IUnifiedResponse} */
const response = await httpClient.get('/api/data');
```

## Types API WeChat

`typings/wx.d.ts` fournit des définitions TypeScript pour toutes les APIs `wx.*`. Cela permet l'autocomplétion dans l'IDE même si le projet utilise JavaScript.

## Ajouter de nouveaux types

Créez un nouveau fichier dans `types/` avec des typedefs JSDoc :

```javascript
/**
 * @typedef {Object} MyType
 * @property {string} id
 * @property {string} name
 */
```

## Voir aussi

- [API Layer](../docs/06-api-layer.md) — là où ces types sont utilisés
