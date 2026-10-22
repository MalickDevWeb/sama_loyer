// ============================================================================
// VISITES HELPER (Local Storage Persistence)
// Source unique des demandes de visite du locataire, sous STORAGE_KEYS.VISITES.
// ============================================================================

import { storage } from '../storage.js';
import { STORAGE_KEYS } from '../constants/index';
import { DEFAULT_VISITES } from '../mocks/visites';
import { getLogementById } from '../mocks/logements';

const STATUS_META = {
  pending: { statusLabel: 'En attente', statusClass: 'status-pending' },
  accepted: { statusLabel: 'Acceptée', statusClass: 'status-accepted' },
  rejected: { statusLabel: 'Refusée', statusClass: 'status-rejected' }
};

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/**
 * Visites enregistrées (au premier lancement : visites de démo).
 * @returns {Array<Object>}
 */
function getRawVisites() {
  const saved = storage.get(STORAGE_KEYS.VISITES, null);
  return Array.isArray(saved) ? saved : DEFAULT_VISITES.slice();
}

/**
 * Visites prêtes à afficher, complétées avec les infos du logement.
 * @returns {Array<Object>}
 */
export function getVisites() {
  return getRawVisites()
    .map((v) => {
      const l = getLogementById(v.logementId);
      if (!l) return null;
      return Object.assign({}, v, STATUS_META[v.status] || STATUS_META.pending, {
        title: l.title,
        place: `${l.place} · ${formatMoney(l.price)} F`,
        bailleur: `Bailleur : ${l.bailleurName}`,
        canNavigate: v.status === 'accepted',
        canMessage: v.status === 'accepted',
        canCancel: v.status === 'pending'
      });
    })
    .filter(Boolean);
}

/**
 * Ajoute une demande de visite (statut "en attente") en tête de liste.
 * @param {string} logementId
 * @param {string} slotLabel - ex. "Samedi 24 octobre · 16 h"
 * @param {string} [message]
 * @returns {Object} La visite créée
 */
export function addVisite(logementId, slotLabel, message = '') {
  const visite = {
    id: `v-${Date.now()}`,
    logementId,
    status: 'pending',
    dateLabel: slotLabel,
    note: message ? `Ton message : « ${message} »` : 'Envoyée à l’instant. Le bailleur répond en général sous 24 h.'
  };
  storage.set(STORAGE_KEYS.VISITES, [visite, ...getRawVisites()]);
  return visite;
}

/**
 * Supprime une demande de visite.
 * @param {string} id
 */
export function cancelVisite(id) {
  storage.set(STORAGE_KEYS.VISITES, getRawVisites().filter((v) => v.id !== id));
}
