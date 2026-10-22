# UI Component Library

A collection of reusable, low-level UI primitives for the TCMPP mini-program boilerplate. Each component follows the 4-file pattern (`index.js`, `index.json`, `index.wxml`, `index.wxss`) and is registered with an `app-` or `osn-` prefix.

## Components

| Component | Tag | Description | README |
|-----------|-----|-------------|--------|
| **Button** | `<app-button>` | Primary/secondary button with loading spinner and press animation. | [button/README.md](./button/README.md) |
| **Card** | `<app-card>` | Bordered, rounded container for grouping related content. | [card/README.md](./card/README.md) |
| **Center** | `<app-center>` | Flexbox utility that centres its children horizontally and vertically. | [center/README.md](./center/README.md) |
| **Icon (Base)** | `<osn-icon>` | Renders a PNG icon from the global icon sprite directory with optional background. | [icons/base/README.md](./icons/base/README.md) |
| **Image** | `<osn-image>` | Feature-rich image with retry, caching, preview, overlay slot, and badge. | [image/README.md](./image/README.md) |
| **Input** | `<app-input>` | Text and date input with trailing icon and results dropdown. | [input/README.md](./input/README.md) |
| **Input Spinner** | `<app-input-spinner>` | Numeric quantity selector with +/- buttons and min/max bounds. | [input-spinner/README.md](./input-spinner/README.md) |
| **Modal** | `<app-modal>` | Center/bottom-sheet dialog with backdrop blur and header/content/footer slots. | [modal/README.md](./modal/README.md) |
| **Nav Bar** | `<app-nav-bar>` | Custom navigation bar with status-bar safe area, back button, and title. | [nav-bar/README.md](./nav-bar/README.md) |
| **Radio Group** | `<app-radio-group>` | Single-select option list with named slots for custom labels. | [radio-group/README.md](./radio-group/README.md) |
| **Stepper** | `<app-stepper>` | Step indicator for multi-step flows with completed/active/pending states. | [stepper/README.md](./stepper/README.md) |
| **Tab Bar** | `<app-tab-bar>` | Tabbed navigation with dynamic named slots for headers and content panels. | [tab-bar/README.md](./tab-bar/README.md) |
| **Typography** | `<app-typography>` | Configurable text renderer for colour, size, weight, alignment, and ellipsis. | [typography/README.md](./typography/README.md) |

## Conventions

- Each component is self-contained in its own directory under `components/ui/`.
- Components use the 4-file pattern: `index.js`, `index.json`, `index.wxml`, `index.wxss`.
- Register components in your page's `index.json` `usingComponents` before use.
- Internal (non-page-facing) components use the `osn-` prefix; page-facing components use the `app-` prefix.

## See Also

- [Components Overview](../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../docs/14-recipes.md#adding-a-new-component)
