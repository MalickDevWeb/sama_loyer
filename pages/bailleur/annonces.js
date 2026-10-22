Page({
  data: {
    statusBarHeight: 44,
    activeFilter: 'all', // all | en_ligne | validation | loue
    annonces: [
      {
        id: 'a1',
        tag: 'En ligne · Premium',
        tagClass: 'tag-enligne',
        title: 'Chambre salon avec douche int...',
        place: 'Icotaf, Pikine · 65 000 F',
        stats: '248 vues · 3 demandes',
        notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
        isConfirmed: true,
        type: 'en_ligne'
      },
      {
        id: 'a2',
        tag: 'En ligne · Premium',
        tagClass: 'tag-enligne',
        title: 'Studio meublé, entrée indépen...',
        place: 'Pikine Rue 10 · 95 000 F',
        stats: '131 vues · 1 demandes',
        notice: "Disponibilité confirmée il y a 14 jours. Confirme-la pour rester bien visible.",
        isConfirmed: false,
        needsConfirm: true,
        type: 'en_ligne'
      },
      {
        id: 'a3',
        tag: 'En validation',
        tagClass: 'tag-validation',
        title: 'Appartement F2 neuf',
        place: 'Pikine Technopole · 140 000 F',
        notice: 'Notre équipe vérifie les photos et les informations. Réponse sous 24 h.',
        type: 'validation'
      },
      {
        id: 'a4',
        tag: 'À corriger',
        tagClass: 'tag-corriger',
        title: 'Chambre avec balcon',
        place: 'Dalifort · 50 000 F',
        notice: 'Motif : 2 photos sont floues et le prix de la caution manque.',
        canCorrect: true,
        type: 'validation'
      },
      {
        id: 'a5',
        tag: 'Loué',
        tagClass: 'tag-loue',
        title: 'Chambre indépendante',
        place: 'Thiaroye · 45 000 F',
        notice: 'Annonce retirée des recherches. Les locataires ne la voient plus.',
        canRelist: true,
        type: 'loue'
      }
    ],
    filteredAnnonces: []
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      this.setData({
        statusBarHeight: sys.statusBarHeight || 44
      });
    } catch (e) {}

    this.applyFilter('all');
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ activeTab: 'b-annonces' });
    }
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
    this.setData({ filteredAnnonces: list });
  },

  onConfirmDispo(e) {
    const id = e.currentTarget.dataset.id;
    const updated = this.data.annonces.map(a => {
      if (a.id === id) {
        return {
          ...a,
          isConfirmed: true,
          needsConfirm: false,
          notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient."
        };
      }
      return a;
    });

    this.setData({ annonces: updated });
    this.applyFilter(this.data.activeFilter);
    wx.showToast({
      title: 'Disponibilité confirmée pour 7 jours !',
      icon: 'success'
    });
  },

  onMarkLoue(e) {
    const id = e.currentTarget.dataset.id;
    wx.showModal({
      title: 'Marquer comme loué ?',
      content: 'Ce logement sera retiré des résultats de recherche des locataires.',
      confirmText: "Oui, c'est loué",
      confirmColor: '#0F1E3D',
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
                canRelist: true,
                isConfirmed: false,
                needsConfirm: false
              };
            }
            return a;
          });
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
          tag: 'En ligne · Premium',
          tagClass: 'tag-enligne',
          type: 'en_ligne',
          notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
          canRelist: false,
          isConfirmed: true,
          needsConfirm: false
        };
      }
      return a;
    });
    this.setData({ annonces: updated });
    this.applyFilter(this.data.activeFilter);
    wx.showToast({ title: 'Remis en ligne !', icon: 'success' });
  },

  onGoAjouter() {
    wx.navigateTo({
      url: '/pages/bailleur/ajouter'
    });
  }
});
