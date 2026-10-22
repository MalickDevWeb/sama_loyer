// pages/bailleur/ajouter/ajouter.js
import { addStoredLogement } from '../../../utils/helpers/store';
import { formatMoney } from '../../../utils/mocks/logements';

Page({
  data: {
    statusBarHeight: 44,
    navBarHeight: 44,
    step: 1, // 1 -> 2 -> 3 -> 4 -> 5

    // Étape 1 : Type & Quartier
    typeList: ['Chambre salon', 'Chambre simple', 'Studio', 'Appartement F2', 'Maison'],
    selectedType: 'Chambre salon',
    quartierList: ['Ouakam', 'Pikine', 'Ngor', 'Yoff', 'Almadies', 'Grand Yoff', 'Mermoz', 'Liberté 6'],
    selectedQuartier: 'Ouakam',
    adresseDetail: '',

    // Étape 2 : Loyer & Caution
    loyer: 65000,
    cautionMonths: 1,
    loyerFormatted: '65 000',
    cautionFormatted: '65 000',
    totalEntreeFormatted: '130 000',

    // Étape 3 : Équipements & Description
    equipements: [
      { id: 'eq1', label: 'Toilettes privées', checked: true },
      { id: 'eq2', label: 'Compteur Woyofal individuel', checked: true },
      { id: 'eq3', label: 'Eau courante SDE', checked: true },
      { id: 'eq4', label: 'Balcon privatif', checked: false },
      { id: 'eq5', label: 'Climatisation', checked: false },
      { id: 'eq6', label: 'Meublé', checked: false }
    ],
    description: '',

    // Étape 4 : Photos & Vidéo
    hasVideo: true,
  },

  onLoad(options) {
    try {
      const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;
      const sysInfo = wx.getSystemInfoSync();
      const statusBarHeight = sysInfo.statusBarHeight || 44;
      let navBarHeight = 44;
      if (menuButton && menuButton.top) {
        navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
      }
      
      const initialStep = options && options.step ? Number(options.step) : 1;
      this.setData({
        statusBarHeight,
        navBarHeight: Math.max(navBarHeight, 44),
        step: initialStep
      });
    } catch (e) {}

    this.updateFinancialSummary();
  },

  updateFinancialSummary() {
    const loyer = Number(this.data.loyer) || 0;
    const caution = loyer * (this.data.cautionMonths || 1);
    const total = loyer + caution;
    this.setData({
      loyerFormatted: formatMoney(loyer),
      cautionFormatted: formatMoney(caution),
      totalEntreeFormatted: formatMoney(total)
    });
  },

  onClose() {
    if (this.data.step > 1 && this.data.step < 5) {
      this.setData({ step: this.data.step - 1 });
      return;
    }
    wx.redirectTo({
      url: '/pages/bailleur/home/home'
    });
  },

  // Étape 1 Handlers
  onSelectType(e) {
    this.setData({ selectedType: e.currentTarget.dataset.type });
  },

  onSelectQuartier(e) {
    this.setData({ selectedQuartier: e.currentTarget.dataset.quartier });
  },

  onInputAdresse(e) {
    this.setData({ adresseDetail: e.detail.value || '' });
  },

  // Étape 2 Handlers
  onInputLoyer(e) {
    const val = Number(e.detail.value) || 0;
    this.setData({ loyer: val }, () => {
      this.updateFinancialSummary();
    });
  },

  onSelectCaution(e) {
    const months = Number(e.currentTarget.dataset.months) || 1;
    this.setData({ cautionMonths: months }, () => {
      this.updateFinancialSummary();
    });
  },

  // Étape 3 Handlers
  onToggleEquipment(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.equipements.map(eq => {
      if (eq.id === id) {
        return { ...eq, checked: !eq.checked };
      }
      return eq;
    });
    this.setData({ equipements: updated });
  },

  onInputDescription(e) {
    this.setData({ description: e.detail.value || '' });
  },

  // Étape 4 Handlers
  onToggleVideo() {
    this.setData({ hasVideo: !this.data.hasVideo });
  },

  onNextStep() {
    if (this.data.step === 1 && !this.data.selectedType) {
      wx.showToast({ title: 'Sélectionnez un type', icon: 'none' });
      return;
    }
    if (this.data.step === 2 && !this.data.loyer) {
      wx.showToast({ title: 'Indiquez le montant du loyer', icon: 'none' });
      return;
    }
    this.setData({ step: this.data.step + 1 });
  },

  onPublishListing() {
    wx.showLoading({ title: 'Publication...' });

    const selectedEquips = this.data.equipements
      .filter(eq => eq.checked)
      .map(eq => eq.label);

    const placeStr = this.data.adresseDetail
      ? `${this.data.selectedQuartier}, ${this.data.adresseDetail}`
      : `${this.data.selectedQuartier}, Dakar`;

    const loyer = Number(this.data.loyer) || 60000;
    const caution = loyer * (this.data.cautionMonths || 1);

    // Enregistrement effectif dans le Store local !
    addStoredLogement({
      title: `${this.data.selectedType} à ${this.data.selectedQuartier}`,
      typeLabel: this.data.selectedType,
      place: placeStr,
      zone: this.data.selectedQuartier.toLowerCase(),
      price: loyer,
      caution: caution,
      avance: loyer,
      equipements: selectedEquips.length ? selectedEquips : ['Toilettes privées', 'Compteur Woyofal'],
      description: this.data.description || `${this.data.selectedType} situé à ${placeStr}.`,
      tint: '#FDE8EE',
      bailleurName: 'Moussa Diop',
      phone: '771234567'
    });

    setTimeout(() => {
      wx.hideLoading();
      this.setData({ step: 5 });
    }, 600);
  },

  onVoirAnnonces() {
    wx.redirectTo({
      url: '/pages/bailleur/annonces/annonces'
    });
  }
});
