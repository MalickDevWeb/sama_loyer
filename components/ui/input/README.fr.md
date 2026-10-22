# Input

## Objectif

Un composant d'entrée polyvalent qui prend en charge la saisie texte et le mode date, avec une icône finale optionnelle et un panneau déroulant de résultats. Utilise `osn-icon` pour le rendu de l'icône. Convient aux barres de recherche, champs de formulaire et sélecteurs de date.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `value` | `String` | `''` | Valeur courante de l'input (liaison bidirectionnelle via événements). |
| `placeholder` | `String` | `''` | Texte d'espace réservé affiché quand l'input est vide. |
| `type` | `String` | `'text'` | Mode d'entrée — `'text'` pour un champ standard ou `'date'` pour un sélecteur de date natif. |
| `readonly` | `Boolean` | `false` | Rend l'input non éditable. |
| `containerClass` | `String` | `''` | Classe(s) CSS supplémentaires sur le wrapper externe. |
| `icon` | `String` | `''` | Nom de l'icône passé à `osn-icon`. Si défini, un bouton icône est affiché à droite de l'input. En mode `'date'`, l'icône peut aussi ouvrir un date picker. |
| `showResults` | `Boolean` | `false` | Si `true`, affiche le panneau déroulant des résultats sous l'input. |
| `resultClass` | `String` | `''` | Classe CSS pour le conteneur du panneau de résultats. |
| `results` | `Array` | `[]` | Tableau d'éléments résultats (rendu via le slot `result`). |

## Événements

| Événement | Détail | Description |
|-------|--------|-------------|
| `input` | `{ value }` | Déclenché à chaque frappe en mode `text`. |
| `iconTap` | -- | Déclenché quand l'icône finale est tapée. |
| `selectResult` | (événement délégué) | Déclenché quand un élément du slot `result` est sélectionné. |
| `dateChanged` | `{ value }` | Déclenché quand la valeur du sélecteur de date change (en mode `date` ou via l'icône date picker). |

## Slots

| Slot | Description |
|------|-------------|
| `result` | Modèle personnalisé pour chaque élément du panneau de résultats. |

## Utilisation

```xml
<!-- WXML : input texte avec icône -->
<app-input
  value="{{ query }}"
  placeholder="Search..."
  icon="search"
  bind:input="onSearch"
  bind:iconTap="onIconTap"
/>

<!-- WXML : sélecteur de date -->
<app-input
  type="date"
  value="{{ selectedDate }}"
  placeholder="Select a date"
  bind:dateChanged="onDateChange"
/>

<!-- WXML : avec panneau de résultats -->
<app-input
  value="{{ query }}"
  placeholder="Type to search"
  showResults="{{ results.length > 0 }}"
  bind:input="onSearch"
  bind:selectResult="onSelectResult"
>
  <view slot="result" wx:for="{{ results }}" wx:key="id" data-item="{{ item }}" bindtap="onSelectResult">
    {{ item.label }}
  </view>
</app-input>
```

```json
{
  "usingComponents": {
    "app-input": "/components/ui/input/index"
  }
}
```

## Voir aussi

- [Icon component](../icons/base/README.md) — utilisé pour l'icône finale
- [Input Spinner component](../input-spinner/README.md) — sélecteur numérique
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
