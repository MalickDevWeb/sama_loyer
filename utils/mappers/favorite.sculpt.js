// ============================================================================
// SCHÉMA JSON-SCULPT — FAVORIS SAMA LOYER
// Transforme les payloads bruts de l'API REST vers les modèles de données UI
// ============================================================================

export const FavoriteItemSchema = {
  id: '@link.id',
  logementId: (data) => String(data.logement_id || data.logementId || data.id || ''),
  createdAt: (data) => data.created_at || data.createdAt || 0,
  active: (data) => Boolean(data.active ?? true)
};

export const FavoriteListSchema = {
  items: (data) => {
    const list = data.favorites || data.data || data.items || [];
    if (!Array.isArray(list)) return [];
    return list.map((item) => {
      if (typeof item === 'string' || typeof item === 'number') return String(item);
      return String(item.logement_id || item.logementId || item.id || '');
    }).filter(Boolean);
  },
  total: (data) => Number(data.total !== undefined ? data.total : (data.data ? data.data.length : 0))
};
