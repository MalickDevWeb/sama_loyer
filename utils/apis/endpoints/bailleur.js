// ============================================================================
// SAMA LOYER — ENDPOINTS BAILLEUR (PROPRIÉTAIRE)
// Single Responsibility : Définition immuable des routes REST du domaine Bailleur
// ============================================================================

export const BAILLEUR_ENDPOINTS = Object.freeze({
  // Compte, Abonnement & KYC
  COMPTE: '/api/v1/bailleur/compte',
  COMPTE_ACTIVATION: '/api/v1/bailleur/compte/activation',
  ABONNEMENT_RENOUVELLEMENT: '/api/v1/bailleur/abonnement/renouvellement',
  PAIEMENTS: '/api/v1/bailleur/paiements',
  VERIFICATION: '/api/v1/bailleur/verification',
  DASHBOARD: '/api/v1/bailleur/dashboard',

  // Gestion des annonces
  ANNONCES: '/api/v1/bailleur/annonces',
  BAILLEUR_ANNONCES: '/api/v1/bailleur/annonces', // alias rétrocompatible
  ANNONCE_DETAIL: (id) => `/api/v1/bailleur/annonces/${id}`,
  ANNONCE_CONFIRM_AVAILABILITY: (id) => `/api/v1/bailleur/annonces/${id}/confirm-availability`,
  ANNONCE_HIDE: (id) => `/api/v1/bailleur/annonces/${id}/hide`,
  ANNONCE_UNHIDE: (id) => `/api/v1/bailleur/annonces/${id}/unhide`,
  ANNONCE_BOOSTS: (id) => `/api/v1/bailleur/annonces/${id}/boosts`,
  ANNONCE_HORAIRES: (id) => `/api/v1/bailleur/annonces/${id}/horaires`,

  // Visites côté bailleur
  VISITES: '/api/v1/bailleur/visites',
  VISITE_ACCEPT: (id) => `/api/v1/bailleur/visites/${id}/accept`,
  VISITE_REJECT: (id) => `/api/v1/bailleur/visites/${id}/reject`,

  // Locataires, Candidats & Encaissement espèces
  LOCATAIRES: '/api/v1/bailleur/locataires',
  BAILLEUR_LOCATAIRES: '/api/v1/bailleur/locataires', // alias rétrocompatible
  TENANT_SEARCH: '/api/v1/bailleur/tenant-search',
  BAILLEUR_TENANT_SEARCH: '/api/v1/bailleur/tenant-search', // alias rétrocompatible
  CASH_PAYMENT: (loyerId) => `/api/v1/bailleur/echeances/${loyerId}/cash-payments`,
  CONTRAT_NOTICE: (contratId) => `/api/v1/bailleur/contrats/${contratId}/notice`,
  DEPOSIT_REFUND: (contratId) => `/api/v1/bailleur/contrats/${contratId}/deposit-refund`,

  // Conformité & Pièces réglementaires
  SETTINGS_COMPLIANCE: '/api/v1/settings/compliance',
  COMPLIANCE: '/api/v1/settings/compliance', // alias court
});

