# Troubleshooting

## Common Errors

### "navigateTo fail page limit exceeded"

**Cause:** The page stack has 10 pages (maximum).
**Fix:** Use `redirectTo` instead, or use the navigation helpers from `utils/helpers/navigation.js` which handle this automatically.

### "Component not found"

**Cause:** Component not registered in the page's `index.json`.
**Fix:** Add to `usingComponents`:
```json
{
  "usingComponents": {
    "app-button": "/components/ui/button/index"
  }
}
```

### "Page not found"

**Cause:** Page not registered in `app.json`.
**Fix:** Add to the `pages` array in `app.json`. The `onPageNotFound` handler in `app.js` redirects to home as a fallback.

### Page loads blank / data is undefined

**Cause:** Page reads state before app initialization completes.
**Fix:** Always await `initPromise`:
```javascript
async onLoad() {
  await app.globalData.initPromise;  // Don't forget this!
  const data = Bus.getState(STATE_KEYS.USER_DATA);
}
```

### EventBus subscription doesn't fire

**Cause:** Using the wrong state key, or subscribing after the state was already set.
**Fix:**
1. Check the exact state key string matches `STATE_KEYS`
2. Call `loadInitial()` after `subscribe()` to read current values
3. Enable debug: `Bus.setDebug(true)`

### "wx.getStorageSync" throws

**Cause:** Storage quota exceeded or corrupted data.
**Fix:** Use the `storage` wrapper from `utils/storage.js` instead of raw `wx.getStorageSync`.

### Style classes not working in component

**Cause:** Component style isolation blocks page styles.
**Fix:** Add `@import '/app.wxss';` at the top of the component's `.wxss` file, or set `styleIsolation: 'apply-shared'` in the component options.

### WXS filter returns undefined

**Cause:** Using ES6 syntax in WXS, or passing wrong data type.
**Fix:** WXS is ES5 only. Check: no arrow functions, no `let`/`const`, no template literals. Use `getDate()` instead of `new Date()`.

## Debugging Tips

### EventBus Debug Mode

```javascript
Bus.setDebug(true);  // Logs all emit, setState, subscribe operations
```

### Development Mode Flag

```javascript
// utils/constants/index.js
export const __DEV__ = true;  // Enables mock data, extra logging
```

### DevTools Console

- All `console.log` output appears in the Console panel
- Filter by prefix: `[App]`, `[Nav]`, `[Native]`, `[Storage]`, `[EventBus]`

### Network Panel

- Inspect all `wx.request` calls
- Check headers for `X-Client-Ref` and `X-Request-Id` session tracking

### Storage Panel

- View all `wx.getStorageSync` data
- Check `app_access_token` and `app_token_expiry` for auth issues

## Performance Tips

1. **Batch `setData()` calls** — Each call crosses threads. Combine updates:
   ```javascript
   // Bad
   this.setData({ a: 1 });
   this.setData({ b: 2 });

   // Good
   this.setData({ a: 1, b: 2 });
   ```

2. **Use WXS for template formatting** — Runs in render thread, no thread crossing

3. **Disable history in production**:
   ```javascript
   Bus.setHistoryRecording(false);
   ```

4. **Keep state lean** — Don't store large arrays in EventBus state

5. **Lazy load images** — The `app-image` component has `lazyLoad: true` by default

## FAQ

**Q: How do I pass data between pages?**
A: Simple values → query params. Complex data → EventBus state. See [Navigation Guide](12-navigation-guide.md).

**Q: Why does the native plugin fail on first call?**
A: The native layer may not be ready on app launch. `nativeService.getUserInfos()` has built-in retry with backoff. Use `withRetry()` for your own plugin calls.

**Q: How do I switch between dev and production?**
A: Change `ENV` in `utils/config.js` and `__DEV__` in `utils/constants/index.js`.

**Q: Can I use npm packages?**
A: Yes. `nodeModules: true` is set in `project.config.json`. Install packages normally and import them.

**Q: How do I add a tab bar?**
A: Add a `tabBar` configuration to `app.json`. See [WeChat docs on tabBar](https://developers.weixin.qq.com/miniprogram/dev/reference/configuration/app.html#tabBar).

## See Also

- [Getting Started](03-getting-started.md) — Setup and DevTools tips
- [Recipes](14-recipes.md) — Step-by-step task guides
