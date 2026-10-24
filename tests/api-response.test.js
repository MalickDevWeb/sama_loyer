// ============================================================================
// TESTS — EXTRACT API RESPONSE (Unwrapping & Error Normalization)
// ============================================================================

import assert from 'assert';
import { extractApiResponse, unwrapApiResponse } from '../utils/apis/index.js';
import { extractApiResponse as extractFromResponseModule } from '../utils/apis/response.js';
import { extractApiResponse as extractFromHttpModule } from '../utils/apis/http.js';

export async function runApiResponseTests() {
  console.log('\n--- Test Suite 7: API Response Extraction & Error Handling ---');
  let passed = 0;

  // 1. Déballage d'une enveloppe standard SAMA LOYER
  const mockSuccessRes = {
    success: true,
    status: 200,
    data: {
      success: true,
      data: [{ id: 'l-1', title: 'Studio Ouakam' }],
      meta: { page: 1, total: 1, hasMore: false }
    }
  };

  const extracted = extractApiResponse(mockSuccessRes, 'Erreur chargement');
  assert(Array.isArray(extracted), 'Should unwrap inner data array');
  assert.strictEqual(extracted.length, 1);
  assert.strictEqual(extracted[0].title, 'Studio Ouakam');
  assert.strictEqual(extracted.meta?.total, 1, 'Should attach meta pagination info');
  passed++;
  console.log('  ✓ Standard SAMA LOYER envelope unwrapped transparently with meta');

  // 2. Déballage d'une réponse brute sans enveloppe
  const mockDirectRes = {
    success: true,
    status: 200,
    data: [{ id: 'direct-1' }]
  };
  const direct = extractApiResponse(mockDirectRes, 'Erreur brute');
  assert(Array.isArray(direct));
  assert.strictEqual(direct[0].id, 'direct-1');
  passed++;
  console.log('  ✓ Direct payload unwrapped when no outer data wrapper exists');

  // 3. Interception d'un échec applicatif (faux 200 OK avec success: false)
  const mockBusinessErrorRes = {
    success: true,
    status: 200,
    data: {
      success: false,
      code: 'AMOUNT_BELOW_MINIMUM',
      message: 'Montant minimum requis : 60 000 FCFA',
      details: { min: 60000 }
    }
  };

  assert.throws(
    () => extractApiResponse(mockBusinessErrorRes, 'Paiement échoué'),
    (err) => {
      assert.strictEqual(err.code, 'AMOUNT_BELOW_MINIMUM');
      assert.strictEqual(err.message, 'Montant minimum requis : 60 000 FCFA');
      assert.strictEqual(err.details?.min, 60000);
      return true;
    }
  );
  passed++;
  console.log('  ✓ Business error (success=false) caught and normalized with code & message');

  // 4. Interception d'une réponse vide / corrompue (502 Bad Gateway)
  const mockCorruptRes = {
    success: true,
    status: 200,
    data: null
  };

  assert.throws(
    () => extractApiResponse(mockCorruptRes, 'Erreur serveur'),
    (err) => {
      assert.strictEqual(err.status, 502);
      assert.strictEqual(err.code, 'INVALID_API_RESPONSE');
      return true;
    }
  );
  passed++;
  console.log('  ✓ Corrupted / empty response rejected with 502 INVALID_API_RESPONSE');

  // 5. Alias unwrapApiResponse fonctionne de manière identique
  assert.strictEqual(typeof unwrapApiResponse, 'function');
  const unwrapped = unwrapApiResponse(mockSuccessRes);
  assert.strictEqual(unwrapped[0].id, 'l-1');
  passed++;
  console.log('  ✓ unwrapApiResponse alias works identically');

  // 6. Exports modulaires depuis utils/apis/response.js et utils/apis/http.js
  assert.strictEqual(typeof extractFromResponseModule, 'function');
  assert.strictEqual(typeof extractFromHttpModule, 'function');
  assert.strictEqual(extractFromResponseModule, extractApiResponse);
  assert.strictEqual(extractFromHttpModule, extractApiResponse);
  passed++;
  console.log('  ✓ Clean modular exports across response.js, http.js and index.js');

  return passed;
}
