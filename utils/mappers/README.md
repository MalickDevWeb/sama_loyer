# Mappers

Sculpt schema definitions for transforming API responses into domain models.

## Naming Convention

Files are named `*.sculpt.js` to distinguish them from regular modules:
```
utils/mappers/
├── example.sculpt.js     # Example schemas (UserSchema, ItemSchema)
├── product.sculpt.js     # Your product schemas
└── README.md
```

## Example

```javascript
// utils/mappers/example.sculpt.js
export const UserSchema = {
  id: '@link.user_id',
  fullName: (data) => `${data.first_name} ${data.last_name}`,
  email: '@link.email_address',
};
```

## Usage

```javascript
import { sculpt } from '../json-sculpt/sculpt';
import { UserSchema } from '../mappers/example.sculpt.js';

const user = sculpt.data({ data: apiResponse, to: UserSchema });
```

## See Also

- [JSON Sculpt Guide](../../docs/07-json-sculpt-guide.md) — Schema syntax reference
- [Recipes: Creating a Sculpt Schema](../../docs/14-recipes.md#creating-a-sculpt-schema)
