# Typography

## Objectif

Un composant de rendu de texte qui applique des styles typographiques cohérents — couleur, taille, poids, alignement, décoration, interligne et troncation en une seule ligne. Tous les styles sont appliqués via des styles inline sur l'élément wrapper, ce qui facilite le theming sans écrire de CSS personnalisé.

## Propriétés

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `message` | `String` | `''` | Le contenu textuel à afficher. |
| `align` | `String` | `'left'` | Alignement du texte — `'left'`, `'center'`, ou `'right'`. |
| `fontWeight` | `String` | `'normal'` | Valeur CSS `font-weight` — `'normal'`, `'bold'`, `'lighter'`, `'bolder'`, ou une chaîne numérique `'100'`–`'900'`. |
| `colour` | `String` | `'#000000'` | Couleur du texte (toute valeur CSS valide). |
| `fontSize` | `String` | `'16px'` | Taille de police avec unité (par ex. `'14px'`, `'28rpx'`). |
| `textDecoration` | `String` | `'none'` | Décoration de texte CSS — `'none'`, `'underline'`, `'overline'`, ou `'line-through'`. |
| `ellipsis` | `Boolean` | `false` | Si `true`, tronque le texte débordant avec une ellipse sur une seule ligne. |
| `lineHeight` | `String` | `'1.4'` | Valeur CSS `line-height`. |

## Événements

Aucun.

## Slots

Aucun (le contenu est fourni via la propriété `message`).

## Utilisation

```xml
<!-- WXML -->
<app-typography message="Hello World" fontSize="24px" fontWeight="bold" colour="#333" />

<app-typography
  message="This is a very long text that will be truncated with an ellipsis when it overflows the container"
  ellipsis="{{true}}"
  fontSize="14px"
  colour="#666"
/>

<app-typography message="Centered Title" align="center" fontWeight="700" fontSize="20px" />
```

```json
{
  "usingComponents": {
    "app-typography": "/components/ui/typography/index"
  }
}
```

## Voir aussi

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
