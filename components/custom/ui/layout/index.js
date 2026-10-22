Component({
  options: {
    multipleSlots: true
  },

  properties: {
    // Navigation bar properties
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: true },
    transparent: { type: Boolean, value: false },
    showLogo: { type: Boolean, value: false },
    logoSrc: { type: String, value: '' },
    showNavBorder: { type: Boolean, value: true },

    // Kept for backward compatibility with existing page markup.
    showTabBar: { type: Boolean, value: true },
    activeTab: { type: String, value: '' },
    tabs: { type: Array, value: [] }
  },

  data: {
    navContentOffset: 88
  },

  lifetimes: {
    attached() {
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 20;
      const windowWidth = sysInfo.windowWidth || 375;
      const navPaddingBottomPx = Math.ceil(34 * windowWidth / 750);

      this.setData({ navContentOffset: statusBarHeight + 44 + navPaddingBottomPx });
    }
  }
});
