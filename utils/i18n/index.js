// ============================================================================
// I18N — Traductions de l'interface
//
// DANS LE JS :
//   import { t } from '../../utils/i18n/index';
//   wx.showToast({ title: t('favoris.removed') });
//   t('favoris.subtitle', { count: 3 })  // "3 logements enregistrés"
//
// DANS LE WXML (via la behavior, qui injecte le dictionnaire dans data.i18n) :
//   import { i18nBehavior } from '../../utils/i18n/index';
//   Page({ behaviors: [i18nBehavior], ... });
//   <text>{{ i18n.favoris.title }}</text>
//
// AJOUTER UNE LANGUE : créer wo.js avec les mêmes clés et l'ajouter à MESSAGES.
// ============================================================================

import fr from './fr.js';

const MESSAGES = { fr };
const DEFAULT_LOCALE = 'fr';

let currentLocale = DEFAULT_LOCALE;

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node && node[part] !== undefined ? node[part] : undefined), dict);
}

/**
 * Traduit une clé ("page.cle") et remplace les paramètres {nom}.
 * Retombe sur le français, puis sur la clé elle-même si elle est absente.
 * @param {string} key
 * @param {Object} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
  let text = lookup(MESSAGES[currentLocale], key);
  if (text === undefined) text = lookup(MESSAGES[DEFAULT_LOCALE], key);
  if (text === undefined) {
    console.warn(`[i18n] Clé manquante : ${key}`);
    return key;
  }
  return String(text).replace(/\{(\w+)\}/g, (match, name) => (params[name] !== undefined ? params[name] : match));
}

/** @returns {Object} Dictionnaire de la langue courante */
export function getMessages() {
  return MESSAGES[currentLocale] || MESSAGES[DEFAULT_LOCALE];
}

/**
 * Change la langue courante (les pages déjà ouvertes gardent l'ancienne).
 * @param {string} locale - ex. 'fr'
 */
export function setLocale(locale) {
  if (MESSAGES[locale]) currentLocale = locale;
}

/** Injecte le dictionnaire dans data.i18n pour l'utiliser dans le WXML */
export const i18nBehavior = Behavior({
  data: {
    i18n: getMessages(),
  },
});
