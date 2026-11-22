> 🔗 **Navigation :** [Guide UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 🛡️ Homologation, Sécurité & Conformité Sonatel (Max It)

Avant qu'un mini-programme ne soit publié et accessible aux millions d'utilisateurs de la Super-App **Max It**, il doit franchir avec succès le **Comité d'Homologation Technique et Sécurité de Sonatel** (DSI, RSSI et Pôle Juridique).

Ce document formalise les critères éliminatoires et les standards de conformité indispensables pour obtenir le label **« Production Ready »**.

---

## 🏛️ 1. Conformité CDP Sénégal (Protection des Données Personnelles)

La législation sénégalaise (Loi n° 2008-12 sur la protection des données à caractère personnel) et les règles de conformité Orange/Sonatel interdisent formellement l'exposition en clair des données identifiantes des clients.

### 1.1 Masquage Strict des Numéros MSISDN
Un numéro de téléphone ne doit **JAMAIS** apparaître en clair dans l'interface, ni dans les `console.log`, ni dans les charges utiles de télémétrie.

**Format obligatoire :**
* Numéro brut : `+221771234567` ou `771234567`
* Format masqué légal : `77 *** ** 67` ou `+221 77 *** ** 67`

```javascript
/**
 * Masque un numéro de téléphone sénégalais/ouest-africain selon les normes CDP
 * @param {string} msisdn Le numéro brut (ex: "771234567" ou "+221771234567")
 * @returns {string} Le numéro masqué (ex: "77 *** ** 67")
 */
export function maskMsisdn(msisdn) {
  if (!msisdn || typeof msisdn !== 'string') return '';
  const cleaned = msisdn.replace(/\s+/g, '').replace(/^\+221/, '');
  if (cleaned.length < 9) return '***';

  const prefix = cleaned.slice(0, 2); // Ex: 77, 78, 76, 70
  const suffix = cleaned.slice(-2);   // Ex: 67
  return `${prefix} *** ** ${suffix}`;
}
```

---

## 🔐 2. Sécurisation du Stockage Local (`wxStorage`)

Le stockage local sur smartphone est persistant mais non crypté par défaut sur certains terminaux Android.

| Donnée | Statut Homologation | Règle Stricte |
|---|---|---|
| **Code PIN Orange Money** | ❌ **INTERDICTION ABSOLUE** | Tout stockage de code PIN ou mot de passe entraîne un **rejet immédiat et définitif** de l'homologation. |
| **Numéro de carte bancaire / CVV** | ❌ **INTERDICTION ABSOLUE** | Délégué exclusivement aux passerelles PCI-DSS. |
| **Token OAuth2 d'accès** | ⚠️ **Autorisé sous conditions** | Doit être associé à un timestamp d'expiration (`token_expiry`) et purgé dès déconnexion. |
| **Données de profil (Nom, Prénom)** | ✅ **Autorisé** | Stockage en cache mémoire/disque autorisé pour accélération UI. |

### 2.1 Purge Obligatoire à la Déconnexion (`clearSessionSafe`)
```javascript
export function clearSessionSafe() {
  const SENSITIVE_KEYS = ['auth_token', 'token_expiry', 'user_msisdn', 'refresh_token'];
  SENSITIVE_KEYS.forEach((key) => {
    try {
      wx.removeStorageSync(key);
    } catch (e) {
      console.warn('[Security] Erreur lors de la purge :', key, e);
    }
  });
}
```

### 2.2 Chiffrement Obligatoire des Données au Repos (`Data-at-Rest`) avec `secureStorage`
Les données sensibles telles que les jetons d'accès JWT, les numéros MSISDN et les identités des clients ne doivent **JAMAIS** être stockées en clair (`JSON.stringify`) dans `wx.setStorageSync`.

Un audit de sécurité Sonatel / CDP recherche systématiquement ces données en mémoire flash. L'utilisation du wrapper **`secureStorage`** est obligatoire :
* **Empreinte matérielle dynamique** (`brand + model + platform`) combinée à un sel applicatif.
* **Chiffrement symétrique par flux** (RC4) compact à 0 dépendance npm.
* **Contrôle d'intégrité anti-falsification** (Checksum FNV-1a).

> 💡 **Implémentation prête à l'emploi :** Voir [Recette 60 : Stockage Local Chiffré AES Transparent](DOC_RECETTES_COPIER_COLLER.md#-recette-60--stockage-local-chiffré-aes-transparent-protection-data-at-rest-cdp--sonatel).

---

## 🌐 3. Whitelist Réseau TCMPP (Domaines Autorisés)

Sur TCMPP / WeChat, aucun appel réseau ne peut aboutir si son nom de domaine n'est pas préalablement enregistré dans la Console d'Administration de l'hôte.

### 3.1 Matrice des Environnements Sonatel
| Type d'Appel | Environnement Recette (UAT) | Environnement Production |
|---|---|---|
| **API Backend (`requestDomain`)** | `https://api-uat.sonatel.sn` | `https://api.sonatel.sn` |
| **Upload Médias (`uploadFileDomain`)** | `https://upload-uat.sonatel.sn` | `https://upload.sonatel.sn` |
| **CDN & Assets (`downloadFileDomain`)**| `https://cdn-uat.sonatel.sn` | `https://cdn.sonatel.sn` |
| **Protocole obligatoire** | **HTTPS strict (TLS 1.2 minimum)** | **HTTPS strict (TLS 1.3 recommandé)** |

> ⚠️ **Piège d'homologation :** L'option `checkInvalidHost: false` dans `project.config.json` fonctionne sous WeChat DevTools mais est **strictement ignorée sur terminal réel**. Tout domaine absent de la whitelist provoque une erreur `request:fail url not in domain list`.

---

## 🛡️ 4. Protection Anti-Capture d'Écran (`screen.protect`)

Pour les billets électroniques, codes QR de retrait ou transactions confidentielles, l'activation du bouclier anti-capture d'écran est un critère de validation de sécurité :

```javascript
import miniSDK from '@sonatel-os/maxit-mini-sdk';

Page({
  async onShow() {
    // 🔒 Verrouille les captures et enregistrements vidéo de l'écran
    try {
      await miniSDK.screen.protect(true);
    } catch (err) {
      console.warn('Protection écran non supportée sur cet appareil', err);
    }
  },

  async onHide() {
    // 🔓 DÉVERROUILLAGE OBLIGATOIRE : Sinon tout Max It reste noir !
    await miniSDK.screen.protect(false);
  },

  async onUnload() {
    // 🔓 Sécurité supplémentaire lors de la destruction de page
    await miniSDK.screen.protect(false);
  }
});
```

---

## ✅ 5. Grille d'Audit de Production (Les 10 Portes d'Homologation)

Avant de soumettre votre version à Sonatel, validez chaque porte :

```text
[ ] Porte 1  : Zéro code PIN ou mot de passe en stockage local (wx.setStorageSync).
[ ] Porte 2  : Masquage CDP effectif sur tous les numéros de téléphone (77 *** ** 12).
[ ] Porte 3  : Tous les domaines réseaux sont déclarés en HTTPS strict sur la Console TCMPP.
[ ] Porte 4  : Le paquet principal (root) pèse strictement moins de 2 Mo.
[ ] Porte 5  : Le bouclier anti-double débit Orange Money (_confirmedTxnid) est actif.
[ ] Porte 6  : miniSDK.screen.protect(false) est impérativement appelé dans onHide et onUnload.
[ ] Porte 7  : Les erreurs 4G/incertaines (err.uncertain === true) ne redemandent jamais de repayer.
[ ] Porte 8  : Les images de pièces d'identité sont compressées côté client avant upload.
[ ] Porte 9  : Aucun caractère BOM UTF-8 (\uFEFF) dans aucun fichier source (npm test valide).
[ ] Porte 10 : Zéro plantage de navigation sur pile saturée (navigateToSafe utilisé partout).
```

