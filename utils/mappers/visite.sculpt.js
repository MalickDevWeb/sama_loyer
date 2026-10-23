// ============================================================================
// SCULPT SCHEMA — VISITES & RENDEZ-VOUS
// ============================================================================

export const VisiteSchema = {
  id: '@link.id',
  logementId: '@link.logementId',
  logementTitle: '@link.logementTitle',
  logementPlace: '@link.logementPlace',
  price: '@link.price',
  cover: '@link.cover',
  date: '@link.date',
  time: '@link.time',
  status: '@link.status', // 'confirmed' | 'pending' | 'done' | 'cancelled'
  statusLabel: (data) => {
    switch (data.status) {
      case 'confirmed': return 'Visite confirmée';
      case 'done': return 'Effectuée';
      case 'cancelled': return 'Annulée';
      default: return 'En attente de confirmation';
    }
  },
  landlordName: '@link.landlordName',
  landlordPhone: '@link.landlordPhone',
  tenantName: '@link.tenantName',
  tenantPhone: '@link.tenantPhone',
  note: '@link.note',
  createdAt: '@link.createdAt',
};

