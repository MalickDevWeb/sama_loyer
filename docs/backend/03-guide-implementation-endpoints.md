# 03 — Guide d'implémentation exhaustif des endpoints Backend (v1)

> Ce document est le **guide opérationnel complet** destiné aux développeurs backend (Node.js/NestJS/Express, Python/FastAPI, Go ou Java/Spring).  
> Pour chaque endpoint de l'API SAMA LOYER, il détaille :  
> 1. **Rôle & comportement métier** (ce qu'il doit faire, tables PostgreSQL touchées, transactions atomiques, effets de bord).  
> 2. **Données d'entrée** (Headers, Path params, Query params, Body JSON).  
> 3. **Règles de validation strictes** (schémas Zod/Joi, contraintes métier, bornes, erreurs renvoyées).  
> 4. **Données de sortie** (Structure JSON exacte en succès et échec, codes HTTP).  
> 5. **Idempotence & Sécurité** (RBAC, isolation des données, traçabilité).

---

## Sommaire

1. [Règles architecturales globales & Enveloppe](#1-règles-architecturales-globales--enveloppe)
2. [Authentification & Utilisateur (`/auth`, `/me`)](#2-authentification--utilisateur-auth-me)
3. [Référentiels & Recherche Logements (`/zones`, `/amenities`, `/logements`, `/search`)](#3-référentiels--recherche-logements-zones-amenities-logements-search)
4. [Favoris Locataire (`/me/favoris`)](#4-favoris-locataire-mefavoris)
5. [Visites de Logements (`/visites`)](#5-visites-de-logements-visites)
6. [Messagerie & Conversations (`/conversations`, `/me/unread-counts`)](#6-messagerie--conversations-conversations-meunread-counts)
7. [Location, Contrats & Entrée (`/logements/{id}/locations`, `/contrats`)](#7-location-contrats--entrée-logementsidlocations-contrats)
8. [Échéances, Paiements & Quittances (`/loyers`, `/payments`, `/quittances`)](#8-échéances-paiements--quittances-loyers-payments-quittances)
9. [Espace Bailleur — Compte & Abonnement (`/bailleur/compte`, `/bailleur/abonnement`)](#9-espace-bailleur--compte--abonnement-bailleurcompte-bailleurabonnement)
10. [Espace Bailleur — Annonces & Horaires (`/bailleur/annonces`)](#10-espace-bailleur--annonces--horaires-bailleurannonces)
11. [Espace Bailleur — Visites & Locataires (`/bailleur/visites`, `/bailleur/locataires`, `/bailleur/echeances`)](#11-espace-bailleur--visites--locataires-bailleurvisites-bailleurlocataires-baillerecheances)
12. [Services Transverses & Webhooks (`/uploads`, `/reports`, `/webhooks/maxit`, `/health`)](#12-services-transverses--webhooks-uploads-reports-webhooksmaxit-health)
13. [Back-Office d'Administration (`/admin`)](#13-back-office-dadministration-admin)

---

## 1. Règles architecturales globales & Enveloppe

### 1.1 Enveloppe standardisée
Toute réponse HTTP de l'API doit impérativement respecter l'enveloppe suivante :

#### Format de succès (`200 OK`, `201 Created`, `202 Accepted`)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "total": 134,
    "hasMore": true
  }
}
```
*Note : Le bloc `meta` est présent uniquement sur les collections paginées.*

#### Format d'erreur (`4xx`, `5xx`)
```json
{
  "success": false,
  "code": "VALIDATION_ERROR",
  "message": "Le numéro de téléphone est invalide.",
  "details": {
    "field": "phone",
    "rule": "regex",
    "expected": "^(7[05678]|33)[0-9]{7}$"
  },
  "requestId": "APP-9f8e7d6c-1"
}
```

### 1.2 Headers obligatoires
* `Content-Type: application/json; charset=utf-8`
* `Authorization: Bearer <JWT>` sur tous les endpoints authentifiés.
* `Idempotency-Key: <UUIDv4>` **obligatoire** sur toutes les mutations critiques : création de visite, initiation de paiement, signature de contrat, création d'annonce.
* `Accept-Language: fr | en | wo` (par défaut `fr`).
* `X-Request-Id: <UUID>` et `X-Client-Ref: <string>` relayés dans les logs.

---

## 2. Authentification & Utilisateur (`/auth`, `/me`)

### 2.1 `POST /api/v1/auth/maxit`
* **Rôle :** Point d'entrée unique de connexion pour le mini-programme dans Orange Max it (TCMPP). Échange le code temporaire d'autorisation fourni par `wx.login()` contre un compte utilisateur et une paire de jetons JWT.
* **Tables impactées :** `users`, `refresh_tokens`.
* **Logique métier :**
  1. Appelle le serveur d'authentification partenaire Orange avec `authCode` pour récupérer `maxitUserId`, `phone` normalisé (+221...), `fullName`, `kycLevel`.
  2. `UPSERT` dans la table `users` (clé unique `maxit_user_id` ou `phone`).
  3. Génère un `accessToken` JWT (durée 1 heure, signé RS256, payload : `{ sub: user.id, roles: user.roles }`) et un `refreshToken` (durée 30 jours, hash SHA-256 stocké en base).
* **Entrée :**
  ```json
  {
    "authCode": "mxt_ac_98a7sd8f7a6sd5f8"
  }
  ```
* **Validations :**
  - `authCode` : `string`, obligatoire, non vide, max 255 caractères.
  - Si le code est invalide ou expiré côté Orange : `401 UNAUTHENTICATED` (`Code d'autorisation Max it expiré ou invalide`).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "accessToken": "eyJhbGciOiJSUzI1NiIs...",
      "tokenType": "Bearer",
      "expiresIn": 3600,
      "refreshToken": "rt_8f9a7d6e5c4b3a21...",
      "user": {
        "id": "u-a1b2c3d4-e5f6-7890",
        "phone": "+221771234512",
        "fullName": "Awa Diop",
        "roles": ["locataire"],
        "kycVerified": true,
        "avatarUrl": null
      }
    }
  }
  ```

---

### 2.2 `POST /api/v1/auth/refresh`
* **Rôle :** Rafraîchissement transparent du jeton d'accès sans déconnecter l'utilisateur. Applique la **rotation stricte des refresh tokens** (l'ancien token est immédiatement révoqué).
* **Entrée :**
  ```json
  {
    "refreshToken": "rt_8f9a7d6e5c4b3a21..."
  }
  ```
* **Validations :**
  - `refreshToken` : présent, existant en table `refresh_tokens`, statut non révoqué, date d'expiration > maintenant.
  - Si token révoqué ou introuvable : `401 TOKEN_EXPIRED` (déconnexion requise).
* **Sortie (`200 OK`) :** Même structure que 2.1 avec nouveaux `accessToken` et `refreshToken`.

---

### 2.3 `POST /api/v1/auth/logout`
* **Rôle :** Révocation immédiate de la session.
* **Entrée :** `Authorization: Bearer <JWT>`, Body optionnel `{ "refreshToken": "..." }`.
* **Sortie (`200 OK`) :** `{ "success": true, "data": { "loggedOut": true } }`.

---

### 2.4 `GET /api/v1/me`
* **Rôle :** Profil complet de l'utilisateur connecté, ses rôles actifs, état du compte bailleur s'il existe.
* **Entrée :** Headers `Authorization: Bearer <token>`.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "u-a1b2c3d4-e5f6-7890",
      "phone": "+221771234512",
      "fullName": "Awa Diop",
      "roles": ["locataire", "bailleur"],
      "kycLevel": "level_2",
      "city": "Dakar",
      "locale": "fr",
      "stats": {
        "favoris": 5,
        "visites": 4,
        "conversations": 3
      },
      "bailleur": {
        "status": "active",
        "plan": "trial",
        "trialEndsAt": "2026-11-24T18:00:00Z",
        "idDocumentVerified": true
      }
    }
  }
  ```

---

### 2.5 `PATCH /api/v1/me`
* **Rôle :** Mise à jour des préférences personnelles modifiables par l'utilisateur. Le nom et le téléphone sont immuables (gérés par Max it).
* **Entrée :**
  ```json
  {
    "city": "Dakar",
    "locale": "en",
    "preferredZones": ["ouakam", "ngor"],
    "budgetMax": 100000
  }
  ```
* **Validations :**
  - `locale` : enum `['fr', 'en', 'wo']`.
  - `budgetMax` : entier positif, max 10 000 000 XOF.
  - `preferredZones` : tableau de codes de zones valides.
* **Sortie (`200 OK`) :** Profil mis à jour.

---

## 3. Référentiels & Recherche Logements (`/zones`, `/amenities`, `/logements`, `/search`)

### 3.1 `GET /api/v1/zones`
* **Rôle :** Liste des quartiers couverts par SAMA LOYER avec statut de popularité et coordonnées pour cartographie.
* **Accès :** 🌐 Public (mise en cache HTTP `Cache-Control: public, max-age=3600`).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      { "id": "ouakam", "name": "Ouakam", "popular": true, "count": 28, "nearby": ["ngor", "mermoz"] },
      { "id": "ngor", "name": "Ngor", "popular": true, "count": 14, "nearby": ["almadies", "ouakam"] }
    ]
  }
  ```

---

### 3.2 `GET /api/v1/amenities`
* **Rôle :** Liste des équipements normalisés traduits selon l'en-tête `Accept-Language`.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      { "id": "private_toilet", "label": "Toilettes privées", "icon": "toilet" },
      { "id": "woyofal_meter", "label": "Compteur Woyofal dédié", "icon": "bolt" },
      { "id": "running_water", "label": "Eau courante permanente", "icon": "droplet" }
    ]
  }
  ```

---

### 3.3 `GET /api/v1/logements`
* **Rôle :** Moteur de recherche multicritère des logements disponibles.
* **Query Params :**
  - `zone` (string) : code du quartier (ex. `ouakam`).
  - `q` (string) : terme libre dans le titre ou description.
  - `type` (string) : `chambre` | `chambre_salon` | `studio` | `appartement` | `villa`.
  - `minPrice` (int) / `maxPrice` (int) : budget mensuel en FCFA.
  - `verifiedOnly` (boolean) : uniquement les annonces inspectées.
  - `sort` (enum) : `relevance` (défaut) | `price_asc` | `price_desc` | `recent`.
  - `page` (int, défaut 1), `pageSize` (int, défaut 20, max 50).
* **Validations :**
  - `minPrice <= maxPrice` si les deux sont fournis, sinon `400 VALIDATION_ERROR`.
* **Règles backend :**
  - Ne renvoie QUE les annonces au statut `online` dont la disponibilité a été confirmée depuis moins de 30 jours.
  - Si le nombre de résultats < 3, renseigne `meta.suggestedZones` avec les quartiers voisins.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
        "title": "Avec toilettes privées",
        "type": "chambre_salon",
        "typeLabel": "Chambre salon",
        "place": "Ouakam, Cité Avion",
        "zone": "ouakam",
        "price": 60000,
        "caution": 60000,
        "avance": 60000,
        "frais": 0,
        "cover": "https://cdn.samaloyer.sn/photos/l-8f1c/cover.jpg",
        "images": ["https://cdn.samaloyer.sn/photos/l-8f1c/cover.jpg"],
        "verified": true,
        "verificationLevel": "identity_and_visit_verified",
        "status": "online",
        "isBoosted": true,
        "isFavorite": false,
        "rooms": 2
      }
    ],
    "meta": { "page": 1, "pageSize": 20, "total": 1, "hasMore": false, "suggestedZones": ["ngor"] }
  }
  ```

---

### 3.4 `GET /api/v1/logements/{id}`
* **Rôle :** Fiche détaillée d'un logement spécifique pour l'écran de détail locataire.
* **Règles de sécurité :**
  - L'adresse exacte (`addressDetail`) et le téléphone du bailleur sont **masqués** (`null` ou masqué `+221 77 ••• •• 12`) tant que le locataire n'a pas une visite acceptée ou un contrat en cours.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
      "title": "Avec toilettes privées",
      "type": "chambre_salon",
      "typeLabel": "Chambre salon",
      "place": "Ouakam, Cité Avion",
      "zone": "ouakam",
      "addressExact": null,
      "price": 60000,
      "caution": 60000,
      "avance": 60000,
      "frais": 0,
      "cautionMonths": 1,
      "description": "Jolie chambre salon carrelée, très lumineuse et sécurisée...",
      "amenities": [
        { "id": "private_toilet", "label": "Toilettes privées" },
        { "id": "woyofal_meter", "label": "Compteur Woyofal dédié" }
      ],
      "slides": [
        { "url": "https://cdn.samaloyer.sn/l/0.jpg", "label": "Salon spacieux" },
        { "url": "https://cdn.samaloyer.sn/l/1.jpg", "label": "Chambre climatisée" }
      ],
      "video": {
        "src": "https://cdn.samaloyer.sn/l/tour.mp4",
        "poster": "https://cdn.samaloyer.sn/l/tour_poster.jpg",
        "durationSec": 26
      },
      "bailleur": {
        "id": "u-b9876543-210f",
        "name": "Moussa Sow",
        "verified": true,
        "phoneMasked": "+221 77 ••• •• 34",
        "memberSinceYear": 2024
      },
      "rentWithoutVisitEnabled": true,
      "remoteVisitEnabled": true,
      "availableFrom": "2026-11-01"
    }
  }
  ```

---

### 3.5 `GET /api/v1/logements/{id}/visit-slots`
* **Rôle :** Calcul dynamique des créneaux de visite ouverts pour les 16 prochains jours, en croisant les horaires configurés par le bailleur et les visites déjà validées.
* **Query Params :** `from=YYYY-MM-DD` (obligatoire), `days=16` (défaut 16, max 30).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "remoteVisitEnabled": true,
      "days": [
        {
          "date": "2026-10-25",
          "dayName": "Dimanche",
          "slots": ["10:00", "11:30", "15:00", "16:30"]
        },
        {
          "date": "2026-10-26",
          "dayName": "Lundi",
          "slots": []
        }
      ]
    }
  }
  ```

---

### 3.6 `POST /api/v1/search/assistant` & `POST /api/v1/search/voice`
* **Rôle :** Moteur d'IA générative et recherche sémantique / vocale. Analyse la demande en langage naturel (français ou wolof), extrait les critères clés et renvoie les 3 meilleures annonces correspondantes avec l'explication du choix.
* **Entrée (Assistant texte) :**
  ```json
  {
    "prompt": "Je cherche une chambre salon à Ouakam pour moins de 60000 FCFA avec toilettes intérieures"
  }
  ```
* **Entrée (Voice) :** `multipart/form-data` avec le champ `file` (audio `.silk`, `.wav` ou `.mp3` capturé par le microphone mini-programme).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "transcription": "Chambre salon à Ouakam budget 60000",
      "detectedCriteria": {
        "zone": "ouakam",
        "maxBudget": 60000,
        "type": "chambre_salon"
      },
      "recommendations": [
        {
          "logement": { "id": "8f1c...", "title": "Avec toilettes privées", "price": 60000 },
          "matchReason": "Correspond exactement à votre quartier ciblé et respecte votre budget à 100%."
        }
      ]
    }
  }
  ```

---

## 4. Favoris Locataire (`/me/favoris`)

### 4.1 `GET /api/v1/me/favoris`
* **Rôle :** Liste paginée de tous les logements sauvegardés par le locataire connecté.
* **Sortie (`200 OK`) :** Tableau d'objets `logement` avec `isFavorite: true`.

---

### 4.2 `PUT /api/v1/me/favoris/{logementId}`
* **Rôle :** Ajout idempotent d'un logement aux favoris.
* **Tables impactées :** `favorites` (`user_id`, `logement_id`, `created_at`).
* **Validations :**
  - `logementId` : UUID valide existant dans `logements`.
  - Si le favori existe déjà : retourne `200 OK` sans doublon (idempotent).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "logementId": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
      "saved": true,
      "totalFavorites": 5
    }
  }
  ```

---

### 4.3 `DELETE /api/v1/me/favoris/{logementId}`
* **Rôle :** Retrait d'un logement des favoris.
* **Sortie (`200 OK`) :** `{ "success": true, "data": { "removed": true, "totalFavorites": 4 } }`.

---

## 5. Visites de Logements (`/visites`)

### 5.1 `GET /api/v1/visites`
* **Rôle :** Liste des rendez-vous et demandes de visite du locataire connecté.
* **Query Params :** `status=pending|accepted|rejected|cancelled|done` (optionnel).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "v-7a8b9c0d-1234",
        "logementId": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
        "homeTitle": "Avec toilettes privées",
        "homePlace": "Ouakam, Cité Avion",
        "homeCover": "https://cdn.samaloyer.sn/photos/l-8f1c/cover.jpg",
        "scheduledAt": "2026-10-28T16:00:00Z",
        "date": "2026-10-28",
        "time": "16:00",
        "isRemote": false,
        "status": "accepted",
        "statusLabel": "Visite acceptée",
        "bailleurName": "Moussa Sow",
        "bailleurPhone": "+221771234567",
        "exactAddress": "Rue OK-12, Villa 45 en face pharmacie",
        "createdAt": "2026-10-24T14:30:00Z"
      }
    ]
  }
  ```

---

### 5.2 `POST /api/v1/visites`
* **Rôle :** Demande formelle de visite sur un créneau précis.
* **Headers :** `Idempotency-Key: <UUID>` obligatoire.
* **Tables impactées :** `visites`, `conversations`, `messages`, `audit_logs`.
* **Entrée :**
  ```json
  {
    "logementId": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
    "scheduledAt": "2026-10-28T16:00:00Z",
    "isRemote": false,
    "message": "Bonjour, je serai accompagné de ma soeur."
  }
  ```
* **Validations strictes :**
  - `logementId` : UUID existant et statut `online`.
  - `scheduledAt` : date future (minimum +2 heures par rapport à l'heure courante).
  - Le créneau doit figurer dans les `visit-slots` ouverts du bailleur.
  - **Règle anti-doublon :** si le locataire a déjà une visite `pending` ou `accepted` pour ce même logement : `409 VISIT_ALREADY_OPEN`.
  - Si le créneau vient d'être pris par un autre locataire : `409 SLOT_UNAVAILABLE`.
* **Sortie (`201 Created`) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "v-7a8b9c0d-1234",
      "status": "pending",
      "scheduledAt": "2026-10-28T16:00:00Z",
      "conversationId": "conv-5566-7788"
    }
  }
  ```
* **Effets de bord :** Émet un message système d'événement dans la conversation entre le locataire et le bailleur et envoie un SMS de notification au bailleur.

---

### 5.3 `POST /api/v1/visites/{id}/cancel`
* **Rôle :** Annulation d'une visite par le locataire.
* **Validations :**
  - La visite doit appartenir au locataire connecté.
  - Statut actuel impérativement `pending` ou `accepted`, sinon `409 INVALID_STATE`.
* **Sortie (`200 OK`) :** `{ "success": true, "data": { "id": "v-...", "status": "cancelled" } }`.

---

## 6. Messagerie & Conversations (`/conversations`, `/me/unread-counts`)

### 6.1 `GET /api/v1/conversations`
* **Rôle :** Liste des discussions de l'utilisateur avec dernier message et compteur de non-lus.
* **Query Params :** `as=locataire | bailleur` (défaut `locataire`).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "conv-5566-7788",
        "logementId": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
        "otherParty": {
          "id": "u-b9876543-210f",
          "name": "Moussa Sow",
          "role": "bailleur",
          "phone": "+221774501234"
        },
        "lastMessage": {
          "text": "Bonjour, votre visite est validée pour mercredi 16h.",
          "senderId": "u-b9876543-210f",
          "createdAt": "2026-10-24T15:20:00Z"
        },
        "unreadCount": 1,
        "updatedAt": "2026-10-24T15:20:00Z"
      }
    ]
  }
  ```

---

### 6.2 `GET /api/v1/conversations/{id}/messages`
* **Rôle :** Historique des échanges d'une conversation.
* **Pagination :** Par curseur temporel `?before=<messageId>&limit=30`.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "msg-001",
        "senderId": "u-a1b2c3d4-e5f6-7890",
        "type": "text",
        "text": "Salam aleikoum, le logement est-il toujours libre ?",
        "mediaUrl": null,
        "createdAt": "2026-10-24T14:00:00Z",
        "read": true
      }
    ],
    "meta": { "nextCursor": "msg-001", "hasMore": false }
  }
  ```

---

### 6.3 `POST /api/v1/conversations/{id}/messages`
* **Rôle :** Envoi d'un nouveau message texte ou vocal.
* **Entrée :**
  ```json
  {
    "text": "Parfait, je viendrai avec ma caution.",
    "type": "text",
    "audioUrl": null
  }
  ```
* **Validations :**
  - Au moins `text` ou `audioUrl` doit être renseigné.
  - `text` : max 2000 caractères, nettoyé contre les injections XSS.
* **Sortie (`201 Created`) :** Objet `message` créé.

---

### 6.4 `POST /api/v1/conversations/{id}/read`
* **Rôle :** Marquer tous les messages reçus de la conversation comme lus.
* **Sortie (`200 OK`) :** `{ "success": true, "data": { "unreadCount": 0 } }`.

---

### 6.5 `GET /api/v1/me/unread-counts`
* **Rôle :** Calcul ultra-rapide des badges de notification pour la TabBar.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "locataire": 2,
      "bailleur": 0,
      "total": 2
    }
  }
  ```

---

## 7. Location, Contrats & Entrée (`/logements/{id}/locations`, `/contrats`)

### 7.1 `POST /api/v1/logements/{id}/locations`
* **Rôle :** Initie le processus d'entrée dans le logement (avec ou sans visite préalable). Génère un contrat au statut `pending_signature` et calcule l'échéance d'entrée.
* **Tables impactées :** `contrats`, `echeances`, `logements`.
* **Entrée :**
  ```json
  {
    "startDate": "2026-11-01",
    "durationMonths": 12,
    "viaVisitId": "v-7a8b9c0d-1234"
  }
  ```
  *Note : Si `viaVisitId` est omis ou null, il s'agit du parcours "Louer sans visite" (garantie SAMA LOYER 48h).*
* **Validations :**
  - Le logement doit être au statut `online`.
  - `startDate` : date valide >= aujourd'hui.
  - `durationMonths` : entier entre 1 et 36 mois.
* **Sortie (`201 Created`) :**
  ```json
  {
    "success": true,
    "data": {
      "contrat": {
        "id": "c-9988-7766",
        "numero": "SL-2026-10-0412",
        "status": "pending_signature",
        "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      },
      "entry": {
        "echeanceId": "e-1122-3344",
        "avance": 60000,
        "caution": 60000,
        "frais": 0,
        "total": 120000,
        "minFirstPayment": 60000,
        "dueDate": "2026-10-31"
      }
    }
  }
  ```

---

### 7.2 `GET /api/v1/contrats/{id}`
* **Rôle :** Récupération de l'intégralité des clauses légales d'un contrat de bail certifié.
* **Sortie (`200 OK`) :** Contient les informations des parties (Bailleur / Locataire), la description du bien, les montants (loyer, caution), les clauses juridiques sénégalaises (loi sur le loyer) et le `contentHash` pour signature.

---

### 7.3 `POST /api/v1/contrats/{id}/sign`
* **Rôle :** Signature électronique certifiée par le locataire.
* **Headers :** `Idempotency-Key: <UUID>` obligatoire.
* **Entrée :**
  ```json
  {
    "acceptTerms": true,
    "signatureName": "Awa Diop",
    "contentHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
  ```
* **Validations strictes :**
  - `acceptTerms` doit être impérativement `true`, sinon `422 CONTRACT_TERMS_NOT_ACCEPTED`.
  - `signatureName` obligatoire, non vide.
  - `contentHash` doit être rigoureusement identique au hash généré à la consultation : `409 INVALID_STATE` si le contrat a été modifié entre-temps.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "c-9988-7766",
      "status": "signed_by_tenant",
      "signedAt": "2026-10-24T16:45:00Z"
    }
  }
  ```

---

### 7.4 `POST /api/v1/contrats/{id}/incidents`
* **Rôle :** Déclaration d'un problème ou litige (ex: fuite d'eau, serrures, non-conformité dans les 48h d'entrée).
* **Entrée :**
  ```json
  {
    "category": "plumbing",
    "description": "Robinet cassé dans la salle de bain dès mon arrivée.",
    "photoUrls": ["https://cos.samaloyer.sn/incidents/inc-1.jpg"]
  }
  ```
* **Sortie (`201 Created`) :** `{ "success": true, "data": { "incidentId": "inc-99", "status": "reported" } }`.

---

## 8. Échéances, Paiements & Quittances (`/loyers`, `/payments`, `/quittances`)

### 8.1 `GET /api/v1/loyers`
* **Rôle :** Tableau de bord des loyers et échéances du locataire connecté.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "e-1122-3344",
        "kind": "rent",
        "contratId": "c-9988-7766",
        "homeId": "8f1c3d2e-4b5a-6789-0123-abcdef456789",
        "homeName": "Chambre salon carrelée",
        "homeAddress": "Ouakam, Cité Avion",
        "owner": "Moussa Sow",
        "ownerPhone": "+221771234567",
        "month": "2026-11",
        "dueDate": "2026-11-05",
        "amount": 60000,
        "paidAmount": 30000,
        "remainingAmount": 30000,
        "status": "partial",
        "tranches": [
          { "id": "tr-1", "amount": 30000, "paidAt": "2026-10-20T10:00:00Z", "method": "maxit" }
        ],
        "receiptNumber": "REC-2026-11-0012"
      }
    ]
  }
  ```

---

### 8.2 `POST /api/v1/loyers/{id}/pay`
* **Rôle :** Initiation d'un paiement sécurisé via Orange Money / Max it. Permet le paiement intégral ou par tranches.
* **Headers :** `Idempotency-Key: <UUID>` obligatoire.
* **Entrée :**
  ```json
  {
    "amount": 30000,
    "method": "maxit"
  }
  ```
* **Validations strictes :**
  - `amount > 0` et entier en FCFA.
  - Pour une échéance d'entrée : le 1er paiement doit couvrir au minimum l'avance (`AMOUNT_BELOW_MINIMUM`).
  - Le montant ne peut excéder le reliquat restant sur l'échéance (`AMOUNT_ABOVE_REMAINING`).
* **Sortie (`202 Accepted`) :**
  ```json
  {
    "success": true,
    "data": {
      "payment": {
        "id": "p-4433-2211",
        "reference": "TX-2026-10-9988",
        "status": "pending",
        "amount": 30000,
        "expiresAt": "2026-10-24T18:00:00Z"
      },
      "checkout": {
        "provider": "maxit",
        "payToken": "MP-8877-6655",
        "deeplink": "maxit://pay?token=MP-8877-6655"
      }
    }
  }
  ```

---

### 8.3 `GET /api/v1/payments/{id}`
* **Rôle :** Interrogation de l'état d'un paiement (utilisé par le mini-programme en polling après le passage dans l'écran de confirmation Orange Money).
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "id": "p-4433-2211",
      "reference": "TX-2026-10-9988",
      "status": "succeeded",
      "amount": 30000,
      "completedAt": "2026-10-24T17:15:32Z",
      "echeance": {
        "id": "e-1122-3344",
        "status": "paid",
        "amountPaid": 60000
      },
      "quittance": {
        "id": "q-1122",
        "numero": "QUIT-2026-11-0089",
        "pdfUrl": "https://cdn.samaloyer.sn/quittances/q-1122.pdf"
      }
    }
  }
  ```

---

### 8.4 `GET /api/v1/quittances/verify/{verifyCode}`
* **Rôle :** Endpoint public de vérification d'authenticité d'une quittance (flash d'un QR Code ou partage par lien).
* **Accès :** 🌐 Public.
* **Sortie (`200 OK`) :** Affiche le statut officiel certifié par SAMA LOYER et Orange Max it.

---

## 9. Espace Bailleur — Compte & Abonnement (`/bailleur/compte`, `/bailleur/abonnement`)

### 9.1 `GET /api/v1/bailleur/compte`
* **Rôle :** État d'activation du bailleur, type de formule (Essai gratuit 1 mois / Abonnement Pro), dates de validité et boosts actifs.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "status": "active",
      "plan": "trial",
      "trialRemainingDays": 21,
      "expiresAt": "2026-11-14T23:59:59Z",
      "canPublish": true,
      "maxActiveListings": 10
    }
  }
  ```

---

### 9.2 `POST /api/v1/bailleur/compte/activation`
* **Rôle :** Activation de l'essai gratuit ou souscription directe à l'abonnement Pro.
* **Entrée :** `{ "plan": "trial" }` ou `{ "plan": "pro" }`.
* **Règles métier :**
  - Si `trial` : vérifie qu'aucun compte associé au même numéro Orange n'a déjà bénéficié de l'essai (`409 TRIAL_ALREADY_USED`). L'activation est immédiate (`201 Created`).
  - Si `pro` : initie un paiement Max it (`202 Accepted`).

---

## 10. Espace Bailleur — Annonces & Horaires (`/bailleur/annonces`)

### 10.1 `GET /api/v1/bailleur/annonces`
* **Rôle :** Liste de l'ensemble des annonces du bailleur connecté (en ligne, en validation, refusées ou archivées).

---

### 10.2 `POST /api/v1/bailleur/annonces`
* **Rôle :** Création et soumission d'une nouvelle annonce de logement.
* **Headers :** `Idempotency-Key: <UUID>` obligatoire.
* **Entrée :**
  ```json
  {
    "title": "Chambre salon carrelée Ouakam",
    "type": "chambre_salon",
    "zone": "ouakam",
    "addressDetail": "Cité Avion, près de la brioche dorée",
    "price": 60000,
    "caution": 60000,
    "avance": 60000,
    "frais": 0,
    "cautionMonths": 1,
    "description": "Chambre spacieuse, propre et accessible.",
    "amenities": ["private_toilet", "woyofal_meter"],
    "photos": [
      "https://cos.samaloyer.sn/photos/p1.jpg",
      "https://cos.samaloyer.sn/photos/p2.jpg"
    ],
    "video": {
      "url": "https://cos.samaloyer.sn/videos/v1.mp4",
      "posterUrl": "https://cos.samaloyer.sn/videos/p1.jpg"
    },
    "availableFrom": "2026-11-01"
  }
  ```
* **Validations strictes :**
  - `title` : 10 à 100 caractères.
  - `price` : 15 000 à 5 000 000 XOF.
  - `caution` <= 2 mois de loyer (conformité Code des obligations civiles et commerciales sénégalais).
  - `photos` : minimum 2 photos, maximum 10 photos.
  - Détection automatique de numéros de téléphone ou coordonnées externes dans `description` (drapeau de modération).
* **Sortie (`201 Created`) :** Annonce créée au statut `validation`.

---

### 10.3 `PUT /api/v1/bailleur/annonces/{id}/horaires`
* **Rôle :** Configuration des créneaux hebdomadaires récurrents de visite.
* **Entrée :**
  ```json
  {
    "remoteVisitEnabled": true,
    "weeklySchedule": {
      "monday": ["16:00", "17:00"],
      "saturday": ["10:00", "11:00", "15:00"]
    },
    "closedDates": ["2026-11-01"]
  }
  ```
* **Sortie (`200 OK`) :** Horaires enregistrés.

---

## 11. Espace Bailleur — Visites & Locataires (`/bailleur/visites`, `/bailleur/locataires`, `/bailleur/echeances`)

### 11.1 `POST /api/v1/bailleur/visites/{id}/accept`
* **Rôle :** Validation d'une demande de visite.
* **Effets :**
  - Statut de la visite -> `accepted`.
  - L'adresse exacte devient accessible au locataire.
  - Envoi automatique d'une confirmation par SMS et message in-app au locataire.
* **Sortie (`200 OK`) :** Visite mise à jour.

---

### 11.2 `POST /api/v1/bailleur/visites/{id}/reject`
* **Rôle :** Refus motivé d'une demande de visite.
* **Entrée :** `{ "reason": "Le créneau n'est plus disponible." }`.
* **Sortie (`200 OK`) :** Visite passée à `rejected`.

---

### 11.3 `POST /api/v1/bailleur/echeances/{id}/cash-payments`
* **Rôle :** Déclaration par le bailleur d'un paiement de loyer perçu manuellement en espèces (cash).
* **Entrée :**
  ```json
  {
    "amount": 60000,
    "paidOn": "2026-10-24"
  }
  ```
* **Validations :**
  - L'échéance doit concerner un logement appartenant au bailleur connecté.
  - `amount` <= montant restant dû.
* **Effets :** Émet une quittance de paiement certifiée au locataire avec mention *"Paiement espèces certifié par le bailleur"*.

---

## 12. Services Transverses & Webhooks (`/uploads`, `/reports`, `/webhooks/maxit`, `/health`)

### 12.1 `POST /api/v1/uploads`
* **Rôle :** Fournit une URL pré-signée pour téléverser un fichier directement vers le stockage objet (Tencent COS / S3) sans saturer la bande passante du serveur d'API.
* **Entrée :**
  ```json
  {
    "kind": "logement_photo",
    "contentType": "image/jpeg",
    "size": 1542000
  }
  ```
* **Validations :**
  - `kind` : `logement_photo` (max 5 Mo), `logement_video` (max 50 Mo), `id_document` (max 10 Mo).
  - `contentType` : vérification stricte du type MIME.
* **Sortie (`200 OK`) :**
  ```json
  {
    "success": true,
    "data": {
      "uploadUrl": "https://cos.samaloyer.sn/upload/tmp_xyz?sign=...",
      "fileUrl": "https://cdn.samaloyer.sn/photos/l-8f1c/img_01.jpg",
      "headers": { "Content-Type": "image/jpeg" },
      "expiresAt": "2026-10-24T18:30:00Z"
    }
  }
  ```

---

### 12.2 `POST /api/v1/webhooks/maxit`
* **Rôle :** Réception des notifications serveur-à-serveur émises par Orange Money lors du dénouement des transactions.
* **Sécurité & Règles critiques :**
  1. Vérification de l'IP appelante (liste blanche des sous-réseaux IP Orange).
  2. Vérification de l'en-tête `X-Orange-Signature` : calcul HMAC-SHA256 du body brut avec `MAXIT_WEBHOOK_SECRET`.
  3. Rejet immédiat si l'horodatage a plus de 5 minutes d'écart.
  4. **Idempotence stricte :** Si la transaction `providerReference` a déjà été traitée, retourne `200 OK` sans re-créditer.
* **Entrée :**
  ```json
  {
    "event": "payment.succeeded",
    "payToken": "MP-8877-6655",
    "providerReference": "OM_SN_20261024_987654",
    "amount": 30000,
    "currency": "XOF",
    "timestamp": "2026-10-24T17:15:30Z"
  }
  ```
* **Sortie (`200 OK`) :** `{ "received": true }`.

---

### 12.3 `GET /api/v1/health`
* **Rôle :** Healthcheck pour orchestrateur (Kubernetes / Docker) et supervision.
* **Sortie (`200 OK`) :**
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-10-24T17:50:00Z",
    "database": "connected",
    "redis": "connected",
    "version": "1.0.0"
  }
  ```

---

## 13. Back-Office d'Administration (`/admin`)

*Authentification isolée par email/mot de passe fort + 2FA TOTP obligatoire (`/admin/auth/login` et `/admin/auth/2fa`).*

* `GET /api/v1/admin/dashboard` : Métriques globales (GMV, volume de loyers, annonces actives, alertes).
* `POST /api/v1/admin/annonces/{id}/approve` : Validation et mise en ligne d'une annonce.
* `POST /api/v1/admin/annonces/{id}/reject` : Refus avec motif communiqué au bailleur.
* `POST /api/v1/admin/bailleurs/{id}/verify` : Validation de la pièce d'identité (badge KYC Vérifié).
* `POST /api/v1/admin/transactions/{id}/refund` : Déclenchement d'un remboursement via Orange Money.
* `GET /api/v1/admin/audit-logs` : Traçabilité immuable de chaque action opérateur.
