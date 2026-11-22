/**
 * ============================================================================
 * AIRLINE LOGO RESOLVER & FALLBACK (Résolveur Logos Compagnies & Fallback)
 * ============================================================================
 * 
 * Contrat unique partagé entre les listes de recherche, détails de vol,
 * plan de cabine, récapitulatif de commande et billet électronique.
 * 
 * Avantages majeurs pour WeChat / TCMPP :
 * 1. 0 ms de latence & 0 requête réseau pour les compagnies régionales fréquentes
 *    grâce au mappage direct vers les assets locaux `/assets/images/airlines/...`.
 * 2. Évite les blocages de domaines d'images externes non déclarés dans la console
 *    d'administration WeChat (mp.weixin.qq.com / downloadFile domain).
 * 3. Fallback textuel élégant en initiales graphiques (ex: "AS", "HF" ou "✈")
 *    quand l'image échoue via `<image binderror="..." />`.
 * 4. Protection de sécurité : rejet strict du HTTP en clair (seuls HTTPS et chemins
 *    locaux `/assets/` sont autorisés).
 */

const LOCAL_LOGOS = {
  HC: '/assets/images/airlines/air-senegal.png',
  HF: '/assets/images/airlines/air-cote-divoire.png',
  KP: '/assets/images/airlines/asky.png',
  R2: '/assets/images/airlines/transair.png',
  AF: '/assets/images/airlines/air-france.png',
  SS: '/assets/images/airlines/corsair.png',
  AT: '/assets/images/airlines/royal-air-maroc.png',
  SN: '/assets/images/airlines/brussels-airlines.png'
};

/**
 * Normalise un code transporteur IATA (2 caractères alphanumériques).
 * @param {string} value
 * @returns {string}
 */
export const normalizeCode = (value) => String(value || '').trim().toUpperCase();

/**
 * Extrait un code transporteur à partir d'un nom commercial avec tolérance aux accents.
 * @param {string} name
 * @returns {string} Code IATA ou chaîne vide
 */
export const codeFromName = (name) => {
  const normalized = String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]+/g, ' ')
    .trim();

  if (normalized.includes('air senegal')) return 'HC';
  if (normalized.includes('air cote d ivoire') || normalized.includes('cote d ivoire')) return 'HF';
  if (normalized.includes('asky')) return 'KP';
  if (normalized.includes('transair')) return 'R2';
  if (normalized.includes('air france')) return 'AF';
  if (normalized.includes('corsair')) return 'SS';
  if (normalized.includes('royal air maroc') || normalized.includes('ram')) return 'AT';
  if (normalized.includes('brussels')) return 'SN';
  return '';
};

/**
 * Détermine le code transporteur officiel IATA à partir d'un code ou du nom commercial.
 * @param {Object} options
 * @param {string} [options.code] Code IATA (ex: "HC")
 * @param {string} [options.name] Nom complet (ex: "Air Sénégal")
 * @returns {string}
 */
export const getAirlineCode = ({ code, name } = {}) => {
  const normalized = normalizeCode(code);
  return /^[A-Z0-9]{2}$/.test(normalized) ? normalized : codeFromName(name);
};

/**
 * Génère le libellé de secours textuel (initiales ou icône) pour les badges SVG/CSS.
 * @param {Object} options
 * @param {string} [options.code]
 * @param {string} [options.name]
 * @returns {string} 2 initiales majuscules ou le symbole "✈"
 */
export const airlineFallbackLabel = ({ code, name } = {}) => {
  const carrierCode = getAirlineCode({ code, name });
  if (carrierCode) return carrierCode;

  const initials = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || '✈';
};

/**
 * Résout la source de l'image du logo (asset local en priorité, URL HTTPS sécurisée, ou CDN fallback).
 * @param {Object} options
 * @param {string} [options.code] Code compagnie (ex: "HC")
 * @param {string} [options.name] Nom de la compagnie
 * @param {string} [options.logo] URL fournie par l'API backend
 * @returns {string} Chemin local `/assets/...` ou URL `https://...`
 */
export const resolveAirlineLogo = ({ code, name, logo } = {}) => {
  const carrierCode = getAirlineCode({ code, name });
  if (LOCAL_LOGOS[carrierCode]) {
    return LOCAL_LOGOS[carrierCode];
  }

  const supplied = String(logo || '').trim();
  // Protection de sécurité : Bloquer impérativement HTTP non chiffré en mini-programme
  if (/^https:\/\/[^\s]+$/i.test(supplied) || /^\/assets\//.test(supplied)) {
    return supplied;
  }

  // Fallback public CDN sécurisé en dernier recours si le code est connu
  return carrierCode
    ? `https://www.flighthub.com/cf-assets/images/suppliersx2/${carrierCode}x2.png`
    : '';
};

/**
 * Gestionnaire d'événement binderror pour balise <image> WeChat.
 * Active le drapeau de fallback dans les données de page/composant sans faire crasher l'UI.
 * 
 * @example
 * // WXML:
 * // <image wx:if="{{ !logoFailed }}" src="{{ logoUrl }}" binderror="onLogoError" />
 * // <view wx:else class="airline-fallback-badge">{{ fallbackText }}</view>
 * // JS:
 * // onLogoError(e) { handleAirlineLogoError(this, 'logoFailed'); }
 * 
 * @param {Object} context Instance de Page ou Component (this)
 * @param {string} dataKey Clé booléenne dans this.data (ex: 'logoFailed')
 */
export const handleAirlineLogoError = (context, dataKey = 'logoFailed') => {
  if (context && typeof context.setData === 'function') {
    context.setData({ [dataKey]: true });
  }
};

