/**
 * 🎨 Helpers Universels de Page & Rendu Visuel
 * waitForNextPaint, Toasts et indicateurs conformes WeChat Mini-Program
 */

/**
 * Garantit que l'état visuel passé en paramètre est physiquement peint par le thread
 * WebView avant qu'une tâche JS bloquante ou un appel API lourd ne s'exécute.
 * @param {Object} page Instance de la page (this)
 * @param {Object} [state={}] État à injecter dans setData
 * @returns {Promise<void>}
 */
export const waitForNextPaint = (page, state = {}) =>
  new Promise((resolve) => {
    const afterSetData = () => {
      if (typeof wx !== 'undefined' && typeof wx.nextTick === 'function') {
        wx.nextTick(resolve);
        return;
      }
      setTimeout(resolve, 0);
    };

    if (page && typeof page.setData === 'function') {
      page.setData(state, afterSetData);
      return;
    }

    afterSetData();
  });

/**
 * Affiche un toast d'alerte ou de confirmation
 * @param {string} message 
 * @param {'success'|'error'|'none'} [type='none'] 
 */
export const showToast = (message, type = 'none') => {
  const iconMap = {
    success: 'success',
    error: 'none',
    none: 'none'
  };

  wx.showToast({
    title: message,
    icon: iconMap[type] || 'none'
  });
};

/**
 * Affiche le masque de chargement natif
 * @param {string} [message='Chargement...'] 
 */
export const showLoading = (message = 'Chargement...') => {
  wx.showLoading({ title: message, mask: true });
};

/**
 * Masque le chargement natif
 */
export const hideLoading = () => {
  wx.hideLoading();
};

/**
 * Met à jour la visibilité de la Custom TabBar officielle et émet l'événement global
 * @param {Object} page Instance de la page (this)
 * @param {boolean} hidden État masqué
 * @param {Object} [eventBus] Bus d'événements facultatif
 */
export const setPageTabBarHidden = (page, hidden, eventBus) => {
  const isHidden = Boolean(hidden);
  const tabBar = page && typeof page.getTabBar === 'function' ? page.getTabBar() : null;

  if (tabBar && typeof tabBar.setData === 'function') {
    tabBar.setData({ hidden: isHidden });
  }

  if (eventBus && typeof eventBus.emit === 'function') {
    eventBus.emit('tabbar:set_hidden', { hidden: isHidden });
  }
};

/**
 * Active ou désactive la protection anti-capture d'écran Max It / TCMPP avec gestion défensive
 * @param {Object} sdk Instance du SDK (@sonatel-os/maxit-mini-sdk)
 * @param {boolean} enabled Activer ou désactiver
 * @returns {Promise<void>}
 */
export const setScreenProtection = (sdk, enabled) => {
  if (!sdk || !sdk.screen || typeof sdk.screen.protect !== 'function') {
    return Promise.resolve();
  }

  return sdk.screen.protect(Boolean(enabled)).catch((error) => {
    console.warn('[ScreenProtection] Échec de mise à jour de la protection :', error);
  });
};

/**
 * Réessaye une opération asynchrone avec backoff exponentiel
 * @param {Function} fn Fonction asynchrone à exécuter
 * @param {Object} [options] Options de retry
 * @param {number} [options.maxRetries=2] Nombre d'essais maximum
 * @param {number} [options.delayMs=1500] Délai initial en millisecondes
 * @param {Object} [options.page] Instance de la page pour le feedback UI
 * @returns {Promise<any>}
 */
export const retryAsync = async (fn, options = {}) => {
  const { maxRetries = 2, delayMs = 1500, page } = options;
  let lastError;

  const updateUI = (data) => {
    if (page && typeof page.setData === 'function') page.setData(data);
  };

  updateUI({ isRetrying: true, retryStatus: '' });

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        updateUI({ retryStatus: `Tentative ${attempt}/${maxRetries}...` });
      }

      const result = await fn();
      updateUI({ isRetrying: false, retryStatus: '' });
      return result;
    } catch (error) {
      lastError = error;
      console.warn(`[RetryAsync] Tentative ${attempt + 1}/${maxRetries + 1} échouée :`, error && error.message);

      if (attempt < maxRetries) {
        updateUI({ retryStatus: `Échec, nouvel essai dans ${delayMs / 1000}s...` });
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  updateUI({ isRetrying: false, retryStatus: (lastError && lastError.message) || 'Échec opération' });
  throw lastError;
};


