# Modal

## Objectif

Un composant de dialogue/superposition polyvalent prenant en charge les placements au centre et en bas, une couleur et un flou de fond configurables, plusieurs presets de taille et trois slots nommés pour le header, le contenu et le footer. Utilise `multipleSlots` et `apply-shared` pour que les styles parents puissent s'appliquer.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `visible` | `Boolean` | `false` | Contrôle l'affichage du modal. |
| `placement` | `String` | `'center'` | Où le dialogue apparaît — `'center'` ou `'bottom'` (bottom sheet). |
| `size` | `String` | `'md'` | Préset de largeur — `'sm'` (60%), `'md'` (80%), `'lg'` (90%), ou `'full'` (100%). |
| `overlayColor` | `String` | `'#000'` | Couleur du backdrop. |
| `overlayOpacity` | `Number` | `0.5` | Opacité du backdrop (0–1). |
| `blur` | `Number` | `6` | Valeur `backdrop-filter: blur()` en pixels. |
| `backdropClosable` | `Boolean` | `true` | Si `true`, taper sur l'overlay déclenche l'événement `close`. |
| `containerClass` | `String` | `''` | Classe(s) CSS supplémentaires sur le container du dialogue. |
| `overlayClass` | `String` | `''` | Classe(s) CSS supplémentaires sur l'overlay. |
| `hasHeader` | `Boolean` | `false` | Défini à `true` pour rendre le wrapper du slot `header`. |
| `hasContent` | `Boolean` | `false` | Défini à `true` pour rendre le wrapper du slot `content`. |
| `hasFooter` | `Boolean` | `false` | Défini à `true` pour rendre le wrapper du slot `footer`. |

## Événements

| Événement | Détail | Description |
|-------|--------|-------------|
| `close` | -- | Déclenché quand l'utilisateur tape sur le backdrop (uniquement si `backdropClosable` est `true`). |

## Slots

| Slot | Description |
|------|-------------|
| `header` | Zone d'en-tête du modal (nécessite `hasHeader="{{true}}"`). |
| `content` | Zone de contenu du modal (nécessite `hasContent="{{true}}"`). |
| `footer` | Zone de pied de page, typiquement pour les boutons d'action (nécessite `hasFooter="{{true}}"`). |

## Utilisation

```xml
<!-- WXML -->
<app-modal
  visible="{{ showDialog }}"
  placement="center"
  size="md"
  hasHeader="{{true}}"
  hasContent="{{true}}"
  hasFooter="{{true}}"
  bind:close="onCloseModal"
>
  <view slot="header">Confirm Action</view>
  <view slot="content">Are you sure you want to proceed?</view>
  <view slot="footer">
    <app-button type="secondary" bind:onPress="onCloseModal">Cancel</app-button>
    <app-button type="primary" bind:onPress="onConfirm">OK</app-button>
  </view>
</app-modal>

<!-- Bottom sheet -->
<app-modal visible="{{ showSheet }}" placement="bottom" size="full" bind:close="onCloseSheet">
  <!-- ... -->
</app-modal>
```

```json
{
  "usingComponents": {
    "app-modal": "/components/ui/modal/index"
  }
}
```

## Voir aussi

- [Button component](../button/README.md) — souvent utilisé dans les footers de modals
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
