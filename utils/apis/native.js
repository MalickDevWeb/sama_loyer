// ============================================================================
// NATIVE PLUGIN SERVICE
// Wrapper for wx.invokeNativePlugin calls with typed responses
// ============================================================================

import { __DEV__ } from '../constants/index.js';

// ============================================================================
// RETRY HELPERS
// Native plugin may not be ready on app launch — retry with backoff
// ============================================================================

/**
 * Delays execution for the specified duration.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries an async function with exponential backoff.
 * Useful for native plugin calls that may fail if called too early on app launch.
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} [options] - Retry options
 * @param {number} [options.maxAttempts=3] - Maximum number of attempts
 * @param {number} [options.baseDelay=500] - Initial delay in ms (doubles each retry)
 * @param {Function} [options.shouldRetry] - Custom function to determine if should retry
 * @returns {Promise<any>} Result from the function
 */
export const withRetry = async (fn, { maxAttempts = 3, baseDelay = 500, shouldRetry = () => true } = {}) => {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`[Native] Attempt ${attempt}/${maxAttempts} failed:`, error.message);

      if (attempt < maxAttempts && shouldRetry(error)) {
        const waitTime = baseDelay * Math.pow(2, attempt - 1);
        await delay(waitTime);
      }
    }
  }

  throw lastError;
};

// ============================================================================
// NATIVE PLUGIN INVOCATION
// ============================================================================

/**
 * Generic wrapper for wx.invokeNativePlugin calls.
 * Converts callback-based API to Promise-based with optional response validation.
 *
 * @param {string} apiName - Native plugin API name
 * @param {Object} [data] - Request payload
 * @param {Object} [options] - Invocation options
 * @param {boolean} [options.strict=true] - When true, validates { result, status_code }
 *   envelope and resolves with res.data. When false, resolves with raw res.
 * @returns {Promise<Object>} Plugin response
 * @throws {Error} If plugin call fails or strict validation rejects
 */
export const invokePlugin = (apiName, data = {}, { strict = true } = {}) => {
  return new Promise((resolve, reject) => {
    wx.invokeNativePlugin({
      api_name: apiName,
      data,
      success: (res) => {
        if (!strict) {
          resolve(res);
          return;
        }
        if (res.result === 'success' && res.status_code === 200) {
          resolve(res.data);
        } else {
          reject(new Error(res.message || `${apiName} failed`));
        }
      },
      fail: (err) => {
        reject(new Error(err.message || `${apiName} failed`));
      },
    });
  });
};

// ============================================================================
// USER INFO
// ============================================================================

/**
 * Retrieves the current user's info from the native layer.
 * Returns user data if authenticated. Override this for your app's user model.
 *
 * Uses initial delay + retry with exponential backoff because the native
 * plugin may not be ready immediately on app launch.
 *
 * @async
 * @returns {Promise<{msisdn: string|null, fullName: string|null}>} User info
 *
 * @example
 * const { msisdn, fullName } = await nativeService.getUserInfos();
 * if (!msisdn) {
 *   // Redirect to onboarding flow
 * }
 */
export const getUserInfos = async () => {
  try {
    await delay(300);

    const res = await withRetry(
      async () => {
        const response = await invokePlugin('userInfos', {}, { strict: false });
        const user = response?.data?.user;
        if (!user) {
          throw new Error('Native plugin returned empty user data');
        }
        return response;
      },
      {
        maxAttempts: 4,
        baseDelay: 500,
        shouldRetry: (error) => !error.message?.includes('cancelled'),
      },
    );

    const user = res?.data?.user;

    return {
      msisdn: user?.msisdn || null,
      fullName: user ? `${user.firstName} ${user.lastName}` : null,
    };
  } catch (error) {
    console.warn('[Native] getUserInfos failed after retries:', error.message);

    if (__DEV__) {
      return {
        msisdn: '770000000',
        fullName: 'Dev User',
      };
    }

    return { msisdn: null, fullName: null };
  }
};

// ============================================================================
// ADD YOUR NATIVE PLUGIN WRAPPERS HERE
// ============================================================================

// Example:
// export const takePhoto = async () => { ... };
// export const scanDocument = async ({ frontImage, backImage }) => { ... };
// export const payWithProvider = async ({ amount, orderId }) => { ... };

// ============================================================================
// NATIVE SERVICE EXPORT
// ============================================================================

/**
 * Native plugin service object.
 * Add your native plugin wrappers here.
 */
export const nativeService = {
  getUserInfos,
};
