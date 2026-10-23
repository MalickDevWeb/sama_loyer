---
name: wechat-pmt
description: >-
  Expertise complète pour WeChat Mini-Program (PMT / TCMPP) : architecture modulaire anti-conflits,
  intégration API avec json-sculpt mappers, client HTTP BackendAPI, EventBus (Bus), gestion d'erreurs typées,
  bonnes pratiques UI WeChat (WXS ES5, setData optimisé, safe areas env(safe-area-inset-bottom), lifetimes composants).
---

# Frontend API & Architecture Guidelines (Modular / Anti-Conflict)

This skill provides the strict rules for consuming APIs and writing frontend code in this repository.

## 🎯 TRIGGER KEYWORDS (HOW TO ACTIVATE THIS SKILL)
If the user's prompt includes any of these keywords, you MUST activate specific behaviors:
- **`@API-CONNECT`**: Strictly apply this entire skill to connect an existing UI component to the backend.
- **`@FULL-FEATURE`**: Combine this skill with the UI skill. Build the view AND connect it directly to the backend API simultaneously (Skip the "Mock-First" rule from the UI skill).

## 0. CRITICAL: MODULARITY & ANTI-CONFLICT RULES
You are working in a collaborative environment. Modifying shared files unnecessarily will cause merge conflicts.
- **Stay in Your Lane:** ONLY modify the files inside the specific module, page, or component folder you were asked to work on.
- **No Unsolicited Refactoring:** DO NOT reformat, refactor, or "clean up" shared files (e.g., `app.js`, shared `utils/`, shared `components/`) unless the user explicitly requests it.
- **Scoping:** When creating a new page or component, encapsulate its logic, styles, and templates strictly within its own directory.

---

## STANDARD OPERATING PROCEDURE (SOP): CONSUMING A NEW API

When asked to consume a new API endpoint, follow this exact sequence:

### Phase 1: Information Gathering
If the user hasn't provided them, you MUST ask for:
1. **Method & Path:** (e.g., `POST /api/v2/orders`).
2. **Expected Response JSON:** A sample of the backend response is REQUIRED to build the `json-sculpt` mapping schema.
3. **Payload/Query parameters:** Expected input.
4. **Auth context:** Does it require the OAuth2 token or is it public?

### Phase 2: Execution Steps (Module by Module)
Execute the integration in this EXACT order:
1. **Routing:** Add the endpoint path to `ENDPOINTS` in `utils/apis/index.js`.
2. **Schema Definition:** Create a schema in `utils/mappers/index.js` using `json-sculpt` to extract ONLY what the UI needs from the raw JSON.
3. **Service Method:** Create the method in `BackendAPI` (`utils/apis/index.js`). It must call `await authenticate()`, make the HTTP call via `this.#client`, check `!res.success`, and return `sculpt.data()`.
4. **UI Integration:** Implement the call strictly within the requested Page/Component folder.

---

## 1. FRONTEND & UI STANDARDS

When working on Pages, Components, or Views (e.g., `.wxml`, `.js`):

- **No Hardcoded Texts (i18n):** NEVER hardcode user-facing text (English or French) in the HTML or JS. You MUST use the internationalization system (e.g., `t('key.name')`). If a key doesn't exist, tell the user to add it to the translation files, or add it if instructed.
- **User Feedback:** When an API call fails or succeeds, you must inform the user visually. Use standard UI patterns (e.g., `wx.showToast`, custom alerts) in the `catch` block. Do not just `console.log` errors.
- **View-Layer Formatting (WXS):** Do not pollute JS logic with complex string or date formatting if it can be avoided. Use WXS (WeChat Scripts) filters in the view layer for rendering formats.
- **Loading States:** Always manage loading states (e.g., `this.setData({ isLoading: true })` in `try` and `false` in `finally`) to prevent double-clicks.

## 2. HTTP CLIENT & API LAYER

The application wraps requests in a custom HTTP client (`HttpClient`).
**CRITICAL RULE:** NEVER use `wx.request` directly. ALWAYS use the `BackendAPI` singleton.

```javascript
// Correct BackendAPI Method implementation
async getMyFeature(params) {
  await authenticate(); // Handles OAuth2 token caching/refresh automatically
  const res = await this.#client.get(ENDPOINTS.MY_NEW_FEATURE, { query: params });
  
  if (!res.success) {
    // Rely on the structured error handling
    throw new Error(res.error?.message || "Failed to fetch feature");
  }
  
  return sculpt.data({ data: res.data, to: MyFeatureSchema });
}
```

## 3. ERROR HANDLING & CONSTANTS

- **Custom Errors:** When writing business logic, throw specific custom errors from `utils/errors/index.js` (e.g., `ValidationError`, `NetworkError`) rather than generic `Error` objects.
- **Constants:** NEVER hardcode magic strings, status codes, or storage keys in your components. Reference them from `utils/constants/index.js`. Configuration (URLs) belongs in `utils/config.js`.

## 4. STATE MANAGEMENT (`utils/event/index.js`)

The app uses an advanced `EventBus` (`Bus`) for global state and events.
- **Mutate State:** `Bus.setState('key', data)`
- **Listen to State:** `Bus.onState('key', callback)`
- **Events:** `Bus.emit('event', data)` and `Bus.on('event', callback)`
- **Rule:** DO NOT mutate `app.globalData` manually for state that UI components depend on.

## 5. STORAGE (`utils/storage.js`)

NEVER use `wx.getStorageSync` or `wx.setStorageSync` directly (they throw on quota limits).
- Use the provided wrapper: `storage.set('KEY', value)` and `storage.get('KEY', defaultValue)`.

