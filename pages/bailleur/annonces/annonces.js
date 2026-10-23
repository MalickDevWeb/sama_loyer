// pages/bailleur/annonces/annonces.js
import { getStoredBailleurAnnonces, confirmBailleurAnnonce } from '../../../utils/helpers/store';
import { storage } from '../../../utils/storage';
import { withCover } from '../../../utils/mocks/media';
import { requireBailleurAccess } from '../../../utils/helpers/store';
import { COLORS } from '../../../utils/constants/theme';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    statusBarHeight: 44,
    headerPaddingTop: 92,
    activeFilter: 'all', // all | en_ligne | validation | loue
    annonces: [],
    filteredAnnonces: [],
    counts: { all: 0, en_ligne: 0, validation: 0, loue: 0 },
    expandedMap: {} // { [id]: boolean } pour déplier/replier avec "Voir plus"
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      const sb = sys.statusBarHeight || 44;
      let headerPaddingTop = sb + 48;
      if (typeof wx.getMenuButtonBoundingClientRect === 'function') {
        const rect = wx.getMenuButtonBoundingClientRect();
        if (rect && rect.bottom) {
          headerPaddingTop = rect.bottom + 12;
        }
      }
      this.setData({
        statusBarHeight: sb,
        headerPaddingTop: headerPaddingTop
      });
    } catch (e) {
      this.setData({ headerPaddingTop: 92 });
    }

    this.loadAnnonces();
  },

  onShow() {
    // Sans abonnement actif, aucun accès : retour à l'accueil verrouillé
    if (!requireBailleurAccess()) return;
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-annonces' });
    }
    this.loadAnnonces();
  },

  loadAnnonces() {
    const annonces = getStoredBailleurAnnonces();
    this.setData({ annonces }, () => {
      this.applyFilter(this.data.activeFilter);
    });
  },

  onFilterSelect(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ activeFilter: filter });
    this.applyFilter(filter);
  },

  applyFilter(filter) {
    let list = this.data.annonces;
    if (filter === 'en_ligne') {
      list = list.filter(a => a.type === 'en_ligne');
    } else if (filter === 'validation') {
      list = list.filter(a => a.type === 'validation');
    } else if (filter === 'loue') {
      list = list.filter(a => a.type === 'loue');
    }
    const all = this.data.annonces;
    const counts = {
      all: all.length,
      en_ligne: all.filter(a => a.type === 'en_ligne').length,
      validation: all.filter(a => a.type === 'validation').length,
      loue: all.filter(a => a.type === 'loue').length
    };
    this.setData({ filteredAnnonces: list.map(withCover), counts });
  },

  onToggleExpand(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;
    const expandedMap = { ...this.data.expandedMap };
    expandedMap[id] = !expandedMap[id];
    this.setData({ expandedMap });
  },

  onConfirmDispo(e) {
    const id = e.currentTarget.dataset.id;
    const updated = confirmBailleurAnnonce(id);

    this.setData({ annonces: updated });
    this.applyFilter(this.data.activeFilter);
    wx.showToast({
      title: 'Disponibilité confirmée (7 jours)',
      icon: 'success'
    });
  },

  onMarkLoue(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Marquer comme loué ?',
      content: 'Ce logement sera retiré des résultats de recherche des locataires.',
      confirmText: "Oui, c'est loué",
      confirmColor: COLORS.navy,
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          const updated = this.data.annonces.map(a => {
            if (a.id === id) {
              return {
                ...a,
                tag: 'Loué',
                tagClass: 'tag-loue',
                type: 'loue',
                notice: 'Annonce retirée des recherches. Les locataires ne la voient plus.',
                noticeClass: 'notice-gray',
                canRelist: true,
                isConfirmed: false,
                needsConfirm: false
              };
            }
            return a;
          });
          storage.set('sama_bailleur_annonces', updated);
          this.setData({ annonces: updated });
          this.applyFilter(this.data.activeFilter);
          wx.showToast({ title: 'Logement marqué loué' });
        }
      }
    });
  },

  onRelist(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.annonces.map(a => {
      if (a.id === id) {
        return {
          ...a,
          tag: 'En ligne · Vérifié',
          tagClass: 'tag-enligne',
          type: 'en_ligne',
          notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
          noticeClass: 'notice-gray',
          canRelist: false,
          isConfirmed: true,
          needsConfirm: false
        };
      }
      return a;
    });
    storage.set('sama_bailleur_annonces', updated);
    this.setData({ annonces: updated });
    this.applyFilter(this.data.activeFilter);
    wx.showToast({ title: 'Remis en location ✓', icon: 'success' });
  },

  // Bouton « + » en haut de l'onglet (et Corriger / Modifier) : ouvre le formulaire d'ajout
  onGoAjouter() {
    wx.navigateTo({
      url: '/pages/bailleur/ajouter/ajouter'
    });
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${id}`
    });
  }
});
