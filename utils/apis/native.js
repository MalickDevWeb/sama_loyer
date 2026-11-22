// ============================================================================
// NATIVE PLUGIN SERVICE
// Wrapper for wx.invokeNativePlugin & Sonatel Max It Mini SDK calls
// ============================================================================

import { __DEV__ } from '../constants/index.js';
import { miniSDK } from '../../sdk/index.js';

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
 * Checks if running inside the DevTools simulator or without native bridge.
 * @returns {boolean}
 */
export const isDevtools = () => {
  try {
    const sys = wx.getSystemInfoSync ? wx.getSystemInfoSync() : {};
    return sys.platform === 'devtools' || typeof wx.invokeNativePlugin !== 'function';
  } catch (e) {
    return typeof wx.invokeNativePlugin !== 'function';
  }
};

export const invokePlugin = (apiName, data = {}, { strict = true } = {}) => {
  if (typeof wx.invokeNativePlugin !== 'function') {
    return Promise.reject(new Error('wx.invokeNativePlugin is not available in simulator'));
  }
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
// USER INFO (MAX IT SDK FIRST, NATIVE BRIDGE FALLBACK)
// ============================================================================

/**
 * Retrieves the current user's info using official Max It Mini SDK.
 * @async
 * @returns {Promise<{msisdn: string|null, fullName: string|null}>} User info
 */
export const getUserInfos = async () => {
  try {
    const user = await miniSDK.user();
    if (user && user.msisdn) {
      return {
        msisdn: user.msisdn,
        fullName: user.fullName || user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Client Max it',
      };
    }
  } catch (sdkError) {
    // Si DevTools ou environnement hors Max It, fallback immédiat sans retry intempestif
    if (isDevtools() || __DEV__) {
      return {
        msisdn: '770000001',
        fullName: 'Dev User',
      };
    }
  }

  // Fallback direct sur wx.invokeNativePlugin si le SDK n'a pas répondu
  try {
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
        maxAttempts: 2,
        baseDelay: 300,
        shouldRetry: (error) => !error.message?.includes('cancelled'),
      },
    );

    const user = res?.data?.user;
    return {
      msisdn: user?.msisdn || null,
      fullName: user ? `${user.firstName} ${user.lastName}` : null,
    };
  } catch (error) {
    if (__DEV__) {
      return {
        msisdn: '770000001',
        fullName: 'Dev User',
      };
    }
    return { msisdn: null, fullName: null };
  }
};

// ============================================================================
// PAIEMENT ORANGE MONEY & BOUCLIER ANTI-DOUBLE DÉBIT (@NATIVE-PAY)
// ============================================================================

/** Cache de confirmation anti-double débit */
let _confirmedTxnid = null;

/**
 * Exécute un paiement marchand Orange Money via le SDK Max It officiel.
 * Protégé par le bouclier bancaire anti-double débit _confirmedTxnid.
 *
 * @param {Object} params
 * @param {number} params.amount - Montant en FCFA
 * @param {string} [params.receiver='770000000'] - Numéro ou code marchand Sonatel
 * @param {string} [params.receiverName='SAMA LOYER SARL'] - Raison sociale marchande
 * @param {string} [params.description] - Description visible du paiement
 * @param {string} [params.orderId] - Référence unique de commande
 * @returns {Promise<Object>} Résultat du paiement { txnid, raw, sent }
 */
export const payWithOrangeMoney = async ({
  amount,
  receiver = '770000000',
  receiverName = 'SAMA LOYER SARL',
  description = 'Paiement Loyer / Réservation SAMA LOYER',
  orderId = `CMD-${Date.now()}`
} = {}) => {
  // Bouclier anti-double débit : si déjà confirmé, ne pas re-débiter !
  if (_confirmedTxnid && _confirmedTxnid.orderId === orderId) {
    console.log('[Native] Paiement déjà confirmé avec txnid:', _confirmedTxnid.txnid);
    return _confirmedTxnid;
  }

  const result = await miniSDK.pay({
    amount: Number(amount),
    receiver,
    receiverName,
    description,
    orderId
  });

  if (result && result.txnid) {
    _confirmedTxnid = {
      orderId,
      txnid: result.txnid,
      confirmedAt: Date.now()
    };
  }

  return result;
};

// ============================================================================
// NATIVE SERVICE EXPORT
// ============================================================================

export const nativeService = {
  isDevtools,
  invokePlugin,
  getUserInfos,
  payWithOrangeMoney,
  getContacts: () => miniSDK.contacts(),
  scanQRCode: (opts) => miniSDK.scan(opts),
  protectScreen: (enable) => miniSDK.screen.protect(enable),
  miniSDK,
};
