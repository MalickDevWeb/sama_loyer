> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📚 Le Livre de Recettes : Solutions Complètes Prêtes à l'Emploi

Chaque recette est une **solution complète et autonome**. Vous trouvez votre situation, vous copiez le bloc entier (Mappeur + API + JS + HTML + CSS), vous changez uniquement les `[CROCHETS]`, et votre fonctionnalité est opérationnelle.

## 📑 Sommaire — Trouvez votre situation
| Numéro | Je dois coder... | Complexité |
|---|---|---|
| 🔵 [Recette 1](#-recette-1--page-de-liste-avec-api--skeleton--scroll-infini) | Une page de liste qui charge depuis le serveur, avec skeleton et scroll infini | Moyenne |
| 🔵 [Recette 2](#-recette-2--formulaire-complet-avec-validation-et-envoi-api) | Un formulaire avec validation en direct et envoi au serveur | Moyenne |
| 🔵 [Recette 3](#-recette-3--page-de-détail-avec-api) | Une page de détail (produit, vol, profil) qui affiche les données du serveur | Facile |
| 🔵 [Recette 4](#-recette-4--upload-photo--envoi-au-serveur) | Un bouton pour choisir une photo et l'envoyer au serveur | Moyenne |
| 🔵 [Recette 5](#-recette-5--filtres-sur-une-page-séparée-qui-rafraîchit-la-liste) | Un système de filtres sur une page dédiée qui recharge la liste principale | Avancée |
| 🔵 [Recette 6](#-recette-6--compteur-de-panier-partagé-entre-toutes-les-pages) | Un compteur (panier, notifications) visible sur toutes les pages | Avancée |
| 🟢 [Recette 7](#-recette-7--connexion--login-et-protection-de-pages) | Une page de connexion avec sauvegarde du token et redirection | Facile |
| 🟢 [Recette 8](#-recette-8--pull-to-refresh-tirer-pour-recharger) | Tirer vers le bas pour recharger la liste (comme Facebook, Instagram) | Facile |
| 🟢 [Recette 9](#-recette-9--recherche-en-temps-réel-debounce) | Une barre de recherche qui interroge le serveur après que l'utilisateur a fini de taper | Moyenne |
| 🟢 [Recette 10](#-recette-10--bouton-favoritlike-toggle) | Un bouton "Cœur" ou "Étoile" qui s'allume et s'éteint (avec sauvegarde serveur) | Facile |
| 🟢 [Recette 11](#-recette-11--partage-wechat-envoyer-à-un-ami) | Envoyer une page ou un contenu à un ami via WeChat | Facile |
| 🟢 [Recette 12](#-recette-12--onglets-tabs-avec-changement-de-données) | Un menu à onglets qui change le contenu et recharge les données | Moyenne |
| 🟢 [Recette 13](#-recette-13--cache-local-garder-des-données-hors-ligne) | Sauvegarder des données localement pour que l'app fonctionne sans réseau | Moyenne |

---

## 🔵 Recette 1 : Page de Liste avec API + Skeleton + Scroll Infini

**Quand l'utiliser ?** Vous affichez une liste de produits, de vols, de commandes, etc. La liste se charge depuis le serveur et s'allonge automatiquement quand on descend.

### Étape 1/4 — Le Mappeur (`utils/mappers/[MON_DOMAINE].js`)
```javascript
// ✏️ Définit la "forme" de chaque élément de la liste
export const [MonItemSchema] = {
  id:    "@link.[id_serveur]",
  titre: "@link.[nom_serveur]",
  prix:  "@link.[prix_serveur]::number"
};
```

### Étape 2/4 — L'API (`utils/apis/[mondomaine].api.js`)
```javascript
async getListe(page = 1) {
  await authenticate();
  const res = await httpClient.get('[/api/ma-route]', { query: { page, limit: 10 } });
  if (!res.success) throw new Error(res.error?.message);
  return sculpt.list({ data: res.data.items, to: [MonItemSchema] });
}
```

### Étape 3/4 — La Page (`pages/[ma-page]/index.js`)
```javascript
import { [monAPI] } from '../../utils/apis/index.js';

Page({
  data: {
    uiState: 'loading', // loading | content | empty | error
    liste: [],
    pageActuelle: 1,
    estFini: false
  },

  onLoad() { this.charger(); },

  // 🔒 Se déclenche automatiquement quand on touche le bas
  onReachBottom() {
    if (!this.data.estFini) this.charger();
  },

  async charger() {
    try {
      const nouvelles = await [monAPI].getListe(this.data.pageActuelle);
      const listeMaj = [...this.data.liste, ...nouvelles];
      this.setData({
        liste: listeMaj,
        pageActuelle: this.data.pageActuelle + 1,
        estFini: nouvelles.length === 0,
        uiState: listeMaj.length === 0 ? 'empty' : 'content'
      });
    } catch (e) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Étape 4/4 — La Vue (`index.wxml` + `index.wxss`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<!-- ÉTAT : Chargement initial (Skeleton) -->
<view wx:if="{{uiState === 'loading'}}" class="container">
  <view wx:for="{{[1,2,3,4]}}" class="skeleton-card animate-pulse" />
</view>

<!-- ÉTAT : Liste affichée -->
<view wx:elif="{{uiState === 'content'}}" class="container animate-fade-in">
  <view wx:for="{{liste}}" wx:key="id" class="card">
    <text class="card__titre">{{item.titre}}</text>
    <text class="card__prix">{{ f.formatPrix(item.prix) }}</text>
  </view>
  <!-- Message quand tout est chargé -->
  <text wx:if="{{estFini}}" class="fin-liste">Tout est affiché ✓</text>
</view>

<!-- ÉTAT : Vide -->
<view wx:elif="{{uiState === 'empty'}}">
  <text>Aucun élément trouvé.</text>
</view>
```

```css
.skeleton-card {
  height: 80px; background: #e8e8e8; border-radius: 12px;
  margin-bottom: 12px; animation: pulse 1.5s infinite ease-in-out;
}
@keyframes pulse { 50% { opacity: 0.4; } }
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.fin-liste { text-align: center; color: #aaa; padding: 16px; font-size: 12px; }
```

---

## 🔵 Recette 2 : Formulaire Complet avec Validation et Envoi API

**Quand l'utiliser ?** Un formulaire d'inscription, de contact, de modification de profil. Le bouton "Envoyer" reste bloqué tant que les champs sont invalides.

### Étape 1/3 — L'API (`utils/apis/[mondomaine].api.js`)
```javascript
async creer(payload) {
  await authenticate();
  const res = await httpClient.post('[/api/ma-route]', payload);
  if (!res.success) throw new Error(res.error?.message);
  return res.data;
}
```

### Étape 2/3 — La Page (`index.js`)
```javascript
Page({
  data: {
    uiState: 'idle', // idle | loading | success | error
    // ✏️ Un champ par input du formulaire
    champs: { email: '', motDePasse: '' },
    formulaireValide: false
  },

  // 🔒 Appelé à chaque frappe clavier (bindinput)
  auChangement(e) {
    const champ = e.currentTarget.dataset.champ;
    const valeur = e.detail.value;
    const champsMaj = { ...this.data.champs, [champ]: valeur };
    
    this.setData({
      champs: champsMaj,
      // ✏️ Vos règles de validation ici
      formulaireValide: champsMaj.email.includes('@') && champsMaj.motDePasse.length >= 6
    });
  },

  async envoyer() {
    if (!this.data.formulaireValide) return;
    this.setData({ uiState: 'loading' });
    try {
      await [monAPI].creer(this.data.champs);
      this.setData({ uiState: 'success' });
      setTimeout(() => wx.navigateBack(), 1500); // Retour après succès
    } catch (e) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Étape 3/3 — La Vue (`index.wxml`)
```xml
<!-- ✏️ data-champ doit correspondre à votre clé dans 'champs' -->
<input placeholder="Email" data-champ="email" bindinput="auChangement" />
<input placeholder="Mot de passe" password data-champ="motDePasse" bindinput="auChangement" />

<!-- Le bouton est grisé automatiquement si formulaireValide est faux -->
<button
  disabled="{{!formulaireValide || uiState === 'loading'}}"
  bindtap="envoyer"
  loading="{{uiState === 'loading'}}">
  Envoyer
</button>

<!-- Message de succès -->
<view wx:if="{{uiState === 'success'}}" class="animate-bounce-in">
  <icon type="success" size="48" />
  <text>Enregistré !</text>
</view>
```

---

## 🔵 Recette 3 : Page de Détail avec API

**Quand l'utiliser ?** Une page qui reçoit un `id` en paramètre (produit, vol, commande) et charge ses infos depuis le serveur.

### Étape 1/3 — Le Mappeur + API
```javascript
// utils/mappers/[mondomaine].js
export const [MonDetailSchema] = {
  id:          "@link.[id_serveur]",
  titre:       "@link.[titre_serveur]",
  description: "@link.[desc_serveur]",
  prix:        "@link.[prix_serveur]::number"
};

// utils/apis/[mondomaine].api.js
async getDetail(id) {
  await authenticate();
  const res = await httpClient.get(`[/api/ma-route/${id}]`);
  if (!res.success) throw new Error(res.error?.message);
  return sculpt.data({ data: res.data, to: [MonDetailSchema] });
}
```

### Étape 2/3 — La Page (`index.js`)
```javascript
Page({
  data: { uiState: 'loading', detail: null },

  async onLoad(options) {
    // 🔒 L'ID vient automatiquement de l'URL (ex: ?id=42)
    const id = options.id;
    try {
      const detail = await [monAPI].getDetail(id);
      this.setData({ detail, uiState: 'content' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

### Étape 3/3 — La Vue (`index.wxml`)
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />

<view wx:if="{{uiState === 'loading'}}" class="skeleton-detail animate-pulse" />

<view wx:elif="{{uiState === 'content'}}" class="detail animate-fade-in">
  <text class="titre">{{detail.titre}}</text>
  <text class="description">{{detail.description}}</text>
  <text class="prix">{{ f.formatPrix(detail.prix) }}</text>
</view>

<view wx:elif="{{uiState === 'error'}}">
  <text>Impossible de charger. Réessayez.</text>
</view>
```

---

## 🔵 Recette 4 : Upload Photo + Envoi au Serveur

**Quand l'utiliser ?** Photo de profil, pièce jointe, preuve de paiement. L'utilisateur choisit la photo, on l'affiche à l'écran, puis on l'envoie.

### Étape 1/2 — La Page (`index.js`)
```javascript
Page({
  data: { imagePreview: null, uiState: 'idle' },

  choisirEtEnvoyer() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const cheminLocal = res.tempFiles[0].tempFilePath;
        // 1. Afficher l'image immédiatement
        this.setData({ imagePreview: cheminLocal, uiState: 'loading' });
        try {
          // 2. Envoyer au serveur
          await [monAPI].uploaderFichier(cheminLocal);
          this.setData({ uiState: 'success' });
          wx.showToast({ title: 'Photo enregistrée !', icon: 'success' });
        } catch (e) {
          this.setData({ uiState: 'error' });
          wx.showToast({ title: e.message, icon: 'none' });
        }
      }
    });
  }
});
```

### Étape 2/2 — La Vue (`index.wxml`)
```xml
<view class="upload-zone" bindtap="choisirEtEnvoyer">
  <!-- Aperçu de l'image choisie -->
  <image wx:if="{{imagePreview}}" src="{{imagePreview}}" mode="aspectFill" class="apercu" />
  <!-- Zone vide avant la sélection -->
  <view wx:else class="placeholder">
    <text class="icone">+</text>
    <text>Choisir une photo</text>
  </view>
  <!-- Indicateur de chargement par-dessus l'image -->
  <view wx:if="{{uiState === 'loading'}}" class="overlay-loading">
    <text>Envoi...</text>
  </view>
</view>
```

---

## 🔵 Recette 5 : Filtres sur une Page Séparée qui Rafraîchit la Liste

**Quand l'utiliser ?** Un bouton "Filtres" qui ouvre une nouvelle page. L'utilisateur choisit ses filtres, valide, et la page principale se recharge avec les filtres appliqués.

### Page A — La Liste Principale (`pages/liste/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  data: { liste: [], filtresActifs: {} },

  onLoad() {
    // 🔒 Allumer le talkie-walkie
    Bus.on('APPLIQUER_FILTRES', this.rechargerAvecFiltres, this);
    this.rechargerAvecFiltres({});
  },
  onUnload() {
    // 🔒 VITAL : Éteindre le talkie-walkie
    Bus.off('APPLIQUER_FILTRES', this.rechargerAvecFiltres, this);
  },

  ouvrirFiltres() {
    wx.navigateTo({ url: '/pages/filtres/index' });
  },

  async rechargerAvecFiltres(filtres) {
    this.setData({ filtresActifs: filtres });
    // ✏️ Votre appel API avec les filtres
    const liste = await monAPI.getListe(filtres);
    this.setData({ liste });
  }
});
```

### Page B — La Page de Filtres (`pages/filtres/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  data: { prixMax: 100000 },

  changerPrix(e) { this.setData({ prixMax: e.detail.value }); },

  valider() {
    // 🔒 Crier dans le talkie-walkie et retourner
    Bus.emit('APPLIQUER_FILTRES', { prixMax: this.data.prixMax });
    wx.navigateBack();
  }
});
```

---

## 🔵 Recette 6 : Compteur de Panier Partagé entre toutes les Pages

**Quand l'utiliser ?** Une pastille rouge sur la NavBar qui montre le nombre d'articles dans le panier, et qui se met à jour immédiatement n'importe où dans l'app.

### La NavBar Partagée (`components/navbar/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Component({
  data: { compteur: 0 },
  lifetimes: {
    attached() {
      // 🔒 Regarder le "tableau central" en permanence
      Bus.onState('panier.compteur', (val) => {
        this.setData({ compteur: val });
      }, this);
    },
    detached() { Bus.offState('panier.compteur', this); }
  }
});
```

### La NavBar Partagée (`components/navbar/index.wxml`)
```xml
<view class="navbar">
  <view class="panier-icon">
    🛒
    <!-- La pastille rouge n'apparaît que s'il y a des items -->
    <view wx:if="{{compteur > 0}}" class="pastille">
      <text>{{compteur}}</text>
    </view>
  </view>
</view>
```

### N'importe quelle page qui ajoute au panier (`pages/produit/index.js`)
```javascript
import { Bus } from '../../utils/event/index.js';

Page({
  ajouterAuPanier() {
    // Votre logique métier...
    const nouveauCompteur = wx.getStorageSync('panier_count') + 1;
    wx.setStorageSync('panier_count', nouveauCompteur);
    
    // 🔒 Mettre à jour le tableau central. La NavBar se met à jour instantanément.
    Bus.setState('panier.compteur', nouveauCompteur);
    wx.showToast({ title: 'Ajouté !', icon: 'success' });
  }
});
```

---

## 🟢 Recette 7 : Connexion / Login et Protection de Pages

**Quand l'utiliser ?** Toute application avec des comptes utilisateurs. La page de login envoie les identifiants, reçoit un token, et redirige vers l'accueil. Les autres pages vérifient que l'utilisateur est connecté avant de s'afficher.

### La Page de Login (`pages/login/index.js`)
```javascript
Page({
  data: {
    uiState: 'idle',
    champs: { email: '', motDePasse: '' },
    formulaireValide: false
  },

  auChangement(e) {
    const champ = e.currentTarget.dataset.champ;
    const champsMaj = { ...this.data.champs, [champ]: e.detail.value };
    this.setData({
      champs: champsMaj,
      formulaireValide: champsMaj.email.length > 3 && champsMaj.motDePasse.length >= 6
    });
  },

  async seConnecter() {
    if (!this.data.formulaireValide) return;
    this.setData({ uiState: 'loading' });
    try {
      const res = await authAPI.login(this.data.champs);
      // 🔒 Sauvegarde du token pour toutes les futures requêtes
      wx.setStorageSync('auth_token', res.token);
      wx.setStorageSync('user_id', res.userId);
      // 🔒 Redirection sans possibilité de revenir en arrière
      wx.reLaunch({ url: '/pages/accueil/index' });
    } catch (e) {
      this.setData({ uiState: 'idle' });
      wx.showToast({ title: e.message, icon: 'none' });
    }
  }
});
```

### Protection d'une Page Privée (à mettre dans `onLoad`)
```javascript
onLoad() {
  // 🔒 GARDIEN : Si pas de token, on renvoie au login
  const token = wx.getStorageSync('auth_token');
  if (!token) {
    wx.reLaunch({ url: '/pages/login/index' });
    return; // Arrêter l'exécution
  }
  // Suite du code de la page...
}
```

---

## 🟢 Recette 8 : Pull-to-Refresh (Tirer pour Recharger)

**Quand l'utiliser ?** L'utilisateur tire vers le bas pour recharger manuellement la liste (comme sur Facebook, Instagram, Twitter).

### Dans le `index.json` de la page (OBLIGATOIRE)
```json
{
  "enablePullDownRefresh": true,
  "backgroundTextStyle": "dark"
}
```

### Dans le `index.js`
```javascript
Page({
  data: { liste: [], uiState: 'loading' },

  onLoad() { this.charger(); },

  // 🔒 Se déclenche automatiquement quand on tire vers le bas
  async onPullDownRefresh() {
    this.setData({ liste: [], pageActuelle: 1 });
    await this.charger();
    // 🔒 OBLIGATOIRE : Arrête l'animation de rechargement
    wx.stopPullDownRefresh();
  },

  async charger() {
    try {
      const liste = await monAPI.getListe();
      this.setData({ liste, uiState: 'content' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

---

## 🟢 Recette 9 : Recherche en Temps Réel (Debounce)

**Quand l'utiliser ?** Une barre de recherche qui ne lance pas une requête à chaque lettre tapée (trop lent), mais attend que l'utilisateur ait fini de taper (après 400ms de silence).

### Dans le `index.js`
```javascript
Page({
  data: { resultats: [], uiState: 'idle' },
  // 🔒 Variable interne pour le timer (PAS dans data)
  _debounceTimer: null,

  auChangementRecherche(e) {
    const texte = e.detail.value;

    // 🔒 On annule le timer précédent à chaque nouvelle frappe
    if (this._debounceTimer) clearTimeout(this._debounceTimer);

    if (texte.length < 2) {
      this.setData({ resultats: [], uiState: 'idle' });
      return;
    }

    // 🔒 On lance la recherche seulement 400ms après la dernière frappe
    this._debounceTimer = setTimeout(async () => {
      this.setData({ uiState: 'loading' });
      try {
        // ✏️ Votre appel API ici
        const resultats = await monAPI.rechercher({ q: texte });
        this.setData({ resultats, uiState: resultats.length ? 'content' : 'empty' });
      } catch (e) {
        this.setData({ uiState: 'error' });
      }
    }, 400);
  }
});
```

### Dans le `index.wxml`
```xml
<input placeholder="Rechercher..." bindinput="auChangementRecherche" />

<view wx:if="{{uiState === 'loading'}}"><text>Recherche en cours...</text></view>
<view wx:elif="{{uiState === 'empty'}}"><text>Aucun résultat.</text></view>
<view wx:elif="{{uiState === 'content'}}">
  <view wx:for="{{resultats}}" wx:key="id" class="resultat-item animate-fade-in">
    <text>{{item.titre}}</text>
  </view>
</view>
```

---

## 🟢 Recette 10 : Bouton Favoris/Like (Toggle)

**Quand l'utiliser ?** Un bouton cœur ou étoile qui s'allume/s'éteint quand on clique, et qui sauvegarde l'état sur le serveur.

### Dans le `index.js`
```javascript
Page({
  data: { estFavori: false, idItem: null },

  onLoad(options) {
    this.setData({ idItem: options.id });
    // ✏️ Charger l'état favori depuis le serveur ou le cache
    const cache = wx.getStorageSync(`favori_${options.id}`);
    this.setData({ estFavori: !!cache });
  },

  async toggleFavori() {
    const nouvelEtat = !this.data.estFavori;
    // 🔒 Mise à jour immédiate de l'UI (pas d'attente serveur)
    this.setData({ estFavori: nouvelEtat });

    try {
      if (nouvelEtat) {
        await monAPI.ajouterFavori(this.data.idItem);
        wx.setStorageSync(`favori_${this.data.idItem}`, true);
      } else {
        await monAPI.supprimerFavori(this.data.idItem);
        wx.removeStorageSync(`favori_${this.data.idItem}`);
      }
    } catch (e) {
      // 🔒 Si le serveur échoue, on annule le changement visuel
      this.setData({ estFavori: !nouvelEtat });
      wx.showToast({ title: 'Erreur, réessayez.', icon: 'none' });
    }
  }
});
```

### Dans le `index.wxml`
```xml
<!-- Le cœur change de couleur instantanément -->
<view class="btn-favori {{estFavori ? 'actif' : ''}}" bindtap="toggleFavori">
  <text>{{ estFavori ? '❤️' : '🤍' }}</text>
</view>
```

---

## 🟢 Recette 11 : Partage WeChat (Envoyer à un Ami)

**Quand l'utiliser ?** L'utilisateur veut partager un produit, un article, ou une page de l'app à un ami dans une conversation WeChat.

### Dans le `index.js`
```javascript
Page({
  data: { detail: { titre: '', id: '' } },

  // 🔒 Fonction native WeChat : S'active quand on clique sur le bouton Share
  onShareAppMessage() {
    return {
      // ✏️ Le titre de la bulle dans la conversation
      title: this.data.detail.titre,
      // ✏️ La page où l'ami va atterrir quand il clique (avec l'ID en paramètre)
      path: `/pages/detail/index?id=${this.data.detail.id}`,
      // ✏️ L'image qui s'affiche dans la bulle
      imageUrl: this.data.detail.imageUrl
    };
  }
});
```

### Dans le `index.wxml`
```xml
<!-- 🔒 open-type="share" est OBLIGATOIRE pour déclencher le partage WeChat -->
<button open-type="share" class="btn-partager">
  Envoyer à un ami 📤
</button>
```

---

## 🟢 Recette 12 : Onglets (Tabs) avec Changement de Données

**Quand l'utiliser ?** Un menu à onglets ("En cours" / "Terminé" / "Annulé") où chaque onglet affiche des données différentes chargées depuis le serveur.

### Dans le `index.js`
```javascript
Page({
  data: {
    ongletActif: 'en_cours', // ✏️ Valeur par défaut
    onglets: [
      { id: 'en_cours', label: 'En Cours' },
      { id: 'termine', label: 'Terminé' },
      { id: 'annule', label: 'Annulé' }
    ],
    liste: [],
    uiState: 'loading'
  },

  onLoad() { this.charger('en_cours'); },

  changerOnglet(e) {
    const nouvelOnglet = e.currentTarget.dataset.id;
    if (nouvelOnglet === this.data.ongletActif) return; // Pas de double chargement
    this.setData({ ongletActif: nouvelOnglet, uiState: 'loading', liste: [] });
    this.charger(nouvelOnglet);
  },

  async charger(statut) {
    try {
      // ✏️ Votre appel API avec le filtre statut
      const liste = await monAPI.getListe({ statut });
      this.setData({ liste, uiState: liste.length ? 'content' : 'empty' });
    } catch (e) {
      this.setData({ uiState: 'error' });
    }
  }
});
```

### Dans le `index.wxml`
```xml
<!-- Les boutons des onglets -->
<view class="tabs-bar">
  <view
    wx:for="{{onglets}}" wx:key="id"
    class="tab {{ongletActif === item.id ? 'tab--actif' : ''}}"
    bindtap="changerOnglet"
    data-id="{{item.id}}">
    {{item.label}}
  </view>
</view>

<!-- Le contenu -->
<view wx:if="{{uiState === 'loading'}}" class="skeleton animate-pulse" />
<view wx:elif="{{uiState === 'content'}}" class="animate-fade-in">
  <view wx:for="{{liste}}" wx:key="id">
    <text>{{item.titre}}</text>
  </view>
</view>
<view wx:elif="{{uiState === 'empty'}}"><text>Aucun élément.</text></view>
```

---

## 🟢 Recette 13 : Cache Local (Données Hors Ligne)

**Quand l'utiliser ?** Vous voulez que l'application affiche des données même sans réseau. On affiche d'abord le cache, puis on met à jour depuis le serveur en arrière-plan.

### Dans le `index.js`
```javascript
const CLE_CACHE = 'cache_ma_liste'; // ✏️ Changez ce nom

Page({
  data: { liste: [], uiState: 'loading' },

  async onLoad() {
    // 🔒 ÉTAPE 1 : Afficher le cache immédiatement (zéro attente)
    const cache = wx.getStorageSync(CLE_CACHE);
    if (cache) {
      this.setData({ liste: cache, uiState: 'content' });
    }

    // 🔒 ÉTAPE 2 : Mettre à jour depuis le serveur en arrière-plan
    try {
      const fraîches = await monAPI.getListe();
      // Mettre à jour seulement si les données ont changé
      if (JSON.stringify(fraîches) !== JSON.stringify(this.data.liste)) {
        this.setData({ liste: fraîches });
        // 🔒 Sauvegarder le nouveau cache pour la prochaine visite
        wx.setStorageSync(CLE_CACHE, fraîches);
      }
    } catch (e) {
      // Pas grave si le réseau échoue : le cache est déjà affiché
      if (!cache) this.setData({ uiState: 'error' });
    }
  }
});
```
