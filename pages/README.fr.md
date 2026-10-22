# Pages

## Conventions

Chaque page est un dossier avec 4 fichiers :

```
pages/my-page/
├── index.js      # Logique de la page (constructeur Page())
├── index.json    # Déclarations de composants
├── index.wxml    # Template
├── index.wxss    # Styles (peuvent être vides)
```

### Modèles requis

1. **Enregistrer dans `app.json`** — chaque page doit être dans le tableau `pages`
2. **Attendre `initPromise`** — si la page a besoin des données de l'app :
   ```javascript
   async onLoad() {
     await app.globalData.initPromise;
   }
   ```
3. **Nettoyer dans `onUnload`** — désabonner l'EventBus, vider les timers
4. **Déclarer les composants** — enregistrer les composants utilisés dans `index.json`

## Pages actuelles

| Page | Route | Objectif |
|------|-------|---------|
| [Home](index/README.md) | `pages/index/index` | Page d'entrée. Démonstration d'initPromise, abonnement manuel EventBus, navigation |
| [Demo](demo/README.md) | `pages/demo/index` | Vitrine de composants. Démonstration de stepper, modal, WXS, Behavior, helpers EventBus |

## Ajouter une nouvelle page

Voir [Recipes: Adding a New Page](../docs/14-recipes.md#adding-a-new-page) pour le modèle complet.

## Voir aussi

- [Mini-Program Concepts: Page Lifecycle](../docs/01-mini-program-concepts.md#page-lifecycle)
- [Navigation Guide](../docs/12-navigation-guide.md)
