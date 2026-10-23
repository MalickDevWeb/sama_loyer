// ============================================================================
// CONTRATS & QUITTANCES — SAMA LOYER (ORANGE MAX IT)
// - buildContratEntree(logement) : contrat à signer en entrant dans un logement
// - getContratForHome(homeId, userProfile) : contrat dynamique du logement loué
// - buildQuittance(home, receipt, userProfile) : quittance de loyer officielle
// ============================================================================

import { getStoredRentedHomes } from '../helpers/store.js';

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Contrat proposé à la signature pour un logement du catalogue.
 * @param {Object} l - Logement (utils/mocks/logements.js)
 */
export function buildContratEntree(l) {
  const loyer = formatMoney(l.price);
  const caution = formatMoney(l.caution);
  const moisCaution = Math.round((l.caution || 0) / (l.price || 1));

  return {
    numero: 'N° SL-2026-10-0412',
    subtitle: `${l.typeLabel || l.title} · ${l.place}`,
    bailleur: l.bailleurName || 'Bailleur certifié',
    keys: [
      { label: 'Loyer', value: `${loyer} F`, sub: 'avant le 5 de chaque mois' },
      { label: 'Caution', value: `${caution} F`, sub: `${moisCaution} mois · rendue au départ` },
      { label: 'Durée', value: '6 mois min.', sub: 'à partir du 1er nov. 2026' },
      { label: 'Préavis', value: '1 mois', sub: 'pour partir' }
    ],
    articles: [
      { title: 'Objet du contrat', hint: 'Ce qui est loué', text: `Le bailleur loue au locataire le logement « ${l.title} » à ${l.place}, pour en faire son habitation principale.` },
      { title: 'Durée', hint: '6 mois minimum', text: 'Le contrat commence le 1er novembre 2026 pour 6 mois minimum. Il se renouvelle automatiquement, sauf préavis d’1 mois.' },
      { title: 'Loyer et paiement', hint: `${loyer} F avant le 5`, text: `Le loyer est de ${loyer} FCFA par mois, payé avec Max it via SAMA LOYER avant le 5 de chaque mois. Un reçu est envoyé après chaque paiement.` },
      { title: 'Caution', hint: `${caution} F, rendue au départ`, text: `La caution de ${caution} FCFA (${moisCaution} mois) est rendue dans les 30 jours après l’état des lieux de sortie, moins le coût des dégâts constatés.` },
      { title: 'Paiement de l’entrée', hint: 'En 1 fois ou par tranche', text: 'L’avance et la caution peuvent être payées en une fois, ou par tranche avec au moins l’avance tout de suite. Les clés sont remises quand tout est payé.' },
      { title: 'Eau, électricité, charges', hint: 'À la charge du locataire', text: 'L’eau et l’électricité ont des compteurs séparés et sont payées par le locataire.' },
      { title: 'Obligations de chacun', hint: 'Entretien et réparations', text: 'Le locataire entretient le logement et paie à temps. Le bailleur fait les grosses réparations et respecte la tranquillité du locataire.' },
      { title: 'Départ et litiges', hint: 'Préavis 1 mois, médiation', text: 'Pour partir, le locataire prévient 1 mois avant dans l’application. En cas de désaccord, les parties essaient d’abord la médiation SAMA LOYER.' }
    ]
  };
}

export const CONTRAT_ACTUEL = {
  numero: 'N° SL-2026-05-0187',
  subtitle: 'Mon studio · Liberté 6, Dakar',
  signedLabel: 'Signé par les deux parties · 28 mai 2026',
  keys: [
    { label: 'Loyer', value: '80 000 F', sub: 'avant le 5 de chaque mois' },
    { label: 'Caution', value: '160 000 F', sub: '2 mois · rendue au départ' },
    { label: 'Durée', value: '12 mois', sub: '1er juin 2026 → 31 mai 2027' },
    { label: 'Préavis', value: '1 mois', sub: 'pour partir ou résilier' }
  ],
  bailleur: { name: 'Mme Aminata Diagne', phone: '+221 77 ••• •• 30', status: 'Identité vérifiée', signature: 'A. Diagne', signedOn: 'Signé le 27 mai 2026' },
  locataire: { name: 'Awa Diop', phone: '+221 77 ••• •• 12', status: 'Numéro vérifié Max it', signature: 'Awa Diop', signedOn: 'Signé le 28 mai 2026' },
  logement: { title: 'Studio, 1er étage', sub: 'Liberté 6, Dakar · eau et électricité : compteurs séparés' },
  articles: [
    { title: 'Objet du contrat', hint: 'Ce qui est loué', text: 'Le bailleur loue au locataire un studio situé à Liberté 6, Dakar, pour en faire son habitation principale. Le logement ne peut pas être sous-loué sans l’accord écrit du bailleur.' },
    { title: 'Durée', hint: '12 mois, renouvelable', text: 'Le contrat commence le 1er juin 2026 pour 12 mois. Il se renouvelle automatiquement, sauf si l’une des parties prévient l’autre au moins 1 mois avant la fin.' },
    { title: 'Loyer et paiement', hint: '80 000 F avant le 5', text: 'Le loyer est de 80 000 FCFA par mois. Il est payé avec Max it via SAMA LOYER avant le 5 de chaque mois. Un reçu est envoyé automatiquement après chaque paiement.' },
    { title: 'Caution', hint: '160 000 F, rendue au départ', text: 'Le locataire verse une caution de 160 000 FCFA (2 mois). Elle est rendue dans les 30 jours après l’état des lieux de sortie, moins le coût des réparations des dégâts constatés.' },
    { title: 'Eau, électricité, charges', hint: 'À la charge du locataire', text: 'L’eau et l’électricité ont des compteurs séparés et sont payées par le locataire. Le ramassage des ordures est compris dans le loyer.' },
    { title: 'Obligations du locataire', hint: 'Entretien et bon voisinage', text: 'Le locataire paie le loyer à temps, entretient le logement, signale tout problème rapidement dans l’application et respecte le voisinage.' },
    { title: 'Obligations du bailleur', hint: 'Logement en bon état', text: 'Le bailleur remet un logement propre et en bon état, fait les grosses réparations (toiture, plomberie, électricité) et respecte la tranquillité du locataire.' },
    { title: 'Départ et litiges', hint: 'Préavis 1 mois, médiation', text: 'Pour partir, le locataire prévient le bailleur 1 mois avant, dans l’application. En cas de désaccord, les parties essaient d’abord la médiation proposée par SAMA LOYER.' }
  ]
};

/**
 * Récupère le contrat complet adapté au logement loué actuel.
 */
export function getContratForHome(homeId, userProfile = {}) {
  const homes = getStoredRentedHomes();
  const h = (homes || []).find(x => x.id === homeId) || homes[0];

  if (!h) return CONTRAT_ACTUEL;

  const locName = userProfile.fullName || 'Awa Diop';
  const locPhone = userProfile.phone || '+221 77 123 45 12';
  const loyer = formatMoney(h.rent);
  const caution = formatMoney(h.deposit);
  const moisCaution = Math.round((h.deposit || 0) / (h.rent || 1)) || 2;
  const ownerParts = (h.owner || 'Mme Aminata Diagne').split(' ');
  const ownerInitial = ownerParts[0] ? ownerParts[0][0] + '. ' + ownerParts.slice(1).join(' ') : h.owner;

  return {
    numero: `N° SL-2026-${String(h.id).toUpperCase()}-0187`,
    subtitle: `${h.name} · ${h.place}`,
    signedLabel: `Signé par les deux parties · ${h.since || 'En cours'}`,
    keys: [
      { label: 'Loyer', value: `${loyer} F`, sub: 'avant le 5 de chaque mois' },
      { label: 'Caution', value: `${caution} F`, sub: `${moisCaution} mois · rendue au départ` },
      { label: 'Durée', value: '12 mois', sub: 'Bail certifié renouvelable' },
      { label: 'Préavis', value: '1 mois', sub: 'pour partir ou résilier' }
    ],
    bailleur: {
      name: h.owner,
      phone: '+221 77 ••• •• 30',
      status: 'Identité certifiée Max it',
      signature: ownerInitial,
      signedOn: 'Signé électroniquement via Orange'
    },
    locataire: {
      name: locName,
      phone: locPhone,
      status: 'Numéro certifié Max it',
      signature: locName,
      signedOn: 'Signé électroniquement via Max it'
    },
    logement: {
      title: h.name,
      sub: `${h.place} · compteurs eau & Woyofal séparés`
    },
    articles: [
      { title: 'Objet du contrat', hint: 'Ce qui est loué', text: `Le bailleur loue au locataire le logement « ${h.name} » situé à ${h.place}, pour en faire son habitation principale. Le logement ne peut pas être sous-loué sans accord écrit.` },
      { title: 'Durée et renouvellement', hint: '12 mois reconductibles', text: 'Le contrat est conclu pour 12 mois. Il se renouvelle automatiquement, sauf préavis de départ d’1 mois déposé via l’application SAMA LOYER.' },
      { title: 'Loyer et paiement', hint: `${loyer} F avant le 5`, text: `Le loyer est fixé à ${loyer} FCFA par mois, payable avec Orange Money (Max it) via SAMA LOYER avant le 5 de chaque mois civil. Une quittance horodatée est émise instantanément.` },
      { title: 'Caution', hint: `${caution} F, restituée en fin de bail`, text: `La caution versée de ${caution} FCFA (${moisCaution} mois) est restituée dans un délai maximal de 30 jours après l’état des lieux de sortie contradictoire.` },
      { title: 'Charges et fluides', hint: 'À la charge du locataire', text: 'L’eau (SEN’EAU) et l’électricité (Woyofal Senelec) disposent de compteurs privatifs et incombent exclusivement au locataire.' },
      { title: 'Obligations du locataire', hint: 'Entretien & bon usage', text: 'Le locataire veille au bon entretien des lieux loués, respecte la quiétude du voisinage et signale sans délai toute dégradation anormale.' },
      { title: 'Obligations du bailleur', hint: 'Jouissance paisible', text: 'Le bailleur garantit au locataire la jouissance paisible des lieux et prend en charge l’ensemble des grosses réparations structurelles.' },
      { title: 'Règlement des litiges', hint: 'Médiation SAMA LOYER', text: 'En cas de différend relatif à l’exécution du bail, les parties conviennent expressément de recourir en priorité à la médiation en ligne SAMA LOYER.' }
    ]
  };
}

/**
 * Génère une quittance de loyer officielle conforme et certifiée.
 */
export function buildQuittance(home = {}, receipt = {}, userProfile = {}) {
  const locName = userProfile.fullName || 'Awa Diop';
  const locPhone = userProfile.phone || '+221 77 123 45 12';
  const amount = Number(receipt.amount || home.rent || 80000);
  const now = new Date();
  const dateStr = `${now.getDate()} ${['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'][now.getMonth()]} ${now.getFullYear()}`;

  return {
    quittanceNo: receipt.ref || `QUI-2026-${String(home.id || 'LOC').toUpperCase().slice(0, 4)}-${Math.floor(1000 + Math.random() * 9000)}`,
    dateEmission: dateStr,
    periode: receipt.label || 'Loyer du mois en cours',
    logementTitle: home.name || 'Logement loué',
    logementPlace: home.place || 'Dakar, Sénégal',
    bailleurName: home.owner || 'Mme Aminata Diagne',
    bailleurPhone: '+221 77 ••• •• 30',
    locataireName: locName,
    locatairePhone: locPhone,
    montantLoyerText: `${formatMoney(amount)} F`,
    montantChargesText: '0 F (compteurs séparés)',
    totalPayeText: `${formatMoney(amount)} F`,
    modePaiement: 'Orange Money via Max it',
    statut: 'ACQUITTÉ',
    hashSecurite: `OM-SN-${Math.floor(100000000 + Math.random() * 900000000)}`
  };
}
