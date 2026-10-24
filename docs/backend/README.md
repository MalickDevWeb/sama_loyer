# Backend SAMA LOYER — modélisation et contrat d'API

Ce dossier est la référence partagée entre l'équipe mini-programme, l'équipe back office et l'équipe backend.

| Fichier | Contenu | Pour qui |
|---|---|---|
| [01-modele-de-donnees.md](01-modele-de-donnees.md) | Entités, diagramme, cycles de vie, règles métier, tâches planifiées | Backend, produit |
| [schema.sql](schema.sql) | Schéma PostgreSQL 15+ exécutable (types, contraintes, index, données initiales) | Backend |
| [02-contrat-api.md](02-contrat-api.md) | Conventions (enveloppe, erreurs, idempotence), catalogue des endpoints, flux détaillés, écarts à corriger côté front | Tous |
| [openapi.yaml](openapi.yaml) | Spécification OpenAPI 3.1 complète (81 opérations) | Backend (génération de code), front (types), QA (tests) |

## Périmètre

- **Locataire** : recherche (filtres, IA, voix), fiche, favoris, visites, messagerie, entrée dans un logement (contrat + paiement par tranche), loyers, quittances, préavis, signalement de problème.
- **Bailleur** : activation (essai / Pro), annonces, horaires de visite, demandes de visite, locataires, paiements en espèces, caution, boosts.
- **Back office** : validation des annonces, vérification des bailleurs, transactions et remboursements, réclamations, paramètres, équipe, journal d'audit.
- **Paiements** : Max it / Orange Money, protocole unique « initier → confirmer dans Max it → webhook → polling ».

## Utiliser la spec

```bash
# Vérifier la spec
npx @redocly/cli lint docs/backend/openapi.yaml

# Documentation navigable en local
npx @redocly/cli preview-docs docs/backend/openapi.yaml

# Serveur fictif pour développer le front sans backend
npx @stoplight/prism-cli mock docs/backend/openapi.yaml

# Créer la base
psql "$DATABASE_URL" -f docs/backend/schema.sql
```

## Règles de changement

1. Toute évolution de l'API commence par une modification de `openapi.yaml` dans une PR relue par le front **et** le backend.
2. Ajouter un champ ou un endpoint : non cassant. Renommer, supprimer ou changer un type : cassant ⇒ `/api/v2`.
3. Toute modification de `schema.sql` en production passe par une migration versionnée (outil au choix de l'équipe backend : Prisma Migrate, Flyway, Knex…) ; `schema.sql` reste l'état de référence.
4. Une nouvelle règle métier s'écrit d'abord dans [01-modele-de-donnees.md](01-modele-de-donnees.md#4-règles-métier-le-backend-les-vérifie-jamais-le-front-seul).

## Points à valider avant de coder

- [ ] API d'autorisation et de paiement Max it exactes (noms, signature du webhook) avec la documentation partenaire Orange.
- [ ] Hébergement : TencentDB for PostgreSQL + COS (stockage) + région.
- [ ] Moteur de la recherche IA et de la transcription wolof (service, coût, latence).
- [ ] Relecture juridique du modèle de contrat (`contrat_templates` v1).
- [ ] Relecture des libellés wolof des équipements par un locuteur.
