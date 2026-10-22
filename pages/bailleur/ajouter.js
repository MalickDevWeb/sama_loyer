Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44
  },

  onLoad() {
    try {
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 44;
      let navBarHeight = 44;
      if (menuButton && menuButton.top) {
        navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
      }
      this.setData({
        statusBarHeight,
        navBarHeight: Math.max(navBarHeight, 44)
      });
    } catch (e) {}
  },

  onClose() {
    wx.redirectTo({
      url: '/pages/bailleur/home'
    });
  },

  onVoirAnnonces() {
    wx.redirectTo({
      url: '/pages/bailleur/annonces'
    });
  }
});
