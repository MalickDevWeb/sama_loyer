# 🚨 Matrice Anti-Panique : Diagnostic des 30 Erreurs TCMPP & Orange Money

Ce guide est le tableau de bord de secours pour résoudre en moins de **60 secondes chrono** toute erreur critique survenant en développement, en phase d'homologation ou en production sur **WeChat** et **Sonatel Max It (TCMPP)**.

---

## 🌐 1. Erreurs Réseau & Whitelist Domaines TCMPP

| # | Message d'Erreur Exact | Cause Racine Technique | Correctif Immédiat (1 Ligne) |
|---|---|---|---|
| 1 | `request:fail url not in domain list` | L'URL appelée n'est pas déclarée dans `requestDomain` sur la console TCMPP. | Ajouter le domaine en HTTPS dans la Console TCMPP Sonatel (*Développement > Configuration Réseau*). En local : cocher *"Ne pas vérifier les noms de domaine valides"* dans WeChat DevTools. |
| 2 | `uploadFile:fail url not in domain list` | Endpoint d'upload de fichiers non déclaré dans `uploadFileDomain`. | Déclarer l'URL d'upload sur la Console TCMPP dans la section `uploadFileDomain`. |
| 3 | `downloadFile:fail url not in domain list` | CDN ou serveur de téléchargement d'images/PDFs non déclaré. | Déclarer le domaine CDN dans la section `downloadFileDomain` de la Console TCMPP. |
| 4 | `request:fail ssl handshake failed` | Certificat SSL révoqué, auto-signé ou version de TLS < 1.2. | Forcer TLS 1.2 ou TLS 1.3 avec chiffrement fort (AES-GCM/ECDHE) sur le serveur backend Sonatel. |
| 5 | `request:fail -118: net::ERR_CONNECTION_TIMED_OUT` | Coupure réseau mobile 3G/4G ou timeout de 10s dépassé. | Encapsuler la requête dans `retryAsync(fn, { maxRetries: 3, delayMs: 1000 })` et activer le Data-Saver (`wx.compressImage`). |
| 6 | `request:fail -102: net::ERR_CONNECTION_REFUSED` | Serveur backend éteint ou port bloqué par le firewall. | Vérifier que le port d'écoute est strictement le port 443 (HTTPS standard sans port personnalisé). |

---

## 💳 2. Erreurs Paiement, Max It SDK & Orange Money

| # | Code / Erreur Exacte | Cause Racine Technique | Correctif Immédiat (1 Ligne) |
|---|---|---|---|
| 7 | `OM_DOUBLE_CHARGE_PROTECTION` | L'utilisateur a cliqué deux fois sur "Payer" après une coupure 4G. | **Bouclier bancaire actif** : Vérifier `if (this._confirmedTxnid === txnid) return;` avant tout appel de débit. |
| 8 | `err.uncertain === true` | Coupure 4G après le débit bancaire mais avant la confirmation du serveur. | **NE JAMAIS faire repayer le client !** Lancer le Smart Polling à 3 essais (`utils/helpers/polling.js`) pour interroger le statut de la transaction. |
| 9 | `ERR_PAYMENT_USER_CANCELLED` (code 60001) | L'utilisateur a fermé la modale de saisie du code PIN Orange Money. | Afficher un message neutre bienveillant : `wx.showToast({ title: 'Paiement annulé', icon: 'none' })` et laisser la commande en attente. |
| 10 | `ERR_PAYMENT_INSUFFICIENT_FUNDS` (code 60002) | Solde Orange Money insuffisant pour couvrir le montant. | Proposer une redirection vers le rechargement Orange Money ou vers un compte tiers. |
| 11 | `ERR_SDK_NOT_INITIALIZED` | Appel à `miniSDK.user()` ou `miniSDK.screen.protect()` en dehors du conteneur Max It. | Activer `simulate: true` lors des tests sous WeChat DevTools pour injecter les fixtures de simulation. |
| 12 | `ERR_SCREEN_PROTECT_LEAK` | L'écran QR Code reste protégé contre les captures d'écran après avoir quitté la page. | Toujours appeler `miniSDK.screen.protect(false)` impérativement dans `onHide()` et `onUnload()`. |

---

## ⚙️ 3. Erreurs Compilateur TCMPP & Structure des Fichiers

| # | Message d'Erreur Exact | Cause Racine Technique | Correctif Immédiat (1 Ligne) |
|---|---|---|---|
| 13 | `Unexpected token ﻿ in JSON at position 0` | Présence d'un caractère invisible BOM UTF-8 (`\uFEFF`) en début de fichier. | Lancer `npm test` ou convertir le fichier en **UTF-8 sans BOM** via VSCode (rubrique en bas à droite). |
| 14 | `File not found: -do-not-use-local-path-` | Tentative de chargement d'un fichier de police locale `.ttf` ou `.woff` en WXSS. | Bannir les polices locales ; utiliser la font-stack système native `-apple-system, sans-serif`. |
| 15 | `Nesting is not supported in WXSS` | Utilisation de nesting SCSS interdit (`.card { .title { ... } }`). | Aplatir vos sélecteurs selon la convention BEM : `.card { ... } .card__title { ... }`. |
| 16 | `Component is not found in usingComponents` | Chemin relatif erroné dans le `.json` de la page. | Vérifier la profondeur relative (ex: `../../components/om-balance-pill/index`). |
| 17 | `Subpackage size exceeds 2048KB limit` | La taille d'un sous-paquet ou du paquet principal dépasse 2 Mo. | Lancer `npm run analyze` (`bundle-doctor.js`) et déporter les images locales lourdes vers le CDN Sonatel. |
| 18 | `Page [X] not found in app.json` | Une page créée n'est pas déclarée dans `pages` ou `subpackages`. | Déclarer le chemin de la page dans `app.json` sans l'extension `.js` (ex: `"pages/home/index"`). |

---

## 🧠 4. Erreurs Cycle de Vie, Mémoire & Navigation

| # | Message d'Erreur Exact | Cause Racine Technique | Correctif Immédiat (1 Ligne) |
|---|---|---|---|
| 19 | `can not navigateTo a tabbar page` | Utilisation de `wx.navigateTo` vers une page déclarée dans la TabBar. | Remplacer systématiquement par `wx.switchTab({ url: '/pages/home/index' })`. |
| 20 | `page limit 10 exceeded` | La pile de navigation WeChat a atteint le plafond fatal de 10 pages. | Remplacer `wx.navigateTo` par le helper officiel `navigateToSafe()` qui bascule automatiquement sur `wx.redirectTo`. |
| 21 | `navigateBack:fail cannot navigate back` | L'historique est vide (accès direct via deep link ou SMS). | Utiliser `navigateBackSafe('/pages/home/index')` pour rediriger vers la page d'accueil si la pile est à 1. |
| 22 | `setData() data size is too large` | Envoi d'un payload supérieur à 1024 Ko dans un seul appel `setData`. | Découper la mise à jour avec des chemins ciblés : `this.setData({ ['items[' + i + '].status']: 'done' })`. |
| 23 | `setData() called too frequently` | Plus de 20 appels `setData` par seconde (souvent dans `onPageScroll`). | Encapsuler l'écouteur avec `throttle(fn, 80)` pour brider la fréquence à 60 FPS constants. |
| 24 | `Maximum call stack size exceeded` | Récursion infinie dans un observateur (`observers`) ou boucle EventBus. | Rompre la boucle en vérifiant `if (newVal === oldVal) return;` dès l'entrée de l'observer. |

---

## 🗄️ 5. Erreurs Authentification, Stockage & Données

| # | Message d'Erreur Exact | Cause Racine Technique | Correctif Immédiat (1 Ligne) |
|---|---|---|---|
| 25 | `401 Unauthorized / Token Expired` | Le token OAuth2 a expiré pendant le transit mobile de la requête. | Ajouter le buffer de sécurité de 60 secondes : `isExpired = Date.now() >= (expiry - 60000)`. |
| 26 | `setStorage:fail quota exceeded` | Le quota de persistance locale de 10 Mo de WeChat a été dépassé. | Nettoyer le cache expiré avec `storage.cleanExpired()` et limiter la file d'attente Outbox à 50 éléments. |
| 27 | `getStorage returns empty string ''` | La clé demandée n'existe pas dans le stockage local WeChat. | Utiliser le wrapper `storage.get(key, defaultValue)` qui convertit `''` en `null` ou valeur par défaut. |
| 28 | `Date parsing returns NaN on iOS` | Format de date `YYYY-MM-DD HH:mm:ss` non supporté par le moteur JS iOS. | Remplacer les tirets par des slashes ou ajouter `T` : `new Date(dateStr.replace(/-/g, '/') + 'T00:00:00')`. |
| 29 | `CDP_MSISDN_UNMASKED_AUDIT_FAIL` | Un numéro de téléphone client apparaît en clair (`771234567`) dans l'UI ou les logs. | Appliquer le helper réglementaire : `maskMsisdn(phone)` pour afficher strictement `77 *** ** 67`. |
| 30 | `FOUC (Flash of Untranslated Content)` | Les traductions sont injectées via `setData`, provoquant un saut visuel. | Remplacer par le résolveur WXS pur ES5 : `<wxs src=".../i18n.wxs" module="i18n" />` et `{{ i18n.t('key', lang) }}` (0 ms). |

