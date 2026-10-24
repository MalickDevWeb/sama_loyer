// ============================================================================
// LIENS SAMA LOYER (QR codes et liens partagés)
// - Logement : https://samaloyer.sn/l/{logementId}
//   Affiche imprimée dans la chambre. Scannée par un visiteur → fiche du logement ;
//   par le locataire en place → paiement du loyer.
// - Invitation : https://samaloyer.sn/i/{token}?l={logementId}
//   Envoyée au locataire sans compte → contrat à signer et entrée à payer.
// Max it ouvre le mini-programme avec le lien scanné dans options.q (encodé).
// ============================================================================

import qrcode from '../vendor/qrcode-generator.js';

export const LINK_BASE = 'https://samaloyer.sn';

export function logementLink(logementId) {
  return `${LINK_BASE}/l/${encodeURIComponent(logementId)}`;
}

export function inviteLink(token, logementId) {
  return `${LINK_BASE}/i/${encodeURIComponent(token)}?l=${encodeURIComponent(logementId)}`;
}

/** Jeton d'invitation court et lisible (sans 0/O, 1/I) */
export function newInviteToken() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let t = '';
  for (let i = 0; i < 8; i++) t += chars.charAt(Math.floor(Math.random() * chars.length));
  return t;
}

/** Code affiché sous le QR (saisie manuelle si l'appareil ne scanne pas) */
export function shortCode(id) {
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return `SL-${(h % 1679616).toString(36).toUpperCase().padStart(4, '0')}`;
}

/**
 * Lit un lien SAMA LOYER (scanné ou reçu).
 * @param {string} raw - lien brut ou encodé (options.q)
 * @returns {{ type: 'logement', logementId: string } | { type: 'invite', token: string, logementId: string } | null}
 */
export function parseSamaLink(raw) {
  if (!raw) return null;
  let url = String(raw);
  try { url = decodeURIComponent(url); } catch (e) {}
  const m = url.match(/samaloyer\.sn\/(l|i)\/([^/?#]+)(?:\?l=([^&#]+))?/);
  if (!m) return null;
  if (m[1] === 'l') return { type: 'logement', logementId: decodeURIComponent(m[2]) };
  return { type: 'invite', token: decodeURIComponent(m[2]), logementId: m[3] ? decodeURIComponent(m[3]) : '' };
}

/**
 * Matrice du QR code (niveau de correction Q : reste lisible si l'affiche est
 * un peu abîmée ou mal imprimée).
 * @param {string} text
 * @returns {boolean[][]} true = module noir
 */
export function qrMatrix(text) {
  const qr = qrcode(0, 'Q');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount();
  const rows = [];
  for (let r = 0; r < n; r++) {
    const row = [];
    for (let c = 0; c < n; c++) row.push(qr.isDark(r, c));
    rows.push(row);
  }
  return rows;
}
