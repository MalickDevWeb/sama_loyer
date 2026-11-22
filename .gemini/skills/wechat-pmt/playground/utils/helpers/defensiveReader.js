/**
 * ============================================================================
 * DEFENSIVE READER & MONETARY ROUNDING RECONCILIATION
 * (Lecteur Défensif de Schémas JSON Opaques & Réconciliation d'Arrondis)
 * ============================================================================
 * 
 * Ce module résout deux problèmes majeurs en production WeChat / TCMPP :
 * 
 * 1. Crashs "Cannot read properties of undefined (reading '...')" :
 *    Les contrats d'API fournisseurs (GDS, agrégateurs, passerelles de paiement)
 *    ont souvent des structures polymorphiques ou changeantes (`additionalProperties: true`).
 *    `pickPath` inspecte une liste ordonnée de chemins candidats et extrait la première
 *    valeur valide sans jamais lever d'exception.
 * 
 * 2. Décalages d'arrondis de centimes (ex: 3 passagers × 33,33 = 99,99 != total 100,00) :
 *    `reconcileRoundedLines` réconcilie les lignes de sous-totaux avec le montant total
 *    facturé sans jamais fausser les montants unitaires, en identifiant l'écart d'arrondi
 *    (`adjustment`) borné à +/- (N+1)*unité.
 */

/**
 * Vérifie si la valeur est un objet ordinaire non nul et non tableau.
 * @param {*} value
 * @returns {boolean}
 */
export const isPlainObject = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

/**
 * Lit le premier chemin candidat non vide parmi une liste de chemins avec notation pointée.
 * 
 * @example
 * pickPath(response, ['tax.taxTotal', 'taxes.total', 'tax_amount']);
 * 
 * @param {Object} source Objet source
 * @param {string[]} paths Liste ordonnée de chemins candidats (ex: ['a.b.c', 'fallback'])
 * @returns {*} Première valeur définie et non nulle, ou undefined
 */
export const pickPath = (source, paths) => {
  if (!isPlainObject(source) && !Array.isArray(source)) return undefined;

  for (const path of paths) {
    const value = String(path)
      .split('.')
      .reduce(
        (acc, part) =>
          isPlainObject(acc) || Array.isArray(acc) ? acc[part] : undefined,
        source
      );
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }
  return undefined;
};

/**
 * Convertit un tableau ou un dictionnaire clé/valeur en liste ordonnée d'entrées.
 * @param {*} value
 * @returns {Array<Object>}
 */
export const toEntryList = (value) => {
  if (Array.isArray(value)) return value;
  if (isPlainObject(value)) {
    return Object.keys(value).map((key) => ({
      key,
      ...(isPlainObject(value[key]) ? value[key] : { value: value[key] })
    }));
  }
  return [];
};

/**
 * Extrait un montant numérique garanti fini (repli sur 0 si non défini).
 * @param {*} value
 * @returns {number}
 */
export const toAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  const numeric = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

/**
 * Parse un montant monétaire en préservant le caractère optionnel (renvoie `null` si absent).
 * Supporte les formats avec virgule, point, séparateurs de milliers et espaces insécables :
 * "1 234,50" -> 1234.50
 * "1,234.50" -> 1234.50
 * "1234.50"  -> 1234.50
 * 
 * @param {*} value
 * @returns {number|null} Montant fini ou null
 */
export const toOptionalAmount = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (value === null || value === undefined || value === '') return null;

  let numeric = String(value)
    .trim()
    .replace(/[\u00a0\u202f\s'’]/g, '')
    .replace(/[^0-9,.-]/g, '');

  if (!numeric || !/^-?[0-9][0-9,.-]*$/.test(numeric)) return null;

  const comma = numeric.lastIndexOf(',');
  const dot = numeric.lastIndexOf('.');

  if (comma >= 0 && dot >= 0) {
    const decimalIndex = Math.max(comma, dot);
    const decimals = numeric.length - decimalIndex - 1;
    numeric =
      decimals > 0 && decimals <= 2
        ? numeric.slice(0, decimalIndex).replace(/[,.]/g, '') +
          '.' +
          numeric.slice(decimalIndex + 1).replace(/[,.]/g, '')
        : numeric.replace(/[,.]/g, '');
  } else if (comma >= 0) {
    const groups = numeric.split(',');
    numeric =
      groups.length === 2 && groups[1].length > 0 && groups[1].length <= 2
        ? `${groups[0]}.${groups[1]}`
        : groups.join('');
  } else if ((numeric.match(/\./g) || []).length > 1) {
    numeric = numeric.replace(/\./g, '');
  }

  const amount = Number(numeric);
  return Number.isFinite(amount) ? amount : null;
};

/**
 * Réconcilie les montants de lignes arrondies avec le total attendu.
 * Empêche les décalages de centimes sans réallocation arbitraire.
 * 
 * @param {Array<Object>} lines Lignes de tarification (ex: passagers)
 * @param {string} field Nom du champ numérique (ex: "base", "tax")
 * @param {number} expectedTotal Montant total attendu certifié
 * @param {string} [currency='XOF'] Code devise pour déterminer l'unité minimale (1 pour XOF/JPY, 0.01 pour EUR/USD)
 * @returns {{ amounts: number[], adjustment: number }|null}
 */
export const reconcileRoundedLines = (lines, field, expectedTotal, currency = 'XOF') => {
  if (!Array.isArray(lines) || !lines.length || expectedTotal === null || expectedTotal === undefined) {
    return null;
  }

  const amounts = lines.map((line) => toOptionalAmount(line[field]));
  if (amounts.some((amount) => amount === null)) return null;

  const unit = ['XOF', 'XAF', 'GNF', 'JPY', 'KRW'].includes(String(currency).toUpperCase()) ? 1 : 0.01;
  const sum = amounts.reduce((acc, amount) => acc + amount, 0);
  const difference = expectedTotal - sum;
  const adjustment = Math.round(difference / unit) * unit;

  // Si l'écart dépasse la marge d'arrondi physique possible, la cohérence est rompue
  if (
    Math.abs(difference) > ((lines.length + 1) * unit) / 2 + 0.000001 ||
    Math.abs(difference - adjustment) > 0.000001
  ) {
    return null;
  }

  return {
    amounts,
    adjustment: Math.abs(adjustment) < 0.000001 ? 0 : adjustment
  };
};

