// ============================================================================
// I18N — Gestionnaire de langues SAMA LOYER (Français & Wolof)
//
// DANS LE JS :
//   import { t, setLocale, getLocale } from '../../utils/i18n/index';
//   wx.showToast({ title: t('favoris.removed') });
//
// DANS LE WXML :
//   import { i18nBehavior } from '../../utils/i18n/index';
//   Page({ behaviors: [i18nBehavior], ... });
//   <text>{{ i18n.common.search }}</text>
// ============================================================================

import fr from './fr.js';
import wo from './wo.js';
import { storage } from '../storage.js';
import { Bus } from '../event/index.js';
import { EVENTS } from '../event/keys.js';

const STORAGE_LOCALE_KEY = 'app_user_locale';
const MESSAGES = { fr, wo };
const DEFAULT_LOCALE = 'fr';

let currentLocale = storage.get(STORAGE_LOCALE_KEY, DEFAULT_LOCALE);

function lookup(dict, key) {
  if (!dict) return undefined;
  return key.split('.').reduce((node, part) => (node && node[part] !== undefined ? node[part] : undefined), dict);
}

/**
 * Traduit une clé ("domaine.cle") et remplace les paramètres {nom}.
 * Retombe sur le français si la clé wolof est absente, puis sur la clé elle-même.
 * @param {string} key
 * @param {Object} [params]
 * @returns {string}
 */
export function t(key, params = {}) {
  let text = lookup(MESSAGES[currentLocale], key);
  if (text === undefined) text = lookup(MESSAGES[DEFAULT_LOCALE], key);
  if (text === undefined) {
    return key;
  }
  return String(text).replace(/\{(\w+)\}/g, (match, name) => (params[name] !== undefined ? params[name] : match));
}

/** @returns {Object} Dictionnaire de la langue courante */
export function getMessages(locale) {
  const loc = locale || currentLocale;
  return MESSAGES[loc] || MESSAGES[DEFAULT_LOCALE];
}

/** @returns {string} 'fr' | 'wo' */
export function getLocale() {
  return currentLocale;
}

/**
 * Change la langue courante et la persiste en local storage.
 * @param {'fr'|'wo'} locale
 */
export function setLocale(locale) {
  if (MESSAGES[locale]) {
    currentLocale = locale;
    storage.set(STORAGE_LOCALE_KEY, locale);
    // Les pages déjà ouvertes changent de langue tout de suite
    Bus.emit(EVENTS.LOCALE_CHANGED, { locale }).catch(() => {});
    return true;
  }
  return false;
}

/** Injecte le dictionnaire et la langue dans data.i18n et data.currentLocale */
export const i18nBehavior = Behavior({
  data: {
    i18n: getMessages(),
    currentLocale: getLocale(),
  },

  lifetimes: {
    attached() {
      this._offLocale = Bus.on(EVENTS.LOCALE_CHANGED, ({ locale }) => {
        if (locale !== this.data.currentLocale) {
          this.setData({ i18n: getMessages(locale), currentLocale: locale });
        }
      });
    },
    detached() {
      if (this._offLocale) this._offLocale();
    },
  },

  pageLifetimes: {
    // Filet de sécurité si l'événement a été manqué
    show() {
      const stored = storage.get(STORAGE_LOCALE_KEY, DEFAULT_LOCALE);
      if (stored !== this.data.currentLocale) {
        currentLocale = stored;
        this.setData({
          i18n: getMessages(stored),
          currentLocale: stored,
        });
      }
    },
  },
});
