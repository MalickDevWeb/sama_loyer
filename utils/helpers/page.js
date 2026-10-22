// ============================================================================
// PAGE HELPERS
// Shared utilities for page-level EventBus subscriptions and common patterns
// ============================================================================

// ============================================================================
// TOAST / LOADING HELPERS
// ============================================================================

/**
 * Shows a toast message.
 *
 * @param {string} message - Message to display
 * @param {'success'|'error'|'none'} [type='none'] - Toast type
 *
 * @example
 * showToast('Saved successfully', 'success');
 * showToast('Something went wrong', 'error');
 */
export const showToast = (message, type = 'none') => {
  const iconMap = {
    success: 'success',
    error: 'none',
    none: 'none',
  };

  wx.showToast({
    title: message,
    icon: iconMap[type] || 'none',
  });
};

/**
 * Shows a loading indicator.
 *
 * @param {string} [message='Loading...'] - Loading message
 */
export const showLoading = (message = 'Loading...') => {
  wx.showLoading({ title: message, mask: true });
};

/**
 * Hides the loading indicator.
 */
export const hideLoading = () => {
  wx.hideLoading();
};

// ============================================================================
// EVENTBUS PAGE HELPERS
// ============================================================================

/**
 * Creates EventBus subscription handlers for common page data patterns.
 * Provides consistent subscribe/unsubscribe pattern for pages that need
 * shared state from the EventBus.
 *
 * @param {Object} page - Page instance (this)
 * @param {Object} stateBindings - Map of page data key -> EventBus state key
 * @returns {Object} Helper methods: subscribe(), loadInitial(), unsubscribe()
 *
 * @example
 * // In page onLoad:
 * const helpers = createPageHelpers(this, {
 *   user: 'user.data',
 *   items: 'items.list',
 * });
 * helpers.subscribe();
 * helpers.loadInitial();
 *
 * // In page onUnload:
 * helpers.unsubscribe();
 */
export const createPageHelpers = (page, stateBindings = {}) => {
  const app = getApp();
  const { eventBus } = app.globalData;

  /** @type {Array<Function>} Unsubscribe functions */
  const unsubscribers = [];

  return {
    /**
     * Subscribe to EventBus state changes for all bindings.
     */
    subscribe() {
      Object.entries(stateBindings).forEach(([pageKey, stateKey]) => {
        const unsub = eventBus.onState(stateKey, (value) => {
          page.setData({ [pageKey]: value });
        });
        unsubscribers.push(unsub);
      });
    },

    /**
     * Load current data from EventBus state into page data.
     */
    loadInitial() {
      const updates = {};
      Object.entries(stateBindings).forEach(([pageKey, stateKey]) => {
        updates[pageKey] = eventBus.getState(stateKey);
      });
      updates.isLoading = false;
      page.setData(updates);
    },

    /**
     * Unsubscribe from all EventBus subscriptions.
     */
    unsubscribe() {
      unsubscribers.forEach((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
      unsubscribers.length = 0;
    },
  };
};

// ============================================================================
// RETRY HELPER
// ============================================================================

/**
 * Retries an async operation with exponential backoff.
 * Useful for retrying API calls after payment or other critical operations.
 *
 * @param {Function} fn - Async function to retry
 * @param {Object} [options] - Retry options
 * @param {number} [options.maxRetries=2] - Maximum retry attempts (excluding initial try)
 * @param {number} [options.delayMs=2000] - Delay between retries in milliseconds
 * @param {Object} [options.page] - Page instance for UI state updates
 * @returns {Promise<any>} Result of the successful call
 * @throws {Error} Last error if all attempts fail
 *
 * @example
 * const result = await retryAsync(
 *   () => backendAPI.submitOrder(payload),
 *   { maxRetries: 3, delayMs: 1000, page: this }
 * );
 */
export const retryAsync = async (fn, options = {}) => {
  const { maxRetries = 2, delayMs = 2000, page } = options;

  let lastError;

  const updateUI = (data) => {
    if (page && typeof page.setData === 'function') page.setData(data);
  };

  updateUI({ isRetrying: true, retryStatus: '' });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        updateUI({ retryStatus: `Retry ${attempt}/${maxRetries}...` });
      }

      const result = await fn();
      updateUI({ isRetrying: false, retryStatus: '' });
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[Retry] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);

      if (attempt < maxRetries) {
        updateUI({ retryStatus: `Failed, retrying in ${delayMs / 1000}s...` });
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  updateUI({ isRetrying: false, retryStatus: lastError.message || 'Operation failed' });
  throw lastError;
};
