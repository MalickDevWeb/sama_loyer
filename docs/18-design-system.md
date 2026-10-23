# Design system SAMA LOYER

Toutes les couleurs, tailles de texte, graisses, rayons, espacements et ombres de la mini-app sont définis **une seule fois** dans [`styles/tokens.wxss`](../styles/tokens.wxss). Les pages ne doivent plus écrire de valeur en dur : elles utilisent ces variables.

| Fichier | Rôle |
|---|---|
| [`styles/tokens.wxss`](../styles/tokens.wxss) | Les variables (`--sl-…`) et les styles de texte prêts à l'emploi. Importé par `app.wxss`, donc disponible partout, y compris dans les composants. |
| [`utils/constants/theme.js`](../utils/constants/theme.js) | La même palette pour le JavaScript (`COLORS`, `AVATAR_COLORS`, `TINTS`). |
| [`back_office/src/index.css`](../back_office/src/index.css) | La palette du back office, avec les mêmes valeurs (voir la correspondance plus bas). |

## Utilisation

```css
/* page.wxss */
.carte-loyer {
  background: var(--sl-white);
  border: 2rpx solid var(--sl-border);
  border-radius: var(--sl-radius-lg);
  box-shadow: var(--sl-shadow-card);
}

.carte-loyer__montant {
  font-size: var(--sl-fs-title);
  font-weight: var(--sl-fw-extrabold);
  color: var(--sl-berry);
}
```

```xml
<!-- Styles de texte prêts à l'emploi -->
<text class="sl-h2">Mes loyers</text>
<text class="sl-body sl-muted">Paie ton loyer avec Max it.</text>
<text class="sl-label">Caution</text>
```

```js
// Couleur passée par le JS
import { COLORS } from '../../../utils/constants/theme';
wx.showModal({ title: 'Confirmer ?', confirmColor: COLORS.berry });
```

## Couleurs

| Token | Valeur | Usage |
|---|---|---|
| `--sl-navy` | `#0F1E3D` | Bleu nuit de la marque : boutons principaux, fonds sombres |
| `--sl-navy-deep` | `#0E1B38` | Héros et cartes sombres |
| `--sl-berry` | `#C8235F` | Framboise : accents, prix, actions clés |
| `--sl-berry-dark` | `#9E1749` | Framboise appuyée |
| `--sl-berry-bright` | `#E6007A` | Rose vif du logo |
| `--sl-berry-tint` | `#FDE8EE` | Fond d'un élément sélectionné |
| `--sl-berry-soft` | `#FDF1F5` | Fond rose très léger |
| `--sl-berry-border` | `#F3C3D5` | Bordure rose |
| `--sl-gradient-brand` | dégradé `#E6007A` → `#C8235F` | Icône du logo |
| `--sl-text` | `#0F1E3D` | Texte principal |
| `--sl-text-2` | `#3A4458` | Texte secondaire appuyé |
| `--sl-muted` | `#5B6475` | Texte secondaire |
| `--sl-placeholder` | `#7A8294` | Indications, champs vides |
| `--sl-on-dark` | `#FFFFFF` | Texte sur fond sombre ou coloré |
| `--sl-white` | `#FFFFFF` | Cartes, fonds blancs |
| `--sl-bg` | `#F8F9FA` | Fond d'écran gris clair |
| `--sl-surface-2` | `#F7F8FA` | Blocs secondaires |
| `--sl-surface-3` | `#F1F3F6` | Champs de saisie, pastilles |
| `--sl-info-bg` | `#E3E9F5` | Fond bleu pâle |
| `--sl-border` | `#E4E7EE` | Bordures |
| `--sl-divider` | `#EEF0F4` | Séparateurs |
| `--sl-border-strong` | `#C9D0DE` | Bordures appuyées, pointillés |
| `--sl-success` / `-text` / `-bg` / `-soft` | `#11643F` … | Succès, « vérifié » |
| `--sl-green` / `--sl-green-bg` | `#007C3D` / `#EAF7EE` | « Payé », « validé » |
| `--sl-danger` / `--sl-danger-bg` | `#A3261F` / `#FDECEC` | Erreurs, retards |
| `--sl-warning` / `-text` / `-bg` | `#8A5A00` … | Avertissements, « en attente » |

`--sl-text` et `--sl-navy` ont la même valeur : on prend `--sl-text` pour la couleur du texte et `--sl-navy` pour un fond ou une bordure. C'est pareil pour `--sl-on-dark` et `--sl-white`.

## Typographie

Police : `var(--sl-font)` (Plus Jakarta Sans, puis les polices système). Pour du code ou des références : `var(--sl-font-mono)`.

| Token | Taille | Usage |
|---|---|---|
| `--sl-fs-h1` | 52 rpx | Grands titres |
| `--sl-fs-h2` | 44 rpx | Titres d'écran |
| `--sl-fs-h3` | 40 rpx | |
| `--sl-fs-title-lg` | 38 rpx | |
| `--sl-fs-title` | 36 rpx | Titres de section |
| `--sl-fs-title-sm` | 34 rpx | Titres de barre |
| `--sl-fs-subtitle` | 32 rpx | Titres de carte |
| `--sl-fs-body-lg` | 30 rpx | Texte mis en avant, boutons |
| `--sl-fs-body` | 28 rpx | Texte courant |
| `--sl-fs-body-sm` | 26 rpx | Texte compact |
| `--sl-fs-small` | 24 rpx | Méta, dates |
| `--sl-fs-caption` | 22 rpx | Légendes |
| `--sl-fs-micro` | 20 rpx | Badges, mentions |

Graisses : `--sl-fw-regular` (400), `-medium` (500), `-semibold` (600), `-bold` (700), `-extrabold` (800), `-black` (900).

Styles de texte prêts à l'emploi : `.sl-h1`, `.sl-h2`, `.sl-title`, `.sl-subtitle`, `.sl-body`, `.sl-body-sm`, `.sl-caption`, `.sl-label` (petites majuscules), `.sl-amount` (montant en framboise). Couleurs de texte : `.sl-muted`, `.sl-berry`, `.sl-navy`, `.sl-success`, `.sl-danger`.

## Rayons, espacements, ombres

- **Rayons** : `--sl-radius-xs` (8), `-sm` (12), `-md` (20), `-lg` (28), `-xl` (36), `-pill` (999 rpx).
- **Espacements** : `--sl-space-1` à `--sl-space-6` (8 à 48 rpx, par pas de 8). Marge latérale d'écran : `--sl-gutter` (32 rpx).
- **Ombres** : `--sl-shadow-card` (cartes), `--sl-shadow-raised` (éléments flottants), `--sl-shadow-berry` (bouton framboise).

## Règles

1. **Pas de couleur en dur** dans un `.wxss` : on utilise un token. Seules exceptions : les dégradés et teintes propres à une illustration.
2. **Besoin d'une nouvelle couleur ?** On l'ajoute dans `styles/tokens.wxss` **et** dans `utils/constants/theme.js`, avec un commentaire d'usage. On ne crée pas une variante presque identique d'une couleur existante.
3. **Une taille de texte hors échelle** (27 rpx, 46 rpx…) doit rester l'exception. On préfère la taille de l'échelle la plus proche.
4. Les `rgba(15, 30, 61, …)` (bleu nuit transparent) et `rgba(200, 35, 95, …)` (framboise transparente) restent écrits en clair : ils servent aux ombres et aux voiles.

## Correspondance avec le back office

Le back office (React) utilise les mêmes valeurs, avec des noms sans préfixe :

| Mini-app | Back office |
|---|---|
| `--sl-navy` | `--navy` |
| `--sl-berry`, `--sl-berry-dark`, `--sl-berry-soft` | `--berry`, `--berry-dark`, `--berry-soft` |
| `--sl-text`, `--sl-text-2`, `--sl-muted`, `--sl-placeholder` | `--text`, `--text-2`, `--muted`, `--placeholder` |
| `--sl-surface-2`, `--sl-border`, `--sl-divider`, `--sl-info-bg` | `--surface-2`, `--border`, `--divider`, `--info-bg` |
| `--sl-success…`, `--sl-danger…`, `--sl-warning…` | `--success…`, `--danger…`, `--warning…` |

Si une couleur de la marque change, il faut la modifier aux trois endroits : `tokens.wxss`, `theme.js` et `back_office/src/index.css`.
