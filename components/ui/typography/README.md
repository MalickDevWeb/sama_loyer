# Typography

## Purpose

A text rendering component that applies consistent typographic styles -- colour, size, weight, alignment, decoration, line height, and single-line ellipsis truncation -- through properties. All styling is applied via inline styles on the wrapper element, making it easy to theme without writing custom CSS.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `message` | `String` | `''` | The text content to display. |
| `align` | `String` | `'left'` | Text alignment -- `'left'`, `'center'`, or `'right'`. |
| `fontWeight` | `String` | `'normal'` | CSS font-weight value -- `'normal'`, `'bold'`, `'lighter'`, `'bolder'`, or a numeric string `'100'`--`'900'`. |
| `colour` | `String` | `'#000000'` | Text colour (any valid CSS colour value). |
| `fontSize` | `String` | `'16px'` | Font size with unit (e.g., `'14px'`, `'28rpx'`). |
| `textDecoration` | `String` | `'none'` | CSS text-decoration -- `'none'`, `'underline'`, `'overline'`, or `'line-through'`. |
| `ellipsis` | `Boolean` | `false` | When `true`, truncates overflowing text with an ellipsis on a single line. |
| `lineHeight` | `String` | `'1.4'` | CSS line-height value. |

## Events

None.

## Slots

None (content is set via the `message` property).

## Usage

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

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
