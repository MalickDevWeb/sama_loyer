# 05 — Spécification Technique Ultime pour Implémentation par IA (Validations, Erreurs & Code Clé en Main)

> **CIBLE DE CE DOCUMENT** : Ce fichier est conçu comme un **prompt technique autonome et infaillible**. Une IA ou un ingénieur logiciel doit pouvoir lire ce fichier et générer directement le code source Rust de l'ensemble du backend sans aucune ambiguïté, sans rien deviner et sans omettre la moindre règle de validation ou code d'erreur.

---

# SECTION 1 — CATALOGUE EXHAUSTIF DES ERREURS APPLICATIVES (`AppError`)

Toutes les erreurs sont centralisées dans l'enum `AppError` dans `crates/shared/src/error.rs`.  
Elles sont sérialisées selon l'enveloppe universelle SAMA LOYER avec support bilingue (Français & Wolof) :

```rust
use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AppError {
    // ------------------------------------------------------------------------
    // 1. Authentification & Compte
    // ------------------------------------------------------------------------
    #[error("Code d'autorisation Max It invalide ou déjà consommé")]
    InvalidAuthCode,

    #[error("Session expirée ou révoquée, veuillez vous reconnecter")]
    TokenExpiredOrRevoked,

    #[error("Compte suspendu pour violation des règles de la plateforme")]
    AccountSuspended,

    #[error("Accès non autorisé : authentification requise")]
    Unauthorized,

    #[error("Permissions insuffisantes pour effectuer cette action")]
    Forbidden,

    #[error("Utilisateur introuvable")]
    UserNotFound,

    #[error("Le nom et prénom sont verrouillés car votre CNI a déjà été validée")]
    KycAlreadyVerifiedLocked,

    #[error("Vérification d'identité (CNI) obligatoire pour signer ce bail")]
    KycVerificationRequired,

    // ------------------------------------------------------------------------
    // 2. Logements & Recherche
    // ------------------------------------------------------------------------
    #[error("Logement introuvable")]
    LogementNotFound,

    #[error("Ce logement n'est pas configuré pour la colocation")]
    NotAColocProperty,

    #[error("Logement actuellement loué, modifications contractuelles impossibles")]
    CannotModifyRentedProperty,

    #[error("Impossible de supprimer une annonce ayant un contrat de location en cours")]
    CannotDeleteActiveLease,

    // ------------------------------------------------------------------------
    // 3. Moteur de Colocation Progressive (Prompt Maître)
    // ------------------------------------------------------------------------
    #[error("Cette place est actuellement verrouillée par un autre colocataire")]
    BedAlreadyLocked { remaining_seconds: u64 },

    #[error("Vous détenez déjà une place ou un verrou actif dans cette colocation")]
    UserAlreadyHoldingLock,

    #[error("Incompatibilité stricte avec la politique de genre du groupe")]
    GenderPolicyViolation { required: String },

    #[error("Le verrou temporaire de 15 minutes a expiré, veuillez relancer la réservation")]
    LockExpired,

    #[error("Ce logement est déjà privatisé en occupation solo")]
    PropertyAlreadyPrivate,

    #[error("Jeton d'invitation de colocation expiré ou invalide")]
    ColocInvitationExpired,

    #[error("Impossible de confirmer votre propre invitation de couple")]
    CannotConfirmOwnCoupleInvitation,

    // ------------------------------------------------------------------------
    // 4. Visites & Messagerie
    // ------------------------------------------------------------------------
    #[error("Vous avez déjà une demande de visite en cours pour ce logement")]
    VisitAlreadyActive,

    #[error("Le créneau de visite sélectionné n'est plus disponible")]
    VisitSlotUnavailable,

    #[error("Impossible d'annuler ou de modifier une visite dont la date est déjà passée")]
    CannotModifyPastVisit,

    #[error("La demande de visite n'est plus en attente d'approbation")]
    VisitNotPending,

    #[error("Message bloqué : détection de coordonnées directes non autorisées")]
    ContentFlaggedContactViolation,

    // ------------------------------------------------------------------------
    // 5. Contrats, Baux & Quittances
    // ------------------------------------------------------------------------
    #[error("Contrat de bail introuvable")]
    ContratNotFound,

    #[error("Ce contrat de bail a déjà été signé")]
    ContractAlreadySigned,

    #[error("Seul le locataire désigné sur le bail est habilité à le signer")]
    TenantSignatureMismatch,

    #[error("Quittance introuvable ou code de vérification falsifié")]
    QuittanceNotFound,

    // ------------------------------------------------------------------------
    // 6. Finances, Loyers & Idempotence
    // ------------------------------------------------------------------------
    #[error("Cette échéance a déjà été intégralement réglée")]
    EcheanceAlreadyPaid,

    #[error("Le montant saisi dépasse le solde restant dû pour cette échéance")]
    AmountExceedsRemainingBalance { remaining: i64 },

    #[error("Le montant minimum d'une tranche de paiement est de 100 F CFA")]
    AmountBelowMinimum,

    #[error("Cette transaction a déjà été traitée avec succès")]
    DuplicateTransaction,

    #[error("En-tête Idempotency-Key obligatoire sur cette opération")]
    MissingIdempotencyKey,

    #[error("Paiement refusé ou annulé par le réseau Orange Money")]
    OrangeMoneyPaymentDeclined(String),

    // ------------------------------------------------------------------------
    // 7. Espace Bailleur & Abonnements
    // ------------------------------------------------------------------------
    #[error("Accès réservé aux bailleurs ayant un abonnement Pro ou un essai actif")]
    SubscriptionRequired,

    #[error("L'offre d'essai gratuit de 30 jours a déjà été consommée pour ce compte")]
    TrialAlreadyUsed,

    #[error("L'annonce doit comporter au minimum 4 photos réelles")]
    Minimum4PhotosRequired,

    #[error("La description ne doit pas contenir de numéro de téléphone ou de lien")]
    DescriptionContainsContactInfo,

    #[error("Le montant de la caution ne peut pas dépasser 2 mois de loyer (loi sénégalaise)")]
    DepositExceedsLegalLimit,

    #[error("Seul le bailleur titulaire du contrat peut déclarer un paiement en espèces")]
    OnlyBailleurCanDeclareCash,

    // ------------------------------------------------------------------------
    // 8. Technique & Infrastructure
    // ------------------------------------------------------------------------
    #[error("Signature cryptographique du webhook invalide")]
    InvalidWebhookSignature,

    #[error("Format de document ou taille de fichier non autorisée")]
    InvalidFileFormatOrSize,

    #[error("Trop de requêtes, veuillez patienter")]
    RateLimitExceeded,

    #[error("Erreur de validation des données transmises")]
    ValidationFailed(String),

    #[error("Erreur interne du serveur")]
    Internal(#[from] anyhow::Error),
}

#[derive(Serialize)]
pub struct ErrorEnvelope {
    pub success: bool,
    pub code: &'static str,
    pub message: String,
    pub message_wo: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
    pub request_id: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, msg_fr, msg_wo, details) = match &self {
            AppError::InvalidAuthCode => (
                StatusCode::UNAUTHORIZED,
                "INVALID_AUTH_CODE",
                "Code d'autorisation Max It invalide ou expiré.",
                "Kodu Max It bi baaxul mbaa dafa jeex.",
                None,
            ),
            AppError::TokenExpiredOrRevoked => (
                StatusCode::UNAUTHORIZED,
                "TOKEN_EXPIRED",
                "Votre session a expiré, veuillez vous reconnecter.",
                "Sa jall bi jeexna, dellul dugguwaat.",
                None,
            ),
            AppError::AccountSuspended => (
                StatusCode::FORBIDDEN,
                "ACCOUNT_SUSPENDED",
                "Votre compte est temporairement suspendu.",
                "Sa sàq dagnu ko tëj ci ndoorte.",
                None,
            ),
            AppError::Unauthorized => (
                StatusCode::UNAUTHORIZED,
                "UNAUTHORIZED",
                "Authentification requise.",
                "Danga wara duggu ci sàq bi bala ngay def li.",
                None,
            ),
            AppError::Forbidden => (
                StatusCode::FORBIDDEN,
                "FORBIDDEN",
                "Action non autorisée.",
                "Amuloo sañ-sañu def li.",
                None,
            ),
            AppError::UserNotFound => (
                StatusCode::NOT_FOUND,
                "USER_NOT_FOUND",
                "Utilisateur introuvable.",
                "Gisunu nit ki.",
                None,
            ),
            AppError::KycAlreadyVerifiedLocked => (
                StatusCode::FORBIDDEN,
                "KYC_LOCKED",
                "Identité officielle validée, modification impossible.",
                "Sa tur ak sa sant dagnu ko dëggal ba noppi, mënoo ko soppi.",
                None,
            ),
            AppError::KycVerificationRequired => (
                StatusCode::FORBIDDEN,
                "KYC_REQUIRED",
                "Veuillez valider votre CNI avant de signer le bail.",
                "Danga wara woné sa kayitu juddu bala ngay xaatim këyit gi.",
                None,
            ),
            AppError::LogementNotFound => (
                StatusCode::NOT_FOUND,
                "LOGEMENT_NOT_FOUND",
                "Logement introuvable.",
                "Gisunu néeg bi.",
                None,
            ),
            AppError::NotAColocProperty => (
                StatusCode::BAD_REQUEST,
                "NOT_A_COLOC",
                "Ce logement n'est pas proposé en colocation.",
                "Kër gi bokkul ci néeg yu nuy bokk.",
                None,
            ),
            AppError::CannotModifyRentedProperty => (
                StatusCode::CONFLICT,
                "RENTED_PROPERTY_LOCKED",
                "Logement loué : impossible de modifier les conditions.",
                "Néeg bi dañu ko loué ba noppi, mënoo ko soppi.",
                None,
            ),
            AppError::CannotDeleteActiveLease => (
                StatusCode::CONFLICT,
                "CANNOT_DELETE_ACTIVE_LEASE",
                "Suppression impossible : un bail actif est en cours.",
                "Mënoo ko fey ndax nit a ngi ci biir.",
                None,
            ),
            AppError::BedAlreadyLocked { remaining_seconds } => (
                StatusCode::CONFLICT,
                "BED_ALREADY_LOCKED",
                "Cette place est temporairement réservée par un colocataire.",
                "Palaas bi keneen a ngi koy tëj ci 15 simili.",
                Some(serde_json::json!({ "remainingSeconds": remaining_seconds })),
            ),
            AppError::UserAlreadyHoldingLock => (
                StatusCode::CONFLICT,
                "USER_ALREADY_HOLDING_LOCK",
                "Vous avez déjà une place réservée dans cette chambre.",
                "Yaa ngi am palaas bu tëju ba noppi.",
                None,
            ),
            AppError::GenderPolicyViolation { required } => (
                StatusCode::FORBIDDEN,
                "GENDER_POLICY_VIOLATION",
                format!("Cette colocation est strictement réservée : {}", required),
                format!("Néeg bi ñi fi mëna dëkk : {}", required),
                Some(serde_json::json!({ "requiredPolicy": required })),
            ),
            AppError::LockExpired => (
                StatusCode::GONE,
                "LOCK_EXPIRED",
                "Le délai de réservation de 15 minutes a expiré.",
                "15 simili yi jeexna, dellul tëjwaat.",
                None,
            ),
            AppError::PropertyAlreadyPrivate => (
                StatusCode::CONFLICT,
                "ALREADY_PRIVATE",
                "Ce logement est déjà privatisé en occupation solo.",
                "Néeg bi nit kenn doŋŋ a ko jël ba noppi.",
                None,
            ),
            AppError::ColocInvitationExpired => (
                StatusCode::GONE,
                "INVITATION_EXPIRED",
                "Le lien d'invitation a expiré (validité 72h).",
                "Liñ la yònné ngir nga duggu jeexna.",
                None,
            ),
            AppError::CannotConfirmOwnCoupleInvitation => (
                StatusCode::BAD_REQUEST,
                "CANNOT_CONFIRM_OWN_INVITATION",
                "Le conjoint doit valider lui-même l'invitation.",
                "Sa kër-sëy mo wara dëggal boppam lii.",
                None,
            ),
            AppError::VisitAlreadyActive => (
                StatusCode::CONFLICT,
                "VISIT_ALREADY_ACTIVE",
                "Vous avez déjà une visite en cours pour ce logement.",
                "Yaa ngi am wisaat bu dëggu ba noppi ngir néeg bi.",
                None,
            ),
            AppError::VisitSlotUnavailable => (
                StatusCode::CONFLICT,
                "SLOT_UNAVAILABLE",
                "Ce créneau horaire est saturé ou n'existe plus.",
                "Waxtu wi nit ñi fess dëll nañu ci.",
                None,
            ),
            AppError::CannotModifyPastVisit => (
                StatusCode::BAD_REQUEST,
                "CANNOT_MODIFY_PAST_VISIT",
                "Impossible d'annuler une visite dont la date est passée.",
                "Bés bi jàll na ba noppi, mënoo ko fey.",
                None,
            ),
            AppError::VisitNotPending => (
                StatusCode::CONFLICT,
                "VISIT_NOT_PENDING",
                "Cette visite a déjà été traitée par le bailleur.",
                "Bailleur bi wax na ci wisaat bi ba noppi.",
                None,
            ),
            AppError::ContentFlaggedContactViolation => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "CONTACT_VIOLATION",
                "Partage de numéro de téléphone non autorisé à ce stade.",
                "Mënoo fi bind nimero telefon léegi.",
                None,
            ),
            AppError::ContratNotFound => (
                StatusCode::NOT_FOUND,
                "CONTRAT_NOT_FOUND",
                "Contrat de bail introuvable.",
                "Gisunu këyitu kër gi.",
                None,
            ),
            AppError::ContractAlreadySigned => (
                StatusCode::CONFLICT,
                "CONTRACT_ALREADY_SIGNED",
                "Ce contrat de bail est déjà signé et certifié.",
                "Këyit gi xaatim nañu ko ba noppi.",
                None,
            ),
            AppError::TenantSignatureMismatch => (
                StatusCode::FORBIDDEN,
                "SIGNATURE_MISMATCH",
                "Seul le locataire du contrat peut apposer sa signature.",
                "Borom këyit bi rek mo ko mëna xaatim.",
                None,
            ),
            AppError::QuittanceNotFound => (
                StatusCode::NOT_FOUND,
                "QUITTANCE_NOT_FOUND",
                "Quittance introuvable ou falsifiée.",
                "Gisunu kayitu fey gi.",
                None,
            ),
            AppError::EcheanceAlreadyPaid => (
                StatusCode::CONFLICT,
                "ECHEANCE_ALREADY_PAID",
                "Cette échéance de loyer a déjà été réglée.",
                "Loyer bi fey nañu ko ba noppi.",
                None,
            ),
            AppError::AmountExceedsRemainingBalance { remaining } => (
                StatusCode::BAD_REQUEST,
                "AMOUNT_EXCEEDS_REMAINING",
                format!("Le montant dépasse le reste dû : {} F CFA", remaining),
                format!("Xaalis bi ëpp na li des : {} F CFA", remaining),
                Some(serde_json::json!({ "remaining": remaining })),
            ),
            AppError::AmountBelowMinimum => (
                StatusCode::BAD_REQUEST,
                "AMOUNT_BELOW_MINIMUM",
                "Le montant minimum d'un versement est de 100 F CFA.",
                "Li gëna néew li ngay mëna fey mooy 100 F CFA.",
                None,
            ),
            AppError::DuplicateTransaction => (
                StatusCode::CONFLICT,
                "DUPLICATE_TRANSACTION",
                "Transaction déjà prise en compte.",
                "Xaalis bi duggu na ba noppi.",
                None,
            ),
            AppError::MissingIdempotencyKey => (
                StatusCode::BAD_REQUEST,
                "MISSING_IDEMPOTENCY_KEY",
                "En-tête Idempotency-Key obligatoire sur cette opération.",
                "Manque na kayitu kaaraange ngir fey gi.",
                None,
            ),
            AppError::OrangeMoneyPaymentDeclined(msg) => (
                StatusCode::BAD_GATEWAY,
                "ORANGE_MONEY_DECLINED",
                format!("Paiement refusé : {}", msg),
                format!("Orange Money nanguwul fey gi : {}", msg),
                None,
            ),
            AppError::SubscriptionRequired => (
                StatusCode::FORBIDDEN,
                "SUBSCRIPTION_REQUIRED",
                "Souscription Bailleur Pro active requise.",
                "Danga wara fay abonnman Bailleur Pro ngir liggéey fi.",
                None,
            ),
            AppError::TrialAlreadyUsed => (
                StatusCode::CONFLICT,
                "TRIAL_ALREADY_USED",
                "L'essai gratuit de 30 jours a déjà été consommé.",
                "30 bés yu amul fey yi jéex nañu ci sa sàq.",
                None,
            ),
            AppError::Minimum4PhotosRequired => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "MINIMUM_4_PHOTOS_REQUIRED",
                "Au moins 4 photos sont obligatoires pour publier une annonce.",
                "Loxol 4 nataal a ciy war bala nga koy wone.",
                None,
            ),
            AppError::DescriptionContainsContactInfo => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "DESCRIPTION_HAS_PHONE",
                "Veuillez retirer tout numéro de téléphone ou lien de la description.",
                "Dindiil nimero telefon yi ci wax ji.",
                None,
            ),
            AppError::DepositExceedsLegalLimit => (
                StatusCode::UNPROCESSABLE_ENTITY,
                "DEPOSIT_TOO_HIGH",
                "La caution ne peut excéder 2 mois de loyer (loi sénégalaise).",
                "Kausion mënul ëpp 2 weeru loyer ci yoonu réew mi.",
                None,
            ),
            AppError::OnlyBailleurCanDeclareCash => (
                StatusCode::FORBIDDEN,
                "ONLY_BAILLEUR_CASH",
                "Seul le bailleur peut valider un paiement en espèces.",
                "Borom kër gi rekk a mëna wax ne jël na xaalis loxo ci loxo.",
                None,
            ),
            AppError::InvalidWebhookSignature => (
                StatusCode::UNAUTHORIZED,
                "INVALID_WEBHOOK_SIGNATURE",
                "Signature HMAC invalide.",
                "Signature bi baaxul.",
                None,
            ),
            AppError::InvalidFileFormatOrSize => (
                StatusCode::BAD_REQUEST,
                "INVALID_FILE",
                "Format non supporté ou fichier supérieur à la limite autorisée.",
                "Kayit bi dafa réy lool mbaa melo bi baaxul.",
                None,
            ),
            AppError::RateLimitExceeded => (
                StatusCode::TOO_MANY_REQUESTS,
                "RATE_LIMIT_EXCEEDED",
                "Trop de requêtes, veuillez ralentir.",
                "Yaa ngi bëss lool, xaaral tuuti.",
                None,
            ),
            AppError::ValidationFailed(details) => (
                StatusCode::BAD_REQUEST,
                "VALIDATION_FAILED",
                format!("Erreur de saisie : {}", details),
                format!("Jum ci bind gi : {}", details),
                None,
            ),
            AppError::Internal(err) => {
                tracing::error!(error = ?err, "Erreur serveur non gérée");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR",
                    "Une erreur imprévue est survenue.".to_string(),
                    "Jafe-jafe am na ci masin bi.".to_string(),
                    None,
                )
            }
        };

        let body = Json(ErrorEnvelope {
            success: false,
            code,
            message: msg_fr.to_string(),
            message_wo: msg_wo.to_string(),
            details,
            request_id: uuid::Uuid::new_v4().to_string(),
        });

        (status, body).into_response()
    }
}
```

---

# SECTION 2 — DTOs DE REQUÊTES AVEC RÈGLES DE VALIDATION STRICTES (`validator`)

Chaque DTO d'entrée utilise `validator` pour vérifier ses champs **avant d'atteindre le cœur métier** :

### 1. `MaxItAuthRequest` (`POST /api/v1/auth/maxit`)
```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct MaxItAuthRequest {
    #[validate(length(min = 10, max = 255, message = "authCode invalide"))]
    pub auth_code: String,
}
```

### 2. `UpdateProfileRequest` (`PATCH /api/v1/me`)
```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct UpdateProfileRequest {
    #[validate(length(min = 2, max = 50))]
    pub first_name: Option<String>,

    #[validate(length(min = 2, max = 50))]
    pub last_name: Option<String>,

    #[validate(email(message = "Format email invalide"))]
    pub email: Option<String>,

    #[validate(regex(path = *REGEX_PHONE_SN, message = "Numéro sénégalais invalide (+221...)"))]
    pub secondary_phone: Option<String>,

    #[validate(custom = "validate_locale")]
    pub preferred_language: Option<String>,
}

lazy_static::lazy_static! {
    static ref REGEX_PHONE_SN: regex::Regex = regex::Regex::new(r"^\+221(70|75|76|77|78)[0-9]{7}$").unwrap();
}

fn validate_locale(locale: &str) -> Result<(), validator::ValidationError> {
    if locale == "fr" || locale == "wo" {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_locale"))
    }
}
```

### 3. `CreateAnnonceRequest` (`POST /api/v1/bailleur/annonces`)
```rust
use serde::Deserialize;
use uuid::Uuid;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CreateAnnonceRequest {
    #[validate(length(min = 5, max = 120, message = "Le titre doit faire entre 5 et 120 caractères"))]
    pub title: String,

    #[validate(
        length(min = 20, max = 2000, message = "La description doit faire entre 20 et 2000 caractères"),
        custom = "validate_no_phone_in_description"
    )]
    pub description: String,

    pub zone_id: String, // ID mnémonique de zone ex: "ouakam", "almadies", "plateau"

    pub logement_type: String, // "chambre", "studio", "appartement", "villa"

    #[validate(range(min = 10000, message = "Le loyer minimum est de 10 000 F CFA"))]
    pub rent_amount: i64,

    #[validate(range(min = 0, message = "La caution ne peut être négative"))]
    pub deposit_amount: i64,

    #[validate(length(min = 4, message = "Au minimum 4 photos réelles sont exigées"))]
    pub photos: Vec<String>,

    pub is_coloc: bool,

    #[validate(range(min = 1, max = 10))]
    pub total_places: Option<i16>,

    pub gender_policy: Option<String>, // "HOMMES_UNIQUEMENT", "FEMMES_UNIQUEMENT", "COUPLES_UNIQUEMENT"
}

fn validate_no_phone_in_description(desc: &str) -> Result<(), validator::ValidationError> {
    let re = regex::Regex::new(r"(?:70|75|76|77|78)[0-9\s.-]{7}").unwrap();
    if re.is_match(desc) {
        return Err(validator::ValidationError::new("contains_contact_info"));
    }
    Ok(())
}
```

### 4. `PayLoyerRequest` (`POST /api/v1/loyers/{id}/pay`)
```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct PayLoyerRequest {
    #[validate(range(min = 100, message = "Le montant minimum de paiement est de 100 F CFA"))]
    pub amount: i64,

    #[validate(custom = "validate_payment_method")]
    pub payment_method: String, // "maxit"
}

fn validate_payment_method(method: &str) -> Result<(), validator::ValidationError> {
    if method == "maxit" {
        Ok(())
    } else {
        Err(validator::ValidationError::new("invalid_payment_method"))
    }
}
```

### 5. `CashPaymentDeclarationRequest` (`POST /api/v1/bailleur/echeances/{id}/cash-payments`)
```rust
use serde::Deserialize;
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct CashPaymentDeclarationRequest {
    #[validate(range(min = 100, message = "Montant d'espèces invalide"))]
    pub amount_received: i64,

    #[validate(length(max = 250))]
    pub notes: Option<String>,
}
```

---

# SECTION 3 — OPÉRATIONS CRITIQUES : REQUÊTES SQLX & VERROUS REDIS

---

### A. Verrou 15 min Atomique de Lit (`lock:place:{id}:{placeNumber}`)
```rust
use deadpool_redis::Pool;
use redis::AsyncCommands;
use uuid::Uuid;

pub async fn lock_bed_in_redis(
    redis_pool: &Pool,
    logement_id: Uuid,
    place_number: u8,
    user_id: Uuid,
) -> Result<(), AppError> {
    let key = format!("lock:place:{}:{}", logement_id, place_number);
    let mut conn = redis_pool.get().await.map_err(|e| anyhow::anyhow!(e))?;

    // Exécute atomiquement SET key user_id NX EX 900
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
        return Err(AppError::BedAlreadyLocked {
            remaining_seconds: ttl,
        });
    }

    Ok(())
}
```

---

### B. Rachat Exclusif Solo & Remboursement 100% Intégral des Colocataires
```rust
use sqlx::{PgPool, Postgres, Transaction};
use uuid::Uuid;

pub async fn execute_solo_privatization_tx(
    pool: &PgPool,
    logement_id: Uuid,
    solo_buyer_id: Uuid,
) -> Result<Vec<Uuid>, AppError> {
    let mut tx: Transaction<'_, Postgres> = pool.begin().await
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

    // 2. Récupération des colocataires ayant déjà versé un acompte
    let other_tenants = sqlx::query!(
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

    // 3. Injection dans la file de remboursement 100% sans pénalité
    for tenant in other_tenants {
        sqlx::query!(
            r#"
            INSERT INTO notifications_outbox (id, channel, recipient, payload, status, created_at)
            VALUES ($1, 'sms', (SELECT phone FROM users WHERE id = $2), $3, 'pending', NOW())
            "#,
            Uuid::new_v4(),
            tenant.payer_id,
            serde_json::json!({
                "message_fr": "Votre acompte de colocation a été intégralement remboursé à 100% suite à la privatisation de la chambre.",
                "message_wo": "Xaalis bi nga feyoon ci néeg bi dagnu la ko dellu 100% ndax kenn nit a ko jël."
            })
        )
        .execute(&mut *tx)
        .await
        .map_err(|e| anyhow::anyhow!(e))?;

        refunded_users.push(tenant.payer_id);
    }

    // 4. Bascule du logement en occupation solo privée
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
```

---

# SECTION 4 — INSTRUCTIONS POUR L'AGENT IA D'IMPLÉMENTATION

Quand une IA génère le code Rust sur cette base :
1. **Zéro `unwrap()` ou `expect()` en production** : Toutes les erreurs d'entrée/sortie doivent être mappées vers `AppError`.
2. **Types d'argent stricts** : Tout montant est manipulé sous forme de `i64` en FCFA, jamais de flottant (`f32` ou `f64`).
3. **Compilation vérifiée par `sqlx`** : Utiliser la macro `query!` ou `query_as!` pour que le compilateur Rust teste chaque requête contre PostgreSQL.
4. **Idempotence systématique** : Sur chaque route de modification financière, extraire l'en-tête `Idempotency-Key` et vérifier l'absence de rejouement.

