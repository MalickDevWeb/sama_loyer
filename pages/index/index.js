import { STORAGE_KEYS } from '../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 24,
    showDataModal: false,
    user: {
      name: 'Awa Ndiaye',
      phone: '+221 77 • • • • • 67'
    }
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}
  },

  onGoToSearch() {
    wx.switchTab({
      url: '/pages/home/home'
    });
  },

  onGoToPayRent() {
    wx.showModal({
      title: 'Payer mon loyer',
      content: 'Entrez le code de votre logement fourni par votre propriétaire ou continuez pour rechercher votre échéance.',
      editable: true,
      placeholderText: 'Ex: OUA-60K-01',
      confirmText: 'Valider',
      confirmColor: '#0D6B63',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          const code = (res.content || '').trim().toUpperCase();
          wx.showLoading({ title: 'Recherche de l’échéance...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showModal({
              title: 'Échéance trouvée 🏠',
              content: `Logement : Chambre salon à Ouakam\nLoyer du mois : 60 000 F CFA\nBénéficiaire : Mamadou Diallo (Bailleur)\n\nVoulez-vous payer avec Orange Money ?`,
              confirmText: 'Payer via OM',
              confirmColor: '#C8235F',
              cancelText: 'Annuler',
              success: (payRes) => {
                if (payRes.confirm) {
                  wx.showLoading({ title: 'Paiement en cours...' });
                  setTimeout(() => {
                    wx.hideLoading();
                    wx.showModal({
                      title: 'Paiement Confirmé ! 🎉',
                      content: 'Votre loyer de 60 000 F CFA a été réglé avec succès. Votre quittance électronique a été générée.',
                      showCancel: false,
                      confirmText: 'Voir ma quittance'
                    });
                  }, 1200);
                }
              }
            });
          }, 800);
        }
      }
    });
  },

  onOpenDataInfo() {
    this.setData({ showDataModal: true });
  },

  onCloseDataModal() {
    this.setData({ showDataModal: false });
  },

  onOpenLandlordSpace() {
    wx.showActionSheet({
      itemList: ['Accéder à l’espace Propriétaire / Bailleur', 'Publier une nouvelle annonce'],
      success: (res) => {
        try {
          wx.setStorageSync(STORAGE_KEYS.USER_ROLE, 'bailleur');
        } catch (e) {}

        if (res.tapIndex === 0) {
          wx.showModal({
            title: 'Espace Propriétaire 🏢',
            content: 'Bienvenue dans votre gestionnaire de biens. Vos logements actifs à Dakar et vos demandes de visites sont disponibles.',
            confirmText: 'Voir mes annonces',
            showCancel: false,
            success: () => {
              wx.switchTab({ url: '/pages/home/home' });
            }
          });
        } else {
          wx.showModal({
            title: 'Publier un logement',
            content: 'Renseignez l’adresse (Dakar), le type de bien, le montant du loyer et la caution.',
            confirmText: 'Commencer',
            showCancel: false,
            success: () => {
              wx.switchTab({ url: '/pages/home/home' });
            }
          });
        }
      }
    });
  }
});
