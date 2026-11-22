# 🇸🇳 Moteur i18n Régional (Wolof / Français / Anglais) à 0 ms de Latence

Ce guide formalise l'implémentation de l'internationalisation (**i18n**) pour les mini-programmes WeChat et conteneurs **Sonatel Max It (TCMPP)**, intégrant le **Wolof**, le **Français** et l'**Anglais**.

---

## 🎯 1. La Problématique des Bibliothèques i18n Classiques sur WeChat

Sur le web classique, les bibliothèques i18n injectent les textes traduits via le moteur JS. Sur WeChat, cette approche est un anti-pattern majeur :
- ❌ **Latence de Bridge JS ↔ WebView** : Chaque `this.setData({ translations: ... })` franchit le pont natif, générant un décalage visible et un effet de clignotement (**FOUC** : Flash of Untranslated Content).
- ❌ **Surcharge Mémoire** : Dupliquer l'intégralité du dictionnaire de traduction dans le `data` de chaque page sature la mémoire du smartphone.

### ✅ La Solution PMT : Le Moteur WXS Direct (0 ms de Latence)
En WeChat Mini-Program, **WXS (WeiXin Script)** s'exécute directement à l'intérieur du thread de rendu WebView.
- **Zéro latence** : Les chaînes sont résolues synchroniquement pendant la construction du DOM virtuel.
- **Zéro surcharge `setData`** : Seule la clé de langue active (ex: `'fr'` ou `'wo'`) est conservée dans l'état de la page.
- **Réactivité instantanée** : Le changement de langue répercute immédiatement les nouveaux libellés sur tout l'écran.

---

## 🗣️ 2. Lexique Régional Officiel Sonatel Max It

Voici le vocabulaire standardisé validé pour les parcours bancaires et e-services au Sénégal :

| Clé de Traduction | Français (`fr`) | Wolof (`wo`) | Anglais (`en`) |
|---|---|---|---|
| `common.confirm` | Confirmer | Dëggal | Confirm |
| `common.cancel` | Annuler | Neenal | Cancel |
| `common.back` | Retour | Dellu | Back |
| `common.loading` | Chargement... | Xaaral tuti... | Loading... |
| `om.balance` | Solde Orange Money | Khaloiss Orange Money | Orange Money Balance |
| `om.topup` | Recharger | Doolil | Top up |
| `om.pay` | Payer | Feye | Pay |
| `om.transfer` | Transférer | Yónnee | Transfer |
| `om.history` | Historique | Jaar-jaar | History |
| `net.offline` | Connexion perdue | Lëkkalekaay bi dëgërul | Connection lost |
| `ticket.qr` | Mon Billet QR | Sama Tike QR | My QR Ticket |

---

## ⚙️ 3. Architecture du Moteur en 3 Fichiers

```
utils/
  └── i18n/
        ├── locales.wxs      ← Dictionnaire de traductions optimisé WXS (ES5 pur)
        ├── i18n.wxs        ← Fonction de résolution t(key, lang, params)
        └── manager.js      ← Gestionnaire d'état de langue réactif (storage & EventBus)
```

### 3.1 Le Moteur WXS ES5 Pur (`utils/i18n/i18n.wxs`)
> [!IMPORTANT]
> Les fichiers `.wxs` doivent impérativement respecter la norme **ECMAScript 5**. Bannir `const`, `let`, les arrow functions `() =>` et les template strings `` `${var}` ``.

```javascript
var locales = {
  fr: {
    'common.confirm': 'Confirmer',
    'common.cancel': 'Annuler',
    'common.back': 'Retour',
    'common.loading': 'Chargement...',
    'om.balance': 'Solde Orange Money',
    'om.topup': 'Recharger',
    'om.pay': 'Payer',
    'om.transfer': 'Transférer',
    'om.history': 'Historique',
    'net.offline': 'Connexion réseau perdue'
  },
  wo: {
    'common.confirm': 'Dëggal',
    'common.cancel': 'Neenal',
    'common.back': 'Dellu',
    'common.loading': 'Xaaral tuti...',
    'om.balance': 'Khaloiss Orange Money',
    'om.topup': 'Doolil',
    'om.pay': 'Feye',
    'om.transfer': 'Yónnee',
    'om.history': 'Jaar-jaar',
    'net.offline': 'Lëkkalekaay bi dëgërul'
  },
  en: {
    'common.confirm': 'Confirm',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'om.balance': 'Orange Money Balance',
    'om.topup': 'Top up',
    'om.pay': 'Pay',
    'om.transfer': 'Transfer',
    'om.history': 'History',
    'net.offline': 'Network connection lost'
  }
};

/**
 * Traduit une clé avec fallback et remplacement de paramètres
 * Exemple : t('om.pay', 'wo') -> 'Feye'
 */
function t(key, lang, params) {
  var activeLang = lang || 'fr';
  var dict = locales[activeLang] || locales['fr'];
  var text = dict[key] || locales['fr'][key] || key;

  if (params) {
    for (var k in params) {
      if (params.hasOwnProperty(k)) {
        text = text.split('{' + k + '}').join(params[k]);
      }
    }
  }

  return text;
}

module.exports = {
  t: t
};
```

---

## 📱 4. Consommation Directe dans les Pages WXML

### Dans le template WXML (`pages/home/index.wxml`) :
```xml
<!-- Import du moteur WXS direct à 0 ms de latence -->
<wxs src="../../utils/i18n/i18n.wxs" module="i18n" />

<view class="container">
  <!-- Titre dynamique en fonction de la langue choisie -->
  <text class="title">{{ i18n.t('om.balance', lang) }}</text>

  <!-- Bouton d'action traduit -->
  <button class="ods-btn ods-btn--primary">
    {{ i18n.t('om.topup', lang) }}
  </button>

  <!-- Sélecteur rapide de langue en 1 tap -->
  <view class="lang-picker">
    <text class="lang-opt {{ lang === 'fr' ? 'active' : '' }}" bindtap="setLang" data-lang="fr">FR</text>
    <text class="lang-opt {{ lang === 'wo' ? 'active' : '' }}" bindtap="setLang" data-lang="wo">WO</text>
    <text class="lang-opt {{ lang === 'en' ? 'active' : '' }}" bindtap="setLang" data-lang="en">EN</text>
  </view>
</view>
```

### Dans le contrôleur JS (`pages/home/index.js`) :
```javascript
import { getLang, setLang, onLangChange } from '../../utils/i18n/manager';

Page({
  data: {
    lang: 'fr'
  },

  onLoad() {
    this.setData({ lang: getLang() });
    this._unsubLang = onLangChange((newLang) => {
      this.setData({ lang: newLang });
    });
  },

  setLang(e) {
    const selected = e.currentTarget.dataset.lang;
    setLang(selected);
  },

  onUnload() {
    if (this._unsubLang) {
      this._unsubLang();
    }
  }
});
```

