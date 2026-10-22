# Helpers

Page-level utilities and navigation wrappers.

## Page Helpers (`page.js`)

| Function | Purpose |
|----------|---------|
| `showToast(message, type?)` | Show toast notification (`'success'`, `'error'`, `'none'`) |
| `showLoading(message?)` | Show loading indicator with mask |
| `hideLoading()` | Hide loading indicator |
| `createPageHelpers(page, bindings)` | Auto-subscribe page data to EventBus state |
| `retryAsync(fn, options?)` | Retry async operation with backoff and UI feedback |

## Navigation Helpers (`navigation.js`)

| Function | Purpose |
|----------|---------|
| `navigateTo(url)` | Push page (auto-fallback at 10-page limit) |
| `redirectTo(url)` | Replace current page |
| `switchTab(url)` | Switch to tab page |
| `reLaunch(url)` | Close all, open one |
| `navigateBack(delta?)` | Go back (auto-fallback to home if stack empty) |
| `getStackInfo()` | Returns `{ depth, current, canGoBack }` |

## See Also

- [Navigation Guide](../../docs/12-navigation-guide.md) — Full navigation documentation
- [EventBus Guide](../../docs/05-eventbus-guide.md) — State subscription details
