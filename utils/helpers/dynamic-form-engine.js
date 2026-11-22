/**
 * 📝 Moteur de Formulaires Dynamiques (Server-Driven UI)
 * Valide et orchestre les champs générés par un schéma JSON backend.
 */

/**
 * Valide un champ individuel selon ses règles déclaratives
 * @param {Object} field Définition du champ
 * @param {any} value Valeur saisie par l'utilisateur
 * @returns {string|null} Message d'erreur ou null si valide
 */
export function validateField(field, value) {
  const strVal = value !== undefined && value !== null ? String(value).trim() : '';

  // 1. Règle Obligatoire (Required)
  if (field.required) {
    if (field.type === 'switch') {
      if (!value) return field.errorRequired || `Vous devez accepter : ${field.label}`;
    } else if (!strVal) {
      return field.errorRequired || `Le champ « ${field.label} » est obligatoire.`;
    }
  }

  if (!strVal) return null;

  // 2. Longueur minimale / maximale
  if (field.minLength && strVal.length < field.minLength) {
    return `${field.label} doit contenir au moins ${field.minLength} caractères.`;
  }
  if (field.maxLength && strVal.length > field.maxLength) {
    return `${field.label} ne doit pas dépasser ${field.maxLength} caractères.`;
  }

  // 3. Validation par Regex (Format)
  if (field.pattern) {
    const regex = new RegExp(field.pattern);
    if (!regex.test(strVal)) {
      return field.errorPattern || `Le format de « ${field.label} » est invalide.`;
    }
  }

  // 4. Bornes numériques (pour type number)
  if (field.type === 'number') {
    const num = Number(strVal);
    if (isNaN(num)) return `${field.label} doit être un nombre valide.`;
    if (field.min !== undefined && num < field.min) return `${field.label} doit être au minimum ${field.min}.`;
    if (field.max !== undefined && num > field.max) return `${field.label} doit être au maximum ${field.max}.`;
  }

  return null;
}

/**
 * Valide l'intégralité d'un formulaire dynamique
 * @param {Array<Object>} schema Liste des champs envoyée par le serveur
 * @param {Object} values Dictionnaire des valeurs courantes
 * @returns {{ isValid: boolean, errors: Object, cleanData: Object }}
 */
export function validateFormSchema(schema = [], values = {}) {
  const errors = {};
  const cleanData = {};
  let isValid = true;

  schema.forEach((field) => {
    const val = values[field.name];
    const err = validateField(field, val);
    if (err) {
      errors[field.name] = err;
      isValid = false;
    } else {
      cleanData[field.name] = val;
    }
  });

  return { isValid, errors, cleanData };
}

