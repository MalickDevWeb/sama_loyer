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
    dateLabel: 'Ven. 23 oct. · 17 h',
    note: 'Motif : la chambre vient d’être louée.'
  }
];

// Horaires de visite fixés par le bailleur (écran « Mes horaires de visite »),
// sur les 16 prochains jours. Un jour sans créneau est fermé.
export const VISIT_DAYS = [
  { dow: 'Ven.', num: '23', month: 'oct.', full: 'Vendredi 23 octobre', slots: ['17 h', '18 h'] },
  { dow: 'Sam.', num: '24', month: 'oct.', full: 'Samedi 24 octobre', slots: ['10 h', '12 h', '16 h'] },
  { dow: 'Dim.', num: '25', month: 'oct.', full: 'Dimanche 25 octobre', slots: ['11 h'] },
  { dow: 'Lun.', num: '26', month: 'oct.', full: 'Lundi 26 octobre', slots: ['18 h'] },
  { dow: 'Mar.', num: '27', month: 'oct.', full: 'Mardi 27 octobre', slots: [] },
  { dow: 'Mer.', num: '28', month: 'oct.', full: 'Mercredi 28 octobre', slots: ['17 h', '18 h'] },
  { dow: 'Jeu.', num: '29', month: 'oct.', full: 'Jeudi 29 octobre', slots: [] },
  { dow: 'Ven.', num: '30', month: 'oct.', full: 'Vendredi 30 octobre', slots: ['17 h', '18 h'] },
  { dow: 'Sam.', num: '31', month: 'oct.', full: 'Samedi 31 octobre', slots: ['10 h', '12 h', '16 h'] },
  { dow: 'Dim.', num: '1', month: 'nov.', full: 'Dimanche 1er novembre', slots: [] },
  { dow: 'Lun.', num: '2', month: 'nov.', full: 'Lundi 2 novembre', slots: ['18 h'] },
  { dow: 'Mar.', num: '3', month: 'nov.', full: 'Mardi 3 novembre', slots: [] },
  { dow: 'Mer.', num: '4', month: 'nov.', full: 'Mercredi 4 novembre', slots: ['17 h', '18 h'] },
  { dow: 'Jeu.', num: '5', month: 'nov.', full: 'Jeudi 5 novembre', slots: [] },
  { dow: 'Ven.', num: '6', month: 'nov.', full: 'Vendredi 6 novembre', slots: ['17 h', '18 h'] },
  { dow: 'Sam.', num: '7', month: 'nov.', full: 'Samedi 7 novembre', slots: ['10 h', '12 h'] }
];

export const VISIT_QUICK_MESSAGES = ['Je viens avec un proche', 'Je peux venir plus tôt', 'Je cherche pour le 1er novembre'];
