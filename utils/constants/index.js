// ============================================================================
// APPLICATION CONSTANTS — SAMA LOYER
// Centralized configuration values
// ============================================================================

export const __DEV__ = true;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'app_access_token',
  TOKEN_EXPIRY: 'app_token_expiry',
  USER_ROLE: 'sama_user_role', // 'client' | 'bailleur'
  FAVORITES: 'sama_favorites',
  VISITES: 'sama_visites',
  LOGEMENTS: 'sama_logements',
  RENTED_HOMES: 'sama_rented_homes',
  CONTRATS: 'sama_contrats',
  LOCATAIRES: 'sama_bailleur_locataires',
  CONVERSATIONS: 'sama_conversations',
  BAILLEUR_CONVERSATIONS: 'sama_bailleur_conversations',
  ACTIVE_TAB: 'sama_active_tab',
  RENT_PAID: 'sama_rent_paid', // { [logementId]: true } — loyer du mois payé
  USER_PROFILE: 'sama_user_profile', // { fullName, phone, email, job, city }
  PROFILE_PREFS: 'sama_profile_prefs', // { notifs: { msg, visit, new, price }, lang }
  BAILLEUR_PAYMENTS: 'sama_bailleur_payments', // paiements Max it du bailleur (abonnement, boosts)
  BAILLEUR_ACCOUNT: 'sama_bailleur_account', // { fullName, phone, city, plan: 'trial'|'pro', activatedAt, expiresAt } — nom et numéro repris du compte Max it
  IMAGE_CACHE: 'tc-image-cache',
};

// ============================================================================
// AUTH / HTTP — utilisés par utils/apis/auth.js et utils/apis/http.js
// ============================================================================

export const AUTH_CONFIG = {
  /** Refresh token before expiry (milliseconds) */
  REFRESH_BUFFER_MS: 5000,

  /** Default token expiry if not provided (seconds) */
  DEFAULT_EXPIRY_SEC: 200,

  /** OAuth2 grant type */
  GRANT_TYPE: 'client_credentials',
};

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
// NAVIGATION TABS — MODE CLIENT (LOCATAIRE)
// ============================================================================
export const CLIENT_TABS = [
  {
    id: 'home',
    label: 'Chercher',
    url: '/pages/client/home/home',
  },
  {
    id: 'loyers',
    label: 'Mes loyers',
    badge: '2',
    url: '/pages/client/loyers/loyers',
  },
  {
    id: 'visites',
    label: 'Visites',
    url: '/pages/client/visites/visites',
  },
  {
    id: 'messages',
    label: 'Messages',
    badge: '3',
    url: '/pages/client/messages/messages',
  },
  {
    id: 'profile',
    label: 'Profil',
    url: '/pages/client/profile/profile',
  },
];

// ============================================================================
// NAVIGATION TABS — MODE BAILLEUR (PROPRIÉTAIRE)
// ============================================================================
export const BAILLEUR_TABS = [
  {
    id: 'b-home',
    label: 'Accueil',
    url: '/pages/bailleur/home/home',
  },
  {
    id: 'b-annonces',
    label: 'Annonces',
    url: '/pages/bailleur/annonces/annonces',
  },
  {
    id: 'b-locataires',
    label: 'Locataires',
    badge: '2',
    url: '/pages/bailleur/locataires/locataires',
  },
  {
    id: 'b-messages',
    label: 'Messages',
    badge: '4',
    url: '/pages/bailleur/messages/messages',
  },
  {
    id: 'b-profil',
    label: 'Profil',
    url: '/pages/bailleur/profil/profil',
  },
];

// Default fallback export
export const MAIN_TABS = CLIENT_TABS;
