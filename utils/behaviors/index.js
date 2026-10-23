// ============================================================================
// BEHAVIORS — point d'entrée unique
//   import { busBehavior, loadingBehavior } from '../../../utils/behaviors/index';
//
// | Behavior              | Apporte                                                        |
// |-----------------------|----------------------------------------------------------------|
// | busBehavior           | listen(), bindState(), watchState(), receiveNavData()          |
// |                       | avec désabonnement automatique                                  |
// | loadingBehavior       | isLoading / hasError / errorMessage + withLoading(fn)          |
// | bailleurGuardBehavior | bloque une page bailleur si l'abonnement se termine            |
// | i18nBehavior          | data.i18n (dictionnaire) + changement de langue en direct      |
// ============================================================================

export { busBehavior } from './bus.js';
export { loadingBehavior } from './loading.js';
export { bailleurGuardBehavior } from './bailleur-guard.js';
export { i18nBehavior } from '../i18n/index.js';
