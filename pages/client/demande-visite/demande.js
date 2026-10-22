import { getLogementById } from '../../../utils/mocks/logements';
import { addVisite } from '../../../utils/helpers/visites';

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

Page({
  data: {
    logement: null,
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

  onLoad(options) {
    const l = getLogementById(options && options.id ? decodeURIComponent(options.id) : 'icotaf-01');
    if (l) {
      this.setData({
        logement: {
          id: l.id,
          title: l.title,
          sub: `${l.place} · ${formatMoney(l.price)} FCFA/mois`,
          bailleur: `Bailleur : ${l.bailleurName}`
        }
      });
    }

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
      const id = this.data.logement ? this.data.logement.id : '';
      wx.redirectTo({ url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(id)}` });
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

    if (!this.data.logement) return;

    wx.showLoading({ title: 'Envoi en cours...' });
    setTimeout(() => {
      wx.hideLoading();
      addVisite(this.data.logement.id, this.data.selectedSlot, (this.data.message || '').trim());
      wx.showToast({
        title: 'Demande envoyée !',
        icon: 'success',
        duration: 1500
      });

      setTimeout(() => {
        // Visites est un onglet : switchTab (redirectTo échoue sur un onglet)
        wx.switchTab({ url: '/pages/client/visites/visites' });
      }, 1500);
    }, 600);
  }
});

