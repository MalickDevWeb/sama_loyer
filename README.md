# TCMPP Boilerplate

A production-ready foundation for building TCMPP (Tencent Cloud Mini Program Platform) mini-apps. Clone it, configure it, start building.

## What You Get

- **EventBus** — Cross-page state management and event system with middleware, replay, and history
- **HTTP Client** — Session-tracked API client with all HTTP verbs and unified response format
- **OAuth2 Auth** — Client credentials flow with token caching and auto-refresh
- **Native Plugin Service** — Typed `wx.invokeNativePlugin` wrappers with retry and backoff
- **JSON Sculpt** — Declarative API response transformation engine
- **13+ UI Components** — Button, Modal, Nav Bar, Stepper, Input, Typography, and more
- **Behaviors** — Shared loading/error state mixins for pages and components
- **WXS Filters** — View-thread template filters for fast display logic
- **Navigation Helpers** — Safe wrappers around all 5 wx navigation methods
- **Storage Wrapper** — Error-safe local storage operations
- **Utility CSS** — Bootstrap-derived flexbox, spacing, and layout classes

## Quick Start

1. **Install** [TCMPP Developer Tools](https://cloud.tencent.com/product/tcmpp)
2. Clone this repo
3. Open the project folder in TCMPP DevTools
4. The mini-program compiles and renders automatically

> First time with mini-programs? Start with [Mini-Program Concepts](docs/01-mini-program-concepts.md).

## Project Structure

```
tcmpp-boilerplate/
├── app.js                    # App entry: init, EventBus, error handlers, network
├── app.json                  # Routes, window config, permissions
├── app.wxss                  # Global styles (Bootstrap-derived utilities)
├── project.config.json       # TCMPP DevTools settings
│
├── pages/                    # Application pages
│   ├── index/                # Home page (initPromise, EventBus demo)
│   └── demo/                 # Demo page (stepper, modal, WXS, Behavior)
│
├── components/               # Reusable components
│   ├── ui/                   # UI library (button, modal, nav-bar, etc.)
│   ├── forms/                # Form components (placeholder)
│   └── ux/                   # UX components (placeholder)
│
├── utils/                    # Utility modules
│   ├── apis/                 # HTTP client, auth, native plugins, BackendAPI
│   ├── event/                # EventBus (state management + pub/sub)
│   ├── json-sculpt/          # Declarative data transformation engine
│   ├── constants/            # Centralized app constants
│   ├── formatters/           # Date, price, string formatters
│   ├── helpers/              # Page helpers, navigation helpers
│   ├── behaviors/            # Shared Behavior() mixins
│   ├── wxs/                  # WXS template filters
│   ├── mappers/              # Sculpt schema definitions
│   ├── config.js             # Environment configuration (dev/prod)
│   └── storage.js            # Safe wx storage wrapper
│
├── types/                    # JSDoc type definitions
└── typings/                  # WeChat API TypeScript definitions
```

## Learning Path

| Step | Topic | Link |
|------|-------|------|
| 1 | Mini-program fundamentals | [Mini-Program Concepts](docs/01-mini-program-concepts.md) |
| 2 | How this project is structured | [Project Architecture](docs/02-project-architecture.md) |
| 3 | Setup and first run | [Getting Started](docs/03-getting-started.md) |
| 4 | app.js deep dive | [App Lifecycle](docs/04-app-lifecycle.md) |
| 5 | State management | [EventBus Guide](docs/05-eventbus-guide.md) |
| 6 | Making API calls | [API Layer](docs/06-api-layer.md) |
| 7 | Data transformation | [JSON Sculpt Guide](docs/07-json-sculpt-guide.md) |
| 8 | Using components | [Components Overview](docs/08-components-overview.md) |
| 9 | Common tasks | [Recipes](docs/14-recipes.md) |
| 10 | When things go wrong | [Troubleshooting](docs/15-troubleshooting.md) |
| 11 | Custom WeChat tabbar | [Custom TabBar WeChat](docs/17-custom-tab-bar.md) |
| 12 | iPhone responsive audit | [iPhone Responsive Audit](docs/README-responsive-iphone.md) |

## All Documentation

### Guides
- [Mini-Program Concepts](docs/01-mini-program-concepts.md) — WeChat/TCMPP runtime, file types, lifecycles
- [Project Architecture](docs/02-project-architecture.md) — Data flow diagrams, module dependencies
- [Getting Started](docs/03-getting-started.md) — Setup, configuration, first changes
- [App Lifecycle](docs/04-app-lifecycle.md) — app.js: initPromise, updates, network, errors
- [EventBus Guide](docs/05-eventbus-guide.md) — Complete state management and event API
- [API Layer](docs/06-api-layer.md) — HTTP client, auth, native plugins, BackendAPI
- [JSON Sculpt Guide](docs/07-json-sculpt-guide.md) — Declarative API response mapping
- [Components Overview](docs/08-components-overview.md) — Component system and catalog
- [Styling Guide](docs/09-styling-guide.md) — CSS variables, utility classes, rpx units
- [WXS Filters](docs/10-wxs-filters.md) — View-thread template scripting
- [Behaviors Guide](docs/11-behaviors-guide.md) — Shared mixin system
- [Navigation Guide](docs/12-navigation-guide.md) — Page stack and navigation helpers
- [Storage Guide](docs/13-storage-guide.md) — Local storage wrapper
- [Custom TabBar WeChat](docs/17-custom-tab-bar.md) — Native tabbar override with the app's custom style
- [iPhone Responsive Audit](docs/README-responsive-iphone.md) — Causes of gaps and layout issues on real iPhones

### Reference
- [Recipes](docs/14-recipes.md) — Step-by-step cookbook for common tasks
- [Troubleshooting](docs/15-troubleshooting.md) — Common errors, debugging, FAQ
- [Glossary](docs/16-glossary.md) — Terminology reference
- [Contributing](CONTRIBUTING.md) — Code style and contribution guidelines

## Tech Stack

| Item | Value |
|------|-------|
| TCMPP SDK | 2.2.4 |
| JavaScript Target | ES2015 |
| CSS Framework | Bootstrap-derived utilities |
| State Management | Custom EventBus |
| Data Transformation | JSON Sculpt |
