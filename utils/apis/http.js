// ============================================================================
// HTTP CLIENT
// Typed API client wrapping wx.request with session tracking
// ============================================================================

import { config } from '../config.js';
import { ERROR_MESSAGES, HTTP_CONFIG } from '../constants/index.js';
import { normalizeApiError } from '../errors/index.js';

/**
 * Generates a random session ID for request tracking
 * @returns {string} Session ID (e.g., "APP-a1b2c3d4")
 */
const generateSessionId = () => {
  const random = Math.random().toString(36).substring(2, 10);
  return `${HTTP_CONFIG.SESSION_PREFIX}-${random}`;
};

/**
 * A typed API client for interacting with backend services over HTTP.
 * Features session tracking, unified response format, and all HTTP verbs.
 *
 * @class HttpClient
 */
export class HttpClient {
  #base = config.BASE_URL;
  #token = null;
  #sessionId = generateSessionId();
  #requestCount = 0;

  /**
   * Sets a runtime token for authorization.
   * @param {string} token - Access token.
   */
  setToken(token) {
    this.#token = token;
  }

  /**
   * Resets the session (new session ID, reset request counter).
   * Call when starting a new user flow.
   */
  resetSession() {
    this.#sessionId = generateSessionId();
    this.#requestCount = 0;
  }

  /**
   * Executes a GET request.
   * @param {string} path
   * @param {Object} [options]
   * @returns {Promise<IUnifiedResponse>}
   */
  async get(path, options = {}) {
    const queryParams = options.query
      ? new URLSearchParams(options.query).toString()
      : '';
    const query = queryParams ? `?${queryParams}` : '';
    return this.#request(`${this.#base}${path}${query}`, 'GET', null, options);
  }

  /**
   * Executes a POST request.
   * @param {string} path
   * @param {any} body
   * @param {Object} [options]
   * @returns {Promise<IUnifiedResponse>}
   */
  async post(path, body, options = {}) {
    return this.#request(`${this.#base}${path}`, 'POST', body, options);
  }

  /**
   * Executes a PUT request.
   * @param {string} path
   * @param {any} body
   * @param {Object} [options]
   * @returns {Promise<IUnifiedResponse>}
   */
  async put(path, body, options = {}) {
    return this.#request(`${this.#base}${path}`, 'PUT', body, options);
  }

  /**
   * Executes a PATCH request.
   * @param {string} path
   * @param {any} body
   * @param {Object} [options]
   * @returns {Promise<IUnifiedResponse>}
   */
  async patch(path, body, options = {}) {
    return this.#request(`${this.#base}${path}`, 'PATCH', body, options);
  }

  /**
   * Executes a DELETE request.
   * @param {string} path
   * @param {Object} [options]
   * @returns {Promise<IUnifiedResponse>}
   */
  async delete(path, options = {}) {
    const queryParams = options.query
      ? new URLSearchParams(options.query).toString()
      : '';
    const query = queryParams ? `?${queryParams}` : '';
    return this.#request(`${this.#base}${path}${query}`, 'DELETE', null, options);
  }

  /**
   * Internal request wrapper with session tracking.
   * @private
   * @param {string} url
   * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
   * @param {any} [body]
   * @param {Object} options
   * @returns {Promise<IUnifiedResponse>}
   */
  #request(url, method, body, options = {}) {
    this.#requestCount++;
    const requestId = `${this.#sessionId}-${this.#requestCount}`;

    return new Promise((resolve, reject) => {
      wx.request({
        method,
        url,
        data: body ?? undefined,
        timeout: options.config?.timeout || HTTP_CONFIG.DEFAULT_TIMEOUT_MS,
        header: {
          ...(this.#token ? { Authorization: `Bearer ${this.#token}` } : {}),
          'Content-Type': options.contentType || 'application/json',
          [HTTP_CONFIG.HEADER_CLIENT_REF]: this.#sessionId,
          [HTTP_CONFIG.HEADER_REQUEST_ID]: requestId,
          ...(options.config?.headers || {}),
          ...(options.headers || {}),
        },
        success({ statusCode, data, header }) {
          const success = statusCode >= 200 && statusCode < 300;

          if (success) {
            resolve({
              success: true,
              data,
              error: null,
              headers: header,
              status: statusCode,
            });
            return;
          }

          reject(normalizeApiError({
            status: statusCode,
            body: data,
            url,
            method,
          }, ERROR_MESSAGES.UNKNOWN_ERROR));
        },
        fail(err) {
          reject(normalizeApiError({
            status: 0,
            message: ERROR_MESSAGES.NETWORK_ERROR,
            metadata: { transportMessage: err.errMsg },
            url,
            method,
          }, ERROR_MESSAGES.NETWORK_ERROR));
        },
      });
    });
  }
}

export const httpClient = new HttpClient();

export { extractApiResponse, unwrapApiResponse } from './response.js';
