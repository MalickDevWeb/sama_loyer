# Getting Started

## Prerequisites

| Tool | Purpose |
|------|---------|
| [TCMPP Developer Tools](https://cloud.tencent.com/product/tcmpp) | IDE, simulator, debugger |
| Git | Version control |
| A code editor (VS Code recommended) | Editing (DevTools editor works too) |

## Setup

```bash
git clone <repository-url>
```

Open TCMPP Developer Tools → Import Project → Select the `tcmpp-boilerplate` folder.

The project compiles automatically. You should see the home page with a navigation bar and component demos.

## Project Configuration

### project.config.json

| Setting | Value | What It Does |
|---------|-------|-------------|
| `es6` | `true` | Transpiles ES2015+ to ES5 for compatibility |
| `nodeModules` | `true` | Enables npm package support |
| `minified` | `true` | Minifies output for smaller builds |
| `uploadWithSourceMap` | `true` | Includes source maps for debugging |
| `urlCheck` | `false` | Disables domain whitelist check (dev only) |
| `TCMPPLibVersion` | `2.2.4` | TCMPP SDK version |
| `SASappid` | `mp1vl29c7w1xcmbo` | **Change this** to your app ID |

### utils/config.js — Environment Configuration

```javascript
const ENV = 'development'; // Switch to 'production' for release

const CONFIG = {
  development: {
    BASE_URL: 'http://localhost:3000/api',    // Your dev API
    CLIENT_ID: 'your-client-id',              // OAuth2 credentials
    CLIENT_SECRET: 'your-client-secret',
    // ...
  },
  production: {
    BASE_URL: 'https://api.example.com',      // Your prod API
    // ...
  },
};
```

**First thing to do:** Update `config.js` with your actual API URLs and OAuth2 credentials.

### utils/constants/index.js

Set `__DEV__` to `false` before deploying:
```javascript
export const __DEV__ = true; // Set to false for production
```

## First Changes

### 1. Change the app title

Edit `app.json`:
```json
{
  "window": {
    "navigationBarTitleText": "Your App Name"
  }
}
```

### 2. Update your API configuration

Edit `utils/config.js` with your real API URLs and credentials.

### 3. Add a new page

See [Recipes: Adding a New Page](14-recipes.md#adding-a-new-page) for the step-by-step template.

## Development Workflow

1. **Edit files** in VS Code or TCMPP DevTools
2. **DevTools auto-reloads** on save (hot refresh, not hot module replacement)
3. **Console output** appears in the DevTools Console panel
4. **Debug panel** shows network requests, storage, and app data
5. **Remote debugging** is enabled (`remoteDebugLogEnable: true` in project.config.json)

### DevTools Tips

- **Compile button** (Ctrl/Cmd + B): Force recompile
- **Preview button**: Generate QR code for real device testing
- **Audits panel**: Performance and best practice checks
- **Storage panel**: View/edit wx.getStorageSync data
- **Network panel**: Inspect all wx.request calls

## See Also

- [Mini-Program Concepts](01-mini-program-concepts.md) — If you're new to mini-programs
- [Project Architecture](02-project-architecture.md) — Understand how the pieces connect
- [Recipes](14-recipes.md) — Step-by-step tasks
