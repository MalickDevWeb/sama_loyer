// ============================================================================
// REGISTRE CENTRAL DES ENDPOINTS SAMA LOYER
// Regroupe et ré-exporte l'ensemble des routes API du backend :
//   - LOCATAIRE_ENDPOINTS (utils/apis/endpionts/locataire.js)
//   - BAILLEUR_ENDPOINTS  (utils/apis/endpionts/bailleur.js)
//   - COMMON_ENDPOINTS    (utils/apis/endpionts/common.js)
//   - ENDPOINTS           (dictionnaire complet unifié)
// ============================================================================

import { LOCATAIRE_ENDPOINTS } from './locataire.js';
import { BAILLEUR_ENDPOINTS } from './bailleur.js';
import { COMMON_ENDPOINTS } from './common.js';

export { LOCATAIRE_ENDPOINTS } from './locataire.js';
export { BAILLEUR_ENDPOINTS } from './bailleur.js';
export { COMMON_ENDPOINTS } from './common.js';

/**
 * Dictionnaire complet unifié de tous les endpoints de l'application
 */
export const ENDPOINTS = {
  ...COMMON_ENDPOINTS,
  ...LOCATAIRE_ENDPOINTS,
  ...BAILLEUR_ENDPOINTS,
};

export default ENDPOINTS;

