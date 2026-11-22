> 🔗 **Navigation :** [Guide UI (Pages & Composants)](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API (Réseau)](DOC_API_POUR_DEVELOPPEURS.md) | [Guide Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Guide Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Guide Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes Situations](DOC_RECETTES_COPIER_COLLER.md) & Flux](DOC_FLUX_COMPLEXES_ANIMATIONS.md)

---

# 🚀 Le Guide Ultime : Flux Complexes & Animations (Zéro Stress)

Ce document est votre bibliothèque de composants complexes. Quand le design demande un parcours sur plusieurs écrans (Réservation, Inscription) ou des animations fluides, **copiez-collez ces modèles**. 

Le secret de ce guide est la **State Machine (Machine à États)**. On ne code pas au hasard, on change juste un mot dans le `data` pour afficher l'écran qu'on veut.

---

## 🏗️ MODÈLE 1 : Le Wizard Multi-Étapes (Ex: Parcours de Paiement)
*Le but : Passer d'un écran à l'autre de manière fluide, sans créer 4 pages différentes.*

### 1. Le JavaScript (`.js`)
```javascript
Page({
  data: {
    // 💡 LE MOTEUR : Changez ce mot pour tester n'importe quelle étape sans stress
    // Valeurs possibles : 'etape1_choix', 'etape2_formulaire', 'etape3_succes'
    uiState: 'etape1_choix', 
    
    // ✏️ Vos données Mock
    mockData: {}
  },

  // ✏️ Actions pour changer de page
  goEtape2() { this.setData({ uiState: 'etape2_formulaire' }); },
  goSucces() { this.setData({ uiState: 'etape3_succes' }); }
});
```

### 2. La Vue (`.wxml`)
```xml
<view class="wizard-container">
  
  <!-- 🔒 SCÈNE 1 (Apparition Fondu) -->
  <view wx:if="{{uiState === 'etape1_choix'}}" class="scene animate-fade-in">
    <!-- ⚠️ Attention : Toujours utiliser i18n, zéro texte en dur ! -->
    <text>{{ i18n.t('wizard.etape1_titre') }}</text>
    <button bindtap="goEtape2">{{ i18n.t('commun.continuer') }}</button>
  </view>

  <!-- 🔒 SCÈNE 2 (Glissement depuis la droite) -->
  <view wx:elif="{{uiState === 'etape2_formulaire'}}" class="scene animate-slide-left">
    <text>{{ i18n.t('wizard.etape2_titre') }}</text>
    <button bindtap="goSucces">{{ i18n.t('commun.payer') }}</button>
  </view>

  <!-- 🔒 SCÈNE 3 (Victoire avec rebond) -->
  <view wx:elif="{{uiState === 'etape3_succes'}}" class="scene animate-bounce-in">
    <icon type="success" size="64" />
    <text>{{ i18n.t('wizard.succes_titre') }}</text>
  </view>

</view>
```

---

## 🏗️ MODÈLE 2 : La "Bottom Sheet" (Tiroir qui monte du bas)
*Le but : Le composant le plus utilisé sur mobile. Un menu ou des options qui glissent depuis le bas de l'écran par dessus la page.*

### 1. Le JavaScript (`.js`)
```javascript
Page({
  data: {
    isBottomSheetOpen: false // 💡 Le déclencheur
  },
  
  openTiroir() { this.setData({ isBottomSheetOpen: true }); },
  closeTiroir() { this.setData({ isBottomSheetOpen: false }); }
});
```

### 2. La Vue (`.wxml`)
```xml
<button bindtap="openTiroir">{{ i18n.t('options.ouvrir') }}</button>

<!-- 🔒 L'OVERLAY (Fond noir transparent) -->
<view 
  wx:if="{{isBottomSheetOpen}}" 
  class="overlay animate-fade-in" 
  bindtap="closeTiroir">
</view>

<!-- 🔒 LE TIROIR (Glisse depuis le bas) -->
<view 
  wx:if="{{isBottomSheetOpen}}" 
  class="bottom-sheet animate-slide-up">
  
  <!-- ✏️ Mettez votre contenu ici -->
  <view class="bottom-sheet__header">{{ i18n.t('options.titre') }}</view>
  <view class="bottom-sheet__content">
    <text>{{ i18n.t('options.option1') }}</text>
    <text>{{ i18n.t('options.option2') }}</text>
  </view>

  <!-- 🔒 Espace de sécurité pour iPhone -->
  <view class="safe-area-bottom"></view>
</view>
```

---

## 🏗️ MODÈLE 3 : Le "Skeleton" (Chargement Fantôme)
*Le but : Afficher des blocs gris clignotants pendant que l'API charge, plutôt qu'un écran vide.*

### 1. Le JavaScript (`.js`)
```javascript
Page({
  data: {
    // 💡 Déclencheur : Utilisez 'loading' le temps que l'API réponde
    uiState: 'loading' 
  }
});
```

### 2. La Vue (`.wxml`)
```xml
<!-- 🔒 SI ÇA CHARGE : Affiche les blocs gris fantômes -->
<view wx:if="{{uiState === 'loading'}}" class="skeleton-container">
  <view class="skeleton-box skeleton-avatar"></view>
  <view class="skeleton-box skeleton-text"></view>
  <view class="skeleton-box skeleton-text-short"></view>
</view>

<!-- 🔒 SINON : Affiche la vraie donnée -->
<view wx:elif="{{uiState === 'content'}}" class="real-content animate-fade-in">
  <image src="{{user.avatar}}" />
  <text>{{user.name}}</text>
</view>
```

---

## 🎨 LA BIBLIOTHÈQUE MAGIQUE CSS (`.wxss`)
*Copiez ces classes dans votre `app.wxss` (global) ou dans votre composant. Elles gèrent toutes les animations de manière ultra-fluide.*

```css
/* =========================================
   1. LES CLASSES DE BASE
========================================= */
.scene { width: 100%; height: 100%; }
.overlay {
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); z-index: 900;
}
.bottom-sheet {
  position: fixed; left: 0; right: 0; bottom: 0;
  background: #fff; border-radius: 24px 24px 0 0; z-index: 999;
}
.safe-area-bottom { padding-bottom: env(safe-area-inset-bottom); }

/* =========================================
   2. LES SKELETONS (Chargement)
========================================= */
.skeleton-box {
  background: #e0e0e0; border-radius: 8px;
  animation: pulse 1.5s infinite ease-in-out;
}
.skeleton-avatar { width: 64px; height: 64px; border-radius: 50%; }
.skeleton-text { width: 100%; height: 16px; margin-top: 8px; }
.skeleton-text-short { width: 60%; height: 16px; margin-top: 8px; }

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}

/* =========================================
   3. LES ANIMATIONS HAUTE PERFORMANCE
========================================= */
/* Fondu */
.animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
@keyframes fadeIn {
  from { opacity: 0; } to { opacity: 1; }
}

/* Glissement Bas -> Haut (Courbe Apple) */
.animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Glissement Droite -> Gauche (Transition d'écran) */
.animate-slide-left { animation: slideLeft 0.3s ease-out forwards; }
@keyframes slideLeft {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

/* Rebond (Succès) */
.animate-bounce-in { animation: bounceIn 0.5s cubic-bezier(0.68, -0.55, 0.26, 1.55) forwards; }
@keyframes bounceIn {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
```


---

## 👆 MODÈLE 4 : Le Feedback Tactile au Clic (`hover-class`)

En WeChat Mini-Program, le CSS `:active` web classique est déconseillé car il interfère avec le défilement tactile (le scroll déclenche l'état actif par erreur).
WeChat fournit un mécanisme natif ultra-optimisé : **l'attribut `hover-class`**.

### 1. La Vue (`.wxml`)
```xml
<!-- Bouton avec effet de pression immédiat -->
<view 
  class="btn-primary" 
  hover-class="btn-primary--pressed" 
  hover-start-time="20" 
  hover-stay-time="100"
  bindtap="handleAction"
>
  Continuer
</view>

<!-- Carte de liste cliquable -->
<view 
  class="card-item" 
  hover-class="card-item--pressed" 
  hover-start-time="30"
  bindtap="ouvrirDetail"
>
  <text>Voir les détails</text>
</view>
```

### 2. Le Style (`.wxss`)
```css
/* Effet "Apple Press" : légère réduction d'échelle et transparence */
.btn-primary {
  transition: transform 0.12s cubic-bezier(0.2, 0, 0, 1), opacity 0.12s ease;
  will-change: transform, opacity;
}
.btn-primary--pressed {
  transform: scale(0.96);
  opacity: 0.88;
}

/* Carte avec enfoncement 3D subtil */
.card-item {
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.card-item--pressed {
  transform: scale(0.98);
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}
```

---

## 🎬 MODÈLE 5 : L'Animation d'Entrée de Page (Page Transition)

Pour donner une sensation d'application native fluide à 60/120 FPS quand une page s'ouvre :

### Dans le conteneur principal de la page (`.wxml`)
```xml
<view class="page-container page-enter">
  <!-- Contenu de la page -->
</view>
```

### Le CSS de Transition (`.wxss`)
```css
.page-enter {
  animation: pageFadeSlide 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  will-change: transform, opacity;
}

@keyframes pageFadeSlide {
  0% {
    opacity: 0;
    transform: translateY(24rpx);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Apparition en cascade (Staggered reveal) pour les cartes */
.list-item:nth-child(1) { animation: pageFadeSlide 0.35s 0.05s cubic-bezier(0.22, 1, 0.36, 1) both; }
.list-item:nth-child(2) { animation: pageFadeSlide 0.35s 0.10s cubic-bezier(0.22, 1, 0.36, 1) both; }
.list-item:nth-child(3) { animation: pageFadeSlide 0.35s 0.15s cubic-bezier(0.22, 1, 0.36, 1) both; }
.list-item:nth-child(4) { animation: pageFadeSlide 0.35s 0.20s cubic-bezier(0.22, 1, 0.36, 1) both; }
```

---

## 🏆 MODÈLE 6 : Animation Séquentielle JavaScript (`wx.createAnimation`)

*Pattern officiel éprouvé sur la page de confirmation de réservation ATS.*
Une icône de validation apparaît au centre de l'écran, grossit avec rebond, puis se déplace vers le haut ("docking") pour révéler la carte de reçu.

### Le Contrôleur (`.js`)
```javascript
function createScaleAnim(scale, opacity, duration, timing = 'ease-out') {
  const anim = wx.createAnimation({
    duration,
    timingFunction: timing,
    transformOrigin: '50% 50% 0'
  });
  anim.opacity(opacity).scale(scale).step();
  return anim.export();
}

Page({
  data: {
    introAnimation: null,
    introDocked: false,
    contentVisible: false
  },

  onShow() {
    if (this._hasAnimated) return;
    this._hasAnimated = true;
    this.lancerSequenceSucces();
  },

  lancerSequenceSucces() {
    // Étape 1 : Pop initial avec zoom (au centre)
    setTimeout(() => {
      this.setData({
        introAnimation: createScaleAnim(1.25, 1, 420, 'ease-out')
      });
    }, 50);

    // Étape 2 : Rebond d'amorti à taille réelle
    setTimeout(() => {
      this.setData({
        introAnimation: createScaleAnim(1, 1, 280, 'ease-in-out')
      });
    }, 500);

    // Étape 3 : Montée en haut de page ("Docking")
    setTimeout(() => {
      this.setData({ introDocked: true });
    }, 850);

    // Étape 4 : Révélation progressive du reçu
    setTimeout(() => {
      this.setData({ contentVisible: true });
    }, 1300);
  }
});
```

### La Vue (`.wxml`)
```xml
<!-- Badge animé -->
<view class="intro-badge {{ introDocked ? 'intro-badge--docked' : '' }}" animation="{{ introAnimation }}">
  <icon type="success" size="64" />
</view>

<!-- Contenu révélé -->
<view class="receipt-content {{ contentVisible ? 'animate-fade-in' : 'hidden' }}">
  <text>Votre réservation est confirmée !</text>
</view>
```

### Le Style (`.wxss`)
```css
.intro-badge {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: top 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 560ms cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 50;
  will-change: top, transform;
}

.intro-badge--docked {
  top: 140rpx;
  transform: translate(-50%, 0) scale(0.7);
}

.hidden { display: none; }
```

---

## ❤️ MODÈLE 7 : Micro-Interaction Cœur / Like (Heart Burst)

L'effet de pulsation quand l'utilisateur met en favori :

```css
.btn-heart {
  display: inline-block;
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-heart--liked {
  animation: heartPulse 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  color: #E60000;
}

@keyframes heartPulse {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.35); }
  100% { transform: scale(1); }
}
```
