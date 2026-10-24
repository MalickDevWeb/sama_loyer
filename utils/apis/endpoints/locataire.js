// ============================================================================
// SAMA LOYER — ENDPOINTS LOCATAIRE (CLIENT)
// Single Responsibility : Définition immuable des routes REST du domaine Locataire
// ============================================================================

export const LOCATAIRE_ENDPOINTS = Object.freeze({
  // Authentification & Session Max it
  AUTH_MAXIT: '/api/v1/auth/maxit',
  AUTH_REFRESH: '/api/v1/auth/refresh',
  AUTH_LOGOUT: '/api/v1/auth/logout',
  ME: '/api/v1/me',
  ME_UNREAD_COUNTS: '/api/v1/me/unread-counts',

  // Logements & Recherche
  LOGEMENTS: '/api/v1/logements',
  LOGEMENT_DETAIL: (id) => `/api/v1/logements/${id}`,
  LOGEMENT_SLOTS: (id) => `/api/v1/logements/${id}/visit-slots`,
  SEARCH_ASSISTANT: '/api/v1/search/assistant',
  SEARCH_VOICE: '/api/v1/search/voice',

  // Favoris
  FAVORITES: '/api/v1/favorites',
  FAVORITE_ADD: (id) => `/api/v1/favorites/${id}`,
  FAVORITE_REMOVE: (id) => `/api/v1/favorites/${id}`,
  FAVORITES_SYNC: '/api/v1/favorites/sync',
  ME_FAVORIS: '/api/v1/me/favoris',

  // Visites
  VISITES: '/api/v1/visites',
  VISITE_CREATE: '/api/v1/visites',
  VISITE_CANCEL: (id) => `/api/v1/visites/${id}/cancel`,

  // Loyers & Paiements Orange Money (tranches)
  LOYERS: '/api/v1/loyers',
  LOYER_DETAIL: (id) => `/api/v1/loyers/${id}`,
  LOYER_PAY: (id) => `/api/v1/loyers/${id}/pay`,
  PAYMENT_DETAIL: (id) => `/api/v1/payments/${id}`,

  // Quittances de loyer
  QUITTANCES: '/api/v1/quittances',
  QUITTANCE_DETAIL: (id) => `/api/v1/quittances/${id}`,
  QUITTANCE_PDF: (id) => `/api/v1/quittances/${id}/pdf`,
  QUITTANCE_VERIFY: (code) => `/api/v1/quittances/verify/${code}`,

  // Contrats de location
  CONTRATS: '/api/v1/contrats',
  CONTRAT_DETAIL: (id) => `/api/v1/contrats/${id}`,
  CONTRAT_SIGN: (id) => `/api/v1/contrats/${id}/sign`,
  CONTRAT_PDF: (id) => `/api/v1/contrats/${id}/pdf`,
  CONTRAT_NOTICE: (id) => `/api/v1/contrats/${id}/notice`,

  // Messagerie & Conversations
  CONVERSATIONS: '/api/v1/conversations',
  CONVERSATION_MESSAGES: (id) => `/api/v1/conversations/${id}/messages`,
  CONVERSATION_READ: (id) => `/api/v1/conversations/${id}/read`,
});
