// ============================================================================
// NAVIGATION HELPERS
// Safe wrappers around wx navigation APIs
//
// WeChat has 5 navigation methods with different constraints:
//   - navigateTo:  Push (max 10 pages on stack, fails silently at limit)
//   - redirectTo:  Replace current page (cannot target tabBar pages)
//   - switchTab:   Switch to a tabBar page (closes all non-tab pages)
//   - reLaunch:    Close all, open one (works with any page)
//   - navigateBack: Pop N pages from the stack
//
// These helpers add guard logic so callers don't hit silent failures.
// ============================================================================

/**
 * Navigates to a page, with automatic fallback to redirectTo
 * when the page stack is at the 10-page limit.
 *
 * @param {string} url - Page URL (e.g., '/pages/detail/index?id=123')
 * @returns {Promise<void>}
 *
 * @example
 * await navigateTo('/pages/detail/index?id=42');
 */
export const navigateTo = (url) => {
  return new Promise((resolve, reject) => {
    const pages = getCurrentPages();

    // WeChat enforces a 10-page stack limit
    if (pages.length >= 10) {
      console.warn('[Nav] Page stack full (10), using redirectTo instead');
      wx.redirectTo({
        url,
        success: resolve,
        fail: reject,
      });
      return;
    }

    wx.navigateTo({
      url,
      success: resolve,
      fail: (err) => {
        console.warn('[Nav] navigateTo failed:', err.errMsg, '— trying redirectTo');
        wx.redirectTo({ url, success: resolve, fail: reject });
      },
    });
  });
};

/** Runs one navigation per page until the platform reports success or failure. */
export const navigateWithLock = (page, navigation, lockKey = '_navigationLocked', cooldownMs = 500) => {
  if (!page || page[lockKey]) return false;
  page[lockKey] = true;
  const release = () => setTimeout(() => { page[lockKey] = false; }, cooldownMs);
  Promise.resolve().then(navigation).then(release, release);
  return true;
};

/** Opens a page once per tap sequence, with the standard stack-limit fallback. */
export const navigateToLocked = (page, url, lockKey = '_navigationLocked') => (
  navigateWithLock(page, () => navigateTo(url), lockKey)
);

/**
 * Replaces the current page. Cannot target tabBar pages.
 *
 * @param {string} url - Page URL
 * @returns {Promise<void>}
 *
 * @example
 * await redirectTo('/pages/result/index');
 */
export const redirectTo = (url) => {
  return new Promise((resolve, reject) => {
    wx.redirectTo({ url, success: resolve, fail: reject });
  });
};

/**
 * Switches to a tabBar page. Closes all non-tab pages in the stack.
 *
 * @param {string} url - TabBar page URL (path only, no query params)
 * @returns {Promise<void>}
 *
 * @example
 * await switchTab('/pages/index/index');
 */
export const switchTab = (url) => {
  return new Promise((resolve, reject) => {
    wx.switchTab({ url, success: resolve, fail: reject });
  });
};

/**
 * Closes all pages and opens a new one. Works with any page.
 * Use for hard resets (e.g., logout, fatal error recovery).
 *
 * @param {string} url - Page URL
 * @returns {Promise<void>}
 *
 * @example
 * await reLaunch('/pages/login/index');
 */
export const reLaunch = (url) => {
  return new Promise((resolve, reject) => {
    wx.reLaunch({ url, success: resolve, fail: reject });
  });
};

/**
 * Goes back N pages. Falls back to reLaunch to home if the stack
 * doesn't have enough pages (e.g., user deep-linked in).
 *
 * @param {number} [delta=1] - Number of pages to go back
 * @returns {Promise<void>}
 *
 * @example
 * await navigateBack();      // go back 1
 * await navigateBack(2);     // go back 2
 */
export const navigateBack = (delta = 1) => {
  return new Promise((resolve, reject) => {
    const pages = getCurrentPages();

    if (pages.length <= 1) {
      // Nothing to go back to — go home instead
      console.warn('[Nav] No pages to go back to, reLaunching home');
      wx.reLaunch({ url: '/pages/client/home/home', success: resolve, fail: reject });
      return;
    }

    wx.navigateBack({
      delta: Math.min(delta, pages.length - 1),
      success: resolve,
      fail: (err) => {
        console.warn('[Nav] navigateBack failed:', err.errMsg);
        wx.reLaunch({ url: '/pages/client/home/home', success: resolve, fail: reject });
      },
    });
  });
};

/**
 * Returns info about the current page stack.
 *
 * @returns {{ depth: number, current: string, canGoBack: boolean }}
 *
 * @example
 * const { depth, current, canGoBack } = getStackInfo();
 */
export const getStackInfo = () => {
  const pages = getCurrentPages();
  const current = pages.length > 0 ? pages[pages.length - 1].route : '';
  return {
    depth: pages.length,
    current,
    canGoBack: pages.length > 1,
  };
};
