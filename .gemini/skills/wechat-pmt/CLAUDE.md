# Claude Code Guidelines — WeChat Mini-Program & Sonatel TCMPP

Ce fichier configure Claude Code pour garantir le respect strict des standards d'ingénierie logicielle Sonatel Max It / WeChat PMT.

---

## 🛠️ Commandes Fréquentes

```bash
# Tests de santé & validation CI (BOM, JSON, WXSS, déclencheurs IA, générateurs, harness)
npm test

# Audit statique de bundle (2 Mo TCMPP), images lourdes et fuites mémoire
npm run analyze

# Tests unitaires headless de machine à états uiState
npm run test:harness

# Générateur de page (racine ou sous-paquet avec API optionnelle)
node scripts/create-page.js <nom> [--subpackage <sous-paquet>] [--with-api]

# Générateur de composant (mode UI présentation ou UX skeleton shimmer)
node scripts/create-component.js <nom> [--ux]

# Générateur de service API et mappeur json-sculpt
node scripts/create-api.js <domaine>
```

---

## 🏛️ Directives de Code Inviolables pour Claude Code

Lors de la rédaction de code WeChat pour ce projet, Claude Code DOIT respecter :
1. **Règle des 4 Fichiers** : Chaque composant/page vit dans son propre sous-dossier avec `.js`, `.wxml`, `.wxss`, `.json`.
2. **Machine à États** : Gérer obligatoirement `uiState: 'loading' | 'success' | 'empty' | 'error'`.
3. **Ergonomie iPhone** : Toujours inclure `padding-bottom: calc(XXrpx + env(safe-area-inset-bottom));` sur les éléments fixés en bas. Remplacer `:active` par `hover-class="ods-btn--pressed"`.
4. **Orange Design System** : Palette Sonatel (`#F16E00`, `#1A1A1A`, `#F6F6F6`), composant signature Solde Orange Money avec masquage haptique.
5. **Bouclier Anti-Double Débit Orange Money** : Sceller `this._confirmedTxnid = txnid` dès débit confirmé ; interdire tout second paiement sur `err.uncertain`.
6. **Moteur i18n Wolof / Français** : Résolution WXS pur ES5 directement dans le WXML sans surcharge de `setData`.
7. **Compilateur TCMPP** : Sauvegarder strictement en **UTF-8 sans BOM** (`\uFEFF`), aucun `@font-face` local, aucun nesting SCSS.
8. **Conformité CDP Sénégal** : Masquer obligatoirement les numéros clients sous la forme `77 *** ** 12`.

