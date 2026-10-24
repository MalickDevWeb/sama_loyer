// ============================================================================
// TEST RUNNER — SAMA LOYER
// Exécution : node tests/run.js
// ============================================================================

// 1. Initialiser les globales WeChat AVANT le chargement des modules ESM
const memStorage = new Map();
global.Behavior = function(def) { return def; };
global.wx = {
  getStorageSync: (key) => (memStorage.has(key) ? memStorage.get(key) : ''),
  setStorageSync: (key, val) => memStorage.set(key, val),
  removeStorageSync: (key) => memStorage.delete(key),
  clearStorageSync: () => memStorage.clear(),
  showToast: () => {},
  showModal: () => {},
  getSystemInfoSync: () => ({ statusBarHeight: 44 }),
  request: ({ success }) => {
    if (typeof success === 'function') {
      success({ statusCode: 200, data: { success: true, data: [] } });
    }
  }
};

async function main() {
  console.log('====================================================');
  console.log('   SAMA LOYER — SUITE DE TESTS AUTOMATISÉS          ');
  console.log('====================================================');

  const start = Date.now();
  let totalPassed = 0;

  try {
    // 2. Imports dynamiques pour bénéficier des globales déclarées ci-dessus
    const { runEventBusTests } = await import('./eventbus.test.js');
    const { runSculptTests } = await import('./sculpt.test.js');
    const { runI18nTests } = await import('./i18n.test.js');
    const { runZipTests } = await import('./zip.test.js');
    const { runShareRedirectTests } = await import('./share-redirect.test.js');
    const { runFavoritesResilienceTests } = await import('./favorites-resilience.test.js');
    const { runApiResponseTests } = await import('./api-response.test.js');

    totalPassed += await runEventBusTests();
    totalPassed += await runSculptTests();
    totalPassed += await runI18nTests();
    totalPassed += await runZipTests();
    totalPassed += await runShareRedirectTests();
    totalPassed += await runFavoritesResilienceTests();
    totalPassed += await runApiResponseTests();

    const duration = ((Date.now() - start) / 1000).toFixed(2);
    console.log('\n====================================================');
    console.log(`✅ TOUS LES TESTS SONT AU VERT : ${totalPassed} tests passés en ${duration}s`);
    console.log('====================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Échec du test :', err);
    process.exit(1);
  }
}

main();
