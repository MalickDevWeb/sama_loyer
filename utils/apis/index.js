// ============================================================================
// ATS BACKEND API SERVICE
// Centralized access to ATS REST endpoints.
// ============================================================================

import { httpClient } from './http.js';
import { authenticate } from './auth.js';
import { sculpt } from '../json-sculpt/sculpt.js';
import { CategorySchema } from '../mappers/category.sculpt.js';
import { PackageCardSchema, PackageDetailSchema } from '../mappers/package.sculpt.js';
import { ReservationDetailSchema, ReservationSchema } from '../mappers/reservation.sculpt.js';
import { normalizeApiError, NotFoundError, ValidationError } from '../errors/index.js';


const ENDPOINTS = {
  CATEGORIES: '/categories',
  PACKAGES: '/packages',
  FEATURED_PACKAGES: '/packages?featured=true',
  RECOMMENDED_PACKAGES: '/packages?recommended=true',
  BOOKINGS: '/bookings',
};

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

  async getPackages(params = {}) {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.PACKAGES);
    const body = extractApiResponse(res, 'Impossible de récupérer les packages');
    const items = Array.isArray(body.data) ? body.data : [];

    return this.#sculpt(items, PackageCardSchema, 'Impossible de transformer les packages reçus');
  }

  async getFeaturedPackages() {
    await authenticate();
    const res = await this.#client.get(ENDPOINTS.FEATURED_PACKAGES);
    const body = extractApiResponse(res, 'Impossible de récupérer les packages à la une');
    const items = Array.isArray(body.data) ? body.data : [];
    return this.#sculpt(items, PackageCardSchema, 'Impossible de transformer les packages à la une reçus');
  }

  async getRecommendedPackages() {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.RECOMMENDED_PACKAGES);
    const body = extractApiResponse(res, 'Impossible de récupérer les packages recommandés');
    const items = Array.isArray(body.data) ? body.data : [];

    return this.#sculpt(items, PackageCardSchema, 'Impossible de transformer les packages recommandés reçus');
  }

  async getPackage(id) {
    if (id === '' || id === null || id === undefined || (typeof id === 'string' && !/^\d+$/.test(id)) || !Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
      throw new ValidationError('Identifiant du package invalide', { field: 'id', value: id });
    }

    await authenticate();

    const res = await this.#client.get(`${ENDPOINTS.PACKAGES}/${id}`);
    const body = extractApiResponse(res, 'Impossible de récupérer le détail du package');
    const destination = this.#sculpt(body.data || body, PackageDetailSchema, 'Impossible de transformer le package reçu');

    if (!Number.isSafeInteger(Number(destination.id)) || Number(destination.id) <= 0) {
      throw new NotFoundError('Package introuvable', { id });
    }

    return destination;
  }

  async getCategories() {
    await authenticate();

    const res = await this.#client.get(ENDPOINTS.CATEGORIES);
    const body = extractApiResponse(res, 'Impossible de récupérer les catégories');
    const items = Array.isArray(body.data) ? body.data : [];

    return this.#sculpt(items, CategorySchema, 'Impossible de transformer les catégories reçues');
  }

  async getBooking(reference) {
    if (!reference) throw new ValidationError('Référence de réservation manquante');
    await authenticate();
    const res = await this.#client.get(`${ENDPOINTS.BOOKINGS}/${reference}`);
    const body = extractApiResponse(res, 'Impossible de récupérer la réservation');
    return this.#sculpt(body.data || body, ReservationDetailSchema, 'Impossible de transformer la réservation reçue');
  }

  async createBooking(payload) {
    await authenticate();
    const res = await this.#client.post(ENDPOINTS.BOOKINGS, payload);
    const body = extractApiResponse(res, 'Impossible de créer la réservation');
    return this.#sculpt(body.data || body, ReservationSchema, 'Impossible de transformer la réservation créée');
  }

  async listBookings(phone) {
    if (!phone) throw new ValidationError('NumǸro de tǸlǸphone manquant pour lister les rǸservations');
    await authenticate();
    const res = await this.#client.get(`${ENDPOINTS.BOOKINGS}?phone=${encodeURIComponent(phone)}`);
    const body = extractApiResponse(res, 'Impossible de rǸcupǸrer la liste des rǸservations');
    const items = Array.isArray(body.data) ? body.data : (Array.isArray(body) ? body : []);
    return items.map(item => this.#sculpt(item, ReservationSchema, 'Impossible de transformer la rǸservation'));
  }

  async cancelBooking(reference, phone) {
    if (!reference) throw new ValidationError('RǸfǸrence de rǸservation manquante');
    if (!phone) throw new ValidationError('NumǸro de tǸlǸphone manquant pour annuler la rǸservation');
    await authenticate();
    const res = await this.#client.delete(`${ENDPOINTS.BOOKINGS}/${reference}?phone=${encodeURIComponent(phone)}`);
    return extractApiResponse(res, "Impossible d'annuler la réservation");
  }

  async confirmPayment(reference, transactionId) {
    if (!reference) throw new ValidationError('RǸfǸrence de rǸservation manquante');
    if (!transactionId) throw new ValidationError('ID de transaction manquant');
    await authenticate();
    const res = await this.#client.post(`${ENDPOINTS.BOOKINGS}/${reference}/payment`, {
      transaction_id: transactionId
    });
    return extractApiResponse(res, 'Impossible de confirmer le paiement');
  }

  resetSession() {
    this.#client.resetSession();
  }
}

export const backendAPI = new BackendAPI();

export { BackendAPI };
