/**
 * ⚡ Helper d'Action Optimiste Transactionnelle (0ms Latency + Auto Rollback)
 * Permet un retour tactile et visuel instantané avec annulation propre si le serveur échoue.
 */

/**
 * Exécute une modification d'état optimiste avec rollback garanti en cas d'échec API
 * @param {Object} options Configuration de la transaction optimiste
 * @param {Object} options.page Instance de la page (this)
 * @param {Object} options.optimisticData Données à injecter immédiatement dans setData
 * @param {Function} options.serverCall Fonction async exécutant la requête backend
 * @param {Object} [options.rollbackData] Données de restauration (si omis, capture snapshot auto)
 * @param {Function} [options.onSuccess] Callback après confirmation serveur
 * @param {string} [options.errorMessage='L\'action a échoué. Veuillez réessayer.'] Message en cas d'erreur
 * @param {boolean} [options.vibrateOnError=true] Déclenche une vibration haptique en cas d'annulation
 * @returns {Promise<any>} Résultat de la requête serveur
 */
export async function executeOptimisticAction({
  page,
  optimisticData,
  serverCall,
  rollbackData = null,
  onSuccess = null,
  errorMessage = 'L\'action a échoué. Veuillez réessayer.',
  vibrateOnError = true
}) {
  if (!page || typeof page.setData !== 'function') {
    throw new Error('[OptimisticAction] L\'instance page (this) est obligatoire.');
  }

  const autoRollback = {};
  if (!rollbackData) {
    Object.keys(optimisticData).forEach((key) => {
      if (key in page.data) {
        autoRollback[key] = page.data[key];
      }
    });
  }
  const effectiveRollback = rollbackData || autoRollback;

  page.setData(optimisticData);

  try {
    const serverResult = await serverCall();
    if (typeof onSuccess === 'function') {
      onSuccess(serverResult);
    }
    return serverResult;
  } catch (err) {
    console.warn('[OptimisticAction] Échec serveur, déclenchement du Rollback :', err);
    page.setData(effectiveRollback);

    if (vibrateOnError) {
      try {
        wx.vibrateShort({ type: 'medium' });
      } catch (_) {}
    }

    const message = err?.message || errorMessage;
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000
    });

    throw err;
  }
}

