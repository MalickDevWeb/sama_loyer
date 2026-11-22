# 🟠 Orange Design System (ODS) & Tokens Pulse pour WeChat / TCMPP

Ce guide formalise l'intégration stricte des directives graphiques **Orange / Sonatel** au sein des mini-programmes WeChat et conteneurs TCMPP (Super-App **Max It**).

---

## 🎯 1. Principes Fondamentaux de l'ODS Mobile

Pour garantir une expérience parfaitement intégrée dans Max It, toute interface développée doit respecter 4 règles cardinales :
1. **Lisibilité Immédiate & Contrastes WCAG AA** : Texte noir profond (`#1A1A1A`) sur fond blanc (`#FFFFFF`) ou gris pâle (`#F6F6F6`), et Orange Sonatel (`#F16E00`) pour les actions principales.
2. **Fluidité 60 FPS** : Zéro filtre CSS lourd (`filter: blur(...)` excessif) sur des listes scrollables ; privilégier des ombres subtiles accélérées matériellement (`box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06)`).
3. **Feedback Tactile Réactif** : Remplacement systématique du pseudo-sélecteur `:active` web par `hover-class="ods-btn--pressed"` (`transform: scale(0.98); opacity: 0.9;`).
4. **Respect des Marges Physiques** : Espacement régulier basé sur la grille 4rpx / 8rpx et respect des Safe Areas iPhone.

---

## 🎨 2. Palette Chromatique Officielle Orange / Sonatel

### 2.1 Couleurs de Marque (Brand Tokens)

| Token CSS | Code HEX | Usage & Destination |
|---|---|---|
| `--ods-color-brand-primary` | `#F16E00` | Orange officiel Sonatel 500 : Boutons CTA principaux, onglets actifs, badges forts. |
| `--ods-color-brand-vibrant` | `#FF7900` | Orange digital vif : Dégradés subtils, micro-accents graphiques. |
| `--ods-color-brand-light` | `#FFF3E8` | Teinte orange douce (Orange 50) : Arrière-plans de sélection, cartes actives. |
| `--ods-color-brand-pressed` | `#D96300` | Orange foncé (Orange 600) : État pressé au tap du bouton principal. |

### 2.2 Nuances Neutres (Grayscale Tokens)

| Token CSS | Code HEX | Usage & Destination |
|---|---|---|
| `--ods-color-black` | `#000000` | Noir pur : Boutons secondaires outline, titres majeurs H1, logos. |
| `--ods-color-text-main` | `#1A1A1A` | Anthracite profond (Gris 900) : Corps de texte, montants financiers, intitulés. |
| `--ods-color-text-muted` | `#666666` | Gris moyen (Gris 600) : Sous-titres, labels secondaires, métadonnées. |
| `--ods-color-text-hint` | `#999999` | Gris clair (Gris 400) : Placeholders de formulaires, textes désactivés. |
| `--ods-color-border` | `#EEEEEE` | Gris séparateur (Gris 200) : Bordures de cartes, dividers de listes. |
| `--ods-color-bg-page` | `#F6F6F6` | Fond d'écran global Max It (Gris 100) : Arrière-plan de la balise `page`. |
| `--ods-color-bg-card` | `#FFFFFF` | Blanc pur : Surfaces des cartes de contenu, fiches et modales. |

### 2.3 Couleurs Sémantiques & États (Functional Tokens)

| État | Couleur Principale | Fond Doux (Badge) | Usage |
|---|---|---|---|
| **Succès** | `#32C832` / `#2B8F2B` | `#EBF9EB` | Transaction validée, solde positif, confirmation. |
| **Alerte** | `#FFCC00` / `#997A00` | `#FFF9E6` | En attente de validation, vérification requise. |
| **Danger / Erreur** | `#CD3C14` / `#D50000` | `#FBECE8` | Échec de paiement, rejet, annulation irréversible. |
| **Info** | `#527EDB` / `#3B5998` | `#EEF2FB` | Notification informative, conditions générales. |

---

## 🔤 3. Échelle Typographique & Font-Stack

### 3.1 Font-Stack Officielle
Dans les WXSS WeChat, n'utilisez jamais de police locale `.ttf`. Utilisez la chaîne de polices système native :
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
```

### 3.2 Échelle des Tailles (en rpx)

```css
/* Titre de niveau 1 (Montants majeurs, en-têtes d'écran) */
.ods-text-h1 {
  font-size: 44rpx;
  line-height: 52rpx;
  font-weight: 700;
  color: #1A1A1A;
}

/* Titre de niveau 2 (Titres de cartes, modales) */
.ods-text-h2 {
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 700;
  color: #1A1A1A;
}

/* Titre de niveau 3 (En-têtes de sections) */
.ods-text-h3 {
  font-size: 30rpx;
  line-height: 38rpx;
  font-weight: 600;
  color: #1A1A1A;
}

/* Corps de texte standard */
.ods-text-body {
  font-size: 28rpx;
  line-height: 38rpx;
  font-weight: 400;
  color: #1A1A1A;
}

/* Légendes & Labels d'inputs */
.ods-text-caption {
  font-size: 24rpx;
  line-height: 32rpx;
  font-weight: 400;
  color: #666666;
}

/* Pastilles & Badges compacts */
.ods-text-micro {
  font-size: 20rpx;
  line-height: 26rpx;
  font-weight: 500;
}
```

---

## 📐 4. Grille d'Espacements, Rayons & Ombres

### 4.1 Grille d'Espacements (Spacing Tokens)
- `ods-space-1` : `4rpx` (Micro-espace interne d'icône)
- `ods-space-2` : `8rpx` (Gap entre badge et libellé)
- `ods-space-3` : `12rpx` (Padding compact de tag)
- `ods-space-4` : `16rpx` (Espacement standard de grille)
- `ods-space-6` : `24rpx` (Marge interne de carte compacte)
- `ods-space-8` : `32rpx` (Marge latérale standard d'écran WeChat)
- `ods-space-12` : `48rpx` (Séparation entre grands blocs fonctionnels)

### 4.2 Rayons de Courbure (Border Radius Tokens)
- `--ods-radius-sm` : `8rpx` (Petits sélecteurs, champs de formulaire)
- `--ods-radius-md` : `16rpx` (Cartes standard, fiches produits)
- `--ods-radius-lg` : `24rpx` (Grandes cartes flottantes, bottom-sheets)
- `--ods-radius-full` : `9999rpx` (Boutons pilules, pastilles, badges solde)

### 4.3 Ombres Rapides (GPU Performance)
```css
/* Ombre subtile de carte standard */
--ods-shadow-card: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);

/* Ombre d'accentuation Orange Sonatel pour bouton CTA flottant */
--ods-shadow-primary: 0 8rpx 24rpx rgba(241, 110, 0, 0.28);
```

---

## 🔘 5. Boutons Standards ODS Sonatel

### 5.1 Bouton Primaire Orange (`.ods-btn--primary`)
```html
<button class="ods-btn ods-btn--primary" hover-class="ods-btn--pressed" bindtap="onSubmit">
  Confirmer et Payer
</button>
```

```css
.ods-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
  padding: 0 48rpx;
  font-size: 32rpx;
  font-weight: 700;
  border-radius: 9999rpx;
  border: none;
  box-sizing: border-box;
}

.ods-btn--primary {
  background-color: #F16E00;
  color: #FFFFFF;
  box-shadow: 0 8rpx 24rpx rgba(241, 110, 0, 0.28);
}

.ods-btn--pressed {
  transform: scale(0.98);
  background-color: #D96300;
  opacity: 0.92;
}
```

### 5.2 Bouton Secondaire Noir (`.ods-btn--secondary`)
```css
.ods-btn--secondary {
  background-color: #FFFFFF;
  color: #000000;
  border: 2rpx solid #000000;
}

.ods-btn--secondary.ods-btn--pressed {
  background-color: #F6F6F6;
  opacity: 0.9;
}
```

---

## 💳 6. Le Composant Signature Sonatel : La Pilule de Solde Orange Money

Dans l'application Max It et les mini-programmes affiliés, l'affichage du solde respecte scrupuleusement la confidentialité de l'utilisateur :
- **Masquage / Démasquage en un clic** : Bascule entre `•••••• FCFA` et `45 250 FCFA`.
- **Mise en valeur ODS** : Fond blanc avec bordure subtile ou fond orange brand.
- **Icône Oeil Native Inline (SVG WXML)** : Zéro chargement d'image distante pour une réactivité instantanée.
- **Bouton Rafraîchir** : Émet un événement sans recharger toute la page.

*(Retrouvez le code prêt à l'emploi dans [DOC_RECETTES_COPIER_COLLER.md](DOC_RECETTES_COPIER_COLLER.md#recette-48--composant-signature-solde-orange-money-ods-sonatel-avec-masquage--tokens-pulse)).*

---

## 📋 7. Feuille de Variables Globales (`app.wxss`)

Pour appliquer instantanément le Design System à tout le mini-programme, intégrez ces variables dans `app.wxss` :

```css
page {
  /* Palette de Marque */
  --ods-orange-primary: #F16E00;
  --ods-orange-vibrant: #FF7900;
  --ods-orange-light: #FFF3E8;
  --ods-orange-pressed: #D96300;

  /* Neutres */
  --ods-black: #000000;
  --ods-text-main: #1A1A1A;
  --ods-text-muted: #666666;
  --ods-text-hint: #999999;
  --ods-border: #EEEEEE;
  --ods-bg-page: #F6F6F6;
  --ods-bg-card: #FFFFFF;

  /* Sémantiques */
  --ods-success: #32C832;
  --ods-warning: #FFCC00;
  --ods-danger: #CD3C14;
  --ods-info: #527EDB;

  /* Rayons */
  --ods-radius-sm: 8rpx;
  --ods-radius-md: 16rpx;
  --ods-radius-lg: 24rpx;
  --ods-radius-pill: 9999rpx;

  /* Configuration par défaut de l'écran */
  background-color: var(--ods-bg-page);
  color: var(--ods-text-main);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  box-sizing: border-box;
}
```

