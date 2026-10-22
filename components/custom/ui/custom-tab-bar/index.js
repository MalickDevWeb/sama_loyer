import { storage } from '../../../../utils/storage.js';
import { CLIENT_TABS, BAILLEUR_TABS, STORAGE_KEYS } from '../../../../utils/constants/index';

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
  },

  lifetimes: {
    attached() {
      this.syncTabs();
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

      const currentTabs = isBailleur ? BAILLEUR_TABS : CLIENT_TABS;
      
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
