# JSON Sculpt

Declarative data transformation engine for mapping API responses to domain models.

## Quick Reference

```javascript
import { sculpt } from '../../utils/json-sculpt/sculpt';

const schema = {
  id: '@link.user_id',                    // Extract field
  name: '@link.display_name::string',     // Extract + cast
  fullName: (data) => `${data.first} ${data.last}`, // Custom function
};

const result = sculpt.data({ data: rawObject, to: schema });
```

## Syntax Cheat Sheet

| Syntax | Example | What It Does |
|--------|---------|-------------|
| `@link.path` | `'@link.user.name'` | Extract nested value |
| `@link.path::type` | `'@link.count::number'` | Extract + type cast |
| `(data) => value` | `(d) => d.a + d.b` | Custom transform function |
| `[paths...]` | `['@link.a', '@link.b', 'default']` | Fallback resolution |
| `{ $map, $transform }` | See guide | Map over array |
| `{ $map, $spread }` | See guide | Flatten array to object |
| `{ $recursive }` | See guide | Process tree structures |
| `{ $op, $from, $args }` | See guide | Built-in operator |

## See Also

- [JSON Sculpt Guide](../../docs/07-json-sculpt-guide.md) — Full documentation with examples
- [Example Schemas](../mappers/README.md) — Working schema examples
