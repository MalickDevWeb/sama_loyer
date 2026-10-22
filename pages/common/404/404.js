// pages/common/404/404.js
import { storage } from '../../../utils/storage';
import { STORAGE_KEYS } from '../../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 44,
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
      this.setData({
        statusBarHeight: sysInfo.statusBarHeight || 44,
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
