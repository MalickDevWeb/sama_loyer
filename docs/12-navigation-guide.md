# Navigation Guide

## Page Stack Model

WeChat maintains a stack of pages. The maximum depth is **10 pages**.

```
                    ┌─────────────┐
                    │ Page 3      │ ← Current (top of stack)
                    ├─────────────┤
                    │ Page 2      │
                    ├─────────────┤
                    │ Page 1      │ ← Entry page
                    └─────────────┘
```

### 5 Navigation Methods

| Method | Stack Operation | Use Case |
|--------|----------------|----------|
| `navigateTo` | Push | Normal forward navigation |
| `redirectTo` | Replace current | Wizard step, post-action redirect |
| `switchTab` | Clear stack + switch | Tab bar navigation |
| `reLaunch` | Clear all + open one | Logout, fatal error recovery |
| `navigateBack` | Pop N pages | Back button, cancel |

## Navigation Helpers (`utils/helpers/navigation.js`)

Safe wrappers that handle edge cases wx.* methods don't:

### navigateTo(url)

```javascript
import { navigateTo } from '../../utils/helpers/navigation';

await navigateTo('/pages/detail/index?id=42');
```

**Guard:** At 10-page limit, automatically falls back to `redirectTo`. If `navigateTo` fails for any reason, also falls back to `redirectTo`.

### redirectTo(url)

```javascript
import { redirectTo } from '../../utils/helpers/navigation';

await redirectTo('/pages/result/index');
```

Cannot target tabBar pages.

### switchTab(url)

```javascript
import { switchTab } from '../../utils/helpers/navigation';

await switchTab('/pages/index/index');
```

Closes all non-tab pages. Path only — no query parameters allowed.

### reLaunch(url)

```javascript
import { reLaunch } from '../../utils/helpers/navigation';

await reLaunch('/pages/login/index');
```

Closes everything and opens one page. Use for hard resets.

### navigateBack(delta?)

```javascript
import { navigateBack } from '../../utils/helpers/navigation';

await navigateBack();    // Back 1 page
await navigateBack(2);   // Back 2 pages
```

**Guard:** If the stack has only 1 page (can't go back), falls back to `reLaunch('/pages/index/index')`.

### getStackInfo()

```javascript
import { getStackInfo } from '../../utils/helpers/navigation';

const { depth, current, canGoBack } = getStackInfo();
// { depth: 3, current: 'pages/detail/index', canGoBack: true }
```

## Passing Data Between Pages

### Query Parameters

```javascript
// Sender
navigateTo('/pages/detail/index?id=42&type=product');

// Receiver — in onLoad
onLoad(options) {
  console.log(options.id);    // '42' (always strings)
  console.log(options.type);  // 'product'
}
```

### EventBus State

For complex data that doesn't fit in a query string:

```javascript
// Sender
Bus.setState('selected.item', { id: 42, name: 'Widget', data: largeObject });
navigateTo('/pages/detail/index');

// Receiver
onLoad() {
  const item = Bus.getState('selected.item');
}
```

## Page Registration

Every page must be registered in `app.json`:

```json
{
  "pages": [
    "pages/index/index",
    "pages/detail/index"
  ]
}
```

The **first page** in the array is the entry page.

## See Also

- [App Lifecycle](04-app-lifecycle.md) — `onPageNotFound` handler
- [Mini-Program Concepts](01-mini-program-concepts.md) — Page lifecycle
- [Recipes: Adding a New Page](14-recipes.md#adding-a-new-page)
