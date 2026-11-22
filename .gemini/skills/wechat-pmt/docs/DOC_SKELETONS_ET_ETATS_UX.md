> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Skeletons & UX](DOC_SKELETONS_ET_ETATS_UX.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Pièges Compilateur & Prod](DOC_PIEGES_COMPILATEUR_ET_PATTERNS_PROD.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 💀 Guide Ultime : Skeletons Shimmer & Composants UX d'Attente

> **Origine & Éprouvé en Production :** Architecture de skeletons extraite de l'application ATS Explore (`mp-ats-app`, `components/ux/`).  
> Ce document définit le standard de conception des skeletons de chargement avec effet de brillance (*shimmer wave*) et des écrans d'état transitoires (*empty-state*, *error-boundary*).

---

## 💡 Pourquoi les Skeletons sont Obligatoires

Les indicateurs de chargement circulaires classiques (`wx.showLoading`) bloquent l'écran et augmentent l'anxiété de l'utilisateur.
Les **Skeletons de contenu avec effet Shimmer** :
1. **Réduisent de 40 % la perception d'attente** chez l'utilisateur.
2. **Suppriment le Cumulative Layout Shift (CLS)** : La mise en page réserve exactement l'espace nécessaire avant que les vraies images et textes n'arrivent.
3. **Donnent un aspect instantané et haut de gamme** (standard des apps modernes comme Instagram, Uber, Max It).

---

## 🏛️ Règle d'Or d'Architecture : `components/ui/` vs `components/ux/`

ATS sépare strictement la présentation des composants d'état :

```
components/
  ├── ui/                     ← Présentation pure (Boutons, Cartes réelles, Inputs)
  │     ├── destination-card/
  │     └── button/
  │
  └── ux/                     ← États d'expérience (Skeletons, Écrans vides, Erreurs)
        ├── destination-card-skeleton/
        ├── reservation-card-skeleton/
        ├── empty-state/
        └── error-boundary/
```

* **Convention de nommage :** Préfixe `app-ux-` pour les composants UX (ex : `<app-ux-destination-card-skeleton />`).

---

## ✨ La Classe Universelle Shimmer (`app.wxss`)

Pour animer tous vos skeletons avec un dégradé lumineux fluide à 60 FPS sans surcharger le processeur du mobile :

```css
/* Dégradé fluide de balayage lumineux */
.shimmer {
  background: linear-gradient(90deg, #f0f1f3 25%, #f8f9fa 38%, #f0f1f3 62%);
  background-size: 400% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  will-change: background-position;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 100% 0; }
  100% { background-position: 0 0; }
}
```

---

## 🧱 MODÈLE 1 : Le Skeleton de Carte Produit / Destination

*Copie exacte du composant éprouvé `components/ux/destination-card-skeleton`.*

### 1. La Vue (`index.wxml`)
```xml
<view class="dest-skeleton">
  <!-- Zone Image fantôme avec pastille cœur -->
  <view class="dest-skeleton__image shimmer">
    <view class="dest-skeleton__heart shimmer"></view>
  </view>
  
  <!-- Zone Contenu texte -->
  <view class="dest-skeleton__body">
    <!-- Ligne de Titre -->
    <view class="dest-skeleton__line dest-skeleton__line--title shimmer"></view>
    
    <!-- Ligne Localisation -->
    <view class="dest-skeleton__row">
      <view class="dest-skeleton__pin shimmer"></view>
      <view class="dest-skeleton__line dest-skeleton__line--subtitle shimmer"></view>
    </view>
    
    <!-- Ligne Prix et Bouton -->
    <view class="dest-skeleton__footer">
      <view class="dest-skeleton__line dest-skeleton__line--price shimmer"></view>
      <view class="dest-skeleton__btn shimmer"></view>
    </view>
  </view>
</view>
```

### 2. Le Style (`index.wxss`)
```wxss
.dest-skeleton {
  min-height: 560rpx;
  background: #FFFFFF;
  border-radius: 32rpx;
  overflow: hidden;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
}

.dest-skeleton__image {
  width: 100%;
  height: 320rpx;
  position: relative;
}

.dest-skeleton__heart {
  position: absolute;
  top: 24rpx;
  right: 24rpx;
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  background: #E5E7EB;
}

.dest-skeleton__body {
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.dest-skeleton__line {
  height: 24rpx;
  border-radius: 999rpx;
}

.dest-skeleton__line--title {
  width: 75%;
  height: 36rpx;
}

.dest-skeleton__row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.dest-skeleton__pin {
  width: 28rpx;
  height: 28rpx;
  border-radius: 50%;
}

.dest-skeleton__line--subtitle {
  width: 50%;
}

.dest-skeleton__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8rpx;
}

.dest-skeleton__line--price {
  width: 35%;
  height: 32rpx;
}

.dest-skeleton__btn {
  width: 160rpx;
  height: 60rpx;
  border-radius: 30rpx;
}
```

---

## 📜 MODÈLE 2 : Le Skeleton de Liste / Réservation

Pour une liste de billets ou commandes (`components/ux/reservation-card-skeleton`) :

```xml
<view class="res-skeleton">
  <view class="res-skeleton__header">
    <view class="res-skeleton__pill shimmer"></view>
    <view class="res-skeleton__badge shimmer"></view>
  </view>
  <view class="res-skeleton__divider"></view>
  <view class="res-skeleton__body">
    <view class="res-skeleton__line res-skeleton__line--lg shimmer"></view>
    <view class="res-skeleton__line res-skeleton__line--md shimmer"></view>
  </view>
</view>
```

```wxss
.res-skeleton {
  min-height: 220rpx;
  background: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.03);
}

.res-skeleton__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.res-skeleton__pill { width: 220rpx; height: 32rpx; border-radius: 16rpx; }
.res-skeleton__badge { width: 140rpx; height: 44rpx; border-radius: 22rpx; }
.res-skeleton__divider { height: 2rpx; background: #F3F4F6; margin: 24rpx 0; }
.res-skeleton__line--lg { width: 80%; height: 32rpx; margin-bottom: 12rpx; border-radius: 16rpx; }
.res-skeleton__line--md { width: 50%; height: 24rpx; border-radius: 12rpx; }
```

---

## 📭 MODÈLE 3 : L'Écran Vide Élégant (`app-ux-empty-state`)

Quand une recherche ne donne aucun résultat ou qu'il n'y a pas encore de favoris :

```xml
<view class="empty-state animate-fade-in">
  <image class="empty-state__icon" src="{{ icon || '/assets/icons/empty-box.png' }}" />
  <text class="empty-state__title">{{ title || 'Aucun résultat trouvé' }}</text>
  <text class="empty-state__desc" wx:if="{{ description }}">{{ description }}</text>
  <button wx:if="{{ actionText }}" class="empty-state__btn" bindtap="onAction">
    {{ actionText }}
  </button>
</view>
```

```wxss
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 40rpx;
  text-align: center;
}

.empty-state__icon {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 32rpx;
}

.empty-state__title {
  font-size: 32rpx;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 12rpx;
}

.empty-state__desc {
  font-size: 26rpx;
  color: #6B7280;
  max-width: 480rpx;
  margin-bottom: 40rpx;
}

.empty-state__btn {
  background: #FF7900;
  color: #FFFFFF;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  padding: 0 48rpx;
  height: 80rpx;
  line-height: 80rpx;
}
```

---

## 🔄 Utilisation Propre dans vos Pages (`uiState`)

```xml
<!-- 1. En cours de chargement : 3 skeletons affichés -->
<block wx:if="{{ uiState === 'loading' }}">
  <app-ux-destination-card-skeleton wx:for="{{ [1, 2, 3] }}" wx:key="*this" />
</block>

<!-- 2. Contenu prêt -->
<block wx:elif="{{ uiState === 'content' }}">
  <app-destination-card wx:for="{{ items }}" wx:key="id" destination="{{ item }}" />
</block>

<!-- 3. Aucun élément -->
<block wx:elif="{{ uiState === 'empty' }}">
  <app-ux-empty-state title="Aucun voyage disponible" actionText="Actualiser" bindaction="recharger" />
</block>

<!-- 4. Erreur réseau -->
<block wx:elif="{{ uiState === 'error' }}">
  <app-ux-error-state message="{{ errorMessage }}" bindretry="recharger" />
</block>
```

