# 🌙 Guide Dark Mode & Accessibilité (Standard WeChat & TCMPP)

> **Référentiel officiel pour le support du mode sombre et des contrastes iOS / Android**  
> Ce document définit la configuration native `theme.json`, les variables CSS adaptatives et les règles d'accessibilité (WCAG AA).

---

## 🎯 Déclencheur IA : `@DARK-MODE`

Lorsque vous utilisez le déclencheur **`@DARK-MODE`**, l'IA :
1. N'utilise **aucune couleur en dur** (`#fff`, `#000`) dans les fichiers WXSS.
2. Utilise les variables CSS adaptatives (`var(--bg-primary)`, `var(--text-main)`).
3. Adapte les contrastes de la marque Orange (`#F16E00`) pour garantir la lisibilité sur fond sombre.
4. Configure la barre de navigation et le tab bar pour suivre le thème système du téléphone.

---

## ⚙️ 1. Configuration Native WeChat (`app.json` & `theme.json`)

### Dans `app.json`
Pour activer le Dark Mode natif sous WeChat, déclarer :
```json
{
  "darkmode": true,
  "themeLocation": "theme.json",
  "window": {
    "navigationBarBackgroundColor": "@navBg",
    "navigationBarTextStyle": "@navText",
    "backgroundColor": "@pageBg",
    "backgroundTextStyle": "@bgText"
  }
}
```

### Fichier `theme.json` (à la racine)
```json
{
  "light": {
    "navBg": "#FFFFFF",
    "navText": "black",
    "pageBg": "#F8F9FA",
    "bgText": "dark"
  },
  "dark": {
    "navBg": "#1A1A1A",
    "navText": "white",
    "pageBg": "#121212",
    "bgText": "light"
  }
}
```

---

## 🎨 2. Palette de Variables CSS (`app.wxss`)

Toutes les couleurs doivent être déclarées via des tokens sémantiques réactifs au mode sombre :

```css
/* ==========================================================================
   THEME VARIABLES : LIGHT (DÉFAUT)
   ========================================================================== */
page {
  /* Surfaces & Fonds */
  --bg-page: #F8F9FA;
  --bg-surface: #FFFFFF;
  --bg-card: #FFFFFF;
  --bg-elevated: #F3F4F6;
  --bg-overlay: rgba(0, 0, 0, 0.5);

  /* Textes & Contenus */
  --text-main: #111827;
  --text-secondary: #4B5563;
  --text-muted: #9CA3AF;
  --text-inverse: #FFFFFF;

  /* Bordures & Séparateurs */
  --border-subtle: #E5E7EB;
  --border-strong: #D1D5DB;

  /* Couleurs de Marque (Orange / Vert Sonatel) */
  --color-primary: #F16E00;
  --color-primary-hover: #D86300;
  --color-success: #01953E;
  --color-danger: #DC2626;

  /* Skeletons Shimmer */
  --shimmer-base: #E5E7EB;
  --shimmer-highlight: #F3F4F6;
}

/* ==========================================================================
   THEME VARIABLES : DARK (SYSTÈME ACTIF)
   ========================================================================== */
@media (prefers-color-scheme: dark) {
  page {
    /* Surfaces sombres (OLED Safe) */
    --bg-page: #121212;
    --bg-surface: #1E1E1E;
    --bg-card: #242424;
    --bg-elevated: #2D2D2D;
    --bg-overlay: rgba(0, 0, 0, 0.75);

    /* Textes adaptés pour faible luminance */
    --text-main: #F9FAFB;
    --text-secondary: #D1D5DB;
    --text-muted: #6B7280;
    --text-inverse: #111827;

    /* Bordures plus discrètes */
    --border-subtle: #374151;
    --border-strong: #4B5563;

    /* Marque ajustée (légèrement adoucie pour éviter l'éblouissement) */
    --color-primary: #FF7900;
    --color-primary-hover: #FFA043;
    --color-success: #05B34C;
    --color-danger: #EF4444;

    /* Skeletons foncés */
    --shimmer-base: #2D2D2D;
    --shimmer-highlight: #3D3D3D;
  }
}
```

---

## 📱 3. Application dans les Composants & Pages

### ❌ Mauvaise Pratique (Couleurs en dur) :
```css
/* ❌ Proscrit : illisible en mode sombre */
.reservation-card {
  background: #FFFFFF;
  color: #111827;
  border: 1rpx solid #E5E7EB;
}
```

### ✅ Bonne Pratique (Variables Sémantiques) :
```css
/* ✅ Parfait : s'adapte automatiquement sans rechargement de page */
.reservation-card {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1rpx solid var(--border-subtle);
  border-radius: 24rpx;
}
.reservation-card__subtitle {
  color: var(--text-secondary);
}
```

---

## 👁️ 4. Règles d'Accessibilité Visuelle (Normes WCAG AA)

1. **Ratio de Contraste Minimal (4.5:1)** :  
   Tout texte de taille inférieure à `36rpx` doit obligatoirement respecter un ratio de contraste de 4.5:1 par rapport à sa surface d'arrière-plan.
2. **Ne Jamais Utiliser `#000000` Pur sur de Grandes Surfaces** :  
   Le noir pur (`#000000`) crée un effet de halo (*smearing*) sur les écrans OLED des iPhone en défilement rapide. Toujours préférer `#121212` ou `#1A1A1A`.
3. **Inversion d'Icônes SVG / PNG Monochromes** :  
   Pour les icônes monochrome prévues pour fond clair :
   ```css
   @media (prefers-color-scheme: dark) {
     .app-icon--monochrome {
       filter: brightness(0) invert(1);
     }
   }
   ```
4. **Détection par Code JS (Cas Exceptionnel)** :  
   Si un composant Canvas ou dynamique a besoin de connaître le thème en cours :
   ```javascript
   const theme = wx.getSystemInfoSync().theme || 'light';
   console.log('Thème actif :', theme); // 'dark' | 'light'
   
   // Écoute des changements à chaud :
   wx.onThemeChange((res) => {
     console.log('Nouveau thème système :', res.theme);
     this.setData({ isDark: res.theme === 'dark' });
   });
   ```

---

## ♿ 5. Accessibilité Inclusive & Lecteurs d'Écran (VoiceOver / TalkBack)

Pour garantir la conformité RSE d'Orange / Sonatel et permettre aux personnes malvoyantes d'utiliser le mini-programme :

1. **Étiquetage des Boutons Icônes (`aria-label`)** : Tout élément cliquable sans texte explicite doit posséder un `aria-role="button"` et un `aria-label="Action explicite"`.
2. **Neutralisation des Décorations (`aria-hidden="true"`)** : Toute icône purement visuelle, flèche d'ornement ou séparateur doit être masqué avec `aria-hidden="true"` pour ne pas surcharger la lecture audio.
3. **Annonces Vocales Asynchrones (`wx.accessibilityAnnounce`)** : Après un paiement ou une erreur, déclencher une vocalisation explicite pour que l'utilisateur non-voyant soit immédiatement informé.
4. **Cibles Tactiles Ergonomiques Minimales** : `min-width: 88rpx; min-height: 88rpx;` (norme 44×44 points).

> 💡 **Guide complet d'implémentation :** Voir [Recette 64 : Accessibilité Inclusive & Lecteurs d'Écran](DOC_RECETTES_COPIER_COLLER.md#-recette-64--accessibilité-inclusive--lecteurs-décran-voiceover--talkback--aria-).


