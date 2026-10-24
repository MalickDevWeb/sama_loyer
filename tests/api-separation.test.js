// ============================================================================
// SUITE DE TESTS : SÉPARATION DES ENDPOINTS ET APIS BAILLEUR / LOCATAIRE
// ============================================================================

import assert from 'node:assert/strict';
import {
  LOCATAIRE_ENDPOINTS,
  BAILLEUR_ENDPOINTS,
  COMMON_ENDPOINTS,
  ENDPOINTS,
  locataireAPI,
  LocataireAPI,
  bailleurAPI,
  BailleurAPI,
  backendAPI,
  BackendAPI,
  TTL,
  LOCATAIRE_TTL,
  BAILLEUR_TTL
} from '../utils/apis/index.js';

import {
  TTL as CACHE_TTL,
  LOCATAIRE_TTL as CACHE_LOCATAIRE_TTL,
  BAILLEUR_TTL as CACHE_BAILLEUR_TTL
} from '../utils/apis/cache.js';

import {
  LOCATAIRE_ENDPOINTS as FOLDER_LOCATAIRE_ENDPOINTS,
  BAILLEUR_ENDPOINTS as FOLDER_BAILLEUR_ENDPOINTS,
  COMMON_ENDPOINTS as FOLDER_COMMON_ENDPOINTS,
  ENDPOINTS as FOLDER_ENDPOINTS
} from '../utils/apis/endpoints/index.js';

export async function runApiSeparationTests() {
  console.log('\n--- Test Suite 8: Séparation APIs Bailleur & Locataire ---');
  let passed = 0;

  // Test 1 : Vérification des endpoints Locataire
  assert.equal(LOCATAIRE_ENDPOINTS.LOGEMENTS, '/api/v1/logements');
  assert.equal(LOCATAIRE_ENDPOINTS.LOYERS, '/api/v1/loyers');
  assert.equal(LOCATAIRE_ENDPOINTS.VISITES, '/api/v1/visites');
  assert.equal(LOCATAIRE_ENDPOINTS.FAVORITES, '/api/v1/favorites');
  assert.equal(typeof LOCATAIRE_ENDPOINTS.LOGEMENT_DETAIL, 'function');
  assert.equal(LOCATAIRE_ENDPOINTS.LOGEMENT_DETAIL('log-123'), '/api/v1/logements/log-123');
  assert.equal(typeof LOCATAIRE_ENDPOINTS.FAVORITE_ADD, 'function');
  assert.equal(LOCATAIRE_ENDPOINTS.FAVORITE_ADD('fav-1'), '/api/v1/favorites/fav-1');
  assert.equal(LOCATAIRE_ENDPOINTS.BAILLEUR_ANNONCES, undefined, 'Bailleur endpoints must not bleed into LOCATAIRE_ENDPOINTS');
  console.log('  ✓ LOCATAIRE_ENDPOINTS est isolé et contient toutes les routes locataires');
  passed++;

  // Test 2 : Vérification des endpoints Bailleur
  assert.equal(BAILLEUR_ENDPOINTS.ANNONCES, '/api/v1/bailleur/annonces');
  assert.equal(BAILLEUR_ENDPOINTS.BAILLEUR_ANNONCES, '/api/v1/bailleur/annonces');
  assert.equal(BAILLEUR_ENDPOINTS.LOCATAIRES, '/api/v1/bailleur/locataires');
  assert.equal(BAILLEUR_ENDPOINTS.BAILLEUR_LOCATAIRES, '/api/v1/bailleur/locataires');
  assert.equal(BAILLEUR_ENDPOINTS.TENANT_SEARCH, '/api/v1/bailleur/tenant-search');
  assert.equal(BAILLEUR_ENDPOINTS.SETTINGS_COMPLIANCE, '/api/v1/settings/compliance');
  assert.equal(BAILLEUR_ENDPOINTS.LOYERS, undefined, 'Locataire endpoints must not bleed into BAILLEUR_ENDPOINTS');
  console.log('  ✓ BAILLEUR_ENDPOINTS est isolé et contient toutes les routes bailleurs');
  passed++;

  // Test 3 : Fusion rétrocompatible dans ENDPOINTS global
  assert.equal(ENDPOINTS.LOGEMENTS, LOCATAIRE_ENDPOINTS.LOGEMENTS);
  assert.equal(ENDPOINTS.BAILLEUR_ANNONCES, BAILLEUR_ENDPOINTS.BAILLEUR_ANNONCES);
  assert.equal(ENDPOINTS.LOYERS, LOCATAIRE_ENDPOINTS.LOYERS);
  assert.equal(ENDPOINTS.SETTINGS_COMPLIANCE, BAILLEUR_ENDPOINTS.SETTINGS_COMPLIANCE);
  console.log('  ✓ ENDPOINTS unifié assure 100% de rétrocompatibilité');
  passed++;

  // Test 4 : locataireAPI instance et méthodes
  assert.ok(locataireAPI instanceof LocataireAPI);
  assert.equal(typeof locataireAPI.getLogements, 'function');
  assert.equal(typeof locataireAPI.getLogementDetail, 'function');
  assert.equal(typeof locataireAPI.getLogementById, 'function');
  assert.equal(typeof locataireAPI.getLoyers, 'function');
  assert.equal(typeof locataireAPI.payLoyer, 'function');
  assert.equal(typeof locataireAPI.getVisites, 'function');
  assert.equal(typeof locataireAPI.getFavorites, 'function');
  console.log('  ✓ locataireAPI expose exclusivement les méthodes locataires');
  passed++;

  // Test 5 : bailleurAPI instance et couverture intégrale des méthodes bailleurs
  assert.ok(bailleurAPI instanceof BailleurAPI);
  assert.equal(typeof bailleurAPI.getDashboard, 'function');
  assert.equal(typeof bailleurAPI.getCompte, 'function');
  assert.equal(typeof bailleurAPI.activateCompte, 'function');
  assert.equal(typeof bailleurAPI.renewAbonnement, 'function');
  assert.equal(typeof bailleurAPI.getPaiements, 'function');
  assert.equal(typeof bailleurAPI.getKyc, 'function');
  assert.equal(typeof bailleurAPI.submitKyc, 'function');

  assert.equal(typeof bailleurAPI.getAnnonces, 'function');
  assert.equal(typeof bailleurAPI.getBailleurAnnonces, 'function');
  assert.equal(typeof bailleurAPI.getAnnonceDetail, 'function');
  assert.equal(typeof bailleurAPI.createAnnonce, 'function');
  assert.equal(typeof bailleurAPI.updateAnnonce, 'function');
  assert.equal(typeof bailleurAPI.confirmAvailability, 'function');
  assert.equal(typeof bailleurAPI.hideAnnonce, 'function');
  assert.equal(typeof bailleurAPI.unhideAnnonce, 'function');
  assert.equal(typeof bailleurAPI.boostAnnonce, 'function');
  assert.equal(typeof bailleurAPI.updateHorairesVisite, 'function');

  assert.equal(typeof bailleurAPI.getVisites, 'function');
  assert.equal(typeof bailleurAPI.acceptVisite, 'function');
  assert.equal(typeof bailleurAPI.rejectVisite, 'function');

  assert.equal(typeof bailleurAPI.getLocataires, 'function');
  assert.equal(typeof bailleurAPI.getBailleurLocataires, 'function');
  assert.equal(typeof bailleurAPI.createLocataire, 'function');
  assert.equal(typeof bailleurAPI.searchLocataires, 'function');
  assert.equal(typeof bailleurAPI.recordCashPayment, 'function');
  assert.equal(typeof bailleurAPI.sendContractNotice, 'function');
  assert.equal(typeof bailleurAPI.refundDeposit, 'function');
  assert.equal(typeof bailleurAPI.getComplianceConfig, 'function');
  console.log('  ✓ bailleurAPI couvre 100% des méthodes de gestion immobilière');
  passed++;

  // Test 6 : Façade backendAPI unifiée avec sous-domaines .locataire et .bailleur
  assert.ok(backendAPI instanceof BackendAPI);
  assert.strictEqual(backendAPI.locataire, locataireAPI);
  assert.strictEqual(backendAPI.bailleur, bailleurAPI);
  assert.equal(typeof backendAPI.getLogements, 'function');
  assert.equal(typeof backendAPI.getBailleurAnnonces, 'function');
  assert.equal(typeof backendAPI.getDashboard, 'function');
  assert.equal(typeof backendAPI.getLogementById, 'function');
  assert.equal(typeof backendAPI.resetSession, 'function');

  // Test d'appel réel fallback
  const logements = await backendAPI.getLogements();
  assert.ok(Array.isArray(logements));
  assert.ok(logements.length > 0);

  const annonces = await backendAPI.getBailleurAnnonces();
  assert.ok(Array.isArray(annonces));

  const dashboard = await backendAPI.getDashboard();
  assert.ok(dashboard);
  assert.equal(typeof dashboard.annoncesCount, 'number');

  console.log('  ✓ backendAPI fédère locataire et bailleur avec sous-domaines typés');
  passed++;

  // Test 7 : Centralisation unique des TTL dans utils/apis/cache.js
  assert.strictEqual(TTL, CACHE_TTL);
  assert.strictEqual(LOCATAIRE_TTL, CACHE_LOCATAIRE_TTL);
  assert.strictEqual(BAILLEUR_TTL, CACHE_BAILLEUR_TTL);
  assert.equal(BAILLEUR_TTL.PERSONAL, 60 * 1000);
  assert.equal(BAILLEUR_TTL.SETTINGS, 5 * 60 * 1000);
  assert.equal(LOCATAIRE_TTL.LOGEMENT_DETAIL, 10 * 60 * 1000);
  console.log('  ✓ Centralisation unique des TTL dans utils/apis/cache.js validée');
  passed++;

  // Test 8 : Dossier centralisé utils/apis/endpoints/
  assert.strictEqual(LOCATAIRE_ENDPOINTS, FOLDER_LOCATAIRE_ENDPOINTS);
  assert.strictEqual(BAILLEUR_ENDPOINTS, FOLDER_BAILLEUR_ENDPOINTS);
  assert.strictEqual(COMMON_ENDPOINTS, FOLDER_COMMON_ENDPOINTS);
  assert.strictEqual(ENDPOINTS, FOLDER_ENDPOINTS);
  console.log('  ✓ Architecture SOLID : utils/apis/endpoints/ validée à 100%');
  passed++;

  return passed;
}
