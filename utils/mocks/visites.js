// ============================================================================
// VISITES — DONNÉES FICTIVES (MOCK)
// Visites présentes au premier lancement. Chaque visite pointe vers un
// logement du catalogue (logementId) ; titre, lieu et bailleur en sont déduits.
// ============================================================================

export const DEFAULT_VISITES = [
  {
    id: 'v1',
    logementId: 'icotaf-01',
    status: 'accepted',
    dateLabel: 'Sam. 24 oct. · 16 h',
    note: 'Adresse : Icotaf, à côté de la pharmacie du marché. Moussa t’attendra devant le portail bleu.'
  },
  {
    id: 'v2',
    logementId: 'pikine-rue10',
    status: 'pending',
    dateLabel: 'Lun. 26 oct. · 18 h',
    note: 'Envoyée il y a 1 h. Le bailleur répond en général sous 24 h.'
  },
  {
    id: 'v3',
    logementId: 'technopole-01',
    status: 'pending',
    dateLabel: 'Sam. 24 oct. · 10 h',
    note: 'Envoyée hier. Pas encore de réponse.'
  },
  {
    id: 'v4',
    logementId: 'guinaw-01',
    status: 'rejected',
    dateLabel: 'Jeu. 22 oct. · 15 h',
    note: 'Motif : Le logement a déjà été attribué.'
  }
];
