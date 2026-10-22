# Helpers

Utilitaires de niveau page et wrappers de navigation.

## Helpers de page (`page.js`)

| Fonction | Objectif |
|----------|---------|
| `showToast(message, type?)` | Affiche une notification toast (`'success'`, `'error'`, `'none'`) |
| `showLoading(message?)` | Affiche un indicateur de chargement avec masque |
| `hideLoading()` | Cache l'indicateur de chargement |
| `createPageHelpers(page, bindings)` | Abonne automatiquement les données de la page à l'état EventBus |
| `retryAsync(fn, options?)` | Réessaie une opération asynchrone avec backoff et retour UI |

## Helpers de navigation (`navigation.js`)

| Fonction | Objectif |
|----------|---------|
| `navigateTo(url)` | Empile une page (auto-fallback à 10 pages) |
| `redirectTo(url)` | Remplace la page actuelle |
| `switchTab(url)` | Bascule vers une page tabBar |
| `reLaunch(url)` | Ferme tout et ouvre une page |
| `navigateBack(delta?)` | Reculer (auto-fallback vers l'accueil si la pile est vide) |
| `getStackInfo()` | Renvoie `{ depth, current, canGoBack }` |

## Voir aussi

- [Navigation Guide](../../docs/12-navigation-guide.md) — documentation de navigation complète
- [EventBus Guide](../../docs/05-eventbus-guide.md) — détails d'abonnement d'état
