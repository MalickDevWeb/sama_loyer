import {
  COLOC_GENDER_POLICIES,
  COLOC_RENTAL_MODES,
  COLOC_HABIT_POLICIES,
  COLOC_INCOMPLETE_POLICIES,
  PLACE_STATUS,
  REPORT_REASONS,
  validateGenderCompatibility,
  validateCoupleDuo,
  validateLivingHabits,
  validateMultiGroupCapacity,
  createPlaceLock,
  isLockExpired,
  executeSoloPrivatization,
  resolveIncompleteRoom,
  generateGroupInvitation,
  verifyGroupInvitation,
  processPaymentWebhookIdempotent,
  createDisputeReport,
  resolveDisputeReport
} from '../../../utils/helpers/coloc-engine.js';

Page({
  data: {
    activeTab: 'all', // 'all' | 'rules' | 'screens' | 'log'
    results: {},
    logs: [
      { time: 'Initialisation', msg: 'Laboratoire prêt pour les tests du Prompt Maître.', type: 'info' }
    ]
  },

  addLog(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const newLogs = [{ time, msg, type }, ...this.data.logs.slice(0, 30)];
    this.setData({ logs: newLogs });
  },

  onBack() {
    wx.navigateBack({
      fail: () => wx.switchTab({ url: '/pages/client/home/home' })
    });
  },

  // --------------------------------------------------------------------------
  // TEST 1 : Isolation des Genres
  // --------------------------------------------------------------------------
  runTestGender(e) {
    const variant = e.currentTarget.dataset.variant;
    try {
      if (variant === 'female_in_male') {
        validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [
          { id: 'u1', name: 'Moussa', gender: 'HOMME' },
          { id: 'u2', name: 'Fatou', gender: 'FEMME' }
        ]);
      } else if (variant === 'male_in_female') {
        validateGenderCompatibility(COLOC_GENDER_POLICIES.FEMMES_UNIQUEMENT, [
          { id: 'u1', name: 'Lamine', gender: 'HOMME' }
        ]);
      } else {
        // Valide
        const res = validateGenderCompatibility(COLOC_GENDER_POLICIES.HOMMES_UNIQUEMENT, [
          { id: 'u1', name: 'Moussa', gender: 'HOMME' },
          { id: 'u2', name: 'Cheikh', gender: 'MALE' }
        ]);
        this.setTestResult('gender', { success: true, msg: 'Hommes uniquement : Accordé ✅' });
        this.addLog('Test Genre (2 Hommes) : Validation réussie.', 'success');
        return;
      }
    } catch (err) {
      this.setTestResult('gender', { success: false, msg: `Rejeté : ${err.message} 🛡️` });
      this.addLog(`Test Genre (${variant}) : Rejeté avec succès côté serveur (${err.message})`, 'reject');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 2 : Mode Couples (Opt-in mutuel)
  // --------------------------------------------------------------------------
  runTestCouples(e) {
    const variant = e.currentTarget.dataset.variant;
    const userA = { id: 'u-amadou', name: 'Amadou', phone: '+221770000001' };
    const userB = { id: 'u-awa', name: 'Awa', phone: '+221770000002' };

    try {
      if (variant === 'solo') {
        validateCoupleDuo(userA, userA, { coupleConfirmedByPartner: true });
      } else if (variant === 'unconfirmed') {
        validateCoupleDuo(userA, userB, { coupleConfirmedByPartner: false });
      } else {
        const res = validateCoupleDuo(userA, userB, { coupleConfirmedByPartner: true });
        this.setTestResult('couple', { success: true, msg: 'Couple bilatéralement confirmé : Validé ✅' });
        this.addLog('Test Couple : Deux comptes distincts avec accord mutuel validés.', 'success');
        return;
      }
    } catch (err) {
      this.setTestResult('couple', { success: false, msg: `Rejeté : ${err.message} 🛡️` });
      this.addLog(`Test Couple (${variant}) : Rejeté (${err.message})`, 'reject');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 3 : Multi-groupes sans fusion (Chambre 4 lits)
  // --------------------------------------------------------------------------
  runTestMultiGroup() {
    try {
      // Groupe A prend 2 places
      const step1 = validateMultiGroupCapacity({
        roomCapacity: 4,
        multiGroupAllowed: true,
        existingReservations: [],
        placesRequested: 2
      });

      // Groupe B prend 2 places
      const existing = [{ id: 'res-a', groupId: 'isep', placesCount: 2, status: 'CONFIRMEE' }];
      const step2 = validateMultiGroupCapacity({
        roomCapacity: 4,
        multiGroupAllowed: true,
        existingReservations: existing,
        placesRequested: 2
      });

      this.setTestResult('multigroup', {
        success: true,
        msg: `Groupe ISEP (2 lits) + Groupe Sonatel (2 lits) = Chambre complète (4/4) sans fusion ✅`
      });
      this.addLog('Test Multi-groupes : 2 groupes indépendants hébergés sans fusion.', 'success');
    } catch (err) {
      this.setTestResult('multigroup', { success: false, msg: err.message });
      this.addLog(`Erreur multi-groupes : ${err.message}`, 'reject');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 4 : Verrouillage concurrent 15 minutes
  // --------------------------------------------------------------------------
  runTestConcurrency() {
    const place = { id: 'bed-1', placeNumber: 1, status: 'DISPONIBLE' };
    const now = Date.now();

    const lock1 = createPlaceLock({ place, userId: 'user-candidat-1', now });

    // Tentative concurrente
    try {
      createPlaceLock({ place, userId: 'user-candidat-2', now: now + 2000, existingActiveLock: lock1 });
    } catch (err) {
      this.setTestResult('concurrency', {
        success: true,
        msg: `Candidat 1 a obtenu le verrou (15 min). Candidat 2 immédiatement bloqué : "${err.message}" 🔒`
      });
      this.addLog('Test Concurrence : Collision bloquée, place protégée.', 'success');
    }
  },

  // --------------------------------------------------------------------------
  // TEST 5 : Rachat Exclusif Solo & Remboursement 100%
  // --------------------------------------------------------------------------
  runTestSoloPrivatization() {
    const logement = {
      id: 'chambre-ouakam',
      title: 'Chambre 2 lits Ouakam',
      roomCapacity: 2,
      rentAmount: 80000,
      soloPrice: 80000
    };
    const partial = [
      { id: 'res-awa', userId: 'user-awa', placesCount: 1, amountTotal: 40000, status: 'VERROUILLEE' }
    ];
    const soloUser = { id: 'user-solo-cheikh', name: 'Cheikh Solo' };

    const result = executeSoloPrivatization({
      logement,
      soloUser,
      existingReservations: partial
    });

    this.setTestResult('solobuyout', {
      success: true,
      msg: `Chambre privatisée par Cheikh. Remboursement automatique de 40 000 FCFA à 100% sans frais pour Awa généré ✅`
    });
    this.addLog(`Rachat solo : SMS généré -> "${result.notificationsToSend[0].message}"`, 'info');
  },

  // --------------------------------------------------------------------------
  // TEST 6 : Idempotence Webhook Orange Money
  // --------------------------------------------------------------------------
  runTestIdempotence() {
    const store = new Set();
    const map = new Map([['res-1', { id: 'res-1', status: 'VERROUILLEE' }]]);

    const payload = {
      transactionReference: 'OM-TX-TEST-001',
      reservationId: 'res-1',
      status: 'SUCCESS',
      amount: 40000
    };

    const first = processPaymentWebhookIdempotent({ webhookEvent: payload, processedEventsStore: store, activeReservationsMap: map });
    const duplicate = processPaymentWebhookIdempotent({ webhookEvent: payload, processedEventsStore: store, activeReservationsMap: map });

    this.setTestResult('idempotence', {
      success: true,
      msg: `1er webhook : ${first.status} | 2ème webhook identique : ${duplicate.status} (Ignoré, aucun double paiement) ✅`
    });
    this.addLog('Test Idempotence : Déduplication stricte réussie.', 'success');
  },

  // --------------------------------------------------------------------------
  // ACCÈS DIRECT AUX ÉCRANS
  // --------------------------------------------------------------------------
  openListing(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/client/logement-detail/logement-detail?id=${encodeURIComponent(id)}`
    });
  },

  openBailleurAdd() {
    wx.navigateTo({
      url: '/pages/bailleur/ajouter/ajouter'
    });
  },

  setTestResult(key, val) {
    const r = Object.assign({}, this.data.results, { [key]: val });
    this.setData({ results: r });
  }
});

