# EventBus

Enterprise-grade state management and event system.

## Module Structure

| File | Purpose |
|------|---------|
| `builder.js` | `EventBus` class (622 lines) — core implementation |
| `validator.js` | Input validation for event names, state keys, callbacks |
| `types/index.js` | JSDoc type definitions |
| `index.js` | `Bus` singleton facade — import this |

## Quick Reference

```javascript
import { Bus } from '../../utils/event/index';

// State
Bus.setState('user.data', { name: 'John' });
const user = Bus.getState('user.data');
const unsub = Bus.onState('user.data', (change) => { ... });

// Events
await Bus.emit('user.loaded', data);
const unsub = Bus.on('user.loaded', handler);
Bus.once('user.loaded', handler);
```

## See Also

- [EventBus Guide](../../docs/05-eventbus-guide.md) — Full API reference with examples
- [App Lifecycle](../../docs/04-app-lifecycle.md) — Where STATE_KEYS and EVENTS are defined
