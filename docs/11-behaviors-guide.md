# Behaviors Guide

Behaviors are WeChat's mixin system — they let you share data, methods, and lifecycle hooks across multiple pages and components without inheritance.

## When to Use Behaviors vs EventBus

| Use Behaviors For | Use EventBus For |
|-------------------|-----------------|
| Shared UI state within a single page/component | Shared state across pages |
| Reusable methods (loading, error handling) | App-wide events and notifications |
| Component-level concerns | Cross-page communication |

## loadingBehavior (`utils/behaviors/loading.js`)

The built-in behavior provides loading and error state management.

### What You Get

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isLoading` | Boolean | `false` | Whether async operation is in progress |
| `hasError` | Boolean | `false` | Whether last operation failed |
| `errorMessage` | String | `''` | Human-readable error message |

| Method | Description |
|--------|-------------|
| `withLoading(fn, options?)` | Wraps async function with loading/error state |
| `setError(message)` | Manually set error state |
| `clearError()` | Clear error state |

### Usage in a Page

```javascript
import { loadingBehavior } from '../../utils/behaviors/loading';

Page({
  behaviors: [loadingBehavior],

  async onLoad() {
    await this.withLoading(async () => {
      const data = await backendAPI.getItems();
      this.setData({ items: data });
    }, { loadingText: 'Loading...' });
  },
});
```

### Usage in WXML

```xml
<view wx:if="{{ isLoading }}">Loading...</view>
<view wx:elif="{{ hasError }}">Error: {{ errorMessage }}</view>
<view wx:else>
  <!-- Your content -->
</view>
```

### withLoading Options

```javascript
await this.withLoading(asyncFn, {
  loadingText: 'Saving...',  // Shows wx.showLoading with this text
});
```

If `loadingText` is provided, `wx.showLoading()` is shown during the operation and hidden when complete.

## Creating a New Behavior

```javascript
// utils/behaviors/form-validation.js
export const formValidationBehavior = Behavior({
  data: {
    errors: {},
    isValid: true,
  },

  methods: {
    validate(rules) {
      const errors = {};
      Object.entries(rules).forEach(([field, rule]) => {
        if (rule.required && !this.data[field]) {
          errors[field] = `${field} is required`;
        }
      });
      this.setData({ errors, isValid: Object.keys(errors).length === 0 });
      return Object.keys(errors).length === 0;
    },

    clearErrors() {
      this.setData({ errors: {}, isValid: true });
    },
  },
});
```

### Usage

```javascript
import { formValidationBehavior } from '../../utils/behaviors/form-validation';

Page({
  behaviors: [formValidationBehavior],

  handleSubmit() {
    if (!this.validate({ name: { required: true }, email: { required: true } })) {
      return;  // errors are already in this.data.errors
    }
    // Submit form...
  },
});
```

## Behavior Merge Rules

When a page/component uses multiple behaviors, conflicts are resolved:

| Element | Rule |
|---------|------|
| `data` | Merged (component's data wins on conflict) |
| `methods` | Merged (component's methods win on conflict) |
| `properties` | Merged (component's properties win on conflict) |
| `lifetimes` | All called (behavior's first, then component's) |

## See Also

- [EventBus Guide](05-eventbus-guide.md) — For cross-page state
- [Components Overview](08-components-overview.md) — Using behaviors in components
- [Recipes: Creating a New Behavior](14-recipes.md#creating-a-new-behavior)
