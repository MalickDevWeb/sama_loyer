# 00 — Architecture Globale & Conventions Rust

## 1. Principes d'Ingénierie & Clean Architecture

L'architecture du backend SAMA LOYER en Rust repose sur les principes de la **Clean Architecture** et du **Domain-Driven Design (DDD)**. Le code est organisé pour isoler complètement les règles métier de l'infrastructure externe (base de données, API externes Sonatel, protocoles de transport).

```
                      ┌───────────────────────────────────────┐
                      │             API / Web Layer           │
                      │   (Axum Handlers, DTOs, Middleware)   │
                      └──────────────────┬────────────────────┘
                                         │ depends on
                      ┌──────────────────▼────────────────────┐
                      │          Application Layer            │
                      │  (Use Cases, Commands, Queries, Ports)│
                      └──────────────────┬────────────────────┘
                                         │ depends on
                      ┌──────────────────▼────────────────────┐
                      │             Domain Layer              │
                      │ (Entities, Value Objects, Invariants) │
                      └───────────────────────────────────────┘
                                         ▲
                                         │ implements ports
                      ┌──────────────────┴────────────────────┐
                      │         Infrastructure Layer          │
                      │ (SQLx Postgres, Redis, Max It Client) │
                      └───────────────────────────────────────┘
```

---

## 2. Structure du Workspace Cargo

Le backend est structuré en **Workspace Cargo multi-crates** pour garantir un découpage strict et un temps de compilation optimisé :

```text
sama-loyer-backend/
├── Cargo.toml                      # Workspace Cargo racine
├── crates/
│   ├── shared/                     # Types universels, erreurs, utilitaires communs
│   │   ├── src/
│   │   │   ├── money.rs            # Value Object Monnaie (XOF)
│   │   │   ├── phone.rs            # Numéro SN (+221...)
│   │   │   ├── envelope.rs         # Enveloppe JSON API { success, data, meta }
│   │   │   └── error.rs            # AppError unifié & IntoResponse
│   │   └── Cargo.toml
│   │
│   ├── domain/                     # Cœur métier (Zéro dépendance d'entrée/sortie)
│   │   ├── src/
│   │   │   ├── client/             # Entités: Coloc, Visite, Recherche, Favoris
│   │   │   ├── bailleur/           # Entités: Annonce, AbonnementPro, CashPayment
│   │   │   ├── contrat/            # Entités: Bail, Loyer, Quittance
│   │   │   └── invariants.rs       # Règles strictes (coloc genre, calculs)
│   │   └── Cargo.toml
│   │
│   ├── application/                # Cas d'utilisation et ports
│   │   ├── src/
│   │   │   ├── client/             # Use cases locataire (LockBed, PrivatizeRoom...)
│   │   │   ├── bailleur/           # Use cases bailleur (PublishListing, ConfirmVisit...)
│   │   │   ├── shared/             # AuthUseCase, WebhookUseCase
│   │   │   └── ports/              # Traits (Repositories, PaymentGateway, LockService)
│   │   └── Cargo.toml
│   │
│   ├── infrastructure/             # Implémentations concrètes
│   │   ├── src/
│   │   │   ├── persistence/        # Repositories SQLx PostgreSQL
│   │   │   ├── redis_service/      # Distributed Lock (15 min) et Cache
│   │   │   ├── sonatel_client/     # Client HTTP Sonatel Max It / Orange Money
│   │   │   └── cos_storage/        # Stockage de fichiers CNI/Baux (Tencent COS / S3)
│   │   └── Cargo.toml
│   │
│   └── api/                        # Serveur HTTP Axum
│       ├── src/
│       │   ├── routes/             # Déclaration des routes (/client, /bailleur, /shared)
│       │   ├── handlers/           # Contrôleurs HTTP découplés par module
│       │   ├── middleware/         # Auth JWT, Idempotency, Language, RateLimiting
│       │   └── main.rs             # Point d'entrée de l'application
│       └── Cargo.toml
```

---

## 3. Conventions de Communication HTTP & JSON

### A. Format Standard d'Échange

Toutes les routes de l'API SAMA LOYER renvoient obligatoirement le format d'enveloppe standardisé :

#### Réponse de Succès (`ApiResponse<T>`)
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

#### Réponse d'Erreur (`ApiErrorResponse`)
```json
{
  "success": false,
  "code": "BED_ALREADY_LOCKED",
  "message": "Cette place est actuellement réservée par un autre colocataire.",
  "details": {
    "expiresInSeconds": 412
  },
  "requestId": "req_01HV8Z7..."
}
```

---

### B. En-têtes HTTP Requis

| En-tête | Type | Description |
| :--- | :--- | :--- |
| `Authorization` | `Bearer <JWT>` | Jeton de session utilisateur (obligatoire sur les routes protégées). |
| `Idempotency-Key` | `UUID v4` | Obligatoire sur tous les `POST` critiques (`/pay`, `/reserve`, `/lock`, `/privatize-solo`). |
| `Accept-Language` | `fr` ou `wo` | Permet au backend de traduire automatiquement les libellés et messages en Wolof ou Français. |
| `X-Request-Id` | `UUID v4` | Identifiant unique de corrélation pour les logs distribués (`tracing`). |

---

## 4. Gestion Globale des Erreurs en Rust

Les erreurs applicatives sont modélisées via `thiserror` dans le crate `shared` et implémentent directement `axum::response::IntoResponse` :

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
    #[error("Non autorisé")]
    Unauthorized,

    #[error("Ressource non trouvée : {0}")]
    NotFound(String),

    #[error("Conflit : {0}")]
    Conflict(String),

    #[error("Violation de règle métier : {0}")]
    BusinessRuleViolation(String),

    #[error("Erreur de paiement : {0}")]
    PaymentError(String),

    #[error("Erreur interne")]
    Internal(#[from] anyhow::Error),
}

#[derive(Serialize)]
struct ErrorBody {
    success: bool,
    code: &'static str,
    message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    details: Option<serde_json::Value>,
    request_id: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match &self {
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", self.to_string()),
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg.clone()),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, "CONFLICT", msg.clone()),
            AppError::BusinessRuleViolation(msg) => (StatusCode::UNPROCESSABLE_ENTITY, "BUSINESS_RULE_VIOLATION", msg.clone()),
            AppError::PaymentError(msg) => (StatusCode::BAD_GATEWAY, "PAYMENT_GATEWAY_ERROR", msg.clone()),
            AppError::Internal(err) => {
                tracing::error!(error = ?err, "Erreur serveur non gérée");
                (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "Une erreur inattendue est survenue.".to_string())
            }
        };

        let body = Json(ErrorBody {
            success: false,
            code,
            message,
            details: None,
            request_id: uuid::Uuid::new_v4().to_string(),
        });

        (status, body).into_response()
    }
}
```

