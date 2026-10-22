# Glossary

## Mini-Program Terms

| Term | Definition |
|------|-----------|
| **Mini-Program** | An app-within-an-app that runs inside a host (WeChat, TCMPP). Uses wx.* APIs. |
| **TCMPP** | Tencent Cloud Mini Program Platform — allows any app to host mini-programs. |
| **WXML** | WeiXin Markup Language — XML-based template language for mini-programs. |
| **WXSS** | WeiXin Style Sheets — CSS subset with `rpx` units for mini-programs. |
| **WXS** | WeiXin Script — ES5-only scripting that runs in the render thread. |
| **rpx** | Responsive pixel. 750rpx = screen width on any device. |
| **Page()** | Constructor function for creating a mini-program page. |
| **Component()** | Constructor function for creating a reusable component. |
| **Behavior()** | WeChat's mixin system for sharing code across pages/components. |
| **getApp()** | Returns the global app instance. Access `globalData` from any page. |
| **getCurrentPages()** | Returns the current page stack as an array. |
| **setData()** | The only way to update the UI. Sends data from JS thread to render thread. |
| **wx.request** | HTTP request API (equivalent to `fetch`). |
| **wx.navigateTo** | Push a new page onto the stack (max 10 pages). |
| **wx.redirectTo** | Replace the current page. |
| **wx.switchTab** | Switch to a tabBar page. |
| **wx.reLaunch** | Close all pages and open one. |
| **wx.navigateBack** | Pop pages from the stack. |
| **wx.invokeNativePlugin** | TCMPP-specific API for calling native host app functionality. |
| **wx.getUpdateManager** | API for checking and applying mini-program updates. |
| **wx.getStorageSync** | Synchronous local storage read (10 MB quota). |
| **wx.showToast** | Show a brief notification message. |
| **wx.showLoading** | Show a loading indicator with mask. |
| **tabBar** | Bottom tab navigation configured in `app.json`. |
| **Page stack** | The navigation history of pages (max 10 deep). |
| **Custom navigation** | `"navigationStyle": "custom"` removes the native nav bar. |
| **styleIsolation** | Controls how component styles interact with page styles. |
| **virtualHost** | Removes the custom element wrapper node from a component. |
| **multipleSlots** | Enables named slot support in a component. |

## Boilerplate-Specific Terms

| Term | Definition |
|------|-----------|
| **EventBus / Bus** | Singleton state management and event system. See [EventBus Guide](05-eventbus-guide.md). |
| **STATE_KEYS** | Constants defining EventBus state key names (defined in `app.js`). |
| **EVENTS** | Constants defining EventBus event names (defined in `app.js`). |
| **initPromise** | Promise stored in `globalData` that resolves when app initialization completes. |
| **Sculpt** | Declarative data transformation engine. See [JSON Sculpt Guide](07-json-sculpt-guide.md). |
| **@link.path** | Sculpt syntax for extracting a value from a JSON path. |
| **BackendAPI** | Service layer class that combines auth + HTTP + Sculpt. |
| **HttpClient** | HTTP client singleton with session tracking. |
| **nativeService** | Object containing native plugin wrapper functions. |
| **loadingBehavior** | Built-in Behavior mixin for loading/error state. See [Behaviors Guide](11-behaviors-guide.md). |
| **createPageHelpers** | Factory function for automatic EventBus subscriptions. |
| **withLoading** | Method from loadingBehavior that wraps async ops with loading state. |
| **withRetry** | Retry function with exponential backoff for native plugin calls. |
| **retryAsync** | Retry function with UI feedback for page-level operations. |
| **storage** | Safe wrapper around wx storage APIs. See [Storage Guide](13-storage-guide.md). |

## See Also

- [Mini-Program Concepts](01-mini-program-concepts.md) — Detailed explanations
- [Project Architecture](02-project-architecture.md) — How terms relate to each other
