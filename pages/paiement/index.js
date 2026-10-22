Page({
  data: {
    statusBarHeight: 24,
    echeance: {
      refLocation: 'SAMA-LOC-2026-089',
      logementTitre: 'Chambre salon avec douche intérieure',
      quartier: 'Icotaf, Pikine — Dakar',
      periode: 'Novembre 2026',
      bailleurNom: 'Moussa D. (Propriétaire certifié)',
      loyer: '65 000',
      fraisService: '0',
      total: '65 000',
      dateEcheance: '05 Novembre 2026'
    },
    payerPhone: '77 123 45 67',
    paymentMethod: 'orange_money', // 'orange_money' | 'wave'
    isProcessing: false,
    showReceiptModal: false,
    receiptData: null
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}
  },

  onBackTap() {
    wx.navigateBack({
      fail: () => {
        wx.switchTab({ url: '/pages/home/home' });
      }
    });
  },

  onSelectMethod(e) {
    const method = e.currentTarget.dataset.method;
    this.setData({ paymentMethod: method });
  },

  onPayRent() {
    this.setData({ isProcessing: true });
    wx.showLoading({ title: 'Connexion Orange Money...' });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isProcessing: false });

      // Generate receipt
      const recId = 'REC-' + Math.floor(100000 + Math.random() * 900000);
      const omTx = 'OM-SN-' + Date.now().toString().slice(-8);
      const dateNow = new Date();
      const dateFormatted = `${dateNow.toLocaleDateString('fr-FR')} à ${String(dateNow.getHours()).padStart(2, '0')}:${String(dateNow.getMinutes()).padStart(2, '0')}`;

      const receipt = {
        recId,
        omTx,
        dateFormatted,
        montant: this.data.echeance.total,
        periode: this.data.echeance.periode,
        bailleur: this.data.echeance.bailleurNom,
        logement: this.data.echeance.logementTitre,
        quartier: this.data.echeance.quartier,
        ref: this.data.echeance.refLocation
      };

      this.setData({
        receiptData: receipt,
        showReceiptModal: true
      });
    }, 1800);
  },

  onCloseReceipt() {
    this.setData({ showReceiptModal: false });
    wx.switchTab({ url: '/pages/home/home' });
  },

  onShareReceipt() {
    wx.setClipboardData({
      data: `Quittance SAMA LOGEMENT N° ${this.data.receiptData.recId}\nMontant : ${this.data.receiptData.montant} FCFA\nPériode : ${this.data.receiptData.periode}\nBénéficiaire : ${this.data.receiptData.bailleur}\nTransaction OM : ${this.data.receiptData.omTx}`,
      success: () => {
        wx.showToast({ title: 'Quittance copiée', icon: 'success' });
      }
    });
  }
});
