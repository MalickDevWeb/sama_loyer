// ============================================================================
// AUTHENTICATION
// OAuth2 token management with caching and auto-refresh
// ============================================================================

import { storage } from '../../storage.js';
import { httpClient } from './http.js';
import { config } from '../../config.js';
import { STORAGE_KEYS, AUTH_CONFIG, ERROR_MESSAGES } from '../../constants/index.js';
import { normalizeApiError } from '../../errors/index.js';

let runtimeToken = null;
let runtimeTokenExpiry = 0;

export function setAccessToken(token) {
  if (!token) {
    return null;
  }

  storage.set(STORAGE_KEYS.ACCESS_TOKEN, token);
  httpClient.setToken(token);

  return token;
}

export function clearAccessToken() {
  storage.remove(STORAGE_KEYS.ACCESS_TOKEN);
  storage.remove(STORAGE_KEYS.TOKEN_EXPIRY);
  runtimeToken = null;
  runtimeTokenExpiry = 0;
  httpClient.setToken(null);
}

/**
 * Authentifie le client auprès de l'API ATS.
 * Utilise le token en cache s'il est valide, sinon en demande un nouveau.
 *
 * @returns {Promise<string>} Access token
 */
export async function authenticate() {
  const now = Date.now();

  if (runtimeToken && now < runtimeTokenExpiry) {
    httpClient.setToken(runtimeToken);
    return runtimeToken;
  }

  const body = [
    `client_id=${encodeURIComponent(config.CLIENT_ID)}`,
    `client_secret=${encodeURIComponent(config.CLIENT_SECRET)}`,
    `grant_type=${encodeURIComponent(config.GRANT_TYPE)}`,
  ].join('&');

  const res = await new Promise((resolve, reject) => {
    wx.request({
      method: 'POST',
      url: `${config.BASE_URL}${config.AUTH_URL}`,
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      data: body,
      success: ({ data, statusCode }) => {
        if (statusCode >= 200 && statusCode < 300 && data) {
          resolve(data);
        } else {
          const serverMessage = data?.message || data?.error || data?.detail || data?.errors;
          reject(normalizeApiError({ status: statusCode, body: data, message: serverMessage, url: config.AUTH_URL, method: 'POST' }, ERROR_MESSAGES.AUTH_FAILED));
        }
      },
      fail: (err) => reject(normalizeApiError({ status: 0, message: ERROR_MESSAGES.NETWORK_ERROR, metadata: { transportMessage: err.errMsg }, url: config.AUTH_URL, method: 'POST' }, ERROR_MESSAGES.NETWORK_ERROR)),
    });
  });

  const accessToken = res.access_token || res.data?.access_token;
  const expiresIn = res.expires_in || res.data?.expires_in || AUTH_CONFIG.DEFAULT_EXPIRY_SEC;

  if (!accessToken) {
    throw normalizeApiError({ status: 502, code: 'AUTH_TOKEN_MISSING', message: ERROR_MESSAGES.AUTH_FAILED });
  }

  const expiry = now + (Number(expiresIn) * 1000) - AUTH_CONFIG.REFRESH_BUFFER_MS;

  runtimeToken = accessToken;
  runtimeTokenExpiry = expiry;
  httpClient.setToken(accessToken);

  return accessToken;
}
