/// HTTP Verbs
/**
 * Represents the complete API client interface with standard HTTP verbs.
 *
 * @typedef {Object} IAPIClient
 * @property {IGETVerb} get - HTTP GET handler
 * @property {IPOSTVerb} post - HTTP POST handler
 * @property {IPUTVerb} put - HTTP PUT handler
 * @property {IPATCHVerb} patch - HTTP PATCH handler
 * @property {IDeleteVerb} delete - HTTP DELETE handler
 */

/**
 * Represents the generic shape of an HTTP response.
 *
 * @typedef {Object} IAPIResponse
 * @property {number} status - HTTP status code
 * @property {Object} headers - Response headers
 * @property {any} data - Parsed response payload
 */

/**
 * Optional query or body parameters for requests.
 *
 * @typedef {Object.<string, any>} IParams
 */

/**
 * Optional headers passed along with the request.
 *
 * @typedef {Object.<string, string>} IHeaders
 */

/**
 * Optional config for timeout, retries, etc.
 *
 * @typedef {Object} IRequestOptions
 * @property {number} [timeout] - Timeout in milliseconds
 * @property {number} [retry] - Number of retry attempts
 * @property {AbortSignal} [signal] - Signal for request cancellation
 */

/**
 * @callback IGETVerb
 * @param {string} url - Target URL
 * @param {Object} [options] - Optional GET options
 * @param {IParams} [options.query] - Query parameters as key-value pairs
 * @param {IHeaders} [options.headers] - Optional custom headers
 * @param {IRequestOptions} [options.config] - Optional request configuration
 * @returns {Promise<IAPIResponse>}
 */

/**
 * @callback IPOSTVerb
 * @param {string} url - Target URL
 * @param {any} body - Body payload to send
 * @param {Object} [options] - Optional POST options
 * @param {IHeaders} [options.headers] - Optional custom headers
 * @param {IRequestOptions} [options.config] - Optional request configuration
 * @returns {Promise<IAPIResponse>}
 */

/**
 * @callback IPUTVerb
 * @param {string} url - Target URL
 * @param {any} body - Body payload to update
 * @param {Object} [options] - Optional PUT options
 * @param {IHeaders} [options.headers] - Optional custom headers
 * @param {IRequestOptions} [options.config] - Optional request configuration
 * @returns {Promise<IAPIResponse>}
 */

/**
 * @callback IPATCHVerb
 * @param {string} url - Target URL
 * @param {any} body - Partial update payload
 * @param {Object} [options] - Optional PATCH options
 * @param {IHeaders} [options.headers] - Optional custom headers
 * @param {IRequestOptions} [options.config] - Optional request configuration
 * @returns {Promise<IAPIResponse>}
 */

/**
 * @callback IDeleteVerb
 * @param {string} url - Target URL
 * @param {Object} [options] - Optional DELETE options
 * @param {IParams} [options.query] - Optional query parameters
 * @param {IHeaders} [options.headers] - Optional custom headers
 * @param {IRequestOptions} [options.config] - Optional request configuration
 * @returns {Promise<IAPIResponse>}
 */

/**
 * @typedef {Object} IUnifiedResponse
 * @property {boolean} success - Whether the request was successful.
 * @property {any} data - Response data if successful.
 * @property {{code?:number, message:string}|null} error - Error object if failed.
 * @property {Object} headers - Response headers.
 * @property {number} status - HTTP status code.
 */