# GitHub Copilot & Codex Instructions — WeChat PMT / Sonatel TCMPP

Lorsque vous suggérez ou générez du code pour ce mini-programme, appliquez obligatoirement les directives suivantes :

1. **Architecture des 4 Fichiers** : Tout composant ou page doit comporter `.js`, `.wxml`, `.wxss`, `.json` avec machine à états `uiState`.
2. **Safe Areas iPhone** : Appliquer systématiquement `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));` sur les éléments fixés en bas.
3. **Orange Design System** : Utiliser les couleurs officielles Sonatel (`#F16E00`, `#1A1A1A`, `#F6F6F6`), la pilule Solde Orange Money et les boutons tactiles `hover-class="ods-btn--pressed"`.
4. **Bouclier Anti-Double Débit Orange Money** : Sceller `_confirmedTxnid` et utiliser le Smart Polling sur `err.uncertain`.
5. **Résilience Réseau 4G & Outbox** : Compresser les images avant upload (`wx.compressImage` qualité 75) et utiliser l'Outbox Pattern hors-ligne.
6. **Moteur i18n WXS** : Utiliser le résolveur WXS pur ES5 pour le Wolof et le Français à 0 ms de latence.
7. **Compilateur TCMPP** : Enregistrer strictement en UTF-8 sans BOM (`\uFEFF`), sans nesting SCSS, sans `@font-face` local, et sécuriser la pile de 10 pages avec `navigateToSafe()`.
8. **Conformité CDP Sénégal** : Masquage obligatoire des MSISDN (`77 *** ** 12`).

