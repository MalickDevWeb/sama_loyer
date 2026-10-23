// ============================================================================
// BUS BEHAVIOR
// Abonnements EventBus avec désabonnement automatique, pour pages et composants.
// Plus besoin de garder les fonctions « off » ni d'écrire onUnload / detached.
//
//   import { busBehavior } from '../../../utils/behaviors/index';
//
//   Page({
//     behaviors: [busBehavior],
//     onLoad(options) {
//       // Événement : la page réagit en direct
//       this.listen(EVENTS.MESSAGES_CHANGED, ({ side }) => side === 'client' && this.reload());
//
//       // État : copie la valeur dans data (et la met à jour à chaque changement)
//       this.bindState(STATE_KEYS.UNREAD_CLIENT, 'unread', 0);
//
//       // Objet confié par la page précédente (évite un appel API)
//       const logement = this.receiveNavData(options);
//     },
//   });
//
// CE QUE VOUS OBTENEZ :
//   methods : listen(event, cb), bindState(stateKey, dataKey, fallback),
//             watchState(stateKey, cb), receiveNavData(options)
// ============================================================================

import { Bus } from '../event/index.js';
import { takeNavData } from '../helpers/nav-data.js';

export const busBehavior = Behavior({
  lifetimes: {
    detached() {
      // Page fermée ou composant retiré : tous ses abonnements sont coupés
      (this._busUnsubs || []).forEach((off) => off());
      this._busUnsubs = [];
    },
  },

  methods: {
    _track(off) {
      if (!this._busUnsubs) this._busUnsubs = [];
      this._busUnsubs.push(off);
      return off;
    },

    /**
     * Écoute un événement EventBus jusqu'à la fermeture de la page.
     * @param {string} event - Nom (EVENTS.…)
     * @param {Function} callback - (data, event) => void
     * @returns {Function} désabonnement manuel (facultatif)
     */
    listen(event, callback) {
      return this._track(Bus.on(event, callback));
    },

    /**
     * Suit un état EventBus : callback(nouvelleValeur, ancienneValeur).
     * @param {string} stateKey - Clé (STATE_KEYS.…)
     * @param {Function} callback
     */
    watchState(stateKey, callback) {
      return this._track(Bus.onState(stateKey, ({ value, oldValue }) => callback(value, oldValue)));
    },

    /**
     * Copie un état EventBus dans data[dataKey] et le garde à jour.
     * @param {string} stateKey - Clé (STATE_KEYS.…)
     * @param {string} dataKey - Clé dans data de la page
     * @param {*} [fallback] - Valeur si l'état n'existe pas encore
     */
    bindState(stateKey, dataKey, fallback) {
      this.setData({ [dataKey]: Bus.getState(stateKey, fallback) });
      return this.watchState(stateKey, (value) => this.setData({ [dataKey]: value }));
    },

    /**
     * Objet confié par la page précédente avec navigateWithData(), ou null.
     * @param {Object} options - options de onLoad
     */
    receiveNavData(options) {
      return takeNavData(options);
    },
  },
});
