// ============================================================================
// TESTS — JSON-SCULPT MAPPERS
// ============================================================================

import assert from 'assert';
import { sculpt } from '../utils/json-sculpt/sculpt.js';
import { LogementCardSchema, LoyerSchema, VisiteSchema } from '../utils/mappers/index.js';

export async function runSculptTests() {
  console.log('\n--- Test Suite 2: Json-Sculpt Mappers ---');
  let passed = 0;

  // Test 1: LogementCardSchema
  const rawLogement = {
    id: 'ouakam-01',
    title: 'Studio meublé Ouakam',
    place: 'Ouakam Cité Avion',
    price: 90000,
    images: ['https://images.example.com/cover.jpg'],
    verified: true
  };
  const mappedLogement = sculpt.data({ data: rawLogement, to: LogementCardSchema });
  assert.strictEqual(mappedLogement.id, 'ouakam-01');
  assert.strictEqual(mappedLogement.priceFormatted, '90 000 F');
  assert.strictEqual(mappedLogement.cover, 'https://images.example.com/cover.jpg');
  assert.strictEqual(mappedLogement.verified, true);
  passed++;
  console.log('  ✓ LogementCardSchema mapping & currency formatting');

  // Test 2: LoyerSchema
  const rawLoyer = {
    id: 'loy-2026-10',
    amount: 150000,
    status: 'paid',
    homeName: 'Appartement Sacré-Cœur'
  };
  const mappedLoyer = sculpt.data({ data: rawLoyer, to: LoyerSchema });
  assert.strictEqual(mappedLoyer.amountFormatted, '150 000 F');
  assert.strictEqual(mappedLoyer.statusLabel, 'Payé');
  passed++;
  console.log('  ✓ LoyerSchema mapping & status label computation');

  // Test 3: VisiteSchema
  const rawVisite = {
    id: 'vis-101',
    status: 'confirmed',
    landlordName: 'Moussa Diallo'
  };
  const mappedVisite = sculpt.data({ data: rawVisite, to: VisiteSchema });
  assert.strictEqual(mappedVisite.statusLabel, 'Visite confirmée');
  passed++;
  console.log('  ✓ VisiteSchema mapping');

  return passed;
}
