// ============================================================================
// SCULPT SCHEMA — LOGEMENTS
// Transforme les payloads bruts de l'API REST vers les modèles de données UI
// ============================================================================

/**
 * Schéma pour la carte d'un logement dans les listes (Accueil & Recherche).
 */
export const LogementCardSchema = {
  id: '@link.id',
  title: '@link.title',
  place: '@link.place',
  price: '@link.price',
  priceFormatted: (data) => {
    const p = data.price || data.loyer || 0;
    return String(p).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' F';
  },
  cover: (data) => data.cover || (data.images && data.images[0]) || '',
  images: (data) => data.images || (data.cover ? [data.cover] : []),
  type: '@link.type',
  badge: '@link.badge',
  verified: (data) => Boolean(data.verified ?? data.is_verified ?? true),
  isVerified: (data) => Boolean(data.verified ?? data.is_verified ?? true),
  stats: '@link.stats',
  surface: '@link.surface',
  rooms: '@link.rooms',
};

/**
 * Schéma pour la fiche détaillée d'un logement.
 */
export const LogementDetailSchema = {
  ...LogementCardSchema,
  description: '@link.description',
  address: '@link.address',
  placeDetails: '@link.placeDetails',
  caution: '@link.caution',
  cautionMonths: '@link.cautionMonths',
  amenities: (data) => data.amenities || data.equipements || [],
  bailleur: {
    id: '@link.bailleur.id',
    name: '@link.bailleur.name',
    phone: '@link.bailleur.phone',
    rating: '@link.bailleur.rating',
    verified: (data) => Boolean(data.bailleur?.verified ?? true),
  },
  visitSlots: (data) => data.visitSlots || data.creneaux_visite || [],
  hasVideo: (data) => Boolean(data.video || data.video_url),
  video: '@link.video',
};
