// ============================================================================
// SHARED FORMATTERS
// Pure utility functions for data formatting across the application
// ============================================================================

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Formats a date string for display.
 *
 * @param {string} dateString - ISO date string
 * @param {string} [locale='en-US'] - Locale for formatting
 * @returns {string} Formatted date
 *
 * @example
 * formatDate('2024-12-15') // '12/15/2024'
 * formatDate('2024-12-15', 'fr-FR') // '15/12/2024'
 */
export const formatDate = (dateString, locale = 'en-US') => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale);
  } catch {
    return dateString;
  }
};

/**
 * Formats a date and time string for display.
 *
 * @param {string} dateString - ISO datetime string
 * @param {string} [locale='en-US'] - Locale for formatting
 * @returns {string} Formatted datetime
 *
 * @example
 * formatDateTime('2024-12-15T14:30:00') // '12/15/2024, 2:30 PM'
 */
export const formatDateTime = (dateString, locale = 'en-US') => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    return date.toLocaleString(locale);
  } catch {
    return dateString;
  }
};

// ============================================================================
// PRICE FORMATTING
// ============================================================================

/**
 * Formats a price for display.
 *
 * @param {number} amount - Numeric amount
 * @param {Object} [options] - Formatting options
 * @param {string} [options.currency='USD'] - Currency code
 * @param {string} [options.locale='en-US'] - Locale for formatting
 * @param {boolean} [options.includeCurrency=true] - Include currency symbol
 * @returns {string} Formatted price string
 *
 * @example
 * formatPrice(2000) // '$2,000.00'
 * formatPrice(2000, { currency: 'XOF', locale: 'fr-FR' }) // '2 000 XOF'
 */
export const formatPrice = (amount, options = {}) => {
  const { currency = 'USD', locale = 'en-US', includeCurrency = true } = options;

  if (amount === null || amount === undefined || amount === '' || !Number.isFinite(Number(amount))) {
    return '';
  }
  amount = Number(amount);

  if (includeCurrency) {
    try {
      return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
    } catch {
      return `${amount.toLocaleString(locale)} ${currency}`;
    }
  }

  return amount.toLocaleString(locale);
};

/**
 * Parses a formatted price string to number.
 *
 * @param {string} formatted - Formatted price string
 * @returns {number} Numeric amount
 *
 * @example
 * parsePrice('$2,000.00') // 2000
 * parsePrice('2 000 XOF') // 2000
 */
export const parsePrice = (formatted) => {
  if (formatted === null || formatted === undefined || formatted === '') return null;
  let numeric = String(formatted).trim().replace(/\s/g, '').replace(/[^\d,.-]/g, '');
  if (!numeric || numeric === '-' || numeric === '.' || numeric === ',') return Number.NaN;
  const lastComma = numeric.lastIndexOf(',');
  const lastDot = numeric.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.';
    const grouping = decimal === ',' ? /\./g : /,/g;
    numeric = numeric.replace(grouping, '').replace(decimal, '.');
  } else if (lastComma >= 0) {
    numeric = numeric.replace(',', '.');
  }
  const value = Number(numeric);
  return Number.isFinite(value) ? value : Number.NaN;
};

/** Formats a price without inventing a currency when the package omits it. */
export const formatPackagePrice = (amount, currency, locale = 'fr-FR') => formatPrice(amount, {
  ...(currency ? { currency, includeCurrency: true } : { includeCurrency: false }),
  locale,
});

// ============================================================================
// STRING FORMATTING
// ============================================================================

/**
 * Truncates a string to the specified length with ellipsis.
 *
 * @param {string} str - String to truncate
 * @param {number} [maxLength=50] - Maximum length
 * @returns {string} Truncated string
 *
 * @example
 * truncate('This is a long string', 10) // 'This is a...'
 */
export const truncate = (str, maxLength = 50) => {
  if (!str || str.length <= maxLength) return str || '';
  return str.slice(0, maxLength) + '...';
};
