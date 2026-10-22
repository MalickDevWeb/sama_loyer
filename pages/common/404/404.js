// pages/common/404/404.js
import { storage } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 44,
    capsuleTop: 50,
    capsuleHeight: 32,
    capsuleWidth: 87,
    navTotalHeight: 88,
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
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 44;
      const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

      let capsuleTop = statusBarHeight + 6;
      let capsuleHeight = 32;
      let capsuleWidth = 87;
      let navTotalHeight = statusBarHeight + 44;

      if (menu && menu.top && menu.height) {
        capsuleTop = menu.top;
        capsuleHeight = menu.height;
        capsuleWidth = menu.width || 87;
        const gap = Math.max(menu.top - statusBarHeight, 4);
        navTotalHeight = menu.bottom + gap;
      }

      this.setData({
        statusBarHeight,
        capsuleTop,
        capsuleHeight,
        capsuleWidth,
        navTotalHeight,
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
