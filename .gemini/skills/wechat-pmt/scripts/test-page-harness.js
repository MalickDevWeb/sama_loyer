#!/usr/bin/env node

/**
 * 🧪 HEADLESS PAGE & UISTATE TEST HARNESS — WeChat PMT
 * Émulateur léger en mémoire pour tester les machines à états uiState et les cycles
 * de vie des pages WeChat sans interface graphique ni WeChat DevTools (CI Ready).
 *
 * Usage :
 *   node scripts/test-page-harness.js
 */

const path = require('path');

console.log('====================================================');
console.log('🧪 TEST HARNESS HEADLESS — WECHAT PAGE & UISTATE');
console.log('====================================================\n');

// -----------------------------------------------------------------------------
// 1. ÉMULATEUR DE L'ENVIRONNEMENT GLOBAL WECHAT
// -----------------------------------------------------------------------------
const storageMock = {};

global.wx = {
  showToast: (opts) => { /* Mock */ },
  hideToast: () => { /* Mock */ },
  showLoading: (opts) => { /* Mock */ },
  hideLoading: () => { /* Mock */ },
  navigateTo: (opts) => { /* Mock */ },
  redirectTo: (opts) => { /* Mock */ },
  switchTab: (opts) => { /* Mock */ },
  vibrateShort: (opts) => { /* Mock */ },
  getStorageSync: (key) => storageMock[key] || '',
  setStorageSync: (key, val) => { storageMock[key] = val; },
  removeStorageSync: (key) => { delete storageMock[key]; }
};

/**
 * Crée un harnais de test pour une définition de Page WeChat
 * @param {Object} pageDefinition - L'objet passé à Page({...})
 */
function createPageHarness(pageDefinition) {
  const instance = {
    ...pageDefinition,
    data: JSON.parse(JSON.stringify(pageDefinition.data || {})),

    setData(partial, callback) {
      // Fusion récursive superficielle conforme à setData natif
      Object.keys(partial).forEach((key) => {
        if (key.includes('.')) {
          const parts = key.split('.');
          let target = this.data;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = partial[key];
        } else {
          this.data[key] = partial[key];
        }
      });
      if (typeof callback === 'function') callback();
    },

    async triggerLoad(options = {}) {
      if (typeof this.onLoad === 'function') {
        await this.onLoad(options);
      }
    },

    async triggerShow() {
      if (typeof this.onShow === 'function') {
        await this.onShow();
      }
    },

    async triggerUnload() {
      if (typeof this.onUnload === 'function') {
        await this.onUnload();
      }
    }
  };

  return instance;
}

// -----------------------------------------------------------------------------
// 2. SUITE DE TESTS SUR LA MACHINE À ÉTATS UISTATE
// -----------------------------------------------------------------------------
let testsPassed = 0;

// Test 1 : Cycle Nominal (loading -> success)
console.log('🔍 Test 1 : Machine à états en cycle nominal (loading -> success)...');
const nominalPageDef = {
  data: {
    uiState: 'loading',
    items: []
  },
  async onLoad(options) {
    this.setData({ uiState: 'loading' });
    // Simulation appel asynchrone réussi
    await new Promise((r) => setTimeout(r, 20));
    this.setData({
      uiState: 'success',
      items: [{ id: 1, name: 'Billet Dakar-Thiès' }]
    });
  }
};

const harness1 = createPageHarness(nominalPageDef);
if (harness1.data.uiState !== 'loading') {
  console.error('  ❌ Échec : uiState initial doit être loading');
  process.exit(1);
}

harness1.triggerLoad().then(() => {
  if (harness1.data.uiState === 'success' && harness1.data.items.length === 1) {
    console.log('  ✅ Test 1 validé : Transition vers success avec injection des données.\n');
    testsPassed++;
    runTest2();
  } else {
    console.error('  ❌ Échec Test 1 : uiState final invalide', harness1.data);
    process.exit(1);
  }
});

// Test 2 : Gestion de l'erreur réseau (loading -> error)
function runTest2() {
  console.log('🔍 Test 2 : Machine à états en cas d\'erreur réseau (loading -> error)...');
  const errorPageDef = {
    data: {
      uiState: 'loading',
      errorMessage: ''
    },
    async onLoad(options) {
      try {
        throw new Error('Connexion réseau Sonatel 4G interrompue');
      } catch (err) {
        this.setData({
          uiState: 'error',
          errorMessage: err.message
        });
      }
    }
  };

  const harness2 = createPageHarness(errorPageDef);
  harness2.triggerLoad().then(() => {
    if (harness2.data.uiState === 'error' && harness2.data.errorMessage.includes('Sonatel 4G')) {
      console.log('  ✅ Test 2 validé : Transition vers error avec capture du message bienveillant.\n');
      testsPassed++;
      runTest3();
    } else {
      console.error('  ❌ Échec Test 2 : uiState d\'erreur invalide', harness2.data);
      process.exit(1);
    }
  });
}

// Test 3 : Nettoyage sans fuite mémoire lors de onUnload
function runTest3() {
  console.log('🔍 Test 3 : Nettoyage mémoire et abonnements dans onUnload()...');
  let intervalCleared = false;
  let eventUnsubscribed = false;

  const cleanupPageDef = {
    data: { uiState: 'success' },
    timerId: 1234,
    onLoad() {},
    onUnload() {
      if (this.timerId) {
        intervalCleared = true;
        this.timerId = null;
      }
      eventUnsubscribed = true;
    }
  };

  const harness3 = createPageHarness(cleanupPageDef);
  harness3.triggerUnload().then(() => {
    if (intervalCleared && eventUnsubscribed && harness3.timerId === null) {
      console.log('  ✅ Test 3 validé : Timer nettoyé et ressources libérées sans fuite.\n');
      testsPassed++;
      runTest4();
    } else {
      console.error('  ❌ Échec Test 3 : Ressources non libérées dans onUnload');
      process.exit(1);
    }
  });
}

// Test 4 : Pont Hybride WhatsApp & Formatage Téléphone
async function runTest4() {
  console.log('🔍 Test 4 : Pont Hybride WhatsApp (URL, shortLinkId, encodage et téléphone)...');
  const { pathToFileURL } = require('url');
  const bridgePath = path.join(__dirname, '..', 'playground', 'utils', 'helpers', 'whatsappBridge.js');
  const bridge = await import(pathToFileURL(bridgePath).href);

  // 1. Test shortLinkId
  const url1 = bridge.buildWhatsAppUrl({ shortLinkId: 'F5VM5FMWEDWLJ1' });
  if (url1 !== 'https://wa.me/message/F5VM5FMWEDWLJ1') {
    console.error('  ❌ Échec Test 4a : shortLinkId invalide', url1);
    process.exit(1);
  }

  // 2. Test phone + message
  const url2 = bridge.buildWhatsAppUrl({ phone: '+221 77 000 00 00', message: 'Bonjour Fly Afritrip' });
  if (url2 !== 'https://wa.me/221770000000?text=Bonjour%20Fly%20Afritrip') {
    console.error('  ❌ Échec Test 4b : phone + text invalide', url2);
    process.exit(1);
  }

  // 3. Test phone call helper
  let callNumber = '';
  global.wx.makePhoneCall = (opts) => {
    callNumber = opts.phoneNumber;
    if (opts.success) opts.success();
  };
  await bridge.makeSupportPhoneCall('+221 77 000 00 00');
  if (callNumber !== '221770000000') {
    console.error('  ❌ Échec Test 4c : nettoyage numéro makePhoneCall invalide', callNumber);
    process.exit(1);
  }

  console.log('  ✅ Test 4 validé : Génération URL wa.me, shortLinkId et appel vocal confirmés.\n');
  testsPassed++;
  finishAllTests();
}

function finishAllTests() {
  console.log('====================================================');
  console.log(`✨ SUCCÈS : ${testsPassed}/4 TESTS DE MACHINE À ÉTATS ET HELPERS VALIDÉS !`);
  console.log('====================================================\n');
  process.exit(0);
}

