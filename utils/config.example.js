// ============================================================================
// SAMA LOYER — CONFIGURATION D'EXEMPLE
// Copiez ce fichier sous utils/config.js pour configurer votre environnement :
//   cp utils/config.example.js utils/config.js
// ============================================================================

export const config = {
  /** URL de base de l'API REST Sama Loyer */
  BASE_URL: 'https://api.samaloyer.sn/api/v1',

  /** Endpoint d'authentification OAuth2 Max it */
  AUTH_URL: '/auth/token',

  /** Identifiant client Mini-Program */
  CLIENT_ID: 'sama-loyer-maxit',

  /** Clé secrète (gérée par le BFF Tencent Cloud / Max it Gateway) */
  CLIENT_SECRET: '',

  /** Type d'autorisation OAuth2 */
  GRANT_TYPE: 'client_credentials',
};

