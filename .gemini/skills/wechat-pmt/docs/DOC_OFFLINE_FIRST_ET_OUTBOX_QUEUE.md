# 📴 Résilience Hors-Ligne (Offline-First) & Outbox Pattern

Ce guide détaille l'implémentation de la **file d'attente hors-ligne (Outbox Pattern)** pour WeChat Mini-Program et TCMPP (**Sonatel Max It**). Il garantit que les actions utilisateur ne sont jamais perdues, même en cas de coupure brutale du réseau mobile en zone rurale ou en transit.

---

## 🎯 1. Les Limites de l'Approche Classique en Mobilité

Dans les réseaux mobiles d'Afrique de l'Ouest, les micro-coupures de quelques secondes sont fréquentes.
- ❌ **Approche Naïve** : L'utilisateur clique sur "Enregistrer", la requête échoue avec `request:fail timeout`, un message d'erreur rouge s'affiche et l'utilisateur perd ses données saisies.
- ✅ **Standard Offline-First (Outbox Pattern)** :
  1. Si le réseau est absent ou défaillant, l'action est enregistrée dans une file d'attente locale sécurisée (**Outbox**).
  2. L'interface s'adapte immédiatement avec un retour positif optimiste (**Optimistic UI**), assorti d'une pastille "En attente de synchronisation".
  3. Dès que le module `NetworkMonitor` détecte le rétablissement de la connexion (`wx.onNetworkStatusChange`), les actions en attente sont rejouées séquentiellement en tâche de fond.

---

## 🏗️ 2. Architecture de la File d'Attente Outbox

```
┌─────────────────┐       ┌────────────────────┐       ┌──────────────────────┐
│  Action Écran   │ ───►  │  Outbox Queue      │ ───►  │  Backend Sonatel     │
│  (ex: Avis/Fav) │       │  (Persistance      │       │  (Rejeu Séquentiel   │
└─────────────────┘       │   wx.setStorage)   │       │   Idempotent)        │
         │                └────────────────────┘       └──────────────────────┘
         ▼                           ▲                             │
┌─────────────────┐                  │                             │
│ Optimistic UI   │                  └─────────────────────────────┘
│ (0 ms ressenti) │                   Écouteur wx.onNetworkStatusChange
└─────────────────┘
```

### Règles Cardinales de Conception :
1. **Idempotence Obligatoire** : Chaque élément de la file possède un identifiant unique (`uuid` ou timestamp + suffixe aléatoire) envoyé au backend sous le header `X-Idempotency-Key` pour empêcher tout traitement en double.
2. **Ordre FIFO (First-In, First-Out)** : Les requêtes sont rejouées strictement dans l'ordre où l'utilisateur les a créées.
3. **Plafond de Sécurité (Quota Storage)** : Limiter l'Outbox à 50 éléments maximum pour ne jamais saturer le quota de 10 Mo de WeChat.
4. **Distinction Monétaire vs Non-Monétaire** : Ne JAMAIS empiler d'actions de débit bancaire Orange Money dans l'Outbox ! Le paiement passe exclusivement par le bouclier `@NATIVE-PAY`. L'Outbox est dédiée aux formulaires, signalements, favoris, paniers et logs.

---

## 🔄 3. Cycle de Vie du Flush Automatique

Le vidage de la file d'attente s'active sur deux déclencheurs :
1. **Événement Système Réseau** : `wx.onNetworkStatusChange(({ isConnected }) => { if (isConnected) Outbox.flush(); })`.
2. **Reprise de l'Écran (`onShow`)** : Dès que l'utilisateur rouvre le mini-programme après l'avoir minimisé.

### Gestion des Erreurs lors du Rejeu :
- **Erreur 4xx (Client/Validation)** : L'action est retirée de l'Outbox et consignée dans les logs d'erreurs (inutile de retenter une requête invalide).
- **Erreur 5xx / Timeout** : L'élément est conservé dans l'Outbox, son compteur `retryCount` est incrémenté, et une pause de 2 secondes est observée avant de retenter l'élément suivant.

*(Consultez l'implémentation complète prête à l'emploi dans [DOC_RECETTES_COPIER_COLLER.md](DOC_RECETTES_COPIER_COLLER.md#recette-51--outbox-pattern--file-dattente-hors-ligne-avec-auto-replay-4g)).*

