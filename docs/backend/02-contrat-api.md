# 02 — Contrat d'API REST SAMA LOYER (v1)

> Spécification complète et typée : [openapi.yaml](openapi.yaml) (OpenAPI 3.1, importable dans Swagger UI, Postman, Insomnia ou un générateur de serveur).
> Ce document fixe les **conventions** et décrit les **flux** de bout en bout. En cas de doute, l'OpenAPI fait foi pour les champs, ce document pour le comportement.

## 1. Conventions générales

| Sujet | Règle |
|---|---|
| Base URL | `https://api.samaloyer.sn/api/v1` (staging : `https://api-staging.samaloyer.sn/api/v1`) |
| Format | JSON UTF-8, `Content-Type: application/json` |
| Nommage | `camelCase` pour les champs, `kebab-case` pour les chemins, `snake_case` majuscule pour les codes d'erreur |
| Identifiants | chaînes opaques (UUID). Le front ne doit jamais les interpréter |
| Montants | entiers en francs CFA (XOF) : `80000`, jamais `"80 000 F"` ni `80000.0` |
| Dates | ISO 8601 UTC pour un instant (`2026-10-24T16:00:00Z`), `YYYY-MM-DD` pour un jour, `YYYY-MM` pour un mois de loyer. Fuseau d'affichage : `Africa/Dakar` (UTC+0) |
| Langue | en-tête `Accept-Language: fr` ou `wo`. Seuls les libellés de référentiel (équipements, motifs) sont traduits par l'API ; les textes d'interface restent dans `utils/i18n` |
| Traçabilité | le front envoie déjà `X-Client-Ref` (session) et `X-Request-Id` (requête). L'API renvoie `X-Request-Id` et le journalise |
| Idempotence | `Idempotency-Key: <uuid>` **obligatoire** sur toute création de paiement, de contrat et de visite. Même clé = même réponse, sans double débit |
| Versionnement | changement cassant ⇒ `/api/v2`. Ajout d'un champ ou d'un endpoint = non cassant ; le front doit ignorer les champs inconnus |

### 1.1 Enveloppe de réponse

Toutes les réponses ont la même forme, déjà attendue par `extractApiResponse` dans [utils/apis/index.js](../../utils/apis/index.js).

Succès :
```json
{
  "success": true,
  "data": { "id": "…" },
  "meta": { "page": 1, "pageSize": 20, "total": 134, "hasMore": true }
}
```
`meta` n'est présent que sur les listes paginées.

Erreur :
```json
{
  "success": false,
  "code": "AMOUNT_BELOW_MINIMUM",
  "message": "Le premier paiement doit couvrir au moins l'avance (65 000 F).",
  "details": { "field": "amount", "min": 65000 },
  "requestId": "APP-a1b2c3d4-7"
}
```
`code` et `message` sont au premier niveau : c'est ce que lit `normalizeApiError` dans [utils/errors/index.js](../../utils/errors/index.js). `message` est rédigé pour être affiché tel quel, dans la langue de `Accept-Language`.

### 1.2 Codes HTTP et codes d'erreur

| HTTP | `code` | Quand |
|---|---|---|
| 400 | `VALIDATION_ERROR` | champ manquant ou mal formé (`details.fields` liste les champs) |
| 401 | `UNAUTHENTICATED` / `TOKEN_EXPIRED` | jeton absent, invalide ou expiré (le front rafraîchit puis rejoue) |
| 403 | `FORBIDDEN` | la ressource appartient à un autre utilisateur |
| 403 | `SUBSCRIPTION_REQUIRED` | espace bailleur sans essai ni abonnement en cours |
| 403 | `BAILLEUR_SUSPENDED` | compte bailleur suspendu |
| 404 | `NOT_FOUND` | ressource inexistante ou non visible |
| 409 | `SLOT_UNAVAILABLE` | créneau de visite pris entre-temps |
| 409 | `VISIT_ALREADY_OPEN` | une demande de visite est déjà en cours pour ce logement |
| 409 | `LOGEMENT_UNAVAILABLE` | logement réservé ou loué par quelqu'un d'autre |
| 409 | `TRIAL_ALREADY_USED` | essai gratuit déjà consommé |
| 409 | `IDEMPOTENCY_CONFLICT` | même `Idempotency-Key` avec un corps différent |
| 409 | `INVALID_STATE` | transition interdite (accepter une visite annulée, signer un contrat actif…) |
| 422 | `AMOUNT_BELOW_MINIMUM` / `AMOUNT_ABOVE_REMAINING` | montant de tranche non valide |
| 422 | `CONTRACT_TERMS_NOT_ACCEPTED` | `acceptTerms` absent ou `false` |
| 429 | `RATE_LIMITED` | trop de requêtes (`Retry-After` en secondes) |
| 502 | `PAYMENT_PROVIDER_ERROR` | Max it / Orange Money indisponible |
| 500 | `INTERNAL_ERROR` | erreur inattendue (avec `requestId`) |

### 1.3 Pagination, tri, filtres

- Listes : `?page=1&pageSize=20` (max 50). Réponse avec `meta`.
- Messages d'une conversation : pagination par curseur `?before=<messageId>&limit=30`, `meta.nextCursor`.
- Tri : `?sort=price_asc|price_desc|recent|relevance`.

### 1.4 Limites de débit

| Portée | Limite |
|---|---|
| Lecture authentifiée | 120 req/min par utilisateur |
| Écriture | 30 req/min par utilisateur |
| Paiement | 5 initiations/min par utilisateur |
| Recherche IA / vocale | 10 req/min par utilisateur |

## 2. Authentification (Max it)

Le mini-programme tourne dans Max it : l'utilisateur est **déjà identifié**. Pas de mot de passe, pas d'OTP.

```
Mini-app                        API SAMA LOYER                    Max it (Orange)
   │  wx.login()        ───────────────────────────────────────▶ │
   │ ◀──────────────────────────────────────── authCode (5 min) │
   │  POST /auth/maxit {authCode} ─▶ │                            │
   │                                 │ ── échange authCode ─────▶ │
   │                                 │ ◀── maxitUserId, phone, nom│
   │                                 │ upsert users               │
   │ ◀── accessToken (JWT 1 h) + refreshToken (30 j) + user ─────│
   │  Authorization: Bearer <accessToken> sur chaque appel        │
```

| Méthode | Chemin | Rôle |
|---|---|---|
| POST | `/auth/maxit` | échange le code Max it contre une session |
| POST | `/auth/refresh` | nouveau couple de jetons (rotation : l'ancien refresh est révoqué) |
| POST | `/auth/logout` | révoque le refresh token |
| GET | `/me` | profil + rôles + état du compte bailleur |
| PATCH | `/me` | `city`, `locale`, `avatarUrl` (nom et numéro viennent de Max it) |

Le nom exact de l'API d'autorisation et de l'endpoint d'échange côté Max it est à confirmer dans la documentation partenaire Orange ; le contrat SAMA LOYER (`POST /auth/maxit { authCode }`) ne change pas.

Contenu du JWT : `sub` (userId), `roles` (`["locataire"]` ou `["locataire","bailleur"]`), `exp`. Signature RS256, clé publique sur `/.well-known/jwks.json`.

> ⚠️ Le flux actuel `client_credentials` avec `CLIENT_SECRET` dans [utils/config.js](../../utils/config.js) ne doit pas partir en production : un secret embarqué dans un mini-programme est lisible par tous. Il est remplacé par `POST /auth/maxit`.

## 3. Catalogue des endpoints

Légende accès : 🌐 public · 👤 utilisateur connecté · 🏠 bailleur avec abonnement actif · 🛡️ admin back office.

### 3.1 Logements & recherche
| | Méthode | Chemin | Description |
|---|---|---|---|
| 🌐 | GET | `/zones` | quartiers actifs + voisins |
| 🌐 | GET | `/amenities` | équipements (libellés fr/wo) |
| 🌐 | GET | `/logements` | recherche : `zone`, `q`, `type`, `minPrice`, `maxPrice`, `verifiedOnly`, `sort`, `page` |
| 🌐 | GET | `/logements/{id}` | fiche détaillée (adresse précise et numéro seulement si autorisé) |
| 🌐 | GET | `/logements/{id}/visit-slots` | créneaux libres sur `?from=YYYY-MM-DD&days=16` |
| 👤 | POST | `/search/assistant` | recherche IA en langage naturel (texte) → 3-4 logements classés + raison |
| 👤 | POST | `/search/voice` | `multipart/form-data` audio (wolof/français) → transcription + même réponse |
| 👤 | GET | `/me/favoris` | logements favoris |
| 👤 | PUT | `/me/favoris/{logementId}` | ajouter (idempotent) |
| 👤 | DELETE | `/me/favoris/{logementId}` | retirer |

### 3.2 Visites (côté locataire)
| | Méthode | Chemin | Description |
|---|---|---|---|
| 👤 | GET | `/visites` | mes demandes (`?status=`) |
| 👤 | POST | `/visites` | demander un créneau `{ logementId, scheduledAt, message?, isRemote? }` |
| 👤 | POST | `/visites/{id}/cancel` | annuler |

### 3.3 Messagerie
| | Méthode | Chemin | Description |
|---|---|---|---|
| 👤 | GET | `/conversations?as=locataire\|bailleur` | liste avec dernier message et non-lus |
| 👤 | POST | `/conversations` | ouvrir (ou retrouver) la conversation d'un logement `{ logementId, text }` |
| 👤 | GET | `/conversations/{id}/messages` | historique paginé par curseur |
| 👤 | POST | `/conversations/{id}/messages` | envoyer `{ text }` ou `{ audioUrl }` |
| 👤 | POST | `/conversations/{id}/read` | marquer comme lu |
| 👤 | GET | `/me/unread-counts` | `{ locataire, bailleur }` pour les badges d'onglet |

Temps réel : le MVP interroge `/me/unread-counts` toutes les 30 s quand l'appli est au premier plan, et `/conversations/{id}/messages?after=<id>` toutes les 5 s quand un chat est ouvert. Un WebSocket (`wss://api.samaloyer.sn/ws`) pourra remplacer ce polling sans changer les ressources.

### 3.4 Location : entrée, contrat, loyers, quittances
| | Méthode | Chemin | Description |
|---|---|---|---|
| 👤 | POST | `/logements/{id}/locations` | démarrer une location → contrat `pending_signature` + échéance d'entrée |
| 👤 | GET | `/contrats` | mes contrats (locataire) |
| 👤 | GET | `/contrats/{id}` | contrat complet (articles figés, parties, montants) |
| 👤 | POST | `/contrats/{id}/sign` | signature du locataire `{ acceptTerms: true, signatureName }` |
| 👤 | GET | `/contrats/{id}/pdf` | URL signée du PDF (15 min) |
| 👤 | POST | `/contrats/{id}/notice` | donner le préavis `{ departureDate, reason? }` |
| 👤 | POST | `/contrats/{id}/incidents` | signaler un problème `{ category, description, photoUrls[] }` |
| 👤 | GET | `/loyers` | mes échéances (entrée + loyers), toutes locations confondues |
| 👤 | GET | `/loyers/{id}` | une échéance avec ses tranches |
| 👤 | POST | `/loyers/{id}/pay` | payer tout ou une tranche avec Max it |
| 👤 | GET | `/payments/{id}` | état d'un paiement (polling après retour de Max it) |
| 👤 | GET | `/quittances?contratId=` | mes reçus et quittances |
| 👤 | GET | `/quittances/{id}` | quittance (données pour l'écran) |
| 👤 | GET | `/quittances/{id}/pdf` | URL signée du PDF |
| 🌐 | GET | `/quittances/verify/{verifyCode}` | vérification publique d'authenticité (lien « Partager le reçu ») |

### 3.5 Espace bailleur
| | Méthode | Chemin | Description |
|---|---|---|---|
| 👤 | GET | `/bailleur/compte` | état : non activé / essai / Pro / expiré, date de fin, boosts |
| 👤 | POST | `/bailleur/compte/activation` | `{ plan: "trial" }` (immédiat) ou `{ plan: "pro" }` (renvoie un paiement) |
| 👤 | POST | `/bailleur/abonnement/renouvellement` | paiement Pro +30 j (accessible même expiré) |
| 👤 | GET | `/bailleur/paiements` | historique abonnement + boosts |
| 🏠 | GET | `/bailleur/dashboard` | chiffres de l'accueil : loyers du mois, demandes en attente, vues |
| 🏠 | GET | `/bailleur/annonces` | mes annonces (tous statuts) |
| 🏠 | POST | `/bailleur/annonces` | publier (→ `validation`) |
| 🏠 | GET | `/bailleur/annonces/{id}` | une annonce avec drapeaux de modération et motif de refus |
| 🏠 | PATCH | `/bailleur/annonces/{id}` | modifier (repasse en `validation` si champ sensible) |
| 🏠 | POST | `/bailleur/annonces/{id}/confirm-availability` | « Toujours disponible » |
| 🏠 | POST | `/bailleur/annonces/{id}/hide` · `/unhide` | masquer / remettre en ligne |
| 🏠 | DELETE | `/bailleur/annonces/{id}` | supprimer (interdit si contrat vivant) |
| 🏠 | POST | `/bailleur/annonces/{id}/boosts` | `{ plan: "boost7" \| "boost30" }` → paiement |
| 🏠 | GET | `/bailleur/annonces/{id}/horaires` | semaine type + jours fermés + visite à distance |
| 🏠 | PUT | `/bailleur/annonces/{id}/horaires` | remplacer les horaires |
| 🏠 | GET | `/bailleur/visites` | demandes reçues (`?status=pending`) |
| 🏠 | POST | `/bailleur/visites/{id}/accept` | accepter `{ note? }` |
| 🏠 | POST | `/bailleur/visites/{id}/reject` | refuser `{ reason }` |
| 🏠 | GET | `/bailleur/locataires` | locataires en place avec statut du loyer du mois |
| 🏠 | POST | `/bailleur/echeances/{id}/cash-payments` | déclarer un paiement en espèces `{ amount, paidOn }` |
| 🏠 | POST | `/bailleur/contrats/{id}/notice` | préavis côté bailleur |
| 🏠 | POST | `/bailleur/contrats/{id}/deposit-refund` | restituer la caution `{ amount, deductions[] }` |
| 👤 | POST | `/bailleur/verification` | envoyer la pièce d'identité `{ idDocumentUrl }` |

### 3.6 Transverse
| | Méthode | Chemin | Description |
|---|---|---|---|
| 👤 | POST | `/uploads` | URL d'envoi pré-signée Tencent COS `{ kind, contentType, size }` |
| 👤 | POST | `/reports` | signaler une annonce ou un utilisateur |
| — | POST | `/webhooks/maxit` | retour du fournisseur de paiement (signature HMAC, réseau Orange uniquement) |
| 🌐 | GET | `/health` | supervision |

### 3.7 Back office (`/admin`, jeton distinct)
| Méthode | Chemin | Permission |
|---|---|---|
| POST | `/admin/auth/login` · `/admin/auth/2fa` | — |
| GET | `/admin/dashboard?range=w\|m\|y` | toutes |
| GET | `/admin/annonces/validation` · POST `/{id}/approve` · POST `/{id}/reject { reason }` | annonces |
| GET | `/admin/annonces?status=` · POST `/{id}/hide` | annonces |
| GET | `/admin/bailleurs` · POST `/{id}/verify` · `/{id}/reject-document` · `/{id}/suspend` · `/{id}/reinstate` | bailleurs |
| GET | `/admin/locations` · `/admin/locataires` | annonces |
| GET | `/admin/transactions` · POST `/{id}/refund` | transactions / refunds |
| GET | `/admin/premium` · POST `/admin/subscriptions/{id}/extend { days }` | transactions |
| GET | `/admin/reports` · POST `/{id}/resolve { action }` | reclamations |
| GET | `/admin/tickets` · PATCH `/{id}` | reclamations |
| GET/PUT | `/admin/settings/{prices\|rules\|features}` | settings |
| GET/POST/PATCH | `/admin/team` · `/admin/roles` | settings |
| GET | `/admin/audit-logs?module=&page=` | settings |

Chaque action d'écriture admin crée une ligne `audit_logs` (ce que fait `logAction` dans [back_office/src/lib/audit.ts](../../back_office/src/lib/audit.ts)).

## 4. Flux détaillés

### 4.1 Recherche et fiche logement

`GET /logements?zone=ouakam&maxPrice=60000&sort=relevance&page=1`

```json
{
  "success": true,
  "data": [
    {
      "id": "8f1c…",
      "title": "Avec toilettes privées",
      "type": "chambre_salon",
      "typeLabel": "Chambre salon",
      "place": "Ouakam, Cité Avion",
      "zone": "ouakam",
      "price": 60000,
      "caution": 60000,
      "avance": 60000,
      "frais": 0,
      "cover": "https://cdn.samaloyer.sn/l/8f1c/0.jpg",
      "images": ["https://cdn.samaloyer.sn/l/8f1c/0.jpg"],
      "verified": true,
      "verificationLevel": "identity_and_visit_verified",
      "availabilityConfirmedAt": "2026-10-22T09:00:00Z",
      "status": "online",
      "isBoosted": false,
      "isFavorite": true,
      "surface": null,
      "rooms": 2
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 7, "hasMore": false, "suggestedZones": ["ngor", "yoff"] }
}
```

`suggestedZones` n'est rempli que si la recherche renvoie moins de 3 résultats (quartiers voisins).

`GET /logements/{id}` ajoute : `description`, `amenities[] {id,label}`, `media[] {kind,url,posterUrl,label}`, `video`, `address` (null si non autorisé), `bailleur {id,name,phone (masqué),verified,memberSince}`, `remoteVisitEnabled`, `rentWithoutVisitEnabled`, `availableFrom`, `cautionMonths`.

### 4.2 Demande de visite

1. `GET /logements/{id}/visit-slots?from=2026-10-23&days=16`
   ```json
   { "success": true, "data": { "remoteVisitEnabled": true, "days": [
     { "date": "2026-10-24", "slots": ["10:00", "12:00", "16:00"] },
     { "date": "2026-10-27", "slots": [] }
   ] } }
   ```
2. `POST /visites` + `Idempotency-Key`
   ```json
   { "logementId": "8f1c…", "scheduledAt": "2026-10-24T16:00:00Z", "message": "Je viens avec un proche" }
   ```
   → `201` avec la visite `pending`. Effets : message `event` `visit_requested` dans la conversation (créée si besoin), notification au bailleur.
3. Le bailleur répond : `POST /bailleur/visites/{id}/accept` → `accepted`, l'adresse précise devient visible, SMS au locataire.

Erreurs : `409 SLOT_UNAVAILABLE`, `409 VISIT_ALREADY_OPEN`, `409 LOGEMENT_UNAVAILABLE`.

### 4.3 Entrée dans un logement (avec ou sans visite)

```
POST /logements/{id}/locations ─▶ contrat pending_signature + échéance d'entrée
GET  /contrats/{id}            ─▶ écran « Contrat » (étape 2)
POST /contrats/{id}/sign       ─▶ signature locataire
POST /loyers/{entryId}/pay     ─▶ paiement Max it (tout ou une tranche ≥ avance)
GET  /payments/{pid}           ─▶ polling jusqu'à succeeded / failed
```

`POST /logements/{id}/locations`
```json
{ "startDate": "2026-11-01", "durationMonths": 12, "viaVisitId": "v-…" }
```
`viaVisitId` absent = parcours « Louer sans visite » (fenêtre de 48 h pour signaler un problème).

Réponse `201` :
```json
{
  "success": true,
  "data": {
    "contrat": { "id": "c-…", "numero": "SL-2026-10-0412", "status": "pending_signature" },
    "entry": {
      "echeanceId": "e-…",
      "avance": 65000, "caution": 130000, "frais": 0,
      "total": 195000, "minFirstPayment": 65000,
      "dueDate": "2026-10-31"
    }
  }
}
```

`POST /contrats/{id}/sign`
```json
{ "acceptTerms": true, "signatureName": "Awa Diop", "contentHash": "3f9a…" }
```
`contentHash` doit égaler celui renvoyé par `GET /contrats/{id}` : on signe exactement le texte affiché. Sinon `409 INVALID_STATE` (le contrat a changé, le recharger).

Le contrat passe `active` quand **signature + premier paiement réussi** sont réunis, et le logement `reserved` → `rented` quand l'entrée est soldée.

### 4.4 Paiement Max it (entrée, loyer, abonnement, boost)

Tous les paiements suivent le même protocole.

```
Mini-app                    API                         Max it / Orange Money
  │ POST /loyers/{id}/pay ─▶│ crée payment(pending)      │
  │  Idempotency-Key        │ ── init paiement ─────────▶│
  │ ◀── 202 {payment, checkout}                          │
  │ ouvre Max it (checkout.payToken)  ──────────────────▶│ l'utilisateur confirme (code secret)
  │                         │ ◀── POST /webhooks/maxit ──│ (signé HMAC)
  │                         │ payment → succeeded        │
  │                         │ échéance += montant, quittance émise
  │ GET /payments/{pid} ───▶│                            │
  │ ◀── succeeded + quittance                            │
```

`POST /loyers/{id}/pay`
```json
{ "amount": 65000, "method": "maxit" }
```
Réponse `202` :
```json
{
  "success": true,
  "data": {
    "payment": { "id": "p-…", "reference": "TX-26-10-4821", "status": "pending", "amount": 65000, "expiresAt": "2026-10-24T10:29:00Z" },
    "checkout": { "provider": "maxit", "payToken": "MP-…", "deeplink": "maxit://pay?token=MP-…" }
  }
}
```

`GET /payments/{id}` une fois réussi :
```json
{
  "success": true,
  "data": {
    "id": "p-…", "reference": "TX-26-10-4821", "status": "succeeded", "amount": 65000,
    "purpose": "entry", "completedAt": "2026-10-24T10:16:02Z",
    "echeance": { "id": "e-…", "amountDue": 195000, "amountPaid": 65000, "status": "partial" },
    "quittance": { "id": "q-…", "numero": "REC-ENT-2026-004402", "isFinal": false }
  }
}
```

Règles :
- Le statut **n'est jamais** décidé par le front. Seul le webhook (ou une vérification serveur à serveur auprès de Max it) fait passer un paiement en `succeeded`.
- Polling conseillé : toutes les 2 s pendant 30 s, puis toutes les 5 s jusqu'à `expiresAt`.
- Le webhook est idempotent sur `provider_ref` ; il vérifie la signature HMAC et que le montant reçu égale le montant attendu.

### 4.5 Mon loyer

`GET /loyers`
```json
{
  "success": true,
  "data": [
    {
      "id": "e-…",
      "kind": "rent",
      "contratId": "c-…",
      "homeId": "8f1c…",
      "homeName": "Mon studio",
      "homeAddress": "Liberté 6, Dakar",
      "owner": "Mme Diagne",
      "ownerPhone": "+221774501234",
      "conversationId": "conv-…",
      "month": "2026-11",
      "dueDate": "2026-11-05",
      "amount": 80000,
      "paidAmount": 0,
      "status": "pending",
      "paidAt": null,
      "tranches": [],
      "receiptNumber": null,
      "pdfUrl": null
    }
  ]
}
```
Une tranche : `{ "paymentId", "amount", "method", "paidAt", "receiptNumber" }`.

### 4.6 Activation bailleur

`POST /bailleur/compte/activation { "plan": "trial" }` → `201` avec le compte `{ plan: "trial", status: "active", endsAt }`.
`{ "plan": "pro" }` → `202` avec `payment` + `checkout` (même protocole que 4.4) ; le compte devient actif au webhook.
Essai déjà utilisé : `409 TRIAL_ALREADY_USED`.

### 4.7 Publier une annonce

1. Pour chaque photo et la vidéo : `POST /uploads { kind: "logement_photo", contentType: "image/jpeg", size: 734003 }` → `{ uploadUrl, fileUrl, headers, expiresAt }`, puis `wx.uploadFile` / `PUT` direct vers COS.
2. `POST /bailleur/annonces`
   ```json
   {
     "title": "Chambre salon carrelée",
     "type": "chambre_salon",
     "zone": "ouakam",
     "addressDetail": "Tonghor, derrière la mosquée",
     "price": 65000, "caution": 65000, "avance": 65000, "frais": 0,
     "amenities": ["private_toilet", "woyofal_meter", "running_water"],
     "description": "Logement propre, proche du marché.",
     "photos": ["https://cos…/0.jpg", "https://cos…/1.jpg"],
     "video": { "url": "https://cos…/v.mp4", "posterUrl": "https://cos…/v.jpg" },
     "availableFrom": "2026-11-01"
   }
   ```
   → `201`, annonce `validation`, `moderationFlags[]` éventuels (ex. numéro détecté).

Limites d'envoi : photo ≤ 5 Mo (jpeg/png/webp), 10 photos max, vidéo ≤ 50 Mo et 60 s (mp4), audio ≤ 2 Mo et 60 s.

## 5. Sécurité

- HTTPS uniquement, HSTS. Domaine déclaré dans la liste blanche `request` du mini-programme.
- Contrôle d'accès **par ressource** : un locataire ne lit que ses visites, contrats, échéances, paiements ; un bailleur que ce qui concerne ses logements. Toute autre lecture renvoie `404` (pas `403`, pour ne pas révéler l'existence).
- Données masquées par défaut : numéro du bailleur, adresse précise (voir [01-modele-de-donnees.md](01-modele-de-donnees.md#sécurité-des-données)).
- Webhook Max it : signature HMAC-SHA256 sur le corps brut + horodatage (rejet au-delà de 5 min) + liste blanche d'IP.
- Back office : jeton séparé, 2FA TOTP obligatoire, permissions par rôle, journal d'audit sur chaque écriture.
- Journaux : jamais de jeton, de pièce d'identité ni de `payToken` en clair.

## 6. Alignement avec le front existant

Le front est déjà branché sur cette API via [utils/apis/index.js](../../utils/apis/index.js) et les mappers de [utils/mappers/](../../utils/mappers/). Écarts à corriger côté mini-programme quand le backend sera en ligne :

| # | Où | Écart | Correction |
|---|---|---|---|
| 1 | [utils/config.js](../../utils/config.js) + `ENDPOINTS` | `BASE_URL` finit par `/api/v1` et les chemins commencent aussi par `/api/v1` → `/api/v1/api/v1/…` | retirer `/api/v1` des `ENDPOINTS` |
| 2 | [utils/apis/index.js](../../utils/apis/index.js) `#fetchLogements` | passe `{ params: filters }` alors que `HttpClient.get` lit `options.query` : les filtres ne partent jamais | utiliser `{ query: filters }` |
| 3 | [utils/apis/auth.js](../../utils/apis/auth.js) | `client_credentials` avec secret embarqué | `POST /auth/maxit` + refresh (section 2) |
| 4 | [utils/mappers/visite.sculpt.js](../../utils/mappers/visite.sculpt.js) | attend `confirmed`, l'appli et l'API utilisent `accepted` / `rejected` | aligner `statusLabel` sur `pending · accepted · rejected · cancelled · done · no_show` |
| 5 | Visite | mapper lit `date` + `time` | l'API renvoie `scheduledAt` (ISO) **et** `date` (`YYYY-MM-DD`) + `time` (`HH:mm`) pour compatibilité |
| 6 | [utils/mappers/loyer.sculpt.js](../../utils/mappers/loyer.sculpt.js) | lit `dueText` (texte d'interface) | l'API renvoie `dueDate` ; le mapper calcule `dueText` en fr/wo |
| 7 | Loyer | statut `partial` (tranche payée) absent du mapper | ajouter « Payé en partie » |
| 8 | `payLoyer` | pas d'`Idempotency-Key`, et le fallback hors ligne simule un succès | envoyer la clé ; en production, **ne jamais** simuler un paiement réussi |
| 9 | Logement | les mocks utilisent des slugs (`ouakam-cite-avion`) | les ids deviennent des UUID ; ne pas construire d'URL à partir d'un id |
| 10 | Contrat / quittance | construits en local par [utils/mocks/contrats.js](../../utils/mocks/contrats.js) | lus depuis `GET /contrats/{id}` et `GET /quittances/{id}` (mêmes blocs `keys` / `articles`) |
