// ============================================================================
// TESTS — I18N DICTIONNAIRES & TRADUCTION (FR & EN)
// ============================================================================

import assert from 'assert';
import { t, setLocale, getLocale } from '../utils/i18n/index.js';

export async function runI18nTests() {
  console.log('\n--- Test Suite 3: i18n & Translation (FR / EN) ---');
  let passed = 0;

  // Test 1: French default
  setLocale('fr');
  assert.strictEqual(getLocale(), 'fr');
  assert.strictEqual(t('common.appName'), 'SAMA LOYER');
  assert.strictEqual(t('tabs.myRent'), 'Mes loyers');
  passed++;
  console.log('  ✓ French translations lookup');

  // Test 2: Parameter replacement
  const subtitle = t('favoris.subtitle', { count: 5 });
  assert.strictEqual(subtitle, '5 logements enregistrés');
  passed++;
  console.log('  ✓ Parameter replacement {count}');

  // Test 3: English locale switch
  setLocale('en');
  assert.strictEqual(getLocale(), 'en');
  assert.strictEqual(t('tabs.myRent'), 'My Rent');
  assert.strictEqual(t('tabs.search'), 'Search');
  assert.strictEqual(t('tabs.visits'), 'Visits');
  assert.strictEqual(t('common.confirm'), 'Confirm');
  passed++;
  console.log('  ✓ English translations switch & lookup');

  // Reset to French
  setLocale('fr');

  return passed;
}
