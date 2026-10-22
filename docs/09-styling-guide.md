# Styling Guide

## Global Styles (`app.wxss`)

The boilerplate includes a **mini-program-optimized utility CSS system** (~475 lines) with Bootstrap-compatible naming. All spacing uses `rpx` units for consistent cross-device rendering. Pages get these utilities automatically; components that need them use `styleIsolation: "apply-shared"`.

## CSS Variables

Defined on `:root` in `app.wxss`:

### Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--bs-primary` | `#085EBD` | Primary brand color |
| `--bs-secondary` | `#F16E00` | Secondary/accent color |
| `--bs-success` | `#198754` | Success states |
| `--bs-info` | `#0077EA` | Informational |
| `--bs-warning` | `#ffc107` | Warning states |
| `--bs-danger` | `#dc3545` | Error/danger states |
| `--bs-light` | `#E1E1E1` | Light backgrounds |
| `--bs-dark` | `#000` | Dark text/backgrounds |
| `--bs-white` | `#fff` | White |
| `--bs-gray` | `#F9F9F9` | Light gray |

### Typography
| Variable | Value |
|----------|-------|
| `--bs-font-sans-serif` | `'Panchang', -apple-system, ...` |
| `--bs-font-monospace` | `Helvetica Neue LT Std, SFMono-Regular, ...` |

Custom font `Panchang` is loaded from `assets/fonts/`.

## Spacing Scale

All spacing utilities use **rpx** with this scale:

| Level | Value | ~px on iPhone 6/7/8 |
|-------|-------|---------------------|
| `0` | `0` | 0 |
| `1` | `16rpx` | 8px |
| `2` | `24rpx` | 12px |
| `3` | `32rpx` | 16px |
| `4` | `48rpx` | 24px |
| `5` | `64rpx` | 32px |

## Utility Classes

### Display
| Class | CSS |
|-------|-----|
| `d-flex` | `display: flex` |
| `d-inline-flex` | `display: inline-flex` |
| `d-block` | `display: block` |
| `d-inline-block` | `display: inline-block` |
| `d-inline` | `display: inline` |
| `d-none` | `display: none` |

### Flexbox
| Class | CSS |
|-------|-----|
| `flex-row` | `flex-direction: row` |
| `flex-column` | `flex-direction: column` |
| `flex-row-reverse` | `flex-direction: row-reverse` |
| `flex-column-reverse` | `flex-direction: column-reverse` |
| `flex-wrap` | `flex-wrap: wrap` |
| `flex-nowrap` | `flex-wrap: nowrap` |
| `flex-1` | `flex: 1 1 0%` |
| `flex-auto` | `flex: 1 1 auto` |
| `flex-grow-0` / `flex-grow-1` | `flex-grow: 0/1` |
| `flex-shrink-0` / `flex-shrink-1` | `flex-shrink: 0/1` |

### Alignment
| Class | CSS |
|-------|-----|
| `align-items-start` | `align-items: flex-start` |
| `align-items-end` | `align-items: flex-end` |
| `align-items-center` | `align-items: center` |
| `align-items-baseline` | `align-items: baseline` |
| `align-items-stretch` | `align-items: stretch` |
| `align-self-start` / `center` / `end` / `stretch` | `align-self: *` |
| `justify-content-start` | `justify-content: flex-start` |
| `justify-content-end` | `justify-content: flex-end` |
| `justify-content-center` | `justify-content: center` |
| `justify-content-between` | `justify-content: space-between` |
| `justify-content-around` | `justify-content: space-around` |
| `justify-content-evenly` | `justify-content: space-evenly` |

### Gap
| Pattern | Example | CSS |
|---------|---------|-----|
| `gap-{0-5}` | `gap-2` | `gap: 24rpx` |
| `row-gap-{0-5}` | `row-gap-1` | `row-gap: 16rpx` |
| `column-gap-{0-5}` | `column-gap-3` | `column-gap: 32rpx` |

### Padding
| Pattern | Example | CSS |
|---------|---------|-----|
| `p-{0-5}` | `p-3` | `padding: 32rpx` |
| `px-{0-5}` | `px-2` | `padding-left/right: 24rpx` |
| `py-{0-5}` | `py-4` | `padding-top/bottom: 48rpx` |
| `pt-{0-5}` | `pt-1` | `padding-top: 16rpx` |
| `pb-{0-5}` | `pb-3` | `padding-bottom: 32rpx` |
| `ps-{0-5}` | `ps-2` | `padding-left: 24rpx` |
| `pe-{0-5}` | `pe-2` | `padding-right: 24rpx` |

### Margin
| Pattern | Example | CSS |
|---------|---------|-----|
| `m-{0-5}` | `m-3` | `margin: 32rpx` |
| `mx-{0-5}` / `mx-auto` | `mx-auto` | `margin-left/right: auto` |
| `my-{0-5}` | `my-2` | `margin-top/bottom: 24rpx` |
| `mt-{0-5}` / `mb-{0-5}` | `mb-3` | `margin-bottom: 32rpx` |
| `ms-{0-5}` / `ms-auto` | `ms-auto` | `margin-left: auto` |
| `me-{0-5}` / `me-auto` | `me-1` | `margin-right: 16rpx` |

### Width & Height
| Class | CSS |
|-------|-----|
| `w-25` / `w-50` / `w-75` / `w-100` / `w-auto` | `width: 25%/50%/75%/100%/auto` |
| `h-25` / `h-50` / `h-75` / `h-100` / `h-auto` | `height: 25%/50%/75%/100%/auto` |
| `min-w-0` / `max-w-100` | Min/max width |
| `min-h-0` / `min-h-100` | Min height |

### Text
| Class | CSS |
|-------|-----|
| `text-center` | `text-align: center` |
| `text-left` / `text-start` | `text-align: left` |
| `text-right` / `text-end` | `text-align: right` |
| `text-wrap` | `white-space: normal` |
| `text-nowrap` | `white-space: nowrap` |
| `text-truncate` | Ellipsis overflow |
| `text-break` | `word-break: break-word` |

### Font Weight
| Class | CSS |
|-------|-----|
| `fw-light` | `font-weight: 300` |
| `fw-normal` | `font-weight: 400` |
| `fw-medium` | `font-weight: 500` |
| `fw-semibold` | `font-weight: 600` |
| `fw-bold` | `font-weight: 700` |

### Font Size (rpx scale)
| Class | Size |
|-------|------|
| `fs-1` | `48rpx` |
| `fs-2` | `44rpx` |
| `fs-3` | `40rpx` |
| `fs-4` | `36rpx` |
| `fs-5` | `32rpx` |
| `fs-6` | `28rpx` |
| `fs-7` | `24rpx` |
| `fs-8` | `20rpx` |

### Text & Background Colors
| Pattern | Values |
|---------|--------|
| `text-{color}` | `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `white`, `dark`, `muted`, `light` |
| `bg-{color}` | `primary`, `secondary`, `success`, `danger`, `warning`, `info`, `white`, `dark`, `light`, `transparent` |

### Border
| Class | CSS |
|-------|-----|
| `border` | `border: 2rpx solid #dee2e6` |
| `border-0` | `border: 0` |
| `border-top` / `border-bottom` | Top/bottom border |
| `border-start` / `border-end` | Left/right border |
| `border-primary` / `border-light` / `border-dark` | Border color |

### Border Radius
| Class | CSS |
|-------|-----|
| `br-0` to `br-50` (step 5) | `border-radius: 0-50rpx` |
| `br-full` | `border-radius: 9999rpx` |
| `rounded` | `border-radius: 16rpx` |
| `rounded-sm` / `rounded-lg` / `rounded-xl` | `8rpx / 24rpx / 32rpx` |
| `rounded-circle` | `border-radius: 50%` |

### Overflow, Position, Opacity
| Pattern | Classes |
|---------|---------|
| Overflow | `overflow-auto`, `overflow-hidden`, `overflow-visible`, `overflow-scroll` |
| Position | `position-relative`, `position-absolute`, `position-fixed`, `position-sticky` |
| Edges | `top-0`, `bottom-0`, `start-0`, `end-0` |
| Opacity | `opacity-0`, `opacity-25`, `opacity-50`, `opacity-75`, `opacity-100` |
| Shadow | `shadow-none`, `shadow-sm`, `shadow`, `shadow-lg` |
| Z-index | `z-0`, `z-1`, `z-2`, `z-3` |
| Visibility | `visible`, `invisible` |

## rpx Units

`rpx` (responsive pixel) scales with screen width. **750rpx = screen width** on any device.

| Device | Screen Width | 1rpx = |
|--------|-------------|--------|
| iPhone SE | 320pt | 0.427px |
| iPhone 6/7/8 | 375pt | 0.5px |
| iPhone 12/13 | 390pt | 0.52px |
| iPhone 14 Pro Max | 430pt | 0.573px |

**When to use what:**
- `rpx` — Layout dimensions, spacing, font sizes (preferred)
- `%` — Fluid widths relative to parent
- Avoid `px`, `rem`, `em`, `vw` — these are web units that don't scale correctly in mini programs

## Component Styling Patterns

### Accessing Global Utilities in Components

Components that need utility classes use `styleIsolation: "apply-shared"` in their JSON config instead of importing app.wxss:

```json
{
  "component": true,
  "styleIsolation": "apply-shared",
  "usingComponents": {}
}
```

This inherits page-level styles (which include `app.wxss`) without duplicating the file into each component.

**When to use it:**
- Your component WXML uses utility classes like `d-flex`, `p-3`, `gap-2`
- Examples: `card`, `input`, `radio-group`

**When NOT to use it:**
- Your component only uses its own `osn-*` scoped classes
- Default `isolated` mode is better for encapsulation
- Examples: `button`, `stepper`, `nav-bar`, `modal` (modal sets it in JS for slot styling)

### BEM-like Naming

All components use the `osn-` prefix with BEM-inspired naming:

```css
.osn-button { }           /* Block */
.osn-button__text { }     /* Element */
.osn-button--primary { }  /* Modifier */
.osn-button--disabled { }
```

### Status Classes (from WXS filters)

```css
.status--success { color: #198754; }
.status--warning { color: #ffc107; }
.status--danger  { color: #dc3545; }
.status--muted   { color: #6c757d; }
.status--default { color: #333; }
```

## Project Utilities

| Class | Purpose |
|-------|---------|
| `.ellepsissed` | Truncate text at 30 characters with ellipsis |
| `.scrollable` | Hide scrollbar (cross-browser) |
| `.menu-tabs` | Horizontal scrolling tab container |

## See Also

- [Components Overview](08-components-overview.md) — Component catalog
- [WXS Filters](10-wxs-filters.md) — Dynamic CSS class generation via `statusClass()`
- [Mini-Program Concepts](01-mini-program-concepts.md) — rpx explanation
