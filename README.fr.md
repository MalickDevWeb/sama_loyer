# TCMPP Boilerplate

Une base prête pour la production pour construire des mini-apps TCMPP (Tencent Cloud Mini Program Platform). Clonez le projet, configurez-le et commencez à développer.

## Ce que vous obtenez

- **EventBus** — gestion d'état multi-page et système d'événements avec middleware, lecture et historique
- **Client HTTP** — client API avec suivi de session pour tous les verbes HTTP et format de réponse unifié
- **Auth OAuth2** — flux client credentials avec mise en cache de jeton et rafraîchissement automatique
- **Service de plugin natif** — wrappers typés `wx.invokeNativePlugin` avec retry et backoff
- **JSON Sculpt** — moteur déclaratif de transformation des réponses API
- **13+ composants UI** — Button, Modal, Nav Bar, Stepper, Input, Typography, et plus
- **Behaviors** — mixins partagés pour l'état de chargement/erreur dans les pages et composants
- **Filtres WXS** — filtres de template côté vue pour une logique d'affichage rapide
- **Helpers de navigation** — wrappers sécurisés pour les 5 méthodes wx de navigation
- **Wrapper de stockage** — opérations de stockage local sécurisées contre les erreurs
- **CSS utilitaire** — classes utilitaires flexbox, espacement et mise en page dérivées de Bootstrap

## Démarrage rapide

1. **Installez** [TCMPP Developer Tools](https://cloud.tencent.com/product/tcmpp)
2. Clonez ce dépôt
3. Ouvrez le dossier du projet dans TCMPP DevTools
4. Le mini-programme se compile et s'affiche automatiquement

> Première fois avec les mini-programmes ? Commencez par [Mini-Program Concepts](docs/01-mini-program-concepts.md).

## Structure du projet

```
tcmpp-boilerplate/
├── app.js                    # Entrée de l'app : init, EventBus, gestion des erreurs, réseau
├── app.json                  # Routes, configuration de la fenêtre, permissions
├── app.wxss                  # Styles globaux (utilitaires dérivés de Bootstrap)
├── project.config.json       # Paramètres TCMPP DevTools
│
├── pages/                    # Pages de l'application
│   ├── index/                # Page d'accueil (initPromise, démonstration EventBus)
│   └── demo/                 # Page de démonstration (stepper, modal, WXS, Behavior)
│
├── components/               # Composants réutilisables
│   ├── ui/                   # Bibliothèque UI (button, modal, nav-bar, etc.)
│   ├── forms/                # Composants de formulaire (placeholder)
│   └── ux/                   # Composants UX (placeholder)
│
├── utils/                    # Modules utilitaires
│   ├── apis/                 # Client HTTP, auth, plugins natifs, BackendAPI
│   ├── event/                # EventBus (gestion d'état + pub/sub)
│   ├── json-sculpt/          # Moteur de transformation de données déclaratif
│   ├── constants/            # Constantes centralisées de l'app
│   ├── formatters/           # Formatage date, prix, chaîne
│   ├── helpers/              # Helpers de page, helpers de navigation
│   ├── behaviors/            # Mixins Behavior() partagés
│   ├── wxs/                  # Filtres WXS de template
│   ├── mappers/              # Définitions de schémas Sculpt
│   ├── config.js             # Configuration d'environnement (dev/prod)
│   └── storage.js            # Wrapper de stockage wx sécurisé
│
├── types/                    # Définitions de type JSDoc
└── typings/                  # Définitions TypeScript de l'API WeChat
```

## Parcours d'apprentissage

| Étape | Sujet | Lien |
|------|-------|------|
| 1 | Fondamentaux du mini-programme | [Mini-Program Concepts](docs/01-mini-program-concepts.md) |
| 2 | Structure du projet | [Project Architecture](docs/02-project-architecture.md) |
| 3 | Installation et premier lancement | [Getting Started](docs/03-getting-started.md) |
| 4 | Cycle de vie de l'app | [App Lifecycle](docs/04-app-lifecycle.md) |
| 5 | Gestion d'état | [EventBus Guide](docs/05-eventbus-guide.md) |
| 6 | Appels API | [API Layer](docs/06-api-layer.md) |
| 7 | Transformation de données | [JSON Sculpt Guide](docs/07-json-sculpt-guide.md) |
| 8 | Utilisation des composants | [Components Overview](docs/08-components-overview.md) |
| 9 | Tâches courantes | [Recipes](docs/14-recipes.md) |
| 10 | Quand ça plante | [Troubleshooting](docs/15-troubleshooting.md) |
| 11 | Tabbar personnalisé WeChat | [Custom TabBar WeChat](docs/17-custom-tab-bar.md) |
| 12 | Audit responsive iPhone | [Audit Responsive iPhone](docs/README-responsive-iphone.md) |

## Toute la documentation

### Guides
- [Mini-Program Concepts](docs/01-mini-program-concepts.md) — runtime WeChat/TCMPP, types de fichiers, cycles de vie
- [Project Architecture](docs/02-project-architecture.md) — diagrammes de flux de données, dépendances des modules
- [Getting Started](docs/03-getting-started.md) — installation, configuration, premiers changements
- [App Lifecycle](docs/04-app-lifecycle.md) — app.js : initPromise, mises à jour, réseau, erreurs
- [EventBus Guide](docs/05-eventbus-guide.md) — API complète de gestion d'état et d'événements
- [API Layer](docs/06-api-layer.md) — client HTTP, auth, plugins natifs, BackendAPI
- [JSON Sculpt Guide](docs/07-json-sculpt-guide.md) — mappage déclaratif des réponses
- [Components Overview](docs/08-components-overview.md) — système de composants et catalogue
- [Styling Guide](docs/09-styling-guide.md) — variables CSS, classes utilitaires, unités rpx
- [WXS Filters](docs/10-wxs-filters.md) — scripts de template côté vue
- [Behaviors Guide](docs/11-behaviors-guide.md) — système de mixins partagés
- [Navigation Guide](docs/12-navigation-guide.md) — pile de pages et helpers de navigation
- [Storage Guide](docs/13-storage-guide.md) — wrapper de stockage local
- [Custom TabBar WeChat](docs/17-custom-tab-bar.md) — override du tabbar natif avec le style applicatif
- [Audit Responsive iPhone](docs/README-responsive-iphone.md) — diagnostic des gaps et problemes d'affichage sur iPhone reel

### Référence
- [Recipes](docs/14-recipes.md) — recettes pas à pas pour les tâches courantes
- [Troubleshooting](docs/15-troubleshooting.md) — erreurs courantes, débogage, FAQ
- [Glossary](docs/16-glossary.md) — vocabulaire
- [Contributing](CONTRIBUTING.md) — directives de style et contribution

## Tech Stack

| Élément | Valeur |
|------|-------|
| SDK TCMPP | 2.2.4 |
| Cible JavaScript | ES2015 |
| Framework CSS | utilitaires dérivés de Bootstrap |
| Gestion d'état | EventBus personnalisé |
| Transformation des données | JSON Sculpt |
