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
      if (!url) return;

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

      // Pages déclarées dans app.json > tabBar.list
      const TAB_BAR_PAGES = [
        '/pages/client/home/home',
        '/pages/client/loyers/loyers',
        '/pages/client/visites/visites',
        '/pages/client/messages/messages',
        '/pages/client/profile/profile'
      ];

      const cleanUrl = url.split('?')[0];
      const isTab = TAB_BAR_PAGES.some(
        t => t === cleanUrl || ('/' + t) === cleanUrl || cleanUrl.endsWith(t.replace(/^\//, ''))
      );

      if (isTab) {
        // Obligatoire dans WeChat pour les pages de tabBar
        wx.switchTab({
          url: cleanUrl,
          fail: (err) => {
            console.warn('[TabBar] switchTab failed, fallback to reLaunch:', err);
            wx.reLaunch({ url: cleanUrl });
          }
        });
      } else {
        // Pages hors tabBar (ex: espace bailleur)
        wx.redirectTo({
          url,
          fail: (err) => {
            console.warn('[TabBar] redirectTo failed, fallback to navigateTo:', err);
            wx.navigateTo({
              url,
              fail: () => {
                wx.reLaunch({ url });
              }
            });
          }
        });
      }
    },
  },
  lifetimes: {
    attached() {
    }
  }
});
