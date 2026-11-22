# 04 — Spécification Exhaustive : Tables, Relations & Fichiers Rust

Ce document constitue la **bible d'implémentation absolue** du backend SAMA LOYER en Rust. Il détaille :
1. **La modélisation exhaustive de chaque table** de la base de données (colonnes, types SQL & Rust, clés primaires/étrangères, contraintes `CHECK`, index partiels, règles d'héritage et d'immuabilité).
2. **L'arborescence complète fichier par fichier** pour chaque module (`shared`, `client`, `bailleur`) avec les structures, traits, méthodes et invariants à coder.

---

# SECTION I — MODÉLISATION EXHAUSTIVE DE TOUTES LES TABLES

---

## 1. Module Shared (Transverse, Identité & Plateforme)

### Table 1.1 : `users` (Compte Unique Utilisateur)
*Pattern d'héritage : Racine polymorphique (un locataire peut devenir bailleur sans créer de second compte).*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identifiant unique interne. |
| `maxit_user_id` | `TEXT` | `String` | Non | `UNIQUE` | Identifiant stable fourni par le SDK Max It. |
| `phone` | `TEXT` | `String` | Non | `UNIQUE, CHECK (phone ~ '^\+221[0-9]{9}$')` | Numéro MSISDN normalisé E.164 (+221...). |
| `full_name` | `TEXT` | `String` | Non | Non vide (min 2 chars) | Nom et prénom de l'utilisateur. |
| `city` | `TEXT` | `Option<String>` | Oui | `DEFAULT 'Dakar'` | Ville de résidence. |
| `locale` | `locale_code` | `enum LocaleCode { Fr, Wo }` | Non | `DEFAULT 'fr'` | Langue préférée (Français ou Wolof). |
| `avatar_url` | `TEXT` | `Option<String>` | Oui | NULL | URL COS de la photo de profil. |
| `phone_verified` | `BOOLEAN` | `bool` | Non | `DEFAULT TRUE` | Vérifié par le réseau télécom Orange. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Horodatage de création. |
| `updated_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Horodatage de dernière modification. |
| `deleted_at` | `TIMESTAMPTZ` | `Option<DateTime<Utc>>` | Oui | NULL | Soft delete (suppression logique). |

- **Règles de Modélisation & Invariants** :
  - **Immuabilité du téléphone** : `phone` et `maxit_user_id` ne peuvent jamais être altérés après insertion.
  - **Unicité** : Un seul compte par MSISDN physique.

---

### Table 1.2 : `refresh_tokens` (Sessions Réseau Sécurisées)
*Gestion de la rotation des tokens JWT avec détection de vol de session.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | Identifiant de session. |
| `user_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id) ON DELETE CASCADE` | Propriétaire de la session. |
| `token_hash` | `TEXT` | `String` | Non | `UNIQUE` | Empreinte SHA-256 du Refresh Token. |
| `expires_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | Date future | Expiration (30 jours). |
| `revoked_at` | `TIMESTAMPTZ` | `Option<DateTime<Utc>>` | Oui | NULL | Révocation explicite (logout ou rotation). |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date d'émission. |

- **Règle de Modélisation** : Index partiel `CREATE INDEX ON refresh_tokens(user_id) WHERE revoked_at IS NULL`.

---

### Table 1.3 : `app_settings` (Configuration Dynamique Back-Office)
*Table clé-valeur pilotée par le back-office sans re-déploiement de code.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `key` | `TEXT` | `String` | Non | `PRIMARY KEY` | Clé technique (`rules.reportsBeforeSuspension`, etc.). |
| `value` | `JSONB` | `serde_json::Value` | Non | JSON valide | Valeur typée (seuil, tarif, délai). |
| `description` | `TEXT` | `Option<String>` | Oui | NULL | Explication fonctionnelle pour les admins. |
| `updated_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date de dernière mise à jour. |

---

### Table 1.4 : `audit_logs` (Piste d'Audit Immuable)
*Journalisation inviolable de toutes les actions sensibles (Paiements, Bannissements, Validations).*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID de l'entrée d'audit. |
| `admin_user_id` | `UUID` | `Option<uuid::Uuid>` | Oui | `REFERENCES admin_users(id)` | Administrateur ayant agi. |
| `user_id` | `UUID` | `Option<uuid::Uuid>` | Oui | `REFERENCES users(id)` | Utilisateur impacté. |
| `action` | `TEXT` | `String` | Non | Non vide | Code d'action (`APPROVE_LISTING`, `SUSPEND_USER`, etc.). |
| `entity_type` | `TEXT` | `String` | Non | Non vide | Type d'entité modifiée (`logements`, `users`, etc.). |
| `entity_id` | `UUID` | `uuid::Uuid` | Non | Non nul | UUID de l'entité concernée. |
| `changes` | `JSONB` | `serde_json::Value` | Oui | Snapshot `{ before, after }` | Diff avant / après l'opération. |
| `ip_address` | `INET` | `Option<std::net::IpAddr>`| Oui | NULL | Adresse IP source. |
| `user_agent` | `TEXT` | `Option<String>` | Oui | NULL | Signature du client HTTP. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date certifiée non modifiable. |

- **Règle d'Immuabilité** : Table en **Append-Only** strict (aucun `UPDATE` ni `DELETE` n'est autorisé au niveau des droits PostgreSQL).

---

### Table 1.5 : `notifications_outbox` (File Transactionnelle d'Envois SMS / Push)
*Pattern Transactional Outbox pour garantir l'envoi fiable des messages même en cas de crash réseau.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID d'envoi. |
| `channel` | `TEXT` | `String` | Non | `CHECK (channel IN ('sms', 'push', 'event'))` | Canal de diffusion. |
| `recipient` | `TEXT` | `String` | Non | Numéro MSISDN ou User ID | Destinataire du message. |
| `payload` | `JSONB` | `serde_json::Value` | Non | JSON valide | Corps du message et variables du template. |
| `status` | `TEXT` | `String` | Non | `DEFAULT 'pending'` | `pending`, `sent`, `failed`. |
| `retry_count` | `INTEGER` | `i32` | Non | `DEFAULT 0` | Nombre de tentatives d'expédition. |
| `next_retry_at`| `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Horodatage de la prochaine tentative. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date d'insertion. |

---

### Table 1.6 : `reports` (Signalements et Alertes Litiges)

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID signalement. |
| `reporter_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id) ON DELETE RESTRICT` | Auteur du signalement. |
| `target_type` | `report_target` | `enum ReportTarget { Logement, User }` | Non | Enum | Cible du signalement. |
| `target_id` | `UUID` | `uuid::Uuid` | Non | Non nul | UUID du logement ou de l'utilisateur. |
| `reason` | `TEXT` | `String` | Non | Non vide | Motif du signalement. |
| `description` | `TEXT` | `String` | Non | Non vide | Explication détaillée du plaignant. |
| `priority` | `report_priority`| `enum ReportPriority { Urgent, Medium, Low }` | Non | `DEFAULT 'medium'` | Degré d'urgence. |
| `status` | `report_status` | `enum ReportStatus { New, InProgress, Resolved, Dismissed }` | Non | `DEFAULT 'new'` | État d'avancement du traitement. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date de création. |

---

### Table 1.7 : `admin_roles` & Table 1.8 : `admin_users` (Gestion RBAC du Back-Office)

- **`admin_roles`** : `id UUID PRIMARY KEY`, `name TEXT UNIQUE`, `permissions JSONB NOT NULL`.
- **`admin_users`** : `id UUID PRIMARY KEY`, `role_id UUID REFERENCES admin_roles(id)`, `email TEXT UNIQUE`, `password_hash TEXT` (Argon2id), `full_name TEXT`, `status TEXT DEFAULT 'active'`.

---

### Table 1.9 : `support_tickets` (Gestion des Réclamations)

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | Numéro de ticket. |
| `user_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id)` | Utilisateur à l'origine du ticket. |
| `subject` | `TEXT` | `String` | Non | Non vide | Objet de la réclamation. |
| `category` | `TEXT` | `String` | Non | Non vide | Catégorie (`PAIEMENT`, `CONTRAT`, `LITIGE_BAILLEUR`). |
| `status` | `TEXT` | `String` | Non | `DEFAULT 'open'` | `open`, `pending`, `closed`. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date d'ouverture. |

---

## 2. Module Client (Locataire, Catalogue, Colocation & Baux)

### Table 2.1 : `zones` & Table 2.2 : `zone_neighbours` (Référentiel Territorial)
- **`zones`** : `id UUID PRIMARY KEY`, `code TEXT UNIQUE`, `name TEXT NOT NULL`, `city TEXT DEFAULT 'Dakar'`, `latitude DOUBLE PRECISION`, `longitude DOUBLE PRECISION`.
- **`zone_neighbours`** : `(zone_id UUID, neighbour_zone_id UUID) PRIMARY KEY` (pour élargir la recherche géographique aux quartiers adjacents).

---

### Table 2.3 : `amenities` & Table 2.4 : `logement_amenities` (Équipements)
- **`amenities`** : `id UUID PRIMARY KEY`, `code TEXT UNIQUE`, `label_fr TEXT`, `label_wo TEXT` (libellé en wolof), `icon_url TEXT`.
- **`logement_amenities`** : `(logement_id UUID, amenity_id UUID) PRIMARY KEY`.

---

### Table 2.5 : `logements` (Biens Immobiliers & Colocations)
*Entité centrale du catalogue avec machine d'état stricte.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID du logement. |
| `bailleur_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES bailleur_profiles(user_id) ON DELETE RESTRICT` | Propriétaire bailleur. |
| `zone_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES zones(id) ON DELETE RESTRICT` | Zone/Quartier. |
| `type` | `logement_type` | `enum LogementType` | Non | `'chambre'`, `'studio'`, etc. | Typologie architecturale. |
| `title` | `TEXT` | `String` | Non | 5 à 120 caractères | Titre de l'annonce. |
| `description` | `TEXT` | `String` | Non | Sans numéros de téléphone | Description détaillée. |
| `rent_amount` | `BIGINT` | `i64` | Non | `CHECK (rent_amount >= 10000)` | Loyer mensuel en XOF (sans centimes). |
| `deposit_amount`| `BIGINT` | `i64` | Non | `CHECK (deposit_amount <= rent_amount * 2)` | Caution légale (max 2 mois). |
| `fees_amount` | `BIGINT` | `i64` | Non | `DEFAULT 0` | Frais de dossier / agence. |
| `is_coloc` | `BOOLEAN` | `bool` | Non | `DEFAULT FALSE` | Activation du mode Colocation. |
| `total_places` | `SMALLINT` | `i16` | Non | `DEFAULT 1, CHECK (total_places BETWEEN 1 AND 10)` | Nombre total de lits/places. |
| `gender_policy` | `TEXT` | `Option<String>` | Oui | `CHECK (gender_policy IN ('HOMMES_UNIQUEMENT', 'FEMMES_UNIQUEMENT', 'COUPLES_UNIQUEMENT'))` | Règle stricte du Prompt Maître. |
| `status` | `logement_status`| `enum LogementStatus`| Non | `DEFAULT 'draft'` | Machine d'état (`draft`, `online`, etc.). |
| `place_label` | `TEXT` | `String` | Non | Non vide | Libellé public (« Ouakam, Cité Avion »). |
| `address_detail`| `TEXT` | `String` | Non | Masqué publiquement | Adresse précise (déverrouillée après visite). |
| `latitude` | `DOUBLE PRECISION`| `f64` | Non | Coordonnée GPS | Positionnement cartographique. |
| `longitude` | `DOUBLE PRECISION`| `f64` | Non | Coordonnée GPS | Positionnement cartographique. |
| `deleted_at` | `TIMESTAMPTZ` | `Option<DateTime<Utc>>` | Oui | NULL | Soft delete. |

---

### Table 2.6 : `logement_media` (Photos & Vidéos avec Hachage Perceptuel)

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID du média. |
| `logement_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES logements(id) ON DELETE CASCADE` | Logement associé. |
| `kind` | `media_kind` | `enum MediaKind { Photo, Video }` | Non | `DEFAULT 'photo'` | Type de média. |
| `url` | `TEXT` | `String` | Non | URL HTTPS COS valide | Emplacement du fichier. |
| `sort_order` | `SMALLINT` | `i16` | Non | `DEFAULT 0` | Ordre d'affichage (0 = photo de couverture). |
| `perceptual_hash`| `TEXT` | `Option<String>` | Oui | Empreinte dHash/pHash | Détection anti-doublon d'annonces frauduleuses. |

---

### Table 2.7 : `favoris` (Mise en Favoris Locataire)
- **`favoris`** : `(user_id UUID REFERENCES users(id), logement_id UUID REFERENCES logements(id), created_at TIMESTAMPTZ DEFAULT now()) PRIMARY KEY`.

---

### Table 2.8 : `visites` (Demandes et Rendez-vous de Visite)
*Machine d'état du cycle de visite avec auto-rejet à 48h.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID de la visite. |
| `logement_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES logements(id) ON DELETE RESTRICT` | Logement visité. |
| `locataire_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id) ON DELETE RESTRICT` | Locataire demandeur. |
| `slot_time` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | Date future | Horodatage exact de la visite. |
| `status` | `visite_status` | `enum VisiteStatus` | Non | `DEFAULT 'pending'` | `pending`, `accepted`, `rejected`, `done`. |
| `response_note` | `TEXT` | `Option<String>` | Oui | NULL | Justification en cas de refus. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date de la demande. |

- **Index Unique Partiel** : `CREATE UNIQUE INDEX idx_single_active_visit ON visites(locataire_id, logement_id) WHERE status IN ('pending', 'accepted');` (empêche les demandes multiples en doublon).

---

### Table 2.9 : `conversations` & Table 2.10 : `messages` (Messagerie Directe Sécurisée)
- **`conversations`** : `id UUID PRIMARY KEY`, `logement_id UUID REFERENCES logements(id)`, `locataire_id UUID REFERENCES users(id)`, `bailleur_id UUID REFERENCES users(id)`, `last_message_at TIMESTAMPTZ`.
- **`messages`** : `id UUID PRIMARY KEY`, `conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE`, `sender_id UUID REFERENCES users(id)`, `kind message_kind DEFAULT 'text'`, `body TEXT NOT NULL`, `created_at TIMESTAMPTZ DEFAULT now()`.

---

### Table 2.11 : `contrat_templates` (Modèles Juridiques Versionnés)
*Stockage des clauses légales immuables (v1, v2...).*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID du template. |
| `version` | `TEXT` | `String` | Non | `UNIQUE` (ex: `'v1.0-sn'`) | Version juridique du contrat. |
| `body_markdown`| `TEXT` | `String` | Non | Texte juridique avec placeholders | Contenu du bail type sénégalais. |
| `is_active` | `BOOLEAN` | `bool` | Non | `DEFAULT TRUE` | Version active actuelle. |

---

### Table 2.12 : `contrats` (Baux de Location Scellés & Numériques)

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID du contrat. |
| `contract_number`| `TEXT` | `String` | Non | `UNIQUE` (format: `SL-2026-11-0001`) | Numéro de bail officiel. |
| `logement_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES logements(id) ON DELETE RESTRICT` | Logement loué. |
| `locataire_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id) ON DELETE RESTRICT` | Locataire titulaire. |
| `bailleur_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id) ON DELETE RESTRICT` | Bailleur bailleur. |
| `template_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES contrat_templates(id)` | Template juridique utilisé. |
| `status` | `contrat_status`| `enum ContratStatus`| Non | `DEFAULT 'draft'` | `draft`, `pending_signature`, `active`... |
| `rent_amount` | `BIGINT` | `i64` | Non | Non nul | Loyer contractuel scellé. |
| `deposit_amount`| `BIGINT` | `i64` | Non | Non nul | Caution séquestrée. |
| `articles_snapshot`| `JSONB` | `serde_json::Value` | Non | JSON complet | Texte exhaustif du contrat scellé. |
| `content_hash` | `TEXT` | `String` | Non | Hash SHA-256 | Empreinte d'inviolabilité du document. |
| `bailleur_signed_at`| `TIMESTAMPTZ`| `DateTime<Utc>`| Non | Date publication annonce | Pré-signature du bailleur. |
| `locataire_signed_at`| `TIMESTAMPTZ`| `Option<DateTime<Utc>>`| Oui | Date signature locataire | Signature du locataire dans l'appli. |
| `start_date` | `DATE` | `chrono::NaiveDate` | Non | Début du bail | Prise d'effet du bail. |
| `duration_months`| `SMALLINT`| `i16` | Non | `DEFAULT 12, CHECK (duration_months >= 6)`| Durée légale (min 6 mois). |

---

### Table 2.13 : `echeances` (Dettes Locatives : Entrées & Loyers Mensuels)
*Pattern Discriminator (`kind = 'entry'` vs `kind = 'rent'`).*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID de l'échéance. |
| `contrat_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES contrats(id) ON DELETE RESTRICT` | Bail lié. |
| `kind` | `echeance_kind` | `enum EcheanceKind { Entry, Rent }`| Non | Discriminant | Type d'échéance. |
| `label` | `TEXT` | `String` | Non | Non vide | Ex: `'Frais d''entrée'` ou `'Loyer Novembre 2026'`. |
| `amount_total` | `BIGINT` | `i64` | Non | `CHECK (amount_total > 0)` | Montant total dû en XOF. |
| `amount_paid` | `BIGINT` | `i64` | Non | `DEFAULT 0, CHECK (amount_paid <= amount_total)` | Montant déjà encaissé (tranches). |
| `due_date` | `DATE` | `chrono::NaiveDate` | Non | Date limite | Date limite d'exigibilité. |
| `status` | `echeance_status`| `enum EcheanceStatus` | Non | `DEFAULT 'pending'` | `pending`, `partial`, `paid`, `late`. |

---

### Table 2.14 : `payments` (Mouvements Financiers Orange Money / Espèces)
*Journalisation immuable de chaque tentative et succès de paiement.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID de transaction. |
| `echeance_id` | `UUID` | `Option<uuid::Uuid>` | Oui | `REFERENCES echeances(id)` | Échéance acquittée. |
| `user_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES users(id)` | Utilisateur débiteur. |
| `amount` | `BIGINT` | `i64` | Non | `CHECK (amount > 0)` | Montant débité en XOF. |
| `purpose` | `payment_purpose`| `enum PaymentPurpose` | Non | Enum | `rent`, `entry`, `subscription`, `boost`. |
| `method` | `payment_method` | `enum PaymentMethod` | Non | Enum | `'maxit'` (Orange Money) ou `'cash'`. |
| `status` | `payment_status` | `enum PaymentStatus` | Non | `DEFAULT 'pending'` | `pending`, `succeeded`, `failed`. |
| `maxit_txnid` | `TEXT` | `Option<String>` | Oui | `UNIQUE` | Identifiant de transaction Orange Money. |
| `idempotency_key`| `TEXT` | `String` | Non | `UNIQUE` | Clé d'idempotence du client. |
| `confirmed_at` | `TIMESTAMPTZ` | `Option<DateTime<Utc>>` | Oui | NULL | Date de confirmation télécom. |

---

### Table 2.15 : `quittances` (Preuves Officielles de Paiement Anti-Fraude)
*Document certifié avec QR Code public.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID quittance. |
| `payment_id` | `UUID` | `uuid::Uuid` | Non | `UNIQUE REFERENCES payments(id)` | Transaction parente. |
| `echeance_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES echeances(id)` | Échéance soldée. |
| `contrat_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES contrats(id)` | Bail associé. |
| `verify_code` | `TEXT` | `String` | Non | `UNIQUE` (ex: `QT-8F3A2B1C-202611`) | Code d'authenticité vérifiable publiquement. |
| `pdf_url` | `TEXT` | `Option<String>` | Oui | URL COS | Fichier PDF généré avec sceau numérique. |
| `is_final` | `BOOLEAN` | `bool` | Non | `DEFAULT TRUE` | `true` si solde complet, `false` si acompte. |
| `created_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | `DEFAULT now()` | Date d'émission certifiée. |

---

### Table 2.16 : `incidents` (Signalement des Problèmes Logement / Clés / Plomberie)
- **`incidents`** : `id UUID PRIMARY KEY`, `contrat_id UUID REFERENCES contrats(id)`, `reporter_id UUID REFERENCES users(id)`, `category incident_category NOT NULL`, `description TEXT NOT NULL`, `photos JSONB`, `status incident_status DEFAULT 'open'`, `created_at TIMESTAMPTZ DEFAULT now()`.

---

## 3. Module Bailleur (Propriétaire, Abonnements & Horaires)

### Table 3.1 : `bailleur_profiles` (Extension de Profil Bailleur)
*Héritage 1-à-1 avec la table `users`.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `user_id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY REFERENCES users(id) ON DELETE RESTRICT` | Lien 1-à-1 vers l'utilisateur de base. |
| `company_name` | `TEXT` | `Option<String>` | Oui | NULL | Raison sociale si agence immobilière. |
| `cni_number` | `TEXT` | `Option<String>` | Oui | Format CNI SN | Numéro d'identité nationale. |
| `cni_recto_url` | `TEXT` | `Option<String>` | Oui | Bucket privé COS | Document CNI Recto. |
| `cni_verso_url` | `TEXT` | `Option<String>` | Oui | Bucket privé COS | Document CNI Verso. |
| `verification_status`| `bailleur_verification`| `enum BailleurVerification`| Non | `DEFAULT 'pending'` | `pending`, `active`, `suspended`, `rejected`. |
| `verification_level` | `verification_level` | `enum VerificationLevel` | Non | `DEFAULT 'declared'` | Badge de confiance affiché sur les annonces. |
| `verified_at` | `TIMESTAMPTZ` | `Option<DateTime<Utc>>` | Oui | NULL | Date de validation KYC par l'administrateur. |

---

### Table 3.2 : `subscriptions` (Abonnements Pack Pro & Essai 30 Jours)
*Gestion de l'accès payant à l'espace bailleur.*

| Colonne | Type SQL | Type Rust | Nullable | Contrainte / Défaut | Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | `uuid::Uuid` | Non | `PRIMARY KEY DEFAULT gen_random_uuid()` | ID de souscription. |
| `bailleur_id` | `UUID` | `uuid::Uuid` | Non | `REFERENCES bailleur_profiles(user_id) ON DELETE RESTRICT` | Bailleur abonné. |
| `plan` | `subscription_plan` | `enum SubscriptionPlan { Trial, Pro }` | Non | Type de formule | Formule d'abonnement. |
| `status` | `subscription_status`| `enum SubscriptionStatus` | Non | `DEFAULT 'active'` | `active`, `expired`, `cancelled`. |
| `starts_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | Date début | Début de validité. |
| `ends_at` | `TIMESTAMPTZ` | `DateTime<Utc>` | Non | Date fin | Expiration (J+30). |

- **Règle d'Unicité de l'Essai (Index Partiel)** :
  `CREATE UNIQUE INDEX idx_single_trial ON subscriptions(bailleur_id) WHERE plan = 'trial';` (Garantit qu'aucun bailleur ne peut tricher en consommant deux fois l'essai gratuit).

---

### Table 3.3 : `visit_hours` (Semaine Type des Disponibilités de Visite)
- **`visit_hours`** : `(logement_id UUID REFERENCES logements(id) ON DELETE CASCADE, day_of_week SMALLINT CHECK (day_of_week BETWEEN 0 AND 6), start_time TIME NOT NULL, end_time TIME NOT NULL, PRIMARY KEY (logement_id, day_of_week, start_time))`.

### Table 3.4 : `visit_blackouts` (Jours Fériés ou d'Indisponibilité Exceptionnelle)
- **`visit_blackouts`** : `(logement_id UUID REFERENCES logements(id) ON DELETE CASCADE, blackout_date DATE NOT NULL, reason TEXT, PRIMARY KEY (logement_id, blackout_date))`.

### Table 3.5 : `boosts` (Options de Mise en Tête de Liste)
- **`boosts`** : `id UUID PRIMARY KEY`, `logement_id UUID REFERENCES logements(id)`, `plan boost_plan NOT NULL`, `starts_at TIMESTAMPTZ NOT NULL`, `ends_at TIMESTAMPTZ NOT NULL`, `payment_id UUID REFERENCES payments(id)`.

---

# SECTION II — ARBORESCENCE & SPÉCIFICATION FICHIER PAR FICHIER EN RUST

Voici la nomenclature exhaustive des fichiers à créer dans le workspace Cargo, découpés selon la Clean Architecture :

---

## 📁 1. Crate `shared` (`crates/shared/`)

```text
crates/shared/
├── Cargo.toml
└── src/
    ├── lib.rs                      # Export des modules communs
    ├── money.rs                    # Value Object Money (XOF, arithmétique d'entiers stricts)
    ├── phone.rs                    # Value Object Phone (Format Sénégal E.164 +221...)
    ├── envelope.rs                 # ApiResponse<T>, ApiErrorResponse, MetaPagination
    ├── error.rs                    # AppError (Enum thiserror + impl IntoResponse)
    ├── crypto.rs                   # Vérification HMAC-SHA256, hash CNI, rotation JWT
    └── date_utils.rs               # Manipulation des fuseaux Dakar (UTC/GMT)
```

- **`src/money.rs`** :
  - `pub struct Money(i64)` avec constructeur `Money::from_xof(val: i64) -> Result<Self, AppError>`. Interdit les nombres négatifs et assure l'addition/soustraction sans débordement (`checked_add`, `checked_sub`).
- **`src/phone.rs`** :
  - `pub struct PhoneNumber(String)` avec validation regex `^\+221(70|75|76|77|78)[0-9]{7}$`. Méthode `mask() -> String` pour masquer les chiffres intermédiaires (`+221 77 ••• •• 30`).
- **`src/envelope.rs`** :
  - `pub struct ApiResponse<T> { success: bool, data: T, meta: Option<MetaPagination> }`.
  - `pub struct MetaPagination { page: u64, page_size: u64, total: u64, has_more: bool }`.
- **`src/crypto.rs`** :
  - `pub fn verify_hmac_sha256(secret: &[u8], payload: &[u8], expected_signature: &str) -> bool`.

---

## 📁 2. Crate `domain` (`crates/domain/`)

```text
crates/domain/
├── Cargo.toml
└── src/
    ├── lib.rs
    ├── client/
    │   ├── mod.rs                  # Module client
    │   ├── logement.rs             # Entité Logement, LogementType, LogementStatus
    │   ├── coloc_rules.rs          # Moteur de Coloc : GenderPolicy, LockState, SoloBuyout
    │   ├── visite.rs               # Entité Visite, VisiteStatus, Règles d'annulation
    │   ├── contrat.rs              # Entité Contrat, Durée, Préavis, Scellement
    │   └── echeance.rs             # Entité Échéance, Calcul du reste dû, Tranches
    ├── bailleur/
    │   ├── mod.rs                  # Module bailleur
    │   ├── profile.rs              # Entité BailleurProfile, VerificationStatus
    │   ├── subscription.rs         # Entité Subscription, Calcul des 30j d'essai
    │   └── cash_payment.rs         # Entité CashPayment, QuittanceGeneration
    └── shared/
        ├── mod.rs
        └── audit.rs                # Entité AuditLog, ActionTypes
```

- **`src/client/coloc_rules.rs`** :
  - `pub enum GenderPolicy { HommesUniquement, FemmesUniquement, CouplesUniquement }`.
  - Méthode `validate_adhesion(policy: GenderPolicy, candidate_gender: Gender, is_couple: bool) -> Result<(), DomainError>`.
  - Méthode `calculate_solo_refunds(existing_tenants: &[TenantAdvance]) -> Vec<RefundInstruction>`.
- **`src/client/echeance.rs`** :
  - Méthode `calculate_remaining(total: Money, paid: Money) -> Money`.
  - Méthode `apply_tranche(payment: Money) -> Result<(EcheanceStatus, bool), DomainError>` (retourne si l'échéance est soldée et s'il faut émettre une quittance finale ou partielle).

---

## 📁 3. Crate `application` (`crates/application/`)

```text
crates/application/
├── Cargo.toml
└── src/
    ├── lib.rs
    ├── ports/                      # Interfaces (Traits)
    │   ├── mod.rs
    │   ├── logement_repository.rs  # Trait LogementRepository
    │   ├── coloc_lock_service.rs   # Trait ColocLockService (Redis)
    │   ├── contrat_repository.rs   # Trait ContratRepository
    │   ├── payment_gateway.rs      # Trait PaymentGateway (Sonatel OM)
    │   └── storage_service.rs      # Trait StorageService (COS/S3 Presigned)
    ├── client/                     # Use Cases Locataire
    │   ├── mod.rs
    │   ├── search_logements.rs     # SearchLogementsUseCase
    │   ├── lock_place.rs           # LockPlaceUseCase (15 min)
    │   ├── privatize_solo.rs       # PrivatizeSoloUseCase (100% refund)
    │   ├── request_visite.rs       # RequestVisiteUseCase
    │   ├── sign_contrat.rs         # SignContratUseCase
    │   └── pay_loyer.rs            # PayLoyerUseCase
    └── bailleur/                   # Use Cases Bailleur
        ├── mod.rs
        ├── create_annonce.rs       # CreateAnnonceUseCase (4 photos, anti-fraude)
        ├── accept_visite.rs        # AcceptVisiteUseCase (Révèle l'adresse)
        ├── record_cash_payment.rs  # RecordCashPaymentUseCase
        └── subscribe_pro.rs        # SubscribeProUseCase
```

- **`src/ports/coloc_lock_service.rs`** :
  - `#[async_trait] pub trait ColocLockService: Send + Sync { async fn acquire_lock(&self, logement_id: Uuid, place: u8, user_id: Uuid) -> Result<bool, AppError>; async fn release_lock(&self, logement_id: Uuid, place: u8, user_id: Uuid) -> Result<(), AppError>; }`.
- **`src/client/privatize_solo.rs`** :
  - `PrivatizeSoloUseCase::execute(logement_id, solo_user_id)` : Orchestre la transaction pessimiste SQL, calcule les remboursements 100%, insère dans `refund_queue` et met à jour le logement en `OCCUPIED_SOLO`.

---

## 📁 4. Crate `infrastructure` (`crates/infrastructure/`)

```text
crates/infrastructure/
├── Cargo.toml
└── src/
    ├── lib.rs
    ├── persistence/                # Adaptateurs SQLx Postgres
    │   ├── mod.rs
    │   ├── postgres_pool.rs        # Configuration du pool PgPool
    │   ├── pg_logement_repo.rs     # Implémentation LogementRepository
    │   ├── pg_contrat_repo.rs      # Implémentation ContratRepository
    │   └── pg_echeance_repo.rs     # Implémentation EcheanceRepository
    ├── redis_service/              # Adaptateurs Redis
    │   ├── mod.rs
    │   └── distributed_lock.rs     # Implémentation ColocLockService (SET NX EX 900)
    ├── sonatel_client/             # Intégration API Max It / OM
    │   ├── mod.rs
    │   ├── client.rs               # Reqwest client pour Sonatel Max It OAuth
    │   └── dto.rs                  # DTOs réseau télécom
    └── cos_storage/                # Intégration Stockage Cloud (Tencent COS)
        ├── mod.rs
        └── presigner.rs            # Générateur d'URLs présignées 15 min
```

- **`src/redis_service/distributed_lock.rs`** :
  - Exécute la commande native `SET lock:place:{logement_id}:{place} {user_id} NX EX 900`.
- **`src/persistence/pg_logement_repo.rs`** :
  - Requêtes préparées avec `sqlx::query_as!` pour vérifier le schéma SQL à la compilation.

---

## 📁 5. Crate `api` (`crates/api/`)

```text
crates/api/
├── Cargo.toml
└── src/
    ├── main.rs                     # Démarrage Serveur Axum, Tracing, Injection dépendances
    ├── router.rs                   # Table de routage (/api/v1/...)
    ├── extractors/                 # Extracteurs Axum sur mesure
    │   ├── mod.rs
    │   ├── auth_user.rs            # Extrait l'utilisateur depuis Authorization: Bearer
    │   ├── idempotency.rs          # Extrait et valide l'en-tête Idempotency-Key
    │   └── lang.rs                 # Extrait Accept-Language: fr | wo
    ├── middleware/
    │   ├── mod.rs
    │   ├── rate_limit.rs           # Gouvernance des flux (Tower RateLimit)
    │   ├── logging.rs              # Tracing des requêtes avec corrélation X-Request-Id
    │   └── security_headers.rs     # Injection headers HTTP stricts (HSTS, CSP)
    └── handlers/                   # Contrôleurs HTTP découplés par domaine
        ├── mod.rs
        ├── shared/
        │   ├── auth_handler.rs     # POST /auth/maxit, POST /auth/refresh
        │   ├── webhook_handler.rs  # POST /webhooks/maxit (HMAC)
        │   └── upload_handler.rs   # POST /uploads
        ├── client/
        │   ├── search_handler.rs   # GET /logements, GET /logements/{id}
        │   ├── coloc_handler.rs    # POST /places/{num}/lock, POST /privatize-solo
        │   ├── visite_handler.rs   # POST /visites, POST /visites/{id}/cancel
        │   └── loyer_handler.rs    # POST /loyers/{id}/pay, GET /quittances/{id}
        └── bailleur/
            ├── annonce_handler.rs  # POST /bailleur/annonces, PATCH /bailleur/annonces/{id}
            ├── visite_handler.rs   # POST /bailleur/visites/{id}/accept
            └── cash_handler.rs     # POST /bailleur/echeances/{id}/cash-payments
```

---

## 💡 Récapitulatif d'Excellence

En suivant cette spécification :
1. **Chaque table** possède son type Rust miroir immuable et ses contraintes SQL validées.
2. **Chaque use case** métier (verrou 15 min, rachat solo, 4 photos, encaissement espèces) est isolé dans son fichier dédié sans mélange de responsabilités.
3. **Le compilateur Rust** protège le serveur contre les plantages mémoires, les failles de concurrence et les erreurs de syntaxe SQL.
