Page({
  data: {
    statusBarHeight: 44,
    activeFilter: 'all', // all | en_ligne | validation | loue
    annonces: [
      {
        id: 'a1',
        tag: 'En ligne · Premium',
        tagClass: 'tag-enligne',
        thumbBg: '#FDE8EE',
        title: 'Chambre salon avec douche int...',
        placeName: 'Icotaf, Pikine · ',
        price: '65 000 F',
        stats: '248 vues · 3 demandes',
        notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
        noticeClass: 'notice-gray',
        isConfirmed: true,
        type: 'en_ligne'
      },
      {
        id: 'a2',
        tag: 'En ligne · Premium',
        tagClass: 'tag-enligne',
        thumbBg: '#E3E8F0',
        title: 'Studio meublé, entrée indépen...',
        placeName: 'Pikine Rue 10 · ',
        price: '95 000 F',
        stats: '131 vues · 1 demandes',
        notice: "Disponibilité confirmée il y a 14 jours. Confirme-la pour rester bien visible.",
        noticeClass: 'notice-yellow',
        isConfirmed: false,
        needsConfirm: true,
        type: 'en_ligne'
      },
      {
        id: 'a3',
        tag: 'En validation',
        tagClass: 'tag-validation',
        thumbBg: '#F5EFE6',
        title: 'Appartement F2 neuf',
        placeName: 'Pikine Technopole · ',
        price: '140 000 F',
        notice: 'Notre équipe vérifie les photos et les informations. Réponse sous 24 h.',
        noticeClass: 'notice-yellow',
        type: 'validation'
      },
      {
        id: 'a4',
        tag: 'À corriger',
        tagClass: 'tag-corriger',
        thumbBg: '#EFEBF5',
        title: 'Chambre avec balcon',
        placeName: 'Dalifort · ',
        price: '50 000 F',
        notice: 'Motif : 2 photos sont floues et le prix de la caution manque.',
        noticeClass: 'notice-pink',
        canCorrect: true,
        type: 'validation'
      },
      {
        id: 'a5',
        tag: 'Loué',
        tagClass: 'tag-loue',
        thumbBg: '#FDE8EE',
        title: 'Chambre indépendante',
        placeName: 'Thiaroye · ',
        price: '45 000 F',
        notice: 'Annonce retirée des recherches. Les locataires ne la voient plus.',
        noticeClass: 'notice-gray',
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
          notice: "Disponibilité confirmée aujourd'hui. Les locataires le voient.",
          noticeClass: 'notice-gray'
        };
      }
      return a;
    });

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
                noticeClass: 'notice-gray',
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
          noticeClass: 'notice-gray',
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
      url: '/pages/bailleur/ajouter/ajouter'
    });
  }
});
