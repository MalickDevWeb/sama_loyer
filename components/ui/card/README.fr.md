# Carte

## Objectif

Un composant conteneur simple qui enveloppe ses enfants dans une carte bordée et arrondie. Utilisez-le pour regrouper visuellement des contenus liés, comme des éléments de liste, des sections de formulaire ou des blocs de résumé.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `containerClass` | `String` | `''` | Classe(s) CSS supplémentaires ajoutées au wrapper de la carte pour un style personnalisé. |

## Événements

Aucun.

## Slots

| Slot | Description |
|------|-------------|
| (default) | Tout le contenu de la carte — titres, texte principal, actions, etc. |

## Utilisation

```xml
<!-- WXML -->
<app-card containerClass="p-3">
  <view class="fw-bold">Order #1234</view>
  <view>Status: Shipped</view>
</app-card>
```

```json
{
  "usingComponents": {
    "app-card": "/components/ui/card/index"
  }
}
```

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
