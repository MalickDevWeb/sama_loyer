// ============================================================================
// SAMA LOYER — ENDPOINTS TRANSVERSES & COMMUNS
// Routes publiques ou partagées entre locataire et bailleur :
//   - Référentiels (zones, commodités)
//   - Upload de fichiers et documents KYC
//   - Signalements et support
//   - Santé du système & webhooks de notification Orange Money
// ============================================================================

export const COMMON_ENDPOINTS = {
  ZONES: '/api/v1/zones',
  AMENITIES: '/api/v1/amenities',
  UPLOADS: '/api/v1/uploads',
  REPORTS: '/api/v1/reports',
  HEALTH: '/api/v1/health',
  WEBHOOKS_MAXIT: '/api/v1/webhooks/maxit',
};
