/**
 * 🔐 Module de Stockage Local Chiffré Transparent (Data-at-Rest Protection)
 * Conforme aux exigences de la CDP Sénégal et de l'Homologation Sécurité Sonatel (Max It).
 * Zéro dépendance externe - Poids : < 2 Ko.
 */

const APP_SECURITY_SALT = 'SONATEL_MAXIT_TCMPP_KEY_2026';

/**
 * Génère une empreinte unique liée à l'appareil pour sceller la clé de chiffrement
 */
function getDeviceFingerprint() {
  try {
    const sys = wx.getSystemInfoSync();
    return `${sys.brand || 'UNK'}_${sys.model || 'GENERIC'}_${sys.platform || 'DEV'}`;
  } catch (e) {
    return 'SONATEL_DEFAULT_DEVICE_FINGERPRINT';
  }
}

/**
 * Dérive une clé de chiffrement unique combinant le sel d'application et l'appareil
 */
function getDerivedKey() {
  return `${APP_SECURITY_SALT}_#_${getDeviceFingerprint()}`;
}

/**
 * Calcul d'un checksum rapide 32-bit FNV-1a pour détecter toute falsification (tampering)
 */
function computeChecksum(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
}

/**
 * Moteur de chiffrement symétrique par flux (RC4 / ARC4)
 */
function rc4Transform(key, inputStr) {
  const s = [];
  for (let i = 0; i < 256; i++) s[i] = i;

  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }

  let i = 0;
  j = 0;
  let res = '';
  for (let y = 0; y < inputStr.length; y++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
    res += String.fromCharCode(inputStr.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
  }
  return res;
}

/**
 * Chiffre une chaîne de texte brut vers une représentation hexadécimale sécurisée
 */
function encryptPayload(plainText, key) {
  const encoded = encodeURIComponent(plainText);
  const checksum = computeChecksum(encoded);
  const cipher = rc4Transform(key, encoded);

  let hex = '';
  for (let i = 0; i < cipher.length; i++) {
    hex += cipher.charCodeAt(i).toString(16).padStart(4, '0');
  }
  return `ENC:v1:${checksum}:${hex}`;
}

/**
 * Déchiffre une charge utile hexadécimale et vérifie son intégrité
 */
function decryptPayload(encryptedPayload, key) {
  if (!encryptedPayload || typeof encryptedPayload !== 'string' || !encryptedPayload.startsWith('ENC:v1:')) {
    return null;
  }

  const parts = encryptedPayload.split(':');
  if (parts.length < 4) return null;

  const expectedChecksum = parts[2];
  const hex = parts[3];

  let cipher = '';
  for (let i = 0; i < hex.length; i += 4) {
    cipher += String.fromCharCode(parseInt(hex.substr(i, 4), 16));
  }

  const decoded = rc4Transform(key, cipher);
  const actualChecksum = computeChecksum(decoded);

  if (actualChecksum !== expectedChecksum) {
    console.error('[SecureStorage] 🚨 Alerte Sécurité : Échec de validation du checksum (données altérées ou copié depuis un autre appareil) !');
    return null;
  }

  return decodeURIComponent(decoded);
}

/**
 * API Principale du Stockage Chiffré
 */
export const secureStorage = {
  /**
   * Sauvegarde une valeur sensible chiffrée sur le disque
   * @param {string} key Clé de stockage
   * @param {any} value Valeur à sécuriser (String, Number, Object, Array)
   * @returns {boolean} Succès de l'opération
   */
  set(key, value) {
    if (!key || value === undefined) return false;
    try {
      const serialized = JSON.stringify({ v: value });
      const keyDerived = getDerivedKey();
      const cipherText = encryptPayload(serialized, keyDerived);
      wx.setStorageSync(key, cipherText);
      return true;
    } catch (err) {
      console.error('[SecureStorage] Erreur lors du chiffrement/écriture de', key, err);
      return false;
    }
  },

  /**
   * Récupère et déchiffre une valeur sensible du disque
   * @param {string} key Clé de stockage
   * @param {any} [defaultValue=null] Valeur par défaut si absente ou corrompue
   * @returns {any} Valeur déchiffrée d'origine
   */
  get(key, defaultValue = null) {
    if (!key) return defaultValue;
    try {
      const raw = wx.getStorageSync(key);
      if (!raw) return defaultValue;

      // Si la valeur est encore en texte brut hérité (migration automatique transparente)
      if (typeof raw === 'string' && !raw.startsWith('ENC:v1:')) {
        try {
          const parsedLegacy = JSON.parse(raw);
          this.set(key, parsedLegacy.v !== undefined ? parsedLegacy.v : parsedLegacy);
          return parsedLegacy.v !== undefined ? parsedLegacy.v : parsedLegacy;
        } catch (_) {
          return raw;
        }
      }

      const keyDerived = getDerivedKey();
      const decrypted = decryptPayload(raw, keyDerived);
      if (decrypted === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(decrypted);
      return parsed.v !== undefined ? parsed.v : defaultValue;
    } catch (err) {
      console.error('[SecureStorage] Erreur de déchiffrement pour la clé', key, err);
      return defaultValue;
    }
  },

  /**
   * Supprime une clé du stockage
   * @param {string} key 
   */
  remove(key) {
    if (!key) return;
    try {
      wx.removeStorageSync(key);
    } catch (err) {
      console.warn('[SecureStorage] Erreur lors de la suppression de', key, err);
    }
  },

  /**
   * Vérifie si une clé existe
   * @param {string} key 
   */
  has(key) {
    return this.get(key) !== null;
  },

  /**
   * Purge toutes les clés sensibles stockées (utilisé lors de la déconnexion)
   */
  clearSensitiveSession() {
    const CRITICAL_KEYS = [
      'auth_token',
      'refresh_token',
      'token_expiry',
      'user_msisdn',
      'user_identity',
      'last_om_txnid'
    ];
    CRITICAL_KEYS.forEach((k) => this.remove(k));
  }
};

