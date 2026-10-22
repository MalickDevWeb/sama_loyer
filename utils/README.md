# Utils

Utility modules providing the core infrastructure for the boilerplate.

| Module | Path | Purpose |
|--------|------|---------|
| [API Layer](apis/README.md) | `utils/apis/` | HTTP client, auth, native plugins, BackendAPI |
| [EventBus](event/README.md) | `utils/event/` | State management and event pub/sub |
| [JSON Sculpt](json-sculpt/README.md) | `utils/json-sculpt/` | Declarative data transformation |
| [Constants](constants/README.md) | `utils/constants/` | Centralized configuration values |
| [Formatters](formatters/README.md) | `utils/formatters/` | Date, price, string formatting |
| [Helpers](helpers/README.md) | `utils/helpers/` | Page and navigation helpers |
| [Behaviors](behaviors/README.md) | `utils/behaviors/` | Shared Behavior() mixins |
| [WXS](wxs/README.md) | `utils/wxs/` | View-thread template filters |
| [Mappers](mappers/README.md) | `utils/mappers/` | Sculpt schema definitions |
| [Storage](../docs/13-storage-guide.md) | `utils/storage.js` | Safe wx storage wrapper |
| [Config](../docs/03-getting-started.md#environment-configuration) | `utils/config.js` | Environment configuration |
| [Errors](errors/README.md) | `utils/errors/` | Custom error hierarchy (AppError, Validation, Auth, Network, NotFound, ExternalService) |
| [Handlers](handlers/README.md) | `utils/handlers/` | Event handlers (placeholder) |

## See Also

- [Project Architecture](../docs/02-project-architecture.md) — How modules connect
- [Recipes](../docs/14-recipes.md) — Step-by-step task guides
