// ============================================================================
// APPLICATION CONSTANTS
// Centralized configuration values - No magic numbers/strings
// ============================================================================

// ============================================================================
// ENVIRONMENT
// ============================================================================

/**
 * Development mode flag
 * @readonly
 * @type {boolean}
 */
export const __DEV__ = true; // Set to false for production

// ============================================================================
// STORAGE KEYS
// ============================================================================

/**
 * Local storage key names
 * @readonly
 * @enum {string}
 */
export const STORAGE_KEYS = {
  /** OAuth access token */
  ACCESS_TOKEN: 'app_access_token',

  /** Token expiry timestamp */
  TOKEN_EXPIRY: 'app_token_expiry',

  /** Cached user data */
  USER_DATA: 'app_user_data',

  /** User role ('client' | 'bailleur') */
  USER_ROLE: 'sama_user_role',

  /** Favorites list */
  FAVORITES: 'sama_favorites',
};

// ============================================================================
// AUTH CONFIGURATION
// ============================================================================

/**
 * Authentication constants
 * @readonly
 */
export const AUTH_CONFIG = {
  /** Refresh token before expiry (milliseconds) */
  REFRESH_BUFFER_MS: 5000,

  /** Default token expiry if not provided (seconds) */
  DEFAULT_EXPIRY_SEC: 200,

  /** OAuth2 grant type */
  GRANT_TYPE: 'client_credentials',
};

// ============================================================================
// HTTP CONFIGURATION
// ============================================================================

/**
 * HTTP client constants
 * @readonly
 */
export const HTTP_CONFIG = {
  /** Default request timeout (milliseconds) */
  DEFAULT_TIMEOUT_MS: 30000,

  /** Session ID prefix for tracking */
  SESSION_PREFIX: 'APP',

  /** Custom header for session tracking */
  HEADER_CLIENT_REF: 'X-Client-Ref',

  /** Custom header for request tracking */
  HEADER_REQUEST_ID: 'X-Request-Id',
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

/**
 * User-facing error messages
 * @readonly
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Connexion impossible. Vérifiez votre réseau puis réessayez.',
  AUTH_FAILED: 'La connexion a échoué. Réessayez.',
  NOT_FOUND: 'La ressource demandée est introuvable.',
  SERVER_ERROR: 'Le service rencontre un problème. Réessayez plus tard.',
  UNKNOWN_ERROR: 'Une erreur inattendue est survenue.',
  TIMEOUT: 'La requête a expiré. Réessayez.',
  FEATURE_UNAVAILABLE: 'Cette fonctionnalité n’est pas encore disponible.',
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

/**
 * User-facing success messages
 * @readonly
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Enregistré avec succès.',
  UPDATED: 'Mis à jour avec succès.',
  DELETED: 'Supprimé avec succès.',
  SUBMITTED: 'Envoyé avec succès.',
};

// ============================================================================
// MAIN NAVIGATION (SAMA LOGEMENT)
// ============================================================================

/**
 * Main app tabs used by the custom tab bar.
 * @readonly
 * @type {Array<{id: string, label: string, iconImage: string, url: string}>}
 */
export const MAIN_TABS = [
  {
    id: 'home',
    label: 'Chercher',
    iconImage: '/assets/icons/home.png',
    url: '/pages/home/home',
  },
  {
    id: 'favorites',
    label: 'Favoris',
    iconImage: '/assets/icons/favoris.png',
    url: '/pages/favoris/favoris',
  },
  {
    id: 'voyages',
    label: 'Messages',
    iconImage: '/assets/icons/voyage.png',
    url: '/pages/voyage/voyage',
  },
  {
    id: 'profile',
    label: 'Profil',
    iconImage: '/assets/icons/explore.png',
    url: '/pages/index/index',
  },
];
