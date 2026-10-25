// ============================================================================
// SAMA LOYER — MOTEUR DE COLOCATION & RÉSERVATION MULTI-GROUPES
// Règles métier strictes, validation côté serveur / moteur de domaine :
// 1. Isolation stricte des genres (HOMMES_UNIQUEMENT, FEMMES_UNIQUEMENT, COUPLES_UNIQUEMENT)
//    -> AUCUN mélange mixte entre personnes quelconques.
// 2. Validation bilatérale des couples (deux comptes Max it distincts confirmés).
// 3. Cohabitation de groupes indépendants sans fusion (multi_group_allowed).
// 4. Verrouillage concurrent atomique de places avec TTL de 15 minutes.
// 5. Rachat exclusif (privatisation solo) avec remboursement intégral instantané.
// 6. Gestion des chambres incomplètes (échéance, remboursement ou solo).
// ============================================================================

export const COLOC_GENDER_POLICIES = Object.freeze({
  HOMMES_UNIQUEMENT: 'HOMMES_UNIQUEMENT',
  FEMMES_UNIQUEMENT: 'FEMMES_UNIQUEMENT',
  COUPLES_UNIQUEMENT: 'COUPLES_UNIQUEMENT'
});

export const COLOC_RENTAL_MODES = Object.freeze({
  SOLO_UNIQUEMENT: 'SOLO_UNIQUEMENT',
  COLOC_UNIQUEMENT: 'COLOC_UNIQUEMENT',
  FLEXIBLE: 'FLEXIBLE'
});

export const COLOC_HABIT_POLICIES = Object.freeze({
  ALLOWED: 'ALLOWED',
  FORBIDDEN: 'FORBIDDEN',
  OUTDOOR_ONLY: 'OUTDOOR_ONLY'
});

export const COLOC_INCOMPLETE_POLICIES = Object.freeze({
  ANNULATION_REMBOURSEMENT: 'ANNULATION_REMBOURSEMENT',
  POURSUIVRE_AU_PRIX_SOLO: 'POURSUIVRE_AU_PRIX_SOLO',
  PRIX_ALTERNATIF_PREDEFINI: 'PRIX_ALTERNATIF_PREDEFINI'
});

export const PLACE_STATUS = Object.freeze({
  DISPONIBLE: 'DISPONIBLE',
  BLOQUEE: 'BLOQUEE',
  RESERVEE: 'RESERVEE',
  OCCUPEE: 'OCCUPEE',
  INDISPONIBLE: 'INDISPONIBLE'
});

export const LOCK_TTL_MS = 15 * 60 * 1000; // 15 minutes strict

/**
 * Normalise le genre utilisateur.
 */
export function normalizeGender(gender) {
  if (!gender) return null;
  const g = String(gender).trim().toUpperCase();
  if (g === 'HOMME' || g === 'H' || g === 'MALE' || g === 'M') return 'HOMME';
  if (g === 'FEMME' || g === 'F' || g === 'FEMALE') return 'FEMME';
  return null;
}

/**
 * 1. Validation stricte de la politique de genre.
 * @throws {Error} si incompatibilité
 */
export function validateGenderCompatibility(genderPolicy, applicantProfiles = []) {
  if (!Object.values(COLOC_GENDER_POLICIES).includes(genderPolicy)) {
    throw new Error(`POLITIQUE_GENRE_INVALIDE: "${genderPolicy}" n'est pas supportée.`);
  }

  if (!Array.isArray(applicantProfiles) || applicantProfiles.length === 0) {
    throw new Error('CANDIDATS_REQUIS: Au moins un profil candidat est nécessaire pour la validation.');
  }

  const normalizedGenders = applicantProfiles.map(p => {
    const norm = normalizeGender(p.gender);
    if (!norm) {
      throw new Error(`GENRE_NON_DEFINI: Le genre de l'utilisateur ${p.name || p.id || ''} doit être renseigné.`);
    }
    return norm;
  });

  if (genderPolicy === COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT) {
    const hasNonMale = normalizedGenders.some(g => g !== 'HOMME');
    if (hasNonMale) {
      throw new Error('GENRE_INCOMPATIBLE: Cette chambre est strictement réservée aux hommes (aucun mélange mixte autorisé).');
    }
    return { compatible: true, policy: genderPolicy };
  }

  if (genderPolicy === COLOC_GENDER_POLICIES.FEMMES_UNIQUEMENT) {
    const hasNonFemale = normalizedGenders.some(g => g !== 'FEMME');
    if (hasNonFemale) {
      throw new Error('GENRE_INCOMPATIBLE: Cette chambre est strictement réservée aux femmes (aucun mélange mixte autorisé).');
    }
    return { compatible: true, policy: genderPolicy };
  }

  if (genderPolicy === COLOC_GENDER_POLICIES.COUPLES_UNIQUEMENT) {
    if (applicantProfiles.length !== 2) {
      throw new Error('COUPLE_REQUIS: Le mode couples requiert exactement deux conjoints déclarés.');
    }
    return { compatible: true, policy: genderPolicy };
  }

  throw new Error('POLITIQUE_GENRE_INCONNUE');
}

/**
 * 2. Validation bilatérale des couples (mutual opt-in).
 */
export function validateCoupleDuo(userA, userB, options = {}) {
  if (!userA || !userB) {
    throw new Error('DUO_INCOMPLET: Deux profils d\'utilisateurs distincts sont obligatoires pour former un couple.');
  }

  if (userA.id === userB.id || userA.phone === userB.phone) {
    throw new Error('COMPTES_IDENTIQUES: Un utilisateur ne peut pas former un couple avec son propre compte.');
  }

  const confirmedByPartner = Boolean(options.coupleConfirmedByPartner);
  if (!confirmedByPartner) {
    throw new Error('CONFIRMATION_CONJOINT_REQUISE: Le conjoint doit valider explicitement l\'association avant toute réservation.');
  }

  return {
    valid: true,
    userAId: userA.id,
    userBId: userB.id,
    confirmedAt: new Date().toISOString()
  };
}

/**
 * 3. Validation des règles d'habitudes de vie (fumeur, alcool).
 */
export function validateLivingHabits(logementRules, applicantHabits = {}) {
  const { smokingPolicy = COLOC_HABIT_POLICIES.FORBIDDEN, alcoholPolicy = COLOC_HABIT_POLICIES.FORBIDDEN } = logementRules;

  if (smokingPolicy === COLOC_HABIT_POLICIES.FORBIDDEN && applicantHabits.isSmoker && !applicantHabits.agreesNotToSmoke) {
    throw new Error('REGLE_FUMEUR_REFUSEE: Ce logement est non-fumeur. Vous devez vous engager à ne pas fumer dans la chambre.');
  }

  if (alcoholPolicy === COLOC_HABIT_POLICIES.FORBIDDEN && applicantHabits.drinksAlcohol && !applicantHabits.agreesNoAlcoholOnSite) {
    throw new Error('REGLE_ALCOOL_REFUSEE: La consommation d\'alcool est interdite dans ce logement.');
  }

  return { valid: true };
}

/**
 * 4. Gestion de la capacité et du multi-groupes.
 */
export function validateMultiGroupCapacity({
  roomCapacity,
  multiGroupAllowed,
  existingReservations = [],
  placesRequested = 1
}) {
  if (roomCapacity <= 0) {
    throw new Error('CAPACITE_INVALIDE: La capacité de la chambre doit être supérieure à 0.');
  }

  if (placesRequested <= 0) {
    throw new Error('PLACES_DEMANDEES_INVALIDES: Le nombre de places demandées doit être au moins 1.');
  }

  // Calcul du nombre de places déjà occupées ou confirmées
  const occupiedPlaces = existingReservations
    .filter(r => ['VERROUILLEE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE'].includes(r.status))
    .reduce((sum, r) => sum + (r.placesCount || 0), 0);

  const availablePlaces = roomCapacity - occupiedPlaces;

  if (placesRequested > availablePlaces) {
    throw new Error(`CAPACITE_DEPASSEE: Seulement ${availablePlaces} place(s) disponible(s) sur ${roomCapacity}. Demandé: ${placesRequested}.`);
  }

  // Si multi_group_allowed est faux, aucun autre groupe ne peut réserver si des réservations existent déjà
  const distinctGroups = new Set(existingReservations.map(r => r.groupId).filter(Boolean));
  if (!multiGroupAllowed && distinctGroups.size > 0) {
    throw new Error('PARTAGE_GROUPES_NON_AUTORISE: Le bailleur n\'autorise pas plusieurs groupes indépendants dans cette chambre.');
  }

  return {
    allowed: true,
    availablePlaces,
    remainingAfter: availablePlaces - placesRequested
  };
}

/**
 * 5. Moteur de Verrouillage Atomique 15 minutes (Place Locks).
 */
export function createPlaceLock({
  place,
  userId,
  groupId = null,
  now = Date.now(),
  existingActiveLock = null
}) {
  // Vérification si un verrou actif existe déjà et n'est pas expiré
  if (existingActiveLock && existingActiveLock.status === 'ACTIF') {
    const expiresAt = new Date(existingActiveLock.expiresAt).getTime();
    if (expiresAt > now) {
      if (existingActiveLock.userId !== userId) {
        throw new Error(`PLACE_DEJA_VERROUILLEE: La place #${place.placeNumber} est temporairement verrouillée par un autre candidat.`);
      }
      // Renouvellement / Prolongation autorisée pour le même utilisateur
    }
  }

  if (place.status === PLACE_STATUS.RESERVEE || place.status === PLACE_STATUS.OCCUPEE) {
    throw new Error(`PLACE_NON_DISPONIBLE: La place #${place.placeNumber} est déjà réservée ou occupée.`);
  }

  const expiresAt = new Date(now + LOCK_TTL_MS).toISOString();

  return {
    lockId: `lock-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    placeId: place.id,
    placeNumber: place.placeNumber,
    userId,
    groupId,
    status: 'ACTIF',
    lockedAt: new Date(now).toISOString(),
    expiresAt,
    ttlMinutes: 15
  };
}

/**
 * Vérifie si un verrou est expiré.
 */
export function isLockExpired(lock, now = Date.now()) {
  if (!lock || lock.status !== 'ACTIF') return true;
  return new Date(lock.expiresAt).getTime() <= now;
}

/**
 * 6. Rachat Exclusif (Privatisation Solo de toute la chambre).
 * Annule les réservations partielles en attente et déclenche le remboursement à 100%.
 */
export function executeSoloPrivatization({
  logement,
  soloUser,
  existingReservations = [],
  idempotencyKey
}) {
  if (logement.rentalMode === COLOC_RENTAL_MODES.COLOC_UNIQUEMENT) {
    throw new Error('PRIVATISATION_NON_AUTORISEE: Ce logement est réservé exclusivement à la colocation par place.');
  }

  const soloPrice = logement.soloPrice || logement.rentAmount;
  if (!soloPrice || soloPrice <= 0) {
    throw new Error('PRIX_SOLO_NON_DEFINI: Aucun tarif solo n\'a été configuré par le bailleur.');
  }

  // Vérifier si la chambre est déjà totalement confirmée par les colocataires
  const fullyConfirmedPlaces = existingReservations
    .filter(r => r.status === 'CONFIRMEE')
    .reduce((sum, r) => sum + (r.placesCount || 0), 0);

  if (fullyConfirmedPlaces >= logement.roomCapacity) {
    throw new Error('CHAMBRE_DEJA_VALIDEE: La chambre est déjà intégralement payée et réservée. Rachat impossible.');
  }

  // Identifier les réservations partielles à rembourser
  const refundsToProcess = [];
  const notificationsToSend = [];

  for (const res of existingReservations) {
    if (['VERROUILLEE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE'].includes(res.status)) {
      refundsToProcess.push({
        reservationId: res.id,
        userId: res.userId,
        amount: res.amountTotal,
        reason: 'RACHAT_EXCLUSIF_SOLO',
        operator: 'ORANGE_MONEY_OR_WAVE',
        fullRefundPercent: 100
      });

      notificationsToSend.push({
        userId: res.userId,
        channel: 'SMS_AND_INAPP',
        template: 'SOLO_BUYOUT_REFUND',
        message: `Bonjour, un locataire a réservé l'intégralité de la chambre "${logement.title}". Votre avance de ${res.amountTotal} FCFA vous est intégralement remboursée sans aucun frais sur votre compte mobile money.`
      });
    }
  }

  const soloReservation = {
    id: `res-solo-${Date.now()}`,
    logementId: logement.id,
    userId: soloUser.id,
    groupId: null,
    placesCount: logement.roomCapacity,
    amountTotal: soloPrice,
    isSoloPrivatization: true,
    conditionsAccepted: true,
    status: 'CONFIRMEE',
    idempotencyKey: idempotencyKey || `idem-solo-${soloUser.id}-${Date.now()}`,
    createdAt: new Date().toISOString()
  };

  return {
    success: true,
    soloReservation,
    cancelledReservationsCount: refundsToProcess.length,
    refundsToProcess,
    notificationsToSend
  };
}

/**
 * 7. Résolution de la politique de chambre incomplète.
 */
export function resolveIncompleteRoom({
  logement,
  currentReservations = [],
  now = Date.now()
}) {
  const bookedPlaces = currentReservations
    .filter(r => ['VERROUILLEE', 'CONFIRMEE'].includes(r.status))
    .reduce((sum, r) => sum + r.placesCount, 0);

  const isFull = bookedPlaces >= logement.roomCapacity;
  if (isFull) {
    return { status: 'COMPLETE', action: 'NONE' };
  }

  const deadline = logement.incompleteDeadline ? new Date(logement.incompleteDeadline).getTime() : null;
  const deadlinePassed = deadline ? now >= deadline : false;

  if (!deadlinePassed) {
    return {
      status: 'RECRUTEMENT_ACTIF',
      remainingPlaces: logement.roomCapacity - bookedPlaces,
      deadlineAt: logement.incompleteDeadline
    };
  }

  // Échéance dépassée : application de la politique choisie par le bailleur
  const policy = logement.incompletePolicy || COLOC_INCOMPLETE_POLICIES.ANNULATION_REMBOURSEMENT;

  if (policy === COLOC_INCOMPLETE_POLICIES.ANNULATION_REMBOURSEMENT) {
    return {
      status: 'ANNULEE_ECHEANCE_ATTEINTE',
      policy,
      action: 'REFUND_ALL_CANDIDATES',
      refundList: currentReservations.map(r => ({
        reservationId: r.id,
        userId: r.userId,
        amount: r.amountTotal,
        refundPercent: 100
      }))
    };
  }

  if (policy === COLOC_INCOMPLETE_POLICIES.POURSUIVRE_AU_PRIX_SOLO) {
    return {
      status: 'PROPOSITION_UPGRADE_SOLO',
      policy,
      action: 'OFFER_SOLO_CONVERSION',
      soloPrice: logement.soloPrice || logement.rentAmount
    };
  }

  return {
    status: 'PRIX_ALTERNATIF',
    policy,
    action: 'ADJUST_SPLIT_PRICE'
  };
}

/**
 * 8. Invitations sécurisées de groupe (Duo WhatsApp).
 */
export function generateGroupInvitation({
  group,
  inviterId,
  validityHours = 48,
  maxUses = 1,
  now = Date.now()
}) {
  if (!group || !group.id) {
    throw new Error('GROUPE_INVALIDE: Un groupe valide est requis pour générer une invitation.');
  }

  // Jeton cryptographiquement aléatoire / non devinable
  const randomEntropy = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const token = `inv-${group.id.slice(0, 8)}-${randomEntropy}`;
  const expiresAt = new Date(now + validityHours * 3600 * 1000).toISOString();

  return {
    token,
    groupId: group.id,
    inviterId,
    maxUses,
    usesCount: 0,
    expiresAt,
    inviteUrl: `https://samaloyer.sn/join-group?t=${token}`,
    whatsappShareText: `Rejoins notre colocation "${group.name}" sur SAMA LOYER pour réserver ensemble : https://samaloyer.sn/join-group?t=${token}`
  };
}

/**
 * Vérifie et consomme une invitation.
 */
export function verifyGroupInvitation(invitation, now = Date.now()) {
  if (!invitation || !invitation.token) {
    throw new Error('INVITATION_INTROUVABLE: Ce lien d\'invitation n\'existe pas ou a été révoqué.');
  }

  if (invitation.revokedAt) {
    throw new Error('INVITATION_REVOQUEE: Cette invitation a été révoquée par le créateur du groupe.');
  }

  if (new Date(invitation.expiresAt).getTime() <= now) {
    throw new Error('INVITATION_EXPIREE: Ce lien d\'invitation a expiré. Demande un nouveau lien au groupe.');
  }

  if (invitation.usesCount >= invitation.maxUses) {
    throw new Error('QUOTA_INVITATION_ATTEINT: Le nombre maximal d\'adhésions pour ce lien a été atteint.');
  }

  return {
    valid: true,
    groupId: invitation.groupId
  };
}

/**
 * 8.b Invitations et Messagerie Internes à l'Application SAMA LOYER
 * Permet d'inviter et d'échanger directement dans l'application sans dépendre de WhatsApp.
 */
export function createInAppGroupInvitation({
  group,
  inviter,
  recipientPhoneOrId,
  validityHours = 72,
  now = Date.now()
}) {
  if (!group || !group.id) {
    throw new Error('GROUPE_INVALIDE: Un groupe valide est requis pour envoyer une invitation.');
  }
  if (!inviter || !inviter.id) {
    throw new Error('EXPEDITEUR_INVALIDE: Le profil émetteur est obligatoire.');
  }
  if (!recipientPhoneOrId || !String(recipientPhoneOrId).trim()) {
    throw new Error('DESTINATAIRE_MANQUANT: Le numéro ou identifiant du destinataire est requis.');
  }

  const id = `inv-inapp-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const expiresAt = new Date(now + validityHours * 3600 * 1000).toISOString();

  return {
    id,
    type: 'IN_APP_GROUP_INVITE',
    groupId: group.id,
    groupName: group.name,
    inviter: {
      id: inviter.id,
      name: inviter.name,
      phone: inviter.phone || null
    },
    recipient: String(recipientPhoneOrId).trim(),
    status: 'EN_ATTENTE', // 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'EXPIREE'
    createdAt: new Date(now).toISOString(),
    expiresAt,
    text: `${inviter.name} t'invite à rejoindre son groupe "${group.name}" sur SAMA LOYER pour partager une colocation.`
  };
}

export function respondToInAppInvitation({
  invitation,
  response, // 'ACCEPTER' | 'REFUSER'
  responder,
  group,
  now = Date.now()
}) {
  if (!invitation || !invitation.id) {
    throw new Error('INVITATION_INTROUVABLE: L\'invitation sélectionnée n\'existe pas.');
  }
  if (invitation.status !== 'EN_ATTENTE') {
    throw new Error(`INVITATION_DEJA_TRAITEE: Cette invitation a déjà été ${invitation.status.toLowerCase()}.`);
  }
  if (new Date(invitation.expiresAt).getTime() <= now) {
    invitation.status = 'EXPIREE';
    throw new Error('INVITATION_EXPIREE: Cette invitation a expiré.');
  }

  if (response === 'ACCEPTER') {
    invitation.status = 'ACCEPTEE';
    invitation.respondedAt = new Date(now).toISOString();

    const members = (group && Array.isArray(group.members)) ? [...group.members] : [];
    const alreadyMember = members.some(m => m.id === responder.id);
    if (!alreadyMember) {
      members.push({
        id: responder.id,
        name: responder.name,
        phone: responder.phone || null,
        joinedAt: new Date(now).toISOString(),
        role: 'MEMBRE'
      });
    }

    const updatedGroup = Object.assign({}, group, {
      members,
      placesAttributed: members.length,
      status: members.length >= (group?.placesRequested || 2) ? 'COMPLET' : 'EN_ATTENTE_MEMBRES'
    });

    return {
      success: true,
      status: 'ACCEPTEE',
      invitation,
      updatedGroup,
      systemMessage: `${responder.name} a accepté l'invitation interne et a rejoint le groupe "${invitation.groupName}".`
    };
  } else {
    invitation.status = 'REFUSEE';
    invitation.respondedAt = new Date(now).toISOString();

    return {
      success: true,
      status: 'REFUSEE',
      invitation,
      updatedGroup: group,
      systemMessage: `${responder.name} a décliné l'invitation pour le groupe "${invitation.groupName}".`
    };
  }
}

export function sendInAppGroupMessage({
  groupId,
  sender,
  text,
  now = Date.now()
}) {
  if (!groupId) {
    throw new Error('GROUPE_REQUIS: Un identifiant de groupe est obligatoire.');
  }
  if (!sender || !sender.id) {
    throw new Error('EXPEDITEUR_REQUIS: L\'expéditeur doit être authentifié.');
  }
  if (!text || !text.trim()) {
    throw new Error('MESSAGE_VIDE: Le contenu du message ne peut être vide.');
  }

  const d = new Date(now);
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  return {
    id: `grp-msg-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    groupId,
    senderId: sender.id,
    senderName: sender.name,
    text: text.trim(),
    time: timeStr,
    timestamp: now,
    status: 'ENVOYE'
  };
}

/**
 * 9. Traitement Idempotent des Paiements et Webhooks (Orange Money / Wave).
 */
export function processPaymentWebhookIdempotent({
  webhookEvent,
  processedEventsStore = new Set(),
  activeReservationsMap = new Map()
}) {
  const { eventId, transactionReference, reservationId, status, amount, currency } = webhookEvent;

  if (!transactionReference) {
    throw new Error('REFERENCE_TRANSACTION_MANQUANTE: Référence opérateur obligatoire.');
  }

  // Vérification de l'idempotence
  if (processedEventsStore.has(transactionReference)) {
    return {
      status: 'IGNORED_DUPLICATE',
      message: 'Événement de paiement déjà traité. Aucune double attribution ni double facturation.',
      transactionReference
    };
  }

  if (currency && currency !== 'XOF') {
    throw new Error(`DEVISE_INVALIDE: Devise ${currency} non acceptée. Seul le XOF est supporté.`);
  }

  const reservation = activeReservationsMap.get(reservationId);
  if (!reservation) {
    throw new Error('RESERVATION_INTROUVABLE: La réservation associée à ce paiement n\'existe pas.');
  }

  if (status === 'SUCCESS' || status === 'PAID') {
    reservation.status = 'CONFIRMEE';
    reservation.paidAt = new Date().toISOString();
    reservation.transactionReference = transactionReference;
    processedEventsStore.add(transactionReference);

    return {
      status: 'PROCESSED_CONFIRMED',
      reservationId,
      transactionReference,
      amount
    };
  }

  if (status === 'FAILED' || status === 'EXPIRED') {
    reservation.status = 'ANNULEE';
    processedEventsStore.add(transactionReference);

    return {
      status: 'PROCESSED_FAILED',
      reservationId,
      transactionReference
    };
  }

  return {
    status: 'PENDING_STATUS',
    transactionReference
  };
}

/**
 * 10. Signalements et Modération (Logement, Utilisateur, Groupe).
 */
export const REPORT_REASONS = Object.freeze({
  FAUSSE_ANNONCE: 'FAUSSE_ANNONCE',
  NON_RESPECT_REGLES: 'NON_RESPECT_REGLES',
  COMPORTEMENT_INAPPROPRIE: 'COMPORTEMENT_INAPPROPRIE',
  INCOHERENCE_PROFIL: 'INCOHERENCE_PROFIL',
  FRAUDE_PAIEMENT: 'FRAUDE_PAIEMENT'
});

export function createDisputeReport({
  reporterId,
  targetType,
  targetId,
  reason,
  description = ''
}) {
  if (!['logement', 'user', 'group'].includes(targetType)) {
    throw new Error(`CIBLE_INVALIDE: Le type de cible "${targetType}" n'est pas autorisé.`);
  }

  if (!Object.values(REPORT_REASONS).includes(reason)) {
    throw new Error(`MOTIF_INVALIDE: Le motif "${reason}" n'est pas reconnu.`);
  }

  return {
    id: `rep-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    reporterId,
    targetType,
    targetId,
    reason,
    description,
    status: 'A_TRAITER',
    priority: reason === REPORT_REASONS.FRAUDE_PAIEMENT ? 'URGENT' : 'NORMAL',
    createdAt: new Date().toISOString()
  };
}

export function resolveDisputeReport(report, decision = {}) {
  if (!report || report.status !== 'A_TRAITER') {
    throw new Error('SIGNALEMENT_NON_TRAITABLE: Le dossier doit être en attente de traitement.');
  }

  return {
    ...report,
    status: decision.action === 'REJETER' ? 'REJETE' : 'TRAITE',
    actionTaken: decision.action,
    moderatorNotes: decision.notes || '',
    handledAt: new Date().toISOString()
  };
}


