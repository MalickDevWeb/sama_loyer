# Nav Bar

## Purpose

A custom navigation bar that handles status-bar safe-area insets, displays a configurable title, and provides an optional back button that calls `wx.navigateBack()`. Supports a transparent mode for hero/image pages.

## Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `title` | `String` | `''` | Text displayed in the centre of the navigation bar. |
| `showBack` | `Boolean` | `true` | When `true`, renders a back arrow that navigates to the previous page. |
| `transparent` | `Boolean` | `false` | When `true`, applies a transparent background style to the bar. |

## Events

None (the back button navigates via `wx.navigateBack()` internally).

## Slots

None.

## Usage

```xml
<!-- WXML -->
<app-nav-bar title="My Page" />

<!-- Transparent nav bar without back button (e.g., home page) -->
<app-nav-bar title="Home" showBack="{{false}}" transparent="{{true}}" />
```

```json
{
  "usingComponents": {
    "app-nav-bar": "/components/ui/nav-bar/index"
  }
}
```

## Internal Behaviour

- On `attached`, the component reads `wx.getSystemInfoSync().statusBarHeight` and applies it as top padding so the bar sits below the device status bar.
- The fixed nav content height is `44px`.

## See Also

- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)


# EN FRANCAIS



# Vue d’ensemble des composants

## Architecture

Chaque composant est représenté par un dossier contenant 4 fichiers :

```text
components/ui/button/
├── index.js      # Logique : Component(), propriétés, données, méthodes
├── index.json    # Configuration : { "component": true, "usingComponents": {} }
├── index.wxml    # Modèle : balisage avec liaisons de données
└── index.wxss    # Styles : CSS isolé au composant
```

## Enregistrement

Les composants doivent être déclarés dans le fichier `index.json` de la page qui les utilise :

```json
{
  "usingComponents": {
    "app-button": "/components/ui/button/index",
    "app-modal": "/components/ui/modal/index"
  }
}
```

**Convention :** Tous les composants utilisent le préfixe `app-`.

---

# Catalogue des composants

## Mise en page (Layout)

| Composant | Chemin                   | Rôle                                                                |
| --------- | ------------------------ | ------------------------------------------------------------------- |
| Card      | `components/ui/card/`    | Conteneur avec bordure et espacement interne                        |
| Center    | `components/ui/center/`  | Utilitaire de centrage                                              |
| Nav Bar   | `components/ui/nav-bar/` | Barre de navigation personnalisée avec gestion des zones sécurisées |

## Saisie (Input)

| Composant     | Chemin                         | Rôle                                                |
| ------------- | ------------------------------ | --------------------------------------------------- |
| Button        | `components/ui/button/`        | Bouton principal/secondaire avec état de chargement |
| Input         | `components/ui/input/`         | Champ texte avec icône et résultats de recherche    |
| Input Spinner | `components/ui/input-spinner/` | Incrémentation/décrémentation numérique             |
| Radio Group   | `components/ui/radio-group/`   | Groupe de boutons radio pour la sélection           |

## Affichage (Display)

| Composant  | Chemin                      | Rôle                                                     |
| ---------- | --------------------------- | -------------------------------------------------------- |
| Typography | `components/ui/typography/` | Affichage de texte stylisé                               |
| Image      | `components/ui/image/`      | Gestion d’image avec nouvelle tentative, cache et aperçu |
| Icons      | `components/ui/icons/base/` | Composant de base pour les icônes                        |
| Stepper    | `components/ui/stepper/`    | Indicateur de progression multi-étapes                   |
| Tab Bar    | `components/ui/tab-bar/`    | Navigation par onglets                                   |

## Superposition (Overlay)

| Composant | Chemin                 | Rôle                                                        |
| --------- | ---------------------- | ----------------------------------------------------------- |
| Modal     | `components/ui/modal/` | Fenêtre modale centrale ou panneau coulissant depuis le bas |

---

# Isolation des styles

Les composants peuvent contrôler la manière dont leurs styles interagissent avec ceux de la page :

| Mode                    | Signification                                       | Utilisé par               |
| ----------------------- | --------------------------------------------------- | ------------------------- |
| `isolated` (par défaut) | Les styles du composant sont totalement isolés      | La plupart des composants |
| `apply-shared`          | Les styles de la page peuvent affecter le composant | Modal                     |
| `shared`                | Les styles sont entièrement partagés                | Rarement utilisé          |

Configuration dans `index.js` :

```javascript
options: {
  styleIsolation: 'apply-shared'
}
```

Certains composants utilisent également :

```javascript
virtualHost: true
```

Cela permet de supprimer le nœud HTML personnalisé qui enveloppe normalement le composant (cas des composants **Center** et **Image**).

---

# Slots

Les composants peuvent recevoir du contenu enfant grâce aux slots.

### Slot par défaut

```xml
<app-card>
  <text>Le contenu de la carte s'affiche ici</text>
</app-card>
```

### Slots nommés

```xml
<app-modal>
  <view slot="header">Titre</view>
  <view slot="content">Contenu principal</view>
  <view slot="footer">
    <app-button>Terminer</app-button>
  </view>
</app-modal>
```

Pour activer les slots nommés :

```json
{
  "options": {
    "multipleSlots": true
  }
}
```

---

# Modèles de communication

## Parent → Composant : Propriétés (Properties)

### Définition du composant

```javascript
Component({
  properties: {
    title: {
      type: String,
      value: ''
    },
    disabled: {
      type: Boolean,
      value: false
    }
  }
});
```

### Utilisation dans le parent

```xml
<app-button disabled="{{ true }}">
  Cliquez-moi
</app-button>
```

Le parent transmet ici la propriété `disabled` au composant.

---

## Composant → Parent : Événements (Events)

### Émission d’un événement par le composant

```javascript
this.triggerEvent('change', {
  value: newValue
});
```

### Écoute de l’événement par le parent

```xml
<app-stepper bind:change="handleStepChange" />
```

Lorsque le composant déclenche l’événement `change`, la fonction `handleStepChange` du parent est exécutée.

---

# Voir aussi

* **Guide de style (Styling Guide)** : Variables CSS et classes utilitaires.
* **Guide des Behaviors** : Réutilisation de code entre plusieurs composants.
* **Recettes : Ajouter un nouveau composant** : Procédure complète pour créer un composant supplémentaire.
