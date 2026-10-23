// ============================================================================
// TESTS — EVENTBUS SAMA LOYER
// ============================================================================

import assert from 'assert';
import { Bus } from '../utils/event/index.js';
import { STATE_KEYS, EVENTS } from '../utils/event/keys.js';

export async function runEventBusTests() {
  console.log('\n--- Test Suite 1: EventBus ---');
  let passed = 0;

  // Test 1: emit and on
  let received = null;
  const off1 = Bus.on('test.event', (data) => { received = data; });
  await Bus.emit('test.event', { foo: 'bar' });
  assert.strictEqual(received?.foo, 'bar', 'Bus.emit should trigger Bus.on');
  off1();
  passed++;
  console.log('  ✓ Bus.on & Bus.emit');

  // Test 2: unsubscribe
  let count = 0;
  const off2 = Bus.on('test.unsub', () => { count++; });
  await Bus.emit('test.unsub');
  off2();
  await Bus.emit('test.unsub');
  assert.strictEqual(count, 1, 'Unsubscribe should prevent subsequent triggers');
  passed++;
  console.log('  ✓ Bus unsubscribe');

  // Test 3: once
  let onceCount = 0;
  Bus.once('test.once', () => { onceCount++; });
  await Bus.emit('test.once');
  await Bus.emit('test.once');
  assert.strictEqual(onceCount, 1, 'Bus.once should trigger only once');
  passed++;
  console.log('  ✓ Bus.once');

  // Test 4: setState and getState
  Bus.setState(STATE_KEYS.APP_INITIALIZED, true);
  assert.strictEqual(Bus.getState(STATE_KEYS.APP_INITIALIZED), true, 'Bus.getState should return updated state');
  passed++;
  console.log('  ✓ Bus.setState & Bus.getState');

  // Test 5: onState change notification
  let stateReceived = null;
  const offState = Bus.onState(STATE_KEYS.UNREAD_CLIENT, ({ value }) => {
    stateReceived = value;
  });
  Bus.setState(STATE_KEYS.UNREAD_CLIENT, 4);
  assert.strictEqual(stateReceived, 4, 'Bus.onState should receive state changes');
  offState();
  passed++;
  console.log('  ✓ Bus.onState reactive subscription');

  return passed;
}

