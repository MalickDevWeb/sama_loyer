// ============================================================================
// REGISTRE CENTRAL DES ENDPOINTS SAMA LOYER
// Single Responsibility : Assemblage et exposition des contrats d'endpoints
// Interface Segregation : Chaque domaine expose son contrat indépendant
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
export const ENDPOINTS = Object.freeze({
  ...COMMON_ENDPOINTS,
  ...LOCATAIRE_ENDPOINTS,
  ...BAILLEUR_ENDPOINTS,
});

export default ENDPOINTS;
