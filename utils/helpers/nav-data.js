// ============================================================================
// PASSAGE DE DONNÉES ENTRE PAGES (via l'EventBus)
// Une liste qui a déjà un objet (logement, conversation…) le transmet à la page
// suivante au lieu de lui faire refaire un appel API. Seul un petit jeton passe
// dans l'URL ; l'objet reste en mémoire dans l'EventBus et n'est lu qu'une fois.
//
//   // Page liste
//   navigateWithData('/pages/client/logement-detail/logement-detail?id=12', logement);
//
//   // Page détail (onLoad)
//   const logement = takeNavData(options) || await api.getLogementDetail(options.id);
//
// Sans jeton (lien partagé, QR code, retour d'une autre appli), takeNavData
// renvoie null : la page charge alors ses données normalement.
// ============================================================================

import { Bus } from '../event/index.js';

const PREFIX = 'nav.';
let counter = 0;

/**
 * Ouvre une page en lui confiant un objet déjà chargé.
 * @param {string} url - URL de la page (garder l'id dans l'URL pour le repli)
 * @param {*} data - Objet à transmettre
 * @param {Object} [options] - Options de wx.navigateTo / wx.redirectTo
 * @param {boolean} [options.redirect] - true pour wx.redirectTo
 */
export function navigateWithData(url, data, options = {}) {
  counter += 1;
  const token = `p${Date.now().toString(36)}${counter}`;
  // silent : pas d'événement, c'est une simple remise de colis
  Bus.setState(PREFIX + token, data, true);

  const target = `${url}${url.includes('?') ? '&' : '?'}navData=${token}`;
  const { redirect, ...navOptions } = options;
  const go = redirect ? wx.redirectTo : wx.navigateTo;
  go(Object.assign({}, navOptions, {
    url: target,
    fail: (err) => {
      Bus.removeState(PREFIX + token); // page non ouverte : on libère l'objet
      if (navOptions.fail) navOptions.fail(err);
    }
  }));
}

/**
 * Récupère (une seule fois) l'objet confié par la page précédente.
 * @param {Object} options - options reçues par onLoad
 * @returns {*|null} l'objet, ou null s'il n'y en a pas
 */
export function takeNavData(options) {
  const token = options && options.navData;
  if (!token) return null;
  const key = PREFIX + token;
  const data = Bus.getState(key, null);
  if (data !== null) Bus.removeState(key);
  return data;
}
