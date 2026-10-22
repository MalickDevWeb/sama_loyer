// ============================================================================
// NATIVE PLUGIN TYPES
// Type definitions for TCMPP wx.invokeNativePlugin calls
// ============================================================================

// ============================================================================
// GENERIC NATIVE PLUGIN WRAPPER
// ============================================================================

/**
 * Generic success callback for native plugin
 * @template T
 * @callback NativeSuccessCallback
 * @param {Object} response - Success response
 * @param {number} response.status_code - HTTP-like status code (200)
 * @param {'success'} response.result - Result indicator
 * @param {string} response.method - API method name
 * @param {T} response.data - Response payload
 * @returns {void}
 */

/**
 * Generic failure callback for native plugin
 * @callback NativeFailCallback
 * @param {Object} error - Error response
 * @param {number} error.status_code - HTTP-like status code (400, 500)
 * @param {'fail'} error.result - Result indicator
 * @param {string} error.method - API method name
 * @param {string} error.message - Error message
 * @returns {void}
 */

/**
 * Native plugin invocation options
 * @template TData, TResponse
 * @typedef {Object} NativePluginOptions
 * @property {string} api_name - Plugin API to call
 * @property {TData} [data] - Request payload
 * @property {NativeSuccessCallback<TResponse>} success - Success handler
 * @property {NativeFailCallback} fail - Failure handler
 */

// ============================================================================
// USER INFO
// ============================================================================

/**
 * User info returned from native layer
 * @typedef {Object} NativeUserInfo
 * @property {string|null} msisdn - User's phone number
 * @property {string|null} fullName - User's display name
 */

// ============================================================================
// ADD YOUR APP-SPECIFIC NATIVE TYPES HERE
// ============================================================================

// Example:
// /**
//  * @typedef {Object} PaymentResultData
//  * @property {string} transactionId - Payment transaction ID
//  * @property {string} status - "SUCCESS" | "FAILED" | "PENDING"
//  * @property {string} message - Human-readable result
//  * @property {number} amount - Amount paid
//  */
