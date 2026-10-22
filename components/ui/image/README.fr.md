# Image

## Objectif

Un composant image riche en fonctionnalités qui enveloppe l'élément natif `<image>` avec retry automatique en cas d'échec, gestion du cache local, états de chargement et d'erreur, aperçu plein écran optionnel, slot d'overlay et badge. Il communique les événements de cycle de vie via l'EventBus de l'application sous un namespace configurable.

## Propriétés

### Core

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `src` | `String` | `''` | URL de la source de l'image. |
| `fallbackSrc` | `String` | `''` | URL alternative utilisée en cas de retry après un échec de chargement. |
| `mode` | `String` | `'aspectFill'` | Mode de redimensionnement de l'image (correspond à l'attribut natif `mode` de `<image>`). |
| `lazyLoad` | `Boolean` | `true` | Active le chargement paresseux. |
| `showMenuByLongpress` | `Boolean` | `false` | Affiche le menu contextuel natif au long-press. |

### Style

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `width` | `String` | `''` | Largeur de l'image. |
| `height` | `String` | `''` | Hauteur de l'image. |
| `containerClass` | `String` | `''` | Classe CSS pour le conteneur externe. |
| `imageClass` | `String` | `''` | Classe CSS pour l'élément `<image>`. |
| `containerStyle` | `String` | `''` | Style inline pour le conteneur externe. |
| `imageStyle` | `String` | `''` | Style inline pour l'élément `<image>`. |
| `overlayClass` | `String` | `''` | Classe CSS pour le wrapper de l'overlay. |
| `badge` | `String` | `''` | Texte du badge affiché sur l'image (par ex. `"NEW"`, `"3"`). |
| `badgeClass` | `String` | `''` | Classe CSS pour l'élément badge. |
| `badgeStyle` | `String` | `''` | Style inline pour le badge. |

### Texte UX

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `loadingText` | `String` | `''` | Texte affiché pendant l'état de chargement. |
| `errorText` | `String` | `''` | Texte affiché lorsque le chargement échoue définitivement. |
| `retryText` | `String` | `''` | Texte affiché avec l'état d'erreur pour inviter au retry. |
| `errorIcon` | `String` | `'⚠️'` | Icône/emoji affiché dans l'état d'erreur. |

### Comportement

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `previewable` | `Boolean` | `false` | Si `true`, le tap ouvre un aperçu plein écran. |
| `previewUrls` | `Array` | `[]` | URLs pour la galerie d'aperçu. Par défaut, prend `src` si vide. |
| `retryCount` | `Number` | `3` | Nombre maximal de retries automatiques en cas d'échec. |
| `retryDelay` | `Number` | `1000` | Délai en millisecondes entre les retries. |

### Intégration

| Propriété | Type | Par défaut | Description |
|----------|------|---------|-------------|
| `cacheKey` | `String` | `''` | Clé de cache personnalisée. Par défaut, `src` si vide. |
| `namespace` | `String` | `'tc-image'` | Préfixe de namespace EventBus pour tous les événements émis. |

## Événements (Event Bus)

Les événements sont émis via l'EventBus de l'app sous le namespace configuré.

| Événement | Payload | Description |
|-------|---------|-------------|
| `image:created` | `{ id, src, loading, error }` | Déclenché à l'attachement du composant. |
| `image:loaded` | `{ id, src, loading, error }` | Déclenché après un chargement réussi. |
| `image:error` | `{ id, src, loading, error }` | Déclenché lorsque tous les retries sont épuisés. |
| `image:retry` | `{ count }` | Déclenché avant chaque tentative de retry. |
| `image:load` | `{ id, detail }` | Déclenché sur l'événement natif `<image>` load. |
| `image:tap` | `{ id, src, loading, error }` | Déclenché quand l'image est tapée. |
| `image:longpress` | `{ id, src, loading, error }` | Déclenché au long-press. |
| `image:destroyed` | `{ id }` | Déclenché à la destruction du composant. |

## Slots

| Slot | Description |
|------|-------------|
| `overlay` | Contenu overlay personnalisé rendu au-dessus de l'image chargée. |

## Méthodes (API publique)

| Méthode | Description |
|--------|-------------|
| `reload()` | Réinitialise l'état d'erreur/chargement et recharge l'image depuis `src`. |
| `getImageInfo()` | Renvoie `{ id, src, loading, error }` pour l'état courant. |

## Utilisation

```xml
<!-- WXML -->
<osn-image
  src="https://example.com/photo.jpg"
  fallbackSrc="https://example.com/placeholder.jpg"
  mode="aspectFit"
  previewable="{{true}}"
  retryCount="{{2}}"
  badge="NEW"
  containerClass="rounded"
>
  <view slot="overlay" class="gradient-overlay" />
</osn-image>
```

```json
{
  "usingComponents": {
    "osn-image": "/components/ui/image/index"
  }
}
```

## Voir aussi

- [Icon component](../icons/base/README.md) — utilisé en interne
- [Components Overview](../../../docs/08-components-overview.md)
- [Recipes: Adding a New Component](../../../docs/14-recipes.md#adding-a-new-component)
