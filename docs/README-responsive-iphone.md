# Audit Responsive iPhone Reel

Ce README documente l'analyse statique faite apres le deploiement sur iPhone reel. Le but est d'expliquer pourquoi des gaps, chevauchements, zones coupees et differences d'affichage apparaissent sur un appareil reel alors que le rendu peut sembler correct dans le simulateur.

## Resume executif

Le probleme principal ne vient pas d'un seul composant. Il vient d'une accumulation de layouts tres fixes :

- beaucoup de hauteurs et largeurs exactes en `rpx` ;
- plusieurs conteneurs en `100vh` avec `overflow: hidden` ;
- une nav bar custom fixe en haut et un tabbar custom fixe en bas ;
- des paddings bas hardcodes differents selon les pages ;
- des cards forcees a des hauteurs fixes via `cardStyle` inline ;
- des valeurs fractionnaires comme `31.98rpx`, `559.98rpx`, `0.88rpx` ;
- des styles inline et `!important` qui rendent les corrections responsives difficiles ;
- au moins un bloc WXSS invalide, ecrit comme du SCSS imbrique.

Sur un iPhone reel, les safe areas, la hauteur utile de l'ecran, la densite de pixels, le statut bar, le home indicator et les arrondis `rpx` rendent ces choix beaucoup plus visibles.

## Limite de l'audit

Cette analyse est basee sur le code du projet. Elle n'inclut pas une capture directe depuis un iPhone reel ni une session WeChat DevTools avec inspection runtime.

Les conclusions sont donc un diagnostic technique a partir des fichiers. Elles expliquent les causes les plus probables et les zones a corriger en priorite.

## Corrections appliquees

Une premiere correction globale a ete appliquee sans modifier les vues WXML. L'objectif etait de garder le meme rendu visuel, mais de rendre les layouts plus tolerants sur iPhone reel.

### Base layout

| Fichier | Correction |
|---------|------------|
| `components/ui/layout/index.wxss` | Suppression du clipping global sur `.osn-layout` et confinement du scroll dans `.osn-layout__content` |
| `components/ui/layout/index.js` | Arrondi haut plus stable pour le padding de nav bar |
| `components/ui/nav-bar/index.wxss` | Normalisation du padding bas de la nav bar a `34rpx` |
| `components/ui/tab-bar/index.wxss` | Ajustement des largeurs internes de l'onglet actif et protection des taps via `pointer-events` |

### Pages tabbar

| Fichier | Correction |
|---------|------------|
| `pages/home/home.wxss` | Remplacement de plusieurs `height` par `min-height`, arrondi des valeurs fractionnaires, padding bas calcule avec `env(safe-area-inset-bottom)` |
| `pages/explorer/explorer.wxss` | Suppression du clipping de page, padding bas compatible safe-area, valeurs arrondies |
| `pages/favoris/favoris.wxss` | Header en `width: 100%`, padding bas compatible safe-area |
| `pages/voyage/voyage.wxss` | Padding bas compatible safe-area, bottom sheet moins fragile, detail scroll ajuste |

### Pages avec footer ou overlay fixe

| Fichier | Correction |
|---------|------------|
| `pages/destination-detail/destination-detail.wxss` | Suppression du nesting WXSS invalide, contenu en `width: 100%`, hero fluide, padding bas safe-area, preview overlay ajuste |
| `pages/booking/booking.wxss` | Cards voyageurs en `min-height`, padding bas safe-area, controles contraints en largeur |
| `pages/paiement/index.wxss` | Padding bas safe-area et bouton paiement en `min-height` |
| `components/ui/paiement/index.wxss` | Ancien composant paiement rendu safe-area compatible |
| `pages/booking-confirmation/booking-confirmation.wxss` | Scroll et boutons assouplis avec `min-height`, padding bas safe-area |

### Composants partages

| Fichier | Correction |
|---------|------------|
| `app.wxss` | `h-100` converti en hauteur plus souple avec `min-height` |
| `components/ui/input/index.wxss` | Inputs en largeur fluide, champ interne en `min-width: 0` pour eviter les debordements |
| `components/ui/chip-group/index.wxss` | Hauteurs converties en `min-height`, suppression du clipping vertical |
| `components/ui/list-destination/index.wxss` | Liste/cards rendues plus souples en hauteur |
| `components/ui/destination-card/index.wxss` | Card et zones internes converties en `min-height`, valeurs fractionnaires arrondies |
| `components/ui/card/index.wxss` | Gap arrondi et box model stabilise |

### Ce qui n'a pas ete modifie

Les fichiers WXML n'ont pas ete modifies. Les props existantes comme `cardStyle`, `cardWidth`, `imageHeight`, `buttonStyle` et `containerStyle` restent en place pour conserver le rendu actuel.

Cela veut dire que certains styles inline restent presents. Ils ne bloquent plus toute la base responsive, mais ils devront etre nettoyes progressivement si on veut une architecture responsive parfaite.

## Inventaire rapide

Scan des fichiers `pages/**/*.wxss` et `components/**/*.wxss` :

| Signal detecte | Volume |
|----------------|--------|
| Regles a risque detectees | 195 occurrences |
| Fichiers les plus charges | `pages/booking/booking.wxss`, `pages/voyage/voyage.wxss`, `pages/destination-detail/destination-detail.wxss` |
| Styles inline dans WXML | tres presents sur les pages detail, voyage, home, explorer, favoris |

Top fichiers avec le plus de tailles fixes ou regles a risque :

| Fichier | Occurrences |
|---------|-------------|
| `pages/booking/booking.wxss` | 35 |
| `pages/voyage/voyage.wxss` | 34 |
| `pages/destination-detail/destination-detail.wxss` | 28 |
| `components/ui/input/index.wxss` | 14 |
| `pages/booking-confirmation/booking-confirmation.wxss` | 11 |
| `components/ui/destination-card/index.wxss` | 10 |
| `pages/home/home.wxss` | 8 |
| `components/ui/tab-bar/index.wxss` | 8 |

## Cause 1 - Le layout global bloque la hauteur

Fichier : `components/ui/layout/index.wxss`

```css
.osn-layout {
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}
```

Le layout principal force la hauteur a `100vh` et masque tout ce qui depasse. Sur iPhone reel, `100vh` ne correspond pas toujours a la zone utile visible quand on combine :

- status bar ;
- nav bar custom fixe ;
- custom tabbar fixe ;
- safe area du home indicator ;
- scroll-view interne.

Effet probable :

- contenu coupe en bas ;
- scroll-view qui semble trop court ;
- espace vide entre sections ;
- elements fixes qui recouvrent du contenu.

Le calcul du decalage haut est aussi manuel :

Fichier : `components/ui/layout/index.js`

```javascript
const navPaddingBottomPx = Math.round(33.66 * windowWidth / 750);
this.setData({ navContentOffset: statusBarHeight + 44 + navPaddingBottomPx });
```

Ce calcul depend de `windowWidth` et arrondit une valeur fractionnaire. Sur iPhone reel, un arrondi different peut creer un decalage visible.

## Cause 2 - La nav bar et le tabbar sont fixes, mais les pages ne reservent pas toutes la bonne place

Nav bar :

Fichier : `components/ui/nav-bar/index.wxss`

```css
.osn-nav-bar {
  position: fixed;
  box-sizing: content-box;
  padding-bottom: 33.66rpx;
}
```

Tabbar :

Fichier : `components/ui/tab-bar/index.wxss`

```css
.osn-tab-bar {
  position: fixed;
  bottom: 0;
  padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
}

.osn-tab-bar__tabs {
  min-height: 128rpx;
}
```

Avec un custom tabbar WeChat, le composant visuel est fixe en bas. Les pages doivent donc reserver elles-memes l'espace bas. Le projet le fait page par page avec des valeurs hardcodees, par exemple :

- Home : `padding-bottom: 192.3rpx` ;
- Explorer : `padding-bottom: 180rpx` ;
- Favoris : `padding-bottom: 151.98rpx` ;
- Detail : `padding: 32rpx 0 230rpx`.

Ces valeurs ne sont pas derivees de la hauteur reelle du tabbar. Sur un iPhone avec home indicator, la hauteur finale est :

`padding top tabbar + hauteur capsule + padding bottom + safe-area`.

Si la page reserve moins que cette hauteur, le tabbar recouvre le contenu. Si elle reserve trop, on voit un grand gap.

## Cause 3 - Beaucoup de sections sont figees en hauteur

Exemple Home :

Fichier : `pages/home/home.wxss`

```css
.greetings-container { height: 363.24rpx; }
.chip-container { height: 284.8rpx; }
.destination-list-container { height: 775.94rpx; }
```

Ces hauteurs figent la page comme une maquette. Si le texte, la police, le rendu d'image, la taille de nav bar ou la hauteur utile changent, les sections ne s'adaptent pas.

Effet probable :

- gaps trop grands entre sections ;
- contenu coupe ;
- scroll plus long que necessaire ;
- affichage different entre simulateur et iPhone reel.

## Cause 4 - Les cards de destination ont des hauteurs forcees

Composant :

Fichier : `components/ui/destination-card/index.wxss`

```css
.card-container {
  width: 479.98rpx;
  height: 579.98rpx;
}
```

Pages :

Fichier : `pages/explorer/explorer.wxml`

```xml
cardStyle="height: 559.98rpx !important; ..."
```

Fichier : `pages/favoris/favoris.wxml`

```xml
cardStyle="height: 560rpx !important; ..."
```

Le composant a deja une hauteur par defaut, puis certaines pages la remplacent avec des styles inline. Cela rend le layout fragile, surtout en grille 2 colonnes.

Sur iPhone reel, si le texte prend plus de place ou si les fonts ne rendent pas exactement pareil, le contenu interne n'a pas assez d'espace.

## Cause 5 - Des largeurs depassent la grille de 750rpx

Le design utilise beaucoup le modele `750rpx`, mais certains blocs depassent une fois les paddings ajoutes.

Exemple detail :

Fichier : `pages/destination-detail/destination-detail.wxss`

```css
.detail-content {
  padding: 40rpx 40rpx 40rpx 40rpx;
  width: 748rpx;
}
```

Sans `box-sizing: border-box`, cette zone fait `748rpx + 80rpx` de padding horizontal, donc environ `828rpx`. Elle peut creer du scroll horizontal, du clipping ou un alignement casse.

Exemple favoris :

Fichier : `pages/favoris/favoris.wxss`

```css
.favorites-page {
  padding-right: 31.98rpx;
  padding-left: 31.98rpx;
}

.favorites-page__header {
  width: 716rpx;
}
```

Le header fait `716rpx` dans un parent qui a deja environ `64rpx` de padding horizontal, soit environ `780rpx` au total. C'est plus large que la base `750rpx`.

## Cause 6 - Les valeurs fractionnaires creent des gaps reels

Le projet utilise beaucoup de valeurs comme :

- `31.98rpx` ;
- `23.98rpx` ;
- `287.98rpx` ;
- `559.98rpx` ;
- `0.88rpx` ;
- `1.66rpx`.

Sur un appareil reel, ces valeurs sont converties en pixels physiques. Selon la largeur et le DPR de l'iPhone, elles sont arrondies. Plusieurs arrondis consecutifs peuvent creer :

- lignes floues ;
- gaps de 1px ;
- elements qui ne tombent pas exactement au meme bord ;
- hauteur totale differente de celle attendue.

Les fractions viennent probablement d'une conversion Figma directe. Elles sont mauvaises pour une UI mobile responsive.

## Cause 7 - Un bloc WXSS invalide existe dans la page detail

Fichier : `pages/destination-detail/destination-detail.wxss`

```css
.destination-detail-page {
  height: 100vh;
  .destination-detail-page {
    height: 100vh;
    overflow: auto;
  }
}
```

WXSS n'est pas du SCSS. Le nesting n'est pas valide. Selon le parseur, cette partie peut etre ignoree ou produire un comportement different entre environnements.

Effet probable :

- styles non appliques ;
- difference entre simulateur et appareil ;
- scroll non fiable sur la page detail.

## Cause 8 - Trop de styles inline et `!important`

Plusieurs pages injectent des styles complexes directement dans le WXML :

- `cardStyle` ;
- `cardContainerStyle` ;
- `buttonStyle` ;
- `containerStyle` ;
- `imageStyle`.

Exemples :

- `pages/home/home.wxml` utilise `cardWidth="750rpx"` et des styles inline de card ;
- `pages/explorer/explorer.wxml` force `height: 559.98rpx !important` ;
- `pages/favoris/favoris.wxml` force `height: 560rpx !important` ;
- `pages/destination-detail/destination-detail.wxml` force plusieurs tailles d'images et boutons.

Quand un style est inline avec `!important`, il devient difficile de le corriger depuis un breakpoint, une classe responsive ou un composant parent.

## Cause 9 - Les scroll-view dependent de parents a hauteur fragile

Plusieurs pages font :

- parent en `100vh` ;
- layout en `overflow: hidden` ;
- enfant `scroll-view` en `height: 100%` ou `flex: 1`.

Exemples :

- `pages/explorer/explorer.wxss` : `.explorer-page { overflow: hidden; }` et `.explorer-page__list-scroll { height: 100%; }` ;
- `pages/destination-detail/destination-detail.wxss` : page en `height: 100vh`, scroll en `height: 100%` ;
- `pages/booking-confirmation/booking-confirmation.wxss` : scroll en `height: 100vh` avec header fixe ;
- `pages/voyage/voyage.wxss` : popup avec `top: 156rpx` et scroll interne en `height: calc(100vh - 268rpx)`.

Si le parent mesure mal l'espace disponible, le scroll-view mesure mal aussi. Sur iPhone reel, c'est une cause classique de contenu coupe ou de gaps bas.

## Cause 10 - Les popups et footers fixes ne partagent pas une strategie commune

Exemples :

- Booking footer : `position: fixed; bottom: 0; padding: ... env(safe-area-inset-bottom)` ;
- Payment footer : `position: fixed; bottom: 0; padding: ... env(safe-area-inset-bottom)` ;
- Detail booking bar : `position: fixed; bottom: 0; min-height: 180rpx` ;
- Voyage popup : `position: fixed; top: 156rpx; bottom: 0`.

Chaque ecran gere son inset bas et sa hauteur manuellement. Il n'y a pas de token global du type :

- hauteur nav ;
- hauteur tabbar ;
- hauteur footer ;
- safe area bottom ;
- padding scroll reserve.

Sans cette source de verite, chaque page peut etre correcte seule mais incoherente sur un vrai appareil.

## Pages les plus a risque

### 1. `pages/destination-detail`

Risque tres eleve.

Causes :

- `height: 100vh` ;
- WXSS imbrique invalide ;
- `.detail-content` plus large que l'ecran ;
- grande image hero fixe ;
- barre de reservation fixe en bas ;
- padding bas manuel.

### 2. `pages/booking`

Risque tres eleve.

Causes :

- footer fixe ;
- beaucoup de tailles de controle fixes ;
- traveler cards en hauteur fixe ;
- zone prix avec texte nowrap ;
- padding bas manuel.

### 3. `pages/voyage`

Risque eleve.

Causes :

- popup fixe avec `top: 156rpx` ;
- scroll interne calcule avec `100vh` ;
- beaucoup de tailles fixes dans le detail reservation ;
- panel en `overflow: hidden`.

### 4. `pages/home`

Risque eleve.

Causes :

- sections principales en hauteur fixe ;
- featured list en hauteur fixe ;
- card full width `750rpx` ;
- padding bas manuel pour tabbar.

### 5. `pages/explorer` et `pages/favoris`

Risque eleve.

Causes :

- grids 2 colonnes avec cards hauteur fixe ;
- styles inline `height` avec `!important` ;
- padding bas manuel ;
- favoris a un header plus large que son parent.

### 6. `pages/booking-confirmation`

Risque moyen a eleve.

Causes :

- header fixe ;
- scroll en `height: 100vh` ;
- animations positionnees avec `top: 50%` puis `top: 156rpx` ;
- contenu centre avec grosses marges verticales.

### 7. `pages/paiement`

Risque moyen.

Causes :

- footer fixe ;
- padding bas manuel ;
- summary card min-height fixe.

## Pourquoi le simulateur peut cacher le probleme

Le simulateur et l'iPhone reel ne donnent pas toujours les memes contraintes :

- hauteur de status bar differente ;
- safe-area bottom differente ;
- arrondis `rpx` differents ;
- fonts rendues differemment ;
- scroll physique plus strict ;
- WeChat runtime reel plus proche des contraintes systeme iOS ;
- home indicator qui prend un espace que le layout doit respecter.

Une UI basee sur des hauteurs exactes peut sembler parfaite dans un seul viewport, puis casser sur un appareil reel.

## Priorites de correction

### P0 - Stabiliser le layout global

Objectif : eviter que le contenu soit coupe par les zones fixes.

A faire :

- remplacer `height: 100vh` par une strategie `min-height` + scroll naturel quand possible ;
- supprimer `overflow: hidden` du layout global sauf cas strictement necessaire ;
- definir une seule hauteur officielle pour nav bar et tabbar ;
- ajouter des classes globales pour reserver l'espace bas :
  - page avec tabbar ;
  - page avec footer fixe ;
  - page avec modal bottom sheet.

### P0 - Centraliser les safe areas

Objectif : arreter les paddings bas manuels differents.

A faire :

- creer un token global pour le tabbar custom ;
- creer un token global pour les footers fixes ;
- utiliser `env(safe-area-inset-bottom)` dans un seul endroit ;
- remplacer les paddings bas hardcodes `151.98rpx`, `180rpx`, `192.3rpx`, `230rpx`.

### P1 - Enlever les hauteurs fixes des sections

Objectif : laisser le contenu determiner la hauteur.

A faire :

- remplacer les `height` de section par `min-height` quand il faut un minimum visuel ;
- utiliser `padding` + `gap` au lieu de hauteurs exactes ;
- retirer les hauteurs fixes des cards quand le texte peut varier ;
- utiliser une hauteur d'image stable, mais laisser le contenu card grandir.

### P1 - Corriger les largeurs qui depassent 750rpx

Objectif : supprimer les debordements horizontaux.

A faire :

- mettre `width: 100%` sur `.detail-content` ;
- ajouter `box-sizing: border-box` quand un bloc a `width` + `padding` ;
- retirer `width: 716rpx` quand le parent a deja un padding horizontal ;
- eviter `cardWidth="750rpx"` dans une zone qui a des paddings ou dans un carousel avec marge.

### P1 - Supprimer les valeurs fractionnaires

Objectif : eviter les gaps de rounding sur device reel.

A faire :

- remplacer `31.98rpx` par `32rpx` ;
- remplacer `23.98rpx` par `24rpx` ;
- remplacer `559.98rpx` par `560rpx`, puis idealement supprimer la hauteur fixe ;
- remplacer `1.66rpx` par `2rpx` ou `1rpx` selon le rendu attendu.

### P1 - Nettoyer le WXSS invalide

Objectif : garantir que WeChat parse les styles de maniere stable.

A faire :

- supprimer le nesting dans `pages/destination-detail/destination-detail.wxss` ;
- eviter les commentaires temporaires en francais dans les regles CSS ;
- verifier les declarations inline comme `box-shadow: ...; !important;`.

### P2 - Reduire les styles inline

Objectif : rendre le responsive maintenable.

A faire :

- remplacer `cardStyle`, `buttonStyle`, `containerStyle` longs par des classes ;
- creer des variants de composants ;
- supprimer les `!important` qui bloquent les overrides ;
- documenter les tailles acceptables dans les composants UI.

## Strategie recommandee

La bonne correction n'est pas de patcher chaque gap un par un. Il faut d'abord poser une strategie de layout.

Ordre conseille :

1. Corriger `app-layout`, nav bar et custom tabbar.
2. Creer des tokens d'espace pour nav, tabbar, footers et safe areas.
3. Corriger les pages tabbar : Home, Explorer, Favoris, Voyage.
4. Corriger les pages a footer fixe : Detail, Booking, Paiement.
5. Corriger les cards et grids.
6. Nettoyer les styles inline et `!important`.
7. Tester sur au moins trois tailles iPhone.

## Matrice de test conseillee

Tester au minimum :

| Device | Pourquoi |
|--------|----------|
| iPhone SE ou petit iPhone | Detecte les hauteurs trop grandes et textes coupes |
| iPhone 13/14/15 standard | Reference principale |
| iPhone Pro Max | Detecte les grands gaps verticaux |
| iPhone avec home indicator | Verifie `env(safe-area-inset-bottom)` |
| iPhone avec status bar haute ou Dynamic Island | Verifie la nav custom |

Pendant le test, verifier :

- premier ecran sans scroll ;
- dernier item visible au-dessus du tabbar ;
- absence de scroll horizontal ;
- hauteur des cards en grille ;
- bottom sheets et modals ;
- pages avec footer fixe ;
- retour depuis une page detail vers une page tabbar.

## Conclusion

Les problemes visibles sur iPhone reel sont coherents avec le code actuel. Le projet a ete construit comme une maquette pixel-perfect en `rpx`, avec beaucoup de hauteurs exactes et de positions fixes.

Pour obtenir un rendu fiable sur device reel, il faut passer a une logique responsive :

- des conteneurs fluides ;
- des hauteurs de contenu naturelles ;
- des safe areas centralisees ;
- moins de styles inline ;
- moins de `!important` ;
- une reservation unique et calculee pour nav bar, tabbar et footers.

Une fois cette base corrigee, les gaps et problemes d'affichage devraient devenir beaucoup plus rares et plus faciles a diagnostiquer.
