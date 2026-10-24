// ============================================================================
// APP - Main Application Entry Point
// Handles initialization, user data, and global state management
// ============================================================================

import { Bus } from './utils/event/index';
import { nativeService } from './utils/apis/native';

// Noms des états et événements : source unique dans utils/event/keys.js
import { STATE_KEYS, EVENTS } from './utils/event/keys';
import { publishUnreadCounts, getBailleurAccount, isBailleurActivated } from './utils/helpers/store';
import { reconcileFavoritesWithBackend } from './utils/helpers/favorites';
import { storage } from './utils/storage';
import { STORAGE_KEYS } from './utils/constants/index';

// Fréquence de vérification de la fin d'essai ou d'abonnement du bailleur
const ACCESS_CHECK_MS = 30 * 1000;

App({
  /**
   * App launch handler
   * Stores initialization as a promise - pages await it when they need data
   * Pattern: non-blocking launch, no race conditions
   */
  onLaunch() {

    // Bus.setDebug(true);
    Bus.setState(STATE_KEYS.APP_LOADING, true);
    Bus.setState(STATE_KEYS.APP_INITIALIZED, false);

    // Force-update check: mini programs are cached on-device,
    // without this users can be stuck on stale versions indefinitely
    this.checkForUpdates();

    // Network status: track connectivity so pages/services can react
    this.setupNetworkListener();

    // Badge « messages non lus » de l'onglet Messages
    publishUnreadCounts();

    // Store init as a promise - pages can: await getApp().globalData.initPromise
    this.globalData.initPromise = this.initializeApp()
      .catch((error) => {
        console.error('[App] Initialization failed:', error);
      })
      .finally(() => {
        Bus.setState(STATE_KEYS.APP_LOADING, false);
      });
  },

  /**
   * Main initialization flow
   * Customize this for your app's startup sequence:
   * 1. Get user info from native layer
   * 2. Load user data from API
   * 3. Setup background tasks
   */
  async initializeApp() {
    // Step 1: Get user info from native layer (with retry + backoff)
    const userInfos = await nativeService.getUserInfos()
      .catch((error) => {
        console.warn('[App] getUserInfos failed:', error.message);
        return { msisdn: null, fullName: null };
      });

    const { msisdn, fullName } = userInfos;

    if (!msisdn) {
      Bus.emit(EVENTS.USER_NOT_FOUND);
      // Optionally redirect to onboarding:
      // wx.reLaunch({ url: '/pages/onboarding/index' });
      return;
    }

    // Store user info in EventBus
    Bus.setState(STATE_KEYS.USER_DATA, { msisdn, fullName });
    Bus.setState(STATE_KEYS.USER_NAME, fullName);

    // Step 2: Les logements sont encore fictifs (utils/mocks/logements.js).
    // Charger ici les données backend quand l'API Sama Loyer sera prête.

    // Mark app as initialized after user data is ready.
    Bus.setState(STATE_KEYS.APP_INITIALIZED, true);
    Bus.emit(EVENTS.USER_LOADED);

  },

  /**
   * App show handler - resume background tasks
   */
  onShow() {
    if (Bus.getState(STATE_KEYS.APP_INITIALIZED)) {
      // Resume background tasks here (e.g., periodic data refresh)
    }
    this.startAccessWatch();
  },

  /**
   * App hide handler - cleanup timers and listeners
   */
  onHide() {
    // Cleanup background tasks here (e.g., clear intervals)
    this.stopAccessWatch();
  },

  // ==========================================================================
  // ERROR HANDLERS
  // ==========================================================================

  /**
   * Global JS error handler
   * Catches uncaught synchronous errors from any page or component
   * @param {string} msg - Error message
   */
  onError(msg) {
    console.error('[App] Uncaught error:', msg);
    Bus.emit(EVENTS.APP_ERROR, { type: 'error', message: msg });
    // TODO: send to your error monitoring service
  },

  /**
   * Unhandled Promise rejection handler
   * Catches forgotten .catch() on Promises anywhere in the app
   * @param {Object} res - { reason, promise }
   */
  onUnhandledRejection(res) {
    console.error('[App] Unhandled rejection:', res.reason);
    Bus.emit(EVENTS.APP_ERROR, { type: 'unhandledRejection', reason: res.reason });
    // TODO: send to your error monitoring service
  },

  /**
   * 404 handler — user navigates to a page that doesn't exist
   * @param {Object} res - { path, query, isEntryPage }
   */
  onPageNotFound(res) {
    console.warn('[App] Page not found:', res.path);
    wx.redirectTo({
      url: '/pages/common/404/404?path=' + encodeURIComponent(res.path || '')
    });
  },

  // ==========================================================================
  // UPDATE MANAGER
  // ==========================================================================

  /**
   * Checks for a new version and forces an update if available.
   * Mini programs are cached on-device — without this, users may stay
   * on an old version until the cache naturally expires.
   */
  checkForUpdates() {
    if (!wx.getUpdateManager) return; // Not supported in all environments

    const updateManager = wx.getUpdateManager();

    updateManager.onUpdateReady(() => {
      wx.showModal({
         title: 'Mise à jour disponible',
         content: 'Une nouvelle version est prête. Redémarrez l’application pour l’installer.',
        showCancel: false,
        success: () => {
          updateManager.applyUpdate();
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      console.warn('[App] Update download failed');
    });
  },

  // ==========================================================================
  // ACCÈS BAILLEUR
  // ==========================================================================

  /**
   * Vérifie régulièrement l'essai ou l'abonnement du bailleur. S'il se termine
   * pendant que l'appli est ouverte, publie BAILLEUR_ACCESS_LOST : la page
   * bailleur affichée se bloque aussitôt (voir utils/helpers/bailleur-guard.js).
   */
  startAccessWatch() {
    this.stopAccessWatch();
    const check = () => {
      const isBailleur = storage.get(STORAGE_KEYS.USER_ROLE, 'client') === 'bailleur';
      const lost = isBailleur && !!getBailleurAccount() && !isBailleurActivated();
      if (lost && !this._accessLostSent) Bus.emit(EVENTS.BAILLEUR_ACCESS_LOST).catch(() => {});
      this._accessLostSent = lost;
    };
    check();
    this._accessTimer = setInterval(check, ACCESS_CHECK_MS);
  },

  stopAccessWatch() {
    if (this._accessTimer) clearInterval(this._accessTimer);
    this._accessTimer = null;
  },

  // ==========================================================================
  // NETWORK STATUS
  // ==========================================================================

  /**
   * Monitors network connectivity changes and stores status in EventBus.
   * Pages can subscribe to STATE_KEYS.NETWORK_CONNECTED to react to
   * online/offline transitions (e.g., show banner, queue requests).
   */
  setupNetworkListener() {
    // Get initial status
    wx.getNetworkType({
      success: (res) => {
        Bus.setState(STATE_KEYS.NETWORK_TYPE, res.networkType);
        Bus.setState(STATE_KEYS.NETWORK_CONNECTED, res.networkType !== 'none');
      },
    });

    // Listen for changes
    wx.onNetworkStatusChange((res) => {
      Bus.setState(STATE_KEYS.NETWORK_TYPE, res.networkType);
      Bus.setState(STATE_KEYS.NETWORK_CONNECTED, res.isConnected);
      Bus.emit(EVENTS.NETWORK_CHANGE, {
        type: res.networkType,
        connected: res.isConnected,
      });
    });
  },

  /**
   * Global data accessible via getApp().globalData
   */
  globalData: {
    /** @type {EventBus} Event bus for cross-page communication */
    eventBus: Bus,

    /** @type {Promise} Resolves when app initialization completes */
    initPromise: null,

    /** State keys for convenience */
    STATE_KEYS,

    /** Event names for convenience */
    EVENTS,
  },
});
