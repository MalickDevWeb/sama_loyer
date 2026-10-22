# Bibliothèque de composants UI

Une collection de primitives UI réutilisables et bas niveau pour le boilerplate mini-program TCMPP. Chaque composant suit le modèle à 4 fichiers (`index.js`, `index.json`, `index.wxml`, `index.wxss`) et est enregistré avec un préfixe `app-` ou `osn-`.

## Composants

| Composant | Balise | Description | README |
|-----------|-----|-------------|--------|
| **Button** | `<app-button>` | Bouton primaire/secondaire avec spinner de chargement et animation de pression. | [button/README.md](./button/README.md) |
| **Card** | `<app-card>` | Conteneur bordé et arrondi pour regrouper du contenu lié. | [card/README.md](./card/README.md) |
| **Center** | `<app-center>` | Utilitaire flexbox qui centre ses enfants horizontalement et verticalement. | [center/README.md](./center/README.md) |
| **Icon (Base)** | `<osn-icon>` | Rend une icône PNG depuis le répertoire global d'icônes avec fond optionnel. | [icons/base/README.md](./icons/base/README.md) |
| **Image** | `<osn-image>` | Image riche en fonctionnalités avec retry, cache, aperçu, overlay et badge. | [image/README.md](./image/README.md) |
| **Input** | `<app-input>` | Champ texte et date avec icône finale et panneau de résultats. | [input/README.md](./input/README.md) |
| **Input Spinner** | `<app-input-spinner>` | Sélecteur de quantité avec boutons +/- et bornes min/max. | [input-spinner/README.md](./input-spinner/README.md) |
| **Modal** | `<app-modal>` | Dialogue centré/feuille inférieure avec flou de fond et slots header/content/footer. | [modal/README.md](./modal/README.md) |
| **Nav Bar** | `<app-nav-bar>` | Barre de navigation personnalisée avec safe area, bouton retour et titre. | [nav-bar/README.md](./nav-bar/README.md) |
| **Radio Group** | `<app-radio-group>` | Liste d'options à sélection unique avec slots nommés pour labels personnalisés. | [radio-group/README.md](./radio-group/README.md) |
| **Stepper** | `<app-stepper>` | Indicateur d'étapes pour flux multi-étapes avec états complété/actif/en attente. | [stepper/README.md](./stepper/README.md) |
| **Tab Bar** | `<app-tab-bar>` | Navigation par onglets avec slots dynamiques pour en-têtes et panneaux de contenu. | [tab-bar/README.md](./tab-bar/README.md) |
| **Typography** | `<app-typography>` | Rendu de texte configurable pour couleur, taille, poids, alignement, et ellipse. | [typography/README.md](./typography/README.md) |

## Conventions

- Chaque composant est autonome dans son propre dossier sous `components/ui/`.
- Les composants utilisent le modèle à 4 fichiers : `index.js`, `index.json`, `index.wxml`, `index.wxss`.
- Enregistrez les composants dans le `usingComponents` de la page avant utilisation.
- Les composants internes (non destinés aux pages) utilisent le préfixe `osn-` ; les composants destinés aux pages utilisent le préfixe `app-`.

## Voir aussi

- [Components Overview](../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../docs/14-recipes.md#adding-a-new-component)
