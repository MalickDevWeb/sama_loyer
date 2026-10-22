# Stepper

## Objectif

Un indicateur d'étapes pour les flux multi-étapes comme le checkout, les formulaires et l'onboarding. Affiche des étapes numérotées avec étiquettes, lignes de connexion et états complété/actif/en attente. Les étapes peuvent être des chaînes simples ou des objets avec `label`, `value`, et `disabled`. Prend en charge trois variantes visuelles.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `steps` | `Array` | `[]` | Tableau de définitions d'étapes. Chaque élément peut être une simple `String` (utilisée comme label) ou un objet `{ label, value?, disabled? }`. |
| `current` | `Number|String` | `0` | Étape active, spécifiée soit par index numérique soit par chaîne `value` de l'étape. |
| `showLines` | `Boolean` | `true` | Rend les lignes de connexion entre les étapes. |
| `clickable` | `Boolean` | `false` | Si `true`, l'utilisateur peut taper une étape pour y naviguer (déclenche `change`). |
| `variant` | `String` | `'default'` | Style visuel — `'default'`, `'compact'`, ou `'pill'`. |

## Événements

| Événement | Détail | Description |
|-------|--------|-------------|
| `change` | `{ value, index, label }` | Déclenché lorsque l'utilisateur tape une étape (uniquement si `clickable` est `true` et que l'étape n'est pas `disabled`). |

## Slots

Aucun.

## Utilisation

```xml
<!-- WXML : étapes simples -->
<app-stepper
  steps="{{ ['Cart', 'Shipping', 'Payment', 'Done'] }}"
  current="{{1}}"
/>

<!-- WXML : étapes objet avec navigation cliquable -->
<app-stepper
  steps="{{ steps }}"
  current="{{ currentStep }}"
  clickable="{{true}}"
  variant="compact"
  bind:change="onStepChange"
/>
```

```js
// JS
Page({
  data: {
    currentStep: 'shipping',
    steps: [
      { label: 'Cart', value: 'cart' },
      { label: 'Shipping', value: 'shipping' },
      { label: 'Payment', value: 'payment', disabled: true },
      { label: 'Confirmation', value: 'confirm', disabled: true }
    ]
  },
  onStepChange(e) {
    this.setData({ currentStep: e.detail.value });
  }
});
```

```json
{
  "usingComponents": {
    "app-stepper": "/components/ui/stepper/index"
  }
}
```

## Voir aussi

- [Typography component](../typography/README.md) — utilisé en interne pour les labels
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
