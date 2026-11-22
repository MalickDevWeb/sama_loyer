> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📱 Guide Complet : Responsive iPhone Réel, Safe Areas & Custom TabBar WeChat

> **Origine & Éprouvé en Production :** Développé et affiné lors de la validation sur iPhone réel de l'application ATS (`mp-ats-app`). Ce guide résout définitivement les coupures de contenu, les décalages de safe area, les chevauchements de footer et le scintillement des onglets.

---

## ⚠️ Pourquoi le Simulateur WeChat "Ment" sur iPhone Réel

Dans l'émulateur WeChat DevTools, les écrans sont souvent parfaits. Une fois le code déployé sur un **iPhone physique (avec encoche ou Dynamic Island)**, plusieurs bugs critiques apparaissent :

1. **Le Home Indicator (barre virtuelle iOS) coupe les boutons en bas** : Si un bouton `position: fixed; bottom: 0;` ne gère pas la safe area, il est recouvert par la barre système ou impossible à presser.
2. **`100vh` + `overflow: hidden` = Contenu tronqué** : Sur iOS, la hauteur utile réelle n'est pas égale à `100vh`. Le statut bar en haut et la barre virtuelle en bas rognent l'espace.
3. **Les arrondis `rpx` créent des gaps de 1 pixel** : Les valeurs fractionnaires (ex: `31.98rpx`, `559.98rpx`) ou les calculs de flexbox rigides créent des lignes blanches disgracieuses dues aux arrondis de sous-pixels sur les écrans Retina (@2x / @3x).
4. **Nesting SCSS invalide dans les `.wxss`** : WeChat WXSS ne supporte PAS la syntaxe SCSS imbriquée nativement sans préprocesseur. Écrire `.parent { .child { ... } }` échoue silencieusement ou casse les règles suivantes.

---

## 📐 Règle N°1 : La Safe Area en Bas (Bottom Safe Area)

Tous les composants fixés en bas d'écran (Footer, Bouton "Payer", Floating Action Button, Bottom Sheet) **DOIVENT** réserver la zone sécurisée :

```wxss
/* ✅ LA RÈGLE D'OR POUR TOUT ÉLÉMENT FIXÉ EN BAS */
.sticky-footer {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #FFFFFF;
  padding: 24rpx 32rpx;
  
  /* Safe Area obligatoire pour iPhone avec Home Indicator */
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  z-index: 100;
}

/* Le conteneur scrollable de la page doit avoir un padding-bottom équivalent */
.page-scroll-container {
  padding-bottom: calc(140rpx + env(safe-area-inset-bottom));
}
```

---

## 📏 Règle N°2 : Bannir `height: 100vh` au profit de `min-height`

Pour éviter que le bas des formulaires ou des cartes ne soit coupé sans possibilité de scroller :

```wxss
/* ❌ DANGEREUX : Bloque le scroll si l'écran est petit ou sur iPhone */
.page-container {
  height: 100vh;
  overflow: hidden;
}

/* ✅ RECOMMANDÉ : Hauteur minimale avec scroll fluide */
.page-container {
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}
```

---

## 🎯 Règle N°3 : Barre de Navigation Custom & Capsule WeChat

Pour créer un header personnalisé qui s'aligne **au pixel près** avec les 3 petits points natifs (capsule) de WeChat sur tous les modèles d'iPhone et d'Android :

### Le Helper de Calcul (`utils/helpers/system-info.js`)

```javascript
/**
 * Calcule la géométrie exacte de l'en-tête selon l'appareil
 */
export function getNavBarGeometry() {
  const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync();
  const statusBarHeight = windowInfo.statusBarHeight || 20;
  
  // Récupérer la boîte de la capsule native WeChat
  const menuButton = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null;

  if (menuButton && menuButton.top > 0) {
    // La barre de titre est alignée sur la capsule
    const navBarHeight = (menuButton.top - statusBarHeight) * 2 + menuButton.height;
    return {
      statusBarHeight,
      navBarHeight,
      totalHeaderHeight: statusBarHeight + navBarHeight,
      capsuleRightMargin: windowInfo.windowWidth - menuButton.right,
      capsuleWidth: menuButton.width
    };
  }

  // Fallback si capsule inaccessible (ex: certains simulateurs)
  return {
    statusBarHeight,
    navBarHeight: 44,
    totalHeaderHeight: statusBarHeight + 44,
    capsuleRightMargin: 16,
    capsuleWidth: 87
  };
}
```

### Le Composant Navbar (`components/custom-nav-bar/`)

**`custom-nav-bar.wxml`**
```xml
<view class="nav-bar-wrapper" style="height: {{ totalHeaderHeight }}px; padding-top: {{ statusBarHeight }}px;">
  <view class="nav-bar-content" style="height: {{ navBarHeight }}px;">
    <!-- Bouton Retour -->
    <view wx:if="{{ showBack }}" class="nav-back-btn" bindtap="handleBack">
      <text class="icon-back">‹</text>
    </view>
    
    <!-- Titre Centré -->
    <view class="nav-title">
      <text>{{ title }}</text>
    </view>
  </view>
</view>

<!-- Espace réservé pour éviter que le contenu ne passe sous le header fixe -->
<view class="nav-bar-placeholder" style="height: {{ totalHeaderHeight }}px;"></view>
```

---

## 🗂️ Architecture Officielle : Custom TabBar WeChat Sans Scintillement

Pour remplacer la barre d'onglets standard par un design sur mesure sans subir le clignotement ou la désynchronisation de l'onglet actif.

### 1. Déclaration dans `app.json`

```json
{
  "tabBar": {
    "custom": true,
    "color": "#9E9E9E",
    "selectedColor": "#FF7900",
    "list": [
      { "pagePath": "pages/home/home", "text": "Accueil" },
      { "pagePath": "pages/explorer/explorer", "text": "Explorer" },
      { "pagePath": "pages/favoris/favoris", "text": "Favoris" },
      { "pagePath": "pages/voyage/voyage", "text": "Voyages" }
    ]
  }
}
```

---

### 2. Le Dossier Racine `custom-tab-bar/` (Obligatoire WeChat)

WeChat impose que ce dossier soit à la racine du projet.

**`custom-tab-bar/index.json`**
```json
{
  "component": true
}
```

**`custom-tab-bar/index.wxml`**
```xml
<view class="tab-bar">
  <view class="tab-bar-border"></view>
  <view 
    wx:for="{{ list }}" 
    wx:key="pagePath" 
    class="tab-bar-item {{ selected === index ? 'active' : '' }}" 
    data-path="{{ item.pagePath }}" 
    data-index="{{ index }}" 
    bindtap="switchTab"
  >
    <!-- Badge facultatif -->
    <view wx:if="{{ item.badge > 0 }}" class="tab-badge">{{ item.badge }}</view>
    
    <image class="tab-icon" src="{{ selected === index ? item.selectedIconPath : item.iconPath }}"></image>
    <text class="tab-text">{{ item.text }}</text>
  </view>
</view>
```

**`custom-tab-bar/index.wxss`**
```wxss
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 98rpx;
  background: #FFFFFF;
  display: flex;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.05);
  
  /* 🛡️ Safe area iPhone indispensable */
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 999;
}

.tab-bar-item {
  flex: 1;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: relative;
}

.tab-icon {
  width: 48rpx;
  height: 48rpx;
}

.tab-text {
  font-size: 20rpx;
  color: #757575;
  margin-top: 4rpx;
}

.tab-bar-item.active .tab-text {
  color: #FF7900;
  font-weight: bold;
}

.tab-badge {
  position: absolute;
  top: 6rpx;
  right: 32rpx;
  background-color: #E60000;
  color: #FFFFFF;
  font-size: 18rpx;
  min-width: 28rpx;
  height: 28rpx;
  border-radius: 14rpx;
  padding: 0 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**`custom-tab-bar/index.js`**
```javascript
Component({
  data: {
    selected: 0,
    list: [
      {
        pagePath: '/pages/home/home',
        text: 'Accueil',
        iconPath: '/assets/icons/tab-home.png',
        selectedIconPath: '/assets/icons/tab-home-active.png'
      },
      {
        pagePath: '/pages/explorer/explorer',
        text: 'Explorer',
        iconPath: '/assets/icons/tab-explore.png',
        selectedIconPath: '/assets/icons/tab-explore-active.png'
      },
      {
        pagePath: '/pages/favoris/favoris',
        text: 'Favoris',
        iconPath: '/assets/icons/tab-heart.png',
        selectedIconPath: '/assets/icons/tab-heart-active.png'
      },
      {
        pagePath: '/pages/voyage/voyage',
        text: 'Voyages',
        iconPath: '/assets/icons/tab-ticket.png',
        selectedIconPath: '/assets/icons/tab-ticket-active.png',
        badge: 0
      }
    ]
  },

  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset;
      
      // Navigation native requise par WeChat pour les onglets
      wx.switchTab({ url: path });
    },

    setBadge(index, count) {
      this.setData({
        [`list[${index}].badge`]: count
      });
    }
  }
});
```

---

### 3. La Synchronisation dans Chaque Page TabBar (Clé Anti-Scintillement)

⚠️ **Le Piège WeChat :** À chaque `switchTab`, le composant de barre d'onglet peut être réinstancié ou perdre l'index sélectionné.
✅ **La Solution Officielle :** Toujours mettre à jour l'index sélectionné dans le cycle de vie `onShow` de la page courante via `this.getTabBar()`.

**`pages/home/home.js` (Exemple Onglet 0)**
```javascript
Page({
  onShow() {
    // 🔒 Synchronisation immédiate de l'onglet actif
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      });
    }
  }
});
```

**`pages/explorer/explorer.js` (Exemple Onglet 1)**
```javascript
Page({
  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      });
    }
  }
});
```

---

## 🛠️ Checklist de Finition Responsive iPhone

- [ ] Tout bloc avec `position: fixed; bottom: 0;` a `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));`.
- [ ] La page a un padding bas équivalent pour que le dernier élément de la liste ne soit pas masqué derrière le footer fixe.
- [ ] Aucun conteneur parent n'a `height: 100vh; overflow: hidden;` sans une bonne raison justifiée.
- [ ] Les hauteurs de cartes et listes utilisent `min-height` au lieu de `height` strict.
- [ ] Les valeurs fractionnaires en `rpx` (ex: `31.98rpx`) sont arrondies à des entiers (`32rpx`).
- [ ] Les pages de la barre d'onglets appellent `this.getTabBar().setData({ selected: X })` dans leur `onShow`.

