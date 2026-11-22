Component({
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    amount: {
      type: Number,
      value: 0
    },
    formattedAmount: {
      type: String,
      value: '0'
    },
    receiver: {
      type: String,
      value: '141414'
    },
    receiverName: {
      type: String,
      value: 'SAMU National'
    },
    description: {
      type: String,
      value: 'Prestation médicale SAMU'
    },
    orderId: {
      type: String,
      value: ''
    }
  },

  data: {
    isInsufficient: false,
    currentBalance: '150 000'
  },

  methods: {
    handleConfirm() {
      if (this.data.isInsufficient) {
        wx.showToast({
          title: 'Votre solde est insuffisant',
          icon: 'none',
          duration: 2000
        });
        return;
      }

      const txnid = 'MP-SIM-' + Date.now();
      this.triggerEvent('confirm', {
        orderId: this.data.orderId,
        amount: this.data.amount,
        txnid: txnid
      });
    },

    handleCancel() {
      this.triggerEvent('cancel');
    },

    toggleScenario() {
      const nextInsufficient = !this.data.isInsufficient;
      this.setData({
        isInsufficient: nextInsufficient,
        currentBalance: nextInsufficient ? '39' : '150 000'
      });
    }
  }
});
