
import { Validator } from "./validator";

/**
 * Advanced Event Bus with full validation, async middleware, and replay capabilities
 */
class EventBus {
  constructor() {
    /** @type {Map<string, Array<Object>>} */
    this.events = new Map();

    /** @type {Map<string, *>} */
    this.state = new Map();

    /** @type {Array<MiddlewareFunction>} */
    this.middleware = [];

    /** @type {Array<EventData>} */
    this.eventHistory = [];

    /** @type {Array<StateChange>} */
    this.stateHistory = [];

    /** @type {boolean} */
    this.debug = false;

    /** @type {boolean} */
    this.recordHistory = true;

    /** @type {number} */
    this.maxHistorySize = 1000;

    /** @type {Set<string>} */
    this.namespaces = new Set();

    /** @type {boolean} */
    this.strictMode = true;
  }

  /**
   * Subscribe to an event with full validation
   * @param {string} event - Event name (supports namespacing: 'user.login', 'video.play')
   * @param {ListenerFunction} callback - Callback function
   * @param {ListenerOptions} [options={}] - Listener options
   * @returns {function(): void} Unsubscribe function
   * @throws {Error} When validation fails in strict mode
   */
  on(event, callback, options = {}) {
    // Input validation
    const eventValidation = Validator.validateEventName(event);
    const callbackValidation = Validator.validateCallback(callback);
    const optionsValidation = Validator.validateOptions(options);

    if (this.strictMode) {
      if (!eventValidation.valid) throw new Error(`Invalid event name: ${eventValidation.error}`);
      if (!callbackValidation.valid) throw new Error(`Invalid callback: ${callbackValidation.error}`);
      if (!optionsValidation.valid) throw new Error(`Invalid options: ${optionsValidation.error}`);
    } else {
      if (!eventValidation.valid || !callbackValidation.valid) {
        this._log(`❌ Validation failed for event '${event}': ${eventValidation.error || callbackValidation.error}`);
        return () => { }; // Return no-op unsubscribe
      }
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const listener = {
      callback,
      once: options.once || false,
      priority: options.priority || 0,
      namespace: options.namespace || null,
      id: this._generateId(),
      created: Date.now()
    };

    const listeners = this.events.get(event);
    listeners.push(listener);

    // Sort by priority (higher priority first)
    listeners.sort((a, b) => b.priority - a.priority);

    // Track namespace
    if (options.namespace) {
      this.namespaces.add(options.namespace);
    }

    this._log(`📋 Subscribed to '${event}'`, listener);

    // Return unsubscribe function
    return () => this.off(event, listener.id);
  }

  /**
   * Subscribe to event once with validation
   * @param {string} event - Event name
   * @param {ListenerFunction} callback - Callback function
   * @param {ListenerOptions} [options={}] - Listener options
   * @returns {function(): void} Unsubscribe function
   */
  once(event, callback, options = {}) {
    return this.on(event, callback, { ...options, once: true });
  }

  /**
   * Unsubscribe from event
   * @param {string} event - Event name
   * @param {string} listenerId - Listener ID
   * @returns {boolean} Whether listener was found and removed
   */
  off(event, listenerId) {
    const eventValidation = Validator.validateEventName(event);
    if (!eventValidation.valid) {
      this._log(`❌ Invalid event name for unsubscribe: ${eventValidation.error}`);
      return false;
    }

    if (!this.events.has(event)) return false;

    const listeners = this.events.get(event);
    const index = listeners.findIndex(l => l.id === listenerId);

    if (index !== -1) {
      const removed = listeners.splice(index, 1)[0];
      this._log(`🗑️ Unsubscribed from '${event}'`, removed);

      // Clean up empty event arrays
      if (listeners.length === 0) {
        this.events.delete(event);
      }

      return true;
    }

    return false;
  }

  /**
   * Remove all listeners for a namespace
   * @param {string} namespace - Namespace to remove
   * @returns {number} Number of listeners removed
   */
  offNamespace(namespace) {
    if (typeof namespace !== 'string') {
      this._log(`❌ Invalid namespace: must be a string`);
      return 0;
    }

    let removedCount = 0;

    this.events.forEach((listeners, event) => {
      const initialLength = listeners.length;
      this.events.set(event, listeners.filter(l => l.namespace !== namespace));
      const newLength = this.events.get(event).length;
      removedCount += (initialLength - newLength);

      // Clean up empty event arrays
      if (newLength === 0) {
        this.events.delete(event);
      }
    });

    this.namespaces.delete(namespace);
    this._log(`🗑️ Removed ${removedCount} listeners from namespace '${namespace}'`);

    return removedCount;
  }

  /**
   * Emit an event with async middleware support
   * @param {string} event - Event name
   * @param {*} [data] - Data to pass to listeners
   * @returns {Promise<boolean>} Whether event was successfully emitted (not cancelled)
   */
  async emit(event, data) {
    const eventValidation = Validator.validateEventName(event);
    if (!eventValidation.valid) {
      if (this.strictMode) {
        throw new Error(`Invalid event name: ${eventValidation.error}`);
      }
      this._log(`❌ Invalid event name: ${eventValidation.error}`);
      return false;
    }

    const timestamp = Date.now();
    this._log(`🚀 Emitting '${event}'`, data);

    /** @type {EventData} */
    const eventData = {
      event,
      data,
      cancelled: false,
      timestamp,
      metadata: {
        source: 'emit',
        listenersCount: this.events.has(event) ? this.events.get(event).length : 0
      }
    };

    // Run async middleware
    try {
      for (const middleware of this.middleware) {
        if (eventData.cancelled) break;
        await middleware(eventData);
      }
    } catch (error) {
      this._log(`❌ Middleware error for '${event}':`, error);
      if (this.strictMode) {
        throw new Error(`Middleware error: ${error.message}`);
      }
      return false;
    }

    if (eventData.cancelled) {
      this._log(`❌ Event '${event}' was cancelled by middleware`);
      return false;
    }

    // Record in history
    if (this.recordHistory) {
      this._addToHistory(eventData);
    }

    // Emit to specific listeners
    await this._emitToListeners(event, eventData.data);

    // Emit to wildcard listeners
    await this._emitWildcard(event, eventData.data);

    return true;
  }

  /**
   * Set state value with validation and history tracking
   * @param {string} key - State key
   * @param {*} value - State value
   * @param {boolean} [silent=false] - Don't emit state change event
   * @returns {boolean} Whether state was successfully set
   */
  setState(key, value, silent = false) {
    const keyValidation = Validator.validateStateKey(key);
    if (!keyValidation.valid) {
      if (this.strictMode) {
        throw new Error(`Invalid state key: ${keyValidation.error}`);
      }
      this._log(`❌ Invalid state key: ${keyValidation.error}`);
      return false;
    }

    const oldValue = this.state.get(key);
    this.state.set(key, value);

    const stateChange = {
      key,
      value,
      oldValue,
      timestamp: Date.now()
    };

    // Record in history
    if (this.recordHistory) {
      this.stateHistory.push(stateChange);
      this._trimHistory();
    }

    this._log(`📦 State '${key}' updated`, stateChange);

    if (!silent) {
      // Emit state change events (don't await to prevent blocking)
      this.emit(`state.${key}`, stateChange).catch(error => {
        this._log(`❌ Error emitting state change for '${key}':`, error);
      });

      this.emit('state.changed', stateChange).catch(error => {
        this._log(`❌ Error emitting global state change:`, error);
      });
    }

    return true;
  }

  /**
   * Get state value with validation
   * @param {string} key - State key
   * @param {*} [defaultValue] - Default value if key doesn't exist
   * @returns {*} State value or default value
   */
  getState(key, defaultValue = undefined) {
    const keyValidation = Validator.validateStateKey(key);
    if (!keyValidation.valid) {
      if (this.strictMode) {
        throw new Error(`Invalid state key: ${keyValidation.error}`);
      }
      this._log(`❌ Invalid state key: ${keyValidation.error}`);
      return defaultValue;
    }

    return this.state.has(key) ? this.state.get(key) : defaultValue;
  }

  /**
   * Subscribe to state changes with validation
   * @param {string} key - State key
   * @param {ListenerFunction} callback - Callback function
   * @param {ListenerOptions} [options={}] - Listener options
   * @returns {function(): void} Unsubscribe function
   */
  onState(key, callback, options = {}) {
    const keyValidation = Validator.validateStateKey(key);
    if (!keyValidation.valid) {
      if (this.strictMode) {
        throw new Error(`Invalid state key: ${keyValidation.error}`);
      }
      this._log(`❌ Invalid state key: ${keyValidation.error}`);
      return () => { };
    }

    return this.on(`state.${key}`, callback, options);
  }

  /**
   * Remove state with validation
   * @param {string} key - State key
   * @returns {boolean} Whether state was removed
   */
  removeState(key) {
    const keyValidation = Validator.validateStateKey(key);
    if (!keyValidation.valid) {
      if (this.strictMode) {
        throw new Error(`Invalid state key: ${keyValidation.error}`);
      }
      this._log(`❌ Invalid state key: ${keyValidation.error}`);
      return false;
    }

    if (!this.state.has(key)) return false;

    const value = this.state.get(key);
    this.state.delete(key);

    // Emit removal event
    this.emit(`state.${key}.removed`, { key, value }).catch(error => {
      this._log(`❌ Error emitting state removal for '${key}':`, error);
    });

    return true;
  }

  /**
   * Add async middleware
   * @param {MiddlewareFunction} middleware - Middleware function
   * @returns {function(): void} Remove middleware function
   */
  use(middleware) {
    const callbackValidation = Validator.validateCallback(middleware);
    if (!callbackValidation.valid) {
      if (this.strictMode) {
        throw new Error(`Invalid middleware: ${callbackValidation.error}`);
      }
      this._log(`❌ Invalid middleware: ${callbackValidation.error}`);
      return () => { };
    }

    this.middleware.push(middleware);

    // Return remove function
    return () => {
      const index = this.middleware.indexOf(middleware);
      if (index !== -1) {
        this.middleware.splice(index, 1);
      }
    };
  }

  /**
   * Replay events to new listeners
   * @param {string} event - Event name or pattern
   * @param {ListenerFunction} callback - Callback function
   * @param {ReplayFilter} [filter] - Optional filter function
   * @returns {number} Number of events replayed
   */
  replay(event, callback, filter = null) {
    const eventValidation = Validator.validateEventName(event);
    const callbackValidation = Validator.validateCallback(callback);

    if (!eventValidation.valid || !callbackValidation.valid) {
      this._log(`❌ Invalid replay parameters`);
      return 0;
    }

    let replayCount = 0;

    this.eventHistory.forEach(eventData => {
      const matches = event === '*' || eventData.event === event || this._matchesPattern(eventData.event.split('.'), event.split('.'));

      if (matches && (!filter || filter(eventData))) {
        try {
          callback(eventData.data, eventData.event);
          replayCount++;
        } catch (error) {
          this._log(`❌ Error in replay callback:`, error);
        }
      }
    });

    this._log(`🔄 Replayed ${replayCount} events for '${event}'`);
    return replayCount;
  }

  /**
   * Get state history
   * @param {string} [key] - Optional state key filter
   * @returns {Array<StateChange>} State history
   */
  getStateHistory(key = null) {
    if (key) {
      const keyValidation = Validator.validateStateKey(key);
      if (!keyValidation.valid) {
        this._log(`❌ Invalid state key: ${keyValidation.error}`);
        return [];
      }
      return this.stateHistory.filter(change => change.key === key);
    }
    return [...this.stateHistory];
  }

  /**
   * Get event history
   * @param {string} [event] - Optional event name filter
   * @returns {Array<EventData>} Event history
   */
  getEventHistory(event = null) {
    if (event) {
      const eventValidation = Validator.validateEventName(event);
      if (!eventValidation.valid) {
        this._log(`❌ Invalid event name: ${eventValidation.error}`);
        return [];
      }
      return this.eventHistory.filter(e => e.event === event);
    }
    return [...this.eventHistory];
  }

  /**
   * Enable/disable debug mode
   * @param {boolean} enabled - Debug mode enabled
   */
  setDebug(enabled) {
    this.debug = Boolean(enabled);
    this._log(`🔧 Debug mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Enable/disable strict mode
   * @param {boolean} enabled - Strict mode enabled
   */
  setStrictMode(enabled) {
    this.strictMode = Boolean(enabled);
    this._log(`🔧 Strict mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Configure history recording
   * @param {boolean} enabled - Whether to record history
   * @param {number} [maxSize=1000] - Maximum history size
   */
  setHistoryRecording(enabled, maxSize = 1000) {
    this.recordHistory = Boolean(enabled);
    this.maxHistorySize = Math.max(0, Math.floor(maxSize));
    this._log(`🔧 History recording ${enabled ? 'enabled' : 'disabled'}, max size: ${this.maxHistorySize}`);
  }

  /**
   * Clear all events, state, and history
   */
  clear() {
    this.events.clear();
    this.state.clear();
    this.eventHistory.length = 0;
    this.stateHistory.length = 0;
    this.namespaces.clear();
    this._log('🧹 Event bus cleared');
  }

  /**
   * Get comprehensive stats
   * @returns {Object} Bus statistics
   */
  getStats() {
    return {
      events: this.events.size,
      totalListeners: Array.from(this.events.values()).reduce((sum, listeners) => sum + listeners.length, 0),
      stateKeys: this.state.size,
      middleware: this.middleware.length,
      eventHistory: this.eventHistory.length,
      stateHistory: this.stateHistory.length,
      namespaces: this.namespaces.size,
      strictMode: this.strictMode,
      debug: this.debug,
      recordHistory: this.recordHistory
    };
  }

  // Private methods
  /**
   * @private
   * @param {string} event 
   * @param {*} data 
   */
  async _emitToListeners(event, data) {
    if (!this.events.has(event)) return;

    const listeners = this.events.get(event).slice();
    const toRemove = [];

    for (const listener of listeners) {
      try {
        await listener.callback(data, event);

        if (listener.once) {
          toRemove.push(listener.id);
        }
      } catch (error) {
        this._log(`❌ Error in event listener for '${event}':`, error);
        if (this.strictMode) {
          throw error;
        }
      }
    }

    // Remove one-time listeners
    toRemove.forEach(id => this.off(event, id));
  }

  /**
   * @private
   * @param {string} event 
   * @param {*} data 
   */
  async _emitWildcard(event, data) {
    const parts = event.split('.');

    for (const [eventPattern, listeners] of this.events) {
      if (eventPattern.includes('*')) {
        const patternParts = eventPattern.split('.');
        if (this._matchesPattern(parts, patternParts)) {
          for (const listener of listeners) {
            try {
              await listener.callback(data, event);
            } catch (error) {
              this._log(`❌ Error in wildcard listener for '${eventPattern}':`, error);
              if (this.strictMode) {
                throw error;
              }
            }
          }
        }
      }
    }
  }

  /**
   * @private
   * @param {Array<string>} eventParts 
   * @param {Array<string>} patternParts 
   * @returns {boolean}
   */
  _matchesPattern(eventParts, patternParts) {
    let i = 0;
    for (; i < patternParts.length; i++) {
      const pattern = patternParts[i];
      const eventPart = eventParts[i];

      if (pattern === '**') return true; // match the rest
      if (pattern === '*') continue;     // match any one segment
      if (pattern !== eventPart) return false;
    }

    return eventParts.length === patternParts.length;
  }

  /**
   * @private
   * @param {EventData} eventData 
   */
  _addToHistory(eventData) {
    this.eventHistory.push(eventData);
    this._trimHistory();
  }

  /**
   * @private
   */
  _trimHistory() {
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.splice(0, this.eventHistory.length - this.maxHistorySize);
    }
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.splice(0, this.stateHistory.length - this.maxHistorySize);
    }
  }

  /**
   * @private
   * @returns {string}
   */
  _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * @private
   * @param {string} message 
   * @param {*} data 
   */
  _log(message, data) {
    if (this.debug) {
      console.log(`[EventBus] ${message}`, data !== undefined ? data : '');
    }
  }
}

// Create singleton instance
export const eventBus = new EventBus();
