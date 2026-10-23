// ============================================================================
// EVENTBUS — NOMS DES ÉTATS ET DES ÉVÉNEMENTS (source unique)
// Ne jamais écrire un nom d'événement en dur : toujours passer par ces constantes.
// Guide : docs/05-eventbus-guide.md (section « SAMA LOYER »)
// ============================================================================

/**
 * États globaux : une valeur courante, lisible à tout moment avec Bus.getState()
 * et suivie avec Bus.onState().
 */
export const STATE_KEYS = {
  // Démarrage et utilisateur Max it (app.js)
  APP_INITIALIZED: 'app.initialized',
  APP_LOADING: 'app.loading',
  USER_DATA: 'user.data',
  USER_NAME: 'user.name',

  // Réseau (app.js) : true / false
  NETWORK_CONNECTED: 'network.connected',
  NETWORK_TYPE: 'network.type',

  // Messages non lus : nombre affiché en badge sur l'onglet Messages
  UNREAD_CLIENT: 'sama.unread.client',
  UNREAD_BAILLEUR: 'sama.unread.bailleur',
};

/**
 * Événements : « quelque chose vient de se passer ». Publiés par les fonctions
 * d'écriture (store.js, favorites.js, i18n) — jamais directement par les pages.
 */
export const EVENTS = {
  // app.js
  USER_LOADED: 'user.loaded',
  USER_NOT_FOUND: 'user.not_found',
  NETWORK_CHANGE: 'network.change',
  APP_ERROR: 'app.error',

  // Données métier SAMA LOYER
  FAVORITES_CHANGED: 'sama.favorites.changed', // { ids }
  MESSAGES_CHANGED: 'sama.messages.changed', // { side: 'client' | 'bailleur', convId }
  VISITES_CHANGED: 'sama.visites.changed', // { visiteId }
  RENT_PAID: 'sama.rent.paid', // { logementId }
  LOGEMENTS_CHANGED: 'sama.logements.changed', // { logementId }
  LOCATAIRES_CHANGED: 'sama.locataires.changed', // { locataireId }
  BAILLEUR_ACCOUNT_CHANGED: 'sama.bailleur.account.changed', // { account }
  BAILLEUR_ACCESS_LOST: 'sama.bailleur.access.lost', // essai ou abonnement terminé
  LOCALE_CHANGED: 'sama.locale.changed', // { locale }
};
