// ============================================================================
// TESTS — SYSTÈME COMPLET DE COLOCATION & RÉSERVATION MULTI-GROUPES
// Validation rigoureuse des règles du PROMPT MAÎTRE SAMA LOYER :
// 1. Isolation absolue des genres (aucun mélange libre).
// 2. Validation bilatérale du mode Couples (deux comptes distincts confirmés).
// 3. Cohabitation de groupes indépendants sans fusion dans une chambre partagée.
// 4. Verrouillage atomique concurrent 15 min (Place Locks).
// 5. Rachat exclusif solo & Remboursement 100% sans frais des réservations partielles.
// 6. Gestion des chambres incomplètes (échéance et annulation/remboursement).
// ============================================================================

import assert from 'assert';
import {
  COLOC_GENDER_POLICIES,
  COLOC_RENTAL_MODES,
  COLOC_HABIT_POLICIES,
  COLOC_INCOMPLETE_POLICIES,
  PLACE_STATUS,
  validateGenderCompatibility,
  validateCoupleDuo,
  validateLivingHabits,
  validateMultiGroupCapacity,
  createPlaceLock,
  isLockExpired,
  executeSoloPrivatization,
  resolveIncompleteRoom
} from '../utils/helpers/coloc-engine.js';

export async function runColocSystemTests() {
  console.log('\n--- Test Suite 9: Système de Colocation & Groupes (Prompt Maître) ---');
  let passed = 0;

  // --------------------------------------------------------------------------
  // TEST 1 : Isolation absolue des genres
  // --------------------------------------------------------------------------
  // Chambre Hommes uniquement
  const maleProfile1 = { id: 'u1', name: 'Moussa Diop', gender: 'HOMME' };
  const maleProfile2 = { id: 'u2', name: 'Cheikh Ndiaye', gender: 'M' };
  const femaleProfile1 = { id: 'u3', name: 'Fatou Sow', gender: 'FEMME' };

  // Succès : 2 hommes dans chambre Hommes
  const maleCheck = validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [maleProfile1, maleProfile2]);
  assert.equal(maleCheck.compatible, true);
  passed++;
  console.log('  ✓ Isolation des genres : Hommes acceptés dans chambre HOMMES_UNIQUEMENT');

  // Rejet : Femme dans chambre Hommes
  assert.throws(() => {
    validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [maleProfile1, femaleProfile1]);
  }, /GENRE_INCOMPATIBLE/);
  passed++;
  console.log('  ✓ Isolation des genres : Rejet strict d\'un mélange mixte dans chambre Hommes');

  // Rejet : Homme dans chambre Femmes
  assert.throws(() => {
    validateGenderCompatibility(COLOC_GENDER_POLICIES.FEMMES_UNIQUEMENT, [maleProfile1]);
  }, /GENRE_INCOMPATIBLE/);
  passed++;
  console.log('  ✓ Isolation des genres : Rejet strict d\'un homme dans chambre Femmes');

  // --------------------------------------------------------------------------
  // TEST 2 : Validation bilatérale du mode Couples (Mutual Opt-in)
  // --------------------------------------------------------------------------
  const partnerA = { id: 'u-couple-1', name: 'Amadou', phone: '+221770000001' };
  const partnerB = { id: 'u-couple-2', name: 'Awa', phone: '+221770000002' };

  // Rejet si même compte
  assert.throws(() => {
    validateCoupleDuo(partnerA, partnerA, { coupleConfirmedByPartner: true });
  }, /COMPTES_IDENTIQUES/);
  passed++;
  console.log('  ✓ Mode Couples : Rejet d\'un compte qui tente de former un couple avec lui-même');

  // Rejet si le conjoint n'a pas confirmé
  assert.throws(() => {
    validateCoupleDuo(partnerA, partnerB, { coupleConfirmedByPartner: false });
  }, /CONFIRMATION_CONJOINT_REQUISE/);
  passed++;
  console.log('  ✓ Mode Couples : Rejet si le partenaire n\'a pas validé explicitement');

  // Succès si deux comptes distincts avec accord mutuel
  const coupleResult = validateCoupleDuo(partnerA, partnerB, { coupleConfirmedByPartner: true });
  assert.equal(coupleResult.valid, true);
  passed++;
  console.log('  ✓ Mode Couples : Validation réussie quand les deux conjoints confirment');

  // --------------------------------------------------------------------------
  // TEST 3 : Validation des habitudes de vie (Fumeur / Alcool)
  // --------------------------------------------------------------------------
  const roomRules = {
    smokingPolicy: COLOC_HABIT_POLICIES.FORBIDDEN,
    alcoholPolicy: COLOC_HABIT_POLICIES.FORBIDDEN
  };

  // Rejet si fumeur qui ne s'engage pas à ne pas fumer
  assert.throws(() => {
    validateLivingHabits(roomRules, { isSmoker: true, agreesNotToSmoke: false });
  }, /REGLE_FUMEUR_REFUSEE/);
  passed++;
  console.log('  ✓ Habitudes de vie : Fumeur refusé si pas d\'accord formel de non-fumeur');

  // Acceptation si le fumeur s'engage
  const habitOk = validateLivingHabits(roomRules, { isSmoker: true, agreesNotToSmoke: true });
  assert.equal(habitOk.valid, true);
  passed++;
  console.log('  ✓ Habitudes de vie : Accord respecté validé');

  // --------------------------------------------------------------------------
  // TEST 4 : Cohabitation multi-groupes sans fusion
  // --------------------------------------------------------------------------
  // Chambre 4 places à 25 000 FCFA / place
  const existingReservations = [
    { id: 'res-1', groupId: 'group-isep', placesCount: 2, status: 'CONFIRMEE' } // Groupe A : 2 places
  ];

  // Groupe B (Sonatel) demande 2 places avec multi_group_allowed = true
  const groupBCapacity = validateMultiGroupCapacity({
    roomCapacity: 4,
    multiGroupAllowed: true,
    existingReservations,
    placesRequested: 2
  });
  assert.equal(groupBCapacity.allowed, true);
  assert.equal(groupBCapacity.remainingAfter, 0); // Chambre devient complète (2 + 2 = 4)
  passed++;
  console.log('  ✓ Multi-groupes : 2 groupes indépendants se partagent une chambre de 4 lits sans fusion');

  // Rejet si un groupe demande plus de places que disponible
  assert.throws(() => {
    validateMultiGroupCapacity({
      roomCapacity: 4,
      multiGroupAllowed: true,
      existingReservations,
      placesRequested: 3 // Il ne reste que 2 places
    });
  }, /CAPACITE_DEPASSEE/);
  passed++;
  console.log('  ✓ Multi-groupes : Dépassement de capacité refusé');

  // Rejet si le bailleur a désactivé le multi-groupes
  assert.throws(() => {
    validateMultiGroupCapacity({
      roomCapacity: 4,
      multiGroupAllowed: false,
      existingReservations,
      placesRequested: 1
    });
  }, /PARTAGE_GROUPES_NON_AUTORISE/);
  passed++;
  console.log('  ✓ Multi-groupes : Respect de l\'interdiction de partage du bailleur');

  // --------------------------------------------------------------------------
  // TEST 5 : Verrouillage concurrent atomique 15 min (Place Locks)
  // --------------------------------------------------------------------------
  const place1 = { id: 'place-bed-1', placeNumber: 1, status: PLACE_STATUS.DISPONIBLE };
  const now = Date.now();

  // Premier utilisateur verrouille la place
  const lockUser1 = createPlaceLock({
    place: place1,
    userId: 'user-cand-1',
    now
  });
  assert.equal(lockUser1.status, 'ACTIF');
  assert.equal(lockUser1.placeNumber, 1);
  assert.equal(lockUser1.ttlMinutes, 15);
  passed++;
  console.log('  ✓ Verrou concurrent : Place #1 verrouillée pour 15 min par candidat 1');

  // Concurrence : Deuxième utilisateur tente de verrouiller la même place simultanément
  assert.throws(() => {
    createPlaceLock({
      place: place1,
      userId: 'user-cand-2',
      now: now + 5000, // 5 secondes plus tard
      existingActiveLock: lockUser1
    });
  }, /PLACE_DEJA_VERROUILLEE/);
  passed++;
  console.log('  ✓ Verrou concurrent : Conflit de concurrence bloqué, place non subtilisable');

  // Expiration du verrou : après 16 minutes
  const isExpired = isLockExpired(lockUser1, now + 16 * 60 * 1000);
  assert.equal(isExpired, true);
  passed++;
  console.log('  ✓ Verrou concurrent : Expiration automatique à T + 15 min validée');

  // --------------------------------------------------------------------------
  // TEST 6 : Rachat exclusif (Privatisation solo) & Remboursement instantané 100%
  // --------------------------------------------------------------------------
  const sharedLogement = {
    id: 'chambre-coloc-ouakam',
    title: 'Chambre 2 lits Ouakam',
    roomCapacity: 2,
    rentalMode: COLOC_RENTAL_MODES.FLEXIBLE,
    rentAmount: 80000,
    placePrice: 40000,
    soloPrice: 80000
  };

  const partialReservations = [
    {
      id: 'res-part-1',
      userId: 'user-awa-diop',
      placesCount: 1,
      amountTotal: 40000,
      status: 'VERROUILLEE'
    }
  ];

  const soloBuyer = { id: 'user-solo-alpha', name: 'Mamadou Solo' };

  const soloResult = executeSoloPrivatization({
    logement: sharedLogement,
    soloUser: soloBuyer,
    existingReservations: partialReservations,
    idempotencyKey: 'idem-solo-tx-001'
  });

  assert.equal(soloResult.success, true);
  assert.equal(soloResult.cancelledReservationsCount, 1);
  assert.equal(soloResult.refundsToProcess.length, 1);
  assert.equal(soloResult.refundsToProcess[0].amount, 40000);
  assert.equal(soloResult.refundsToProcess[0].fullRefundPercent, 100);
  assert.equal(soloResult.notificationsToSend.length, 1);
  assert.ok(soloResult.notificationsToSend[0].message.includes('intégralement remboursée sans aucun frais'));
  passed++;
  console.log('  ✓ Rachat exclusif solo : Remboursement 100% sans frais & notification générée');

  // --------------------------------------------------------------------------
  // TEST 7 : Gestion des chambres incomplètes & Échéance
  // --------------------------------------------------------------------------
  const pastDeadline = new Date(Date.now() - 3600000).toISOString(); // 1h dans le passé
  const incompleteLogement = {
    id: 'chambre-incompl',
    roomCapacity: 2,
    incompletePolicy: COLOC_INCOMPLETE_POLICIES.ANNULATION_REMBOURSEMENT,
    incompleteDeadline: pastDeadline
  };

  const currentBookings = [
    { id: 'res-cand-solo', userId: 'user-cand-1', placesCount: 1, amountTotal: 35000, status: 'CONFIRMEE' }
  ];

  const incompleteRes = resolveIncompleteRoom({
    logement: incompleteLogement,
    currentReservations: currentBookings,
    now: Date.now()
  });

  assert.equal(incompleteRes.status, 'ANNULEE_ECHEANCE_ATTEINTE');
  assert.equal(incompleteRes.action, 'REFUND_ALL_CANDIDATES');
  assert.equal(incompleteRes.refundList[0].amount, 35000);
  passed++;
  console.log('  ✓ Chambre incomplète : Échéance dépassée déclenchant remboursement complet');

  console.log(`\n  Total tests Colocation passés : ${passed}/11`);
  return passed;
}
