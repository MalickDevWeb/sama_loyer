// ============================================================================
// SAMA LOYER — LOCAL DATA STORE (Centralized Reactive Local Persistence)
// Toutes les données (Annonces, Visites, Contrats, Loyers, Messages, Favoris)
// sont persistées localement via storage.js (wx.setStorageSync / getStorageSync).
// Permet à tous les flux de l'application de fonctionner de bout en bout
// sans dépendre d'un serveur distant pendant le hackathon / la démo.
// ============================================================================

import { storage } from '../storage.js';
import { STORAGE_KEYS } from '../constants/index.js';
import { LOGEMENTS as DEFAULT_LOGEMENTS, formatMoney } from '../mocks/logements.js';
import { DEFAULT_VISITES } from '../mocks/visites.js';
import { RENTED_HOMES as DEFAULT_RENTED_HOMES, RENT_MONTH } from '../mocks/loyers.js';
import { CONVERSATIONS as DEFAULT_CONVERSATIONS } from '../mocks/conversations.js';
import { BAILLEUR_CONVERSATIONS as DEFAULT_BAILLEUR_CONVERSATIONS } from '../mocks/bailleur-conversations.js';
import { COMPLIANCE_DEFAULTS } from '../mocks/compliance.js';
import { Bus } from '../event/index.js';
import { EVENTS, STATE_KEYS } from '../event/keys.js';

/**
 * Prévient les écrans ouverts qu'une donnée vient de changer.
 * Les pages relisent aussi le stockage dans onShow : l'événement sert aux mises
 * à jour en direct (badge, page déjà affichée, composants).
 */
function notify(event, data) {
  Bus.emit(event, data).catch(() => {});
}

// --- MOCK ANNONCES BAILLEUR PAR DÉFAUT ---
const DEFAULT_BAILLEUR_ANNONCES = [
  {
    id: 'ouakam-cite-avion',
    tag: 'En ligne · Vérifié',
    tagClass: 'tag-enligne',
    thumbBg: '#FBE3EC',
    title: 'Chambre salon avec toilettes privées',
    placeName: 'Ouakam, Cité Avion · ',
    price: '60 000 F',
    stats: '184 vues · 2 demandes',
    notice: "Disponibilité confirmée il y a 2 jours. Les locataires le voient.",
    noticeClass: 'notice-gray',
    isConfirmed: true,
    type: 'en_ligne'
  },
  {
    id: 'icotaf-01',
    tag: 'En ligne · Premium',
    tagClass: 'tag-enligne',
    thumbBg: '#FDE8EE',
    title: 'Chambre salon avec douche intérieure',
    placeName: 'Icotaf, Pikine · ',
    price: '65 000 F',
    stats: '248 vues · 3 demandes',
    notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
    noticeClass: 'notice-gray',
    isConfirmed: true,
    type: 'en_ligne'
  },
  {
    id: 'pikine-rue10',
    tag: 'En ligne · Premium',
    tagClass: 'tag-enligne',
    thumbBg: '#E3E8F0',
    title: 'Studio meublé, entrée indépendante',
    placeName: 'Pikine Rue 10 · ',
    price: '95 000 F',
    stats: '131 vues · 1 demande',
    notice: "Disponibilité confirmée il y a 14 jours. Confirme-la pour rester visible.",
    noticeClass: 'notice-yellow',
    isConfirmed: false,
    needsConfirm: true,
    type: 'en_ligne'
  },
  {
    id: 'technopole-01',
    tag: 'En validation',
    tagClass: 'tag-validation',
    thumbBg: '#F5EFE6',
    title: 'Appartement F2 neuf',
    placeName: 'Pikine Technopole · ',
    price: '140 000 F',
    notice: 'Notre équipe vérifie les photos et les informations. Réponse sous 24 h.',
    noticeClass: 'notice-yellow',
    type: 'validation'
  },
  {
    id: 'dalifort-01',
    tag: 'À corriger',
    tagClass: 'tag-corriger',
    thumbBg: '#EFEBF5',
    title: 'Chambre avec balcon',
    placeName: 'Dalifort · ',
    price: '50 000 F',
    notice: 'Motif : 2 photos sont floues et le prix de la caution manque.',
    noticeClass: 'notice-pink',
    canCorrect: true,
    type: 'validation'
  },
  {
    id: 'thiaroye-01',
    tag: 'Loué',
    tagClass: 'tag-loue',
    thumbBg: '#E2F0EA',
    title: 'Chambre simple carrelée',
    placeName: 'Thiaroye Gare · ',
    price: '45 000 F',
    stats: 'Loué à Ibou Sarr depuis le 1er oct.',
    notice: 'Loyer géré via SAMA LOYER. Prochaine échéance le 5 nov.',
    noticeClass: 'notice-gray',
    type: 'loue'
  }
];

// --- MOCK LOCATAIRES BAILLEUR PAR DÉFAUT ---
const DEFAULT_LOCATAIRES = [
  {
    id: 'cheikh',
    name: 'Cheikh Fall',
    initials: 'CF',
    avatarBg: '#5B45B2',
    property: 'Studio · Pikine Rue 10 · 95 000 F',
    status: 'a_confirmer',
    statusLabel: 'À confirmer',
    bannerType: 'warning',
    bannerText: "Cheikh dit avoir payé 95 000 F en espèces le 20 oct. L'as-tu bien reçu ?",
    cautionDetenue: '190 000 F',
    phone: '77 456 78 90'
  },
  {
    id: 'modou',
    name: 'Modou Ndiaye',
    initials: 'MN',
    avatarBg: '#9A6A15',
    property: 'Appartement F2 · Technopole · 85 000 F',
    status: 'en_retard',
    statusLabel: 'En retard',
    bannerType: 'danger',
    bannerText: 'Loyer attendu le 5 oct. · 17 jours de retard.',
    cautionDetenue: '170 000 F',
    phone: '78 123 45 67'
  },
  {
    id: 'ibou',
    name: 'Ibou Sarr',
    initials: 'IS',
    avatarBg: '#007C3D',
    property: 'Chambre · Thiaroye · 45 000 F',
    status: 'payes',
    statusLabel: 'Payé',
    bannerType: 'success',
    bannerText: 'Payé le 3 oct. · Max it (payé par son frère) · reçu envoyé',
    cautionDetenue: '45 000 F',
    phone: '77 333 44 55'
  },
  {
    id: 'famille_ba',
    name: 'Famille Ba',
    initials: 'FB',
    avatarBg: '#0F1E3D',
    property: 'Maison · Pikine Nord · 160 000 F',
    status: 'payes',
    statusLabel: 'Payé',
    bannerType: 'success',
    bannerText: 'Payé le 5 oct. · Max it · reçu envoyé',
    cautionDetenue: '320 000 F',
    phone: '77 555 66 77'
  }
];

// ============================================================================
// 1. LOGEMENTS (Catalogue locataire & annonces)
// ============================================================================

export function getStoredLogements() {
  const saved = storage.get(STORAGE_KEYS.LOGEMENTS, null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  // Initialisation au premier lancement
  storage.set(STORAGE_KEYS.LOGEMENTS, DEFAULT_LOGEMENTS);
  return DEFAULT_LOGEMENTS.slice();
}

export function getStoredLogementById(id) {
  const all = getStoredLogements();
  return all.find((l) => String(l.id) === String(id)) || null;
}

export function addStoredLogement(data) {
  const all = getStoredLogements();
  const id = `logement-${Date.now()}`;
  const price = Number(data.price) || 50000;
  const caution = Number(data.caution) || price;
  const avance = Number(data.avance) || price;

  const newLogement = {
    id,
    title: data.title || `${data.typeLabel || 'Logement'} à ${data.place || 'Dakar'}`,
    typeLabel: data.typeLabel || 'Chambre salon',
    place: data.place || 'Ouakam, Dakar',
    zone: (data.zone || 'ouakam').toLowerCase(),
    price,
    caution,
    avance,
    frais: 0,
    verified: false,
    verificationLevel: 'En validation · sous 24 h',
    dateConfirmation: 'Ajouté à l’instant',
    phone: data.phone || '771234567',
    bailleurName: data.bailleurName || 'Moussa Diop',
    equipements: data.equipements || ['Toilettes privées', 'Compteur Woyofal'],
    description: data.description || 'Logement propre et bien situé.',
    tint: data.tint || '#FBE3EC',
    // 1re photo choisie par le bailleur (sinon photo de démo, voir utils/mocks/media.js)
    cover: data.cover || '',
    isPremium: !!data.isPremium,
    // Contrat : modèle SAMA LOYER, ou PDF propre à ce logement (si le Super Admin l'autorise)
    contractMode: data.contractMode === 'custom' ? 'custom' : 'standard',
    customContract: data.contractMode === 'custom' ? data.customContract || null : null,
    status: 'validation' // 'en_ligne' | 'validation' | 'loue'
  };

  const updated = [newLogement, ...all];
  storage.set(STORAGE_KEYS.LOGEMENTS, updated);

  // Ajouter également à la liste des annonces du bailleur
  const bailleurAnnonces = getStoredBailleurAnnonces();
  const newAnnonce = {
    id,
    tag: 'En validation',
    tagClass: 'tag-validation',
    thumbBg: newLogement.tint,
    cover: newLogement.cover,
    title: newLogement.title,
    placeName: `${newLogement.place} · `,
    price: `${formatMoney(newLogement.price)} F`,
    notice: 'Notre équipe vérifie les photos et les informations. Réponse sous 24 h.',
    noticeClass: 'notice-yellow',
    type: 'validation'
  };
  storage.set('sama_bailleur_annonces', [newAnnonce, ...bailleurAnnonces]);

  notify(EVENTS.LOGEMENTS_CHANGED, { logementId: newLogement.id });
  return newLogement;
}

export function updateStoredLogement(id, patch) {
  const all = getStoredLogements();
  const next = all.map((l) => (String(l.id) === String(id) ? Object.assign({}, l, patch) : l));
  storage.set(STORAGE_KEYS.LOGEMENTS, next);
  notify(EVENTS.LOGEMENTS_CHANGED, { logementId: id });
  return next.find((l) => String(l.id) === String(id));
}

// ============================================================================
// 2. DEMANDES DE VISITES (Locataire <-> Bailleur)
// ============================================================================

export function getStoredRawVisites() {
  const saved = storage.get(STORAGE_KEYS.VISITES, null);
  if (Array.isArray(saved)) {
    return saved;
  }
  storage.set(STORAGE_KEYS.VISITES, DEFAULT_VISITES);
  return DEFAULT_VISITES.slice();
}

export function addStoredVisite(logementId, slotLabel, message = '') {
  const current = getStoredRawVisites();
  const id = `v-${Date.now()}`;
  const visite = {
    id,
    logementId,
    status: 'pending',
    dateLabel: slotLabel,
    note: message ? `Ton message : « ${message} »` : 'Envoyée à l’instant. Le bailleur répond en général sous 24 h.',
    createdAt: Date.now()
  };

  const next = [visite, ...current];
  storage.set(STORAGE_KEYS.VISITES, next);
  notify(EVENTS.VISITES_CHANGED, { visiteId: visite.id });
  return visite;
}

export function updateStoredVisiteStatus(id, newStatus, note = '') {
  const current = getStoredRawVisites();
  const next = current.map((v) => {
    if (v.id === id) {
      const defaultNote =
        newStatus === 'accepted'
          ? "Visite acceptée. Le bailleur t'attend à l'heure convenue."
          : newStatus === 'rejected'
          ? 'Visite refusée par le bailleur.'
          : newStatus === 'cancelled'
          ? 'Tu as annulé cette demande.'
          : v.note;

      return Object.assign({}, v, {
        status: newStatus,
        note: note || defaultNote
      });
    }
    return v;
  });
  storage.set(STORAGE_KEYS.VISITES, next);
  notify(EVENTS.VISITES_CHANGED, { visiteId: id });
  return next.find((v) => v.id === id);
}

// ============================================================================
// 3. LOCATIONS & CONTRATS (Mon Loyer <-> Locataires Bailleur)
// ============================================================================

export function getStoredRentedHomes() {
  const saved = storage.get(STORAGE_KEYS.RENTED_HOMES, null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  storage.set(STORAGE_KEYS.RENTED_HOMES, DEFAULT_RENTED_HOMES);
  return DEFAULT_RENTED_HOMES.slice();
}

export function addStoredRentedHome(logement, amountPaid, options = {}) {
  const homes = getStoredRentedHomes();
  const homeId = `rented-${logement.id || Date.now()}`;

  const today = new Date();
  const dateStr = `${today.getDate()} nov. 2026`;

  const newHome = {
    id: homeId,
    name: logement.title || 'Mon logement',
    place: logement.place || 'Dakar',
    owner: logement.bailleurName || 'Bailleur SAMA LOYER',
    ownerPhone: logement.phone || '771234567',
    conversationId: `conv-${homeId}`,
    rent: logement.price || 60000,
    deposit: logement.caution || 60000,
    depositInfo: `Caution versée le ${dateStr}`,
    contract: 'Bail 1 an renouvelable · préavis 1 mois',
    since: `Depuis le ${dateStr}`,
    due: `Avant le 5 ${RENT_MONTH}`,
    tint: logement.tint || '#FBE3EC',
    history: [
      {
        id: `rec-entree-${Date.now()}`,
        label: 'Entrée : avance + caution',
        sub: `Payé le ${dateStr} · Max it`,
        amount: amountPaid || (logement.price + logement.caution),
        kind: 'entry',
        ref: `REC-ENT-${Date.now().toString().slice(-6)}`
      }
    ]
  };

  const updatedHomes = [newHome, ...homes];
  storage.set(STORAGE_KEYS.RENTED_HOMES, updatedHomes);

  // Marquer le logement comme loué dans le catalogue
  updateStoredLogement(logement.id, { status: 'loue' });

  // Ajouter également le nouveau locataire dans la liste du bailleur
  const locataires = getStoredLocataires();
  const newLocataire = {
    id: `loc-${Date.now()}`,
    name: options.locataireName || 'Amina Ndiaye',
    initials: 'AN',
    avatarBg: '#C8235F',
    property: `${logement.typeLabel || 'Logement'} · ${logement.place} · ${formatMoney(logement.price)} F`,
    status: 'payes',
    statusLabel: 'Payé',
    bannerType: 'success',
    bannerText: `Entrée validée le ${dateStr} · Max it · Reçu émis`,
    cautionDetenue: `${formatMoney(logement.caution)} F`,
    phone: options.phone || '77 800 12 34'
  };
  storage.set(STORAGE_KEYS.LOCATAIRES, [newLocataire, ...locataires]);

  notify(EVENTS.LOCATAIRES_CHANGED, { logementId: newHome.id });
  return newHome;
}

// ============================================================================
// 4. PAIEMENTS DE LOYERS (Orange Money / Max it)
// ============================================================================

export function getStoredRentPaidMap() {
  return storage.get(STORAGE_KEYS.RENT_PAID, {});
}

export function recordRentPayment(homeId, amount) {
  const currentPaid = getStoredRentPaidMap();
  const updatedPaid = Object.assign({}, currentPaid, { [homeId]: true });
  storage.set(STORAGE_KEYS.RENT_PAID, updatedPaid);

  // Ajouter le reçu dans l'historique du logement loué
  const homes = getStoredRentedHomes();
  const nextHomes = homes.map((h) => {
    if (h.id === homeId) {
      const today = new Date();
      const receipt = {
        id: `rec-${Date.now()}`,
        label: `Loyer de ${RENT_MONTH}`,
        sub: `Payé le ${today.getDate()} nov. · Max it`,
        amount: amount || h.rent,
        kind: 'rent',
        ref: `REC-NOV-2026-${Date.now().toString().slice(-6)}`
      };
      return Object.assign({}, h, {
        history: [receipt, ...h.history]
      });
    }
    return h;
  });
  storage.set(STORAGE_KEYS.RENTED_HOMES, nextHomes);

  notify(EVENTS.RENT_PAID, { logementId: homeId });
  return updatedPaid;
}

// ============================================================================
// 5. ANNONCES DU BAILLEUR
// ============================================================================

export function getStoredBailleurAnnonces() {
  const saved = storage.get('sama_bailleur_annonces', null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  storage.set('sama_bailleur_annonces', DEFAULT_BAILLEUR_ANNONCES);
  return DEFAULT_BAILLEUR_ANNONCES.slice();
}

export function confirmBailleurAnnonce(id) {
  const annonces = getStoredBailleurAnnonces();
  const next = annonces.map((a) => {
    if (a.id === id) {
      return Object.assign({}, a, {
        isConfirmed: true,
        needsConfirm: false,
        notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
        noticeClass: 'notice-gray'
      });
    }
    return a;
  });
  storage.set('sama_bailleur_annonces', next);
  notify(EVENTS.LOGEMENTS_CHANGED, { logementId: id });
  return next;
}

// ============================================================================
// 6. LOCATAIRES DU BAILLEUR
// ============================================================================

export function getStoredLocataires() {
  const saved = storage.get(STORAGE_KEYS.LOCATAIRES, null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  storage.set(STORAGE_KEYS.LOCATAIRES, DEFAULT_LOCATAIRES);
  return DEFAULT_LOCATAIRES.slice();
}

export function confirmLocataireCashPayment(id) {
  const locs = getStoredLocataires();
  const next = locs.map((l) => {
    if (l.id === id) {
      return Object.assign({}, l, {
        status: 'payes',
        statusLabel: 'Payé',
        bannerType: 'success',
        bannerText: 'Paiement en espèces confirmé par le bailleur · reçu émis'
      });
    }
    return l;
  });
  storage.set(STORAGE_KEYS.LOCATAIRES, next);
  notify(EVENTS.LOCATAIRES_CHANGED, { locataireId: id });
  return next;
}

// ============================================================================
// 7. CONVERSATIONS & CHAT (Locataire <-> Bailleur)
// ============================================================================

export function getStoredConversations() {
  const saved = storage.get(STORAGE_KEYS.CONVERSATIONS, null);
  if (Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  storage.set(STORAGE_KEYS.CONVERSATIONS, DEFAULT_CONVERSATIONS);
  return DEFAULT_CONVERSATIONS.slice();
}

export function getStoredConversation(convIdOrLogementId) {
  const convs = getStoredConversations();
  return (
    convs.find((c) => c.id === convIdOrLogementId || c.logementId === convIdOrLogementId) ||
    convs[0]
  );
}

/**
 * Ajoute un message à une conversation locataire (la crée si besoin).
 * @param {string} convId
 * @param {Object} message
 * @param {string} [logementId] - logement d'une nouvelle conversation
 */
export function addStoredMessage(convId, message, logementId) {
  const convs = getStoredConversations();
  const d = new Date();
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

  const fullMsg = Object.assign(
    {
      id: `m-${Date.now()}`,
      time: timeStr
    },
    message
  );

  let found = false;
  const nextConvs = convs.map((c) => {
    if (c.id === convId || c.logementId === convId) {
      found = true;
      return Object.assign({}, c, {
        time: timeStr,
        messages: [...(c.messages || []), fullMsg]
      });
    }
    return c;
  });

  if (!found) {
    // Nouvelle conversation créée automatiquement
    nextConvs.unshift({
      id: convId,
      logementId: logementId || convId,
      time: timeStr,
      unread: 0,
      avatarBg: '#0F1E3D',
      messages: [fullMsg]
    });
  }

  storage.set(STORAGE_KEYS.CONVERSATIONS, nextConvs);
  publishUnreadCounts();
  notify(EVENTS.MESSAGES_CHANGED, { side: 'client', convId });
  return fullMsg;
}

/**
 * Marque une conversation locataire comme lue (à l'ouverture de la discussion).
 * @param {string} convId - id de la conversation ou du logement
 */
export function markConversationRead(convId) {
  const convs = getStoredConversations();
  let changed = false;
  const next = convs.map((c) => {
    if ((c.id === convId || c.logementId === convId) && c.unread) {
      changed = true;
      return Object.assign({}, c, { unread: 0 });
    }
    return c;
  });
  if (!changed) return;
  storage.set(STORAGE_KEYS.CONVERSATIONS, next);
  publishUnreadCounts();
  notify(EVENTS.MESSAGES_CHANGED, { side: 'client', convId });
}

// --- Conversations côté bailleur (clé séparée : ne se mélangent pas à celles du locataire)

/** @returns {Array<Object>} Conversations du bailleur (démo au premier lancement) */
export function getStoredBailleurConversations() {
  const saved = storage.get(STORAGE_KEYS.BAILLEUR_CONVERSATIONS, null);
  if (Array.isArray(saved) && saved.length > 0) return saved;
  storage.set(STORAGE_KEYS.BAILLEUR_CONVERSATIONS, DEFAULT_BAILLEUR_CONVERSATIONS);
  return DEFAULT_BAILLEUR_CONVERSATIONS.slice();
}

/** @returns {Object|null} Une conversation du bailleur */
export function getStoredBailleurConversation(convId) {
  return getStoredBailleurConversations().find((c) => c.id === convId) || null;
}

/**
 * Ajoute un message (ou un événement de visite) à une conversation du bailleur.
 * @param {string} convId
 * @param {Object} message - { from: 'me' | 'them', text, time } ou { event: true, … }
 * @param {Object} [conv] - conversation à créer si elle n'existe pas encore (nouveau contact)
 */
export function addStoredBailleurMessage(convId, message, conv) {
  const convs = getStoredBailleurConversations();
  const exists = convs.some((c) => c.id === convId);
  const base = exists ? convs : [Object.assign({}, conv, { id: convId, unread: 0, messages: [] }), ...convs];
  const next = base.map((c) =>
    c.id === convId
      ? Object.assign({}, c, { time: message.time || c.time, messages: [...(c.messages || []), message] })
      : c
  );
  storage.set(STORAGE_KEYS.BAILLEUR_CONVERSATIONS, next);
  notify(EVENTS.MESSAGES_CHANGED, { side: 'bailleur', convId });
  return message;
}

/** Marque une conversation du bailleur comme lue */
export function markBailleurConversationRead(convId) {
  const convs = getStoredBailleurConversations();
  if (!convs.some((c) => c.id === convId && c.unread)) return;
  storage.set(
    STORAGE_KEYS.BAILLEUR_CONVERSATIONS,
    convs.map((c) => (c.id === convId ? Object.assign({}, c, { unread: 0 }) : c))
  );
  publishUnreadCounts();
  notify(EVENTS.MESSAGES_CHANGED, { side: 'bailleur', convId });
}

/**
 * Recalcule les messages non lus (locataire et bailleur) et les publie dans
 * l'EventBus : le badge de l'onglet Messages se met à jour tout seul.
 */
export function publishUnreadCounts() {
  const sum = (list) => list.reduce((n, c) => n + (Number(c.unread) || 0), 0);
  Bus.setState(STATE_KEYS.UNREAD_CLIENT, sum(getStoredConversations()));
  Bus.setState(STATE_KEYS.UNREAD_BAILLEUR, sum(getStoredBailleurConversations()));
}

// ============================================================================
// 6. COMPTE BAILLEUR (activation à la première connexion)
// Essai gratuit de 30 jours ou abonnement Pro payé avec Max it.
// ============================================================================

export const BAILLEUR_PLANS = {
  trial: { id: 'trial', label: 'Essai gratuit', days: 30, price: 0 },
  pro: { id: 'pro', label: 'Pro mensuel', days: 30, price: 15000 }
};

const MONTHS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export function formatLongDate(ts) {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}`;
}

export function getBailleurAccount() {
  return storage.get(STORAGE_KEYS.BAILLEUR_ACCOUNT, null);
}

// Accès à l'espace bailleur : uniquement avec un essai ou un abonnement EN COURS
export function isBailleurActivated() {
  const account = getBailleurAccount();
  return !!(account && account.activatedAt && account.expiresAt > Date.now());
}

// Abonnement (ou essai) arrivé à échéance : il faut repayer avec Max it
export function isBailleurExpired() {
  const account = getBailleurAccount();
  return !!(account && account.activatedAt && account.expiresAt <= Date.now());
}

// L'essai gratuit de 30 jours n'est offert qu'une seule fois
export function canStartBailleurTrial() {
  const account = getBailleurAccount();
  return !(account && (account.trialUsed || account.plan === 'trial'));
}

// Garde à appeler dans onShow de chaque page bailleur (sauf l'accueil, qui affiche
// l'écran d'activation) : sans abonnement actif, retour à l'accueil verrouillé.
export function requireBailleurAccess() {
  if (isBailleurActivated()) return true;
  wx.reLaunch({ url: '/pages/bailleur/home/home' });
  return false;
}

// Les infos (nom, numéro) viennent du compte Max it : aucun formulaire à remplir
export function activateBailleurAccount(plan) {
  const chosen = BAILLEUR_PLANS[plan] || BAILLEUR_PLANS.trial;
  const profile = storage.get(STORAGE_KEYS.USER_PROFILE, null) || {};
  const now = Date.now();
  const account = {
    fullName: profile.fullName || 'Moussa Diop',
    phone: profile.phone || '771234567',
    city: profile.city || '',
    plan: chosen.id,
    trialUsed: chosen.id === 'trial' || !canStartBailleurTrial(),
    activatedAt: now,
    expiresAt: now + chosen.days * 24 * 60 * 60 * 1000
  };
  storage.set(STORAGE_KEYS.BAILLEUR_ACCOUNT, account);
  notify(EVENTS.BAILLEUR_ACCOUNT_CHANGED, { account });
  return account;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Paiements du bailleur (abonnement, boosts) affichés en tête de l'historique Premium
export function getBailleurPayments() {
  return storage.get(STORAGE_KEYS.BAILLEUR_PAYMENTS, []) || [];
}

function addBailleurPayment(title, amount) {
  const d = new Date();
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const payment = {
    id: `pay-${Date.now()}`,
    type: 'debit',
    title,
    meta: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} · Max it`,
    amount: `- ${formatMoney(amount)} F`,
    amountClass: 'amount-debit'
  };
  storage.set(STORAGE_KEYS.BAILLEUR_PAYMENTS, [payment, ...getBailleurPayments()]);
  return payment;
}

// Abonnement Pro payé avec Max it : +30 jours à partir de la fin actuelle (ou d'aujourd'hui si expiré)
export function renewBailleurSubscription() {
  const account = getBailleurAccount();
  if (!account) {
    // Première souscription : 30 jours à partir d'aujourd'hui
    const created = activateBailleurAccount('pro');
    addBailleurPayment('Abonnement Pro mensuel', BAILLEUR_PLANS.pro.price);
    return created;
  }
  const base = Math.max(Date.now(), account.expiresAt || 0);
  const next = Object.assign({}, account, {
    plan: 'pro',
    trialUsed: true,
    expiresAt: base + BAILLEUR_PLANS.pro.days * DAY_MS
  });
  storage.set(STORAGE_KEYS.BAILLEUR_ACCOUNT, next);
  addBailleurPayment('Abonnement Pro mensuel', BAILLEUR_PLANS.pro.price);
  notify(EVENTS.BAILLEUR_ACCOUNT_CHANGED, { account: next });
  return next;
}

// Boost d'une annonce, payé à part avec Max it (abonnement actif requis)
export function addBailleurBoost(option) {
  const account = getBailleurAccount() || {};
  const boost = { id: option.id, title: option.title, until: Date.now() + option.days * DAY_MS };
  storage.set(STORAGE_KEYS.BAILLEUR_ACCOUNT, Object.assign({}, account, {
    boosts: [boost, ...(account.boosts || [])]
  }));
  addBailleurPayment(option.title, option.price);
  notify(EVENTS.BAILLEUR_ACCOUNT_CHANGED, { account: getBailleurAccount() });
  return boost;
}

// ============================================================================
// 7. VÉRIFICATION D'IDENTITÉ BAILLEUR (KYC) — pièces pilotées par le Super Admin
// La liste des pièces exigées vient de getComplianceConfig() (back office).
// kyc.documents = { [documentId]: [{ path, name, type: 'image' | 'pdf' }] }
// ============================================================================

/** Pièces exigées et options de contrat (dernière config reçue, sinon valeurs par défaut) */
export function getComplianceConfig() {
  const saved = storage.get(STORAGE_KEYS.COMPLIANCE_CONFIG, null);
  if (saved && Array.isArray(saved.documents)) return saved;
  return COMPLIANCE_DEFAULTS;
}

/** Garde la config reçue de l'API pour la relire hors ligne */
export function setComplianceConfig(config) {
  if (!config || !Array.isArray(config.documents)) return;
  storage.set(STORAGE_KEYS.COMPLIANCE_CONFIG, config);
}

export function getBailleurKyc() {
  const saved = storage.get(STORAGE_KEYS.BAILLEUR_KYC, null);
  if (saved) {
    // Ancien format (photos de la CNI seules) : rangées sous la pièce d'identité
    if (!saved.documents) {
      const photos = (saved.photos || []).map((p, i) => ({ path: p, name: `Photo ${i + 1}`, type: 'image' }));
      return Object.assign({}, saved, { documents: photos.length ? { id_card: photos } : {} });
    }
    return saved;
  }
  // Par défaut en mode démo : vérifié
  return {
    status: 'verified', // 'verified' | 'pending' | 'unverified'
    documents: {},
    submittedAt: null,
    verifiedAt: Date.now() - 30 * 24 * 3600 * 1000
  };
}

/** Pièces obligatoires encore absentes du dossier */
export function getMissingKycDocuments(kyc = getBailleurKyc(), config = getComplianceConfig()) {
  const docs = kyc.documents || {};
  return config.documents.filter((d) => d.required && !(docs[d.id] && docs[d.id].length));
}

/**
 * Ajoute, remplace ou retire les fichiers d'une pièce (avant l'envoi du dossier).
 * @param {string} documentId
 * @param {Array<{ path: string, name: string, type: 'image'|'pdf' }>} files - [] pour retirer
 */
export function setBailleurKycDocument(documentId, files) {
  const current = getBailleurKyc();
  const documents = Object.assign({}, current.documents);
  if (files && files.length) documents[documentId] = files;
  else delete documents[documentId];
  const next = Object.assign({}, current, { documents });
  storage.set(STORAGE_KEYS.BAILLEUR_KYC, next);
  notify(EVENTS.BAILLEUR_ACCOUNT_CHANGED, { kyc: next });
  return next;
}

/**
 * Envoie le dossier au Super Admin. Refusé tant qu'une pièce obligatoire manque.
 * @returns {{ ok: boolean, missing: Array<Object>, kyc: Object }}
 */
export function submitBailleurKyc() {
  const current = getBailleurKyc();
  const missing = getMissingKycDocuments(current);
  if (missing.length) return { ok: false, missing, kyc: current };
  const kyc = Object.assign({}, current, {
    status: 'pending',
    submittedAt: Date.now(),
    verifiedAt: null
  });
  storage.set(STORAGE_KEYS.BAILLEUR_KYC, kyc);
  notify(EVENTS.BAILLEUR_ACCOUNT_CHANGED, { kyc });
  return { ok: true, missing: [], kyc };
}

export function setBailleurKycStatus(status) {
  const current = getBailleurKyc();
  const next = Object.assign({}, current, {
    status,
    verifiedAt: status === 'verified' ? Date.now() : null
  });
  storage.set(STORAGE_KEYS.BAILLEUR_KYC, next);
  notify(EVENTS.BAILLEUR_ACCOUNT_CHANGED, { kyc: next });
  return next;
}

