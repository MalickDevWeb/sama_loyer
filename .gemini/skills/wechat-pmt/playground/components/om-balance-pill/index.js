Component({
  properties: {
    balance: {
      type: Number,
      value: 45250
    },
    currency: {
      type: String,
      value: 'FCFA'
    }
  },

  data: {
    isMasked: false,
    isRefreshing: false
  },

  methods: {
    toggleMask() {
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {}
      this.setData({
        isMasked: !this.data.isMasked
      });
    },

    onRefresh() {
      if (this.data.isRefreshing) return;
      try {
        wx.vibrateShort({ type: 'light' });
      } catch (e) {}

      this.setData({ isRefreshing: true });
      this.triggerEvent('refresh');

      setTimeout(() => {
        this.setData({ isRefreshing: false });
        wx.showToast({ title: 'Solde actualisé', icon: 'success' });
      }, 1000);
    },

    onTopup() {
      try {
        wx.vibrateShort({ type: 'medium' });
      } catch (e) {}
      this.triggerEvent('topup');
    }
  }
});

