Component({
  properties: {
    backgroundColor: {
      type: String,
      value: '#FFFFFF'
    },
    showBorder: {
      type: Boolean,
      value: false
    }
  },

  data: {
    statusBarHeight: 44
  },

  lifetimes: {
    attached() {
      try {
        const sys = wx.getSystemInfoSync();
        this.setData({
          statusBarHeight: sys.statusBarHeight || 44
        });
      } catch (e) {}
    }
  }
});
