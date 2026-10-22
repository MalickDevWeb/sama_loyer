// ============================================================================
// CONVERSATIONS DU BAILLEUR — DONNÉES FICTIVES (MOCK)
// kind : 'cand' (candidat à une location) | 'loc' (locataire en place)
// À remplacer par BackendAPI + un schéma json-sculpt quand l'API sera prête.
// ============================================================================

export const BAILLEUR_CONVERSATIONS = [
  {
    id: 'awa-diop', name: 'Awa Diop', initials: 'AD', color: '#0F1E3D', kind: 'cand',
    tag: 'Candidate · Chambre salon Icotaf', last: 'Les factures sont-elles comprises ?', time: '10:51', unread: 1,
    listing: 'Chambre salon · Icotaf · 65 000 F', visit: 'Visite acceptée : samedi 24 oct. à 16 h',
    address: 'Icotaf, à côté de la pharmacie du marché', entry: 'Entrée le 1er nov. · 195 000 F à payer (avance + caution)',
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour, la chambre d’Icotaf est-elle toujours disponible ?', time: '09:58' },
      { id: 'm2', from: 'me', text: 'Bonjour ! Oui, elle est libre à partir du 1er novembre.', time: '10:15' },
      { id: 'm3', event: true, text: 'Visite acceptée', sub: 'Samedi 24 octobre à 16 h', icon: 'cal', tone: 'blue' },
      { id: 'm4', from: 'them', text: 'Merci ! Les factures sont-elles comprises ?', time: '10:51' }
    ],
    quick: ['Non, compteurs séparés', 'Oui, toujours disponible', 'À samedi !']
  },
  {
    id: 'famille-ba', name: 'Famille Ba', initials: 'FB', color: '#11643F', kind: 'loc',
    tag: 'Locataire · Maison Pikine Nord', last: 'La fuite dans la douche a recommencé.', time: '09:12', unread: 2,
    listing: 'Maison · Pikine Nord · 160 000 F', visit: 'Locataire depuis mars 2026',
    messages: [
      { id: 'm1', from: 'them', text: 'Bonjour, la fuite dans la douche a recommencé.', time: '09:10' },
      { id: 'm2', from: 'them', text: 'Pouvez-vous envoyer le plombier cette semaine ?', time: '09:12' }
    ],
    quick: ['J’envoie le plombier demain', 'Merci de m’avoir prévenu']
  },
  {
    id: 'cheikh-fall', name: 'Cheikh Fall', initials: 'CF', color: '#5B4BB7', kind: 'loc',
    tag: 'Locataire · Studio Pikine Rue 10', last: 'Je paie le loyer avec Max it demain, désolé du retard.', time: 'Hier', unread: 1,
    listing: 'Studio meublé · Pikine Rue 10 · 95 000 F', visit: 'Loyer d’octobre en retard',
    messages: [
      { id: 'm1', from: 'me', text: 'Bonjour Cheikh, le loyer d’octobre n’est pas encore arrivé.', time: 'Hier' },
      { id: 'm2', from: 'them', text: 'Je paie le loyer avec Max it demain, désolé du retard.', time: 'Hier' }
    ],
    quick: ['D’accord, merci', 'Je t’envoie le lien Max it']
  },
  {
    id: 'mariama-sow', name: 'Mariama Sow', initials: 'MS', color: '#C8235F', kind: 'cand',
    tag: 'Candidate · Chambre salon Icotaf', last: 'Vous : À vendredi, 17 h.', time: 'Lun.', unread: 0,
    listing: 'Chambre salon · Icotaf · 65 000 F', visit: 'Visite acceptée : vendredi 23 oct. à 17 h',
    messages: [
      { id: 'm1', from: 'them', text: 'Je viendrai avec ma sœur.', time: 'Lun.' },
      { id: 'm2', from: 'me', text: 'À vendredi, 17 h.', time: 'Lun.' }
    ],
    quick: ['À vendredi !']
  },
  {
    id: 'modou-ndiaye', name: 'Modou Ndiaye', initials: 'MN', color: '#8A5A00', kind: 'loc',
    tag: 'Locataire · Appartement Technopole', last: 'Vous : Bonjour Modou, petit rappel pour le loyer d’octobre.', time: 'Lun.', unread: 0,
    listing: 'Appartement F3 · Technopole · 180 000 F', visit: 'Loyer d’octobre attendu',
    messages: [
      { id: 'm1', from: 'me', text: 'Bonjour Modou, petit rappel pour le loyer d’octobre.', time: 'Lun.' }
    ],
    quick: ['Merci d’avance']
  }
];

// Identifiants utilisés par les pages Demandes et Mes locataires
const ALIASES = {
  AD: 'awa-diop',
  d1: 'awa-diop',
  cheikh: 'cheikh-fall',
  modou: 'modou-ndiaye',
  famille_ba: 'famille-ba'
};

function initials(name) {
  return String(name || '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

/**
 * Retrouve une conversation du bailleur. Si elle n'existe pas encore,
 * en crée une vide avec le nom donné (jamais celle d'une autre personne).
 * @param {string} id
 * @param {string} [name]
 */
export function getBailleurConversation(id, name = '') {
  const key = ALIASES[id] || id;
  const found = BAILLEUR_CONVERSATIONS.find((c) => c.id === key);
  if (found) return found;

  const label = name || 'Nouveau contact';
  return {
    id: key || 'nouveau', name: label, initials: initials(label) || '?', color: '#0F1E3D', kind: 'cand',
    tag: 'Nouveau contact', last: '', time: '', unread: 0,
    listing: '', visit: '', messages: [], quick: ['Bonjour !', 'Le logement est toujours disponible']
  };
}
