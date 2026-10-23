import {
  requireBailleurAccess,
  getBailleurAccount,
  getBailleurPayments,
  renewBailleurSubscription,
  addBailleurBoost,
  formatLongDate,
  BAILLEUR_PLANS
} from '../../../utils/helpers/store';

const MX_REDIRECT_MS = 1600;
const DAY_MS = 24 * 60 * 60 * 1000;

function fmt(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Boosts : payés à part avec Max it, uniquement avec un abonnement actif
const BOOSTS = {
  boost7: { id: 'boost7', title: 'Boost 7 jours', days: 7, price: 1500 },
  boost30: { id: 'boost30', title: 'Boost 30 jours', days: 30, price: 6000 }
};
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
      }
    ],
    // Abonnement réel (essai ou Pro), lu dans le compte bailleur
    sub: { planLabel: '', isTrial: false, untilText: '', daysLeft: 0 },
    proPriceText: `${fmt(BAILLEUR_PLANS.pro.price)} F`,
    mx: '', // '' | confirm | redirect | maxit | done
    pay: null, // { kind: 'renew' | 'boost', label, amountText, doneText }
    historyOpen: false,
    paiementsHistorique: [],
    basePaiements: [
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
    this.loadSubscription();
  },

  onUnload() {
    clearTimeout(this.mxTimer);
  },

  loadSubscription() {
    const account = getBailleurAccount() || {};
    const isTrial = account.plan === 'trial';
    this.setData({
      sub: {
        planLabel: isTrial ? 'Essai gratuit' : 'Pro mensuel',
        isTrial,
        untilText: account.expiresAt ? formatLongDate(account.expiresAt) : '',
        daysLeft: Math.max(0, Math.ceil(((account.expiresAt || 0) - Date.now()) / DAY_MS))
      },
      paiementsHistorique: getBailleurPayments().concat(this.data.basePaiements)
    });
  },

  onBack() {
    wx.navigateBack({ fail: () => wx.redirectTo({ url: '/pages/bailleur/profil/profil' }) });
  },

  onSelectOption(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({
      selectedOption: id,
      selectedPriceLabel: `${fmt(BOOSTS[id].price)} F`
    });
  },

  // --- Paiements Max it : renouvellement de l'abonnement ou boost -------------
  onRenew() {
    this.setData({
      mx: 'confirm',
      pay: {
        kind: 'renew',
        label: 'Abonnement Pro bailleur · 1 mois',
        amountText: this.data.proPriceText
      }
    });
  },

  onBoost() {
    const option = BOOSTS[this.data.selectedOption];
    if (!option) return;
    this.setData({
      mx: 'confirm',
      pay: { kind: 'boost', label: `${option.title} · 1 annonce`, amountText: `${fmt(option.price)} F` }
    });
  },

  onMxGo() {
    this.setData({ mx: 'redirect' });
    clearTimeout(this.mxTimer);
    this.mxTimer = setTimeout(() => this.setData({ mx: 'maxit' }), MX_REDIRECT_MS);
  },

  onMxValidate() {
    let doneText;
    if (this.data.pay.kind === 'renew') {
      const account = renewBailleurSubscription();
      doneText = `Abonnement Pro actif jusqu'au ${formatLongDate(account.expiresAt)}.`;
    } else {
      const boost = addBailleurBoost(BOOSTS[this.data.selectedOption]);
      doneText = `Ton annonce est en tête des recherches jusqu'au ${formatLongDate(boost.until)}.`;
    }
    this.loadSubscription();
    this.setData({ mx: 'done', 'pay.doneText': doneText });
  },

  onMxClose() {
    clearTimeout(this.mxTimer);
    this.setData({ mx: '', pay: null });
  },

  noop() {},

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
