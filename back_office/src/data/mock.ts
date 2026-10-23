// ============================================================================
// DONNÉES DE DÉMONSTRATION DU BACK OFFICE
// Une section par écran. À remplacer par les appels API quand le backend
// Sama Loyer sera prêt. Tarifs alignés sur la mini-app (paiement Max it).
// ============================================================================

import type { Tone } from '../components/ui'
import { fmt } from '../lib/utils'

/* --- Tarifs (identiques à la mini-app) ----------------------------------- */
export const PRICES = { pro: 15000, boost7: 1500, boost30: 6000 }
const F = (n: number) => `${fmt(n)} F`

/** Photo de logement libre de droits (même banque que la mini-app) */
const photo = (id: string) => `https://images.unsplash.com/photo-${id}?w=480&q=70&auto=format&fit=crop`
const PHOTO: Record<string, string> = {
  Salon: photo('1522708323590-d24dbb6b0267'),
  Chambre: photo('1540518614846-7eded433c457'),
  Cuisine: photo('1484154218962-a197022b5858'),
  Douche: photo('1552321554-5fefe8c9ef14'),
  Toilettes: photo('1584622650111-993a426fbf0a'),
  Façade: photo('1568605114967-8130f3a36994'),
  Cour: photo('1600585154340-be6161a56a0c'),
  Extérieur: photo('1512917774080-9991f1c4c750'),
  Vue: photo('1505691938895-1758d7feb511'),
  Studio: photo('1502672260266-1c1ef2d93688'),
}
export const photoOf = (label: string) => PHOTO[label] ?? PHOTO.Salon

/* --- Tableau de bord ------------------------------------------------------ */

export type Range = 'w' | 'm' | 'y'

/** Inscriptions selon la période choisie sur le tableau de bord */
export const SIGNUPS_BY_RANGE: Record<Range, { title: string; sub: string; labels: string[]; values: number[] }> = {
  w: {
    title: 'Nouvelles inscriptions par jour',
    sub: 'Locataires et bailleurs · 7 derniers jours',
    labels: ['ven.', 'sam.', 'dim.', 'lun.', 'mar.', 'mer.', 'jeu.'],
    values: [38, 52, 61, 44, 47, 55, 63],
  },
  m: {
    title: 'Nouvelles inscriptions par semaine',
    sub: 'Locataires et bailleurs · 30 derniers jours',
    labels: ['1-7 oct.', '8-14 oct.', '15-21 oct.', '22-28 oct.'],
    values: [300, 330, 350, 400],
  },
  y: {
    title: 'Nouvelles inscriptions par mois',
    sub: 'Locataires et bailleurs · 12 derniers mois',
    labels: ['nov.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.'],
    values: [420, 510, 480, 620, 700, 760, 820, 900, 1040, 1130, 1210, 1380],
  },
}

export const ZONES: [string, number][] = [
  ['Dakar', 1340],
  ['Pikine', 860],
  ['Guédiawaye', 540],
  ['Rufisque', 380],
  ['Keur Massar', 292],
]

/* --- Transactions --------------------------------------------------------- */
export type TxStatus = 'Réussi' | 'Échoué' | 'En attente' | 'Remboursé'
export type TxType = 'Loyer' | 'Abonnement' | 'Boost' | 'Remboursement'

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
  { ref: 'TX-26-10-4821', date: '22 oct. 10:14', user: 'Aminata Sy', type: 'Loyer', label: 'Loyer oct. · Chambre salon Icotaf', method: 'Max it', amount: F(65000), status: 'Réussi' },
  { ref: 'TX-26-10-4820', date: '22 oct. 09:52', user: 'Moussa Diallo', type: 'Abonnement', label: 'Abonnement Pro mensuel', method: 'Max it', amount: F(PRICES.pro), status: 'Réussi' },
  { ref: 'TX-26-10-4819', date: '21 oct. 18:30', user: 'Ibrahima Sarr', type: 'Boost', label: 'Boost 30 jours', method: 'Max it', amount: F(PRICES.boost30), status: 'Échoué' },
  { ref: 'TX-26-10-4818', date: '21 oct. 16:05', user: 'Fatou Kane', type: 'Abonnement', label: 'Abonnement Pro mensuel', method: 'Max it', amount: F(PRICES.pro), status: 'En attente' },
  { ref: 'TX-26-10-4817', date: '20 oct. 11:41', user: 'Cheikh Fall', type: 'Remboursement', label: 'Remboursement Boost 7 jours', method: 'Max it', amount: F(PRICES.boost7), status: 'Remboursé' },
  { ref: 'TX-26-10-4816', date: '20 oct. 08:22', user: 'Ousmane Ba', type: 'Loyer', label: 'Loyer oct. · Studio Pikine Rue 10', method: 'Max it', amount: F(95000), status: 'Réussi' },
  { ref: 'TX-26-10-4815', date: '19 oct. 19:47', user: 'Khady Ndiaye', type: 'Boost', label: 'Boost 7 jours', method: 'Max it', amount: F(PRICES.boost7), status: 'Réussi' },
  { ref: 'TX-26-10-4814', date: '19 oct. 14:03', user: 'Mamadou Gueye', type: 'Abonnement', label: 'Abonnement Pro mensuel', method: 'Max it', amount: F(PRICES.pro), status: 'Échoué' },
  { ref: 'TX-26-10-4813', date: '19 oct. 09:30', user: 'Aïssatou Ba', type: 'Abonnement', label: 'Abonnement Pro mensuel', method: 'Max it', amount: F(PRICES.pro), status: 'Réussi' },
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
  plan: 'Pro' | 'Essai 30 jours' | 'Expiré'
}

export const BAILLEURS: Bailleur[] = [
  { id: 'b1', name: 'Moussa Diallo', initials: 'MD', color: '#0F1E3D', phone: '+221 77 ••• •• 41', zone: 'Pikine', ads: 6, since: '12 mars 2026', reports: 0, status: 'active', plan: 'Pro' },
  { id: 'b2', name: 'Khady Ndiaye', initials: 'KN', color: '#C8235F', phone: '+221 76 ••• •• 08', zone: 'Ouakam', ads: 2, since: '20 oct. 2026', reports: 0, status: 'pending', plan: 'Essai 30 jours' },
  { id: 'b3', name: 'Ibrahima Sarr', initials: 'IS', color: '#5B4BB7', phone: '+221 78 ••• •• 77', zone: 'Pikine Technopole', ads: 1, since: '19 oct. 2026', reports: 0, status: 'pending', plan: 'Essai 30 jours' },
  { id: 'b4', name: 'Ousmane Faye', initials: 'OF', color: '#8A5A00', phone: '+221 70 ••• •• 13', zone: 'Guédiawaye', ads: 4, since: '2 juin 2026', reports: 3, status: 'suspended', plan: 'Expiré' },
  { id: 'b5', name: 'Awa Ndour', initials: 'AN', color: '#11643F', phone: '+221 77 ••• •• 92', zone: 'Pikine Rue 10', ads: 3, since: '8 janv. 2026', reports: 1, status: 'active', plan: 'Pro' },
  { id: 'b6', name: 'Fatou Kane', initials: 'FK', color: '#3A4458', phone: '+221 76 ••• •• 55', zone: 'Thiaroye', ads: 1, since: '21 oct. 2026', reports: 0, status: 'pending', plan: 'Essai 30 jours' },
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
  photos: string[] // libellés des pièces, voir photoOf()
  video: boolean
  desc: string
  equip: string
  flags: string[]
}


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
  { id: 'trial', label: 'Essai gratuit', price: '0 F · 30 jours', sub: 'Accès complet, une seule fois par bailleur', sold: '58 essais en cours' },
  { id: 'pm', label: 'Pro mensuel', price: `${F(PRICES.pro)} / mois`, sub: 'Annonces illimitées · badge Pro', sold: '214 abonnés actifs' },
  { id: 'b7', label: 'Boost 7 jours', price: F(PRICES.boost7), sub: '1 annonce en tête de son quartier', sold: '86 achats ce mois' },
  { id: 'b30', label: 'Boost 30 jours', price: F(PRICES.boost30), sub: '1 annonce en tête de son quartier', sold: '41 achats ce mois' },
]

export const SPONSORED = [
  { id: 's1', title: 'Chambre salon · Icotaf', owner: 'Moussa Diallo', end: '15 nov.', sub: true, valid: true, dispo: true },
  { id: 's2', title: 'Studio meublé · Pikine Rue 10', owner: 'Moussa Diallo', end: '15 nov.', sub: true, valid: true, dispo: true },
  { id: 's3', title: 'Appartement F4 · Mermoz', owner: 'Awa Ndour', end: '2 nov.', sub: true, valid: true, dispo: false },
  { id: 's4', title: 'Chambre · Yoff Virage', owner: 'Ousmane Faye', end: '30 oct.', sub: false, valid: true, dispo: true },
  { id: 's5', title: 'Appartement F2 · Technopole', owner: 'Ibrahima Sarr', end: '19 nov.', sub: true, valid: false, dispo: true },
]

export const PREMIUM_PAYMENTS = [
  { who: 'Moussa Diallo', what: 'Pro mensuel', method: 'Max it', date: '22 oct.', amount: F(PRICES.pro) },
  { who: 'Awa Ndour', what: 'Boost 30 jours', method: 'Max it', date: '14 oct.', amount: F(PRICES.boost30) },
  { who: 'Khady Ndiaye', what: 'Boost 7 jours', method: 'Max it', date: '19 oct.', amount: F(PRICES.boost7) },
  { who: 'Aïssatou Ba', what: 'Pro mensuel', method: 'Max it', date: '19 oct.', amount: F(PRICES.pro) },
  { who: 'Ndèye Fall', what: 'Pro mensuel', method: 'Max it', date: '9 oct.', amount: F(PRICES.pro) },
]

/** Revenus Premium du mois : abonnés Pro + boosts vendus */
export const PREMIUM_REVENUE_30D = 214 * PRICES.pro + 86 * PRICES.boost7 + 41 * PRICES.boost30

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
  { subject: 'Paiement débité mais Premium non actif', user: 'Mamadou Gueye', channel: 'WhatsApp', when: 'il y a 3 h', agent: 'Finance · Ndèye', status: 'En cours' },
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
  { id: 'premium', label: 'Abonnement Pro et Boost', sub: 'Abonnement bailleur et mise en avant payante, via Max it', on: true },
  { id: 'rent', label: 'Paiement des loyers dans l’appli', sub: 'Le locataire paie son loyer avec Max it et reçoit son reçu', on: true },
  { id: 'contract', label: 'Contrat de location en ligne', sub: 'Modèle de contrat à signer dans l’appli', on: true },
  { id: 'refund', label: 'Remboursements', sub: 'Autorise l’équipe Finance à rembourser', on: true },
  { id: 'autohide', label: 'Masquage automatique', sub: 'Masque les annonces non confirmées', on: true },
]

export const RULES = [
  { id: 'r-valid', label: 'Délai de validation des annonces (heures)', value: 24 },
  { id: 'r-remind', label: 'Rappel de confirmation de disponibilité (jours)', value: 7 },
  { id: 'r-hide', label: 'Annonce masquée si non confirmée depuis (jours)', value: 21 },
  { id: 'r-susp', label: 'Signalements avant suspension automatique', value: 3 },
]

/* --- Annonces en ligne ---------------------------------------------------- */
export type AnnonceStatus = 'online' | 'stale' | 'rented' | 'hidden'

export const ANNONCE_STATUS: Record<AnnonceStatus, { label: string; tone: Tone }> = {
  online: { label: 'En ligne', tone: 'success' },
  stale: { label: 'À confirmer', tone: 'warning' },
  rented: { label: 'Louée, encore visible', tone: 'danger' },
  hidden: { label: 'Masquée', tone: 'neutral' },
}

export interface AnnonceEnLigne {
  id: string
  title: string
  zone: string
  owner: string
  price: number
  views: number
  confirmed: string
  photo: string
  boosted: boolean
  status: AnnonceStatus
}

export const ANNONCES_EN_LIGNE: AnnonceEnLigne[] = [
  { id: 'a1', title: 'Chambre salon', zone: 'Icotaf, Pikine', owner: 'Moussa Diallo', price: 65000, views: 412, confirmed: 'il y a 2 j', photo: 'Salon', boosted: true, status: 'online' },
  { id: 'a2', title: 'Studio meublé', zone: 'Pikine Rue 10', owner: 'Moussa Diallo', price: 95000, views: 298, confirmed: 'il y a 5 j', photo: 'Studio', boosted: true, status: 'online' },
  { id: 'a3', title: 'Appartement F4', zone: 'Mermoz', owner: 'Awa Ndour', price: 350000, views: 187, confirmed: 'il y a 24 j', photo: 'Cuisine', boosted: false, status: 'rented' },
  { id: 'a4', title: 'Appartement F3', zone: 'Technopole, Pikine', owner: 'Awa Ndour', price: 180000, views: 156, confirmed: 'il y a 1 j', photo: 'Chambre', boosted: false, status: 'online' },
  { id: 'a5', title: 'Chambre', zone: 'Yoff Virage', owner: 'Ousmane Faye', price: 50000, views: 64, confirmed: 'il y a 26 j', photo: 'Façade', boosted: false, status: 'stale' },
  { id: 'a6', title: 'Chambre', zone: 'Guinaw Rails', owner: 'Ousmane Faye', price: 45000, views: 233, confirmed: 'il y a 9 j', photo: 'Douche', boosted: false, status: 'hidden' },
  { id: 'a7', title: 'Studio', zone: 'Ouakam', owner: 'Khady Ndiaye', price: 85000, views: 41, confirmed: 'il y a 22 j', photo: 'Vue', boosted: false, status: 'stale' },
  { id: 'a8', title: 'Chambre salon', zone: 'Thiaroye', owner: 'Fatou Kane', price: 55000, views: 120, confirmed: 'il y a 3 j', photo: 'Extérieur', boosted: false, status: 'online' },
]

/* --- Locations et loyers ------------------------------------------------- */
export type LocationStatus = 'ok' | 'late' | 'notice' | 'ended'
export type MonthState = 'paid' | 'late' | 'due'

export const LOCATION_STATUS: Record<LocationStatus, { label: string; tone: Tone }> = {
  ok: { label: 'À jour', tone: 'success' },
  late: { label: 'En retard', tone: 'danger' },
  notice: { label: 'Préavis de départ', tone: 'warning' },
  ended: { label: 'Terminée', tone: 'neutral' },
}

export interface Location {
  id: string
  tenant: string
  logement: string
  owner: string
  rent: number
  caution: number
  start: string
  next: string
  via: string
  contract: string
  status: LocationStatus
  info: string
  months: { m: string; s: MonthState }[]
}

const lastMonths = (...s: MonthState[]) =>
  ['mai', 'juin', 'juil.', 'août', 'sept.', 'oct.'].slice(-s.length).map((m, i) => ({ m, s: s[i] }))

export const LOCATIONS: Location[] = [
  { id: 'l1', tenant: 'Aminata Sy', logement: 'Chambre salon · Icotaf', owner: 'Moussa Diallo', rent: 65000, caution: 65000, start: '1 mai 2026', next: '1 nov.', via: 'Louer sans visite', contract: 'CT-2026-0412', status: 'ok', info: 'Tous les loyers payés avec Max it, à l’heure.', months: lastMonths('paid', 'paid', 'paid', 'paid', 'paid', 'paid') },
  { id: 'l2', tenant: 'Ousmane Ba', logement: 'Studio meublé · Pikine Rue 10', owner: 'Moussa Diallo', rent: 95000, caution: 190000, start: '1 juil. 2026', next: '1 nov.', via: 'Après visite', contract: 'CT-2026-0538', status: 'ok', info: 'Loyer d’octobre payé le 20 oct.', months: lastMonths('paid', 'paid', 'paid', 'paid') },
  { id: 'l3', tenant: 'Modou Sarr', logement: 'Appartement F3 · Technopole', owner: 'Awa Ndour', rent: 180000, caution: 180000, start: '1 juin 2026', next: '1 oct.', via: 'Après visite', contract: 'CT-2026-0471', status: 'late', info: 'Loyer d’octobre non payé : 22 jours de retard. 2 rappels SMS envoyés.', months: lastMonths('paid', 'paid', 'paid', 'paid', 'late') },
  { id: 'l4', tenant: 'Cheikh Ndiaye', logement: 'Chambre · Guinaw Rails', owner: 'Ousmane Faye', rent: 45000, caution: 45000, start: '1 mai 2026', next: '1 oct.', via: 'Louer sans visite', contract: 'CT-2026-0398', status: 'late', info: 'Paiement en espèces déclaré par le locataire, pas encore confirmé par le bailleur.', months: lastMonths('paid', 'paid', 'paid', 'paid', 'paid', 'late') },
  { id: 'l5', tenant: 'Binta Sow', logement: 'Chambre salon · Thiaroye', owner: 'Fatou Kane', rent: 55000, caution: 55000, start: '1 août 2026', next: '1 nov.', via: 'Après visite', contract: 'CT-2026-0602', status: 'notice', info: 'Préavis envoyé le 30 sept. : départ le 31 oct. Caution de 55 000 F à restituer.', months: lastMonths('paid', 'paid', 'paid') },
  { id: 'l6', tenant: 'Mariama Diop', logement: 'Studio · Ouakam', owner: 'Khady Ndiaye', rent: 85000, caution: 85000, start: '1 févr. 2026', next: '—', via: 'Après visite', contract: 'CT-2026-0117', status: 'ended', info: 'Bail terminé le 30 sept. Caution restituée le 3 oct.', months: lastMonths('paid', 'paid', 'paid', 'paid', 'paid') },
]

/* --- Locataires ------------------------------------------------------------ */
export type LocataireStatus = 'active' | 'flagged' | 'suspended'

export const LOCATAIRE_STATUS: Record<LocataireStatus, { label: string; tone: Tone }> = {
  active: { label: 'Actif', tone: 'success' },
  flagged: { label: 'Signalé', tone: 'warning' },
  suspended: { label: 'Suspendu', tone: 'danger' },
}

export interface Locataire {
  id: string
  name: string
  initials: string
  color: string
  phone: string
  logement: string
  since: string
  paid: number
  onTime: number
  reports: number
  status: LocataireStatus
  note: string
}

export const LOCATAIRES: Locataire[] = [
  { id: 't1', name: 'Aminata Sy', initials: 'AS', color: '#C8235F', phone: '+221 77 ••• •• 18', logement: 'Chambre salon · Icotaf', since: '28 avr. 2026', paid: 6, onTime: 100, reports: 0, status: 'active', note: 'Locataire modèle : 6 loyers payés à l’heure avec Max it.' },
  { id: 't2', name: 'Ousmane Ba', initials: 'OB', color: '#0F1E3D', phone: '+221 78 ••• •• 52', logement: 'Studio meublé · Pikine Rue 10', since: '20 juin 2026', paid: 4, onTime: 100, reports: 0, status: 'active', note: 'Aucun incident.' },
  { id: 't3', name: 'Modou Sarr', initials: 'MS', color: '#5B4BB7', phone: '+221 76 ••• •• 07', logement: 'Appartement F3 · Technopole', since: '25 mai 2026', paid: 4, onTime: 75, reports: 1, status: 'flagged', note: 'Loyer d’octobre en retard. Signalé par le bailleur pour non-paiement.' },
  { id: 't4', name: 'Cheikh Ndiaye', initials: 'CN', color: '#8A5A00', phone: '+221 70 ••• •• 33', logement: 'Chambre · Guinaw Rails', since: '29 avr. 2026', paid: 5, onTime: 80, reports: 0, status: 'active', note: 'Dernier paiement déclaré en espèces, à confirmer par le bailleur.' },
  { id: 't5', name: 'Binta Sow', initials: 'BS', color: '#11643F', phone: '+221 77 ••• •• 90', logement: 'Chambre salon · Thiaroye', since: '27 juil. 2026', paid: 3, onTime: 100, reports: 0, status: 'active', note: 'Préavis de départ en cours (31 oct.).' },
  { id: 't6', name: 'Pape Diouf', initials: 'PD', color: '#3A4458', phone: '+221 76 ••• •• 61', logement: '—', since: '2 oct. 2026', paid: 0, onTime: 0, reports: 3, status: 'suspended', note: 'Suspendu : 3 bailleurs signalent des visites réservées sans venir et des messages insultants.' },
]

/* --- Abonnés bailleurs ----------------------------------------------------- */
export interface Abonne {
  id: string
  name: string
  plan: 'Essai 30 jours' | 'Pro mensuel'
  start: string
  end: string
  daysLeft: number
}

export const ABONNES: Abonne[] = [
  { id: 's1', name: 'Moussa Diallo', plan: 'Pro mensuel', start: '15 oct. 2026', end: '14 nov. 2026', daysLeft: 22 },
  { id: 's2', name: 'Awa Ndour', plan: 'Pro mensuel', start: '27 sept. 2026', end: '27 oct. 2026', daysLeft: 4 },
  { id: 's3', name: 'Khady Ndiaye', plan: 'Essai 30 jours', start: '20 oct. 2026', end: '19 nov. 2026', daysLeft: 27 },
  { id: 's4', name: 'Ibrahima Sarr', plan: 'Essai 30 jours', start: '19 oct. 2026', end: '18 nov. 2026', daysLeft: 26 },
  { id: 's5', name: 'Fatou Kane', plan: 'Essai 30 jours', start: '26 sept. 2026', end: '26 oct. 2026', daysLeft: 3 },
  { id: 's6', name: 'Mamadou Gueye', plan: 'Pro mensuel', start: '11 sept. 2026', end: '11 oct. 2026', daysLeft: -12 },
  { id: 's7', name: 'Ousmane Faye', plan: 'Pro mensuel', start: '30 août 2026', end: '30 sept. 2026', daysLeft: -23 },
]

/* --- Compteurs (barre latérale, tableau de bord) ----------------------------
   Calculés depuis les listes ci-dessus pour que tous les écrans affichent
   les mêmes chiffres. */
export const COUNTS = {
  annonces: ANNONCES_A_VALIDER.length,
  bailleurs: BAILLEURS.filter((b) => b.status === 'pending').length,
  reclamations: REPORTS.length,
  urgentes: REPORTS.filter((r) => r.prio === 'Urgent').length,
  txEchec: TRANSACTIONS.filter((t) => t.status === 'Échoué').length,
  annoncesAVerifier: ANNONCES_EN_LIGNE.filter((a) => a.status === 'stale' || a.status === 'rented').length,
  loyersRetard: LOCATIONS.filter((l) => l.status === 'late').length,
  locatairesSignales: LOCATAIRES.filter((l) => l.status === 'flagged').length,
  abonnesAExpirer: ABONNES.filter((a) => a.daysLeft >= 0 && a.daysLeft <= 7).length,
}

type Tendance = 'up' | 'down' | 'warn'

/** Indicateurs du haut du tableau de bord, selon la période */
export function kpisFor(range: Range): { label: string; value: string; delta: string; tone: Tendance; to: string }[] {
  const p = {
    w: { j: '7 j', users: '+2 % sur 7 jours', rent: '6,3 M F', rentN: '241 paiements Max it', pro: '+5 cette semaine' },
    m: { j: '30 j', users: '+8 % sur 30 jours', rent: '27,4 M F', rentN: '1 027 paiements Max it', pro: '+19 ce mois' },
    y: { j: '12 mois', users: '+64 % sur 12 mois', rent: '298 M F', rentN: '11 240 paiements Max it', pro: '+182 sur 12 mois' },
  }[range]
  return [
    { label: 'Utilisateurs inscrits', value: '12 480', delta: p.users, tone: 'up', to: '' },
    { label: 'Bailleurs actifs', value: '1 236', delta: `${COUNTS.bailleurs} à vérifier`, tone: 'warn', to: '/bailleurs' },
    { label: 'Annonces en ligne', value: '3 412', delta: `${COUNTS.annonces} en validation`, tone: 'warn', to: '/validation' },
    { label: 'Abonnés Pro', value: '214', delta: p.pro, tone: 'up', to: '/premium' },
    { label: `Loyers payés (${p.j})`, value: p.rent, delta: p.rentN, tone: 'up', to: '/transactions' },
  ]
}

export const TODO = [
  { n: COUNTS.annonces, label: 'Annonces à valider', sub: `La plus ancienne attend depuis ${ANNONCES_A_VALIDER[0].wait}`, to: '/validation', color: '#C8235F' },
  { n: COUNTS.bailleurs, label: 'Bailleurs à vérifier', sub: 'Pièces d’identité envoyées', to: '/bailleurs', color: '#0F1E3D' },
  { n: COUNTS.reclamations, label: 'Réclamations ouvertes', sub: `${COUNTS.urgentes} urgentes`, to: '/reclamations', color: '#A3261F' },
  { n: COUNTS.loyersRetard, label: 'Loyers en retard', sub: 'Rappels SMS à suivre', to: '/locations', color: '#C8235F' },
  { n: COUNTS.txEchec, label: 'Paiements en échec', sub: 'À vérifier avec Max it', to: '/transactions', color: '#8A5A00' },
]
