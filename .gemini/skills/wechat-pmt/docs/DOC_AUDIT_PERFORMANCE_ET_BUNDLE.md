# ⚡ Audit de Performance, Bundle & 60 FPS (TCMPP / WeChat)

Ce guide détaille les règles impératives pour maintenir une fluidité à **60 FPS constants**, éliminer les fuites de mémoire et garantir que votre mini-programme respecte les plafonds stricts de taille imposés par WeChat et le conteneur **Sonatel Max It (TCMPP)**.

---

## 🎯 1. Les 4 Règles d'Or de Performance Mobile

| Métrique | Limite Stricte | Impact si non-respecté |
|---|---|---|
| **Taille du Paquet Principal** | **≤ 2048 Ko (2 Mo)** | ❌ Rejet fatal de compilation TCMPP / WeChat. |
| **Taille de Sous-Paquet** | **≤ 2048 Ko (2 Mo)** | ❌ Rejet lors de l'upload vers la console Sonatel. |
| **Poids d'un Asset Local** | **≤ 100 Ko** | ⚠️ Gonflement inutile du bundle (privilégier CDN ou SVG). |
| **Payload `setData`** | **≤ 1024 Ko** | 📉 Chute de framerate (< 30 FPS) et saccades au scroll. |

---

## 🛠️ 2. L'Outil Automatique : Bundle Doctor

Le skill intègre l'analyseur statique **Bundle & Performance Doctor** (`scripts/bundle-doctor.js`).

### Lancer l'analyse sur votre projet :
```bash
# Analyse du projet courant
npm run analyze

# Ou analyse d'un dossier spécifique
node scripts/bundle-doctor.js /chemin/vers/mon-mini-programme
```

### Ce que le script vérifie automatiquement :
1. **Plafond 2 Mo TCMPP** : Analyse `app.json`, calcule le poids du paquet principal et de chaque sous-paquet (`subpackages/`). Alerte à 1.8 Mo, bloque à 2.0 Mo.
2. **Détection d'Assets Lourds** : Repère tout fichier `.png`, `.jpg`, `.webp` dépassant 100 Ko.
3. **Fuites Mémoire (Memory Leaks)** : Détecte les `setInterval` sans `clearInterval` dans `onUnload`/`detached`, et les abonnements `Bus.on` non nettoyés.
4. **I/O Bloquante** : Détecte les appels synchrones `wx.getStorageSync` ou `wx.setStorageSync` enfermés dans des boucles (`for`, `while`, `forEach`, `map`).

---

## 🚀 3. Optimisation de `setData` (Le Cœur du 60 FPS)

Dans l'architecture WeChat, `setData` implique une sérialisation JSON et un passage de pont (Bridge) entre le thread de logique (JS Core) et le thread de rendu (WebView).

### 3.1 Règle du Chemins Partiel (Data-Path Updates)
Ne renvoyez JAMAIS tout un tableau d'objets pour modifier un seul statut :

```javascript
// ❌ ANTI-PATTERN : Renvoyer 50 éléments (Lourd & Lent)
const items = this.data.items;
items[index].isFavorite = true;
this.setData({ items: items });

// ✅ STANDARD PMT : Mise à jour ciblée à 0 ms de latence
this.setData({
  [`items[${index}].isFavorite`]: true
});
```

### 3.2 Throttling Obligatoire sur `onPageScroll`
Tout calcul basé sur le défilement de l'écran doit être bridé (throttled) à 50ms - 100ms :

```javascript
import { throttle } from '../../utils/helpers/timing';

Page({
  onPageScroll: throttle(function(e) {
    const isScrolled = e.scrollTop > 80;
    if (this.data.isScrolled !== isScrolled) {
      this.setData({ isScrolled });
    }
  }, 80)
});
```

---

## 🧠 4. Prévention Systématique des Fuites Mémoire

Dans WeChat, une page n'est pas détruite tant qu'elle reste dans la pile de navigation (jusqu'à 10 pages). Tout timer orphelin continuera de tourner en tâche de fond et videra la batterie du smartphone.

### Contrat de Nettoyage Obligatoire :
```javascript
Page({
  data: {
    timerId: null
  },

  onLoad() {
    // 1. Stocker la référence du timer
    this.timerId = setInterval(() => {
      this.refreshStatus();
    }, 5000);

    // 2. Écoute EventBus
    this._unsubscribeBus = Bus.on('ORDER_UPDATED', this.onOrderUpdated.bind(this));
  },

  onUnload() {
    // 3. TOUJOURS détruire le timer à la sortie de l'écran
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }

    // 4. TOUJOURS désabonner les écouteurs de bus
    if (this._unsubscribeBus) {
      this._unsubscribeBus();
    }
  }
});
```

---

## 🖼️ 5. Stratégie pour les Assets et Visuels

1. **Icônes et Pictogrammes** : Privilégier les SVG WXML natifs ou les icônes vectorielles.
2. **Photos de Produits & Bannières** : Héberger sur le CDN Sonatel avec URL absolue HTTPS, ou compresser côté client via `wx.compressImage` (qualité 75).
3. **Zéro Police Locale** : Ne jamais intégrer de `.ttf` ou `.woff` en local dans le mini-programme.

