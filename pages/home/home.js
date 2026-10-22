import { setCustomTabBarActive } from '../../utils/helpers/tab-bar';
import { STORAGE_KEYS } from '../../utils/constants/index';

const LISTINGS = [
  {
    id: 1,
    title: 'Avec toilettes privées',
    typeLabel: 'Chambre salon',
    place: 'Ouakam, Cité Avion',
    zone: 'ouakam',
    price: 60000,
    caution: 60000,
    avance: 60000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité & visite vérifiées',
    dateConfirmation: 'Confirmé il y a 2 jours',
    phone: '771234567',
    bailleurName: 'Mamadou Diallo',
    equipements: ['Toilettes privées', 'Compteur Woyofal individuel', 'Eau courante SDE'],
    description: 'Chambre salon spacieuse, bien ventilée, située dans un quartier calme et accessible à Ouakam Cité Avion.',
    tint: '#FBE3EC'
  },
  {
    id: 2,
    title: 'Chambre salon carrelée',
    typeLabel: 'Chambre salon',
    place: 'Ouakam, Tonghor',
    zone: 'ouakam',
    price: 55000,
    caution: 55000,
    avance: 55000,
    frais: 0,
    verified: true,
    verificationLevel: 'Numéro vérifié',
    dateConfirmation: 'Confirmé hier',
    phone: '782345678',
    bailleurName: 'Aïssatou Sow',
    equipements: ['Carrelage moderne', 'Toilettes partagées propres', 'Woyofal'],
    description: 'Logement propre et carrelé à Ouakam Tonghor, proche des commerces et du marché.',
    tint: '#E3E9F5'
  },
  {
    id: 3,
    title: 'Chambre simple, calme',
    typeLabel: 'Chambre',
    place: 'Ngor Village',
    zone: 'ngor',
    price: 50000,
    caution: 50000,
    avance: 50000,
    frais: 0,
    verified: false,
    verificationLevel: 'Déclaré par le bailleur',
    dateConfirmation: 'Confirmé aujourd’hui',
    phone: '763456789',
    bailleurName: 'Ousmane Ndiaye',
    equipements: ['Quartier calme', 'Proche de la plage', 'Eau comprise'],
    description: 'Chambre individuelle au calme dans le village traditionnel de Ngor, idéale pour étudiant ou travailleur.',
    tint: '#F3ECE1'
  },
  {
    id: 4,
    title: 'Chambre avec balcon',
    typeLabel: 'Chambre',
    place: 'Mermoz',
    zone: 'mermoz',
    price: 65000,
    caution: 65000,
    avance: 65000,
    frais: 0,
    verified: true,
    verificationLevel: 'Identité vérifiée',
    dateConfirmation: 'Confirmé il y a 3 jours',
    phone: '774567890',
    bailleurName: 'Abdoulaye Ba',
    equipements: ['Balcon privé', 'Toilettes intérieures', 'Accès terrasse'],
    description: 'Superbe chambre avec balcon privé dans une villa paisible à Mermoz, proche universités et VDN.',
    tint: '#FBE3EC'
  },
  {
    id: 5,
    title: 'Studio meublé',
    typeLabel: 'Studio',
    place: 'Point E',
    zone: 'point e',
    price: 150000,
    caution: 150000,
    avance: 150000,
    frais: 10000,
    verified: true,
    verificationLevel: 'Agence certifiée',
    dateConfirmation: 'Confirmé hier',
    phone: '705678901',
    bailleurName: 'Fatou Diop',
    equipements: ['Meublé complet', 'Climatisation', 'Wifi fibre haut débit'],
    description: 'Studio standing entièrement équipé au Point E avec cuisine américaine, sécurisé 24h/24.',
    tint: '#E3E9F5'
  },
  {
    id: 6,
    title: 'Chambre salon',
    typeLabel: 'Chambre salon',
    place: 'Yoff Virage',
    zone: 'yoff',
    price: 58000,
    caution: 58000,
    avance: 58000,
    frais: 0,
    verified: true,
    verificationLevel: 'Numéro vérifié',
    dateConfirmation: 'Confirmé il y a 1 jour',
    phone: '776789012',
    bailleurName: 'Cheikh Gueye',
    equipements: ['Vue dégagée', 'Toilettes privées', 'Proche VDN'],
    description: 'Chambre et salon avec belle luminosité à Yoff Virage, accès immédiat aux transports.',
    tint: '#F3ECE1'
  },
  {
    id: 7,
    title: 'Appartement F3',
    typeLabel: 'Appartement',
    place: 'Liberté 6',
    zone: 'liberte',
    price: 250000,
    caution: 250000,
    avance: 250000,
    frais: 25000,
    verified: true,
    verificationLevel: 'Agence partenaire vérifiée',
    dateConfirmation: 'Confirmé il y a 4 jours',
    phone: '777890123',
    bailleurName: 'Cabinet Immo Horizon',
    equipements: ['2 chambres + salon', 'Cuisine avec placards', 'Parking sécurisé'],
    description: 'Appartement F3 familial au 2ème étage d’un immeuble neuf à Liberté 6 Extension.',
    tint: '#FBE3EC'
  },
  {
    id: 8,
    title: 'Chambre simple',
    typeLabel: 'Chambre',
    place: 'HLM Grand Yoff',
    zone: 'grand yoff',
    price: 45000,
    caution: 45000,
    avance: 45000,
    frais: 0,
    verified: false,
    verificationLevel: 'Déclaré par le bailleur',
    dateConfirmation: 'Confirmé il y a 2 jours',
    phone: '768901234',
    bailleurName: 'Ibrahima Sarr',
    equipements: ['Économique', 'Accès facile', 'Compteur partagé'],
    description: 'Petite chambre pour petit budget, très accessible à côté du terminus des bus.',
    tint: '#E3E9F5'
  },
  {
    id: 9,
    title: 'Studio neuf',
    typeLabel: 'Studio',
    place: 'Sacré-Cœur 3',
    zone: 'sacre coeur',
    price: 120000,
    caution: 120000,
    avance: 120000,
    frais: 0,
    verified: true,
    verificationLevel: 'Bailleur vérifié',
    dateConfirmation: 'Confirmé il y a 1 jour',
    phone: '779012345',
    bailleurName: 'Mariama Fall',
    equipements: ['Immeuble neuf', 'Gardien 24/7', 'Chauffe-eau'],
    description: 'Studio moderne dans un quartier résidentiel très prisé de Sacré-Cœur 3.',
    tint: '#F3ECE1'
  },
  {
    id: 10,
    title: 'Maison avec cour',
    typeLabel: 'Maison',
    place: 'Keur Massar',
    zone: 'keur massar',
    price: 200000,
    caution: 200000,
    avance: 200000,
    frais: 0,
    verified: true,
    verificationLevel: 'Titre de propriété examiné',
    dateConfirmation: 'Confirmé il y a 5 jours',
    phone: '780123456',
    bailleurName: 'El Hadji Seck',
    equipements: ['Cour avant et arrière', 'Garage fermé', '3 chambres spacieuses'],
    description: 'Grande maison individuelle bien aérée à Keur Massar, quartier calme et sécurisé.',
    tint: '#FBE3EC'
  }
];

const NEAR_ZONES = {
  ouakam: ['ngor', 'mermoz', 'yoff'],
  ngor: ['ouakam', 'yoff'],
  yoff: ['ngor', 'ouakam', 'grand yoff'],
  mermoz: ['ouakam', 'sacre coeur', 'point e'],
  'point e': ['mermoz', 'sacre coeur'],
  'sacre coeur': ['mermoz', 'liberte', 'point e'],
  liberte: ['sacre coeur', 'grand yoff'],
  'grand yoff': ['liberte', 'yoff'],
  'keur massar': []
};

function formatMoney(n) {
  return String(n || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

Page({
  data: {
    statusBarHeight: 24,
    place: 'Ouakam',
    budget: '60 000',
    qPlace: 'Ouakam',
    qBudget: 60000,
    searched: true,
    recs: [],
    heading: '',
    summary: '',
    userRole: 'client', // 'client' | 'bailleur'
    favorites: {},
    showVoiceModal: false,
    showDetailModal: false,
    selectedListing: null,
    totalInitialCost: 0,
    voicePrompts: [
      { text: 'Chambre salon à Ouakam, budget 60 000 F', place: 'Ouakam', budget: '60 000', lang: 'FR' },
      { text: 'Dafa ma bëgg chambre 50 000 F ci Ngor', place: 'Ngor', budget: '50 000', lang: 'WO' },
      { text: 'Studio meublé vers Point E ou Mermoz', place: 'Point E', budget: '150 000', lang: 'FR' },
      { text: 'Appartement F3 Liberté 6 max 250 000 F', place: 'Liberté 6', budget: '250 000', lang: 'FR' }
    ]
  },

  onLoad() {
    try {
      const sys = wx.getSystemInfoSync();
      if (sys && sys.statusBarHeight) {
        this.setData({ statusBarHeight: sys.statusBarHeight });
      }
    } catch (e) {
      // fallback
    }

    // Load favorites from local storage
    try {
      const favs = wx.getStorageSync(STORAGE_KEYS.FAVORITES) || {};
      this.setData({ favorites: favs });
    } catch (e) {}

    // Load user role
    try {
      const role = wx.getStorageSync(STORAGE_KEYS.USER_ROLE) || 'client';
      this.setData({ userRole: role });
    } catch (e) {}

    // Run initial search
    this.runSearch();
  },

  onShow() {
    setCustomTabBarActive(this, 'home');
  },

  onPlaceInput(e) {
    this.setData({ place: e.detail.value || '' });
  },

  onClearPlace() {
    this.setData({ place: '' });
  },

  onBudgetInput(e) {
    const raw = e.detail.value || '';
    const digits = raw.replace(/\D/g, '');
    const formatted = digits ? formatMoney(Number(digits)) : '';
    this.setData({ budget: formatted });
  },

  onClearBudget() {
    this.setData({ budget: '' });
  },

  onSearchTap() {
    this.setData(
      {
        qPlace: this.data.place,
        qBudget: Number(String(this.data.budget).replace(/\D/g, '')) || 0,
        searched: true
      },
      () => {
        this.runSearch();
      }
    );
  },

  runSearch() {
    const q = normalize(this.data.qPlace);
    const budget = this.data.qBudget || 0;
    const zoneKey = Object.keys(NEAR_ZONES).find((z) => q && (q.indexOf(z) >= 0 || z.indexOf(q) >= 0)) || '';
    const tints = ['#FBE3EC', '#E3E9F5', '#F3ECE1'];

    const scored = LISTINGS.map((l) => {
      let s = 0;
      let why = '';
      const inZone = zoneKey && l.zone === zoneKey;
      const nearZone = zoneKey && (NEAR_ZONES[zoneKey] || []).indexOf(l.zone) >= 0;

      if (inZone) {
        s += 50;
        why = 'Dans ton quartier';
      } else if (nearZone) {
        s += 30;
        why = `Juste à côté de ${this.data.qPlace || 'ta zone'}`;
      } else {
        why = 'Bon rapport qualité-prix';
      }

      if (budget > 0) {
        if (l.price <= budget) {
          s += 40 - Math.round(((budget - l.price) / budget) * 15);
          why += ' · dans ton budget';
        } else if (l.price <= budget * 1.1) {
          s += 10;
          why += ' · un peu au-dessus';
        } else {
          s -= 100;
        }
      } else {
        s += 20;
      }

      return Object.assign({}, l, { score: s, why: why });
    })
      .filter((l) => l.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const recs = scored.map((l, i) => {
      return {
        ...l,
        rank: i + 1,
        formattedPrice: formatMoney(l.price),
        match: Math.min(98, l.score + 8) + ' % pour toi',
        reason: l.why,
        tintBg: tints[i % tints.length]
      };
    });

    const n = recs.length;
    const heading = n ? `Tes ${n} meilleurs logements` : 'Aucun logement trouvé';
    const summary = n
      ? (this.data.qPlace || 'Partout à Dakar') + (budget ? ' · ' + formatMoney(budget) + ' F max' : '')
      : 'Essaie un budget un peu plus élevé ou un quartier voisin.';

    this.setData({
      recs,
      heading,
      summary,
      searched: true
    });
  },

  onVoiceTap() {
    this.setData({ showVoiceModal: true });
  },

  onCloseVoiceModal() {
    this.setData({ showVoiceModal: false });
  },

  onApplyVoicePrompt(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    this.setData(
      {
        place: item.place,
        budget: item.budget,
        qPlace: item.place,
        qBudget: Number(String(item.budget).replace(/\D/g, '')) || 0,
        showVoiceModal: false
      },
      () => {
        wx.showToast({
          title: `Recherche : ${item.place}`,
          icon: 'none',
          duration: 1500
        });
        this.runSearch();
      }
    );
  },

  onListingTap(e) {
    const item = e.currentTarget.dataset.item;
    if (!item) return;

    wx.navigateTo({
      url: `/pages/logement-detail/logement-detail?id=${item.id}`,
      fail: () => {
        const initialTotal = (item.price || 0) + (item.caution || 0) + (item.avance || 0) + (item.frais || 0);
        this.setData({
          selectedListing: item,
          totalInitialCost: initialTotal,
          showDetailModal: true
        });
      }
    });
  },

  onCloseDetailModal() {
    this.setData({ showDetailModal: false, selectedListing: null });
  },

  onToggleFavorite(e) {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    const favorites = Object.assign({}, this.data.favorites);
    if (favorites[id]) {
      delete favorites[id];
      wx.showToast({ title: 'Retiré des favoris', icon: 'none' });
    } else {
      favorites[id] = true;
      wx.showToast({ title: 'Ajouté aux favoris ❤️', icon: 'none' });
    }

    this.setData({ favorites });
    try {
      wx.setStorageSync(STORAGE_KEYS.FAVORITES, favorites);
    } catch (err) {}
  },

  onCallBailleur() {
    const listing = this.data.selectedListing;
    if (!listing || !listing.phone) return;
    wx.makePhoneCall({
      phoneNumber: listing.phone,
      fail: () => {
        wx.showToast({ title: `Numéro : ${listing.phone}`, icon: 'none' });
      }
    });
  },

  onWhatsAppBailleur() {
    const listing = this.data.selectedListing;
    if (!listing) return;
    const msg = `Bonjour, je vous contacte depuis SAMA LOGEMENT pour l'annonce "${listing.title}" à ${listing.place} (${formatMoney(listing.price)} F CFA/mois). Est-il toujours disponible ?`;

    wx.setClipboardData({
      data: msg,
      success: () => {
        wx.showModal({
          title: 'Message copié !',
          content: `Le message pour le bailleur (${listing.phone}) a été copié. Vous pouvez le coller dans WhatsApp.`,
          showCancel: false,
          confirmText: 'D’accord'
        });
      }
    });
  },

  onPayRentWithOrangeMoney() {
    const listing = this.data.selectedListing;
    if (!listing) return;

    wx.showModal({
      title: 'Payer mon loyer avec Orange Money',
      content: `Échéance de loyer : ${formatMoney(listing.price)} F CFA\nBénéficiaire : ${listing.bailleurName}\nRéférence : SAMA-LOC-${listing.id}\n\nVoulez-vous initier le paiement sécurisé ?`,
      confirmText: 'Payer via OM',
      confirmColor: '#C8235F',
      cancelText: 'Annuler',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: 'Connexion Orange Money...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showModal({
              title: 'Paiement Confirmé ! 🎉',
              content: `Votre reçu de loyer N° OM-${Date.now().toString().slice(-6)} a été généré.\nMontant : ${formatMoney(listing.price)} F CFA.\nLe bailleur ${listing.bailleurName} a été notifié.`,
              showCancel: false,
              confirmText: 'Voir le reçu'
            });
          }, 1500);
        }
      }
    });
  },

  onSwitchProfile() {
    const newRole = this.data.userRole === 'client' ? 'bailleur' : 'client';
    const roleLabel = newRole === 'bailleur' ? 'Bailleur (Propriétaire)' : 'Client (Locataire)';

    wx.showActionSheet({
      itemList: ['Mode Locataire / Client', 'Mode Bailleur / Publier un bien'],
      success: (res) => {
        const selected = res.tapIndex === 0 ? 'client' : 'bailleur';
        this.setData({ userRole: selected });
        try {
          wx.setStorageSync(STORAGE_KEYS.USER_ROLE, selected);
        } catch (e) {}

        if (selected === 'bailleur') {
          wx.showModal({
            title: 'Mode Bailleur activé 🏢',
            content: 'Bienvenue dans votre espace bailleur. Vous pouvez gérer vos logements, confirmer leur disponibilité tous les 7 jours et suivre les demandes.',
            confirmText: 'Continuer',
            showCancel: false
          });
        } else {
          wx.showToast({ title: 'Mode Locataire activé', icon: 'none' });
        }
      }
    });
  }
});
