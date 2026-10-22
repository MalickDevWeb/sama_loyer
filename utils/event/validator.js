/**
 * Input validation utilities
 */
const Validator = {
  /**
   * Validate event name
   * @param {*} event - Event name to validate
   * @returns {ValidationResult}
   */
  validateEventName(event) {
    if (typeof event !== 'string') {
      return { valid: false, error: 'Event name must be a string' };
    }
    if (event.length === 0) {
      return { valid: false, error: 'Event name cannot be empty' };
    }

    if (!/^[a-zA-Z0-9._\-*]+$/.test(event)) {
      return { valid: false, error: 'Event name contains invalid characters. Use only alphanumeric, dots, underscores, and hyphens' };
    }
    return { valid: true };
  },

  /**
   * Validate callback function
   * @param {*} callback - Callback to validate
   * @returns {ValidationResult}
   */
  validateCallback(callback) {
    if (typeof callback !== 'function') {
      return { valid: false, error: 'Callback must be a function' };
    }
    return { valid: true };
  },

  /**
   * Validate state key
   * @param {*} key - State key to validate
   * @returns {ValidationResult}
   */
  validateStateKey(key) {
    if (typeof key !== 'string') {
      return { valid: false, error: 'State key must be a string' };
    }
    if (key.length === 0) {
      return { valid: false, error: 'State key cannot be empty' };
    }
    if (key.startsWith('_')) {
      return { valid: false, error: 'State key cannot start with underscore (reserved for internal use)' };
    }
    return { valid: true };
  },

  /**
   * Validate listener options
   * @param {*} options - Options to validate
   * @returns {ValidationResult}
   */
  validateOptions(options) {
    if (options === null || options === undefined) {
      return { valid: true };
    }
    if (typeof options !== 'object') {
      return { valid: false, error: 'Options must be an object' };
    }
    if (options.once !== undefined && typeof options.once !== 'boolean') {
      return { valid: false, error: 'options.once must be a boolean' };
    }
    if (options.priority !== undefined && typeof options.priority !== 'number') {
      return { valid: false, error: 'options.priority must be a number' };
    }
    if (options.namespace !== undefined && typeof options.namespace !== 'string') {
      return { valid: false, error: 'options.namespace must be a string' };
    }
    return { valid: true };
  }
};

export { Validator }