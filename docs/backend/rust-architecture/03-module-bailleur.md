# 03 — Module Bailleur (Gestion Immobilière & Encaissements)

Ce document détaille **chaque endpoint** du module Bailleur ainsi que **toutes les contraintes d'autorisation, d'intégrité financière, d'anti-fraude et d'inter-dépendances** avec les flux locataires.

---

## 📋 Matrice Exhaustive des Endpoints & Contraintes

---

### A. Compte & Abonnement Pro

#### 1. `GET /api/v1/bailleur/compte`
*Consultation de l'état du compte bailleur et de son abonnement.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`) avec rôle `bailleur` ou utilisateur souhaitant s'activer comme bailleur.
- **Contraintes Métier & Inter-dépendances** :
  - Calcule dynamiquement le statut de l'abonnement :
    - `TRIAL_ACTIVE` : Période d'essai de 30 jours en cours (`NOW() < trial_started_at + INTERVAL '30 DAYS'`).
    - `PRO_ACTIVE` : Souscription Pro en cours (`pro_expires_at > NOW()`).
    - `EXPIRED` : Période d'essai ou pack Pro expiré.
  - Retourne le décompte exact des jours restants (`daysRemaining`).
  - Retourne les statistiques consolidées : nombre d'annonces en ligne, baux vivants, taux de recouvrement des loyers du mois.
- **Codes d'Erreurs** :
  - `401 UNAUTHORIZED`.

---

#### 2. `POST /api/v1/bailleur/compte/activation`
*Souscription ou renouvellement du Pack Bailleur Pro.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Validation des Entrées** :
  - `plan` : Enum `'MONTHLY'` (30 jours) ou `'ANNUAL'` (365 jours).
  - `paymentMethod` : `'ORANGE_MONEY'` ou `'MAXIT'`.
- **Contraintes Métier & Inter-dépendances** :
  - **Règle de l'Essai Unique** : L'essai gratuit de 30 jours ne peut être consommé **qu'une seule fois dans la vie du compte** (protégé par index unique partiel en base de données). Toute réclamation ultérieure d'essai gratuit est rejetée (`409 TRIAL_ALREADY_USED`).
  - **Prolongation sans rupture** : Si le bailleur a déjà un abonnement Pro actif, la nouvelle période est ajoutée à la fin de la période en cours (`ends_at = MAX(NOW(), ends_at_actuel) + INTERVAL '30 DAYS'`).
  - L'activation n'est effective qu'après succès de la transaction Orange Money (via webhook ou polling synchrone).
- **Codes d'Erreurs** :
  - `409 TRIAL_ALREADY_USED` : Tentative de réactiver un deuxième essai gratuit.
  - `402 PAYMENT_FAILED` : Échec du paiement Orange Money.

---

### B. Gestion des Annonces Immobilières

#### 3. `GET /api/v1/bailleur/annonces`
*Liste des logements gérés par le bailleur connecté.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - **Contrainte d'accès strict à l'espace bailleur** : L'accès à la gestion des annonces exige un abonnement actif (`TRIAL_ACTIVE` ou `PRO_ACTIVE`). Si l'abonnement est expiré, le backend bloque la gestion et renvoie `403 SUBSCRIPTION_REQUIRED`.
  - Seules les annonces appartenant au bailleur connecté (`logements.bailleur_id = current_user.id`) sont retournées (isolation des données).
  - Statuts possibles : `DRAFT`, `PENDING_REVIEW`, `ONLINE`, `RENTED`, `SUSPENDED`.
- **Codes d'Erreurs** :
  - `403 SUBSCRIPTION_REQUIRED` : Abonnement expiré (nécessite activation Pro).

---

#### 4. `POST /api/v1/bailleur/annonces`
*Création et publication d'une nouvelle annonce immobilière.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`) avec abonnement bailleur actif.
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Validation des Entrées** :
  - `title` : String (5 à 120 caractères).
  - `description` : String (20 à 2000 caractères).
  - `zoneId` : UUID valide d'une zone existante.
  - `type` : Strictement `'CHAMBRE'`, `'STUDIO'`, `'APPARTEMENT'` ou `'VILLA'`.
  - `rentAmount` : Entier positif en XOF (minimum 10 000 F CFA).
  - `depositAmount` : Entier positif en XOF (maximum 2 mois de loyer selon la réglementation sénégalaise).
  - `photos` : Liste d'au moins **4 photos distinctes** (URLs COS validées).
  - `isColoc` : Booléen (`true` si colocation).
  - `totalPlaces` : Entier entre 2 et 10 si `isColoc = true`, sinon strictement 1.
  - `genderPolicy` : Strictement obligatoire si `isColoc = true` (`HOMMES_UNIQUEMENT`, `FEMMES_UNIQUEMENT`, `COUPLES_UNIQUEMENT`).
- **Contraintes Métier & Règles Anti-Fraude (Vérification Backend)** :
  - **Abonnement actif requis** : Rejet immédiat si `ends_at <= NOW()` (`403 SUBSCRIPTION_REQUIRED`).
  - **Règle des 4 photos minimum** : Moins de 4 photos entraîne le rejet immédiat (`422 MINIMUM_4_PHOTOS_REQUIRED`).
  - **Filtre anti-coordonnées** : La description ne doit contenir aucun numéro de téléphone (regex sénégalaise `7[05678][0-9]{7}`) ni lien Web. Rejet automatique (`422 DESCRIPTION_CONTAINS_CONTACT_INFO`).
  - **Contrôle d'anomalie tarifaire** : Si le prix proposé est inférieur à 50% de la médiane constatée dans la zone pour ce type de logement, l'annonce est obligatoirement soumise à la modération manuelle (`PENDING_REVIEW`) au lieu d'être mise en ligne directement.
  - **Signature tacite du modèle de bail** : La publication de l'annonce vaut acceptation irrévocable du modèle de bail SAMA LOYER et pré-signature des futurs contrats (`bailleur_signed_at = NOW()`).
- **Codes d'Erreurs** :
  - `403 SUBSCRIPTION_REQUIRED` : Pas d'abonnement valide.
  - `422 MINIMUM_4_PHOTOS_REQUIRED` : Galerie photo incomplète.
  - `422 DESCRIPTION_CONTAINS_CONTACT_INFO` : Coordonnées privées interdites dans l'annonce.
  - `422 DEPOSIT_EXCEEDS_LEGAL_LIMIT` : Caution supérieure à 2 mois de loyer.

---

#### 5. `PATCH /api/v1/bailleur/annonces/{id}`
*Mise à jour d'une annonce existante.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - L'utilisateur doit être le bailleur propriétaire du logement (`bailleur_id = current_user.id`).
  - **Immuabilité en cours de bail** : Si le logement a un contrat actif (`status = 'RENTED'`), le type de logement, la politique de colocation (`isColoc`, `genderPolicy`) et le loyer contractuel ne peuvent plus être modifiés.
  - Toute modification de la description est re-soumise au filtre anti-fraude (recherche de numéros masqués).
- **Codes d'Erreurs** :
  - `403 FORBIDDEN` : Non propriétaire de l'annonce.
  - `409 CANNOT_MODIFY_RENTED_PROPERTY` : Logement actuellement sous bail actif.

---

#### 6. `DELETE /api/v1/bailleur/annonces/{id}`
*Suppression ou archivage d'une annonce.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Contraintes Métier & Inter-dépendances** :
  - Seul le bailleur propriétaire peut supprimer son annonce.
  - **Interdiction formelle de suppression si un contrat est vivant** : Si le logement possède un contrat en statut `active` ou `notice`, la suppression physique est strictement interdite (`409 CANNOT_DELETE_ACTIVE_LEASE`). L'annonce peut uniquement être désactivée de la recherche publique.
  - Si des visites futures sont programmées (`accepted` ou `pending`), elles sont automatiquement annulées avec notification aux locataires.
- **Codes d'Erreurs** :
  - `409 CANNOT_DELETE_ACTIVE_LEASE` : Contrat de location en cours d'exécution.

---

### C. Gestion des Visites

#### 7. `POST /api/v1/bailleur/visites/{id}/accept`
*Validation d'une demande de visite par le bailleur.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`) propriétaire du logement concerné.
- **Contraintes Métier & Inter-dépendances** :
  - La visite doit être en statut `pending`.
  - La date du créneau ne doit pas être déjà dépassée dans le temps (`visit_slot.slot_time > NOW()`).
  - **Révélation conditionnelle des coordonnées** :
    - Le statut passe à `accepted`.
    - L'adresse exacte et détaillée du logement (`address_detail`) est déverrouillée et devient visible pour le locataire.
    - Le numéro de téléphone du bailleur est démasqué pour le locataire, et inversement.
    - Un SMS de confirmation est poussé dans la file d'attente d'envois (`outbox`).
    - Un événement automatique est injecté dans le fil de conversation de messagerie entre les deux parties.
- **Codes d'Erreurs** :
  - `403 FORBIDDEN` : Le bailleur n'est pas le propriétaire du bien.
  - `409 VISIT_NOT_PENDING` : Demande déjà traitée ou annulée.
  - `410 VISIT_SLOT_EXPIRED` : Créneau passé.

---

#### 8. `POST /api/v1/bailleur/visites/{id}/reject`
*Refus d'une demande de visite par le bailleur.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **Validation des Entrées** :
  - `reason` : Enum obligatoire (`SLOT_UNAVAILABLE`, `PROPERTY_ALREADY_RESERVED`, `TENANT_PROFILE_MISMATCH`, `OTHER`).
  - `note` : String optionnelle (jusqu'à 250 caractères).
- **Contraintes Métier & Inter-dépendances** :
  - La visite doit être en statut `pending`.
  - Le statut passe à `rejected`.
  - Le créneau horaire est immédiatement libéré en base de données.
- **Codes d'Erreurs** :
  - `409 VISIT_NOT_PENDING`.

---

### D. Encaissement en Espèces & Quittances

#### 9. `POST /api/v1/bailleur/echeances/{id}/cash-payments`
*Déclaration d'un encaissement de loyer en espèces par le bailleur.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`).
- **En-têtes Requis** : `Idempotency-Key: <UUID>`.
- **Validation des Entrées** :
  - `amountReceived` : Entier positif en XOF.
  - `notes` : Optionnel.
- **Contraintes Métier & Inter-dépendances** :
  - **Habilitation exclusive du bailleur** : **Seul** le bailleur titulaire du contrat lié à l'échéance peut déclarer un paiement en espèces. Le locataire ne peut en aucun cas déclarer lui-même un paiement cash (`403 ONLY_BAILLEUR_CAN_DECLARE_CASH`).
  - L'échéance doit être en statut `pending`, `partial` ou `late`. Une échéance déjà `paid` est rejetée (`409 ECHEANCE_ALREADY_PAID`).
  - **Plafond du reste dû** : `amountReceived` ne peut pas excéder le solde restant dû de l'échéance (`amountReceived <= montant_total - montant_deja_paye`).
  - **Émission de quittance certifiée automatique** :
    - Dès l'enregistrement du cash payment, le statut de l'échéance passe à `paid` (ou `partial` si solde incomplet).
    - Une **quittance numérique officielle** est immédiatement insérée dans la table `quittances` avec :
      - Un code anti-fraude unique : `QT-{UUID-PART}-{YYYYMM}`.
      - La mention légale : `Mode de règlement : Espèces (validé par le bailleur)`.
      - Un QR code de vérification public.
    - Une notification push Max It et un SMS sont immédiatement expédiés au locataire pour lui certifier la bonne réception de ses fonds.
- **Codes d'Erreurs** :
  - `403 ONLY_BAILLEUR_CAN_DECLARE_CASH` : Tentative frauduleuse de déclaration par le locataire.
  - `400 INVALID_CASH_AMOUNT_EXCEEDS_REMAINING` : Montant supérieur à la dette locative.
  - `409 ECHEANCE_ALREADY_PAID` : Échéance déjà réglée.

---

#### 10. `GET /api/v1/bailleur/locataires`
*Répertoire et carnet de santé locative du parc du bailleur.*

- **Pré-requis & Rôles** : Authentifié (`Bearer <JWT>`) avec abonnement actif.
- **Contraintes Métier & Inter-dépendances** :
  - Retourne la liste exhaustive de tous les locataires sous contrat `active` ou `notice` avec le bailleur connecté.
  - Pour chaque locataire : affiche l'état de l'échéance du mois en cours (`PAID`, `LATE`, `PENDING`), les retards éventuels accumulés, le montant de la caution séquestrée (`deposit_amount`), et un lien direct vers la messagerie interne.
- **Codes d'Erreurs** :
  - `403 SUBSCRIPTION_REQUIRED`.

---

## 2. Invariants Métier & Code Rust du Module Bailleur

### A. Calcul Dynamique de l'Abonnement (30 Jours d'Essai Gratuit)

```rust
use chrono::{DateTime, Duration, Utc};

#[derive(Debug)]
pub struct BailleurSubscription {
    pub trial_started_at: DateTime<Utc>,
    pub is_pro: bool,
    pub pro_expires_at: Option<DateTime<Utc>>,
}

impl BailleurSubscription {
    pub fn is_active(&self) -> bool {
        if self.is_pro {
            if let Some(exp) = self.pro_expires_at {
                return exp > Utc::now();
            }
            return true;
        }

        // Vérification de la période d'essai de 30 jours
        let trial_limit = self.trial_started_at + Duration::days(30);
        Utc::now() < trial_limit
    }

    pub fn days_remaining(&self) -> i64 {
        let trial_limit = self.trial_started_at + Duration::days(30);
        let diff = (trial_limit - Utc::now()).num_days();
        diff.max(0)
    }
}
```

### B. Use Case : Encaissement en Espèces & Émission de Quittance Certifiée

```rust
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;
use crate::shared::error::AppError;

pub struct RecordCashPaymentUseCase {
    db_pool: PgPool,
}

#[derive(serde::Serialize)]
pub struct QuittanceSummaryDto {
    pub id: Uuid,
    pub numero: String,
    pub verify_code: String,
    pub issued_at: chrono::DateTime<chrono::Utc>,
}

impl RecordCashPaymentUseCase {
    pub async fn execute(
        &self,
        echeance_id: Uuid,
        bailleur_id: Uuid,
        amount_received: i64,
    ) -> Result<QuittanceSummaryDto, AppError> {
        let mut tx: Transaction<'_, Postgres> = self.db_pool.begin().await
            .map_err(|e| anyhow::anyhow!(e))?;

        // 1. Contrôle d'appartenance et statut de l'échéance
        let echeance = sqlx::query!(
            r#"
            SELECT e.id, e.contrat_id, e.amount_due, e.amount_paid, e.status, c.bailleur_id, c.locataire_id
            FROM echeances e
            JOIN contrats c ON e.contrat_id = c.id
            WHERE e.id = $1
            FOR UPDATE
            "#,
            echeance_id
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|_| AppError::NotFound("Échéance introuvable".into()))?;

        // Seul le bailleur propriétaire peut déclarer un paiement cash
        if echeance.bailleur_id != bailleur_id {
            return Err(AppError::OnlyBailleurCanDeclareCash);
        }

        if echeance.status == "paid" {
            return Err(AppError::EcheanceAlreadyPaid);
        }

        let remaining = echeance.amount_due - echeance.amount_paid;
        if amount_received > remaining {
            return Err(AppError::AmountExceedsRemainingBalance { remaining });
        }

        let new_amount_paid = echeance.amount_paid + amount_received;
        let is_soldout = new_amount_paid >= echeance.amount_due;
        let new_status = if is_soldout { "paid" } else { "partial" };

        // 2. Mise à jour de l'échéance
        sqlx::query!(
            r#"
            UPDATE echeances
            SET amount_paid = $1, status = $2, paid_at = CASE WHEN $3 THEN NOW() ELSE paid_at END, updated_at = NOW()
            WHERE id = $4
            "#,
            new_amount_paid,
            new_status as _,
            is_soldout,
            echeance_id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        // 3. Enregistrement du paiement dans la table payments
        let payment_id = Uuid::new_v4();
        let reference = format!("TX-CASH-{}", &payment_id.to_string()[..8].to_uppercase());
        let idempotency_key = format!("CASH-{}-{}", echeance_id, chrono::Utc::now().timestamp());

        sqlx::query!(
            r#"
            INSERT INTO payments (id, reference, payer_id, purpose, echeance_id, amount, method, status, idempotency_key, confirmed_by, initiated_at, completed_at)
            VALUES ($1, $2, $3, 'rent', $4, $5, 'cash', 'succeeded', $6, $7, NOW(), NOW())
            "#,
            payment_id,
            reference,
            echeance.locataire_id,
            echeance.id,
            amount_received,
            idempotency_key,
            bailleur_id
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        // 4. Génération de la quittance certifiée avec verify_code
        let quittance_id = Uuid::new_v4();
        let numero_recu = format!("REC-CASH-{}", &quittance_id.to_string()[..8].to_uppercase());
        let verify_code = format!("QT-{}", &quittance_id.to_string()[..12].to_uppercase());
        let breakdown = serde_json::json!([{ "label": "Loyer encaissé en espèces", "amount": amount_received }]);

        let quittance = sqlx::query!(
            r#"
            INSERT INTO quittances (id, numero, payment_id, echeance_id, contrat_id, amount, breakdown, is_final, verify_code, issued_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
            RETURNING id, numero, verify_code, issued_at
            "#,
            quittance_id,
            numero_recu,
            payment_id,
            echeance.id,
            echeance.contrat_id,
            amount_received,
            breakdown,
            is_soldout,
            verify_code
        )
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        // 5. Notification SMS outbox envoyée au locataire
        sqlx::query!(
            r#"
            INSERT INTO notifications_outbox (id, channel, recipient, payload, status, created_at)
            VALUES ($1, 'sms', (SELECT phone FROM users WHERE id = $2), $3, 'pending', NOW())
            "#,
            Uuid::new_v4(),
            echeance.locataire_id,
            serde_json::json!({
                "message_fr": format!("Votre bailleur a confirmé la réception de {} F CFA en espèces. Quittance officielle disponible avec le code {}.", amount_received, verify_code),
                "message_wo": format!("Sa bailleur nangu na {} F CFA ci loxo. Sa kayitu fey a ngi am kodu {}.", amount_received, verify_code)
            })
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        tx.commit().await.map_err(|e| anyhow::anyhow!(e))?;

        Ok(QuittanceSummaryDto {
            id: quittance.id,
            numero: quittance.numero,
            verify_code: quittance.verify_code,
            issued_at: quittance.issued_at,
        })
    }
}
```
