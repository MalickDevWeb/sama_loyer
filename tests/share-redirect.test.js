// ============================================================================
// TESTS — PARTAGE & REDIRECTION EXTERNE (WhatsApp / SMS)
// ============================================================================

import assert from 'assert';
import { cleanPhoneNumber, redirectToWhatsApp } from '../utils/helpers/share-redirect.js';

export async function runShareRedirectTests() {
  console.log('\n--- Test Suite 5: External Share & Redirection ---');
  let passed = 0;

  // Test 1: Clean phone numbers for international WhatsApp
  assert.strictEqual(cleanPhoneNumber('+221 77 123 45 12'), '221771234512');
  assert.strictEqual(cleanPhoneNumber('77 123 45 67'), '221771234567');
  assert.strictEqual(cleanPhoneNumber('33 821 00 00'), '221338210000');
  assert.strictEqual(cleanPhoneNumber(''), '');
  passed++;
  console.log('  ✓ Phone number international normalization');

  // Test 2: Clipboard & redirection modal trigger
  let clipboardCalled = false;
  let modalCalled = false;
  global.wx.setClipboardData = ({ data, success }) => {
    clipboardCalled = true;
    assert.strictEqual(data, 'Test Message');
    if (success) success();
  };
  global.wx.showModal = ({ confirmText, success }) => {
    modalCalled = true;
    assert.strictEqual(confirmText, 'WhatsApp');
    if (success) success({ confirm: true });
  };

  await new Promise((resolve) => {
    redirectToWhatsApp({
      text: 'Test Message',
      phone: '+221 77 123 45 12',
      onComplete: () => {
        assert.strictEqual(clipboardCalled, true);
        assert.strictEqual(modalCalled, true);
        passed++;
        console.log('  ✓ WhatsApp clipboard copy and modal confirmation');
        resolve();
      }
    });
  });

  return passed;
}
