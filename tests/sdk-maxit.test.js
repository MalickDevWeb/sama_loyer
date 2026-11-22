// ============================================================================
// TESTS — SDK MAX IT & PAIEMENT ORANGE MONEY SAMA LOYER
// Validation du SDK officiel @sonatel-os/maxit-mini-sdk & Bouclier Anti-Double Débit
// ============================================================================

import assert from 'assert';
import { miniSDK } from '../sdk/index.js';
import { nativeService, payWithOrangeMoney } from '../utils/apis/native.js';

export async function runMaxItSdkTests() {
  console.log('\n--- Test Suite 6: Max It Mini SDK & Orange Money Shield ---');
  let passed = 0;

  // 1. Configuration du SDK en mode simulate
  miniSDK.configure({
    simulate: true,
    timeoutMs: 5000,
  });
  assert.ok(miniSDK.VERSION);
  passed++;
  console.log('  ✓ miniSDK.configure en mode simulation validé');

  // 2. Récupération identité utilisateur Sonatel Max It
  const user = await miniSDK.user();
  assert.equal(user.msisdn, '770000001');
  assert.equal(user.fullName, 'Dev User');
  passed++;
  console.log('  ✓ miniSDK.user() résout l\'identité et MSISDN normalisé 9 chiffres');

  // 3. Paiement Orange Money marchand conforme
  const orderId = `CMD-${Date.now()}`;
  const payment = await payWithOrangeMoney({
    amount: 35000,
    receiver: '770000000',
    receiverName: 'SAMA LOYER SARL',
    description: 'Loyer Keur Gorgui',
    orderId
  });
  assert.ok(payment.txnid);
  assert.ok(payment.txnid.startsWith('MP-DEV-'));
  passed++;
  console.log('  ✓ payWithOrangeMoney() exécute le paiement marchand Max It avec succès');

  // 4. Bouclier anti-double débit
  const duplicatePayment = await payWithOrangeMoney({
    amount: 35000,
    orderId
  });
  assert.equal(duplicatePayment.txnid, payment.txnid);
  passed++;
  console.log('  ✓ Bouclier anti-double débit : transaction déjà validée retournée sans débit');

  // 5. nativeService API
  const nativeUser = await nativeService.getUserInfos();
  assert.equal(nativeUser.msisdn, '770000001');
  passed++;
  console.log('  ✓ nativeService.getUserInfos() branché sur miniSDK avec succès');

  return passed;
}
