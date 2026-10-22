# Utils

Modules utilitaires fournissant l'infrastructure de base du boilerplate.

| Module | Chemin | Objectif |
|--------|------|---------|
| [API Layer](apis/README.md) | `utils/apis/` | Client HTTP, auth, plugins natifs, BackendAPI |
| [EventBus](event/README.md) | `utils/event/` | Gestion d'état et pub/sub |
| [JSON Sculpt](json-sculpt/README.md) | `utils/json-sculpt/` | Transformation de données déclarative |
| [Constants](constants/README.md) | `utils/constants/` | Valeurs de configuration centralisées |
| [Formatters](formatters/README.md) | `utils/formatters/` | Formatage de date, prix, chaîne |
| [Helpers](helpers/README.md) | `utils/helpers/` | Helpers de page et de navigation |
| [Behaviors](behaviors/README.md) | `utils/behaviors/` | Mixins Behavior() partagés |
| [WXS](wxs/README.md) | `utils/wxs/` | Filtres de template côté vue |
| [Mappers](mappers/README.md) | `utils/mappers/` | Définitions de schéma Sculpt |
| [Storage](../docs/13-storage-guide.md) | `utils/storage.js` | Wrapper de stockage wx sécurisé |
| [Config](../docs/03-getting-started.md#environment-configuration) | `utils/config.js` | Configuration d'environnement |
| [Errors](errors/README.md) | `utils/errors/` | Hiérarchie d'erreurs personnalisées (AppError, Validation, Auth, Network, NotFound, ExternalService) |
| [Handlers](handlers/README.md) | `utils/handlers/` | Gestionnaires d'événements (placeholder) |

## Voir aussi

- [Project Architecture](../docs/02-project-architecture.md) — comment les modules se connectent
- [Recipes](../docs/14-recipes.md) — guides pas à pas
