// ============================================================================
// LOADING BEHAVIOR
// Shared mixin for pages/components that need loading + error state
//
// WeChat Behaviors are the mini program equivalent of mixins/traits.
// They let you share data, methods, and lifecycle hooks across
// multiple pages or components without inheritance.
//
// USAGE IN A PAGE:
//   import { loadingBehavior } from '../../utils/behaviors/loading';
//
//   Page({
//     behaviors: [loadingBehavior],
//
//     async onLoad() {
//       await this.withLoading(async () => {
//         const data = await fetchData();
//         this.setData({ items: data });
//       });
//     },
//   });
//
// USAGE IN A COMPONENT:
//   import { loadingBehavior } from '../../utils/behaviors/loading';
//
//   Component({
//     behaviors: [loadingBehavior],
//     methods: {
//       async refresh() {
//         await this.withLoading(() => this.fetchItems());
//       },
//     },
//   });
//
// WHAT YOU GET:
//   data:    { isLoading: false, hasError: false, errorMessage: '' }
//   methods: withLoading(fn), setError(msg), clearError()
// ============================================================================

import { normalizeApiError } from '../errors/index.js';

export const loadingBehavior = Behavior({
  data: {
    /** Whether an async operation is in progress */
    isLoading: false,

    /** Whether the last operation failed */
    hasError: false,

    /** Human-readable error message */
    errorMessage: '',
  },

  methods: {
    /**
     * Wraps an async function with automatic loading/error state management.
     * Sets isLoading=true before, isLoading=false after, and catches errors.
     *
     * @param {Function} fn - Async function to execute
     * @param {Object} [options]
     * @param {string} [options.loadingText] - Optional wx.showLoading text
     * @returns {Promise<*>} Result of fn, or undefined on error
     */
    async withLoading(fn, options = {}) {
      this.setData({ isLoading: true, hasError: false, errorMessage: '' });

      if (options.loadingText) {
        wx.showLoading({ title: options.loadingText, mask: true });
      }

      try {
        const result = await fn();
        return result;
      } catch (error) {
        const normalizedError = normalizeApiError(error);
        const message = normalizedError.message;
        console.error('[Loading] Operation failed:', message);
        this.setData({ hasError: true, errorMessage: message });
      } finally {
        this.setData({ isLoading: false });
        if (options.loadingText) {
          wx.hideLoading();
        }
      }
    },

    /**
     * Manually sets an error state.
     * @param {string} message - Error message to display
     */
    setError(message) {
      this.setData({ hasError: true, errorMessage: message });
    },

    /**
     * Clears the error state.
     */
    clearError() {
      this.setData({ hasError: false, errorMessage: '' });
    },
  },
});
