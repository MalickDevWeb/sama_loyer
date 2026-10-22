# Form Components

This directory is for form-specific components (form fields, validators, wizards).

## Conventions

- Each component follows the 4-file pattern: `index.js`, `index.json`, `index.wxml`, `index.wxss`
- Prefix: `app-form-` (e.g., `<app-form-select>`)
- Emit `change` events with `{ name, value }` detail for form binding

## See Also

- [Components Overview](../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../docs/14-recipes.md#adding-a-new-component)
