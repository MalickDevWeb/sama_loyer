// ============================================================================
// DONNÉES DE DÉMONSTRATION DU BACK OFFICE
// Une section par écran. À remplacer par les appels API quand le backend
// Sama Logement sera prêt. "[PRIX]" / "[MONTANT]" = tarifs pas encore fixés.
// ============================================================================

import type { Tone } from '../components/ui'

/* --- Tableau de bord ------------------------------------------------------ */
export const DASHBOARD_KPIS = [
  { label: 'Utilisateurs inscrits', value: '12 480', delta: '+8 % sur 30 jours', tone: 'up', to: '' },
  { label: 'Bailleurs actifs', value: '1 236', delta: '8 à vérifier', tone: 'warn', to: '/bailleurs' },
  { label: 'Annonces en ligne', value: '3 412', delta: '12 en validation', tone: 'warn', to: '/validation' },
  { label: 'Abonnés Premium', value: '214', delta: '+19 ce mois', tone: 'up', to: '/premium' },
  { label: 'Transactions (30 j)', value: '1 027', delta: '3 en échec', tone: 'down', to: '/transactions' },
] as const

export const SIGNUP_MONTHS = ['nov.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.']
export const SIGNUPS = [420, 510, 480, 620, 700, 760, 820, 900, 1040, 1130, 1210, 1380]

export const TODO = [
  { n: 12, label: 'Annonces à valider', sub: 'La plus ancienne attend depuis 19 h', to: '/validation', color: '#C8235F' },
  { n: 8, label: 'Bailleurs à vérifier', sub: 'Pièces d’identité envoyées', to: '/bailleurs', color: '#0F1E3D' },
  { n: 5, label: 'Réclamations ouvertes', sub: '2 urgentes', to: '/reclamations', color: '#A3261F' },
  { n: 3, label: 'Paiements en échec', sub: 'À vérifier avec l’opérateur', to: '/transactions', color: '#8A5A00' },
]

export const ZONES: [string, number][] = [
  ['Dakar', 1340],
  ['Pikine', 860],
  ['Guédiawaye', 540],
  ['Rufisque', 380],
  ['Keur Massar', 292],
]

/* --- Transactions --------------------------------------------------------- */
export type TxStatus = 'Réussi' | 'Échoué' | 'En attente' | 'Remboursé'
export type TxType = 'Premium' | 'Boost' | 'Remboursement'

export const TX_TONE: Record<TxStatus, Tone> = {
  Réussi: 'success',
  Échoué: 'danger',
  'En attente': 'warning',
  Remboursé: 'neutral',
}

export interface Transaction {
  ref: string
  date: string
  user: string
  type: TxType
  label: string
  method: string
  amount: string
  status: TxStatus
}

export const TRANSACTIONS: Transaction[] = [
  { ref: 'TX-26-10-4821', date: '22 oct. 10:14', user: 'Moussa Diallo', type: 'Premium', label: 'Premium mensuel', method: 'Wave', amount: '[PRIX] F', status: 'Réussi' },
  { ref: 'TX-26-10-4820', date: '22 oct. 09:52', user: 'Awa Ndour', type: 'Boost', label: 'Boost 7 jours', method: 'Orange Money', amount: '[PRIX] F', status: 'Réussi' },
  { ref: 'TX-26-10-4819', date: '21 oct. 18:30', user: 'Ibrahima Sarr', type: 'Boost', label: 'Boost 30 jours', method: 'Wave', amount: '[PRIX] F', status: 'Échoué' },
  { ref: 'TX-26-10-4818', date: '21 oct. 16:05', user: 'Fatou Kane', type: 'Premium', label: 'Premium mensuel', method: 'Free Money', amount: '[PRIX] F', status: 'En attente' },
  { ref: 'TX-26-10-4817', date: '20 oct. 11:41', user: 'Cheikh Fall', type: 'Remboursement', label: 'Remboursement', method: 'Wave', amount: '[PRIX] F', status: 'Remboursé' },
  { ref: 'TX-26-10-4816', date: '20 oct. 08:22', user: 'Khady Ndiaye', type: 'Boost', label: 'Boost 7 jours', method: 'Wave', amount: '[PRIX] F', status: 'Réussi' },
  { ref: 'TX-26-10-4815', date: '19 oct. 19:47', user: 'Mamadou Gueye', type: 'Premium', label: 'Premium mensuel', method: 'Orange Money', amount: '[PRIX] F', status: 'Échoué' },
  { ref: 'TX-26-10-4814', date: '19 oct. 14:03', user: 'Aïssatou Ba', type: 'Premium', label: 'Premium mensuel', method: 'Wave', amount: '[PRIX] F', status: 'Réussi' },
]

/* --- Bailleurs ------------------------------------------------------------ */
export type BailleurStatus = 'active' | 'pending' | 'suspended' | 'rejected'

export interface Bailleur {
  id: string
  name: string
  initials: string
  color: string
  phone: string
  zone: string
  ads: number
  since: string
  reports: number
  status: BailleurStatus
  plan: 'Premium' | 'Gratuit'
}

export const BAILLEURS: Bailleur[] = [
  { id: 'b1', name: 'Moussa Diallo', initials: 'MD', color: '#0F1E3D', phone: '+221 77 ••• •• 41', zone: 'Pikine', ads: 6, since: '12 mars 2026', reports: 0, status: 'active', plan: 'Premium' },
  { id: 'b2', name: 'Khady Ndiaye', initials: 'KN', color: '#C8235F', phone: '+221 76 ••• •• 08', zone: 'Ouakam', ads: 2, since: '20 oct. 2026', reports: 0, status: 'pending', plan: 'Gratuit' },
  { id: 'b3', name: 'Ibrahima Sarr', initials: 'IS', color: '#5B4BB7', phone: '+221 78 ••• •• 77', zone: 'Pikine Technopole', ads: 1, since: '19 oct. 2026', reports: 0, status: 'pending', plan: 'Gratuit' },
  { id: 'b4', name: 'Ousmane Faye', initials: 'OF', color: '#8A5A00', phone: '+221 70 ••• •• 13', zone: 'Guédiawaye', ads: 4, since: '2 juin 2026', reports: 3, status: 'suspended', plan: 'Gratuit' },
  { id: 'b5', name: 'Awa Ndour', initials: 'AN', color: '#11643F', phone: '+221 77 ••• •• 92', zone: 'Pikine Rue 10', ads: 3, since: '8 janv. 2026', reports: 1, status: 'active', plan: 'Premium' },
  { id: 'b6', name: 'Fatou Kane', initials: 'FK', color: '#3A4458', phone: '+221 76 ••• •• 55', zone: 'Thiaroye', ads: 1, since: '21 oct. 2026', reports: 0, status: 'pending', plan: 'Gratuit' },
]

export const BAILLEUR_STATUS: Record<BailleurStatus, { label: string; tone: Tone; note: string }> = {
  active: { label: 'Vérifié', tone: 'success', note: 'Identité vérifiée. Le badge « Bailleur vérifié » est visible par les locataires.' },
  pending: { label: 'À vérifier', tone: 'warning', note: 'Pièce envoyée. Vérifie que le nom correspond au compte et que la photo est lisible.' },
  suspended: { label: 'Suspendu', tone: 'danger', note: 'Compte suspendu : 3 signalements « demande d’argent avant visite ». Ses annonces sont masquées.' },
  rejected: { label: 'Pièce refusée', tone: 'neutral', note: 'Pièce refusée. Le bailleur a reçu un SMS pour en envoyer une nouvelle.' },
}

/* --- Validation des annonces --------------------------------------------- */
export interface AnnonceAValider {
  id: string
  title: string
  type: string
  place: string
  price: string
  caution: string
  owner: string
  ownerOk: boolean
  wait: string
  photos: string[]
  video: boolean
  desc: string
  equip: string
  flags: string[]
}

export const TINTS = ['#FBE3EC', '#E3E9F5', '#F3ECE1', '#E2F0EA', '#EDE6F5', '#FBE3EC']

export const ANNONCES_A_VALIDER: AnnonceAValider[] = [
  {
    id: 'v1', title: 'Appartement F2 neuf', type: 'Appartement', place: 'Pikine Technopole', price: '140 000', caution: '2 mois', owner: 'Ibrahima Sarr', ownerOk: false, wait: '19 h',
    photos: ['Salon', 'Chambre', 'Cuisine', 'Douche', 'Façade'], video: true,
    desc: 'Appartement neuf au 2e étage : un salon, une chambre, une cuisine équipée et une salle de bain. Quartier calme, proche de la route de Rufisque. Appelez-moi au 77 xxx xx xx.',
    equip: 'Cuisine, Douche intérieure, Toilettes, Eau, Électricité',
    flags: ['Numéro de téléphone détecté dans la description', 'Bailleur pas encore vérifié'],
  },
  {
    id: 'v2', title: 'Chambre salon carrelée', type: 'Chambre salon', place: 'Ouakam, Tonghor', price: '55 000', caution: '1 mois', owner: 'Khady Ndiaye', ownerOk: false, wait: '6 h',
    photos: ['Chambre', 'Salon', 'Douche', 'Cour'], video: false,
    desc: 'Chambre salon carrelée, toilettes privées, dans une maison familiale. Libre le 1er novembre.',
    equip: 'Toilettes, Douche intérieure, Eau, Électricité', flags: [],
  },
  {
    id: 'v3', title: 'Studio vue mer', type: 'Studio', place: 'Ngor', price: '45 000', caution: '3 mois', owner: 'Inconnu (compte de 2 j)', ownerOk: false, wait: '3 h',
    photos: ['Vue', 'Studio'], video: false,
    desc: 'Studio vue mer meublé tout confort. Envoyez la caution par transfert pour réserver avant visite.',
    equip: 'Meublé, Wi-Fi, Climatisation',
    flags: ['Prix 60 % sous la moyenne du quartier', 'Demande de paiement avant visite', 'Seulement 2 photos', 'Photo identique à une autre annonce'],
  },
  {
    id: 'v4', title: 'Chambre indépendante', type: 'Chambre', place: 'Thiaroye', price: '40 000', caution: '1 mois', owner: 'Fatou Kane', ownerOk: false, wait: '1 h',
    photos: ['Chambre', 'Toilettes', 'Douche', 'Extérieur'], video: false,
    desc: 'Chambre avec entrée indépendante, toilettes à côté. Eau et électricité comprises.',
    equip: 'Toilettes, Eau, Électricité', flags: [],
  },
]

export const VALIDATION_CHECKS = [
  'Photos nettes et réelles (4 minimum)',
  'Prix et caution cohérents',
  'Aucun numéro ni lien dans la description',
  'Localisation précise',
  'Pas de doublon',
  'Bailleur vérifié ou en cours',
]

export const REFUSAL_REASONS = [
  'Photos floues ou insuffisantes',
  'Coordonnées dans la description',
  'Prix ou caution incohérents',
  'Annonce frauduleuse',
]

/* --- Premium -------------------------------------------------------------- */
export const OFFERS = [
  { id: 'pm', label: 'Premium mensuel', price: '[PRIX] F / mois', sub: '3 annonces mises en avant · badge Premium', sold: '214 abonnés actifs' },
  { id: 'b7', label: 'Boost 7 jours', price: '[PRIX] F', sub: '1 annonce en haut de son quartier', sold: '86 achats ce mois' },
  { id: 'b30', label: 'Boost 30 jours', price: '[PRIX] F', sub: '1 annonce en haut de son quartier', sold: '41 achats ce mois' },
]

export const SPONSORED = [
  { id: 's1', title: 'Chambre salon · Icotaf', owner: 'Moussa Diallo', end: '15 nov.', sub: true, valid: true, dispo: true },
  { id: 's2', title: 'Studio meublé · Pikine Rue 10', owner: 'Moussa Diallo', end: '15 nov.', sub: true, valid: true, dispo: true },
  { id: 's3', title: 'Appartement F4 · Mermoz', owner: 'Awa Ndour', end: '2 nov.', sub: true, valid: true, dispo: false },
  { id: 's4', title: 'Chambre · Yoff Virage', owner: 'Ousmane Faye', end: '30 oct.', sub: false, valid: true, dispo: true },
  { id: 's5', title: 'Appartement F2 · Technopole', owner: 'Ibrahima Sarr', end: '19 nov.', sub: true, valid: false, dispo: true },
]

export const PREMIUM_PAYMENTS = [
  { who: 'Moussa Diallo', what: 'Premium mensuel', method: 'Wave', date: '15 oct.', amount: '[PRIX] F' },
  { who: 'Awa Ndour', what: 'Boost 30 jours', method: 'Orange Money', date: '14 oct.', amount: '[PRIX] F' },
  { who: 'Khady Ndiaye', what: 'Boost 7 jours', method: 'Wave', date: '12 oct.', amount: '[PRIX] F' },
  { who: 'Mamadou Gueye', what: 'Premium mensuel', method: 'Free Money', date: '11 oct.', amount: '[PRIX] F' },
  { who: 'Aïssatou Ba', what: 'Premium mensuel', method: 'Wave', date: '9 oct.', amount: '[PRIX] F' },
]

/* --- Réclamations et paramètres ------------------------------------------ */
export type Priority = 'Urgent' | 'Moyen' | 'Faible'

export const PRIORITY_TONE: Record<Priority, Tone> = { Urgent: 'danger', Moyen: 'warning', Faible: 'neutral' }

export const REPORTS: {
  id: string; prio: Priority; title: string; detail: string; by: string; when: string
  target: string; to: string; actLabel: string; done: string
}[] = [
  { id: 'r1', prio: 'Urgent', title: 'Demande d’argent avant la visite', detail: 'Le bailleur demande une caution par transfert avant toute visite.', by: '3 locataires', when: 'il y a 2 h', target: 'Studio vue mer · Ngor', to: '/validation', actLabel: 'Suspendre l’annonce et le compte', done: 'Annonce et compte suspendus' },
  { id: 'r2', prio: 'Urgent', title: 'Logement inexistant', detail: 'Le locataire s’est déplacé : l’adresse donnée ne correspond à aucun logement.', by: 'Awa Diop', when: 'hier', target: 'Ousmane Faye', to: '/bailleurs', actLabel: 'Suspendre le bailleur', done: 'Bailleur suspendu' },
  { id: 'r3', prio: 'Moyen', title: 'Annonce toujours en ligne alors que louée', detail: 'Le bailleur ne répond plus depuis 10 jours.', by: 'Cheikh Fall', when: 'il y a 2 j', target: 'Appartement F4 · Mermoz', to: '/premium', actLabel: 'Masquer l’annonce', done: 'Annonce masquée' },
  { id: 'r4', prio: 'Faible', title: 'Photos ne correspondant pas', detail: 'La douche n’est pas intérieure comme indiqué.', by: 'Mariama Sow', when: 'il y a 3 j', target: 'Chambre · Dalifort', to: '/validation', actLabel: 'Demander une correction', done: 'Correction demandée' },
]

export type TicketStatus = 'En cours' | 'Nouveau' | 'Résolu'

export const TICKET_TONE: Record<TicketStatus, Tone> = { 'En cours': 'info', Nouveau: 'warning', Résolu: 'success' }

export const TICKETS: { subject: string; user: string; channel: string; when: string; agent: string; status: TicketStatus }[] = [
  { subject: 'Je n’arrive pas à me connecter', user: 'Binta S.', channel: 'Dans l’appli', when: 'il y a 1 h', agent: 'Support · Lamine', status: 'En cours' },
  { subject: 'Paiement Wave débité mais Premium non actif', user: 'Mamadou Gueye', channel: 'WhatsApp', when: 'il y a 3 h', agent: 'Finance · Ndèye', status: 'En cours' },
  { subject: 'Changer mon numéro de téléphone', user: 'Awa Diop', channel: 'Dans l’appli', when: 'hier', agent: 'Non assignée', status: 'Nouveau' },
  { subject: 'Comment ajouter une vidéo ?', user: 'Moussa Diallo', channel: 'Téléphone', when: 'il y a 2 j', agent: 'Support · Lamine', status: 'Résolu' },
]

export const PERMISSIONS = ['Annonces', 'Bailleurs', 'Réclamations', 'Transactions', 'Remboursements', 'Paramètres']

export const ROLES = [
  { name: 'Super admin', members: '1 membre', perms: [true, true, true, true, true, true] },
  { name: 'Modérateur', members: '3 membres', perms: [true, true, true, false, false, false] },
  { name: 'Support', members: '2 membres', perms: [false, false, true, false, false, false] },
  { name: 'Finance', members: '1 membre', perms: [false, false, false, true, true, false] },
]

export const FEATURES = [
  { id: 'voice', label: 'Recherche vocale (wolof et français)', sub: 'Micro sur l’accueil et dans les messages', on: true },
  { id: 'premium', label: 'Premium et Boost', sub: 'Mise en avant payante des annonces', on: true },
  { id: 'rent', label: 'Paiement des loyers dans l’appli', sub: 'Le locataire paie son loyer via Wave, Orange Money ou Free Money', on: false },
  { id: 'contract', label: 'Contrat de location en ligne', sub: 'Modèle de contrat à signer dans l’appli', on: false },
  { id: 'refund', label: 'Remboursements', sub: 'Autorise l’équipe Finance à rembourser', on: true },
  { id: 'autohide', label: 'Masquage automatique', sub: 'Masque les annonces non confirmées', on: true },
]

export const RULES = [
  { id: 'r-valid', label: 'Délai de validation des annonces (heures)', value: 24 },
  { id: 'r-remind', label: 'Rappel de confirmation de disponibilité (jours)', value: 7 },
  { id: 'r-hide', label: 'Annonce masquée si non confirmée depuis (jours)', value: 21 },
  { id: 'r-susp', label: 'Signalements avant suspension automatique', value: 3 },
]
