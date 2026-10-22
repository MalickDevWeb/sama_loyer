// ============================================================================
// STORAGE UTILITY
// Safe wrapper around wx storage APIs with error handling
//
// wx.getStorageSync / setStorageSync can throw on:
//   - Storage quota exceeded (~10 MB per mini program)
//   - Corrupted storage data
//   - Platform-specific edge cases
//
// This wrapper catches those silently and returns defaults, so callers
// never need try/catch around storage operations.
// ============================================================================

/**
 * Safely reads a value from local storage.
 *
 * @param {string} key - Storage key
 * @param {*} [defaultValue=null] - Value to return if key is missing or read fails
 * @returns {*} Stored value or defaultValue
 *
 * @example
 * const token = storage.get('auth_token');
 * const prefs = storage.get('user_prefs', { theme: 'light' });
 */
const get = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key);
    // wx returns '' for missing keys, treat as absent
    return value !== '' && value !== undefined ? value : defaultValue;
  } catch (e) {
    console.warn('[Storage] get failed for key:', key, e.message);
    return defaultValue;
  }
};

/**
 * Safely writes a value to local storage.
 *
 * @param {string} key - Storage key
 * @param {*} value - Value to store (will be serialized)
 * @returns {boolean} True if write succeeded
 *
 * @example
 * storage.set('auth_token', 'abc123');
 * storage.set('user_prefs', { theme: 'dark', lang: 'en' });
 */
const set = (key, value) => {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.warn('[Storage] set failed for key:', key, e.message);
    return false;
  }
};

/**
 * Safely removes a value from local storage.
 *
 * @param {string} key - Storage key to remove
 * @returns {boolean} True if removal succeeded
 *
 * @example
 * storage.remove('auth_token');
 */
const remove = (key) => {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.warn('[Storage] remove failed for key:', key, e.message);
    return false;
  }
};

/**
 * Clears all local storage. Use with caution.
 *
 * @returns {boolean} True if clear succeeded
 */
const clear = () => {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.warn('[Storage] clear failed:', e.message);
    return false;
  }
};

/**
 * Returns storage usage info.
 *
 * @returns {Promise<{currentSize: number, limitSize: number}>}
 *   Sizes in KB. currentSize is used space, limitSize is the quota.
 *
 * @example
 * const { currentSize, limitSize } = await storage.info();
 * console.log(`Using ${currentSize}KB of ${limitSize}KB`);
 */
const info = () => {
  return new Promise((resolve) => {
    wx.getStorageInfo({
      success: (res) => resolve({
        currentSize: res.currentSize,
        limitSize: res.limitSize,
      }),
      fail: () => resolve({ currentSize: 0, limitSize: 10240 }),
    });
  });
};

/**
 * Reads a value, and if it's missing, calls the factory function
 * to compute it, stores the result, then returns it.
 *
 * @param {string} key - Storage key
 * @param {Function} factory - () => value to compute and cache
 * @returns {*} Cached or freshly computed value
 *
 * @example
 * const deviceId = storage.getOrSet('device_id', () => generateUUID());
 */
const getOrSet = (key, factory) => {
  const existing = get(key);
  if (existing !== null) return existing;

  const value = factory();
  set(key, value);
  return value;
};

export const storage = {
  get,
  set,
  remove,
  clear,
  info,
  getOrSet,
};
