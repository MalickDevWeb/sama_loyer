// ============================================================================
// MON LOYER — DONNÉES FICTIVES (MOCK)
// Logements loués par le locataire : chacun a son bailleur, son contrat, sa
// caution et ses reçus. Tous les paiements passent par Max it.
// À remplacer par BackendAPI + un schéma json-sculpt quand l'API sera prête.
// ============================================================================

export const RENT_MONTH = 'novembre';

export const RENTED_HOMES = [
  {
    id: 'studio',
    name: 'Mon studio',
    place: 'Liberté 6, Dakar',
    owner: 'Mme Diagne',
    ownerPhone: '774501234',
    conversationId: 'mme-diagne',
    rent: 80000,
    deposit: 160000,
    depositInfo: '2 mois · versée le 28 mai',
    contract: 'Jusqu’au 31 mai 2027 · préavis 1 mois',
    since: 'Depuis le 1er juin 2026',
    due: 'Avant le 5 novembre · dans 14 jours',
    tint: '#E3E9F5',
    history: [
      { id: 'r-oct', label: 'Loyer d’octobre', sub: 'Payé le 3 oct. · Max it', amount: 80000, kind: 'rent', ref: 'REC-OCT-2026-8812' },
      { id: 'r-sep', label: 'Loyer de septembre', sub: 'Payé le 4 sept. · Max it', amount: 80000, kind: 'rent', ref: 'REC-SEP-2026-7731' },
      { id: 'r-cau', label: 'Entrée : caution (2 mois)', sub: 'Payé le 28 mai · Max it', amount: 160000, kind: 'entry', ref: 'CAU-ENT-2026-4402' }
    ]
  },
  {
    id: 'ibou',
    name: 'Chambre de Ibou',
    place: 'Thiaroye, Pikine',
    owner: 'Fatou K.',
    ownerPhone: '778905678',
    conversationId: 'fatou-k-ibou',
    rent: 45000,
    deposit: 45000,
    depositInfo: '1 mois · versée le 25 sept.',
    contract: 'Jusqu’au 30 sept. 2027 · préavis 1 mois',
    since: 'Depuis le 1er octobre 2026',
    due: 'Avant le 10 novembre · dans 19 jours',
    tint: '#E2F0EA',
    history: [
      { id: 'r-oct', label: 'Loyer d’octobre (avance)', sub: 'Payé le 25 sept. · Max it', amount: 45000, kind: 'entry', ref: 'REC-OCT-2026-3310' },
      { id: 'r-cau', label: 'Entrée : caution (1 mois)', sub: 'Payé le 25 sept. · Max it', amount: 45000, kind: 'entry', ref: 'CAU-ENT-2026-3309' }
    ]
  }
];

export const PROBLEM_CATEGORIES = [
  'Plomberie / fuite d’eau',
  'Électricité',
  'Serrure / porte',
  'Humidité',
  'Autre problème'
];
