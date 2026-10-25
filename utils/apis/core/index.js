// ============================================================================
// SAMA LOYER — API CORE MODULE
// Centralisation du socle technique : transport HTTP, auth, cache, response & native
// ============================================================================

export { httpClient, HttpClient } from './http.js';
export { authenticate, setAccessToken, clearAccessToken } from './auth.js';
export { cached, setCache, invalidateCache, TTL, LOCATAIRE_TTL, BAILLEUR_TTL } from './cache.js';
export { extractApiResponse, unwrapApiResponse } from './response.js';
export { nativeService, invokePlugin, withRetry, isDevtools } from './native.js';

