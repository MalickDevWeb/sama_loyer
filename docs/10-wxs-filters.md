# WXS Filters

WXS (WeiXin Script) is a scripting language that runs in the **render thread**, not the JS thread. This makes it faster for display-only logic like formatting dates or computing CSS classes.

## How to Use

### 1. Import in WXML

```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />
```

### 2. Call in Templates

```xml
<text>{{ f.formatDate(item.createdAt) }}</text>
<text>{{ f.formatPrice(item.price, 'USD') }}</text>
<view class="{{ f.statusClass(item.status) }}">{{ item.status }}</view>
```

## Available Filters

| Filter | Input | Output | Example |
|--------|-------|--------|---------|
| `formatDate(dateStr)` | ISO date string | `'DD/MM/YYYY'` | `'15/12/2024'` |
| `formatPrice(amount, currency?)` | number, string | `'2,500 USD'` | `'2,500 USD'` |
| `truncate(str, max?)` | string, number | Truncated with `...` | `'This is a lo...'` |
| `statusClass(status)` | status string | CSS class name | `'status--success'` |
| `capitalize(str)` | string | First letter caps | `'Hello world'` |
| `timeAgo(dateStr)` | ISO date string | Relative time | `'3h ago'` |

### statusClass Mapping

| Input Values | Output Class |
|-------------|-------------|
| `active`, `success`, `completed` | `status--success` |
| `pending`, `processing`, `loading` | `status--warning` |
| `error`, `failed`, `rejected` | `status--danger` |
| `inactive`, `disabled` | `status--muted` |
| anything else | `status--default` |

## WXS vs JS Formatters

This boilerplate has **both** WXS filters and JS formatters. Use the right one:

| Use WXS Filters When | Use JS Formatters When |
|----------------------|----------------------|
| Formatting in WXML templates | Formatting before API calls |
| Performance-sensitive display | Complex logic (regex, etc.) |
| Simple transformations | Reuse outside of templates |
| No `wx.*` API needed | Need `Intl.NumberFormat` etc. |

WXS filters: `utils/wxs/filters.wxs`
JS formatters: `utils/formatters/index.js`

## WXS Constraints (Important!)

| Constraint | Details |
|-----------|---------|
| **ES5 only** | No arrow functions, no `let`/`const`, no template literals, no destructuring |
| **No wx.* APIs** | Cannot call `wx.request`, `wx.navigateTo`, etc. |
| **No .js imports** | Cannot import from normal JavaScript modules |
| **Read-only** | Cannot modify page data, only format for display |
| **getDate()** | Use `getDate()` instead of `new Date()` |
| **Limited RegExp** | Some regex features may not work |

## Adding a New Filter

```javascript
// In utils/wxs/filters.wxs (ES5 syntax!)
function myFilter(value) {
  if (!value) return '';
  // Your formatting logic here
  return value.toString();
}

// Add to exports
module.exports = {
  // ...existing exports,
  myFilter: myFilter,
};
```

## See Also

- [Styling Guide](09-styling-guide.md) — Status CSS classes
- [Behaviors Guide](11-behaviors-guide.md) — Alternative for component-level formatting
- [Mini-Program Concepts](01-mini-program-concepts.md) — WXS overview
