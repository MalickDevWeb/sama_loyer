
/**
 * Event listener configuration
 * @typedef {Object} ListenerOptions
 * @property {boolean} [once=false] - Execute listener only once
 * @property {number} [priority=0] - Execution priority (higher = earlier)
 * @property {string} [namespace] - Listener namespace for bulk operations
 */

/**
 * Event data structure for middleware
 * @typedef {Object} EventData
 * @property {string} event - Event name
 * @property {*} data - Event payload
 * @property {boolean} cancelled - Whether event was cancelled
 * @property {number} timestamp - Event timestamp
 * @property {Object} metadata - Additional event metadata
 */

/**
 * State change data structure
 * @typedef {Object} StateChange
 * @property {string} key - State key
 * @property {*} value - New value
 * @property {*} oldValue - Previous value
 * @property {number} timestamp - Change timestamp
 */

/**
 * Middleware function signature
 * @typedef {function(EventData): Promise<void>|void} MiddlewareFunction
 */

/**
 * Event listener function signature
 * @typedef {function(*,string): void} ListenerFunction
 */

/**
 * Replay filter function signature
 * @typedef {function(EventData): boolean} ReplayFilter
 */

/**
 * Validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether validation passed
 * @property {string} [error] - Error message if validation failed
 */

/**
 * @typedef {Object} EventBus
 * @property {function(string, ListenerFunction, ListenerOptions): function(): void} on - Subscribe to an event
 * @property {function(string, ListenerFunction, ListenerOptions): function(): void} once - Subscribe to event once
 * @property {function(string, string): boolean} off - Unsubscribe from event
 * @property {function(string): number} offNamespace - Remove all listeners for namespace
 * @property {function(string, *): Promise<boolean>} emit - Emit an event
 * @property {function(string, *, boolean): boolean} setState - Set state value
 * @property {function(string, *): *} getState - Get state value
 * @property {function(string, ListenerFunction, ListenerOptions): function(): void} onState - Subscribe to state changes
 * @property {function(string): boolean} removeState - Remove state
 * @property {function(MiddlewareFunction): function(): void} use - Add middleware
 * @property {function(string, ListenerFunction, ReplayFilter): number} replay - Replay events
 * @property {function(string): Array<StateChange>} getStateHistory - Get state history
 * @property {function(string): Array<EventData>} getEventHistory - Get event history
 * @property {function(boolean): void} setDebug - Set debug mode
 * @property {function(boolean): void} setStrictMode - Set strict mode
 * @property {function(boolean, number): void} setHistoryRecording - Configure history recording
 * @property {function(): void} clear - Clear all data
 * @property {function(): Object} stats - Get statistics
 * @property {EventBus} instance - Direct access to instance
 * 
 * @example
 * // Enable strict mode and debug
 * Bus.setStrictMode(true);
 * Bus.setDebug(true);
 * 
 * // Basic events with validation
 * const unsubscribe = Bus.on('user.login', (userData) => {
 *  console.log('User logged in:', userData);
 * }, { priority: 10, namespace: 'auth' });
 * 
 * // Async emit with middleware
 * await Bus.emit('user.login', { id: 123, name: 'John' });
 * // Async middleware with validation
 * Bus.use(async (eventData) => {
 *  if (eventData.event === 'payment.process') {
 *    const user = Bus.getState('user');
 *    if (!user?.authenticated) {
 *      eventData.cancelled = true;
 *      console.log('Payment cancelled - user not authenticated');
 *    }
 *  }
 * });
 * 
 * // State management with history
 * Bus.setState('user.credits', 50);
 * Bus.onState('user.credits', (stateChange) => {
 *   console.log('Credits changed:', stateChange);
 * });
 * 
 * // Replay events for late-joining components
 * Bus.replay('user.*', (data, event) => {
 *   console.log('Replaying:', event, data);
 * }, (eventData) => eventData.timestamp > Date.now() - 60000); // Last minute only
 * 
 * // Namespace management for cleanup
 * Bus.on('video.play', handleVideoPlay, { namespace: 'video-player' });
 * Bus.on('video.pause', handleVideoPause, { namespace: 'video-player' });
 * 
 * // Later: clean up all video player listeners
 * Bus.offNamespace('video-player');
 * 
 * // Get comprehensive history
 * const userStateHistory = Bus.getStateHistory('user');
 * const videoEvents = Bus.getEventHistory('video.play');
 * 
 * // Wildcard events with async handling
 * Bus.on('payment.*', async (data, event) => {
 *   await logPaymentEvent(event, data);
 * });
 * 
 * // Advanced validation in action
 * try {
 *   Bus.on('', invalidCallback); // Throws in strict mode
 * } catch (error) {
 *   console.error('Validation error:', error.message);
 * }
*/