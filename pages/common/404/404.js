// pages/common/404/404.js
import { storage } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    requestedPath: '',
    popularZones: [
      { key: 'ouakam', label: 'Ouakam' },
      { key: 'pikine', label: 'Pikine' },
      { key: 'almadies', label: 'Almadies' },
      { key: 'ngor', label: 'Ngor' },
      { key: 'yoff', label: 'Yoff' },
      { key: 'mermoz', label: 'Mermoz' }
    ]
  },

  onLoad(options) {
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
        navBarHeight: Math.max(navBarHeight, 44),
        requestedPath: options && options.path ? decodeURIComponent(options.path) : ''
      });
    } catch (e) {}
  },

  onGoHome() {
    wx.switchTab({
      url: '/pages/client/home/home'
    });
  },

  onSelectZone(e) {
    const zone = e.currentTarget.dataset.zone;
    wx.navigateTo({
      url: `/pages/client/search/results?place=${encodeURIComponent(zone)}`
    });
  },

  onSearchAll() {
    wx.navigateTo({
      url: '/pages/client/search/results'
    });
  },

  onSwitchBailleur() {
    storage.set(STORAGE_KEYS.USER_ROLE, 'bailleur');
    wx.reLaunch({
      url: '/pages/bailleur/home/home'
    });
  }
});
