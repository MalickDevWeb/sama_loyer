# Input

<app-nav-bar />
<view class=" d-flex flex-column px-4">
  <view class="fs-1 fw-bold ">Bonjour 👋 </view>
  <view class="fs-3">
    Explorons le <text class="text-warning fw-semibold ">Sénégal</text> !
  </view>
  <app-input
    containerClass="p-1 br-35 mt-4 fs-4"
    icon="search"
    bind:input="onInput"
    bind:iconTap="onSearch"
  />

<app-input
containerClass="p-1 br-35 mt-4 fs-4"
value="{{ query }}"
placeholder=" Où voulez-vous allez ?"
field-style="font-size: 25rpx;"
placeholder-style="font-size: 28rpx; color: red;"
icon="search"
bind:input="onInput"
bind:iconTap="onSearch"
iconPosition="left"

/>

</view>

## Purpose

A flexible input component for Mini Program forms. This component supports:

- text entry with inline field styling,
- optional date picker mode,
- an optional icon on the left or right,
- custom placeholder styling,
- an optional results dropdown rendered through a slot.

The component uses the internal `osn-icon` component for icon rendering and allows direct styling through props.

## Properties

| Property           | Type      | Default   | Description                                      |
| ------------------ | --------- | --------- | ------------------------------------------------ |
| `value`            | `String`  | `''`      | Current value of the input field.                |
| `placeholder`      | `String`  | `''`      | Placeholder text shown when the input is empty.  |
| `type`             | `String`  | `'text'`  | Input mode. Supports `'text'` and `'date'`.      |
| `readonly`         | `Boolean` | `false`   | Disables editing when `true`.                    |
| `containerClass`   | `String`  | `''`      | Additional CSS classes for the outer wrapper.    |
| `fieldStyle`       | `String`  | `''`      | Inline CSS applied directly to the text input.   |
| `placeholderStyle` | `String`  | `''`      | Inline CSS applied to the placeholder text.      |
| `icon`             | `String`  | `''`      | Icon name to render via the internal `osn-icon`. |
| `iconPosition`     | `String`  | `'right'` | Icon placement: `'left'` or `'right'`.           |
| `height`           | `String`  | `'40'`    | Icon height in `rpx`.                            |
| `width`            | `String`  | `'40'`    | Icon width in `rpx`.                             |
| `showResults`      | `Boolean` | `false`   | When `true`, renders the results dropdown panel. |
| `resultClass`      | `String`  | `''`      | Additional CSS classes for the results dropdown. |
| `results`          | `Array`   | `[]`      | Data items available for the results slot.       |

## Events

| Event          | Detail      | Description                                                    |
| -------------- | ----------- | -------------------------------------------------------------- |
| `input`        | `{ value }` | Fired when the text input changes.                             |
| `iconTap`      | --          | Fired when the icon is tapped.                                 |
| `selectResult` | `Event`     | Fired when a result item inside the `result` slot is selected. |
| `dateChanged`  | `{ value }` | Fired when date mode changes value.                            |

## Slots

| Slot     | Description                                      |
| -------- | ------------------------------------------------ |
| `result` | Custom content rendered in the results dropdown. |

## Usage

```xml
<app-input
  value="{{ query }}"
  placeholder="Search..."
  icon="search"
  iconPosition="left"
  fieldStyle="font-size: 28rpx; color: #111;"
  placeholderStyle="color: #999;"
  bind:input="onInput"
  bind:iconTap="onSearch"
/>
```

```xml
<app-input
  type="date"
  value="{{ selectedDate }}"
  placeholder="Select a date"
  bind:dateChanged="onDateChange"
/>
```

```xml
<app-input
  value="{{ query }}"
  placeholder="Type to search"
  showResults="{{ results.length > 0 }}"
  resultClass="search-results"
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

## Notes

- Use `fieldStyle` to adjust the typed text appearance.
- Use `placeholderStyle` to style the placeholder separately.
- `iconPosition` controls whether the icon appears before or after the input.
- The results dropdown is rendered only when `showResults` is `true` and the `result` slot is supplied.

## See Also

- [Icon component](../icons/base/README.md)
- [Input Spinner component](../input-spinner/README.md)
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
