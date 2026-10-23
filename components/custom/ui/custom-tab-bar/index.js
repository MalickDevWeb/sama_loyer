import { storage } from '../../../../utils/storage.js';
import { CLIENT_TABS, BAILLEUR_TABS, STORAGE_KEYS } from '../../../../utils/constants/index';
import { Bus } from '../../../../utils/event/index';
import { STATE_KEYS } from '../../../../utils/event/keys';

// Onglet qui porte le badge « messages non lus » selon l'espace
const MESSAGES_TAB = { client: 'messages', bailleur: 'b-messages' };

/** Badge affiché : rien à 0, « 9+ » au-delà de 9 */
function badgeText(n) {
  if (!n) return '';
  return n > 9 ? '9+' : String(n);
}

Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home',
      observer(val) {
        if (val) {
          this.syncTabs();
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
      this.syncTabs();

      // EventBus : badge des messages non lus et bandeau hors connexion, en direct
      const refresh = () => this.syncTabs();
      this._unsubs = [
        Bus.onState(STATE_KEYS.UNREAD_CLIENT, refresh),
        Bus.onState(STATE_KEYS.UNREAD_BAILLEUR, refresh),
        Bus.onState(STATE_KEYS.NETWORK_CONNECTED, ({ value }) => this.setData({ offline: value === false })),
      ];
    },
    detached() {
      (this._unsubs || []).forEach((off) => off());
    },
  },

  pageLifetimes: {
    show() {
      this.syncTabs();
    },
  },

  methods: {
    syncTabs() {
      const pages = getCurrentPages();
      const currentPage = pages && pages.length > 0 ? pages[pages.length - 1] : null;
      const route = currentPage ? (currentPage.route || '') : '';
      
      // La route actuelle est la source absolue de vérité
      let isBailleur = false;
      if (route) {
        isBailleur = route.includes('pages/bailleur');
        // Synchronisation du rôle en storage pour garantir la cohérence globale
        storage.set(STORAGE_KEYS.USER_ROLE, isBailleur ? 'bailleur' : 'client');
      } else {
        isBailleur = storage.get(STORAGE_KEYS.USER_ROLE, 'client') === 'bailleur';
      }

      const side = isBailleur ? 'bailleur' : 'client';
      const unread = Bus.getState(isBailleur ? STATE_KEYS.UNREAD_BAILLEUR : STATE_KEYS.UNREAD_CLIENT, 0);
      const currentTabs = (isBailleur ? BAILLEUR_TABS : CLIENT_TABS).map((t) =>
        t.id === MESSAGES_TAB[side] ? Object.assign({}, t, { badge: badgeText(unread) }) : t
      );
      
      const cleanRoute = route.replace(/^\//, '');
      const match = currentTabs.find(t => t.url.replace(/^\//, '') === cleanRoute);
      const activeTab = match ? match.id : (this.properties.activeTab || this.data.activeTab);

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
