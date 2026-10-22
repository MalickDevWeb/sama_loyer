// ============================================================================
// CONTRATS — DONNÉES FICTIVES (MOCK)
// - buildContratEntree(logement) : contrat à signer en entrant dans un logement
// - CONTRAT_ACTUEL : contrat signé du logement loué (écran « Mon contrat »)
// À remplacer par BackendAPI + un schéma json-sculpt quand l'API sera prête.
// ============================================================================

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
    subtitle: `${l.typeLabel} · ${l.place}`,
    bailleur: l.bailleurName,
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
      { title: 'Paiement de l’entrée', hint: 'En 1 ou 2 fois', text: 'L’avance et la caution peuvent être payées en une fois, ou en deux fois avec au moins l’avance tout de suite. Les clés sont remises quand tout est payé.' },
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
  locataire: { name: 'Awa Diop', phone: '+221 77 ••• •• 12', status: 'Numéro vérifié', signature: 'Awa Diop', signedOn: 'Signé le 28 mai 2026' },
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
