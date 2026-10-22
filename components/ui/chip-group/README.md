# Chip Group

## Purpose

A horizontal chip selector component for choosing one item from a list. It renders a scrollable row of chips and highlights the active item while emitting changes when a chip is tapped.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `items` | `Array` | `[]` | Array of chip objects rendered by the component. Each object should include `id` and `label` properties. |
| `activeId` | `String` | `''` | The `id` of the currently active chip. The chip with this id is styled as selected. |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `change` | `{ id }` | Fired when a chip is tapped. The event detail contains the selected chip `id`. |

## Slots

This component does not expose named slots. All chip content is generated from the `items` property.

## Usage

```xml
<!-- WXML -->
<app-chip-group
  items="{{ chipItems }}"
  activeId="{{ selectedChipId }}"
  bind:change="onChipChange"
/>
```

```json
{
  "usingComponents": {
    "app-chip-group": "/components/ui/chip-group/index"
  }
}
```

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
