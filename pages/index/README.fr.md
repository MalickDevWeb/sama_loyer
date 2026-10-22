# Page d'accueil

**Route :** `pages/index/index`

La page d'entrée de l'application. Montre les principaux modèles du boilerplate.

## Ce qu'elle démontre

1. **Pattern initPromise** — `await app.globalData.initPromise` dans `onLoad()`
2. **Abonnement manuel EventBus** — appel direct `Bus.onState()` avec nettoyage dans `onUnload()`
3. **Utilisation de composants** — Nav bar, button, modal, typography, card
4. **Navigation** — `wx.navigateTo` vers la page demo

## Flux de données

```
onLoad()
  ├─► await initPromise
  ├─► Bus.getState(USER_DATA) → setData({ userName })
  ├─► Bus.onState(USER_DATA, callback) → mises à jour en direct
onUnload()
  └─► désabonnement de l'EventBus
```

## Composants utilisés

Enregistrés dans `index.json` :
- `app-nav-bar` — barre de navigation personnalisée
- `app-button` — boutons d'action
- `app-modal` — superposition de dialogue
- `app-typography` — texte stylé
- `app-card` — conteneur de contenu

## Voir aussi

- [Demo Page](../demo/README.md) — montre le pattern d'abonnement basé helpers
- [App Lifecycle](../../docs/04-app-lifecycle.md) — explication d'initPromise
- [EventBus Guide](../../docs/05-eventbus-guide.md) — patterns d'abonnement
