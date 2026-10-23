// ============================================================================
// CONVERSATIONS — DONNÉES FICTIVES (MOCK)
// Chaque conversation est liée à un logement du catalogue (logementId).
// À remplacer par BackendAPI + un schéma json-sculpt quand l'API sera prête.
// ============================================================================

import { getLogementById } from './logements';

const DEFAULT_AVATAR_BG = '#0F1E3D';

export const CONVERSATIONS = [
  {
    id: 'moussa-d',
    status: 'Visite demandée',
    statusKind: 'visit',
    logementId: 'icotaf-01',
    time: '10:43',
    unread: 2,
    visiteBadge: 'Visite demandée · sam. 24, 16 h',
    avatarBg: '#0F1E3D',
    messages: [
      { id: 'm1', sender: 'client', text: 'Bonjour, la chambre d’Icotaf est-elle toujours disponible ?', time: '09:58 · Lu' },
      { id: 'm2', sender: 'bailleur', text: 'Bonjour ! Oui, elle est libre à partir du 1er novembre.', time: '10:15' },
      { id: 'm3', isEvent: true, eventTitle: 'Demande de visite envoyée', eventDate: 'Samedi 24 octobre à 16 h' },
      { id: 'm4', sender: 'bailleur', text: 'D’accord, samedi 16 h ça me va.', time: '10:42' },
      { id: 'm5', sender: 'bailleur', text: 'Je vous enverrai l’adresse exacte vendredi.', time: '10:43' }
    ]
  },
  {
    id: 'awa-n',
    status: 'Disponible',
    statusKind: 'ok',
    logementId: 'pikine-rue10',
    time: 'Hier',
    unread: 1,
    avatarBg: '#C8235F',
    messages: [
      { id: 'm1', sender: 'client', text: 'Bonjour, le studio de Pikine Rue 10 est-il libre ?', time: 'Hier · Lu' },
      { id: 'm2', sender: 'bailleur', text: 'Oui, le studio est toujours disponible.', time: 'Hier' }
    ]
  },
  {
    id: 'ibrahima-s',
    status: 'En attente',
    statusKind: 'wait',
    logementId: 'technopole-01',
    time: 'Lun.',
    unread: 0,
    avatarBg: '#5B4BB7',
    messages: [
      { id: 'm1', sender: 'client', text: 'Les factures sont-elles comprises ?', time: 'Lun.' }
    ]
  },
  {
    id: 'fatou-k',
    status: 'Déjà loué',
    statusKind: 'off',
    logementId: 'guinaw-01',
    time: '18 oct.',
    unread: 0,
    avatarBg: '#11643F',
    messages: [
      { id: 'm1', sender: 'client', text: 'Bonjour, la chambre de Guinaw Rails est-elle encore libre ?', time: '17 oct. · Lu' },
      { id: 'm2', sender: 'bailleur', text: 'Désolée, la chambre vient d’être louée.', time: '18 oct.' }
    ]
  }
];

// Conversations avec les bailleurs des logements loués (page Mes loyers).
// Elles ne sont pas dans la liste Messages ; le logement est décrit sur place.
const RENTAL_CONVERSATIONS = [
  {
    id: 'mme-diagne',
    logement: { title: 'Mon studio', typeLabel: 'Studio', place: 'Liberté 6, Dakar', price: 80000, bailleurName: 'Mme Diagne', phone: '774501234', verified: true },
    time: '3 oct.',
    unread: 0,
    avatarBg: '#5B4BB7',
    messages: [
      { id: 'm1', sender: 'bailleur', text: 'Bien reçu le loyer d’octobre, merci !', time: '3 oct.' }
    ]
  },
  {
    id: 'fatou-k-ibou',
    logement: { title: 'Chambre de Ibou', typeLabel: 'Chambre', place: 'Thiaroye, Pikine', price: 45000, bailleurName: 'Fatou K.', phone: '778905678', verified: true },
    time: '25 sept.',
    unread: 0,
    avatarBg: '#11643F',
    messages: [
      { id: 'm1', sender: 'bailleur', text: 'Bienvenue ! Les clés sont chez la voisine.', time: '25 sept.' }
    ]
  }
];

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
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
 * Complète une conversation avec les infos de son logement (bailleur, prix…).
 * @param {Object} conv
 * @returns {Object|null}
 */
function withLogement(conv) {
  const l = conv.logement || getLogementById(conv.logementId);
  if (!l) return null;

  const lastMessage = conv.messages.filter((m) => !m.isEvent).pop();
  let snippet = '';
  if (lastMessage) {
    snippet = lastMessage.sender === 'client' ? `Vous : ${lastMessage.text}` : lastMessage.text;
  }

  return Object.assign({}, conv, {
    name: l.bailleurName,
    initial: initials(l.bailleurName),
    phone: l.phone,
    verified: !!l.verified,
    logementTitle: l.title,
    logementPlace: l.place,
    logementPrice: `${formatMoney(l.price)} FCFA/mois`,
    property: `${l.typeLabel} · ${l.place} · ${formatMoney(l.price)} F`,
    snippet
  });
}

/** @returns {Array<Object>} Conversations prêtes à afficher */
export function getConversations() {
  return CONVERSATIONS.map(withLogement).filter(Boolean);
}

/**
 * Complète une conversation enregistrée (store.js) pour l'affichage : bailleur,
 * logement, dernier message, statut. Une conversation créée pendant l'utilisation
 * n'a pas de statut : elle est « Nouveau ».
 * @param {Object} conv - conversation brute du stockage
 * @returns {Object|null}
 */
export function enrichConversation(conv) {
  if (!conv) return null;
  const demo = CONVERSATIONS.find((c) => c.id === conv.id) || {};
  return withLogement(Object.assign({ status: demo.status || 'Nouveau', statusKind: demo.statusKind || 'wait' }, conv));
}

/**
 * Retrouve une conversation par son id, ou à défaut celle d'un logement.
 * Si aucune conversation n'existe pour ce logement, en crée une vide.
 * @param {{ id?: string, logementId?: string }} query
 * @returns {Object|null}
 */
export function findConversation({ id, logementId } = {}) {
  let conv = id ? CONVERSATIONS.concat(RENTAL_CONVERSATIONS).find((c) => c.id === id) : null;
  if (!conv && logementId) {
    conv = CONVERSATIONS.find((c) => c.logementId === logementId);
  }
  if (!conv && logementId) {
    conv = {
      id: `new-${logementId}`,
      logementId,
      time: '',
      unread: 0,
      avatarBg: DEFAULT_AVATAR_BG,
      messages: []
    };
  }
  return conv ? withLogement(conv) : null;
}
