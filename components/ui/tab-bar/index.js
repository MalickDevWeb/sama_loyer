/**
 * Tab Bar Component
 * Horizontal tab switcher with a controlled active state.
 *
 * @example
 * <app-tab-bar
 *   tabs="{{ tabs }}"
 *   activeTab="{{ activeTab }}"
 * />
 *
 * @property {Array<{id: string, label: string, iconImage?: string, url?: string}>} tabs - Tab items
 * @property {string} activeTab - Currently active tab id
 * @property {'navigateTo'|'redirectTo'|'switchTab'|'reLaunch'} navigationType - Navigation API used when a tab has a url
 * @property {string} containerClass - Extra class for the tab list
 * @property {string} itemClass - Extra class for each tab item
 * @property {string} activeItemClass - Extra class for the active tab item
 * @property {string} iconClass - Extra class for tab icons
 * @property {string} labelClass - Extra class for tab labels
 *
 * @fires change - On tab switch (detail: { tab })
 */
Component({
  properties: {
    activeTab: {
      type: String,
      value: '',
    },

    tabs: {
      type: Array,
      value: [],
    },

    navigationType: {
      type: String,
      value: 'switchTab',
    },

    containerClass: {
      type: String,
      value: '',
    },

    itemClass: {
      type: String,
      value: '',
    },

    activeItemClass: {
      type: String,
      value: '',
    },

    iconClass: {
      type: String,
      value: '',
    },

    labelClass: {
      type: String,
      value: '',
    },
  },

  methods: {
    handleTap(e) {
      const tab = e.currentTarget.dataset.tab;
      const url = e.currentTarget.dataset.url;

      if (!tab || tab === this.properties.activeTab) {
        return;
      }

      this.triggerEvent('change', { tab });

      if (url) {
        this.navigate(url);
      }
    },

    navigate(url) {
      const pages = getCurrentPages();
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1];
        let currentUrl = '/' + currentPage.route;
        
        const options = currentPage.options || {};
        const query = Object.keys(options)
          .map(key => `${key}=${options[key]}`)
          .join('&');
        if (query) {
          currentUrl += '?' + query;
        }

        const app = getApp();
        if (app) {
          if (!app.globalData.navHistory) {
            app.globalData.navHistory = [];
          }
          
          const lastHistory = app.globalData.navHistory[app.globalData.navHistory.length - 1];
          if (lastHistory !== currentUrl) {
            app.globalData.navHistory.push(currentUrl);
          }

          if (app.globalData.navHistory.length > 15) {
            app.globalData.navHistory.shift();
          }
        }
      }

      const navigationType = this.properties.navigationType;
      const navigate = wx[navigationType] || wx.redirectTo;

      navigate({
        url,
        success: () => {},
        fail: (err) => {
          if (navigationType !== 'redirectTo') {
            console.warn('[TabBar] navigation failed, falling back to redirectTo:', err.errMsg);
            wx.redirectTo({ url });
          }
        },
      });
    },
  },
  lifetimes:({
    attached(){
    }
  })
});
