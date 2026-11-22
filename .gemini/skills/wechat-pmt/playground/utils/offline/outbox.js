import { Bus } from '../bus/index';

const STORAGE_KEY = 'playground_offline_outbox';
const handlers = {};
let isFlushing = false;

function getQueue() {
  try {
    const raw = wx.getStorageSync(STORAGE_KEY);
    return Array.isArray(raw) ? raw : [];
  } catch (e) {
    return [];
  }
}

function saveQueue(queue) {
  try {
    wx.setStorageSync(STORAGE_KEY, queue.slice(0, 50));
  } catch (e) {
    console.warn('[Outbox] Erreur sauvegarde :', e);
  }
}

export const Outbox = {
  registerHandler(type, fn) {
    handlers[type] = fn;
  },

  enqueue(type, payload) {
    const queue = getQueue();
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type,
      payload,
      createdAt: Date.now()
    };
    queue.push(item);
    saveQueue(queue);

    Bus.emit('OUTBOX_COUNT_CHANGED', queue.length);
    return item.id;
  },

  getPendingCount() {
    return getQueue().length;
  },

  async flush() {
    if (isFlushing) return;
    const queue = getQueue();
    if (queue.length === 0) return;

    isFlushing = true;
    const remaining = [];

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      const handler = handlers[item.type];
      if (handler) {
        try {
          await handler(item.payload, item.id);
        } catch (err) {
          remaining.push(item);
        }
      }
    }

    saveQueue(remaining);
    isFlushing = false;
    Bus.emit('OUTBOX_COUNT_CHANGED', remaining.length);
  },

  initAutoSync() {
    wx.onNetworkStatusChange((res) => {
      if (res.isConnected) {
        console.log('[Outbox] Réseau rétabli -> Synchronisation automatique...');
        Outbox.flush();
      }
    });
  }
};

