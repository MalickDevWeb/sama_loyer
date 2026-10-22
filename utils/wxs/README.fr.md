# Filtres WXS

Filtres de template côté vue (ES5 uniquement, s'exécutent dans le thread de rendu).

## Filtres disponibles

| Filtre | Exemple | Sortie |
|--------|---------|--------|
| `formatDate(dateStr)` | `f.formatDate('2024-12-15')` | `'15/12/2024'` |
| `formatPrice(amount, currency?)` | `f.formatPrice(2500, 'USD')` | `'2,500 USD'` |
| `truncate(str, max?)` | `f.truncate(text, 30)` | `'Truncated te...'` |
| `statusClass(status)` | `f.statusClass('active')` | `'status--success'` |
| `capitalize(str)` | `f.capitalize('hello')` | `'Hello'` |
| `timeAgo(dateStr)` | `f.timeAgo('2024-12-15T10:00:00Z')` | `'3d ago'` |

## Utilisation dans WXML

```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />
<text>{{ f.formatPrice(item.price, 'USD') }}</text>
```

## Voir aussi

- [WXS Filters Guide](../../docs/10-wxs-filters.md) — documentation complète et pièges à éviter
