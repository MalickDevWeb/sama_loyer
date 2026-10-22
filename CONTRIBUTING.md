# Contributing

## Code Style

### File Headers
Every utility file uses section headers:
```javascript
// ============================================================================
// MODULE NAME
// Brief description of purpose
// ============================================================================
```

### JSDoc
Every exported function must have JSDoc with `@param`, `@returns`, and `@example`:
```javascript
/**
 * Brief description of what the function does.
 *
 * @param {string} name - Parameter description
 * @param {Object} [options] - Optional parameter
 * @returns {Promise<string>} What it returns
 *
 * @example
 * const result = await myFunction('value');
 */
```

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | camelCase | `pageHelpers.js` |
| Folders | kebab-case | `input-spinner/` |
| Functions | camelCase | `formatPrice()` |
| Classes | PascalCase | `HttpClient` |
| Constants | UPPER_SNAKE | `STORAGE_KEYS` |
| Component prefix | `app-` | `<app-button>` |
| CSS prefix | `osn-` | `.osn-button` |

### Import Order
1. Framework APIs (`wx.*`)
2. Utils (`../../utils/...`)
3. Local imports (`./...`)

## Adding a New Page

1. Create folder: `pages/your-page/`
2. Create 4 files: `index.js`, `index.wxml`, `index.wxss`, `index.json`
3. Register in `app.json`:
   ```json
   { "pages": ["pages/index/index", "pages/your-page/index"] }
   ```
4. Add component declarations in `index.json`
5. Create a `README.md` in the page folder

See [Recipes: Adding a New Page](docs/14-recipes.md#adding-a-new-page) for the full template.

## Adding a New Component

1. Create folder: `components/costumers/ui/your-component/`
2. Create 4 files following the existing pattern
3. Set `"component": true` in `index.json`
4. Create a `README.md` with the component template (Properties, Events, Slots, Usage)

See [Recipes: Adding a New Component](docs/14-recipes.md#adding-a-new-component) for the full template.

## Adding a New Utility

1. Create file in the appropriate `utils/` subfolder
2. Add section header comment
3. Export with JSDoc documentation
4. Update the folder's `README.md`

## Documentation

Every directory should have a `README.md`. When you add a new folder, add documentation.

## Commit Messages

Follow conventional commits:
```
feat: add user profile page
fix: resolve navigation stack overflow
chore: update dependencies
docs: add modal component documentation
```
