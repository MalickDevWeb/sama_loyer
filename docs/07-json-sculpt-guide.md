# JSON Sculpt Guide

Sculpt is a declarative data transformation engine. Instead of writing imperative mapping code for every API response, you define a **schema** that describes the output shape, and Sculpt handles the extraction and transformation.

## The Problem

API responses have ugly field names and deep nesting:

```json
{
  "user_id": "12345",
  "first_name": "John",
  "last_name": "Doe",
  "email_address": "john@example.com",
  "profile": { "avatar_url": "https://...", "bio": "Developer" }
}
```

You want clean, flat models in your pages:

```javascript
{ id: '12345', fullName: 'John Doe', email: 'john@example.com', avatarUrl: 'https://...' }
```

## Basic Syntax

### `@link.path` — Extract a Value

```javascript
const UserSchema = {
  id: '@link.user_id',                    // top-level field
  email: '@link.email_address',
  avatarUrl: '@link.profile.avatar_url',  // nested field
};

const user = sculpt.data({ data: rawResponse, to: UserSchema });
```

### `@link.path::type` — Extract + Type Cast

```javascript
const schema = {
  count: '@link.total_count::number',    // cast to number
  active: '@link.is_active::boolean',    // cast to boolean ('true', 1, 'yes' → true)
  name: '@link.display_name::string',    // cast to string
  created: '@link.created_at::date',     // cast to Date object
};
```

### Functions — Custom Transforms

```javascript
const schema = {
  fullName: (data) => `${data.first_name} ${data.last_name}`,

  // With context (index, parent array, path)
  label: (data, ctx) => `#${ctx.index + 1}: ${data.name}`,
};
```

### Arrays — Fallback Resolution

```javascript
const schema = {
  // Try each path left-to-right, use first non-null value
  phone: ['@link.mobile', '@link.phone', '@link.contact.phone', 'N/A'],
};
```

## Array Operations

### `$map` + `$transform` — Map Over an Array

```javascript
const schema = {
  tags: {
    $map: '@link.tag_list',         // source array path
    $transform: {                    // transform each item
      id: '@link.tag_id',
      name: '@link.tag_name',
    },
  },
};
```

### `$map` + `$spread` — Flatten to Object

```javascript
const schema = {
  settings: {
    $map: '@link.config_entries',    // [{ key: 'theme', value: 'dark' }, ...]
    $spread: {
      '@link.key': '@link.value',    // Dynamic keys! → { theme: 'dark', ... }
    },
  },
};
```

## Recursive Structures

For tree data (categories, org charts, nested comments):

```javascript
const TreeSchema = {
  nodes: {
    $recursive: {
      $track: '#children',           // # prefix = recursive key
      $rename: 'subItems',           // rename in output (optional)
      $transform: {
        id: '@link.id',
        label: '@link.name',
      },
    },
  },
};
```

## Built-in Operators

Use `$op` for built-in transformations:

```javascript
const schema = {
  title: { $op: 'toTitleCase', $from: '@link.raw_title' },
  price: { $op: 'formatCurrency', $from: '@link.amount', $args: { currency: 'USD' } },
  posted: { $op: 'timeAgo', $from: '@link.created_at' },
};
```

### Available Operators

| Category | Operator | Args | Example Output |
|----------|----------|------|---------------|
| **String** | `toLowerCase` | | `"hello"` |
| | `toUpperCase` | | `"HELLO"` |
| | `toCamelCase` | | `"myVariable"` |
| | `toTitleCase` | | `"My Variable"` |
| **Number** | `toFixed` | `{ decimals: 2 }` | `"99.99"` |
| | `formatNumber` | `{ locale }` | `"1,234"` |
| | `formatCurrency` | `{ currency, locale }` | `"$1,234.00"` |
| | `add` | `{ amount }` | `105` |
| | `multiply` | `{ factor }` | `200` |
| **Date** | `formatDate` | `{ locale, options }` | `"12/15/2024"` |
| | `formatTime` | `{ locale, options }` | `"2:30 PM"` |
| | `timeAgo` | | `"3h ago"` |
| **Array** | `join` | `{ separator }` | `"a, b, c"` |
| | `length` | | `3` |
| | `unique` | | `[1, 2, 3]` |
| | `first` | | `1` |
| | `last` | | `3` |

### Custom Operators

```javascript
import { sculpt } from '../utils/json-sculpt/sculpt';

sculpt.registerOperator('mask', (value, args) => {
  const str = String(value);
  const visible = args?.visible || 4;
  return '*'.repeat(str.length - visible) + str.slice(-visible);
});

// Usage in schema:
{ phone: { $op: 'mask', $from: '@link.phone', $args: { visible: 4 } } }
// "****5678"
```

## Example Schemas

See `utils/mappers/example.sculpt.js` for complete examples:

- **UserSchema** — Field extraction, computed `fullName`, formatted `memberSince`
- **ItemSchema** — Boolean derivation (`isAvailable`), price formatting

## Usage in BackendAPI

```javascript
import { sculpt } from '../json-sculpt/sculpt';
import { UserSchema } from '../mappers/example.sculpt.js';

// Single object
const user = sculpt.data({ data: rawApiResponse, to: UserSchema });

// Array of objects (Sculpt auto-maps)
const users = sculpt.data({ data: rawUserArray, to: UserSchema });
```

## Creating Your Own Schema

1. Examine your API response JSON
2. Define the output shape you want
3. Create `utils/mappers/your-model.sculpt.js`
4. Map each field using `@link.path`
5. Add computed fields with functions
6. Import and use in your BackendAPI method

## See Also

- [API Layer](06-api-layer.md) — Where schemas are used in BackendAPI
- [Recipes: Creating a Sculpt Schema](14-recipes.md#creating-a-sculpt-schema)
