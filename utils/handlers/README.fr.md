# Handlers

Ce dossier est destiné aux gestionnaires d'événements partagés et fonctions middleware.

## Conventions

- Un handler par fichier
- Exportez sous forme de fonctions nommées
- Documentez la forme attendue de l'événement/des données avec JSDoc

## Cas d'utilisation exemples

- Handler d'événements d'analytics (journaliser les actions utilisateur)
- Handler de reporting d'erreurs (envoyer les erreurs à un service de monitoring)
- Middleware de garde d'authentification (bloquer les événements si non authentifié)

## Exemple

```javascript
// utils/handlers/analytics.js
export const analyticsHandler = async (eventData) => {
  if (eventData.event.startsWith('user.')) {
    console.log('[Analytics]', eventData.event, eventData.data);
    // Envoyer au service analytics
  }
};

// Utilisation dans app.js :
// Bus.use(analyticsHandler);
```

## Voir aussi

- [EventBus Guide: Middleware](../../docs/05-eventbus-guide.md#middleware)
