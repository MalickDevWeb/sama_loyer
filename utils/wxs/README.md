# WXS Filters

View-thread template filters (ES5 only, runs in render thread).

## Available Filters

| Filter | Example | Output |
|--------|---------|--------|
| `formatDate(dateStr)` | `f.formatDate('2024-12-15')` | `'15/12/2024'` |
| `formatPrice(amount, currency?)` | `f.formatPrice(2500, 'USD')` | `'2,500 USD'` |
| `truncate(str, max?)` | `f.truncate(text, 30)` | `'Truncated te...'` |
| `statusClass(status)` | `f.statusClass('active')` | `'status--success'` |
| `capitalize(str)` | `f.capitalize('hello')` | `'Hello'` |
| `timeAgo(dateStr)` | `f.timeAgo('2024-12-15T10:00:00Z')` | `'3d ago'` |

## Usage in WXML

```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />
<text>{{ f.formatPrice(item.price, 'USD') }}</text>
```

## See Also

- [WXS Filters Guide](../../docs/10-wxs-filters.md) — Full documentation and gotchas
