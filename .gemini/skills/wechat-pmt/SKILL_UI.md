
# Frontend UI & Component Architecture Guidelines (Mock-First / WeChat)

This skill dictates how to build User Interfaces (Pages and Components) in this project.

## 🎯 TRIGGER KEYWORDS (HOW TO ACTIVATE THIS SKILL)
- **`@UI-MOCK`**: Strictly follow all rules below, especially the Mock-First rule. DO NOT connect to the backend.
- **`@FULL-FEATURE`**: Apply all UI rules (WXS formatting, Safe Areas, i18n, triggerEvents), BUT **SKIP** the Mock-First rule (Section 1). You must connect the UI directly to the `BackendAPI` instead of using mocks.

## STANDARD OPERATING PROCEDURE (SOP): BUILDING A NEW UI

When the user asks you to build a UI component or page, follow this EXACT sequence:

### Phase 1: Mock-First Implementation
1. **Scaffold the 4 Files:** Create `.js`, `.wxml`, `.wxss`, and `.json`.
2. **Inject Mock Data:** Populate the `data: {}` object with realistic Mock Data that mirrors the expected backend schema. Do NOT connect to `BackendAPI` initially.
3. **i18n Setup:** Identify all user-facing text and use translation keys (e.g., `{{ i18n.t('key') }}`). NEVER hardcode text.

### Phase 2: Building the View
1. **WXML Layout:** Use semantic WeChat tags. Handle empty/loading states.
2. **WXS Formatting:** Format dates/prices using `.wxs` filters directly in the `.wxml`.
3. **Styling:** Use scoped CSS (BEM). Handle safe areas.

---

## 1. MOCK DATA ISOLATION (CRITICAL)

Your first iteration MUST be disconnected from the network.
```javascript
Page({
  data: {
    isLoading: false,
    mockProfile: { firstName: "John", balance: 15000 } // Mirror json-sculpt schema
  }
});
```

## 2. GLOBAL LAYOUTS & COMPONENT SCOPING

You MUST respect directory isolation to prevent code spaghetti:
- **Shared/Global Components:** Items shared across the app (e.g., NavBar, TabBar, custom Modals) MUST be placed in `components/layout/` or `components/ui/`. They should use `Bus.onState` to react to global changes (like User Avatar or Cart Count) independently.
- **Page-Specific Components:** Sub-components that only exist on one page MUST be locked inside that page's folder (e.g., `pages/home/components/promo-banner/`).

## 3. COMPONENT COMMUNICATION (`triggerEvent`)

- **Rule:** Reusable UI components (in `components/`) MUST communicate with parents using native events: `this.triggerEvent('myevent', detailData)`.
- **Anti-Pattern:** Do NOT use the global `EventBus` (`Bus.emit`) for simple parent-child communication. The EventBus is strictly reserved for app-wide global state.

## 4. LIFECYCLE STRICTNESS (Page vs Component)

WeChat has strict separation between Pages and Components. Do not mix them up:
- **Pages:** Use `onLoad`, `onShow`, `onReady`, `onHide`, `onUnload`.
- **Components:** MUST use the `lifetimes` object: `lifetimes: { attached() {}, detached() {} }`. NEVER use `onLoad` inside a Component.

## 5. VIEW-LAYER FORMATTING (WXS) & ES5 LIMITATION

- **Rule:** You MUST use WeChat Scripts (`.wxs`) for data formatting in `.wxml`.
- **CRITICAL WXS LIMITATION:** WXS is NOT modern JavaScript. You MUST write WXS in strict **ES5 syntax**. Do NOT use arrow functions (`=>`), `let/const`, destructuring, or Promises inside `.wxs` files. Use `var` and standard `function()`.

## 6. PERFORMANCE (`setData`) & SAFE AREAS

- **`setData` Performance:** ONLY place variables in `data: {}` if they are actually rendered in the `.wxml`. If a variable is pure JS logic (e.g., a timer ID), store it directly on the instance (`this.timerId = ...`), NOT in `this.setData()`.
- **Safe Areas:** When building fixed layouts (navbars, bottom sheets), you MUST handle mobile safe areas in `.wxss` (e.g., `padding-bottom: env(safe-area-inset-bottom);`).

## 7. UI FEEDBACK & EMPTY STATES

- **Loading States:** Always wrap interactive elements in loading states based on `this.data.isLoading`.
- **Empty States:** If an array is empty, the UI MUST handle it gracefully (e.g., `<view wx:if="{{list.length === 0}}">No items</view>`).
