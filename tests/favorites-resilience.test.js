// ============================================================================
// TESTS — SYSTÈME DE RÉSILIENCE DES FAVORIS (Offline-First & Reconciliation)
// ============================================================================

import assert from 'assert';
import { storage } from '../utils/storage.js';
import { STORAGE_KEYS } from '../utils/constants/index.js';
import { Bus } from '../utils/event/index.js';
import { EVENTS, STATE_KEYS } from '../utils/event/keys.js';
import {
  getFavoriteIds,
  isFavorite,
  toggleFavoriteId,
  getFavoritesQueue,
  flushFavoritesQueue,
  reconcileFavoritesWithBackend
} from '../utils/helpers/favorites.js';
import { sculpt } from '../utils/json-sculpt/sculpt.js';
import { FavoriteListSchema } from '../utils/mappers/favorite.sculpt.js';

export async function runFavoritesResilienceTests() {
  console.log('\n--- Test Suite 6: Favorites Resilience & Backend Sync ---');
  let passed = 0;

  // Setup initial clean state
  storage.set(STORAGE_KEYS.FAVORITES, ['fav-1', 'fav-2']);
  storage.set(STORAGE_KEYS.FAVORITES_QUEUE, []);

  // --------------------------------------------------------------------------
  // Test 1: Optimistic UI Update & EventBus Reaction
  // --------------------------------------------------------------------------
  let eventReceived = null;
  const off = Bus.on(EVENTS.FAVORITES_CHANGED, (data) => {
    eventReceived = data;
  });

  const nextIds = toggleFavoriteId('fav-3', true);
  assert(nextIds.includes('fav-3'), 'fav-3 should be in returned IDs');
  assert(isFavorite('fav-3'), 'isFavorite(fav-3) should be true');
  assert(eventReceived !== null, 'EVENTS.FAVORITES_CHANGED should have been emitted');
  assert(eventReceived.ids.includes('fav-3'), 'Event payload should include fav-3');
  off();
  passed++;
  console.log('  ✓ Optimistic UI update & immediate EventBus notification (0ms)');

  // --------------------------------------------------------------------------
  // Test 2: Outbox Queuing & Deduplication / Idempotency
  // --------------------------------------------------------------------------
  const queueAfterAdd = getFavoritesQueue();
  const queuedFav3 = queueAfterAdd.find((item) => item.id === 'fav-3');
  assert(queuedFav3 !== undefined, 'fav-3 should be in Outbox queue');
  assert.strictEqual(queuedFav3.isLiked, true, 'Queued item should have isLiked=true');

  // Immediately unlike fav-3 before sync finishes: should update pending task without duplicate entries
  toggleFavoriteId('fav-3', false);
  const queueAfterRemove = getFavoritesQueue();
  const matchingEntries = queueAfterRemove.filter((item) => item.id === 'fav-3');
  assert.strictEqual(matchingEntries.length, 1, 'Should only have 1 coalesced task for fav-3');
  assert.strictEqual(matchingEntries[0].isLiked, false, 'Queued task should now reflect isLiked=false');
  passed++;
  console.log('  ✓ Outbox queue coalescing & idempotency deduplication');

  // --------------------------------------------------------------------------
  // Test 3: Offline Protection & Background Outbox Flush
  // --------------------------------------------------------------------------
  // Put a specific offline item in the outbox
  storage.set(STORAGE_KEYS.FAVORITES_QUEUE, [
    { id: 'fav-offline-1', isLiked: true, timestamp: Date.now(), retries: 0 }
  ]);

  // Simulate offline state: queue should be preserved without errors
  Bus.setState(STATE_KEYS.NETWORK_CONNECTED, false);
  const offlineFlushResult = await flushFavoritesQueue();
  assert.strictEqual(offlineFlushResult.synced, 0, 'No items should be synced while offline');
  assert(getFavoritesQueue().length > 0, 'Outbox queue should be preserved when offline');

  // Restore online state: auto-sync listener triggers automatically
  Bus.setState(STATE_KEYS.NETWORK_CONNECTED, true);
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.strictEqual(getFavoritesQueue().length, 0, 'Outbox queue should be automatically flushed upon network reconnect');
  passed++;
  console.log('  ✓ Offline outbox persistence & resilient background flush');

  // --------------------------------------------------------------------------
  // Test 4: Conflict Resolution & Bidirectional Reconciliation
  // --------------------------------------------------------------------------
  // Simulate scenario:
  // Server returns: ['server-1', 'server-2']
  // Local user made an offline change: toggled 'local-new' to TRUE
  toggleFavoriteId('local-new', true);

  const reconciled = await reconcileFavoritesWithBackend();
  assert(reconciled.includes('local-new'), 'Reconciled list must preserve local uncommitted action (local-new)');
  assert.strictEqual(isFavorite('local-new'), true, 'local-new remains favorite after reconciliation');
  passed++;
  console.log('  ✓ Conflict resolution: uncommitted local changes take precedence');

  // --------------------------------------------------------------------------
  // Test 5: Json-Sculpt Schema Validation for Favorites
  // --------------------------------------------------------------------------
  const rawApiResponse = {
    success: true,
    data: [
      { id: 'fav-10', logement_id: 'ouakam-10', created_at: 1729000000 },
      { id: 'fav-11', logement_id: 'yoff-11', created_at: 1729000010 }
    ],
    total: 2
  };

  const sculpted = sculpt.data({ data: rawApiResponse, to: FavoriteListSchema });
  assert.strictEqual(sculpted.items.length, 2, 'FavoriteListSchema should extract 2 items');
  assert(sculpted.items.includes('ouakam-10'), 'Schema must extract logement_id ouakam-10');
  assert(sculpted.items.includes('yoff-11'), 'Schema must extract logement_id yoff-11');
  assert.strictEqual(sculpted.total, 2, 'Schema must extract total count');
  passed++;
  console.log('  ✓ Json-Sculpt FavoriteListSchema maps raw API payloads cleanly');

  return passed;
}
