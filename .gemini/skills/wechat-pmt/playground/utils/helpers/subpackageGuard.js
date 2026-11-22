/**
 * 🛡️ Bootstrapper de Sous-Paquet Indépendant (Deep Link & QR Code Guard)
 * Sécurise l'arrivée directe sur une page de sous-paquet sans passer par app.js
 * Zéro dépendance npm - Compatible pur WeChat Mini-Program & TCMPP
 */

/**
 * Attend que l'application et les prérequis globaux (Auth, SDK) soient prêts
 * @param {number} [timeoutMs=5000] Délai d'attente maximum
 * @returns {Promise<boolean>} True si l'application est opérationnelle
 */
export async function ensureAppReady(timeoutMs = 5000) {
  const app = getApp();

  // 1. Si app.js expose une Promise globale readyPromise
  if (app && app.readyPromise) {
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('[SubpackageGuard] Timeout initialisation globale')), timeoutMs)
    );
    try {
      await Promise.race([app.readyPromise, timeout]);
      return true;
    } catch (e) {
      console.warn('[SubpackageGuard] ReadyPromise a expiré ou échoué :', e);
    }
  }

  // 2. Fallback de sondage (vérifie si auth_token ou indicateur est initialisé)
  const startTime = Date.now();
  while (Date.now() - startTime < timeoutMs) {
    if (app && (app.isAppReady || wx.getStorageSync('auth_token'))) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 100));
  }

  console.warn('[SubpackageGuard] Prérequis non validés dans les temps, bascule en mode autonome');
  return false;
}

/**
 * Wrapper de page pour sous-paquet avec écran d'attente automatique
 * @param {Object} pageDefinition Définition standard de Page({ ... })
 * @returns {Object} Page sécurisée
 */
export function createSubpackagePage(pageDefinition) {
  const originalOnLoad = pageDefinition.onLoad;

  return {
    ...pageDefinition,

    data: {
      isBootstrapping: true,
      ...(pageDefinition.data || {})
    },

    async onLoad(options) {
      // 1. Affichage du masque d'attente
      this.setData({ isBootstrapping: true });

      // 2. Attente de la préparation de l'application globale
      await ensureAppReady(5000);

      this.setData({ isBootstrapping: false });

      // 3. Exécution de la logique métier réelle
      if (typeof originalOnLoad === 'function') {
        originalOnLoad.call(this, options);
      }
    }
  };
}

