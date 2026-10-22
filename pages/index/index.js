import { storage } from '../../utils/storage.js';
import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { STORAGE_KEYS } from '../../utils/constants/index';

Page({
  data: {
    statusBarHeight: 24,
    currentRole: 'client', // 'client' | 'bailleur'
    user: {
      name: 'Awa Ndiaye',
      phone: '+221 77 123 45 67',
      initials: 'AN',
      status: 'Compte Max it certifié'
    },
    // Données Locataire
    locataireQuittances: [
      { id: 'REC-892110', mois: 'Octobre 2026', montant: '60 000 FCFA', date: '02/10/2026', bailleur: 'Mamadou Diallo' },
      { id: 'REC-773421', mois: 'Septembre 2026', montant: '60 000 FCFA', date: '03/09/2026', bailleur: 'Mamadou Diallo' }
    ],
    locataireVisites: [
      { id: 'v-1', logement: 'Chambre salon avec douche intérieure', lieu: 'Icotaf, Pikine', date: 'Samedi 24 oct. à 16h', statut: 'Confirmée' }
    ],

    // Données Bailleur (Conforme Cahier des Charges)
    bailleurBiens: [
      {
        id: 'prop-1',
        titre: 'Chambre salon carrelée',
        quartier: 'Ouakam, Tonghor',
        prix: '55 000 FCFA/mois',
        statut: 'Disponible',
        derniereConfirmation: 'Il y a 3 jours',
        needsReconfirmation: false,
        vues: 142,
        demandes: 4
      },
      {
        id: 'prop-2',
        titre: 'Studio neuf indépendant',
        quartier: 'Sacré-Cœur 3',
        prix: '120 000 FCFA/mois',
        statut: 'À reconfirmer',
        derniereConfirmation: 'Il y a 8 jours',
        needsReconfirmation: true,
        vues: 310,
        demandes: 9
      }
    ],

    // Modal publication bien
    showPublishModal: false,
    newProp: {
      titre: '',
      type: 'Chambre salon',
      quartier: 'Ouakam',
      prix: '',
      caution: ''
    }
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {}

    try {
      const role = storage.get(STORAGE_KEYS.USER_ROLE, 'client');
      this.setData({ currentRole: role });
    } catch (e) {}
  },

  onShow() {
    setCustomTabBarActive(this, 'profile');
  },

  onSwitchRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({ currentRole: role });
    try {
      storage.set(STORAGE_KEYS.USER_ROLE, role);
    } catch (err) {}
    wx.showToast({
      title: role === 'bailleur' ? 'Espace Bailleur activé 🏢' : 'Mode Locataire activé 🏠',
      icon: 'none'
    });
  },

  onReconfirmDispo(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.bailleurBiens.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          statut: 'Disponible',
          derniereConfirmation: 'Confirmé aujourd’hui',
          needsReconfirmation: false
        };
      }
      return b;
    });

    this.setData({ bailleurBiens: updated });
    wx.showToast({
      title: 'Disponibilité confirmée pour 7 jours ! ✓',
      icon: 'success'
    });
  },

  onOpenPublish() {
    this.setData({ showPublishModal: true });
  },

  onClosePublish() {
    this.setData({ showPublishModal: false });
  },

  onInputPublishTitle(e) {
    this.setData({ 'newProp.titre': e.detail.value });
  },

  onInputPublishPrice(e) {
    this.setData({ 'newProp.prix': e.detail.value });
  },

  onInputPublishQuartier(e) {
    this.setData({ 'newProp.quartier': e.detail.value });
  },

  onSubmitNewProperty() {
    const p = this.data.newProp;
    if (!p.titre || !p.prix) {
      wx.showToast({ title: 'Veuillez saisir un titre et un prix', icon: 'none' });
      return;
    }

    const newItem = {
      id: 'prop-' + Date.now(),
      titre: p.titre,
      quartier: p.quartier + ' — Dakar',
      prix: p.prix + ' FCFA/mois',
      statut: 'Disponible',
      derniereConfirmation: 'Confirmé aujourd’hui',
      needsReconfirmation: false,
      vues: 1,
      demandes: 0
    };

    this.setData({
      bailleurBiens: [newItem, ...this.data.bailleurBiens],
      showPublishModal: false,
      newProp: { titre: '', type: 'Chambre salon', quartier: 'Ouakam', prix: '', caution: '' }
    });

    wx.showModal({
      title: 'Logement publié ! 🎉',
      content: `Votre annonce "${newItem.titre}" à ${newItem.quartier} est en ligne. Sa disponibilité est certifiée pour 7 jours.`,
      showCancel: false,
      confirmText: 'Super'
    });
  },

  onDownloadQuittance(e) {
    const q = e.currentTarget.dataset.q;
    wx.showModal({
      title: `Quittance N° ${q.id}`,
      content: `Période : ${q.mois}\nMontant : ${q.montant}\nBénéficiaire : ${q.bailleur}\nDate : ${q.date}\n\nDocument certifié conforme par SAMA LOGEMENT.`,
      confirmText: 'Copier les détails',
      success: (res) => {
        if (res.confirm) {
          wx.setClipboardData({
            data: `Quittance ${q.id} - ${q.mois} - ${q.montant} réglé à ${q.bailleur}`
          });
        }
      }
    });
  }
});
