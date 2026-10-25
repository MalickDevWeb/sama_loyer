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
  REPORT_REASONS,
  validateGenderCompatibility,
  validateCoupleDuo,
  validateLivingHabits,
  validateMultiGroupCapacity,
  createPlaceLock,
  isLockExpired,
  executeSoloPrivatization,
  resolveIncompleteRoom,
  generateGroupInvitation,
  verifyGroupInvitation,
  createInAppGroupInvitation,
  respondToInAppInvitation,
  sendInAppGroupMessage,
  processPaymentWebhookIdempotent,
  createDisputeReport,
  resolveDisputeReport
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

  // --------------------------------------------------------------------------
  // TEST 8 : Tests de Capacité Dynamique (2, 3 et 4 places)
  // --------------------------------------------------------------------------
  // Chambre 3 places
  const cap3 = validateMultiGroupCapacity({
    roomCapacity: 3,
    multiGroupAllowed: true,
    existingReservations: [{ id: 'r1', placesCount: 1, status: 'CONFIRMEE' }],
    placesRequested: 2
  });
  assert.equal(cap3.allowed, true);
  assert.equal(cap3.remainingAfter, 0);
  passed++;
  console.log('  ✓ Capacité dynamique : Chambre 3 places remplie exactement (1 + 2)');

  // --------------------------------------------------------------------------
  // TEST 9 : Invitations sécurisées Duo WhatsApp
  // --------------------------------------------------------------------------
  const groupDuo = { id: 'grp-duo-77', name: 'Binôme Keur Gorgui' };
  const invite = generateGroupInvitation({
    group: groupDuo,
    inviterId: 'user-awa',
    validityHours: 48,
    maxUses: 1,
    now: Date.now()
  });
  assert.ok(invite.token.startsWith('inv-grp-duo-'));
  assert.ok(invite.whatsappShareText.includes('https://samaloyer.sn/join-group?t='));
  passed++;
  console.log('  ✓ Invitations : Jeton Duo WhatsApp cryptographique généré');

  // Consommation valide
  const verifyRes = verifyGroupInvitation(invite, Date.now() + 1000);
  assert.equal(verifyRes.valid, true);
  assert.equal(verifyRes.groupId, 'grp-duo-77');
  passed++;
  console.log('  ✓ Invitations : Vérification du token d\'invitation réussie');

  // Rejet après expiration
  assert.throws(() => {
    verifyGroupInvitation(invite, Date.now() + 50 * 3600 * 1000); // 50h plus tard
  }, /INVITATION_EXPIREE/);
  passed++;
  console.log('  ✓ Invitations : Rejet immédiat d\'un lien d\'invitation expiré');

  // --------------------------------------------------------------------------
  // TEST 10 : Idempotence des Paiements et Webhooks (Orange Money)
  // --------------------------------------------------------------------------
  const processedStore = new Set();
  const resMap = new Map([
    ['res-om-1', { id: 'res-om-1', status: 'VERROUILLEE', placesCount: 1, amountTotal: 25000 }]
  ]);

  const webhookPayload = {
    eventId: 'evt-om-999',
    transactionReference: 'OM-TX-SN-20261025-01',
    reservationId: 'res-om-1',
    status: 'SUCCESS',
    amount: 25000,
    currency: 'XOF'
  };

  // 1ère réception : validation et confirmation
  const firstProcessing = processPaymentWebhookIdempotent({
    webhookEvent: webhookPayload,
    processedEventsStore: processedStore,
    activeReservationsMap: resMap
  });
  assert.equal(firstProcessing.status, 'PROCESSED_CONFIRMED');
  assert.equal(resMap.get('res-om-1').status, 'CONFIRMEE');
  passed++;
  console.log('  ✓ Paiement webhook : Première notification confirmée avec succès');

  // 2ème réception identique : idempotence stricte, ignorée sans double crédit
  const secondProcessing = processPaymentWebhookIdempotent({
    webhookEvent: webhookPayload,
    processedEventsStore: processedStore,
    activeReservationsMap: resMap
  });
  assert.equal(secondProcessing.status, 'IGNORED_DUPLICATE');
  passed++;
  console.log('  ✓ Paiement webhook : Notification dupliquée ignorée idempotemment');

  // --------------------------------------------------------------------------
  // TEST 11 : Signalements et Modération (Logement, Utilisateur, Groupe)
  // --------------------------------------------------------------------------
  const report = createDisputeReport({
    reporterId: 'user-plaignant-1',
    targetType: 'group',
    targetId: 'grp-suspect-02',
    reason: REPORT_REASONS.COMPORTEMENT_INAPPROPRIE,
    description: 'Propos irrespectueux tenus dans les échanges préalables'
  });
  assert.equal(report.status, 'A_TRAITER');
  assert.equal(report.targetType, 'group');
  passed++;
  console.log('  ✓ Signalements : Création d\'un signalement ciblant un groupe');

  // Décision modérateur
  const resolved = resolveDisputeReport(report, {
    action: 'AVERTISSEMENT_ENVOYE',
    notes: 'Rappel à l\'ordre envoyé au membre'
  });
  assert.equal(resolved.status, 'TRAITE');
  assert.equal(resolved.actionTaken, 'AVERTISSEMENT_ENVOYE');
  passed++;
  console.log('  ✓ Signalements : Traitement et décision administrative tracée');

  // --------------------------------------------------------------------------
  // TEST 12 : Invitations & Messagerie Internes dans l'App (sans WhatsApp)
  // --------------------------------------------------------------------------
  const groupInApp = {
    id: 'grp-inapp-01',
    name: 'Groupe ISEP Interne',
    placesRequested: 2,
    members: [{ id: 'user-moussa', name: 'Moussa Diop', role: 'CHEF_GROUPE' }]
  };
  const inviterMoussa = { id: 'user-moussa', name: 'Moussa Diop', phone: '+221771234567' };
  const recipientAmadou = { id: 'user-amadou', name: 'Amadou Sall', phone: '+221770000001' };

  // 1. Émission d'une invitation interne dans l'application
  const inAppInv = createInAppGroupInvitation({
    group: groupInApp,
    inviter: inviterMoussa,
    recipientPhoneOrId: recipientAmadou.phone
  });
  assert.equal(inAppInv.type, 'IN_APP_GROUP_INVITE');
  assert.equal(inAppInv.status, 'EN_ATTENTE');
  assert.equal(inAppInv.recipient, '+221770000001');
  assert.ok(inAppInv.text.includes('Moussa Diop t\'invite à rejoindre son groupe'));
  passed++;
  console.log('  ✓ Messagerie interne : Émission d\'une invitation in-app sans dépendre de WhatsApp');

  // 2. Acceptation de l'invitation directement dans l'application
  const acceptRes = respondToInAppInvitation({
    invitation: inAppInv,
    response: 'ACCEPTER',
    responder: recipientAmadou,
    group: groupInApp
  });
  assert.equal(acceptRes.success, true);
  assert.equal(acceptRes.status, 'ACCEPTEE');
  assert.equal(acceptRes.updatedGroup.members.length, 2);
  assert.equal(acceptRes.updatedGroup.status, 'COMPLET');
  assert.ok(acceptRes.systemMessage.includes('Amadou Sall a accepté l\'invitation'));
  passed++;
  console.log('  ✓ Messagerie interne : Acceptation in-app d\'invitation, groupe complété (2/2)');

  // 3. Discussion et messages internes au groupe dans l'application
  const chatMsg = sendInAppGroupMessage({
    groupId: groupInApp.id,
    sender: recipientAmadou,
    text: 'Salut Moussa ! J\'ai validé mon lit pour Keur Gorgui directement dans Sama Loyer.'
  });
  assert.equal(chatMsg.groupId, 'grp-inapp-01');
  assert.equal(chatMsg.senderId, 'user-amadou');
  assert.equal(chatMsg.status, 'ENVOYE');
  assert.ok(chatMsg.time.includes(':'));
  passed++;
  console.log('  ✓ Messagerie interne : Échange de messages in-app entre colocataires du groupe');

  console.log(`\n  Total tests Colocation passés : ${passed}`);
  return passed;
}

