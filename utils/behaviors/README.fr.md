# Behaviors

Mixins Behavior() partagés pour pages et composants.

## Behaviors disponibles

### loadingBehavior (`loading.js`)

Fournit la gestion des états de chargement et d'erreur.

**Données :** `isLoading`, `hasError`, `errorMessage`
**Méthodes :** `withLoading(fn, options?)`, `setError(msg)`, `clearError()`

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

## Voir aussi

- [Behaviors Guide](../../docs/11-behaviors-guide.md) — documentation complète
- [Recipes: Creating a New Behavior](../../docs/14-recipes.md#creating-a-new-behavior)
