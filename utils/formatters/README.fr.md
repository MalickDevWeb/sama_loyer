# Formatters

Fonctions utilitaires pures pour le formatage des données. Elles s'exécutent dans le thread JS (pas dans le thread de vue comme WXS).

## Exports

| Fonction | Signature | Exemple |
|----------|-----------|---------|
| `formatDate` | `(dateString, locale?) → string` | `'12/15/2024'` |
| `formatDateTime` | `(dateString, locale?) → string` | `'12/15/2024, 2:30 PM'` |
| `formatPrice` | `(amount, options?) → string` | `'$2,000.00'` |
| `parsePrice` | `(formatted) → number` | `2000` |
| `truncate` | `(str, maxLength?) → string` | `'This is a...'` |

## Utilisation

```javascript
import { formatDate, formatPrice } from '../../utils/formatters/index';

const date = formatDate('2024-12-15');           // '12/15/2024'
const price = formatPrice(2000, { currency: 'EUR', locale: 'fr-FR' });
```

## WXS vs JS Formatters

Utilisez les **filtres WXS** (`utils/wxs/filters.wxs`) pour le formatage dans les templates WXML.
Utilisez les **formatters JS** (ce module) pour le formatage dans la logique JavaScript.

## Voir aussi

- [WXS Filters Guide](../../docs/10-wxs-filters.md) — formatage côté vue
