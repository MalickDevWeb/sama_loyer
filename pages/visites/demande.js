Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    selectedSlot: 'Samedi 24 octobre · 16 h',
    message: '',
    slotGroups: [
      {
        date: 'Vendredi 23 octobre',
        times: ['17 h', '18 h']
      },
      {
        date: 'Samedi 24 octobre',
        times: ['10 h', '12 h', '16 h']
      },
      {
        date: 'Dimanche 25 octobre',
        times: ['11 h']
      },
      {
        date: 'Lundi 26 octobre',
        times: ['18 h']
      }
    ]
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
    } catch (e) {
      // fallback defaults
    }
  },

  onGoBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack({ delta: 1 });
    } else {
      wx.redirectTo({ url: '/pages/logement-detail/logement-detail' });
    }
  },

  onSelectSlot(e) {
    const { date, time } = e.currentTarget.dataset;
    this.setData({
      selectedSlot: `${date} · ${time}`
    });
  },

  onInputMessage(e) {
    this.setData({
      message: e.detail.value
    });
  },

  onSubmitDemande() {
    if (!this.data.selectedSlot) {
      wx.showToast({ title: 'Choisis un créneau', icon: 'none' });
      return;
    }

    wx.showLoading({ title: 'Envoi en cours...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: 'Demande envoyée !',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/visites/visites'
        });
      }, 1500);
    }, 600);
  }
});

