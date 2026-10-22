# EventBus

Système de gestion d'état et d'événements niveau entreprise.

## Structure du module

| Fichier | Objectif |
|------|---------|
| `builder.js` | Classe `EventBus` (622 lignes) — implémentation core |
| `validator.js` | Validation d'entrée pour noms d'événements, clés d'état, callbacks |
| `types/index.js` | Définitions de type JSDoc |
| `index.js` | Façade singleton `Bus` — importez ceci |

## Référence rapide

```javascript
import { Bus } from '../../utils/event/index';

// État
Bus.setState('user.data', { name: 'John' });
const user = Bus.getState('user.data');
const unsub = Bus.onState('user.data', (change) => { ... });

// Événements
await Bus.emit('user.loaded', data);
const unsubEvent = Bus.on('user.loaded', handler);
Bus.once('user.loaded', handler);
```

## Voir aussi

- [EventBus Guide](../../docs/05-eventbus-guide.md) — référence API complète avec exemples
- [App Lifecycle](../../docs/04-app-lifecycle.md) — où `STATE_KEYS` et `EVENTS` sont définis
