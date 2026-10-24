// pages/bailleur/annonces/annonces.js
import { getStoredBailleurAnnonces, confirmBailleurAnnonce } from '../../../utils/helpers/store';
import { storage } from '../../../utils/storage';
import { withCover } from '../../../utils/mocks/media';
import { requireBailleurAccess } from '../../../utils/helpers/store';
import { COLORS } from '../../../utils/constants/theme';
import { bailleurGuardBehavior } from '../../../utils/behaviors/index';
import { backendAPI } from '../../../utils/apis/index.js';
import { logementLink, shortCode } from '../../../utils/helpers/sama-links';
import { getCanvas, drawPoster, exportCanvas, saveToAlbum } from '../../../utils/helpers/qr-canvas';
import { createZipArchive } from '../../../utils/helpers/zip';

Page({
  // Bloque la page si l'essai ou l'abonnement se termine pendant qu'elle est affichée
  behaviors: [bailleurGuardBehavior],

  data: {
    uiState: 'content', // 'loading' | 'content' | 'error'
    statusBarHeight: 44,
    headerPaddingTop: 92,
    activeFilter: 'all', // all | en_ligne | validation | loue
    annonces: [],
    filteredAnnonces: [],
    counts: { all: 0, en_ligne: 0, validation: 0, loue: 0 },
    expandedMap: {}, // { [id]: boolean } pour déplier/replier avec "Voir plus"
    // Téléchargement groupé QR
    batchModalOpen: false,
    batchFilter: 'all', // all | en_ligne | loue
    selectedIds: [],
    selectedMap: {},
    visibleBatchAnnonces: [],
    isAllSelected: false,
    batchCanvasActive: false,
    isBatchSaving: false,
    batchSaveProgressText: ''
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

  async loadAnnonces() {
    this.setData({ uiState: 'loading' });
    let annonces = [];
    try {
      annonces = await backendAPI.getBailleurAnnonces();
    } catch (e) {
      annonces = getStoredBailleurAnnonces();
    }
    this.setData({ annonces, uiState: 'content' }, () => {
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
      confirmText: 'Confirmer',
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

  // --- Téléchargement Groupé des affiches QR -------------------
  onOpenBatchQr() {
    const list = this.data.annonces.map(withCover);
    // Par défaut, on présélectionne les logements en ligne et loués (ceux qui ont un QR utile)
    const validIds = list.filter((a) => a.type === 'en_ligne' || a.type === 'loue').map((a) => a.id);
    const selectedMap = {};
    validIds.forEach((id) => { selectedMap[id] = true; });

    this.setData({
      batchModalOpen: true,
      batchFilter: 'all',
      selectedIds: validIds,
      selectedMap,
      visibleBatchAnnonces: list,
      isAllSelected: validIds.length > 0 && validIds.length === list.length,
      isBatchSaving: false
    });
  },

  noop() {},

  onCloseBatchModal() {
    if (this.data.isBatchSaving) return;
    this.setData({ batchModalOpen: false, batchCanvasActive: false });
  },

  onBatchFilterSelect(e) {
    const filter = e.currentTarget.dataset.filter || 'all';
    let visible = this.data.annonces.map(withCover);
    if (filter !== 'all') {
      visible = visible.filter((a) => a.type === filter);
    }
    const allChecked = visible.length > 0 && visible.every((a) => !!this.data.selectedMap[a.id]);
    this.setData({
      batchFilter: filter,
      visibleBatchAnnonces: visible,
      isAllSelected: allChecked
    });
  },

  onToggleItemSelect(e) {
    const id = e.currentTarget.dataset.id;
    if (!id || this.data.isBatchSaving) return;
    const selectedMap = { ...this.data.selectedMap };
    selectedMap[id] = !selectedMap[id];
    const selectedIds = Object.keys(selectedMap).filter((k) => !!selectedMap[k]);
    const visible = this.data.visibleBatchAnnonces;
    const allChecked = visible.length > 0 && visible.every((a) => !!selectedMap[a.id]);

    this.setData({
      selectedMap,
      selectedIds,
      isAllSelected: allChecked
    });
  },

  onToggleSelectAll() {
    if (this.data.isBatchSaving) return;
    const visible = this.data.visibleBatchAnnonces;
    const currentlyAll = this.data.isAllSelected;
    const selectedMap = { ...this.data.selectedMap };

    visible.forEach((a) => {
      selectedMap[a.id] = !currentlyAll;
    });

    const selectedIds = Object.keys(selectedMap).filter((k) => !!selectedMap[k]);
    this.setData({
      selectedMap,
      selectedIds,
      isAllSelected: !currentlyAll
    });
  },

  async onDownloadSelectedPosters() {
    const { selectedIds, annonces, isBatchSaving } = this.data;
    if (!selectedIds.length || isBatchSaving) return;

    const targets = annonces.filter((a) => selectedIds.includes(a.id));
    if (!targets.length) return;

    this.setData({
      isBatchSaving: true,
      batchCanvasActive: true,
      batchSaveProgressText: `Préparation (0/${targets.length})...`
    });

    const isMulti = targets.length > 1;
    wx.showLoading({
      title: isMulti ? `Affiche 1/${targets.length}...` : 'Création affiche...',
      mask: true
    });

    try {
      // Échelle 1 : 620px × 877px A6, génération instantanée (15-30ms) sans freeze mémoire
      const { canvas, ctx } = await getCanvas(this, '#batch-qa-canvas', 1);
      const filesToZip = [];
      const generatedPaths = [];

      for (let i = 0; i < targets.length; i++) {
        const a = targets[i];
        const progressLabel = isMulti
          ? `Affiche ${i + 1}/${targets.length}`
          : `Création affiche...`;
        
        this.setData({ batchSaveProgressText: `${progressLabel} : ${a.title.slice(0, 14)}...` });
        wx.showLoading({ title: progressLabel, mask: true });

        const posterData = {
          title: a.title,
          place: String(a.placeName || '').replace(/\s*·\s*$/, ''),
          priceText: `${a.price} / mois`,
          rented: a.type === 'loue',
          link: logementLink(a.id),
          code: shortCode(a.id)
        };

        // Dessin vectoriel immédiat de l'affiche
        drawPoster(ctx, 620, posterData);

        // Export PNG natif haute rapidité
        const filePath = await exportCanvas(canvas, 4000);
        generatedPaths.push(filePath);

        if (!isMulti) {
          // Exactement 1 affiche sélectionnée : enregistrement unique dans la galerie
          try {
            await saveToAlbum(filePath);
          } catch (saveErr) {
            console.warn('saveToAlbum warn:', saveErr);
          }
        } else {
          // Plus d'une affiche : PAS d'enregistrement une par une dans la galerie, UNIQUEMENT dans l'archive ZIP
          const fsm = wx.getFileSystemManager();
          const fileData = fsm.readFileSync(filePath);
          const cleanName = String(a.title || 'affiche')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9_-]/g, '_')
            .slice(0, 30);
          filesToZip.push({
            name: `affiche_${cleanName}_${a.id}.png`,
            data: fileData
          });
        }
      }

      if (isMulti) {
        wx.showLoading({ title: 'Création du ZIP...', mask: true });
        this.setData({ batchSaveProgressText: 'Création du ZIP...' });
        const zipBuffer = createZipArchive(filesToZip);
        const fsm = wx.getFileSystemManager();
        const zipPath = `${wx.env.USER_DATA_PATH}/affiches-qr-sama-loyer.zip`;
        fsm.writeFileSync(zipPath, zipBuffer);
      }

      wx.hideLoading();
      this.setData({
        isBatchSaving: false,
        batchModalOpen: false,
        batchCanvasActive: false
      });

      const openPreview = () => {
        if (typeof wx.previewImage === 'function' && generatedPaths.length) {
          wx.previewImage({
            current: generatedPaths[0],
            urls: generatedPaths
          });
        }
      };

      if (isMulti) {
        wx.showModal({
          title: `Archive ZIP prête (${targets.length} affiches)`,
          content: `Toutes vos ${targets.length} affiches A6 sont réunies dans 1 seul fichier ZIP : "affiches-qr-sama-loyer.zip".\n\nAucune photo n'a été ajoutée individuellement dans votre galerie.\n\nAppuyez sur "Partager ZIP" pour exporter ou envoyer le fichier.`,
          confirmText: 'Partager ZIP',
          cancelText: 'Fermer',
          confirmColor: '#C8235F',
          success: (res) => {
            if (res.confirm) {
              const zipPath = `${wx.env.USER_DATA_PATH}/affiches-qr-sama-loyer.zip`;
              if (typeof wx.shareFileMessage === 'function') {
                wx.shareFileMessage({
                  filePath: zipPath,
                  fileName: 'affiches-qr-sama-loyer.zip',
                  success: () => wx.showToast({ title: 'ZIP partagé !', icon: 'success' }),
                  fail: (err) => {
                    console.warn('shareFileMessage fallback:', err);
                    if (typeof wx.saveFileToDisk === 'function') {
                      wx.saveFileToDisk({
                        filePath: zipPath,
                        fileName: 'affiches-qr-sama-loyer.zip',
                        success: () => wx.showToast({ title: 'ZIP enregistré !', icon: 'success' })
                      });
                    } else {
                      wx.showToast({ title: 'ZIP prêt', icon: 'success' });
                    }
                  }
                });
              } else if (typeof wx.saveFileToDisk === 'function') {
                wx.saveFileToDisk({
                  filePath: zipPath,
                  fileName: 'affiches-qr-sama-loyer.zip',
                  success: () => wx.showToast({ title: 'ZIP enregistré !', icon: 'success' })
                });
              } else {
                wx.showToast({ title: 'ZIP prêt', icon: 'success' });
              }
            }
          }
        });
      } else {
        wx.showModal({
          title: 'Affiche enregistrée !',
          content: 'Votre affiche A6 a été enregistrée dans votre galerie photo.',
          showCancel: false,
          confirmText: 'Parfait',
          confirmColor: '#C8235F'
        });
      }
    } catch (err) {
      wx.hideLoading();
      this.setData({ isBatchSaving: false, batchCanvasActive: false });
      const authDenied = err && (err.errMsg || '').includes('auth deny');
      wx.showModal({
        title: authDenied ? 'Accès galerie requis' : 'Enregistrement interrompu',
        content: authDenied
          ? 'Autorisez l\'accès à la galerie dans les paramètres pour enregistrer les affiches.'
          : 'Impossible de terminer la sauvegarde des affiches. Vérifiez votre espace disponible.',
        showCancel: false,
        confirmText: 'Compris',
        confirmColor: '#C8235F'
      });
    }
  },

    noop() {},

  onCloseBatchModal() {
    if (this.data.isBatchSaving) return;
    this.setData({ batchModalOpen: false, batchCanvasActive: false });
  },

  onBatchFilterSelect(e) {
    const filter = e.currentTarget.dataset.filter || 'all';
    let visible = this.data.annonces.map(withCover);
    if (filter !== 'all') {
      visible = visible.filter((a) => a.type === filter);
    }
    const allChecked = visible.length > 0 && visible.every((a) => !!this.data.selectedMap[a.id]);
    this.setData({
      batchFilter: filter,
      visibleBatchAnnonces: visible,
      isAllSelected: allChecked
    });
  },

  onToggleItemSelect(e) {
    const id = e.currentTarget.dataset.id;
    if (!id || this.data.isBatchSaving) return;
    const selectedMap = { ...this.data.selectedMap };
    selectedMap[id] = !selectedMap[id];
    const selectedIds = Object.keys(selectedMap).filter((k) => !!selectedMap[k]);
    const visible = this.data.visibleBatchAnnonces;
    const allChecked = visible.length > 0 && visible.every((a) => !!selectedMap[a.id]);

    this.setData({
      selectedMap,
      selectedIds,
      isAllSelected: allChecked
    });
  },

  onToggleSelectAll() {
    if (this.data.isBatchSaving) return;
    const visible = this.data.visibleBatchAnnonces;
    const currentlyAll = this.data.isAllSelected;
    const selectedMap = { ...this.data.selectedMap };

    visible.forEach((a) => {
      selectedMap[a.id] = !currentlyAll;
    });

    const selectedIds = Object.keys(selectedMap).filter((k) => !!selectedMap[k]);
    this.setData({
      selectedMap,
      selectedIds,
      isAllSelected: !currentlyAll
    });
  },

    onOpenQrAffiche(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/bailleur/qr-affiche/qr-affiche?id=${encodeURIComponent(id)}` });
  },

  onCardTap(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${id}`
    });
  }
});
