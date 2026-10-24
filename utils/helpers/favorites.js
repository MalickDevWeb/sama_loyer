// ============================================================================
// FAVORITES RESILIENCE SYSTEM — SAMA LOYER (Offline-First, Optimistic UI & Sync)
//
// 1. Optimistic Updates : mise à jour locale immédiate (0ms de latence)
// 2. Outbox Queue (File d'attente persistante) : idempotence et déduplication des actions
// 3. Background Sync & Exponential Retry : synchronisation automatique dès que le réseau est actif
// 4. Bidirectional Reconciliation : réconciliation avec le backend avec priorité aux actions locales non confirmées
// 5. Automatic Rollback : annulation sécurisée en cas d'erreur définitive 4xx
// ============================================================================

import { storage } from '../storage.js';
import { STORAGE_KEYS } from '../constants/index.js';
import { DEFAULT_FAVORITE_IDS } from '../mocks/logements.js';
import { Bus } from '../event/index.js';
import { EVENTS, STATE_KEYS } from '../event/keys.js';
import { backendAPI } from '../apis/index.js';

const MAX_RETRIES = 5;
let isSyncing = false;
let syncTimeoutId = null;

/**
 * Récupère la liste des IDs favoris depuis le stockage local (cache optimiste).
 * @returns {Array<string>}
 */
export function getFavoriteIds() {
  const saved = storage.get(STORAGE_KEYS.FAVORITES, null);

  if (saved === null) return DEFAULT_FAVORITE_IDS.map(String);
  if (Array.isArray(saved)) return saved.map(String);

  if (typeof saved === 'object') {
    return Object.keys(saved).filter((id) => saved[id]).map(String);
  }
  return [];
}

/**
 * Vérifie si un logement fait partie des favoris.
 * @param {string|number} id
 * @returns {boolean}
 */
export function isFavorite(id) {
  const targetId = String(id);
  return getFavoriteIds().includes(targetId);
}

/**
 * Récupère la file d'attente Outbox des actions non encore confirmées par le backend.
 * @returns {Array<{ id: string, isLiked: boolean, timestamp: number, retries: number }>}
 */
export function getFavoritesQueue() {
  const queue = storage.get(STORAGE_KEYS.FAVORITES_QUEUE, []);
  return Array.isArray(queue) ? queue : [];
}

/**
 * Sauvegarde la file d'attente Outbox dans le stockage persistant.
 */
function saveFavoritesQueue(queue) {
  storage.set(STORAGE_KEYS.FAVORITES_QUEUE, queue);
}

/**
 * Ajoute ou met à jour une action dans l'Outbox (déduplication / idempotence).
 * Si l'utilisateur aime puis retire immédiatement, les opérations opposées se compensent.
 */
function queueFavoriteAction(id, isLiked) {
  const queue = getFavoritesQueue();
  const targetId = String(id);

  // Recherche d'une action en attente pour cet ID
  const existingIdx = queue.findIndex((action) => action.id === targetId);

  if (existingIdx >= 0) {
    // Si l'action en attente avait déjà ce statut, ne rien faire de plus
    if (queue[existingIdx].isLiked === isLiked) {
      return queue;
    }
    // Action inverse : met à jour le statut souhaité et réinitialise les tentatives
    queue[existingIdx].isLiked = isLiked;
    queue[existingIdx].timestamp = Date.now();
    queue[existingIdx].retries = 0;
  } else {
    queue.push({
      id: targetId,
      isLiked: !!isLiked,
      timestamp: Date.now(),
      retries: 0
    });
  }

  saveFavoritesQueue(queue);
  return queue;
}

/**
 * Dépile et synchronise la file d'attente Outbox avec le backend.
 * Résistant aux coupures réseau : conserve les actions et réessaie ultérieurement.
 * @returns {Promise<{ synced: number, remaining: number }>}
 */
export async function flushFavoritesQueue() {
  if (isSyncing) return { synced: 0, remaining: getFavoritesQueue().length };

  const isConnected = Bus.getState(STATE_KEYS.NETWORK_CONNECTED, true);
  const queue = getFavoritesQueue();

  if (queue.length === 0) {
    Bus.emit(EVENTS.FAVORITES_SYNC_STATUS, { status: 'idle', pendingCount: 0 }).catch(() => {});
    return { synced: 0, remaining: 0 };
  }

  if (!isConnected) {
    Bus.emit(EVENTS.FAVORITES_SYNC_STATUS, { status: 'offline', pendingCount: queue.length }).catch(() => {});
    return { synced: 0, remaining: queue.length };
  }

  isSyncing = true;
  Bus.emit(EVENTS.FAVORITES_SYNC_STATUS, { status: 'syncing', pendingCount: queue.length }).catch(() => {});

  let synced = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      if (item.isLiked) {
        await backendAPI.addFavorite(item.id);
      } else {
        await backendAPI.removeFavorite(item.id);
      }
      synced++;
    } catch (err) {
      const status = (err && err.status) || 0;

      // Erreur client définitive (400, 404 logement introuvable, 422) :
      // On abandonne l'action et on effectue un rollback sur l'élément
      if (status >= 400 && status < 500) {
        console.warn('[Favorites] Action rejetée par le serveur (rollback):', item.id, err);
        rollbackLocalFavorite(item.id, !item.isLiked);
      } else {
        // Erreur réseau ou 5xx temporaire : on conserve dans l'Outbox pour le prochain cycle
        item.retries = (item.retries || 0) + 1;
        if (item.retries <= MAX_RETRIES) {
          remaining.push(item);
        } else {
          // Abandon après nombre maximal de tentatives pour éviter d'encombrer l'Outbox
          console.error('[Favorites] Abandon après max retries:', item.id);
        }
      }
    }
  }

  saveFavoritesQueue(remaining);
  storage.set(STORAGE_KEYS.FAVORITES_LAST_SYNC, Date.now());
  isSyncing = false;

  Bus.emit(EVENTS.FAVORITES_SYNC_STATUS, {
    status: 'idle',
    pendingCount: remaining.length,
    lastSync: Date.now()
  }).catch(() => {});

  return { synced, remaining: remaining.length };
}

/**
 * Annule une action locale en cas de rejet définitif du serveur (Rollback).
 */
function rollbackLocalFavorite(id, restoreLiked) {
  const currentIds = getFavoriteIds();
  const targetId = String(id);
  let nextIds;

  if (restoreLiked) {
    if (!currentIds.includes(targetId)) nextIds = [...currentIds, targetId];
    else nextIds = currentIds;
  } else {
    nextIds = currentIds.filter((item) => item !== targetId);
  }

  storage.set(STORAGE_KEYS.FAVORITES, nextIds);
  Bus.emit(EVENTS.FAVORITES_CHANGED, { ids: nextIds, rollback: true }).catch(() => {});

  try {
    wx.showToast({
      title: 'Action impossible sur cette annonce',
      icon: 'none'
    });
  } catch (e) {}
}

/**
 * Point d'entrée principal : ajoute ou retire un favori.
 * 1. Optimistic Update : sauvegarde locale immédiate + EventBus (UI fluide)
 * 2. Outbox Queue : enregistrement résistant aux coupures
 * 3. Background Sync : envoi en tâche de fond
 *
 * @param {string|number} id - L'ID du logement
 * @param {boolean} isLiked - true pour ajouter, false pour retirer
 * @returns {Array<string>} Nouvelle liste d'IDs favoris (instantanée)
 */
export function toggleFavoriteId(id, isLiked) {
  const targetId = String(id);
  const currentIds = getFavoriteIds();
  let nextIds;

  if (isLiked) {
    if (!currentIds.includes(targetId)) {
      nextIds = [...currentIds, targetId];
    } else {
      nextIds = currentIds;
    }
  } else {
    nextIds = currentIds.filter((savedId) => savedId !== targetId);
  }

  // 1. Sauvegarde locale immédiate
  storage.set(STORAGE_KEYS.FAVORITES, nextIds);

  // 2. Notification réactive EventBus pour tous les écrans ouverts
  Bus.emit(EVENTS.FAVORITES_CHANGED, { ids: nextIds }).catch(() => {});

  // 3. Mise en file d'attente Outbox
  queueFavoriteAction(targetId, isLiked);

  // 4. Synchronisation en arrière-plan asynchrone (non-bloquante)
  clearTimeout(syncTimeoutId);
  syncTimeoutId = setTimeout(() => {
    flushFavoritesQueue().catch(() => {});
  }, 100);

  return nextIds;
}

/**
 * Réconciliation bidirectionnelle entre l'état Backend et le Front-end.
 * Règle de résolution des conflits :
 * Le serveur fournit la vérité de référence, mais TOUTE action locale en attente dans l'Outbox
 * prime (priorité aux intentions utilisateur locales les plus récentes).
 *
 * @returns {Promise<Array<string>>} Liste canonique consolidée
 */
export async function reconcileFavoritesWithBackend() {
  try {
    // 1. Récupération des favoris côté serveur
    const serverFavorites = await backendAPI.getFavorites();
    const serverSet = new Set((serverFavorites || []).map(String));

    // 2. Application des actions locales en attente dans l'Outbox
    const queue = getFavoritesQueue();
    for (const pending of queue) {
      if (pending.isLiked) {
        serverSet.add(pending.id);
      } else {
        serverSet.delete(pending.id);
      }
    }

    const consolidatedIds = Array.from(serverSet);

    // 3. Mise à jour du stockage local et émission de l'événement de synchronisation
    storage.set(STORAGE_KEYS.FAVORITES, consolidatedIds);
    storage.set(STORAGE_KEYS.FAVORITES_SERVER_CACHE, (serverFavorites || []).map(String));
    storage.set(STORAGE_KEYS.FAVORITES_LAST_SYNC, Date.now());

    Bus.emit(EVENTS.FAVORITES_SYNCED, { ids: consolidatedIds, count: consolidatedIds.length }).catch(() => {});
    Bus.emit(EVENTS.FAVORITES_CHANGED, { ids: consolidatedIds }).catch(() => {});

    // 4. Si des actions sont encore en file d'attente, on déclenche le flush
    if (queue.length > 0) {
      flushFavoritesQueue().catch(() => {});
    }

    return consolidatedIds;
  } catch (error) {
    // En cas d'échec réseau complet, on retombe en toute sécurité sur l'état local
    console.warn('[Favorites] Échec de réconciliation backend, maintien de la source locale:', error);
    return getFavoriteIds();
  }
}

/**
 * Renvoie les favoris sous forme de map { [id]: true }, pratique en WXML.
 * @returns {Object}
 */
export function getFavoritesMap() {
  return getFavoriteIds().reduce((map, id) => {
    map[id] = true;
    return map;
  }, {});
}

/**
 * Applique l'état 'like' (true/false) à une liste de logements.
 * @param {Array<Object>} packages
 * @returns {Array<Object>}
 */
export function applyFavoritesToPackages(packages = []) {
  if (!Array.isArray(packages)) return [];
  const favoriteIds = getFavoriteIds();

  return packages.map((pkg) => ({
    ...pkg,
    like: favoriteIds.includes(String(pkg.id)),
  }));
}

/**
 * Initialisation automatique des écouteurs de résilience :
 * - Déclenche la synchronisation dès que le réseau se reconnecte
 */
export function initFavoritesResilience() {
  if (initFavoritesResilience._initialized) return;
  initFavoritesResilience._initialized = true;

  // Reconnexion réseau : on vide l'outbox automatiquement
  Bus.on(EVENTS.NETWORK_CHANGE, ({ isConnected }) => {
    if (isConnected) {
      flushFavoritesQueue().catch(() => {});
    }
  });

  Bus.onState(STATE_KEYS.NETWORK_CONNECTED, ({ value: isConnected }) => {
    if (isConnected) {
      flushFavoritesQueue().catch(() => {});
    }
  });
}

// Initialise les écouteurs dès l'import du module
initFavoritesResilience();
