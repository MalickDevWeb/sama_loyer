const listeners = {};

export const Bus = {
  on(event, callback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
    return () => {
      listeners[event] = (listeners[event] || []).filter((cb) => cb !== callback);
    };
  },

  emit(event, data) {
    const list = listeners[event] || [];
    list.forEach((cb) => {
      try {
        cb(data);
      } catch (err) {
        console.error(`[Bus] Erreur listener ${event} :`, err);
      }
    });
  }
};

