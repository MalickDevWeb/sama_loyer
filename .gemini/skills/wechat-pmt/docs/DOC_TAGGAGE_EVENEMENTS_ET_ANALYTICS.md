# 📊 Taggage d'Événements & Tracking Analytics (Standard Orange / Sonatel)

> **Référentiel officiel pour le suivi des parcours clients et conversions TCMPP / Max It**  
> Ce document définit l'architecture de télémétrie, la nomenclature des événements et l'intégration EventBus.

---

## 🎯 Déclencheur IA : `@ANALYTICS-TRACK`

Lorsque vous utilisez le déclencheur **`@ANALYTICS-TRACK`**, l'IA implémente automatiquement :
1. Le suivi automatique des écrans (`page_view`) dans `onShow()`.
2. Le marquage des tunnels de conversion (sélection, étape panier, paiement).
3. L'interception des erreurs sans bloquer l'expérience utilisateur.
4. L'utilisation d'une file d'attente hors-ligne (*offline queue*) pour ne perdre aucun tag en cas de coupure réseau.

---

## 📐 1. Nomenclature Standardisée des Événements

Orange et Sonatel imposent le format snake_case standardisé : `[objet]_[action]` :

| Nom de l'Événement | Quand le déclencher ? | Paramètres Obligatoires |
|---|---|---|
| `page_view` | À chaque entrée sur un écran (`onShow`) | `page_name`, `page_path`, `category` |
| `cta_click` | Clic sur un bouton d'action principal | `cta_label`, `page_name`, `target_url` |
| `search_executed` | Recherche utilisateur soumise | `search_term`, `results_count` |
| `item_view` | Consultation d'une fiche détail | `item_id`, `item_name`, `price`, `currency` |
| `booking_step` | Étape du tunnel de réservation franchie | `step_number`, `step_name`, `item_id` |
| `payment_initiated` | Clic sur "Payer" avant le plugin | `amount`, `currency`, `merchant_name` |
| `payment_succeeded` | Paiement confirmé par le plugin | `txnid`, `amount`, `currency` |
| `payment_failed` | Échec ou abandon de paiement | `error_code`, `reason`, `amount` |
| `app_error` | Erreur technique ou API interceptée | `error_type`, `error_message`, `status_code` |

---

## 🔌 2. Module de Tracking Unifié (`utils/analytics/tracker.js`)

```javascript
// utils/analytics/tracker.js
import { Bus } from '../event/index.js';

const QUEUE_STORAGE_KEY = 'ats_analytics_queue';
const FLUSH_INTERVAL_MS = 10000; // Envoi groupé toutes les 10 secondes

class AnalyticsTracker {
  #queue = [];
  #isFlushing = false;

  constructor() {
    this.#loadQueue();
    // Écoute automatique des événements émis sur l'EventBus
    if (typeof Bus !== 'undefined' && Bus.on) {
      Bus.on('analytics:track', (payload) => this.track(payload.event, payload.properties));
    }
    // Flush périodique
    setInterval(() => this.flush(), FLUSH_INTERVAL_MS);
  }

  #loadQueue() {
    try {
      const raw = wx.getStorageSync(QUEUE_STORAGE_KEY);
      this.#queue = Array.isArray(raw) ? raw : [];
    } catch {
      this.#queue = [];
    }
  }

  #saveQueue() {
    try {
      wx.setStorageSync(QUEUE_STORAGE_KEY, this.#queue);
    } catch (e) {
      console.warn('[Analytics] Sauvegarde file attente échouée:', e.message);
    }
  }

  /**
   * Enregistre un événement de tracking.
   * @param {string} eventName - Nom standardisé (ex: 'page_view')
   * @param {Object} properties - Propriétés contextuelles
   */
  track(eventName, properties = {}) {
    const sys = wx.getSystemInfoSync();
    const user = (Bus && Bus.getState('user.data')) || {};

    const payload = {
      event: eventName,
      timestamp: Date.now(),
      iso_time: new Date().toISOString(),
      user: {
        msisdn: user.msisdn ? String(user.msisdn).replace(/.(?=.{4})/g, '*') : 'anonymous',
        is_mock: Boolean(user.isMock),
      },
      device: {
        platform: sys.platform,
        system: sys.system,
        brand: sys.brand,
        model: sys.model,
      },
      data: properties,
    };

    console.log(`[Analytics 📊] ${eventName}`, payload.data);
    this.#queue.push(payload);
    this.#saveQueue();

    // Si événement critique (ex: paiement), vider immédiatement la file
    if (eventName.startsWith('payment_') || this.#queue.length >= 10) {
      this.flush();
    }
  }

  /**
   * Envoie la file d'attente vers l'API de collecte.
   */
  async flush() {
    if (this.#isFlushing || this.#queue.length === 0) return;
    this.#isFlushing = true;

    const batch = [...this.#queue];
    try {
      // Simulation d'envoi API télémétrie Orange / ATS
      // await httpClient.post('/analytics/events', { events: batch });
      
      // En cas de succès, retirer le lot traité
      this.#queue = this.#queue.slice(batch.length);
      this.#saveQueue();
    } catch (err) {
      console.warn('[Analytics] Envoi télémétrie échoué, report au prochain flush:', err.message);
    } finally {
      this.#isFlushing = false;
    }
  }

  // Raccourci pour les vues d'écran
  pageView(pageName, category = 'main') {
    this.track('page_view', { page_name: pageName, category });
  }
}

export const tracker = new AnalyticsTracker();
```

---

## 📱 3. Implémentation dans une Page

### Dans `onShow()` de la Page
```javascript
import { tracker } from '../../utils/analytics/tracker';

Page({
  onShow() {
    // 📊 Traçage automatique de l'écran
    tracker.pageView('Detail Destination', 'catalog');
  },

  handleReserveTap() {
    // 📊 Traçage du clic CTA
    tracker.track('cta_click', {
      cta_label: 'Réserver ce voyage',
      item_id: this.data.destination.id,
      item_name: this.data.destination.title,
    });

    navigateToLocked(this, '/pages/booking/booking', '_navLock');
  }
});
```

---

## 💳 4. Traçage du Tunnel de Paiement

```javascript
// Étape 1 : Lancement du paiement
tracker.track('payment_initiated', {
  item_id: destination.id,
  amount: totalAmount,
  currency: 'XOF',
  payment_method: 'Orange Money Max It',
});

// Étape 2 : Succès plugin natif
tracker.track('payment_succeeded', {
  txnid: paymentResult.txnid,
  amount: totalAmount,
  currency: 'XOF',
});

// Étape 3 : Cas d'erreur ou d'annulation
tracker.track('payment_failed', {
  error_code: err.code || 'UNKNOWN',
  reason: err.message,
  uncertain: Boolean(err.uncertain),
});
```

---

## 🛡️ Règles d'Or RGPD & Confidentialité Orange

1. **Zéro Donnée Personnelle en Clair** : Ne JAMAIS loguer de numéro de téléphone en clair (`msisdn`). Toujours masquer : `77***1234`.
2. **Non-Bloquant** : Une erreur du serveur analytics ne doit **JAMAIS** bloquer un parcours utilisateur ou faire échouer une réservation.
3. **Persistance Hors-Ligne** : Tous les tags sont d'abord ajoutés à la file locale pour résister aux zones blanches et tunnels.

