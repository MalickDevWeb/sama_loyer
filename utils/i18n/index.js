// ============================================================================
// I18N — Gestionnaire de langues SAMA LOYER (Français, Anglais & Wolof)
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
import en from './en.js';
import wo from './wo.js';
import { storage } from '../storage.js';
import { Bus } from '../event/index.js';
import { EVENTS } from '../event/keys.js';
import { busBehavior } from '../behaviors/bus.js';

const STORAGE_LOCALE_KEY = 'app_user_locale';
const MESSAGES = { fr, en, wo };
const DEFAULT_LOCALE = 'fr';

let currentLocale = storage.get(STORAGE_LOCALE_KEY, DEFAULT_LOCALE);

function lookup(dict, key) {
  if (!dict) return undefined;
  return key.split('.').reduce((node, part) => (node && node[part] !== undefined ? node[part] : undefined), dict);
}

/**
 * Traduit une clé ("domaine.cle") et remplace les paramètres {nom}.
 * Retombe sur le français si la clé est absente, puis sur la clé elle-même.
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

/** @returns {string} 'fr' | 'en' | 'wo' */
export function getLocale() {
  return currentLocale;
}

/**
 * Change la langue courante et la persiste en local storage.
 * @param {'fr'|'en'|'wo'} locale
 */
export function setLocale(locale) {
  if (MESSAGES[locale]) {
    currentLocale = locale;
    storage.set(STORAGE_LOCALE_KEY, locale);
    // Les pages et composants ouverts changent de langue tout de suite
    Bus.emit(EVENTS.LOCALE_CHANGED, { locale }).catch(() => {});
    return true;
  }
  return false;
}

/** Injecte le dictionnaire et la langue dans data.i18n et data.currentLocale */
export const i18nBehavior = Behavior({
  behaviors: [busBehavior],

  data: {
    i18n: getMessages(),
    currentLocale: getLocale(),
  },

  methods: {
    _initI18n() {
      const loc = getLocale();
      this.setData({ i18n: getMessages(loc), currentLocale: loc });
      if (this._i18nSubscribed) return;
      this._i18nSubscribed = true;
      if (typeof this.listen === 'function') {
        this.listen(EVENTS.LOCALE_CHANGED, ({ locale }) => {
          this.setData({ i18n: getMessages(locale), currentLocale: locale });
          if (typeof this.onLocaleChange === 'function') {
            this.onLocaleChange(locale);
          }
        });
      }
    },

    _syncI18n() {
      const stored = storage.get(STORAGE_LOCALE_KEY, DEFAULT_LOCALE);
      if (stored !== this.data.currentLocale) {
        currentLocale = stored;
        this.setData({
          i18n: getMessages(stored),
          currentLocale: stored,
        });
        if (typeof this.onLocaleChange === 'function') {
          this.onLocaleChange(stored);
        }
      }
    },
  },

  // Pour les composants (Component)
  lifetimes: {
    attached() {
      this._initI18n();
    },
  },

  pageLifetimes: {
    show() {
      this._syncI18n();
    },
  },

  // Pour les pages (Page WeChat)
  attached() {
    this._initI18n();
  },

  onLoad() {
    this._initI18n();
  },

  onShow() {
    this._syncI18n();
  },
});
