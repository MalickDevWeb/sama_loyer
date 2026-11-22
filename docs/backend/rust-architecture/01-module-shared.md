# 01 — Module Shared (Transverse & Infrastructure)

Le module **Shared** fournit le socle transverse de la plateforme SAMA LOYER. Il applique les contraintes strictes d'authentification, d'idempotence, de sécurité bancaire et de gestion documentaire.

---

## 📋 Matrice Exhaustive des Endpoints & Contraintes

---

### 1. `POST /api/v1/auth/maxit`
*Échange de code d'authentification Sonatel Max It.*

- **Pré-requis & Rôles** : Public (aucun token requis).
- **En-têtes Requis** : `Content-Type: application/json`.
- **Validation des Entrées** :
  - `authCode` : String non vide, format Sonatel alphanumérique.
- **Contraintes Métier & Inter-dépendances** :
  - Le `authCode` ne peut être utilisé **qu'une seule fois** (Single-use token). S'il a déjà été consommé auprès de l'API Sonatel, rejeter immédiatement (`401 INVALID_AUTH_CODE`).
  - Si le numéro MSISDN extrait de Max It n'existe pas en base : création automatique du compte avec rôle par défaut `locataire` et statut KYC `UNVERIFIED`.
  - Si le compte est suspendu (`status = 'SUSPENDED'`), rejeter (`403 ACCOUNT_SUSPENDED`).
- **Codes d'Erreurs** :
  - `400 BAD_REQUEST` : Corps JSON manquant ou invalide.
  - `401 INVALID_AUTH_CODE` : Code expiré ou déjà consommé.
  - `403 ACCOUNT_SUSPENDED` : Compte bloqué pour litiges/fraude.

---

### 2. `POST /api/v1/auth/refresh`
*Renouvellement de session JWT.*

- **Pré-requis & Rôles** : Public (avec Refresh Token valide).
- **Validation des Entrées** :
  - `refreshToken` : Chaîne UUID cryptographique valide.
- **Contraintes Métier & Inter-dépendances** :
  - Le `refreshToken` doit exister en base et ne pas être expiré (`expires_at > NOW()`).
  - **Rotation obligatoire des jetons** : Chaque utilisation du Refresh Token révoque l'ancien et en émet un nouveau (prévention contre le vol de session).
  - L'utilisateur associé doit être actif (`status = 'ACTIVE'`).
- **Codes d'Erreurs** :
  - `401 TOKEN_EXPIRED_OR_REVOKED` : Jeton inexistant, révoqué ou expiré.

---

### 3. `POST /api/v1/auth/logout`
*Déconnexion et fermeture de session.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - Révocation immédiate en base de données du `refreshToken` actif de l'utilisateur.
  - Invalidation du JWT dans le cache Redis (`blacklist:jwt:<jti>` avec TTL = temps restant du token).
- **Codes d'Erreurs** :
  - `401 UNAUTHORIZED` : Jeton absent ou malformé.

---

### 4. `GET /api/v1/me`
*Consultation du profil utilisateur.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - L'utilisateur doit exister. Retourne le rôle actif (`locataire`, `bailleur`, `admin`), l'état de vérification CNI (`UNVERIFIED`, `PENDING`, `VERIFIED`, `REJECTED`) et les drapeaux de suspension.
- **Codes d'Erreurs** :
  - `401 UNAUTHORIZED`.
  - `404 USER_NOT_FOUND`.

---

### 5. `PATCH /api/v1/me`
*Mise à jour du profil utilisateur.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `firstName`, `lastName` : 2 à 50 caractères si fournis.
  - `email` : Format email RFC 5322 valide si fourni.
  - `preferredLanguage` : Strictement `'fr'` ou `'wo'`.
  - `secondaryPhone` : Format SN international `+221[70|75|76|77|78][0-9]{7}` si fourni.
- **Contraintes Métier & Inter-dépendances** :
  - **Immuabilité du numéro principal** : Le numéro MSISDN principal issu de Max It ne peut **jamais** être modifié par cet endpoint.
  - Si le profil est déjà `VERIFIED` au niveau KYC, la modification du nom/prénom est bloquée (`403 KYC_ALREADY_VERIFIED_LOCKED`).
- **Codes d'Erreurs** :
  - `400 VALIDATION_FAILED` : Format de champ incorrect.
  - `403 KYC_ALREADY_VERIFIED_LOCKED` : Nom verrouillé par identité officielle.

---

### 6. `POST /api/v1/webhooks/maxit`
*Notification asynchrone Orange Money / Sonatel.*

- **Pré-requis & Rôles** : Serveur Sonatel uniquement.
- **En-têtes Requis** :
  - `X-Sonatel-Signature` : Signature HMAC-SHA256 du body brut.
  - `Content-Type: application/json`.
- **Validation des Entrées** :
  - Payload contenant : `transactionId`, `orderId`, `status` (`SUCCESS`, `FAILED`, `CANCELLED`), `amount`, `currency` (`XOF`).
- **Contraintes Métier & Inter-dépendances** :
  - **Vérification HMAC obligatoire** : Tout webhook dont la signature ne correspond pas à la clé secrète partagée est rejeté immédiatement (`401 INVALID_SIGNATURE`).
  - **Idempotence stricte par `transactionId`** : Si le `transactionId` a déjà été traité avec succès, répondre `200 OK` sans re-créditer ou ré-émettre de quittance (Anti-rejouement).
  - Traitement en transaction SQL `SERIALIZABLE` :
    1. Si `orderId` commence par `LOY-` : paiement de loyer. Passage de l'échéance en `PAID` ou `PARTIAL`, émission de quittance.
    2. Si `orderId` commence par `COL-` : acompte de colocation. Conversion de la réservation temporaire en réservation définitive (`CONFIRMED`).
    3. Si `orderId` commence par `PRO-` : activation d'abonnement Bailleur Pro (`ends_at += 30 jours`).
- **Codes d'Erreurs** :
  - `401 INVALID_SIGNATURE` : Signature erronée.
  - `404 ORDER_NOT_FOUND` : Identifiant de commande inexistant.
  - `409 ALREADY_PROCESSED` : Transaction déjà clôturée.

---

### 7. `POST /api/v1/uploads`
*Demande d'URL présignée pour upload direct vers COS / S3.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `purpose` : Strictement l'un de `['CNI_RECTO', 'CNI_VERSO', 'LOGEMENT_PHOTO', 'CONTRAT_ANNEXE', 'AVATAR']`.
  - `mimeType` : Strictement `image/jpeg`, `image/png`, `image/webp` ou `application/pdf`.
  - `fileSizeBytes` : Maximum 10 Mo pour les photos, 15 Mo pour les PDF.
- **Contraintes Métier & Inter-dépendances** :
  - Pour `CNI_RECTO` et `CNI_VERSO`, le bucket cible est strictement **privé** avec chiffrement au repos AES-256.
  - L'URL présignée générée a une durée de validité limitée à **15 minutes**.
  - Rate-limit : Maximum 10 demandes d'upload par minute par utilisateur.
- **Codes d'Erreurs** :
  - `400 INVALID_MIME_TYPE_OR_SIZE` : Fichier trop lourd ou extension non autorisée.
  - `429 TOO_MANY_REQUESTS`.

---

### 8. `POST /api/v1/reports`
*Signalement d'un litige ou d'une annonce suspecte.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `targetType` : `LOGEMENT` ou `USER`.
  - `targetId` : UUID valide de l'entité ciblée.
  - `reason` : Enum `FRAUD_ATTEMPT`, `OFFLINE_PAYMENT_REQUEST`, `MISLEADING_PHOTOS`, `INAPPROPRIATE_BEHAVIOR`.
  - `description` : 10 à 500 caractères.
- **Contraintes Métier & Inter-dépendances** :
  - Un utilisateur ne peut pas signaler la même entité plus d'une fois.
  - **Règle anti-fraude automatique** : Dès que `reports_count >= 3` sur un bailleur ou un logement, l'entité est automatiquement masquée de la recherche publique (`status = 'SUSPENDED'`) en attente de modération admin.
- **Codes d'Erreurs** :
  - `404 TARGET_NOT_FOUND`.
  - `409 ALREADY_REPORTED`.

---

### 9. `POST /api/v1/admin/auth/login`
*Connexion administrateur.*

- **Pré-requis & Rôles** : Public (réservé aux admins).
- **Validation des Entrées** :
  - `email`, `password` (Argon2id hashé).
- **Contraintes Métier & Inter-dépendances** :
  - Le compte doit avoir le rôle `admin` ou `moderator`.
  - Déclenche un log d'audit immuable `admin_audit_logs`.
  - Blocage après 5 tentatives infructueuses pendant 15 minutes.
- **Codes d'Erreurs** :
  - `401 BAD_CREDENTIALS`.
  - `429 ACCOUNT_TEMPORARILY_LOCKED`.

---

### 10. `GET /api/v1/admin/dashboard` & `POST /api/v1/admin/annonces/{id}/approve`
*Modération & Dashboard.*

- **Pré-requis & Rôles** : Administrateur (`Bearer <JWT>` avec rôle `admin`).
- **Contraintes Métier & Inter-dépendances** :
  - Pour approuver une annonce (`/approve`), celle-ci doit obligatoirement être en statut `PENDING_REVIEW`.
  - L'annonce doit posséder au moins 4 photos valides et un bailleur dont la CNI a été vérifiée (`verification_status = 'VERIFIED'`).
- **Codes d'Erreurs** :
  - `403 FORBIDDEN` : Non-administrateur.
  - `409 INVALID_STATE_TRANSITION` : L'annonce n'est pas en attente de validation.
