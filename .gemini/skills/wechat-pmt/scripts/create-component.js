#!/usr/bin/env node

/**
 * ⚡ CREATE-COMPONENT — WeChat PMT
 * Générateur de composant conforme aux standards de production WeChat Mini-Program.
 * 
 * Usage :
 *   node create-component.js <chemin-composant> [--ux]
 * 
 * Exemples :
 *   node create-component.js components/ui/product-card
 *   node create-component.js components/ux/order-skeleton --ux
 *   node create-component.js pages/home/components/hero-banner
 */

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const componentTarget = args.find(a => !a.startsWith('--'));
const isUx = args.includes('--ux');

if (!componentTarget) {
  console.log('Usage: node create-component.js <dossier-cible> [--ux]');
  console.log('Exemples:');
  console.log('  node create-component.js components/ui/user-badge');
  console.log('  node create-component.js components/ux/skeleton-card --ux');
  process.exit(1);
}

const targetDir = path.resolve(process.cwd(), componentTarget);
const componentName = path.basename(targetDir);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// -----------------------------------------------------------------------------
// 1. INDEX.JSON
// -----------------------------------------------------------------------------
const jsonContent = {
  component: true,
  usingComponents: {}
};

// -----------------------------------------------------------------------------
// 2. INDEX.JS
// -----------------------------------------------------------------------------
const jsContent = isUx ? `// ============================================================================
// ${componentName.toUpperCase()} — Composant UX / Attente (Shimmer / Fallback)
// Règles : Isolation stricte dans components/ux/, zéro logique métier
// ============================================================================

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    loading: {
      type: Boolean,
      value: true,
    },
    count: {
      type: Number,
      value: 3,
    },
    isEmpty: {
      type: Boolean,
      value: false,
    },
    emptyMessage: {
      type: String,
      value: 'Aucune donnée disponible',
    },
  },

  lifetimes: {
    attached() {},
    detached() {},
  },

  methods: {
    handleRetry() {
      this.triggerEvent('retry');
    },
  },
});
` : `// ============================================================================
// ${componentName.toUpperCase()} — Composant UI Réutilisable WeChat PMT
// Standards : Lifetimes strictes (JAMAIS onLoad), triggerEvent natif, addGlobalClass
// ============================================================================

Component({
  options: {
    addGlobalClass: true,
  },

  properties: {
    title: {
      type: String,
      value: '',
    },
    subtitle: {
      type: String,
      value: '',
    },
    disabled: {
      type: Boolean,
      value: false,
    },
  },

  data: {
    // État interne purement local au composant
  },

  lifetimes: {
    attached() {
      // Initialisation locale (jamais d'onLoad dans un Component)
    },
    detached() {
      // Nettoyage impératif
    },
  },

  methods: {
    /**
     * Communication avec le parent : TOUJOURS via this.triggerEvent
     * INTERDIT : Bus.emit pour des composants proches
     */
    handleAction(e) {
      if (this.data.disabled) return;
      this.triggerEvent('action', {
        title: this.data.title,
      });
    },
  },
});
`;

// -----------------------------------------------------------------------------
// 3. INDEX.WXML
// -----------------------------------------------------------------------------
const wxmlContent = isUx ? `<!-- Composant UX Skeleton / Attente -->
<view class="ux-container">
  <!-- Skeletons Shimmer Wave -->
  <block wx:if="{{ loading }}">
    <view class="skeleton-list">
      <view
        wx:for="{{ [1, 2, 3] }}"
        wx:key="*this"
        class="skeleton-item shimmer"
      >
        <view class="skeleton-avatar" />
        <view class="skeleton-content">
          <view class="skeleton-line skeleton-line--short" />
          <view class="skeleton-line skeleton-line--full" />
        </view>
      </view>
    </view>
  </block>

  <!-- Empty State Fallback -->
  <block wx:elif="{{ isEmpty }}">
    <view class="empty-state">
      <text class="empty-state__text">{{ emptyMessage }}</text>
      <slot name="empty-action" />
    </view>
  </block>

  <!-- Contenu Réel projeté -->
  <block wx:else>
    <slot />
  </block>
</view>
` : `<!-- Composant UI : ${componentName} -->
<view
  class="c-${componentName} {{ disabled ? 'c-${componentName}--disabled' : '' }}"
  hover-class="{{ disabled ? '' : 'btn--pressed' }}"
  hover-start-time="20"
  hover-stay-time="100"
  bindtap="handleAction"
>
  <view class="c-${componentName}__body">
    <view wx:if="{{ title }}" class="c-${componentName}__title">
      {{ title }}
    </view>
    <view wx:if="{{ subtitle }}" class="c-${componentName}__subtitle">
      {{ subtitle }}
    </view>
    <slot />
  </view>
</view>
`;

// -----------------------------------------------------------------------------
// 4. INDEX.WXSS
// -----------------------------------------------------------------------------
const wxssContent = isUx ? `/* ==========================================================================
   ${componentName.toUpperCase()} — Styles UX (Shimmer & Empty State)
   ========================================================================== */

.ux-container {
  width: 100%;
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  padding: 16rpx 0;
}

.skeleton-item {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 24rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
}

.skeleton-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #E5E7EB;
  flex-shrink: 0;
}

.skeleton-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.skeleton-line {
  height: 24rpx;
  border-radius: 6rpx;
  background: #E5E7EB;
}

.skeleton-line--short {
  width: 40%;
}

.skeleton-line--full {
  width: 80%;
}

/* Animation Shimmer Wave 60 FPS */
.shimmer {
  background: linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%);
  background-size: 200% 100%;
  animation: shimmerWave 1.6s infinite ease-in-out;
}

@keyframes shimmerWave {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 32rpx;
  text-align: center;
}

.empty-state__text {
  font-size: 28rpx;
  color: #9CA3AF;
}
` : `/* ==========================================================================
   ${componentName.toUpperCase()} — Styles Scoped BEM & Touch Feedback
   ========================================================================== */

.c-${componentName} {
  display: flex;
  flex-direction: column;
  padding: 24rpx 32rpx;
  background: #FFFFFF;
  border-radius: 20rpx;
  border: 1rpx solid #E5E7EB;
  transition: transform 100ms ease, opacity 100ms ease;
}

.c-${componentName}--disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* Feedback tactile Apple Press */
.btn--pressed {
  transform: scale(0.97);
  opacity: 0.88;
}

.c-${componentName}__body {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.c-${componentName}__title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
}

.c-${componentName}__subtitle {
  font-size: 24rpx;
  color: #6B7280;
}
`;

// Écriture stricte en UTF-8 sans BOM
const utf8NoBom = [jsonContent, jsContent, wxmlContent, wxssContent];
const fileNames = ['index.json', 'index.js', 'index.wxml', 'index.wxss'];

fileNames.forEach((name, i) => {
  const filePath = path.join(targetDir, name);
  const data = typeof utf8NoBom[i] === 'object' ? JSON.stringify(utf8NoBom[i], null, 2) : utf8NoBom[i];
  fs.writeFileSync(filePath, data, { encoding: 'utf8' });
  console.log(`  ✅ Créé : ${path.relative(process.cwd(), filePath)}`);
});

console.log(`\n🎉 Composant [${componentName}] créé avec succès (${isUx ? 'Mode UX / Skeleton' : 'Mode UI Présentation'}) !`);
console.log(`👉 Déclarez-le dans le index.json de la page parente sous "usingComponents".`);

