-- ============================================================================
-- SAMA LOYER — SCHÉMA DE BASE DE DONNÉES (PostgreSQL 15+, TencentDB compatible)
-- Source de vérité de la modélisation : docs/backend/01-modele-de-donnees.md
--
-- Conventions
--   * Identifiants : UUID (gen_random_uuid), exposés en string par l'API.
--   * Montants : BIGINT en francs CFA (XOF), jamais de décimales ni de float.
--   * Dates : TIMESTAMPTZ en UTC ; DATE pour les échéances et la durée du bail.
--   * Suppression : logique (deleted_at) pour les données métier, jamais physique
--     sur les paiements, contrats, quittances et journaux.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- recherche plein texte tolérante (titre, quartier)

-- ----------------------------------------------------------------------------
-- 0. TYPES ÉNUMÉRÉS
-- ----------------------------------------------------------------------------
CREATE TYPE locale_code            AS ENUM ('fr', 'wo');
CREATE TYPE bailleur_verification  AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE subscription_plan      AS ENUM ('trial', 'pro');
CREATE TYPE subscription_status    AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE logement_type          AS ENUM ('chambre', 'chambre_salon', 'studio', 'appartement', 'maison');
CREATE TYPE logement_status        AS ENUM ('draft', 'validation', 'online', 'reserved', 'rented', 'hidden', 'rejected');
CREATE TYPE verification_level     AS ENUM ('declared', 'phone_verified', 'identity_verified', 'identity_and_visit_verified', 'certified_agency');
CREATE TYPE media_kind             AS ENUM ('photo', 'video');
CREATE TYPE boost_plan             AS ENUM ('boost7', 'boost30');
CREATE TYPE visite_status          AS ENUM ('pending', 'accepted', 'rejected', 'cancelled', 'done', 'no_show');
CREATE TYPE message_kind           AS ENUM ('text', 'voice', 'event');
CREATE TYPE contrat_status         AS ENUM ('draft', 'pending_signature', 'active', 'notice', 'terminated', 'cancelled');
CREATE TYPE deposit_status         AS ENUM ('not_paid', 'held', 'refunded', 'partially_refunded');
CREATE TYPE echeance_kind          AS ENUM ('entry', 'rent');
CREATE TYPE echeance_status        AS ENUM ('pending', 'partial', 'paid', 'late', 'cancelled');
CREATE TYPE payment_purpose        AS ENUM ('entry', 'rent', 'subscription', 'boost', 'refund');
CREATE TYPE payment_method         AS ENUM ('maxit', 'cash');
CREATE TYPE payment_status         AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'expired');
CREATE TYPE incident_category      AS ENUM ('plumbing', 'electricity', 'lock', 'humidity', 'other');
CREATE TYPE incident_status        AS ENUM ('open', 'in_progress', 'resolved');
CREATE TYPE report_target          AS ENUM ('logement', 'user', 'group');

-- Types énumérés Colocation & Partage de chambres (Multi-groupes)
CREATE TYPE coloc_rental_mode      AS ENUM ('SOLO_UNIQUEMENT', 'COLOC_UNIQUEMENT', 'FLEXIBLE');
CREATE TYPE coloc_gender_policy    AS ENUM ('HOMMES_UNIQUEMENT', 'FEMMES_UNIQUEMENT', 'COUPLES_UNIQUEMENT');
CREATE TYPE coloc_habit_policy     AS ENUM ('ALLOWED', 'FORBIDDEN', 'OUTDOOR_ONLY');
CREATE TYPE coloc_incomplete_policy AS ENUM ('ANNULATION_REMBOURSEMENT', 'POURSUIVRE_AU_PRIX_SOLO', 'PRIX_ALTERNATIF_PREDEFINI');
CREATE TYPE place_status           AS ENUM ('DISPONIBLE', 'BLOQUEE', 'RESERVEE', 'OCCUPEE', 'INDISPONIBLE');
CREATE TYPE group_status           AS ENUM ('CREE', 'RECRUTEMENT', 'ATTENTE_CONFIRMATION', 'COMPLET', 'RESERVE', 'ANNULE');
CREATE TYPE group_member_role      AS ENUM ('CREATEUR', 'MEMBRE');
CREATE TYPE group_member_status    AS ENUM ('EN_ATTENTE', 'CONFIRME', 'REFUSE', 'RETIRE');
CREATE TYPE reservation_status     AS ENUM ('VERROUILLEE', 'EN_ATTENTE_PAIEMENT', 'CONFIRMEE', 'ANNULEE', 'REMBOURSEE', 'EXPIREE');
CREATE TYPE lock_status            AS ENUM ('ACTIF', 'LIBERE', 'CONVERTI', 'EXPIRE');
CREATE TYPE report_priority        AS ENUM ('urgent', 'medium', 'low');
CREATE TYPE report_status          AS ENUM ('new', 'in_progress', 'resolved', 'dismissed');

-- ----------------------------------------------------------------------------
-- 1. UTILISATEURS & COMPTES
-- Un même utilisateur Max it peut être locataire ET bailleur.
-- ----------------------------------------------------------------------------
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maxit_user_id    TEXT NOT NULL UNIQUE,              -- identifiant stable fourni par Max it
  phone            TEXT NOT NULL UNIQUE,              -- E.164 : +221771234567
  full_name        TEXT NOT NULL,
  city             TEXT,
  locale           locale_code NOT NULL DEFAULT 'fr',
  avatar_url       TEXT,
  phone_verified   BOOLEAN NOT NULL DEFAULT TRUE,     -- vérifié par Max it
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ
);

CREATE TABLE refresh_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,                  -- SHA-256, jamais le jeton en clair
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profil bailleur : créé à la 1re activation (essai ou Pro)
CREATE TABLE bailleur_profiles (
  user_id              UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  verification_status  bailleur_verification NOT NULL DEFAULT 'pending',
  id_document_url      TEXT,                          -- pièce d'identité (COS privé)
  verified_at          TIMESTAMPTZ,
  verified_by          UUID,                          -- admin_users.id
  rejection_reason     TEXT,
  reports_count        INT NOT NULL DEFAULT 0,
  trial_used           BOOLEAN NOT NULL DEFAULT FALSE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscriptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bailleur_id   UUID NOT NULL REFERENCES bailleur_profiles(user_id),
  plan          subscription_plan NOT NULL,
  status        subscription_status NOT NULL DEFAULT 'active',
  starts_at     TIMESTAMPTZ NOT NULL,
  ends_at       TIMESTAMPTZ NOT NULL,
  price         BIGINT NOT NULL DEFAULT 0 CHECK (price >= 0),
  payment_id    UUID,                                 -- NULL pour l'essai
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
-- L'essai gratuit n'est offert qu'une seule fois par bailleur
CREATE UNIQUE INDEX uq_subscriptions_one_trial ON subscriptions (bailleur_id) WHERE plan = 'trial';
CREATE INDEX idx_subscriptions_bailleur_ends ON subscriptions (bailleur_id, ends_at DESC);

-- ----------------------------------------------------------------------------
-- 2. RÉFÉRENTIELS : ZONES & ÉQUIPEMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE zones (
  id          TEXT PRIMARY KEY,                       -- slug : 'ouakam', 'keur-massar'
  name        TEXT NOT NULL,                          -- 'Ouakam'
  commune     TEXT NOT NULL,                          -- 'Dakar', 'Pikine', 'Guédiawaye'
  region      TEXT NOT NULL DEFAULT 'Dakar',
  lat         NUMERIC(9,6),
  lng         NUMERIC(9,6),
  is_active   BOOLEAN NOT NULL DEFAULT TRUE
);

-- Quartiers voisins proposés quand une recherche ne donne rien
CREATE TABLE zone_neighbours (
  zone_id       TEXT NOT NULL REFERENCES zones(id),
  neighbour_id  TEXT NOT NULL REFERENCES zones(id),
  PRIMARY KEY (zone_id, neighbour_id),
  CHECK (zone_id <> neighbour_id)
);

CREATE TABLE amenities (
  id        TEXT PRIMARY KEY,                         -- 'private_toilet', 'woyofal_meter'
  label_fr  TEXT NOT NULL,
  label_wo  TEXT NOT NULL,
  icon      TEXT
);

-- ----------------------------------------------------------------------------
-- 3. LOGEMENTS (annonces)
-- ----------------------------------------------------------------------------
CREATE TABLE logements (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bailleur_id                UUID NOT NULL REFERENCES bailleur_profiles(user_id),
  title                      TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 80),
  type                       logement_type NOT NULL,
  zone_id                    TEXT NOT NULL REFERENCES zones(id),
  place_label                TEXT NOT NULL,           -- 'Ouakam, Cité Avion' (affiché)
  address_detail             TEXT,                    -- adresse précise : révélée après visite acceptée
  lat                        NUMERIC(9,6),
  lng                        NUMERIC(9,6),
  description                TEXT NOT NULL DEFAULT '' CHECK (char_length(description) <= 1500),
  rent_amount                BIGINT NOT NULL CHECK (rent_amount > 0),
  deposit_amount             BIGINT NOT NULL CHECK (deposit_amount >= 0),   -- caution
  advance_amount             BIGINT NOT NULL CHECK (advance_amount > 0),    -- avance (1er mois)
  fees_amount                BIGINT NOT NULL DEFAULT 0 CHECK (fees_amount >= 0),
  surface_m2                 INT CHECK (surface_m2 > 0),
  rooms                      SMALLINT CHECK (rooms > 0),
  -- Configuration Colocation & Partage de chambre
  room_capacity              SMALLINT NOT NULL DEFAULT 1 CHECK (room_capacity >= 1),
  rental_mode                coloc_rental_mode NOT NULL DEFAULT 'SOLO_UNIQUEMENT',
  gender_policy              coloc_gender_policy NOT NULL DEFAULT 'HOMMES_UNIQUEMENT',
  place_price                BIGINT CHECK (place_price IS NULL OR place_price > 0),
  solo_price                 BIGINT CHECK (solo_price IS NULL OR solo_price > 0),
  multi_group_allowed        BOOLEAN NOT NULL DEFAULT FALSE,
  smoking_policy             coloc_habit_policy NOT NULL DEFAULT 'FORBIDDEN',
  alcohol_policy             coloc_habit_policy NOT NULL DEFAULT 'FORBIDDEN',
  incomplete_policy          coloc_incomplete_policy NOT NULL DEFAULT 'ANNULATION_REMBOURSEMENT',
  incomplete_deadline        TIMESTAMPTZ,
  available_from             DATE,
  status                     logement_status NOT NULL DEFAULT 'validation',
  verification_level         verification_level NOT NULL DEFAULT 'declared',
  rejection_reason           TEXT,
  remote_visit_enabled       BOOLEAN NOT NULL DEFAULT FALSE, -- visite en vidéo acceptée
  rent_without_visit_enabled BOOLEAN NOT NULL DEFAULT TRUE,  -- parcours « louer sans visite »
  availability_confirmed_at  TIMESTAMPTZ,             -- « Confirmé il y a 2 jours »
  published_at               TIMESTAMPTZ,
  views_count                INT NOT NULL DEFAULT 0,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at                 TIMESTAMPTZ
);
CREATE INDEX idx_logements_search  ON logements (status, zone_id, rent_amount) WHERE deleted_at IS NULL;
CREATE INDEX idx_logements_bailleur ON logements (bailleur_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_logements_title_trgm ON logements USING gin (title gin_trgm_ops);

CREATE TABLE logement_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id  UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  kind         media_kind NOT NULL,
  url          TEXT NOT NULL,
  poster_url   TEXT,                                  -- vignette d'une vidéo
  label        TEXT,                                  -- 'Salon', 'Douche'…
  position     SMALLINT NOT NULL DEFAULT 0,           -- 0 = photo de couverture
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_media_logement ON logement_media (logement_id, position);
-- 1 vidéo maximum par logement
CREATE UNIQUE INDEX uq_media_one_video ON logement_media (logement_id) WHERE kind = 'video';

CREATE TABLE logement_amenities (
  logement_id  UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  amenity_id   TEXT NOT NULL REFERENCES amenities(id),
  PRIMARY KEY (logement_id, amenity_id)
);

CREATE TABLE boosts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id  UUID NOT NULL REFERENCES logements(id),
  bailleur_id  UUID NOT NULL REFERENCES bailleur_profiles(user_id),
  plan         boost_plan NOT NULL,
  starts_at    TIMESTAMPTZ NOT NULL,
  ends_at      TIMESTAMPTZ NOT NULL,
  payment_id   UUID NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);
CREATE INDEX idx_boosts_active ON boosts (logement_id, ends_at);

CREATE TABLE favoris (
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logement_id  UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, logement_id)
);

-- ----------------------------------------------------------------------------
-- 3.bis COLOCATION & PARTAGE DE CHAMBRES (Multi-groupes, Places, Verrous)
-- ----------------------------------------------------------------------------
-- Places individuelles au sein d'une chambre partagée
CREATE TABLE room_places (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id                UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  place_number               SMALLINT NOT NULL CHECK (place_number > 0),
  status                     place_status NOT NULL DEFAULT 'DISPONIBLE',
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (logement_id, place_number)
);
CREATE INDEX idx_room_places_logement ON room_places (logement_id, status);

-- Groupes de colocation (candidats ou colocataires constitués)
CREATE TABLE coloc_groups (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                       TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 60),
  creator_id                 UUID NOT NULL REFERENCES users(id),
  target_logement_id         UUID REFERENCES logements(id),
  places_requested           SMALLINT NOT NULL DEFAULT 1 CHECK (places_requested > 0),
  places_assigned            SMALLINT NOT NULL DEFAULT 0 CHECK (places_assigned >= 0),
  gender_mode                coloc_gender_policy NOT NULL,
  status                     group_status NOT NULL DEFAULT 'CREE',
  is_couple                  BOOLEAN NOT NULL DEFAULT FALSE,
  couple_partner_id          UUID REFERENCES users(id),
  couple_confirmed_by_partner BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coloc_groups_target ON coloc_groups (target_logement_id, status);
CREATE INDEX idx_coloc_groups_creator ON coloc_groups (creator_id);

-- Membres d'un groupe de colocation
CREATE TABLE coloc_group_members (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id                   UUID NOT NULL REFERENCES coloc_groups(id) ON DELETE CASCADE,
  user_id                    UUID NOT NULL REFERENCES users(id),
  role                       group_member_role NOT NULL DEFAULT 'MEMBRE',
  status                     group_member_status NOT NULL DEFAULT 'EN_ATTENTE',
  invited_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at               TIMESTAMPTZ,
  UNIQUE (group_id, user_id)
);
CREATE INDEX idx_group_members_user ON coloc_group_members (user_id);

-- Invitations de groupe (liens sécurisés avec expiration et token unique)
CREATE TABLE coloc_invitations (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id                   UUID NOT NULL REFERENCES coloc_groups(id) ON DELETE CASCADE,
  token                      TEXT NOT NULL UNIQUE,
  inviter_id                 UUID NOT NULL REFERENCES users(id),
  max_uses                   SMALLINT NOT NULL DEFAULT 1,
  uses_count                 SMALLINT NOT NULL DEFAULT 0,
  expires_at                 TIMESTAMPTZ NOT NULL,
  revoked_at                 TIMESTAMPTZ,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_invitations_token ON coloc_invitations (token) WHERE revoked_at IS NULL;

-- Réservations de places de colocation (avec séquestre Orange Money / Wave)
CREATE TABLE coloc_reservations (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id                UUID NOT NULL REFERENCES logements(id),
  group_id                   UUID REFERENCES coloc_groups(id),
  user_id                    UUID NOT NULL REFERENCES users(id),
  places_count               SMALLINT NOT NULL DEFAULT 1 CHECK (places_count > 0),
  amount_total               BIGINT NOT NULL CHECK (amount_total > 0),
  is_solo_privatization      BOOLEAN NOT NULL DEFAULT FALSE,
  conditions_accepted        BOOLEAN NOT NULL DEFAULT FALSE CHECK (conditions_accepted = TRUE),
  status                     reservation_status NOT NULL DEFAULT 'VERROUILLEE',
  payment_id                 UUID REFERENCES payments(id),
  lock_expires_at            TIMESTAMPTZ NOT NULL,
  confirmed_at               TIMESTAMPTZ,
  cancelled_at               TIMESTAMPTZ,
  refunded_at                TIMESTAMPTZ,
  refund_reason              TEXT,
  idempotency_key            TEXT UNIQUE,
  created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coloc_res_logement ON coloc_reservations (logement_id, status);
CREATE INDEX idx_coloc_res_user ON coloc_reservations (user_id);

-- Association places réservées <-> réservation
CREATE TABLE reservation_places (
  reservation_id             UUID NOT NULL REFERENCES coloc_reservations(id) ON DELETE CASCADE,
  place_id                   UUID NOT NULL REFERENCES room_places(id) ON DELETE CASCADE,
  PRIMARY KEY (reservation_id, place_id)
);

-- Verrous concurrents de places (Atomic 15 min TTL Lock)
CREATE TABLE place_locks (
  id                         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id                   UUID NOT NULL REFERENCES room_places(id) ON DELETE CASCADE,
  reservation_id             UUID REFERENCES coloc_reservations(id) ON DELETE SET NULL,
  user_id                    UUID NOT NULL REFERENCES users(id),
  group_id                   UUID REFERENCES coloc_groups(id),
  status                     lock_status NOT NULL DEFAULT 'ACTIF',
  locked_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at                 TIMESTAMPTZ NOT NULL,
  released_at                TIMESTAMPTZ
);
CREATE INDEX idx_place_locks_active ON place_locks (place_id, status) WHERE status = 'ACTIF';
CREATE INDEX idx_place_locks_expires ON place_locks (expires_at) WHERE status = 'ACTIF';

-- 4. HORAIRES & VISITES
-- Semaine type par logement + jours bloqués. Les créneaux libres sont calculés.
-- ----------------------------------------------------------------------------
CREATE TABLE visit_hours (
  logement_id  UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  weekday      SMALLINT NOT NULL CHECK (weekday BETWEEN 1 AND 7),  -- ISO : 1 = lundi
  start_time   TIME NOT NULL,                         -- créneau d'1 h : 17:00 → 18:00
  PRIMARY KEY (logement_id, weekday, start_time)
);

CREATE TABLE visit_blackouts (
  logement_id  UUID NOT NULL REFERENCES logements(id) ON DELETE CASCADE,
  day          DATE NOT NULL,
  PRIMARY KEY (logement_id, day)
);

CREATE TABLE visites (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id    UUID NOT NULL REFERENCES logements(id),
  locataire_id   UUID NOT NULL REFERENCES users(id),
  bailleur_id    UUID NOT NULL REFERENCES bailleur_profiles(user_id),
  scheduled_at   TIMESTAMPTZ NOT NULL,
  is_remote      BOOLEAN NOT NULL DEFAULT FALSE,
  status         visite_status NOT NULL DEFAULT 'pending',
  message        TEXT CHECK (char_length(message) <= 500),   -- message du locataire
  response_note  TEXT,                                        -- motif de refus / consignes
  decided_at     TIMESTAMPTZ,
  cancelled_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_visites_locataire ON visites (locataire_id, scheduled_at DESC);
CREATE INDEX idx_visites_bailleur  ON visites (bailleur_id, status, scheduled_at);
-- Un locataire n'a qu'une demande ouverte par logement
CREATE UNIQUE INDEX uq_visites_open_per_tenant ON visites (logement_id, locataire_id)
  WHERE status IN ('pending', 'accepted');
-- Un créneau ne peut être accepté qu'une fois
CREATE UNIQUE INDEX uq_visites_slot_accepted ON visites (logement_id, scheduled_at)
  WHERE status = 'accepted';

-- ----------------------------------------------------------------------------
-- 5. MESSAGERIE
-- Une conversation = un logement + un locataire (+ son bailleur).
-- ----------------------------------------------------------------------------
CREATE TABLE conversations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logement_id        UUID NOT NULL REFERENCES logements(id),
  locataire_id       UUID NOT NULL REFERENCES users(id),
  bailleur_id        UUID NOT NULL REFERENCES bailleur_profiles(user_id),
  last_message_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_preview TEXT,
  unread_locataire   INT NOT NULL DEFAULT 0,
  unread_bailleur    INT NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (logement_id, locataire_id)
);
CREATE INDEX idx_conv_locataire ON conversations (locataire_id, last_message_at DESC);
CREATE INDEX idx_conv_bailleur  ON conversations (bailleur_id, last_message_at DESC);

CREATE TABLE messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id        UUID REFERENCES users(id),         -- NULL = événement système
  kind             message_kind NOT NULL DEFAULT 'text',
  body             TEXT CHECK (char_length(body) <= 2000),
  audio_url        TEXT,                               -- message vocal
  event_type       TEXT,                               -- 'visit_requested', 'visit_accepted', 'contract_signed', 'rent_paid'
  event_payload    JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at          TIMESTAMPTZ,
  CHECK ((kind = 'event') = (event_type IS NOT NULL))
);
CREATE INDEX idx_messages_conv ON messages (conversation_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. CONTRATS DE LOCATION (bail)
-- Le texte signé est figé dans articles_snapshot : un changement de modèle ne
-- modifie jamais un contrat déjà signé.
-- ----------------------------------------------------------------------------
CREATE SEQUENCE contrat_number_seq;

CREATE TABLE contrat_templates (
  version     INT PRIMARY KEY,
  articles    JSONB NOT NULL,                         -- [{ key, title, hint, text }] avec variables {{rent}}…
  locale      locale_code NOT NULL DEFAULT 'fr',
  is_current  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE contrats (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero                   TEXT NOT NULL UNIQUE,      -- 'SL-2026-10-0412'
  logement_id              UUID NOT NULL REFERENCES logements(id),
  bailleur_id              UUID NOT NULL REFERENCES bailleur_profiles(user_id),
  locataire_id             UUID NOT NULL REFERENCES users(id),
  status                   contrat_status NOT NULL DEFAULT 'pending_signature',
  via_visit_id             UUID REFERENCES visites(id),  -- NULL = loué sans visite
  rent_amount              BIGINT NOT NULL CHECK (rent_amount > 0),
  deposit_amount           BIGINT NOT NULL CHECK (deposit_amount >= 0),
  advance_amount           BIGINT NOT NULL CHECK (advance_amount > 0),
  fees_amount              BIGINT NOT NULL DEFAULT 0,
  due_day                  SMALLINT NOT NULL DEFAULT 5 CHECK (due_day BETWEEN 1 AND 28),
  start_date               DATE NOT NULL,
  min_duration_months      SMALLINT NOT NULL DEFAULT 6,
  duration_months          SMALLINT NOT NULL DEFAULT 12,
  end_date                 DATE NOT NULL,
  notice_months            SMALLINT NOT NULL DEFAULT 1,
  auto_renew               BOOLEAN NOT NULL DEFAULT TRUE,
  utilities_note           TEXT,                      -- 'compteurs séparés à la charge du locataire'
  template_version         INT NOT NULL REFERENCES contrat_templates(version),
  articles_snapshot        JSONB NOT NULL,            -- articles rendus avec les vraies valeurs
  content_hash             TEXT NOT NULL,             -- SHA-256 du contenu signé
  bailleur_signed_at       TIMESTAMPTZ,
  bailleur_signature_name  TEXT,
  locataire_signed_at      TIMESTAMPTZ,
  locataire_signature_name TEXT,
  deposit_status           deposit_status NOT NULL DEFAULT 'not_paid',
  deposit_refunded_amount  BIGINT NOT NULL DEFAULT 0,
  keys_handed_over_at      TIMESTAMPTZ,               -- après paiement complet de l'entrée
  issue_window_ends_at     TIMESTAMPTZ,               -- +48 h si loué sans visite
  notice_given_at          TIMESTAMPTZ,
  notice_given_by          UUID REFERENCES users(id),
  departure_date           DATE,
  terminated_at            TIMESTAMPTZ,
  pdf_url                  TEXT,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);
CREATE INDEX idx_contrats_locataire ON contrats (locataire_id, status);
CREATE INDEX idx_contrats_bailleur  ON contrats (bailleur_id, status);
-- Un logement n'a qu'un contrat vivant à la fois
CREATE UNIQUE INDEX uq_contrats_live_per_logement ON contrats (logement_id)
  WHERE status IN ('pending_signature', 'active', 'notice');

-- ----------------------------------------------------------------------------
-- 7. ÉCHÉANCES, PAIEMENTS & QUITTANCES
-- Échéance = ce qui est dû (entrée ou loyer d'un mois).
-- Paiement = un mouvement d'argent (une tranche, un abonnement, un boost…).
-- Quittance = la preuve émise pour chaque paiement réussi d'une échéance.
-- ----------------------------------------------------------------------------
CREATE TABLE echeances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id    UUID NOT NULL REFERENCES contrats(id),
  kind          echeance_kind NOT NULL,
  period        CHAR(7),                               -- 'YYYY-MM' pour un loyer, NULL pour l'entrée
  amount_due    BIGINT NOT NULL CHECK (amount_due > 0),
  amount_paid   BIGINT NOT NULL DEFAULT 0 CHECK (amount_paid >= 0),
  min_first_payment BIGINT,                            -- entrée : au moins l'avance
  due_date      DATE NOT NULL,
  status        echeance_status NOT NULL DEFAULT 'pending',
  paid_at       TIMESTAMPTZ,                           -- quand amount_paid = amount_due
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (amount_paid <= amount_due),
  CHECK ((kind = 'rent') = (period IS NOT NULL))
);
CREATE UNIQUE INDEX uq_echeances_period ON echeances (contrat_id, period) WHERE kind = 'rent';
CREATE UNIQUE INDEX uq_echeances_entry  ON echeances (contrat_id) WHERE kind = 'entry';
CREATE INDEX idx_echeances_due ON echeances (status, due_date);

CREATE TABLE payments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference         TEXT NOT NULL UNIQUE,              -- 'TX-26-10-4821'
  payer_id          UUID NOT NULL REFERENCES users(id),
  purpose           payment_purpose NOT NULL,
  echeance_id       UUID REFERENCES echeances(id),
  subscription_plan subscription_plan,
  boost_plan        boost_plan,
  logement_id       UUID REFERENCES logements(id),     -- boost : logement ciblé
  refund_of         UUID REFERENCES payments(id),
  amount            BIGINT NOT NULL CHECK (amount > 0),
  method            payment_method NOT NULL DEFAULT 'maxit',
  status            payment_status NOT NULL DEFAULT 'pending',
  provider_ref      TEXT UNIQUE,                       -- identifiant de transaction Orange Money / Max it
  provider_payload  JSONB,                             -- dernière réponse brute du fournisseur
  idempotency_key   TEXT NOT NULL,
  failure_reason    TEXT,
  confirmed_by      UUID REFERENCES users(id),         -- paiement en espèces confirmé par le bailleur
  initiated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  expires_at        TIMESTAMPTZ,                       -- un paiement pending expire (15 min)
  UNIQUE (payer_id, idempotency_key),
  CHECK (purpose NOT IN ('entry', 'rent') OR echeance_id IS NOT NULL),
  CHECK (purpose <> 'subscription' OR subscription_plan IS NOT NULL),
  CHECK (purpose <> 'boost' OR (boost_plan IS NOT NULL AND logement_id IS NOT NULL)),
  CHECK (purpose <> 'refund' OR refund_of IS NOT NULL)
);
CREATE INDEX idx_payments_payer   ON payments (payer_id, initiated_at DESC);
CREATE INDEX idx_payments_status  ON payments (status, initiated_at DESC);
CREATE INDEX idx_payments_echeance ON payments (echeance_id);

ALTER TABLE subscriptions ADD CONSTRAINT fk_subscriptions_payment FOREIGN KEY (payment_id) REFERENCES payments(id);
ALTER TABLE boosts        ADD CONSTRAINT fk_boosts_payment        FOREIGN KEY (payment_id) REFERENCES payments(id);

CREATE TABLE quittances (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero        TEXT NOT NULL UNIQUE,                  -- 'REC-NOV-2026-008812' / 'CAU-ENT-2026-004402'
  payment_id    UUID NOT NULL UNIQUE REFERENCES payments(id),
  echeance_id   UUID NOT NULL REFERENCES echeances(id),
  contrat_id    UUID NOT NULL REFERENCES contrats(id),
  amount        BIGINT NOT NULL CHECK (amount > 0),
  breakdown     JSONB NOT NULL,                        -- [{ label: 'Avance', amount }, { label: 'Caution', amount }]
  is_final      BOOLEAN NOT NULL DEFAULT TRUE,         -- FALSE = reçu de tranche (acompte)
  pdf_url       TEXT,
  verify_code   TEXT NOT NULL UNIQUE,                  -- code court pour vérifier l'authenticité
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_quittances_contrat ON quittances (contrat_id, issued_at DESC);

-- ----------------------------------------------------------------------------
-- 8. INCIDENTS (problème dans le logement) & SIGNALEMENTS (fraude)
-- ----------------------------------------------------------------------------
CREATE TABLE incidents (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id    UUID NOT NULL REFERENCES contrats(id),
  reporter_id   UUID NOT NULL REFERENCES users(id),
  category      incident_category NOT NULL,
  description   TEXT NOT NULL CHECK (char_length(description) <= 1000),
  photo_urls    TEXT[] NOT NULL DEFAULT '{}',
  is_move_in_issue BOOLEAN NOT NULL DEFAULT FALSE,     -- signalé dans la fenêtre de 48 h
  status        incident_status NOT NULL DEFAULT 'open',
  resolved_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_incidents_contrat ON incidents (contrat_id, created_at DESC);

CREATE TABLE reports (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id   UUID NOT NULL REFERENCES users(id),
  target_type   report_target NOT NULL,
  target_id     UUID NOT NULL,
  reason        TEXT NOT NULL,                         -- 'money_before_visit', 'fake_listing', 'already_rented', 'photos_mismatch'
  detail        TEXT,
  priority      report_priority NOT NULL DEFAULT 'medium',
  status        report_status NOT NULL DEFAULT 'new',
  action_taken  TEXT,
  handled_by    UUID,                                  -- admin_users.id
  handled_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_reports_target ON reports (target_type, target_id);
CREATE INDEX idx_reports_queue  ON reports (status, priority, created_at);

-- ----------------------------------------------------------------------------
-- 9. BACK OFFICE : ÉQUIPE, RÔLES, PARAMÈTRES, AUDIT
-- ----------------------------------------------------------------------------
CREATE TABLE admin_roles (
  id           TEXT PRIMARY KEY,                       -- 'super_admin', 'moderator', 'support', 'finance'
  name         TEXT NOT NULL,
  permissions  TEXT[] NOT NULL                         -- 'annonces', 'bailleurs', 'reclamations', 'transactions', 'refunds', 'settings'
);

CREATE TABLE admin_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL UNIQUE,
  full_name      TEXT NOT NULL,
  password_hash  TEXT NOT NULL,                        -- argon2id
  totp_secret    TEXT,                                 -- 2FA obligatoire (chiffré au repos)
  role_id        TEXT NOT NULL REFERENCES admin_roles(id),
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE bailleur_profiles ADD CONSTRAINT fk_bailleur_verified_by FOREIGN KEY (verified_by) REFERENCES admin_users(id);
ALTER TABLE reports           ADD CONSTRAINT fk_reports_handled_by   FOREIGN KEY (handled_by)  REFERENCES admin_users(id);

CREATE TABLE support_tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id),
  subject      TEXT NOT NULL,
  channel      TEXT NOT NULL,                          -- 'app', 'whatsapp', 'phone'
  assignee_id  UUID REFERENCES admin_users(id),
  status       TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tarifs, règles et fonctionnalités modifiables depuis le back office
CREATE TABLE app_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_by  UUID REFERENCES admin_users(id),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_type  TEXT NOT NULL CHECK (actor_type IN ('admin', 'user', 'system')),
  actor_id    UUID,
  module      TEXT NOT NULL,                           -- 'annonces', 'bailleurs', 'transactions'…
  action      TEXT NOT NULL,                           -- 'listing.approved', 'payment.refunded'…
  target_type TEXT,
  target_id   TEXT,
  metadata    JSONB,
  ip          INET,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX idx_audit_target  ON audit_logs (target_type, target_id);

-- Événements à pousser (SMS, notification Max it) : pattern outbox
CREATE TABLE notifications_outbox (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES users(id),
  channel      TEXT NOT NULL CHECK (channel IN ('sms', 'push', 'in_app')),
  template     TEXT NOT NULL,                          -- 'visit_accepted', 'rent_due_reminder'…
  payload      JSONB NOT NULL,
  status       TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  attempts     SMALLINT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at      TIMESTAMPTZ
);
CREATE INDEX idx_outbox_pending ON notifications_outbox (status, created_at) WHERE status = 'pending';

-- ----------------------------------------------------------------------------
-- 10. DONNÉES INITIALES
-- ----------------------------------------------------------------------------
INSERT INTO app_settings (key, value) VALUES
  ('prices',   '{"pro": 15000, "boost7": 1500, "boost30": 6000, "trialDays": 30, "proDays": 30}'),
  ('rules',    '{"listingValidationHours": 24, "availabilityReminderDays": 7, "autoHideAfterDays": 21, "reportsBeforeSuspension": 3, "moveInIssueWindowHours": 48, "pendingPaymentTtlMinutes": 15, "maxPhotos": 10}'),
  ('features', '{"voice": true, "premium": true, "rent": true, "contract": true, "refund": true, "autohide": true}');

INSERT INTO admin_roles (id, name, permissions) VALUES
  ('super_admin', 'Super admin', ARRAY['annonces', 'bailleurs', 'reclamations', 'transactions', 'refunds', 'settings']),
  ('moderator',   'Modérateur',  ARRAY['annonces', 'bailleurs', 'reclamations']),
  ('support',     'Support',     ARRAY['reclamations']),
  ('finance',     'Finance',     ARRAY['transactions', 'refunds']);

-- Libellés wolof provisoires : à faire relire par un locuteur avant la mise en production
INSERT INTO amenities (id, label_fr, label_wo) VALUES
  ('private_toilet', 'Toilettes privées',             'Wanag bu sa bopp'),
  ('woyofal_meter',  'Compteur Woyofal individuel',   'Konteer Woyofal bu sa bopp'),
  ('running_water',  'Eau courante SDE',              'Ndox SDE'),
  ('balcony',        'Balcon privatif',               'Balkon'),
  ('air_conditioning','Climatisation',                'Klimatisaasioŋ'),
  ('furnished',      'Meublé',                        'Am na mbir'),
  ('wifi',           'Wifi',                          'Wifi');
