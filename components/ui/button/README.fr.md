# Bouton

## Objectif

Un bouton d'action stylé prenant en charge les variantes primaire et secondaire avec spinner de chargement intégré, état désactivé et animation de pression tactile. Utilisez-le pour toutes les interactions par appui dans le mini-programme.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `type` | `String` | `'primary'` | Variante visuelle — `'primary'` ou `'secondary'`. |
| `disabled` | `Boolean` | `false` | Désactive le bouton et empêche les événements de tap. |
| `loading` | `Boolean` | `false` | Affiche un spinner inline et désactive l'interaction. |

## Événements

| Événement | Détail | Description |
|-------|--------|-------------|
| `onPress` | -- | Déclenché au tap lorsque le bouton n'est ni `disabled` ni `loading`. |

## Slots

| Slot | Description |
|------|-------------|
| (default) | Libellé du bouton / contenu interne. Affiché à côté du spinner lorsque `loading` est `true`. |

## Utilisation

```xml
<!-- WXML -->
<app-button type="primary" loading="{{ submitting }}" bind:onPress="handleSubmit">
  Submit
</app-button>

<app-button type="secondary" disabled="{{ !canProceed }}" bind:onPress="handleCancel">
  Cancel
</app-button>
```

```json
{
  "usingComponents": {
    "app-button": "/components/ui/button/index"
  }
}
```

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
