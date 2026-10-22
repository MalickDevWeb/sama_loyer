# Composants de formulaire

Ce dossier est destiné aux composants spécifiques aux formulaires (champs de formulaire, validateurs, assistants).

## Conventions

- Chaque composant suit le modèle à 4 fichiers : `index.js`, `index.json`, `index.wxml`, `index.wxss`
- Préfixe : `app-form-` (par exemple `<app-form-select>`)
- Émettez des événements `change` avec le détail `{ name, value }` pour le binding des formulaires

## Voir aussi

- [Components Overview](../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../docs/14-recipes.md#adding-a-new-component)
