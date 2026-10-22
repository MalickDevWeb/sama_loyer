import { MAIN_TABS } from '../../../utils/constants/index';

const TAB_BAR_URLS = MAIN_TABS.map((tab) => tab.url);

function isTabBarUrl(url) {
  return TAB_BAR_URLS.includes((url || '').split('?')[0]);
}

/**
 * Nav Bar Component
 * Custom navigation bar with safe area handling, back button, title, or centered logo.
 * Reads system status bar height to position content below the notch.
 *
 * @example
 * <!-- Usage with title & back button -->
 * <app-nav-bar title="Settings" showBack />
 *
 * <!-- Usage with centered logo instead of title & back button -->
 * <app-nav-bar showLogo="{{true}}" logoSrc="/assets/images/logo.png" />
 *
 * @property {string} title - Navigation bar title text
 * @property {boolean} showBack - Show back arrow (default: true)
 * @property {boolean} transparent - Use transparent background
 * @property {boolean} showLogo - Show centered logo instead of title/back button (default: false)
 * @property {string} logoSrc - Source path of the logo image
 */
Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: true },
    transparent: { type: Boolean, value: false },
    showLogo: { type: Boolean, value: false },
    logoSrc: { type: String, value: '' },
    showBorder: { type: Boolean, value: true },
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
    navContentHeight: 0,
    displayMode: 'default',
  },

  observers: {
    'showLogo, logoSrc': function(showLogo, logoSrc) {
      const displayMode = (showLogo && logoSrc) ? 'logo' : 'default';
      this.setData({ displayMode });
    }
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 20;

      const navContentHeight = 44;
      const navBarHeight = statusBarHeight + navContentHeight;

      this.setData({ statusBarHeight, navBarHeight, navContentHeight });
    },
  },

  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
        return;
      }

      const app = getApp();
      if (app && app.globalData.navHistory && app.globalData.navHistory.length > 0) {
        const prevUrl = app.globalData.navHistory.pop();

        if (isTabBarUrl(prevUrl)) {
          wx.switchTab({ url: prevUrl.split('?')[0] });
        } else {
          wx.redirectTo({ url: prevUrl });
        }
        return;
      }

      wx.switchTab({
        url: '/pages/home/home',
      });
    },
  },
});
