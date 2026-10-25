// ============================================================================
// SCULPT SCHEMA — COLOCATION & PLACES
// Transformation déclarative Json-Sculpt pour les chambres partagées et groupes
// ============================================================================

export const RoomPlaceSchema = {
  id: '@link.id',
  placeNumber: (data) => data.place_number ?? data.placeNumber ?? 1,
  status: (data) => data.status || 'DISPONIBLE',
  isAvailable: (data) => (data.status || 'DISPONIBLE') === 'DISPONIBLE',
  isLocked: (data) => data.status === 'BLOQUEE',
  isReserved: (data) => data.status === 'RESERVEE' || data.status === 'OCCUPEE',
  occupantName: (data) => data.occupant_name || data.occupantName || null,
  lockExpiresAt: '@link.lock_expires_at'
};

export const ColocGroupSchema = {
  id: '@link.id',
  name: '@link.name',
  creatorId: (data) => data.creator_id || data.creatorId,
  placesRequested: (data) => data.places_requested ?? data.placesRequested ?? 1,
  placesAssigned: (data) => data.places_assigned ?? data.placesAssigned ?? 0,
  genderMode: (data) => data.gender_mode || data.genderMode || 'HOMMES_UNIQUEMENT',
  status: (data) => data.status || 'CREE',
  isCouple: (data) => Boolean(data.is_couple ?? data.isCouple),
  coupleConfirmed: (data) => Boolean(data.couple_confirmed_by_partner ?? data.coupleConfirmed),
  membersCount: (data) => (data.members ? data.members.length : (data.members_count ?? 1))
};

export const ColocReservationSchema = {
  id: '@link.id',
  logementId: (data) => data.logement_id || data.logementId,
  groupId: (data) => data.group_id || data.groupId || null,
  userId: (data) => data.user_id || data.userId,
  placesCount: (data) => data.places_count ?? data.placesCount ?? 1,
  amountTotal: (data) => data.amount_total ?? data.amountTotal ?? 0,
  amountFormatted: (data) => {
    const a = data.amount_total ?? data.amountTotal ?? 0;
    return String(a).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';
  },
  isSoloPrivatization: (data) => Boolean(data.is_solo_privatization ?? data.isSoloPrivatization),
  status: (data) => data.status || 'VERROUILLEE',
  lockExpiresAt: '@link.lock_expires_at'
};
