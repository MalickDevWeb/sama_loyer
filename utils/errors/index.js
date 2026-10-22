// ============================================================================
// CUSTOM ERROR HIERARCHY
// Structured errors with status codes, error codes, and metadata.
// ============================================================================

/**
 * Base application error.
 * All custom errors extend this class for consistent structure.
 *
 * @extends Error
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {Object} [options]
   * @param {number} [options.statusCode=500] - HTTP status code
   * @param {number} [options.status] - Normalized response status
   * @param {string} [options.code='APP_ERROR'] - Machine-readable error code
   * @param {Object} [options.metadata={}] - Additional context
   */
  constructor(message, { statusCode, status, code = 'APP_ERROR', metadata = {} } = {}) {
    super(message);
    this.name = this.constructor.name;
    this.status = status ?? statusCode ?? 500;
    this.statusCode = this.status;
    this.code = code;
    this.metadata = metadata;
    this.timestamp = Date.now();
  }

  /**
   * Serializes the error for logging or API responses.
   * @returns {{ name: string, message: string, statusCode: number, code: string, metadata: Object, timestamp: number }}
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      metadata: this.metadata,
      timestamp: this.timestamp,
    };
  }
}

/**
 * Converts API and transport failures into the single application error shape.
 * Accepts a raw API body, an HTTP response envelope, or an Error instance.
 */
export function normalizeApiError(source, fallbackMessage = 'Une erreur inattendue est survenue.') {
  if (source instanceof AppError) return source;

  const input = source && typeof source === 'object' ? source : {};
  const body = input.body ?? input.response?.data ?? input;
  const nested = body && typeof body.data === 'object' ? body.data : {};
  const rawStatus = input.status ?? input.statusCode ?? body?.status ?? body?.statusCode ?? nested.status;
  const parsedStatus = Number(rawStatus);
  const status = Number.isFinite(parsedStatus) ? parsedStatus : 500;
  const rawCode = body?.code ?? input.code;
  const code = typeof rawCode === 'string' && rawCode ? rawCode : undefined;
  const rawMessage = body?.message ?? body?.error?.message ?? (typeof body === 'string' ? body : input.message);
  const message = typeof rawMessage === 'string' && rawMessage
    ? rawMessage
    : fallbackMessage;
  const metadata = {
    ...(input.metadata || {}),
    ...(body?.data !== undefined ? { apiData: body.data } : {}),
    ...(input.url ? { url: input.url } : {}),
    ...(input.method ? { method: input.method } : {}),
  };

  let error;
  if (status === 0) error = new NetworkError(message, metadata);
  else if (status === 401 || status === 403) error = new AuthorizationError(message, metadata);
  else if (status === 404) error = new NotFoundError(message, metadata);
  else if (status === 400 || status === 422) error = new ValidationError(message, metadata);
  else if (status >= 500) error = new ExternalServiceError(message, { ...metadata, responseStatus: status });
  else error = new AppError(message, { status, code: code || 'APP_ERROR', metadata });

  error.status = status;
  error.statusCode = status;
  if (code) error.code = code;
  return error;
}

/**
 * Validation error for invalid input, malformed data, or business rule violations.
 *
 * @extends AppError
 * @example
 * throw new ValidationError('Email is required', { field: 'email' });
 */
export class ValidationError extends AppError {
  /**
   * @param {string} message - What failed validation
   * @param {Object} [metadata] - Context (e.g. { field, expected, received })
   */
  constructor(message, metadata = {}) {
    super(message, { statusCode: 400, code: 'VALIDATION_ERROR', metadata });
  }
}

/**
 * Authorization error for authentication or permission failures.
 *
 * @extends AppError
 * @example
 * throw new AuthorizationError('Session expired');
 */
export class AuthorizationError extends AppError {
  /**
   * @param {string} message - What authorization failed
   * @param {Object} [metadata] - Context (e.g. { requiredRole, actualRole })
   */
  constructor(message, metadata = {}) {
    super(message, { statusCode: 401, code: 'AUTHORIZATION_ERROR', metadata });
  }
}

/**
 * Network error for connectivity, timeout, and HTTP transport failures.
 *
 * @extends AppError
 * @example
 * throw new NetworkError('Request timed out', { url: '/api/users', timeout: 5000 });
 */
export class NetworkError extends AppError {
  /**
   * @param {string} message - What network operation failed
   * @param {Object} [metadata] - Context (e.g. { url, method, timeout })
   */
  constructor(message, metadata = {}) {
    super(message, { statusCode: 0, code: 'NETWORK_ERROR', metadata });
  }
}

/**
 * Not-found error for missing resources.
 *
 * @extends AppError
 * @example
 * throw new NotFoundError('Product not found', { id: 'abc-123' });
 */
export class NotFoundError extends AppError {
  /**
   * @param {string} message - What resource was not found
   * @param {Object} [metadata] - Context (e.g. { id, type })
   */
  constructor(message, metadata = {}) {
    super(message, { statusCode: 404, code: 'NOT_FOUND', metadata });
  }
}

/**
 * External service error for third-party API or integration failures.
 *
 * @extends AppError
 * @example
 * throw new ExternalServiceError('Payment gateway unavailable', { service: 'stripe', statusCode: 503 });
 */
export class ExternalServiceError extends AppError {
  /**
   * @param {string} message - What external operation failed
   * @param {Object} [metadata] - Context (e.g. { service, endpoint, responseCode })
   */
  constructor(message, metadata = {}) {
    super(message, { statusCode: 502, code: 'EXTERNAL_SERVICE_ERROR', metadata });
  }
}
