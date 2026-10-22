import { MAIN_TABS } from '../../../../utils/constants/index';

const ROUTE_TO_TAB = MAIN_TABS.reduce((routes, tab) => {
  routes[tab.url.replace(/^\//, '')] = tab.id;
  return routes;
}, {});

Component({
  properties: {
    activeTab: {
      type: String,
      value: 'home',
    },
  },

  data: {
    tabs: MAIN_TABS,
  },

  lifetimes: {
    attached() {
      this.syncActiveTabFromRoute();
    },
  },

  pageLifetimes: {
    show() {
      this.syncActiveTabFromRoute();
    },
  },

  methods: {
    handleChange(event) {
      const { tab } = event.detail || {};

      if (tab) {
        this.setData({ activeTab: tab });
        this.triggerEvent('change', { tab });
      }
    },

    syncActiveTabFromRoute() {
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const activeTab = currentPage ? ROUTE_TO_TAB[currentPage.route] : '';

      if (activeTab && activeTab !== this.data.activeTab) {
        this.setData({ activeTab });
      }
    },
  },
});
