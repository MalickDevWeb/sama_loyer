# Guide d'Implémentation Backend en Rust — SAMA LOYER

Ce dossier contient la spécification technique et l'architecture complète pour développer le backend de **SAMA LOYER en Rust**.

L'architecture retenue est une **Clean Architecture / Architecture Hexagonale (DDD)** modulaire, garantissant :
- Le respect absolu des invariants financiers (paiements Orange Money sans double débit).
- La gestion sans faille de la concurrence (verrous atomiques 15 min sur les places de colocation).
- Le découpage clair en modules métier : **Module Client (Locataire)**, **Module Bailleur** et **Module Shared (Transverse)**.

---

## 📚 Sommaire des Modules d'Architecture

| Document | Description | Cibles & Responsabilités |
| :--- | :--- | :--- |
| **[00. Architecture Globale & Conventions](00-architecture-globale.md)** | Structure du Workspace Cargo, standards de communication HTTP, conventions JSON, typage fort et stack technologique. | Architecture générale, Lead Dev |
| **[01. Module Shared (Transverse)](01-module-shared.md)** | Authentification Max It (OAuth / JWT), Idempotence, Webhooks HMAC Orange Money, Uploads de documents (COS), Gestion unifiée des erreurs, Audit et **matrice complète des contraintes par endpoint**. | Infrastructure, Sécurité, Paiements |
| **[02. Module Client (Locataire)](02-module-client.md)** | Recherche de logements, Moteur de Colocation Progressive (verrou 15 min, genres stricts, rachat solo 100%), Visites, Messagerie, Loyers, Quittances et **matrice complète des contraintes par endpoint**. | Équipe Produit Locataire |
| **[03. Module Bailleur](03-module-bailleur.md)** | Gestion des annonces, Souscription Pro (30j d'essai), Validation des créneaux de visite, Encaissement espèces (Cash payments), Gestion locative et **matrice complète des contraintes par endpoint**. | Équipe Produit Bailleur |
| **[04. Spécification Exhaustive : Tables & Fichiers](04-specification-complete-fichiers-et-tables.md)** | **Bible d'implémentation** : 30+ tables détaillées (colonnes, types SQL & Rust, clés étrangères, index partiels, héritage) et arborescence exhaustive de tous les fichiers Rust à créer. | Tous les développeurs Backend Rust |

---

## 🔒 Matrice Synthétique des Dépendances & Invariants Inter-Endpoints

Chaque endpoint applique des règles strictes qui dépendent de l'état des autres entités :

| Endpoint Cible | Pré-requis & Dépendances Obligatoires | Contraintes d'État & Rejets |
| :--- | :--- | :--- |
| `POST /places/{num}/lock` | Requiert un logement avec `is_coloc = true` et `status = 'ONLINE'`. | Rejet si déjà verrouillé (`409 BED_ALREADY_LOCKED`) ou genre incompatible avec le groupe (`403 GENDER_POLICY_VIOLATION`). |
| `POST /privatize-solo` | Requiert `is_coloc = true` et transaction pessimiste `SELECT FOR UPDATE`. | Déclenche automatiquement le **remboursement à 100% sans frais** de tous les autres colocataires (`SOLO_BUYOUT_100_PERCENT_REFUND`). |
| `POST /contrats/{id}/sign` | Requiert un contrat en statut `pending_signature` et CNI validée (`kyc_status = 'VERIFIED'`). | Rejet si locataire non vérifié (`403 KYC_VERIFICATION_REQUIRED`) ou contrat déjà signé (`409`). |
| `POST /loyers/{id}/pay` | Contrat parent doit être `active` ou `notice`. Échéance doit être `pending`, `partial` ou `late`. | Rejet si montant dépasse le solde restant dû (`400`) ou si déjà acquitté (`409`). Émet quittance finale seulement à solde 0. |
| `POST /bailleur/annonces` | Le bailleur doit avoir une souscription active (`TRIAL_ACTIVE` ou `PRO_ACTIVE`). | Rejet si abonnement expiré (`403 SUBSCRIPTION_REQUIRED`), moins de 4 photos (`422`) ou présence de coordonnées masquées (`422`). |
| `POST /bailleur/visites/{id}/accept` | La visite doit être en statut `pending` et créneau futur (`slot_time > NOW()`). | Déverrouille et révèle l'adresse complète et les numéros de téléphone des deux parties. Auto-rejet si non répondu à J-48h. |
| `POST /bailleur/echeances/{id}/cash-payments` | **Seul** le bailleur propriétaire du contrat peut l'exécuter. | Rejet si exécuté par le locataire (`403`), si l'échéance est déjà payée (`409`) ou si le montant dépasse le solde dû (`400`). |
| `POST /webhooks/maxit` | Requiert en-tête `X-Sonatel-Signature` validé par HMAC-SHA256. | Idempotence absolue par `transactionId` : rejet ou ack silencieux si déjà traité (anti-rejouement). |

---

## 🛠️ Stack Technologique de Référence

- **Runtime & Serveur Web** : `tokio` (multi-thread async) + `axum 0.7+`
- **Base de Données** : `sqlx 0.8+` (PostgreSQL 15+ avec vérification des requêtes à la compilation)
- **Cache & Verrous Distribués** : `deadpool-redis` + `redis-rs`
- **Sérialisation & Validation** : `serde`, `serde_json`, `validator`
- **Sécurité & Cryptographie** : `jsonwebtoken` (RS256/HS256), `sha2`, `hmac`, `hex`
- **Observabilité & Logs** : `tracing`, `tracing-subscriber`, métriques Prometheus

