# Behaviors

Shared Behavior() mixins for pages and components.

## Available Behaviors

### loadingBehavior (`loading.js`)

Provides loading and error state management.

**Data:** `isLoading`, `hasError`, `errorMessage`
**Methods:** `withLoading(fn, options?)`, `setError(msg)`, `clearError()`

```javascript
import { loadingBehavior } from '../../utils/behaviors/loading';

Page({
  behaviors: [loadingBehavior],
  async onLoad() {
    await this.withLoading(async () => {
      const data = await fetchData();
      this.setData({ items: data });
    });
  },
});
```

## See Also

- [Behaviors Guide](../../docs/11-behaviors-guide.md) — Full documentation
- [Recipes: Creating a New Behavior](../../docs/14-recipes.md#creating-a-new-behavior)
