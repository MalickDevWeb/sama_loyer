import { storage } from '../storage.js';
import { STORAGE_KEYS } from '../constants/index.js';
import { getMedia, withCover } from './media.js';

// ============================================================================
// LOGEMENTS — SOURCE UNIQUE DE DONNÉES FICTIVES (MOCK)
// Toutes les pages (accueil, recherche, fiche, favoris) lisent ce catalogue,
// pour que les identifiants restent cohérents d'une page à l'autre.
// À remplacer par BackendAPI + un schéma json-sculpt quand l'API sera prête.
// ============================================================================

export const LOGEMENTS = [
  {
    id: 'coloc-isep-keur-gorgui',
    title: 'Chambre 4 lits étudiants (Hommes)',
    typeLabel: 'Chambre partagée',
    place: 'Cité Keur Gorgui',
    zone: 'mermoz',
    price: 25000,
    caution: 25000,
    avance: 25000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité & visite vérifiées',
    dateConfirmation: "Confirmé aujourd'hui",
    phone: '771234567',
    bailleurName: 'Mamadou Diallo',
    equipements: ['Woyofal individuel', 'Wifi fibre', 'Espace étude'],
    description: "Chambre partagée pour 4 étudiants ou jeunes actifs à Keur Gorgui. Deux places réservées par des étudiants de l'ISEP, deux places disponibles immédiatement.",
    tint: '#E3E9F5',
    isColoc: true,
    roomCapacity: 4,
    availablePlacesCount: 2,
    placePrice: 25000,
    soloPrice: 90000,
    genderPolicy: 'HOMMES_UNIQUEMENT',
    genderPolicyLabel: 'Hommes uniquement',
    multiGroupAllowed: true,
    smokingPolicy: 'FORBIDDEN',
    alcoholPolicy: 'FORBIDDEN',
    incompletePolicy: 'ANNULATION_REMBOURSEMENT',
    places: [
      { id: 'kg-1', placeNumber: 1, status: 'OCCUPEE', statusLabel: 'Occupé (Groupe ISEP)' },
      { id: 'kg-2', placeNumber: 2, status: 'OCCUPEE', statusLabel: 'Occupé (Groupe ISEP)' },
      { id: 'kg-3', placeNumber: 3, status: 'DISPONIBLE', statusLabel: 'Disponible' },
      { id: 'kg-4', placeNumber: 4, status: 'DISPONIBLE', statusLabel: 'Disponible' }
    ]
  },
  {
    id: 'coloc-femmes-ouakam',
    title: 'Chambre 2 lits calme (Femmes)',
    typeLabel: 'Chambre partagée',
    place: 'Ouakam, Cité Avion',
    zone: 'ouakam',
    price: 40000,
    caution: 40000,
    avance: 40000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité vérifiée',
    dateConfirmation: 'Confirmé hier',
    phone: '782345678',
    bailleurName: 'Aïssatou Sow',
    equipements: ['Toilettes privées', 'Cuisine équipée', 'Ventilateur'],
    description: 'Chambre de 2 lits pour étudiantes ou jeunes actives à Ouakam. 1ère place occupée par Awa D., 2ème place libre.',
    tint: '#FBE3EC',
    isColoc: true,
    roomCapacity: 2,
    availablePlacesCount: 1,
    placePrice: 40000,
    soloPrice: 80000,
    genderPolicy: 'FEMMES_UNIQUEMENT',
    genderPolicyLabel: 'Femmes uniquement',
    multiGroupAllowed: false,
    smokingPolicy: 'FORBIDDEN',
    alcoholPolicy: 'FORBIDDEN',
    incompletePolicy: 'ANNULATION_REMBOURSEMENT',
    places: [
      { id: 'ow-1', placeNumber: 1, status: 'OCCUPEE', statusLabel: 'Occupé (Awa D.)' },
      { id: 'ow-2', placeNumber: 2, status: 'DISPONIBLE', statusLabel: 'Disponible' }
    ]
  },
  {
    id: 'coloc-couples-mermoz',
    title: 'Studio partagé (Couples uniquement)',
    typeLabel: 'Chambre partagée',
    place: 'Mermoz Pyrotechnie',
    zone: 'mermoz',
    price: 60000,
    caution: 60000,
    avance: 60000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité & visite vérifiées',
    dateConfirmation: 'Confirmé il y a 3 jours',
    phone: '776789012',
    bailleurName: 'Cheikh Gueye',
    equipements: ['Lit double', 'Douche privative', 'Balcon'],
    description: 'Studio réservé exclusivement aux couples déclarés et confirmés par les deux conjoints.',
    tint: '#F3ECE1',
    isColoc: true,
    roomCapacity: 2,
    availablePlacesCount: 2,
    placePrice: 60000,
    soloPrice: 120000,
    genderPolicy: 'COUPLES_UNIQUEMENT',
    genderPolicyLabel: 'Couples uniquement',
    multiGroupAllowed: false,
    smokingPolicy: 'FORBIDDEN',
    alcoholPolicy: 'FORBIDDEN',
    incompletePolicy: 'POURSUIVRE_AU_PRIX_SOLO',
    places: [
      { id: 'mz-1', placeNumber: 1, status: 'DISPONIBLE', statusLabel: 'Conjoint 1 (Libre)' },
      { id: 'mz-2', placeNumber: 2, status: 'DISPONIBLE', statusLabel: 'Conjoint 2 (Libre)' }
    ]
  },
  {
    id: 'coloc-libre-fann',
    title: 'Chambre 3 lits 100% libre (Groupe libre)',
    typeLabel: 'Chambre partagée',
    place: 'Fann Résidence',
    zone: 'fann',
    price: 30000,
    caution: 30000,
    avance: 30000,
    frais: 0,
    verified: true,
    verificationLevel: 'Numéro vérifié',
    dateConfirmation: "Confirmé aujourd'hui",
    phone: '771234567',
    bailleurName: 'Mamadou Diallo',
    equipements: ['Proche UCAD', 'Eau courante SDE', 'Balcon'],
    description: "Chambre neuve de 3 lits prête pour accueillir un nouveau groupe d'amis ou des réservations individuelles.",
    tint: '#E3E9F5',
    isColoc: true,
    roomCapacity: 3,
    availablePlacesCount: 3,
    placePrice: 30000,
    soloPrice: 85000,
    genderPolicy: 'HOMMES_UNIQUEMENT',
    genderPolicyLabel: 'Hommes uniquement',
    multiGroupAllowed: true,
    smokingPolicy: 'FORBIDDEN',
    alcoholPolicy: 'FORBIDDEN',
    incompletePolicy: 'ANNULATION_REMBOURSEMENT',
    places: [
      { id: 'fn-1', placeNumber: 1, status: 'DISPONIBLE', statusLabel: 'Disponible' },
      { id: 'fn-2', placeNumber: 2, status: 'DISPONIBLE', statusLabel: 'Disponible' },
      { id: 'fn-3', placeNumber: 3, status: 'DISPONIBLE', statusLabel: 'Disponible' }
    ]
  },
  {
    id: 'ouakam-cite-avion',
    title: 'Avec toilettes privées',
    typeLabel: 'Chambre salon',
    place: 'Ouakam, Cité Avion',
    zone: 'ouakam',
    price: 60000,
    caution: 60000,
    avance: 60000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité & visite vérifiées',
    dateConfirmation: 'Confirmé il y a 2 jours',
    phone: '771234567',
    bailleurName: 'Mamadou Diallo',
    equipements: ['Toilettes privées', 'Compteur Woyofal individuel', 'Eau courante SDE'],
    description: 'Chambre salon spacieuse, bien ventilée, située dans un quartier calme et accessible à Ouakam Cité Avion.',
    tint: '#FBE3EC'
  },
  {
    id: 'ouakam-tonghor',
    title: 'Chambre salon carrelée',
    typeLabel: 'Chambre salon',
    place: 'Ouakam, Tonghor',
    zone: 'ouakam',
    price: 55000,
    caution: 55000,
    avance: 55000,
    frais: 0,
    verified: true,
    verificationLevel: 'Numéro vérifié',
    dateConfirmation: 'Confirmé hier',
    phone: '782345678',
    bailleurName: 'Aïssatou Sow',
    equipements: ['Carrelage moderne', 'Toilettes partagées propres', 'Woyofal'],
    description: 'Logement propre et carrelé à Ouakam Tonghor, proche des commerces et du marché.',
    tint: '#E3E9F5'
  },
  {
    id: 'ngor-village',
    title: 'Chambre simple, calme',
    typeLabel: 'Chambre',
    place: 'Ngor Village',
    zone: 'ngor',
    price: 50000,
    caution: 50000,
    avance: 50000,
    frais: 0,
    verified: false,
    verificationLevel: 'Déclaré par le bailleur',
    dateConfirmation: 'Confirmé aujourd’hui',
    phone: '763456789',
    bailleurName: 'Ousmane Ndiaye',
    equipements: ['Quartier calme', 'Proche de la plage', 'Eau comprise'],
    description: 'Chambre individuelle au calme dans le village traditionnel de Ngor, idéale pour étudiant ou travailleur.',
    tint: '#F3ECE1'
  },
  {
    id: 'mermoz-balcon',
    title: 'Chambre avec balcon',
    typeLabel: 'Chambre',
    place: 'Mermoz',
    zone: 'mermoz',
    price: 65000,
    caution: 65000,
    avance: 65000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité vérifiée',
    dateConfirmation: 'Confirmé il y a 3 jours',
    phone: '774567890',
    bailleurName: 'Abdoulaye Ba',
    equipements: ['Balcon privé', 'Toilettes intérieures', 'Accès terrasse'],
    description: 'Superbe chambre avec balcon privé dans une villa paisible à Mermoz, proche universités et VDN.',
    tint: '#FBE3EC'
  },
  {
    id: 'point-e-studio',
    title: 'Studio meublé',
    typeLabel: 'Studio',
    place: 'Point E',
    zone: 'point e',
    price: 150000,
    caution: 150000,
    avance: 150000,
    frais: 10000,
    verified: true,
    verificationLevel: 'Agence certifiée',
    dateConfirmation: 'Confirmé hier',
    phone: '705678901',
    bailleurName: 'Fatou Diop',
    equipements: ['Meublé complet', 'Climatisation', 'Wifi fibre haut débit'],
    description: 'Studio standing entièrement équipé au Point E avec cuisine américaine, sécurisé 24h/24.',
    tint: '#E3E9F5'
  },
  {
    id: 'yoff-virage',
    title: 'Chambre salon',
    typeLabel: 'Chambre salon',
    place: 'Yoff Virage',
    zone: 'yoff',
    price: 58000,
    caution: 58000,
    avance: 58000,
    frais: 0,
    verified: true,
    verificationLevel: 'Numéro vérifié',
    dateConfirmation: 'Confirmé il y a 1 jour',
    phone: '776789012',
    bailleurName: 'Cheikh Gueye',
    equipements: ['Vue dégagée', 'Toilettes privées', 'Proche VDN'],
    description: 'Chambre et salon avec belle luminosité à Yoff Virage, accès immédiat aux transports.',
    tint: '#F3ECE1'
  },
  {
    id: 'liberte6-f3',
    title: 'Appartement F3',
    typeLabel: 'Appartement',
    place: 'Liberté 6',
    zone: 'liberte',
    price: 250000,
    caution: 250000,
    avance: 250000,
    frais: 25000,
    verified: true,
    verificationLevel: 'Agence partenaire vérifiée',
    dateConfirmation: 'Confirmé il y a 4 jours',
    phone: '777890123',
    bailleurName: 'Cabinet Immo Horizon',
    equipements: ['2 chambres + salon', 'Cuisine avec placards', 'Parking sécurisé'],
    description: 'Appartement F3 familial au 2ème étage d’un immeuble neuf à Liberté 6 Extension.',
    tint: '#FBE3EC'
  },
  {
    id: 'grand-yoff-hlm',
    title: 'Chambre simple',
    typeLabel: 'Chambre',
    place: 'HLM Grand Yoff',
    zone: 'grand yoff',
    price: 45000,
    caution: 45000,
    avance: 45000,
    frais: 0,
    verified: false,
    verificationLevel: 'Déclaré par le bailleur',
    dateConfirmation: 'Confirmé il y a 2 jours',
    phone: '768901234',
    bailleurName: 'Ibrahima Sarr',
    equipements: ['Économique', 'Accès facile', 'Compteur partagé'],
    description: 'Petite chambre pour petit budget, très accessible à côté du terminus des bus.',
    tint: '#E3E9F5'
  },
  {
    id: 'sacre-coeur3-studio',
    title: 'Studio neuf',
    typeLabel: 'Studio',
    place: 'Sacré-Cœur 3',
    zone: 'sacre coeur',
    price: 120000,
    caution: 120000,
    avance: 120000,
    frais: 0,
    verified: true,
    verificationLevel: 'Bailleur vérifié',
    dateConfirmation: 'Confirmé il y a 1 jour',
    phone: '779012345',
    bailleurName: 'Mariama Fall',
    equipements: ['Immeuble neuf', 'Gardien 24/7', 'Chauffe-eau'],
    description: 'Studio moderne dans un quartier résidentiel très prisé de Sacré-Cœur 3.',
    tint: '#F3ECE1'
  },
  {
    id: 'keur-massar-maison',
    title: 'Maison avec cour',
    typeLabel: 'Maison',
    place: 'Keur Massar',
    zone: 'keur massar',
    price: 200000,
    caution: 200000,
    avance: 200000,
    frais: 0,
    verified: true,
    verificationLevel: 'Titre de propriété examiné',
    dateConfirmation: 'Confirmé il y a 5 jours',
    phone: '780123456',
    bailleurName: 'El Hadji Seck',
    equipements: ['Cour avant et arrière', 'Garage fermé', '3 chambres spacieuses'],
    description: 'Grande maison individuelle bien aérée à Keur Massar, quartier calme et sécurisé.',
    tint: '#FBE3EC'
  },
  // Listings Pikine / Prototype
  {
    id: 'icotaf-01',
    title: 'Chambre salon avec douche intérieure',
    typeLabel: 'Chambre salon',
    place: 'Icotaf, Pikine',
    zone: 'pikine',
    price: 65000,
    caution: 130000,
    avance: 65000,
    frais: 0,
    verified: true,
    isPremium: true,
    status: 'disponible',
    verificationLevel: 'Bailleur vérifié',
    dateConfirmation: 'Confirmé aujourd’hui',
    phone: '771234567',
    bailleurName: 'Moussa D.',
    equipements: ['Douche intérieure', 'Eau courante', 'Woyofal'],
    description: 'Chambre salon avec douche intérieure, disponible à Icotaf Pikine près de la pharmacie du marché.',
    tint: '#FBE3EC',
    // Fiche détaillée complète (maquette de référence)
    details: {
      publishedAgo: 'Publié il y a 2 h',
      place: 'Icotaf, Pikine — Dakar',
      placeDetails: 'Icotaf, Pikine — près du marché',
      dispoDate: 'Disponible dès le 1er novembre 2026',
      dispoConfirmed: 'Confirmé par le bailleur le 20 octobre',
      descriptionShort: 'Grande chambre carrelée avec un salon séparé, une douche intérieure et des toilettes privées. Le logement est au rez-de-chaussée d\'une maison...',
      descriptionFull: 'Grande chambre carrelée avec un salon séparé, une douche intérieure et des toilettes privées. Le logement est au rez-de-chaussée d\'une maison familiale calme, à 5 minutes à pied du marché et des arrêts de bus. Idéal pour jeune couple ou travailleur cherchant un cadre propre et sécurisé.',
      equipements: [
        { id: 'douche', label: 'Douche intérieure', icon: 'douche' },
        { id: 'wc', label: 'Toilettes privées', icon: 'wc' },
        { id: 'eau', label: 'Accès à l\'eau', icon: 'eau' },
        { id: 'elec', label: 'Électricité', icon: 'elec' },
        { id: 'cour', label: 'Cour partagée', icon: 'cour' },
        { id: 'placard', label: 'Placard intégré', icon: 'placard' }
      ],
      slides: [
        { id: 1, label: 'Salon', bg: '#F5EFE6' },
        { id: 2, label: 'Chambre', bg: '#FCE7F0' },
        { id: 3, label: 'Douche', bg: '#E3E9F5' },
        { id: 4, label: 'Cour', bg: '#E2F0EA' },
        { id: 5, label: 'Vidéo visite', isVideo: true, bg: '#F0EBFA' }
      ]
    }
  },
  {
    id: 'pikine-rue10',
    title: 'Studio meublé, entrée indépendante',
    typeLabel: 'Studio',
    place: 'Pikine Rue 10, Pikine',
    zone: 'pikine',
    price: 95000,
    caution: 95000,
    avance: 95000,
    frais: 0,
    verified: true,
    isPremium: true,
    status: 'disponible',
    verificationLevel: 'Bailleur vérifié',
    dateConfirmation: 'Confirmé hier',
    phone: '772345678',
    bailleurName: 'Awa N.',
    equipements: ['Entrée indépendante', 'Meublé', 'Compteur individuel'],
    description: 'Joli studio meublé avec entrée indépendante à Pikine Rue 10.',
    tint: '#E3E9F5'
  },
  {
    id: 'technopole-01',
    title: 'Appartement F3 lumineux',
    typeLabel: 'Appartement',
    place: 'Pikine Technopole, Pikine',
    zone: 'pikine',
    price: 180000,
    caution: 180000,
    avance: 180000,
    frais: 0,
    verified: true,
    status: 'price-drop',
    priceDropLabel: 'Le prix a baissé de 20 000 F',
    verificationLevel: 'Identité vérifiée',
    dateConfirmation: 'Confirmé il y a 3 jours',
    phone: '773456789',
    bailleurName: 'Ibrahima S.',
    equipements: ['F3 spacieux', 'Lumineux', 'Balcon'],
    description: 'Grand F3 lumineux dans la zone calme du Technopole Pikine.',
    tint: '#F3ECE1'
  },
  {
    id: 'thiaroye-01',
    title: 'Chambre salon',
    typeLabel: 'Chambre salon',
    place: 'Thiaroye Azur, Pikine',
    zone: 'pikine',
    price: 55000,
    caution: 55000,
    avance: 55000,
    frais: 0,
    verified: true,
    status: 'disponible',
    verificationLevel: 'Bailleur vérifié',
    dateConfirmation: 'Confirmé hier',
    phone: '775678901',
    bailleurName: 'Mariama Sow',
    equipements: ['Proche route', 'Eau SDE'],
    description: 'Belle chambre salon propre à Thiaroye Azur, Pikine.',
    tint: '#FBE3EC'
  },
  {
    id: 'guinaw-01',
    title: 'Chambre indépendante',
    typeLabel: 'Chambre',
    place: 'Guinaw Rails, Pikine',
    zone: 'pikine',
    price: 45000,
    caution: 45000,
    avance: 45000,
    frais: 0,
    verified: true,
    status: 'rented',
    statusLabel: 'Déjà loué',
    verificationLevel: 'Bailleur vérifié',
    dateConfirmation: 'Confirmé il y a 5 jours',
    phone: '774567890',
    bailleurName: 'Fatou K.',
    equipements: ['Chambre autonome', 'Eau comprise'],
    description: 'Chambre indépendante économique à Guinaw Rails.',
    tint: '#E2F0EA'
  }
];

// Favoris présents au premier lancement (démo)
export const DEFAULT_FAVORITE_IDS = ['icotaf-01', 'pikine-rue10', 'technopole-01', 'guinaw-01'];

// Date d'enregistrement affichée sur la page Favoris (démo)
export const FAVORITE_SAVED_LABELS = {
  'icotaf-01': 'Enregistré aujourd’hui',
  'pikine-rue10': 'Enregistré hier',
  'technopole-01': 'Enregistré il y a 3 j',
  'guinaw-01': 'Enregistré il y a 5 j'
};

const DEFAULT_CONDITIONS = [
  'Contrat de location écrit, durée minimale 6 mois',
  'Eau et électricité : compteurs séparés, à la charge du locataire',
  'Pour 1 à 2 personnes'
];

const EQUIP_ICON_RULES = [
  { icon: 'douche', words: ['douche', 'chauffe-eau'] },
  { icon: 'wc', words: ['toilette', 'wc'] },
  { icon: 'eau', words: ['eau'] },
  { icon: 'elec', words: ['woyofal', 'compteur', 'électricité', 'climatisation', 'wifi'] },
  { icon: 'cour', words: ['cour', 'balcon', 'terrasse', 'jardin', 'vue', 'plage'] }
];

export function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function equipIcon(label) {
  const lower = String(label).toLowerCase();
  const rule = EQUIP_ICON_RULES.find((r) => r.words.some((w) => lower.indexOf(w) >= 0));
  return rule ? rule.icon : 'placard';
}

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter((w) => /[A-Za-zÀ-ÿ]/.test(w.charAt(0)))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Retourne l'ensemble des logements (stockés ou mockés par défaut).
 * @returns {Array<Object>}
 */
export function getAllLogements() {
  try {
    const stored = storage.get(STORAGE_KEYS.LOGEMENTS, null);
    if (Array.isArray(stored) && stored.length > 0) {
      return stored.map(withCover);
    }
  } catch (e) {}
  return LOGEMENTS.map(withCover);
}

/**
 * Retrouve un logement du catalogue par son identifiant.
 * @param {string} id
 * @returns {Object|null}
 */
export function getLogementById(id) {
  const all = getAllLogements();
  return all.find((l) => String(l.id) === String(id)) || null;
}

/**
 * Construit l'objet attendu par la fiche logement (pages/logement-detail).
 * @param {Object} l - Logement du catalogue
 * @returns {Object}
 */
export function toLogementDetail(l) {
  const desc = l.description || '';
  const total = (l.caution || 0) + (l.avance || 0) + (l.frais || 0);

  const detail = Object.assign({
    id: l.id,
    title: l.title,
    tagPremium: !!l.isPremium,
    typeLabel: l.typeLabel,
    publishedAgo: l.dateConfirmation,
    place: `${l.place} — Dakar`,
    placeDetails: l.place,
    price: formatMoney(l.price),
    dispoDate: 'Disponible immédiatement',
    dispoConfirmed: l.dateConfirmation,
    loyerMensuel: `${formatMoney(l.price)} FCFA`,
    caution: `${formatMoney(l.caution)} FCFA`,
    avance: `${formatMoney(l.avance)} FCFA`,
    fraisAgence: l.frais ? `${formatMoney(l.frais)} FCFA` : 'Aucun',
    totalEntree: `${formatMoney(total)} FCFA`,
    // Formats courts pour la barre « À payer pour entrer »
    totalEntreeShort: `${formatMoney(total)} F`,
    entreeDetail: `Avance ${formatMoney(l.avance)} + caution ${formatMoney(l.caution)}`,
    conditions: DEFAULT_CONDITIONS,
    descriptionShort: desc.length > 110 ? `${desc.slice(0, 110)}...` : desc,
    descriptionFull: desc,
    equipements: (l.equipements || []).map((label, i) => ({ id: `eq-${i}`, label, icon: equipIcon(label) })),
    bailleur: {
      name: l.bailleurName,
      initial: initials(l.bailleurName),
      verified: !!l.verified,
      responseTime: 'Répond en général en moins d\'une heure',
      phone: l.phone
    },
  }, l.details || {});

  // Galerie réelle (photos par pièce + vidéo de visite), identique pour un même logement
  const media = getMedia(l.id);
  detail.slides = media.gallery
    .map((g) => ({ id: g.id, label: g.label, url: g.url, bg: l.tint }))
    .concat({ id: 'video', label: 'Vidéo visite', isVideo: true, url: media.video.poster, video: media.video.src, bg: '#0F1E3D' });
  if (l.isColoc) {
    detail.isColoc = true;
    detail.roomCapacity = l.roomCapacity || 2;
    detail.availablePlacesCount = l.availablePlacesCount || 1;
    detail.placePrice = l.placePrice || l.price;
    detail.placePriceFormatted = formatMoney(l.placePrice || l.price);
    detail.soloPrice = l.soloPrice || (l.price * 2);
    detail.soloPriceFormatted = formatMoney(detail.soloPrice);
    detail.genderPolicy = l.genderPolicy || 'HOMMES_UNIQUEMENT';
    detail.genderPolicyLabel = l.genderPolicyLabel || 'Hommes uniquement';
    detail.places = l.places || [];
    detail.smokingPolicy = l.smokingPolicy || 'FORBIDDEN';
    detail.alcoholPolicy = l.alcoholPolicy || 'FORBIDDEN';
    detail.multiGroupAllowed = l.multiGroupAllowed !== false;
    detail.incompletePolicy = l.incompletePolicy || 'ANNULATION_REMBOURSEMENT';
  }
  detail.video = media.video;
  return detail;
}
