# Directives Inviolables pour WeChat Mini-Program & Sonatel TCMPP

Ce fichier définit les règles de gouvernance technique que tout agent d'ingénierie logicielle (Antigravity, Codex, etc.) DOIT impérativement respecter lors de la conception, de la modification ou du débogage de code WeChat Mini-Program et conteneurs Sonatel Max It (TCMPP).

---

## 🏛️ 1. Architecture & Règle des 4 Fichiers
- Toute page ou composant vit strictement dans son propre sous-dossier avec 4 fichiers :
  - `index.js` (Logique & Machine à états `uiState`)
  - `index.wxml` (Structure & Filtres WXS ES5)
  - `index.wxss` (Styles BEM scopés sans nesting)
  - `index.json` (Configuration WeChat)
- **Machine à états obligatoire** : Toujours piloter l'écran avec `uiState: 'loading' | 'success' | 'empty' | 'error'`. Zéro écran blanc pendant les chargements (utiliser les Skeletons Shimmer Wave à 60 FPS).
- **Règle des 2 Mo TCMPP** : Découper tout parcours applicatif riche en sous-paquet (`subpackages/`) avec préchargement silencieux `preloadRule` dans `app.json`.

---

## 📱 2. Ergonomie iPhone Physique & Safe Areas
- Tout conteneur ou bouton fixé au bas de l'écran (`position: fixed; bottom: 0;`) DOIT impérativement comporter :
  `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));`
- Bannir `height: 100vh; overflow: hidden;` (tronque les écrans iPhone à encoche et Dynamic Island). Utiliser `min-height: 100vh;`.
- Remplacer le pseudo-sélecteur CSS web `:active` par l'attribut WeChat natif :
  `hover-class="ods-btn--pressed"` avec `hover-start-time="20"` et `hover-stay-time="100"`.

---

## 🟠 3. Orange Design System (ODS Sonatel)
- Respecter scrupuleusement les tokens officiels Sonatel :
  - Orange Sonatel 500 : `#F16E00` (CTA primaire, onglets actifs)
  - Orange Vibrant : `#FF7900`
  - Anthracite Profond : `#1A1A1A` (Textes principaux, titres)
  - Fond Global Max It : `#F6F6F6` (Balise `page`)
  - Blanc Pur : `#FFFFFF` (Surfaces de cartes)
- Intégrer systématiquement le composant signature **Solde Orange Money** (`om-balance-pill`) avec masquage de confidentialité en 1 clic (`•••••• FCFA` vs `45 250 FCFA`).

---

## 💳 4. Bouclier Bancaire Anti-Double Débit Orange Money
- Sceller immédiatement `this._confirmedTxnid = txnid` dès confirmation du débit par le plugin natif.
- En cas de coupure 4G ou d'erreur réseau lors de la validation backend, le bouton "Réessayer" NE DOIT JAMAIS redemander de payer.
- Si `err.uncertain === true`, basculer obligatoirement sur le Smart Polling à 3 essais pour vérifier le statut de la transaction côté serveur.

---

## 📴 5. Résilience Réseau Ouest-Africain & Offline-First
- **Data-Saver** : Compresser obligatoirement toute image capturée via `wx.compressImage` (qualité 75) avant upload (**-96 % de data économisée**).
- **Outbox Pattern** : Pour toute action non-monétaire (formulaires, favoris, signalements), enregistrer la requête dans la file locale `Outbox.enqueue()` avec clé d'idempotence (`X-Idempotency-Key`) et rejeu automatique dès que `wx.onNetworkStatusChange` signale le retour de la connexion.
- **Moteur i18n Wolof / Français** : Utiliser le résolveur WXS pur ES5 (`i18n.wxs`) directement dans le template pour une bascule linguistique instantanée à **0 ms de latence**.

---

## 🔒 6. Conformité CDP Sénégal & Compilateur TCMPP
- **Masquage MSISDN** : Tout numéro de téléphone client DOIT être masqué sous la forme `77 *** ** 12` dans les affichages et les logs de télémétrie.
- **Zéro BOM UTF-8** : Aucun fichier source ne doit contenir le caractère invisible `\uFEFF`.
- **Zéro @font-face local** : Ne jamais charger de fichiers de police `.ttf` ou `.woff` en local.
- **Pile de navigation sécurisée** : Remplacer `wx.navigateTo` par `navigateToSafe()` pour empêcher le crash fatal à 10 pages.

