import { eventBus } from "./builder";

/**
 * TCMPP Event Bus - Enterprise-Grade State Management + Event System
 * Bulletproof, async-ready, and built for production mini-programs
 * 
 * Global Bus interface with full type safety
 * 
 * @fileoverview Advanced event bus with full validation, async middleware, and replay capabilities
 * @version 1.0.0
 * @author TCMPP Team
 * @type {EventBus}
 */
const Bus = {
  // Event methods
  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {ListenerFunction} callback - Callback function
   * @param {ListenerOptions} [options] - Listener options
   * @returns {function(): void} Unsubscribe function
   */
  on: (event, callback, options) => eventBus.on(event, callback, options),

  /**
   * Subscribe to event once
   * @param {string} event - Event name
   * @param {ListenerFunction} callback - Callback function
   * @param {ListenerOptions} [options] - Listener options
   * @returns {function(): void} Unsubscribe function
   */
  once: (event, callback, options) => eventBus.once(event, callback, options),

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {string} listenerId - Listener ID
   * @returns {boolean} Whether listener was removed
   */
  off: (event, listenerId) => eventBus.off(event, listenerId),

  /**
   * Remove all listeners for namespace
   * @param {string} namespace - Namespace to remove
   * @returns {number} Number of listeners removed
   */
  offNamespace: (namespace) => eventBus.offNamespace(namespace),

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} [data] - Event data
   * @returns {Promise<boolean>} Whether event was emitted
   */
  emit: (event, data) => eventBus.emit(event, data),

  // State methods
  /**
   * Set state value
   * @param {string} key - State key
   * @param {*} value - State value
   * @param {boolean} [silent] - Don't emit change event
   * @returns {boolean} Whether state was set
   */
  setState: (key, value, silent) => eventBus.setState(key, value, silent),

  /**
   * Get state value
   * @param {string} key - State key
   * @param {*} [defaultValue] - Default value
   * @returns {*} State value
   */
  getState: (key, defaultValue) => eventBus.getState(key, defaultValue),

  /**
   * Subscribe to state changes
   * @param {string} key - State key
   * @param {ListenerFunction} callback - Callback function
   * @param {ListenerOptions} [options] - Listener options
   * @returns {function(): void} Unsubscribe function
   */
  onState: (key, callback, options) => eventBus.onState(key, callback, options),

  /**
   * Remove state
   * @param {string} key - State key
   * @returns {boolean} Whether state was removed
   */
  removeState: (key) => eventBus.removeState(key),

  // Middleware and configuration
  /**
   * Add middleware
   * @param {MiddlewareFunction} middleware - Middleware function
   * @returns {function(): void} Remove middleware function
   */
  use: (middleware) => eventBus.use(middleware),

  /**
   * Replay events
   * @param {string} event - Event name or pattern
   * @param {ListenerFunction} callback - Callback function
   * @param {ReplayFilter} [filter] - Optional filter function
   * @returns {number} Number of events replayed
   */
  replay: (event, callback, filter) => eventBus.replay(event, callback, filter),

  /**
   * Get state history
   * @param {string} [key] - Optional state key filter
   * @returns {Array<StateChange>} State history
   */
  getStateHistory: (key) => eventBus.getStateHistory(key),

  /**
   * Get event history
   * @param {string} [event] - Optional event name filter
   * @returns {Array<EventData>} Event history
   */
  getEventHistory: (event) => eventBus.getEventHistory(event),

  /**
   * Set debug mode
   * @param {boolean} enabled - Debug enabled
   */
  setDebug: (enabled) => eventBus.setDebug(enabled),

  /**
   * Set strict mode
   * @param {boolean} enabled - Strict mode enabled
   */
  setStrictMode: (enabled) => eventBus.setStrictMode(enabled),

  /**
   * Configure history recording
   * @param {boolean} enabled - History recording enabled
   * @param {number} [maxSize] - Maximum history size
   */
  setHistoryRecording: (enabled, maxSize) => eventBus.setHistoryRecording(enabled, maxSize),

  /**
   * Clear all data
   */
  clear: () => eventBus.clear(),

  /**
   * Get statistics
   * @returns {Object} Bus statistics
   */
  stats: () => eventBus.getStats(),

  // Direct access to instance
  /** @type {EventBus} */
  instance: eventBus
};


export { Bus };
