const operators = {
  /** String operators */
  toLowerCase: (value) => String(value ?? '').toLowerCase(),
  toUpperCase: (value) => String(value ?? '').toUpperCase(),
  toCamelCase: (value) =>
    String(value ?? '')
      .replace(/[-_](\w)/g, (_, letter) => letter.toUpperCase())
      .replace(/^\w/, (c) => c.toLowerCase()),
  toTitleCase: (value) =>
    String(value ?? '').replace(/\w\S*/g, (word) =>
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ),
  /** Number & currency operators */
  toFixed: (value, args) => Number(value ?? 0).toFixed(args?.decimals ?? 2),
  formatNumber: (value, args) =>
    Number(value ?? 0).toLocaleString(args?.locale || 'en-US'),
  formatCurrency: (value, args) =>
    Number(value ?? 0).toLocaleString(args?.locale || 'en-US', {
      style: 'currency',
      currency: args?.currency || 'USD',
    }),
  add: (value, args) => Number(value ?? 0) + (args?.amount ?? 0),
  multiply: (value, args) => Number(value ?? 0) * (args?.factor ?? 1),
  /** Date operators */
  formatDate: (value, args) => {
    const date = new Date(value);
    if (isNaN(date)) return null;
    return date.toLocaleDateString(args?.locale || 'en-US', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      ...(args?.options || {}),
    });
  },
  formatTime: (value, args) => {
    const date = new Date(value);
    if (isNaN(date)) return null;
    return date.toLocaleTimeString(args?.locale || 'en-US', args?.options || {});
  },
  timeAgo: (value) => {
    const date = new Date(value);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  },
  /** Array operators */
  join: (value, args) => (Array.isArray(value) ? value.join(args?.separator || ', ') : value),
  length: (value) => (Array.isArray(value) ? value.length : 0),
  unique: (value) => (Array.isArray(value) ? [...new Set(value)] : value),
  first: (value) => (Array.isArray(value) ? value[0] : value),
  last: (value) => (Array.isArray(value) ? value[value.length - 1] : value),
}; // Global registry

/**
 * Safely retrieves a nested property from an object or array.
 * If the path doesn't exist, it returns a default value.
 *
 * @function getSafeValue
 * @param {string} path - Dot-separated string representing the path to the property.
 * @param {Object|Array} data - The object or array to retrieve the property from.
 * @param {*} [defaultValue=undefined] - The value to return if the path is not found.
 * @returns {*} - The value at the specified path or the default value if not found.
 * @throws {Error} If the input data is not an object or array.
 *
 * @example
 * const data = { user: { profile: { name: 'John' } } };
 * const result = getSafeValue('user.profile.name', data, 'Unknown');
 * // result: 'John'
 *
 * const missingResult = getSafeValue('user.profile.age', data, 30);
 * // missingResult: 30
 */
const getSafeValue = (path, data, defaultValue = undefined) => {
  if (typeof data !== 'object' || data === null) {
    throw new Error("Invalid data provided. Expected an object or array.");
  }

  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') return acc[part];
    return defaultValue;
  }, data);
};

class Sculpt {
  /**
   * Recursively maps and transforms structured data using a declarative template.
   *
   * This function allows flexible remapping of deeply nested objects and arrays by interpreting
   * a "template" object that defines what to extract and how to transform it.
   *
   * ---
   * ✅ Supported Features:
   * - `@link.path`: Extracts values from input using dot-notation.
   * - `::type`: Inline type casting for string, number, boolean, date.
   * - `['@link.key']`: Dynamic object keys from input data.
   * - `[$fallback1, $fallback2]`: Fallback key resolution from left to right.
   * - `$map`: Iterates over array at a path (`@link.array`) and transforms each item.
   * - `$transform`: Defines transformation structure for each mapped item.
   * - `$extract`: Shorthand for extracting a single property from each array element.
   * - `$spread`: Flattens mapped array of objects into a single merged object.
   * - `$recursive`: Recursively maps objects that include a self-similar structure (e.g. trees).
   *     - `$track`: Defines the recursive child key (e.g. `'#children'`).
   *     - `$rename`: Rename the child key in the resulting structure.
   * - **Function-based transforms**: Inline JS functions in templates for dynamic, context-aware mapping.
   *     - Each function receives `(currentItem, context)` where `context` includes `{ index, parent, path }`.
   *
   * ---
   * 💡 Example:
   * ```js
   * mapData({
   *   data: [{ id: 1, children: [...] }],
   *   to: {
   *     id: '@link.id',
   *     label: (node, ctx) => `${ctx.path} - ${node.id}`,
   *     children: {
   *       $recursive: {
   *         $track: '#children',
   *         id: '@link.id'
   *       }
   *     }
   *   }
   * });
   * ```
   *
   * @function mapData
   * @param {Object} options
   * @param {Object|Array} options.data - The raw input data to transform.
   * @param {Object} options.to - The transformation template defining the output shape.
   * @returns {Object|Array|null} The transformed output structure, or `null` if transformation failed.
   * @throws {Error} If input data is invalid, transformation fails, or the template structure is malformed.
   */
  data = ({ data, to }) => {
    /**
   * Casts a raw value to the specified type.
   * @param {*} value - The raw value to cast.
   * @param {string} type - Target type ('number', 'string', 'boolean', 'date').
   * @returns {*} - Casted value or null if cast failed.
   */
    const castToType = (value, type) => {
      try {
        switch (type) {
          case 'number': {
            /** @type {number} */
            const num = Number(value);
            if (isNaN(num)) throw new Error(`Cannot cast '${value}' to number`);
            return num;
          }
          case 'string':
            return String(value);
          case 'boolean':
            return value === 'yes' || value === 1 || value === 'true' || value === true;
          case 'date': {
            /** @type {Date} */
            const date = new Date(value);
            if (isNaN(date.getTime())) throw new Error(`Cannot cast '${value}' to date`);
            return date;
          }
          default:
            return value;
        }
      } catch (e) {
        console.warn(`Type cast failed: ${e.message}`);
        return null;
      }
    };

    /**
     * Retrieves a transformed value from a `@link.path::type` expression.
     * @param {string} path - The template path string (e.g. `@link.user.name::string`).
     * @param {Object} data - The source data.
     * @returns {*} - The extracted and optionally cast value.
     */
    const getTransformedValue = (path, data) => {
      /** @type {[string, string|undefined]} */
      const [cleanPath, type] = path.split('::');
      /** @type {*} */
      const raw = getSafeValue(cleanPath.replace('@link.', ''), data);
      return type ? castToType(raw, type) : raw;
    };

    const processOperator = (opConfig, data, context) => {
      const { $op, $from, $args } = opConfig;
      const value = typeof $from === 'string' && $from.startsWith('@link.')
        ? getTransformedValue($from, data)
        : $from;
      if (!operators[$op]) throw new Error(`Operator "${$op}" not registered.`);
      return operators[$op](value, $args, data, context);
    };

    /**
     * Attempts to resolve the first valid fallback from a list of paths or values.
     * @param {Array<string|*>} paths - Fallback array of `@link.` paths or static values.
     * @param {Object} data - Input source data.
     * @returns {*} - First non-null/undefined value.
     */
    const resolveFallback = (paths, data) => {
      for (const path of paths) {
        /** @type {*} */
        const val = typeof path === 'string' && path.startsWith('@link.')
          ? getTransformedValue(path, data)
          : path;
        if (val !== undefined && val !== null) return val;
      }
      return null;
    };

    /**
     * Recursively processes a tree structure where each node can contain children.
     * @param {Array} children - The array of child nodes.
     * @param {Object} template - Template to apply recursively.
     * @param {string} key - The recursion key (e.g. `#children`).
     * @param {string} rename - Optional rename for the recursive key.
     * @param {string} path - Path to the current node in the tree.
     * @returns {Array} - Array of processed children.
     */
    const processRecursive = (children, template, key, rename, path) => {
      if (!Array.isArray(children)) return [];
      return children.map((child, index) => {
        /** @type {Object} */
        const mapped = mapTemplate(template, child, { index, parent: children, path: `${path}.${index}` });
        const childKey = key.replace('#', '');
        const childArray = getSafeValue(childKey, child) || [];
        const recursed = processRecursive(childArray, template, key, rename, `${path}.${index}.${childKey}`);
        return { ...mapped, [rename || childKey]: recursed.length > 0 ? recursed : undefined };
      });
    };

    /**
     * Recursively maps an object or array using the provided transformation template.
     * @param {Object} template - The transformation template.
     * @param {*} data - The source data (object or array).
     * @param {{index?: number, parent?: Array, path?: string}} [context] - Context metadata for function transforms.
     * @returns {*} - Transformed data structure.
     */
    const mapTemplate = (template, data, context = {}) => {
      if (!data) return null;
      if (Array.isArray(data)) return data.map((item, index) => mapTemplate(template, item, { index, parent: data, path: `${context.path ?? ''}[${index}]` }));

      /** @type {Object} */
      return Object.keys(template).reduce((result, key) => {
        /** @type {*} */
        const raw = template[key];
        /** @type {string} */
        const resolvedKey = key.startsWith('@link.') ? getTransformedValue(key, data) : key;

        if (typeof raw === 'function') {
          // Function-based transform with context injection
          result[resolvedKey] = raw(data, context);

        } else if (Array.isArray(raw)) {
          result[resolvedKey] = resolveFallback(raw, data);

        } else if (typeof raw === 'object' && raw !== null && raw.$map) {
          /** @type {Array} */
          const arr = getTransformedValue(raw.$map, data);
          if (!Array.isArray(arr)) {
            result[resolvedKey] = raw.$spread ? {} : [];
          } else if (raw.$spread) {
            result[resolvedKey] = arr.reduce((acc, item, index) => {
              const partial = mapTemplate(raw.$spread, item, { index, parent: arr, path: `${context.path ?? ''}.${resolvedKey}[${index}]` });
              return { ...acc, ...partial };
            }, {});
          } else if (raw.$transform) {
            result[resolvedKey] = arr.map((item, index) => mapTemplate(raw.$transform, item, { index, parent: arr, path: `${context.path ?? ''}.${resolvedKey}[${index}]` }));
          } else {
            result[resolvedKey] = arr;
          }

        } else if (typeof raw === 'object' && raw !== null && raw.$recursive) {
          const { $track: keyToUse, $rename: rename, $transform: recursiveTransform } = raw.$recursive;
          const children = getSafeValue(keyToUse.replace('#', ''), data) || [];
          const processed = processRecursive(children, recursiveTransform, keyToUse, rename ?? keyToUse.replace('#', ''), `${context.path ?? ''}.${resolvedKey}`);
          result[resolvedKey] = processed;

        } else if (typeof raw === 'object' && raw !== null && raw.$op) {
          result[resolvedKey] = processOperator(raw, data, context);
        } else if (typeof raw === 'object' && raw !== null) {
          result[resolvedKey] = mapTemplate(raw, data, context);

        } else if (typeof raw === 'string') {
          result[resolvedKey] = getTransformedValue(raw, data);

        } else {
          result[resolvedKey] = raw;
        }

        return result;
      }, {});
    };

    return mapTemplate(to, data);
  }

  registerOperator = (name, fn) => {
    operators[name] = fn;
  }
}

export const sculpt = new Sculpt()