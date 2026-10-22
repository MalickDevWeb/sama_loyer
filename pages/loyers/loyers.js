Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    activeTab: 'echeance', // 'echeance' | 'caution' | 'recus'
    selectedPaymentMethod: 'orange_money', // 'orange_money' | 'wave'
    logement: {
      refContrat: 'SAMA-LOC-2026-089',
      title: 'Chambre salon avec douche intérieure',
      place: 'Icotaf, Pikine — Dakar',
      bailleurNom: 'Moussa D.',
      bailleurPhone: '77 123 45 67',
      loyerMensuel: '65 000',
      cautionMontant: '130 000',
      avanceMontant: '65 000',
      totalEntree: '195 000',
      dateEcheance: '05 Novembre 2026',
      moisActuel: 'Novembre 2026',
      statut: 'pending' // 'pending' | 'paid'
    },
    quittances: [
      {
        id: 'q1',
        title: 'Loyer Octobre 2026',
        montant: '65 000 F',
        datePaye: 'Payé le 5 oct. via Orange Money',
        ref: 'REC-782910',
        txId: 'OM-SN-9941203',
        status: 'Payé & Certifié',
        type: 'mensualite'
      },
      {
        id: 'q2',
        title: 'Loyer Septembre 2026',
        montant: '65 000 F',
        datePaye: 'Payé le 4 sept. via Wave',
        ref: 'REC-654120',
        txId: 'WV-SN-8821904',
        status: 'Payé & Certifié',
        type: 'mensualite'
      },
      {
        id: 'q3',
        title: 'Dépôt de Caution & Avance',
        montant: '195 000 F',
        datePaye: 'Consigné le 1er août via Orange Money',
        ref: 'CAU-901234',
        txId: 'OM-SN-7731201',
        status: 'Fonds Sécurisés',
        type: 'caution'
      }
    ],
    showReceiptModal: false,
    activeReceipt: null
  },

  onLoad() {
    try {
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const sys = wx.getSystemInfoSync();
      const statusBarHeight = sys.statusBarHeight || 44;
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

  onGoBack() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/profile/profile' });
      }
    });
  },

  onSelectTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  onSelectMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ selectedPaymentMethod: method });
  },

  onPayMensualite() {
    const montant = this.data.logement.loyerMensuel;
    const method = this.data.selectedPaymentMethod === 'orange_money' ? 'Orange Money' : 'Wave';
    
    wx.showModal({
      title: `Payer mon loyer (${method})`,
      content: `Confirmer le règlement de ${montant} FCFA pour le loyer de ${this.data.logement.moisActuel} à ${this.data.logement.bailleurNom} ?`,
      confirmText: 'Payer maintenant',
      confirmColor: '#C8235F',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: 'Validation du paiement...' });
          setTimeout(() => {
            wx.hideLoading();
            const recId = 'REC-' + Math.floor(100000 + Math.random() * 900000);
            const dateNow = new Date().toLocaleDateString('fr-FR');
            
            const newReceipt = {
              id: 'q-new',
              title: `Loyer ${this.data.logement.moisActuel}`,
              montant: `${montant} F`,
              datePaye: `Payé le ${dateNow} via ${method}`,
              ref: recId,
              txId: `${method === 'Orange Money' ? 'OM' : 'WV'}-SN-${Date.now().toString().slice(-7)}`,
              status: 'Payé & Certifié',
              type: 'mensualite'
            };

            const updatedList = [newReceipt, ...this.data.quittances];
            this.setData({
              'logement.statut': 'paid',
              quittances: updatedList,
              activeReceipt: newReceipt,
              showReceiptModal: true
            });

            wx.showToast({
              title: 'Loyer réglé avec succès !',
              icon: 'success',
              duration: 2000
            });
          }, 1000);
        }
      }
    });
  },

  onPayCaution() {
    const montant = this.data.logement.totalEntree;
    const method = this.data.selectedPaymentMethod === 'orange_money' ? 'Orange Money' : 'Wave';
    
    wx.showModal({
      title: `Règlement Caution & Avance (${method})`,
      content: `Confirmer le règlement de ${montant} FCFA (Caution: 130 000 F + Avance: 65 000 F) pour le logement à ${this.data.logement.place} ?`,
      confirmText: 'Payer et sécuriser',
      confirmColor: '#007C3D',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: 'Séquestre bancaire en cours...' });
          setTimeout(() => {
            wx.hideLoading();
            const recId = 'CAU-' + Math.floor(100000 + Math.random() * 900000);
            const dateNow = new Date().toLocaleDateString('fr-FR');
            
            const newReceipt = {
              id: 'q-cau-new',
              title: 'Caution & Avance consignées',
              montant: `${montant} F`,
              datePaye: `Consigné le ${dateNow} via ${method}`,
              ref: recId,
              txId: `${method === 'Orange Money' ? 'OM' : 'WV'}-SN-${Date.now().toString().slice(-7)}`,
              status: 'Fonds Sécurisés',
              type: 'caution'
            };

            const updatedList = [newReceipt, ...this.data.quittances];
            this.setData({
              quittances: updatedList,
              activeReceipt: newReceipt,
              showReceiptModal: true,
              activeTab: 'recus'
            });

            wx.showToast({
              title: 'Caution sécurisée !',
              icon: 'success'
            });
          }, 1200);
        }
      }
    });
  },

  onViewReceipt(e) {
    const receipt = e.currentTarget.dataset.receipt;
    this.setData({
      activeReceipt: receipt,
      showReceiptModal: true
    });
  },

  onCloseReceiptModal() {
    this.setData({
      showReceiptModal: false,
      activeReceipt: null
    });
  },

  onDownloadPDF() {
    wx.showLoading({ title: 'Téléchargement PDF...' });
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: 'Quittance PDF enregistrée',
        icon: 'success'
      });
      this.onCloseReceiptModal();
    }, 600);
  }
});
