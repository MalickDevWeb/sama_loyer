# Directives Inviolables Gemini / Antigravity pour WeChat PMT & Sonatel TCMPP

Ce fichier s'applique de plein droit à l'agent Antigravity / Gemini lors de toute intervention sur ce projet.

---

## 🏛️ Instructions d'Exécution Inviolables

L'agent Antigravity DOIT impérativement appliquer et respecter les standards du référentiel `wechat-pmt` :

1. **Règle des 4 Fichiers** : Tout composant ou écran comporte obligatoirement `.js`, `.wxml`, `.wxss`, `.json` avec machine à états `uiState: 'loading' | 'success' | 'empty' | 'error'`.
2. **Safe Areas iPhone** : Tout élément fixé au bas de l'écran comporte `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));`.
3. **Orange Design System (ODS)** : Tokens officiels Sonatel (`#F16E00`, `#1A1A1A`, `#F6F6F6`), retours haptiques Apple Press (`hover-class="ods-btn--pressed"`) et pilule signature Solde OM masquable.
4. **Bouclier Anti-Double Débit Orange Money** : Scellement de `_confirmedTxnid` et Smart Polling sur `err.uncertain`.
5. **Résilience Réseau 4G & Outbox** : Compression d'image `wx.compressImage` à 75 % et file d'attente hors-ligne Outbox avec auto-replay automatique.
6. **Moteur i18n Wolof / Français** : Résolution WXS pur ES5 dans le template WXML à 0 ms de latence.
7. **Compilateur TCMPP & CDP** : Zéro BOM UTF-8 (`\uFEFF`), zéro `@font-face` local, zéro nesting SCSS, masquage MSISDN `77 *** ** 12`, et routage sécurisé `navigateToSafe()`.

