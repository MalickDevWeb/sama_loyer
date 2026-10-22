# Formatters

Pure utility functions for data formatting. These run in the JS thread (not view thread like WXS).

## Exports

| Function | Signature | Example |
|----------|-----------|---------|
| `formatDate` | `(dateString, locale?) → string` | `'12/15/2024'` |
| `formatDateTime` | `(dateString, locale?) → string` | `'12/15/2024, 2:30 PM'` |
| `formatPrice` | `(amount, options?) → string` | `'$2,000.00'` |
| `parsePrice` | `(formatted) → number` | `2000` |
| `truncate` | `(str, maxLength?) → string` | `'This is a...'` |

## Usage

```javascript
import { formatDate, formatPrice } from '../../utils/formatters/index';

const date = formatDate('2024-12-15');           // '12/15/2024'
const price = formatPrice(2000, { currency: 'EUR', locale: 'fr-FR' });
```

## WXS vs JS Formatters

Use **WXS filters** (`utils/wxs/filters.wxs`) for formatting in WXML templates.
Use **JS formatters** (this module) for formatting in JavaScript logic.

## See Also

- [WXS Filters Guide](../../docs/10-wxs-filters.md) — View-thread formatting
