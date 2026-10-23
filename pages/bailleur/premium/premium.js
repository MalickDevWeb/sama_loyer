import { requireBailleurAccess } from '../../../utils/helpers/store';
Page({
  data: {
    statusBarHeight: 44,
    selectedOption: 'boost30',
    selectedPriceLabel: '6 000 F',
    boostOptions: [
      {
        id: 'boost7',
        title: 'Boost 7 jours',
        sub: '1 annonce en haut des recherches',
        priceLabel: '1 500 F',
        badge: ''
      },
      {
        id: 'boost30',
        title: 'Boost 30 jours',
        sub: '1 annonce · le plus choisi',
        priceLabel: '6 000 F',
        badge: 'le plus choisi'
      },
      {
        id: 'renew',
        title: 'Renouveler Pro',
        sub: '1 mois · 3 annonces mises en avant',
        priceLabel: '15 000 F',
        badge: ''
      }
    ],
    historyOpen: false,
    paiementsHistorique: [
      {
        id: 'p1',
        type: 'debit',
        title: 'Abonnement Pro mensuel',
        meta: '15 oct. 2026 · Max it',
        amount: '- 15 000 F',
        amountClass: 'amount-debit'
      },
      {
        id: 'p2',
        type: 'credit',
        title: 'Loyer · Maison Pikine Nord',
        meta: '5 oct. 2026 · Max it',
        amount: '+ 160 000 F',
        amountClass: 'amount-credit'
      },
      {
        id: 'p3',
        type: 'credit',
        title: 'Loyer · Chambre Thiaroye',
        meta: '3 oct. 2026 · Max it',
        amount: '+ 45 000 F',
        amountClass: 'amount-credit'
      },
      {
        id: 'p4',
        type: 'debit',
        title: 'Boost 7 jours · Studio',
        meta: '28 sept. 2026 · Max it',
        amount: '- 1 500 F',
        amountClass: 'amount-debit'
      }
    ]
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-profil' });
    }
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.redirectTo({ url: '/pages/bailleur/profil/profil' }) });
  },

  onSelectOption(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedOption: id
    });
  },

  onPayAction() {
    wx.showModal({
      title: 'Payer',
      content: 'Valider le paiement pour activer cette formule.',
      confirmText: 'Payer',
      confirmColor: '#C8235F',
      cancelText: 'Annuler',
      success: (res) => {
        if (!res.confirm) return;
        wx.showLoading({ title: 'Paiement...' });
        setTimeout(() => {
          wx.hideLoading();
          wx.showToast({
            title: 'Paiement confirmé !',
            icon: 'success'
          });
        }, 800);
      }
    });
  },

  onToggleHistory() {
    this.setData({ historyOpen: !this.data.historyOpen });
  },

  onDownloadRecus() {
    wx.showLoading({ title: 'Génération du PDF...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showModal({
        title: 'Reçus générés 📄',
        content: 'Vos reçus officiels certifiés pour la période ont été préparés.',
        confirmText: 'Ouvrir',
        confirmColor: '#0F1E3D',
        cancelText: 'Fermer',
        success: (res) => {
          if (res.confirm) {
            wx.showToast({ title: 'Reçu téléchargé', icon: 'success' });
          }
        }
      });
    }, 700);
  }
});
