# Behaviors

Mixins `Behavior()` partagés par les pages et les composants. Point d'entrée unique :

```javascript
import { busBehavior, loadingBehavior, bailleurGuardBehavior, i18nBehavior } from '../../../utils/behaviors/index';
```

| Behavior | Fichier | Apporte |
|---|---|---|
| `busBehavior` | `bus.js` | `listen()`, `watchState()`, `bindState()`, `receiveNavData()`, avec **désabonnement automatique** |
| `loadingBehavior` | `loading.js` | `isLoading`, `hasError`, `errorMessage` + `withLoading(fn)` |
| `bailleurGuardBehavior` | `bailleur-guard.js` | Bloque une page bailleur si l'essai ou l'abonnement se termine pendant qu'elle est affichée |
| `i18nBehavior` | `../i18n/index.js` | `data.i18n` (dictionnaire) et changement de langue en direct |

`bailleurGuardBehavior` et `i18nBehavior` s'appuient sur `busBehavior` : une page qui les utilise a aussi `listen()` et les autres méthodes.

## busBehavior

```javascript
import { busBehavior } from '../../../utils/behaviors/index';
import { EVENTS, STATE_KEYS } from '../../../utils/event/keys';

Page({
  behaviors: [busBehavior],

  onLoad(options) {
    // Événement : réagir en direct
    this.listen(EVENTS.MESSAGES_CHANGED, ({ side }) => side === 'client' && this.reload());

    // État : copié dans data.unread et tenu à jour
    this.bindState(STATE_KEYS.UNREAD_CLIENT, 'unread', 0);

    // Objet transmis par la page précédente (évite un appel API), sinon null
    const logement = this.receiveNavData(options);
  },
  // Pas besoin de onUnload : les abonnements sont coupés à la fermeture.
});
```

## loadingBehavior

```javascript
import { loadingBehavior } from '../../../utils/behaviors/index';
import { backendAPI } from '../../../utils/apis/index';

Page({
  behaviors: [loadingBehavior],
  async onLoad() {
    await this.withLoading(async () => {
      this.setData({ loyers: await backendAPI.getLoyers() });
    });
  },
});
```

## Voir aussi

- [Guide EventBus](../../docs/05-eventbus-guide.md), section « SAMA LOYER »
- [Behaviors Guide](../../docs/11-behaviors-guide.md)
