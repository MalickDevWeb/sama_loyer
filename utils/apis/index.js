// ============================================================================
// SAMA LOGEMENT BACKEND API SERVICE
// Centralized access to the Sama Logement REST endpoints.
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import { sculpt } from '../json-sculpt/sculpt.js';
import { normalizeApiError } from '../errors/index.js';

// Ajouter ici les chemins des endpoints Sama Logement (ex. LOGEMENTS: '/logements')
const ENDPOINTS = {};

function extractApiResponse(res, fallbackMessage) {
  if (!res || res.success !== true) {
    throw normalizeApiError({
      status: Number(res?.status) >= 400 ? res.status : undefined,
      body: res?.error || res,
      metadata: { response: res },
    }, fallbackMessage);
  }

  const body = res.data;
  if (body === null || body === undefined) {
    throw normalizeApiError({ status: 502, code: 'INVALID_API_RESPONSE', metadata: { response: res } }, fallbackMessage);
  }

  if (body && typeof body === 'object' && (
    body.success === false || Number(body.data && body.data.status) >= 400
  )) {
    throw normalizeApiError({
      status: Number(body.data && body.data.status) >= 400 ? body.data.status : res.status,
      body,
      metadata: { response: res },
    }, fallbackMessage);
  }

  return body;
}

/**
 * Service for your application's API operations.
 * All methods automatically handle authentication.
 *
 * Modèle d'une méthode (schéma json-sculpt dans utils/mappers/) :
 *
 *   async getLogements() {
 *     await authenticate();
 *     const res = await this.#client.get(ENDPOINTS.LOGEMENTS);
 *     const body = extractApiResponse(res, 'Impossible de récupérer les logements');
 *     const items = Array.isArray(body.data) ? body.data : [];
 *     return this.#sculpt(items, LogementCardSchema, 'Impossible de transformer les logements reçus');
 *   }
 *
 * @class BackendAPI
 */
class BackendAPI {
  /** @type {import('./http').HttpClient} */
  #client = httpClient;

  #sculpt(data, schema, fallbackMessage) {
    try {
      return sculpt.data({ data, to: schema });
    } catch (error) {
      throw normalizeApiError({
        status: 502,
        code: 'SCULPT_ERROR',
        message: error.message,
        metadata: { cause: error },
      }, fallbackMessage);
    }
  }

  resetSession() {
    this.#client.resetSession();
  }
}

export const backendAPI = new BackendAPI();

export { BackendAPI };
