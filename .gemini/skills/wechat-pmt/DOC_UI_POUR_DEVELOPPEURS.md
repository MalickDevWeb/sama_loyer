> 🔗 **Navigation :** [Guide UI (Pages & Composants)](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API (Réseau)](DOC_API_POUR_DEVELOPPEURS.md) | [Guide Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Guide Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Guide Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes Situations](DOC_RECETTES_COPIER_COLLER.md) & Flux](DOC_FLUX_COMPLEXES_ANIMATIONS.md)

---

# 🚀 Le Guide Ultra-Simple : Créer une Interface UI (Pages & Composants)

Si vous lisez ceci, vous devez créer une nouvelle Page ou un nouveau Composant visuel. 
**La règle d'or : On n'attend pas le Backend !** On construit l'interface avec de fausses données (Mock Data).

- 🔒 **Ce qui est écrit normalement** = NE TOUCHEZ PAS.
- ✏️ **Ce qui est entre `[CROCHETS]`** = REMPLACEZ-LE.

---

## 🧩 PIÈCE 1 : La Logique (`.js`)

Il y a une différence **vitale** entre une Page complète et un petit Composant (ex: un bouton, une carte). Ne mélangez jamais les deux.

### Option A : C'est une PAGE ENTIÈRE (`pages/[MA_PAGE]/index.js`)
```javascript
Page({
  data: {
    // 🔒 1. La Machine à États (State Machine)
    // Changez ce mot pour tester l'écran (loading | content | empty | error)
    uiState: 'content',
    
    // ✏️ 2. METTEZ VOS FAUSSES DONNÉES ICI (Mocks)
    [MA_VARIABLE]: {
      titre: "Exemple",
      prix: 1500
    }
  },

  // 🔒 3. Cycle de vie d'une PAGE
  onLoad(options) {
    // L'écran s'ouvre, on initialise l'affichage ici.
  },

  // ✏️ 4. Actions de la page
  [MON_ACTION_CLIC]() {
    this.setData({ uiState: 'loading' });
    // Plus tard, on appellera l'API ici.
  }
});
```

### Option B : C'est un COMPOSANT RÉUTILISABLE (`components/[MON_COMPOSANT]/index.js`)
```javascript
Component({
  // ✏️ 1. Ce que le composant reçoit de l'extérieur
  properties: {
    [MA_PROPRIETE_RECUE]: {
      type: Object,
      value: null
    }
  },

  data: {
    // Variables internes au petit composant
  },

  // 🔒 2. Cycle de vie d'un COMPOSANT (NE JAMAIS utiliser onLoad ici !)
  lifetimes: {
    attached() {
      // Le composant s'affiche à l'écran
    }
  },

  methods: {
    [MON_ACTION_CLIC]() {
      // 🔒 3. Comment un composant parle à sa page (Il crie un événement !)
      this.triggerEvent('[NOM_DE_MON_EVENEMENT]', { 
        // ✏️ Les données à envoyer à la page
        id: 123 
      });
    }
  }
});
```

---

## 🧩 PIÈCE 2 : Le Visuel (`.wxml`)

C'est ici qu'on dessine l'écran. Interdiction d'écrire du texte en dur, et interdiction de faire des calculs compliqués.

```xml
<!-- 🔒 1. Import obligatoire pour formater les prix et les dates (Ultra-Rapide) -->
<wxs src="../../utils/wxs/filters.wxs" module="filters" />

<!-- 🔒 2. GESTION DES ÉTATS -->
<view wx:if="{{uiState === 'loading'}}" class="skeleton animate-pulse" />

<view wx:elif="{{uiState === 'content'}}" class="container animate-fade-in">
  
  <!-- ✏️ 3. Zéro texte en dur ! On utilise les traductions (i18n) -->
  <text class="titre">{{ i18n.t('[MA.CLE.TRADUCTION]') }}</text>

  <!-- 🔒 4. On utilise WXS pour formater les données -->
  <text class="prix">{{ filters.formatPrice([MA_VARIABLE].prix) }}</text>

</view>

<view wx:elif="{{uiState === 'empty'}}">
  <text>{{ i18n.t('commun.vide') }}</text>
</view>
```

---

## 🧩 PIÈCE 3 : Le Style (`.wxss`)

Dans WeChat, l'écran des téléphones a souvent une "encoche" en haut, ou une barre de balayage en bas (iPhone). Il faut s'en protéger !

```css
/* ✏️ Ma classe normale (Format BEM) */
.mon-bloc__titre {
  font-size: 16px;
  color: #333;
}

/* 🔒 PROTECTION : Ne jamais cacher les boutons sous la barre de l'iPhone ! */
.ma-barre-fixe-en-bas {
  position: fixed;
  bottom: 0;
  padding-bottom: env(safe-area-inset-bottom); /* 🔒 MAGIQUE : Ajoute l'espace de sécurité */
}
```

---

## 💡 Résumé des 3 questions à se poser (Anti-Bug) :
1. **Ai-je mis du texte en dur dans le HTML ?** (Si oui, remplacez-le par `i18n.t()`).
2. **Ai-je bien utilisé `lifetimes: { attached() }` pour mon composant ?** (Si vous avez mis `onLoad`, ça va crasher !).
3. **Ai-je utilisé `uiState` au lieu de multiplier les booléens (`isLoading`, `isEmpty`) ?**
