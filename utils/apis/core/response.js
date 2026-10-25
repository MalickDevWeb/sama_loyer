// ============================================================================
// SAMA LOYER — API RESPONSE EXTRACTOR & UNWRAPPER
// Déballage de l'enveloppe { success, data, meta } et normalisation des erreurs
// ============================================================================

import { normalizeApiError } from '../../errors/index.js';

/**
 * Extrait et valide la charge utile d'une réponse API SAMA LOYER.
 *
 * Déballe automatiquement l'enveloppe standard `{ success: true, data: ..., meta: ... }`,
 * vérifie l'intégrité de la réponse et intercepte les échecs applicatifs (ex: 200 OK avec `{ success: false }`).
 *
 * @template T
 * @param {Object} res - Réponse renvoyée par HttpClient ou wx.request
 * @param {string} [fallbackMessage] - Message d'erreur lisible par l'utilisateur
 * @returns {T} La charge utile métier déballée (data)
 * @throws {ApiError} Erreur normalisée avec statut, code et message
 */
export function extractApiResponse(res, fallbackMessage) {
  // 1. Échec transport HTTP ou réponse absente
  if (!res || res.success !== true) {
    const status = Number(res?.status) >= 400 ? Number(res.status) : undefined;
    throw normalizeApiError({
      status,
      body: res?.error || res?.data || res,
      metadata: { response: res },
    }, fallbackMessage);
  }

  const payload = res.data;

  // 2. Corps vide ou corrompu -> 502 Bad Gateway
  if (payload === null || payload === undefined) {
    throw normalizeApiError({
      status: 502,
      code: 'INVALID_API_RESPONSE',
      metadata: { response: res }
    }, fallbackMessage);
  }

  // 3. Détection d'échec applicatif (ex: 200 OK avec corps { success: false, ... })
  if (typeof payload === 'object') {
    const isAppFailure = payload.success === false;
    const embeddedStatus = Number(payload.data?.status || payload.status);
    const hasErrorStatus = embeddedStatus >= 400;

    if (isAppFailure || hasErrorStatus) {
      const status = hasErrorStatus ? embeddedStatus : (Number(res.status) >= 400 ? Number(res.status) : 400);
      const code = payload.code || payload.error?.code || 'API_BUSINESS_ERROR';
      const message = payload.message || payload.error?.message;
      const details = payload.details || payload.error?.details;

      throw normalizeApiError({
        status,
        code,
        message,
        details,
        body: payload,
        metadata: { response: res },
      }, fallbackMessage);
    }
  }

  // 4. Déballage transparent de l'enveloppe standard { success: true, data: ... }
  if (payload && typeof payload === 'object' && payload.success === true && payload.data !== undefined) {
    const extractedData = payload.data;
    if (payload.meta && typeof extractedData === 'object' && extractedData !== null) {
      try {
        Object.defineProperty(extractedData, 'meta', {
          value: payload.meta,
          writable: true,
          enumerable: false,
          configurable: true
        });
      } catch (e) {}
    }
    return extractedData;
  }

  // 5. Réponse directe (tableau ou objet brut sans enveloppe)
  return payload;
}

/** Alias sémantique moderne pour l'extraction de charge utile */
export const unwrapApiResponse = extractApiResponse;

