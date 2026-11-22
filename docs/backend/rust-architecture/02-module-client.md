# 02 — Module Client (Locataire & Colocation)

Ce document détaille **chaque endpoint** du module Locataire ainsi que **toutes les contraintes d'intégrité, d'autorisation, de concurrence et d'inter-dépendances** à respecter sans exception.

---

## 📋 Matrice Exhaustive des Endpoints & Contraintes

---

### A. Recherche & Logements

#### 1. `GET /api/v1/logements`
*Recherche de logements avec filtres avancés.*

- **Pré-requis & Rôles** : Public (ou locataire authentifié pour filtres personnalisés).
- **Paramètres de Requête (Query Params)** :
  - `zoneId` : UUID optionnel (doit exister dans la table `zones`).
  - `minPrice`, `maxPrice` : Entiers positifs en XOF (`minPrice <= maxPrice`).
  - `type` : Enum optionnel `['CHAMBRE', 'STUDIO', 'APPARTEMENT', 'VILLA']`.
  - `isColoc` : Booléen (`true` pour colocation uniquement).
  - `page` : Entier >= 1 (défaut : 1).
  - `pageSize` : Entier entre 1 et 50 (défaut : 20).
- **Contraintes Métier & Inter-dépendances** :
  - **Filtre de statut strict** : Ne renvoie **que** les logements avec `status = 'ONLINE'`.
  - **Masquage anti-fraude** : Si le bailleur associé a `reports_count >= 3` ou `status = 'SUSPENDED'`, ses annonces sont automatiquement exclues du résultat.
  - **Masquage numéro bailleur** : Le numéro de téléphone du bailleur n'est jamais exposé dans la liste publique.
  - **Boosts prioritaires** : Les annonces possédant un boost actif (`boost_expires_at > NOW()`) sont ordonnées en tête de liste pour leur quartier.
- **Codes d'Erreurs** :
  - `400 BAD_REQUEST` : `minPrice > maxPrice` ou `pageSize > 50`.

---

#### 2. `GET /api/v1/logements/{id}`
*Consultation de la fiche détaillée d'un logement.*

- **Pré-requis & Rôles** : Public ou Authentifié.
- **Paramètres d'Entrée** : `id` (UUID du logement).
- **Contraintes Métier & Inter-dépendances** :
  - Le logement doit exister et avoir `status = 'ONLINE'` (sauf si l'utilisateur est le bailleur propriétaire du bien ou un administrateur).
  - Si l'utilisateur est connecté : calcule le statut favori (`isFavorite = true/false`) et la présence d'une visite déjà programmée.
  - Le numéro de téléphone du bailleur reste partiellement masqué (`+221 77 ••• •• 30`) tant que le locataire n'a pas de visite confirmée ou de contrat en cours avec lui.
- **Codes d'Erreurs** :
  - `404 LOGEMENT_NOT_FOUND`.

---

#### 3. `GET /api/v1/logements/{id}/visit-slots`
*Créneaux de visite disponibles.*

- **Pré-requis & Rôles** : Public ou Authentifié.
- **Contraintes Métier & Inter-dépendances** :
  - Le logement doit être actif (`status = 'ONLINE'`).
  - Seuls les créneaux dans le futur (`slot_time > NOW() + INTERVAL '2 HOURS'`) sont retournés.
  - Si un créneau a atteint sa capacité maximale de réservations simultanées (`booked_count >= max_capacity`), il est marqué `isAvailable = false`.
- **Codes d'Erreurs** :
  - `404 LOGEMENT_NOT_FOUND`.

---

#### 4. `POST /api/v1/search/assistant`
*Assistant de recherche IA (texte naturel français / wolof).*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `prompt` : String (3 à 300 caractères).
  - `audioUrl` : Optionnel si commande vocale transmise.
- **Contraintes Métier & Inter-dépendances** :
  - Rate-limit : Maximum 10 requêtes par minute par utilisateur.
  - Traduction et parsing sémantique des critères (budget, quartier dakarois, colocation).
- **Codes d'Erreurs** :
  - `429 TOO_MANY_REQUESTS`.

---

### B. Moteur de Colocation Progressive (Prompt Maître)

#### 5. `GET /api/v1/logements/{id}/places`
*État des lits/places et politique de genre de la chambre.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - Le logement doit avoir `is_coloc = true`.
  - Retourne pour chaque lit : `placeNumber`, `status` (`DISPONIBLE`, `VERROUILLEE`, `OCCUPEE`), `remainingSeconds` du verrou actif.
  - Retourne la politique de genre du groupe actuel : `HOMMES_UNIQUEMENT`, `FEMMES_UNIQUEMENT` ou `COUPLES_UNIQUEMENT`.
- **Codes d'Erreurs** :
  - `400 NOT_A_COLOC_PROPERTY` : Le logement n'est pas configuré en colocation.
  - `404 LOGEMENT_NOT_FOUND`.

---

#### 6. `POST /api/v1/logements/{id}/places/{placeNumber}/lock`
*Verrouillage atomique 15 minutes d'une place de lit.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Contraintes Métier & Inter-dépendances** :
  - **Disponibilité stricte** : La place demandée ne doit pas être déjà `OCCUPEE` par un locataire confirmé.
  - **Absence de verrou concurrent** : La place ne doit pas être actuellement verrouillée (`VERROUILLEE`) par un autre utilisateur (`Redis SET lock:place:{id}:{num} NX EX 900`). Si déjà verrouillée, renvoyer `409 BED_ALREADY_LOCKED` avec le temps restant en secondes.
  - **Limite d'un lit par utilisateur** : Un utilisateur ne peut pas verrouiller plus d'une place simultanément dans le même logement (`409 USER_ALREADY_HOLDING_LOCK`).
  - **Isolation stricte des genres (Prompt Maître)** :
    - Si le premier colocataire positionné est un Homme : la politique du groupe est scellée à `HOMMES_UNIQUEMENT`. Toute tentative de réservation par une femme est bloquée (`403 GENDER_POLICY_VIOLATION`).
    - Si la première colocataire est une Femme : scellé à `FEMMES_UNIQUEMENT`.
    - Si le groupe est en mode Couple : strictement réservé au conjoint validé (`COUPLES_UNIQUEMENT`).
    - Aucune colocation mixte aléatoire n'est autorisée.
- **Codes d'Erreurs** :
  - `403 GENDER_POLICY_VIOLATION` : Violation de la politique de genre du groupe.
  - `409 BED_ALREADY_LOCKED` : Place déjà sous option par un tiers.
  - `409 USER_ALREADY_HOLDING_LOCK` : L'utilisateur a déjà un verrou en cours.

---

#### 7. `DELETE /api/v1/logements/{id}/places/{placeNumber}/unlock`
*Libération manuelle d'un lit avant expiration.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - Seul l'utilisateur détenant le verrou peut le libérer volontairement.
  - Suppression immédiate de la clé dans Redis (`DEL lock:place:{id}:{num}`).
- **Codes d'Erreurs** :
  - `403 FORBIDDEN` : L'utilisateur n'est pas le détenteur du verrou.
  - `404 LOCK_NOT_FOUND`.

---

#### 8. `POST /api/v1/logements/{id}/reserve`
*Validation de la réservation d'un lit après paiement de l'acompte.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Validation des Entrées** :
  - `placeNumber` : Numéro du lit (1..total_places).
  - `paymentTransactionId` : Référence de transaction Orange Money / Max It.
- **Contraintes Métier & Inter-dépendances** :
  - L'utilisateur doit **détenir le verrou actif** sur cette place au moment de l'appel.
  - La transaction Orange Money associée doit être confirmée (`SUCCESS`) avec un montant correspondant exactement à l'acompte requis.
  - Enregistrement en base de données : la place passe à `OCCUPEE`, le verrou Redis est purgé.
- **Codes d'Erreurs** :
  - `409 LOCK_EXPIRED` : Le délai de 15 minutes est dépassé, l'acompte ne peut pas être imputé.
  - `402 PAYMENT_REQUIRED` : Transaction de paiement invalide ou non reçue.

---

#### 9. `POST /api/v1/logements/{id}/privatize-solo`
*Rachat exclusif solo d'une chambre partagée avec remboursement intégral.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Contraintes Métier & Inter-dépendances** :
  - Le logement doit avoir `is_coloc = true` et `status = 'ONLINE'`.
  - Transaction atomique avec verrouillage pessimiste PostgreSQL (`SELECT ... FOR UPDATE` sur la table `logements`).
  - **Règle absolue du Prompt Maître (100% Remboursement)** :
    - Tous les colocataires ayant déjà payé un acompte sur cette chambre sont identifiés.
    - Pour chacun d'eux, un remboursement intégral à 100% sans frais ni pénalité est injecté dans `refund_queue` (`reason = 'SOLO_BUYOUT_100_PERCENT_REFUND'`).
    - Des SMS et notifications push Max It d'excuses et de remboursement sont envoyés aux colocataires évincés.
  - Le statut du logement bascule en location solo privée (`is_coloc = false`, `status = 'OCCUPIED_SOLO'`).
- **Codes d'Erreurs** :
  - `400 PROPERTY_ALREADY_PRIVATE` : Logement non éligible à la privatisation.
  - `409 CONCURRENT_MODIFICATION` : État modifié en cours de traitement.

---

#### 10. `POST /api/v1/coloc/confirm-couple`
*Validation bilatérale obligatoire du statut Couple.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `invitationToken` : Jeton d'invitation généré par le premier conjoint.
- **Contraintes Métier & Inter-dépendances** :
  - **Consentement mutuel obligatoire** : Le mode Couple ne peut jamais être activé par une seule personne. Les deux conjoints doivent valider indépendamment.
  - L'utilisateur qui confirme doit être distinct de l'émetteur de l'invitation (`user_id != inviter_id`).
  - Le jeton doit avoir moins de 72 heures.
- **Codes d'Erreurs** :
  - `400 CANNOT_CONFIRM_OWN_INVITATION` : Tentative de s'auto-valider.
  - `410 TOKEN_EXPIRED` : Invitation expirée (72h dépassées).

---

### C. Visites & Messagerie Directe

#### 11. `POST /api/v1/visites`
*Réservation d'un créneau de visite.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Validation des Entrées** :
  - `logementId` : UUID du logement.
  - `visitSlotId` : UUID du créneau choisi.
- **Contraintes Métier & Inter-dépendances** :
  - **Pas de doublon actif** : Un locataire ne peut pas avoir deux demandes de visite ouvertes (`pending` ou `accepted`) pour le même logement (`409 VISIT_ALREADY_ACTIVE`).
  - Le créneau doit être situé dans le futur (`slot_time > NOW() + INTERVAL '2 HOURS'`).
  - Statut initial : `pending` (en attente d'acceptation du bailleur).
  - **Auto-rejet 48h** : Si le bailleur n'a pas répondu 48h avant la date du créneau, le backend passe automatiquement la visite en `rejected` (`response_note = "Pas de réponse du bailleur"`).
- **Codes d'Erreurs** :
  - `409 VISIT_ALREADY_ACTIVE` : Visite déjà en cours pour ce logement.
  - `410 SLOT_NO_LONGER_AVAILABLE` : Créneau saturé ou passé.

---

#### 12. `POST /api/v1/visites/{id}/cancel`
*Annulation d'une visite par le locataire.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - Seul le locataire auteur de la demande peut l'annuler.
  - La visite doit être en statut `pending` ou `accepted`.
  - La date de visite ne doit pas être dépassée.
  - Le créneau du bailleur est immédiatement ré-incrémenté en disponibilité.
- **Codes d'Erreurs** :
  - `403 FORBIDDEN` : Non propriétaire de la visite.
  - `409 CANNOT_CANCEL_PAST_VISIT`.

---

#### 13. `POST /api/v1/conversations/{id}/messages`
*Envoi d'un message direct.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `content` : String (1 à 1000 caractères) ou `attachmentUrl`.
- **Contraintes Métier & Inter-dépendances** :
  - L'utilisateur doit être participant à la conversation (locataire ou bailleur du bien).
  - **Filtre anti-fraude strict** : Le backend analyse le texte pour bloquer les tentatives de partage prématuré de numéros WhatsApp ou demandes de virements occultes (`TRANSFER_ALERT_TRIGGERED`).
- **Codes d'Erreurs** :
  - `403 FORBIDDEN` : Utilisateur non membre de la conversation.
  - `422 CONTENT_FLAGGED_POLICY_VIOLATION` : Détection de coordonnées frauduleuses.

---

### D. Baux, Loyers & Quittances

#### 14. `POST /api/v1/contrats/{id}/sign`
*Signature électronique du contrat de bail par le locataire.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Contraintes Métier & Inter-dépendances** :
  - Le contrat doit être en statut `pending_signature`.
  - L'utilisateur connecté doit être strictement le locataire désigné sur le contrat (`contrats.locataire_id = current_user.id`).
  - Le locataire doit avoir une pièce d'identité validée (`kyc_status = 'VERIFIED'`).
  - Le bailleur a déjà pré-signé en publiant l'annonce (`bailleur_signed_at` renseigné).
  - Après signature du locataire, le statut du contrat devient `active` dès la validation du premier versement d'entrée.
- **Codes d'Erreurs** :
  - `403 KYC_VERIFICATION_REQUIRED` : CNI non validée.
  - `409 CONTRACT_ALREADY_SIGNED` : Bail déjà signé.

---

#### 15. `POST /api/v1/loyers/{id}/pay`
*Initiation du paiement d'une échéance de loyer via Orange Money.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Validation des Entrées** :
  - `amount` : Entier positif en XOF.
  - `paymentMethod` : Strictement `'ORANGE_MONEY'` ou `'MAXIT'`.
- **Contraintes Métier & Inter-dépendances** :
  - Le contrat associé doit être en statut `active` ou `notice`.
  - L'échéance doit avoir un statut payable : `pending`, `partial` ou `late`. Une échéance `paid` ou `cancelled` est rejetée (`409 ECHEANCE_ALREADY_PAID`).
  - **Contrainte de montant (Tranches)** :
    - `amount` doit être supérieur ou égal à 100 F CFA.
    - `amount` ne peut **jamais** excéder le reste dû (`badAmount` : `amount <= echeance.montant - echeance.montant_paye`).
  - **Émission conditionnelle de quittance** :
    - Si le paiement solde l'intégralité du reste dû : émission de la quittance finale certifiée (`is_final = true`).
    - Si le paiement est partiel : émission d'un reçu d'acompte partiel (`is_final = false`).
- **Codes d'Erreurs** :
  - `400 INVALID_AMOUNT_EXCEEDS_REMAINING` : Le montant dépasse le solde restant.
  - `409 ECHEANCE_ALREADY_PAID` : Loyer déjà soldé.

---

#### 16. `GET /api/v1/quittances/verify/{verifyCode}`
*Vérification publique de quittance anti-fraude (via QR Code).*

- **Pré-requis & Rôles** : Public (aucun token requis).
- **Paramètres d'Entrée** : `verifyCode` (Code unique alphanumérique ex: `QT-A1B2C3D4-202611`).
- **Contraintes Métier & Inter-dépendances** :
  - Recherche par index unique `verify_code`.
  - Renvoie uniquement les données certifiées publiques : nom masqué du locataire, adresse du bien, mois concerné, montant en XOF et empreinte d'horodatage.
  - Permet aux banques et consulats de valider qu'il ne s'agit pas d'un faux document sans divulguer de données personnelles privées.
- **Codes d'Erreurs** :
  - `404 QUITTANCE_NOT_FOUND` : Code inexistant ou falsifié.

---

## 2. Invariants Métier & Code Rust du Moteur de Colocation & Loyers

### A. Typage Strict des Politiques de Genre (Prompt Maître)

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum GenderPolicy {
    HommesUniquement,
    FemmesUniquement,
    CouplesUniquement,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum UserGender {
    Homme,
    Femme,
}

impl GenderPolicy {
    pub fn is_compatible(&self, user_gender: UserGender, is_couple: bool) -> bool {
        match self {
            GenderPolicy::HommesUniquement => user_gender == UserGender::Homme && !is_couple,
            GenderPolicy::FemmesUniquement => user_gender == UserGender::Femme && !is_couple,
            GenderPolicy::CouplesUniquement => is_couple,
        }
    }
}
```

### B. Use Case : Verrou Atomique 15 min d'une Place (`crates/application/src/client/lock_place.rs`)

```rust
use deadpool_redis::Pool;
use redis::AsyncCommands;
use uuid::Uuid;
use crate::shared::error::AppError;

pub struct LockPlaceUseCase {
    redis_pool: Pool,
}

impl LockPlaceUseCase {
    pub async fn execute(
        &self,
        logement_id: Uuid,
        place_number: u8,
        user_id: Uuid,
    ) -> Result<u64, AppError> {
        let key = format!("lock:place:{}:{}", logement_id, place_number);
        let mut conn = self.redis_pool.get().await.map_err(|e| anyhow::anyhow!(e))?;

        let acquired: bool = redis::cmd("SET")
            .arg(&key)
            .arg(user_id.to_string())
            .arg("NX")
            .arg("EX")
            .arg(900) // 15 minutes = 900 secondes
            .query_async(&mut conn)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

        if !acquired {
            let ttl: u64 = conn.ttl(&key).await.unwrap_or(900);
            return Err(AppError::BedAlreadyLocked { remaining_seconds: ttl });
        }

        Ok(900)
    }
}
```

### C. Use Case : Rachat Exclusif Solo & Remboursement Intégral 100%

```rust
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use crate::shared::error::AppError;

pub struct PrivatizeSoloUseCase {
    db_pool: PgPool,
}

impl PrivatizeSoloUseCase {
    pub async fn execute(
        &self,
        logement_id: Uuid,
        solo_buyer_id: Uuid,
    ) -> Result<Vec<Uuid>, AppError> {
        let mut tx: Transaction<'_, Postgres> = self.db_pool.begin().await
            .map_err(|e| anyhow::anyhow!(e))?;

        // 1. Verrouillage exclusif pessimiste de la ligne du logement
        let room = sqlx::query!(
            r#"
            SELECT id, is_coloc, status 
            FROM logements 
            WHERE id = $1 AND deleted_at IS NULL
            FOR UPDATE
            "#,
            logement_id
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|_| AppError::LogementNotFound)?;

        if !room.is_coloc {
            return Err(AppError::PropertyAlreadyPrivate);
        }

        // 2. Trouver les colocataires ayant déjà versé un acompte
        let roommates = sqlx::query!(
            r#"
            SELECT p.payer_id, p.amount 
            FROM payments p
            JOIN echeances e ON p.echeance_id = e.id
            JOIN contrats c ON e.contrat_id = c.id
            WHERE c.logement_id = $1 
              AND p.payer_id != $2 
              AND p.status = 'succeeded'
            "#,
            logement_id,
            solo_buyer_id
        )
        .fetch_all(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        let mut refunded_users = Vec::new();

        // 3. Injection dans notifications_outbox pour remboursement 100% sans frais
        for rm in roommates {
            sqlx::query!(
                r#"
                INSERT INTO notifications_outbox (id, channel, recipient, payload, status, created_at)
                VALUES ($1, 'sms', (SELECT phone FROM users WHERE id = $2), $3, 'pending', NOW())
                "#,
                Uuid::new_v4(),
                rm.payer_id,
                serde_json::json!({
                    "message_fr": "Votre place de colocation a été remboursée intégralement à 100% suite à la privatisation du bien.",
                    "message_wo": "Xaalis bi nga feyoon ci néeg bi dagnu la ko dellu 100% ndax kenn nit a ko jël."
                })
            )
            .execute(&mut *tx)
            .await
            .map_err(|e| anyhow::anyhow!(e))?;

            refunded_users.push(rm.payer_id);
        }

        // 4. Basculer le logement en occupation solo
        sqlx::query!(
            r#"
            UPDATE logements 
            SET is_coloc = FALSE, status = 'reserved', updated_at = NOW()
            WHERE id = $1
            "#,
            logement_id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        tx.commit().await.map_err(|e| anyhow::anyhow!(e))?;
        Ok(refunded_users)
    }
}
```
