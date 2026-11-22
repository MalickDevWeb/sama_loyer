/**
 * ⚡ Module WebSocket Résilient avec Heartbeat & Reconnexion Automatique
 * Conforme runtime WeChat Mini-Program & TCMPP
 * Zéro dépendance npm
 */

class WebSocketManager {
  #socketTask = null;
  #url = '';
  #options = {};
  #isConnected = false;
  #isManualClose = false;
  #reconnectAttempts = 0;
  #maxReconnectAttempts = 5;
  #heartbeatTimer = null;
  #pongTimeoutTimer = null;
  #heartbeatInterval = 30000;
  #pongTimeout = 5000;
  #outboxQueue = [];
  #listeners = new Map();

  connect(url, options = {}) {
    if (this.#isConnected && this.#socketTask) {
      console.log('[WebSocket] Déjà connecté à', this.#url);
      return;
    }

    this.#url = url || this.#url;
    this.#options = options;
    this.#maxReconnectAttempts = options.maxReconnectAttempts || 5;
    this.#heartbeatInterval = options.heartbeatInterval || 30000;
    this.#isManualClose = false;

    try {
      this.#socketTask = wx.connectSocket({
        url: this.#url,
        header: options.headers || {},
        fail: (err) => {
          console.error('[WebSocket] Échec initialisation socket :', err);
          this.#scheduleReconnect();
        }
      });

      this.#setupSocketListeners();
    } catch (e) {
      console.error('[WebSocket] Exception ouverture socket :', e);
      this.#scheduleReconnect();
    }
  }

  #setupSocketListeners() {
    if (!this.#socketTask) return;

    this.#socketTask.onOpen(() => {
      console.log('[WebSocket] ✅ Connexion établie avec succès');
      this.#isConnected = true;
      this.#reconnectAttempts = 0;
      this.#startHeartbeat();
      this.#flushOutbox();
      this.#emit('open');
    });

    this.#socketTask.onMessage((res) => {
      if (res.data === 'pong' || res.data === 'PONG' || res.data === '{"type":"pong"}') {
        clearTimeout(this.#pongTimeoutTimer);
        return;
      }

      let parsed = res.data;
      try {
        parsed = JSON.parse(res.data);
      } catch (_) {}

      if (parsed && typeof parsed === 'object' && parsed.event) {
        this.#emit(parsed.event, parsed.data);
      }
      this.#emit('message', parsed);
    });

    this.#socketTask.onError((err) => {
      console.warn('[WebSocket] ⚠️ Erreur détectée :', err);
      this.#isConnected = false;
      this.#stopHeartbeat();
      this.#emit('error', err);
    });

    this.#socketTask.onClose((res) => {
      console.log('[WebSocket] Fermeture de la connexion :', res);
      this.#isConnected = false;
      this.#stopHeartbeat();
      this.#emit('close', res);

      if (!this.#isManualClose) {
        this.#scheduleReconnect();
      }
    });
  }

  send(data) {
    const payload = typeof data === 'object' ? JSON.stringify(data) : String(data);

    if (this.#isConnected && this.#socketTask) {
      this.#socketTask.send({
        data: payload,
        fail: (err) => {
          console.warn('[WebSocket] Échec envoi, mise en outbox :', err);
          this.#outboxQueue.push(payload);
        }
      });
      return true;
    } else {
      this.#outboxQueue.push(payload);
      return false;
    }
  }

  #flushOutbox() {
    if (this.#outboxQueue.length === 0) return;
    while (this.#outboxQueue.length > 0 && this.#isConnected) {
      const msg = this.#outboxQueue.shift();
      this.#socketTask.send({ data: msg });
    }
  }

  #startHeartbeat() {
    this.#stopHeartbeat();
    this.#heartbeatTimer = setInterval(() => {
      if (!this.#isConnected || !this.#socketTask) return;

      this.#socketTask.send({
        data: JSON.stringify({ type: 'ping', t: Date.now() }),
        fail: () => this.#handleHeartbeatTimeout()
      });

      this.#pongTimeoutTimer = setTimeout(() => {
        this.#handleHeartbeatTimeout();
      }, this.#pongTimeout);
    }, this.#heartbeatInterval);
  }

  #handleHeartbeatTimeout() {
    this.#stopHeartbeat();
    if (this.#socketTask) {
      try {
        this.#socketTask.close({ reason: 'Heartbeat timeout' });
      } catch (_) {}
    }
    this.#scheduleReconnect();
  }

  #stopHeartbeat() {
    clearInterval(this.#heartbeatTimer);
    clearTimeout(this.#pongTimeoutTimer);
    this.#heartbeatTimer = null;
    this.#pongTimeoutTimer = null;
  }

  #scheduleReconnect() {
    if (this.#isManualClose) return;

    if (this.#reconnectAttempts >= this.#maxReconnectAttempts) {
      this.#emit('reconnect_failed');
      return;
    }

    this.#reconnectAttempts++;
    const delay = Math.min(30000, 1000 * Math.pow(2, this.#reconnectAttempts - 1));

    setTimeout(() => {
      if (!this.#isManualClose && !this.#isConnected) {
        this.connect(this.#url, this.#options);
      }
    }, delay);
  }

  on(event, callback) {
    if (!this.#listeners.has(event)) {
      this.#listeners.set(event, new Set());
    }
    this.#listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.#listeners.has(event)) {
      this.#listeners.get(event).delete(callback);
    }
  }

  #emit(event, data) {
    if (this.#listeners.has(event)) {
      this.#listeners.get(event).forEach((cb) => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[WebSocket] Erreur listener '${event}' :`, e);
        }
      });
    }
  }

  disconnect() {
    this.#isManualClose = true;
    this.#stopHeartbeat();
    if (this.#socketTask) {
      try {
        this.#socketTask.close({ reason: 'Manual disconnect' });
      } catch (_) {}
      this.#socketTask = null;
    }
    this.#isConnected = false;
    this.#outboxQueue = [];
  }

  isConnected() {
    return this.#isConnected;
  }
}

export const webSocketService = new WebSocketManager();

