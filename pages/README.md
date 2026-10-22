# Pages

## Conventions

Every page is a folder with 4 files:

```
pages/my-page/
├── index.js      # Page logic (Page() constructor)
├── index.json    # Component declarations
├── index.wxml    # Template
└── index.wxss    # Styles (can be empty)
```

### Required Patterns

1. **Register in `app.json`** — Every page must be in the `pages` array
2. **Await `initPromise`** — If the page needs app data:
   ```javascript
   async onLoad() {
     await app.globalData.initPromise;
   }
   ```
3. **Cleanup in `onUnload`** — Unsubscribe from EventBus, clear timers
4. **Declare components** — Register used components in `index.json`

## Current Pages

| Page | Route | Purpose |
|------|-------|---------|
| [Home](index/README.md) | `pages/index/index` | Entry page. Demonstrates initPromise, manual EventBus subscription, navigation |
| [Demo](demo/README.md) | `pages/demo/index` | Component showcase. Demonstrates stepper, modal, WXS, Behavior, EventBus helpers |

## Adding a New Page

See [Recipes: Adding a New Page](../docs/14-recipes.md#adding-a-new-page) for the complete template.

## See Also

- [Mini-Program Concepts: Page Lifecycle](../docs/01-mini-program-concepts.md#page-lifecycle)
- [Navigation Guide](../docs/12-navigation-guide.md)
