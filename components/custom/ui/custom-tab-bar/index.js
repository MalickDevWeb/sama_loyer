import { storage } from '../../../../utils/storage.js';
import { CLIENT_TABS, BAILLEUR_TABS, STORAGE_KEYS } from '../../../../utils/constants/index.js';
import { Bus } from '../../../../utils/event/index';
import { EVENTS, STATE_KEYS } from '../../../../utils/event/keys';
import { busBehavior } from '../../../../utils/behaviors/index';
import { t } from '../../../../utils/i18n/index.js';

// Onglet qui porte le badge « messages non lus » selon l'espace
const MESSAGES_TAB = { client: 'messages', bailleur: 'b-messages' };

/** Badge affiché : rien à 0, « 9+ » au-delà de 9 */
function badgeText(n) {
  if (!n) return '';
  return n > 9 ? '9+' : String(n);
}

Component({
  // watchState() & listen() : abonnements EventBus coupés automatiquement au retrait du composant
  behaviors: [busBehavior],

  properties: {
    activeTab: {
      type: String,
      value: 'home',
      observer(val) {
        if (val) {
          this.syncTabs(val);
        }
      }
    },
  },

  data: {
    tabs: CLIENT_TABS,
    offline: false,
    offlineTop: 0,
  },

  lifetimes: {
    attached() {
      let statusBar = 20;
      try {
        statusBar = wx.getSystemInfoSync().statusBarHeight || 20;
      } catch (e) {}
      this.setData({ offlineTop: statusBar, offline: Bus.getState(STATE_KEYS.NETWORK_CONNECTED, true) === false });
      this.syncTabs(this.properties.activeTab);

      // EventBus : badge des messages non lus, langue dynamique et bandeau hors connexion, en direct
      this.watchState(STATE_KEYS.UNREAD_CLIENT, () => this.syncTabs(this.properties.activeTab));
      this.watchState(STATE_KEYS.UNREAD_BAILLEUR, () => this.syncTabs(this.properties.activeTab));
      this.watchState(STATE_KEYS.NETWORK_CONNECTED, (connected) => this.setData({ offline: connected === false }));
      this.listen(EVENTS.LOCALE_CHANGED, () => this.syncTabs(this.properties.activeTab));
    },
  },

  pageLifetimes: {
    show() {
      this.syncTabs(this.properties.activeTab);
    },
  },

  methods: {
    syncTabs(overrideActiveTab) {
      const targetTab = overrideActiveTab || this.properties.activeTab || '';
      const pages = getCurrentPages();
      const currentPage = pages && pages.length > 0 ? pages[pages.length - 1] : null;
      const route = currentPage ? (currentPage.route || '') : '';
      
      // Détection stricte et prioritaire du rôle :
      let isBailleur = false;
      if (targetTab && targetTab.startsWith('b-')) {
        isBailleur = true;
      } else if (targetTab && CLIENT_TABS.some((t) => t.id === targetTab)) {
        isBailleur = false;
      } else if (route && route.indexOf('pages/bailleur') !== -1) {
        isBailleur = true;
      } else if (route && route.indexOf('pages/client') !== -1) {
        isBailleur = false;
      } else {
        isBailleur = storage.get(STORAGE_KEYS.USER_ROLE, 'client') === 'bailleur';
      }

      storage.set(STORAGE_KEYS.USER_ROLE, isBailleur ? 'bailleur' : 'client');

      const side = isBailleur ? 'bailleur' : 'client';
      const unread = Bus.getState(isBailleur ? STATE_KEYS.UNREAD_BAILLEUR : STATE_KEYS.UNREAD_CLIENT, 0);

      const tabLabelKeys = {
        'home': 'tabs.search',
        'loyers': 'tabs.myRent',
        'visites': 'tabs.visits',
        'messages': 'tabs.messages',
        'profile': 'tabs.profile',
        'b-home': 'tabs.bHome',
        'b-locataires': 'tabs.bTenants',
        'b-annonces': 'tabs.bListings',
        'b-messages': 'tabs.bMessages',
        'b-profil': 'tabs.bProfile',
      };

      const currentTabs = (isBailleur ? BAILLEUR_TABS : CLIENT_TABS).map((tab) => {
        const item = Object.assign({}, tab);
        if (tabLabelKeys[tab.id]) {
          item.label = t(tabLabelKeys[tab.id]);
        }
        if (tab.id === MESSAGES_TAB[side]) {
          item.badge = badgeText(unread);
        }
        return item;
      });
      
      const cleanRoute = route.replace(/^\//, '');
      const match = currentTabs.find(t => t.url.replace(/^\//, '') === cleanRoute);
      const defaultTab = isBailleur ? 'b-home' : 'home';
      // Si la valeur actuelle appartient à l'autre profil (ex: 'b-annonces' en mode client), on réinitialise
      const isValidForRole = currentTabs.some(t => t.id === targetTab);
      const activeTab = match ? match.id : (isValidForRole ? targetTab : defaultTab);

      this.setData({
        tabs: currentTabs,
        activeTab: activeTab
      });
    },

    handleChange(event) {
      const { tab } = event.detail || {};
      if (tab) {
        this.setData({ activeTab: tab });
        this.triggerEvent('change', { tab });
      }
    },
  },
});
