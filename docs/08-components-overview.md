# Components Overview

## Architecture

Every component is a folder with 4 files:

```
components/ui/button/
├── index.js      # Logic: Component(), properties, data, methods
├── index.json    # Config: { "component": true, "usingComponents": {} }
├── index.wxml    # Template: markup with data bindings
└── index.wxss    # Styles: scoped CSS
```

## Registration

Components must be declared in the consuming page's `index.json`:

```json
{
  "usingComponents": {
    "app-button": "/components/ui/button/index",
    "app-modal": "/components/ui/modal/index"
  }
}
```

**Convention:** All components use the `app-` prefix.

## Component Catalog

### Layout
| Component | Path | Purpose |
|-----------|------|---------|
| [Card](../../components/ui/card/README.md) | `components/ui/card/` | Container with border and padding |
| [Center](../../components/ui/center/README.md) | `components/ui/center/` | Centering utility |
| [Nav Bar](../../components/ui/nav-bar/README.md) | `components/ui/nav-bar/` | Custom navigation bar with safe area |

### Input
| Component | Path | Purpose |
|-----------|------|---------|
| [Button](../../components/ui/button/README.md) | `components/ui/button/` | Primary/secondary with loading state |
| [Input](../../components/ui/input/README.md) | `components/ui/input/` | Text input with icon and search results |
| [Input Spinner](../../components/ui/input-spinner/README.md) | `components/ui/input-spinner/` | Numeric increment/decrement |
| [Radio Group](../../components/ui/radio-group/README.md) | `components/ui/radio-group/` | Radio button selection |

### Display
| Component | Path | Purpose |
|-----------|------|---------|
| [Typography](../../components/ui/typography/README.md) | `components/ui/typography/` | Styled text display |
| [Image](../../components/ui/image/README.md) | `components/ui/image/` | Image with retry, caching, preview |
| [Icons](../../components/ui/icons/base/README.md) | `components/ui/icons/base/` | Base icon component |
| [Stepper](../../components/ui/stepper/README.md) | `components/ui/stepper/` | Multi-step progress indicator |
| [Tab Bar](../../components/ui/tab-bar/README.md) | `components/ui/tab-bar/` | Tab navigation |

### Overlay
| Component | Path | Purpose |
|-----------|------|---------|
| [Modal](../../components/ui/modal/README.md) | `components/ui/modal/` | Center dialog or bottom sheet |

## Style Isolation

Components can control how styles interact with the page:

| Mode | Meaning | Used By |
|------|---------|---------|
| `isolated` (default) | Component styles are fully isolated | Most components |
| `apply-shared` | Page styles can affect the component | Modal |
| `shared` | Styles are fully shared | Rarely used |

Set in `index.js`: `options: { styleIsolation: 'apply-shared' }`

Some components use `virtualHost: true` to remove the wrapping custom element node (Center, Image).

## Slots

Components accept child content via slots:

```xml
<!-- Single default slot -->
<app-card>
  <text>Card content goes here</text>
</app-card>

<!-- Named slots -->
<app-modal>
  <view slot="header">Title</view>
  <view slot="content">Body</view>
  <view slot="footer"><app-button>Done</app-button></view>
</app-modal>
```

Enable named slots: `"options": { "multipleSlots": true }` in component JSON.

## Communication Patterns

### Parent → Component: Properties

```javascript
// Component definition
Component({
  properties: {
    title: { type: String, value: '' },
    disabled: { type: Boolean, value: false },
  },
});
```

```xml
<!-- Parent usage -->
<app-button disabled="{{ true }}">Click me</app-button>
```

### Component → Parent: Events

```javascript
// Component triggers
this.triggerEvent('change', { value: newValue });
```

```xml
<!-- Parent listens -->
<app-stepper bind:change="handleStepChange" />
```

## See Also

- [Styling Guide](09-styling-guide.md) — CSS variables, utility classes
- [Behaviors Guide](11-behaviors-guide.md) — Sharing code between components
- [Recipes: Adding a New Component](14-recipes.md#adding-a-new-component)
