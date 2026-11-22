# 🧪 Testing Headless de Pages WeChat & Machine à États (uiState)

Ce guide détaille l'exécution de **tests unitaires headless** sur les contrôleurs de page WeChat sans interface graphique et sans ouvrir WeChat DevTools. Il est 100 % adapté aux pipelines d'intégration continue (**CI GitHub Actions & GitLab CI**).

---

## 🎯 1. Pourquoi le Testing Headless est Indispensable

Tester manuellement chaque écran dans WeChat DevTools ou sur téléphone physique présente plusieurs limites majeures :
- ❌ **Impossibilité d'automatiser en CI** : WeChat DevTools nécessite une interface graphique et un login par QR code.
- ❌ **Difficulté à tester les cas d'erreur** : Simuler une coupure 4G ou une erreur 500 Sonatel nécessite des proxies lourds.
- ❌ **Lenteur d'exécution** : Ouvrir l'IDE prend 15 à 30 secondes contre **3 millisecondes** pour le harness headless en Node.js pur.

---

## 🏗️ 2. Fonctionnement du Harness (`createPageHarness`)

Le harness instancie l'objet passé à `Page({...})` dans un runtime virtuel simulant l'API WeChat (`wx.*`) :

```
┌──────────────────────────────────────────────┐
│            createPageHarness(pageDef)        │
├──────────────────────────────────────────────┤
│  • this.data       : Copie isolée par test   │
│  • this.setData()  : Fusion de données       │
│  • triggerLoad()   : Déclenche onLoad()      │
│  • triggerShow()   : Déclenche onShow()      │
│  • triggerUnload() : Déclenche onUnload()    │
└──────────────────────────────────────────────┘
```

---

## 📋 3. Les 4 Règles d'Or du Test de Machine à États (`uiState`)

Pour chaque page du mini-programme, 4 assertions fondamentales doivent être vérifiées :

### 1. État Initial
Vérifier que la page démarre systématiquement en mode attente :
```javascript
const harness = createPageHarness(maPage);
assert.strictEqual(harness.data.uiState, 'loading');
```

### 2. Transition Nominale (`loading` ➔ `success`)
Vérifier qu'après résolution des promesses API, l'état bascule sur `success` et que les données sont correctement sculptées :
```javascript
await harness.triggerLoad();
assert.strictEqual(harness.data.uiState, 'success');
assert.ok(harness.data.items.length > 0);
```

### 3. Transition sur Erreur Réseau (`loading` ➔ `error`)
Injecter un rejet d'API et vérifier que l'état bascule sur `error` avec un message bienveillant pour l'utilisateur :
```javascript
await harness.triggerLoad();
assert.strictEqual(harness.data.uiState, 'error');
assert.ok(harness.data.errorMessage.length > 0);
```

### 4. Destruction Sans Fuite dans `onUnload()`
Vérifier que tous les timers (`clearInterval`) et les abonnements EventBus (`unsubscribe`) sont détruits :
```javascript
await harness.triggerUnload();
assert.strictEqual(harness.timerId, null);
```

---

## 🚀 4. Lancer les Tests en Ligne de Commande

```bash
# Lancer uniquement les tests unitaires headless de pages
npm run test:harness

# Lancer la suite de validation complète du skill
npm test
```

*(Retrouvez le code prêt à l'emploi dans [DOC_RECETTES_COPIER_COLLER.md](DOC_RECETTES_COPIER_COLLER.md#recette-52--harness-de-test-unitaire-headless-pour-machine-a-etats-uistate-ci-ready)).*

