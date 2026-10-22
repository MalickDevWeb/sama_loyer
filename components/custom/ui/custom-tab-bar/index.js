import { CLIENT_TABS, BAILLEUR_TABS, STORAGE_KEYS } from '../../../../utils/constants/index';

Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home',
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
      const role = wx.getStorageSync(STORAGE_KEYS.USER_ROLE) || 'client';
      const currentTabs = role === 'bailleur' ? BAILLEUR_TABS : CLIENT_TABS;
      
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const route = currentPage ? currentPage.route : '';
      
      const match = currentTabs.find(t => t.url.replace(/^\//, '') === route);
      const activeTab = match ? match.id : this.data.activeTab;

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
