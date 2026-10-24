// ============================================================================
// ANNUAIRE MAX IT — DONNÉES FICTIVES (MOCK)
// Comptes utilisés par la recherche « Nouvelle location » du bailleur.
// contactOf : comment la personne est déjà en lien avec le bailleur connecté
// (null = aucun lien : on ne la trouve que par son numéro complet).
// À remplacer par GET /bailleur/tenant-search (BackendAPI.searchLocataires).
// ============================================================================

export const MAXIT_USERS = [
  { id: 'u-awa-diop', name: 'Awa Diop', phone: '771234512', contactOf: 'Visite acceptée · Chambre salon Icotaf' },
  { id: 'u-mariama-sow', name: 'Mariama Sow', phone: '763456781', contactOf: 'Visite acceptée · Chambre salon Icotaf' },
  { id: 'u-aminata-sy', name: 'Aminata Sy', phone: '784561230', contactOf: 'Conversation · Studio Pikine Rue 10' },
  { id: 'u-ousmane-ba', name: 'Ousmane Ba', phone: '709876543', contactOf: 'Demande de visite · Appartement F2 Technopole' },
  { id: 'u-khady-ndiaye', name: 'Khady Ndiaye', phone: '775550011', contactOf: null },
  { id: 'u-lamine-gueye', name: 'Lamine Gueye', phone: '778889900', contactOf: null },
  { id: 'u-ndeye-fall', name: 'Ndèye Fall', phone: '762223344', contactOf: null }
];
