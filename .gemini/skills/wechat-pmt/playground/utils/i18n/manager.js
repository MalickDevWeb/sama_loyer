import { Bus } from '../bus/index';

const STORAGE_KEY = 'playground_pref_lang';
const DEFAULT_LANG = 'fr';
const SUPPORTED_LANGS = ['fr', 'wo', 'en'];

export function getLang() {
  try {
    const saved = wx.getStorageSync(STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved)) {
      return saved;
    }
  } catch (e) {}
  return DEFAULT_LANG;
}

export function setLang(newLang) {
  if (!SUPPORTED_LANGS.includes(newLang)) return;
  try {
    wx.setStorageSync(STORAGE_KEY, newLang);
  } catch (e) {}
  Bus.emit('LANG_CHANGED', newLang);
}

export function onLangChange(callback) {
  return Bus.on('LANG_CHANGED', callback);
}

