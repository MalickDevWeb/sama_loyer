// ============================================================================
// GARDE DE L'ESPACE BAILLEUR (behavior)
// Si l'essai ou l'abonnement se termine pendant que le bailleur est sur une page,
// app.js publie EVENTS.BAILLEUR_ACCESS_LOST : la page affichée se bloque aussitôt.
//
//   import { bailleurGuardBehavior } from '../../../utils/behaviors/index';
//   Page({ behaviors: [bailleurGuardBehavior], ... });
//
// Une page peut définir onBailleurAccessLost() pour réagir elle-même
// (l'accueil bailleur affiche son écran verrouillé au lieu de recharger).
// La vérification classique dans onShow (requireBailleurAccess) reste en place.
// ============================================================================

import { EVENTS } from '../event/keys.js';
import { busBehavior } from './bus.js';
import { requireBailleurAccess } from '../helpers/store.js';

export const bailleurGuardBehavior = Behavior({
  // listen() se désabonne tout seul quand la page se ferme
  behaviors: [busBehavior],

  lifetimes: {
    attached() {
      this.listen(EVENTS.BAILLEUR_ACCESS_LOST, () => {
        // Seule la page affichée réagit (évite plusieurs redirections)
        const pages = getCurrentPages();
        if (pages[pages.length - 1] !== this) return;
        if (typeof this.onBailleurAccessLost === 'function') this.onBailleurAccessLost();
        else requireBailleurAccess();
      });
    },
  },
});
