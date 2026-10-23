> 🔗 **Navigation :** [Guide UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API](DOC_API_POUR_DEVELOPPEURS.md) | [Guide Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Guide Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Guide Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes Situations](DOC_RECETTES_COPIER_COLLER.md)

---

# 🚀 Le Guide Ultra-Simple : Faire Communiquer les Composants

Trouvez votre contexte ci-dessous, copiez le code, changez les mots entre `[CROCHETS]`, et votre application fonctionnera sans bug.

---

## 🛠️ OUTIL 1 : `triggerEvent` (Le voisin direct)
*Règle : Uniquement entre un Composant et la Page qui l'affiche dans son HTML.*

### 🎯 Contexte 1 : Une Barre de Recherche Custom
*Vous avez créé un composant barre de recherche. Quand l'utilisateur tape "Dakar", la page doit lancer la recherche.*

**Dans le Composant (`components/search-bar/index.js`) :**
```javascript
methods: {
  onInput(e) {
    const texte = e.detail.value;
    // ✏️ L'enfant crie "recherche_lancee"
    this.triggerEvent('recherche_lancee', { motCle: texte });
  }
}
```
**Dans la Page (`pages/accueil/index.wxml` & `.js`) :**
```xml
<!-- ✏️ La page écoute le cri -->
<search-bar bind:recherche_lancee="faireLaRecherche" />
```
```javascript
faireLaRecherche(e) {
  const texteRecu = e.detail.motCle;
  console.log("Je lance l'API avec :", texteRecu);
}
```

### 🎯 Contexte 2 : Bouton "Supprimer" dans une Carte Produit
*Vous avez une liste de cartes. Quand on clique sur la corbeille d'une carte, la page doit savoir LAQUELLE supprimer.*

**Dans le Composant (`components/carte-produit/index.js`) :**
```javascript
properties: { idProduit: Number },
methods: {
  auClicCorbeille() {
    this.triggerEvent('demande_suppression', { id: this.properties.idProduit });
  }
}
```
**Dans la Page (`pages/panier/index.wxml` & `.js`) :**
```xml
<carte-produit idProduit="{{105}}" bind:demande_suppression="supprimerItem" />
```
```javascript
supprimerItem(e) {
  const id = e.detail.id;
  // Code pour supprimer l'item 105
}
```

### 🎯 Contexte 3 : Un Pop-up Custom (Modal de Confirmation)
*Le pop-up est un composant qui attend qu'on clique sur "Oui" ou "Non".*

**Dans le Composant (`components/modal-confirm/index.js`) :**
```javascript
methods: {
  clicOui() { this.triggerEvent('reponse', { confirme: true }); },
  clicNon() { this.triggerEvent('reponse', { confirme: false }); }
}
```
**Dans la Page (`pages/paiement/index.wxml` & `.js`) :**
```xml
<modal-confirm bind:reponse="gererConfirmation" />
```
```javascript
gererConfirmation(e) {
  if (e.detail.confirme) {
    // Lancer le paiement
  }
}
```

---

## 📻 OUTIL 2 : `Bus.emit` / `Bus.on` (Le Talkie-Walkie)
*Règle : Pour lancer une ACTION entre deux pages éloignées.*

### 🎯 Contexte 1 : Rafraîchir une liste après un ajout
*Page A = Liste des vols. Page B = Formulaire d'ajout. J'ajoute un vol sur la Page B, je fais "Retour", la Page A doit se rafraîchir seule.*

**Page A (Celle qui écoute) :**
```javascript
onLoad() {
  Bus.on('RECHARGER_VOLS', this.chargerVols, this);
},
onUnload() { // 🔒 VITAL : Toujours éteindre le talkie-walkie
  Bus.off('RECHARGER_VOLS', this.chargerVols, this);
},
chargerVols() { /* Appel API */ }
```
**Page B (Celle qui crie) :**
```javascript
apresAjoutReussi() {
  Bus.emit('RECHARGER_VOLS');
  wx.navigateBack();
}
```

### 🎯 Contexte 2 : Déconnexion Forcée (Token expiré)
*Peu importe où l'utilisateur se trouve, si le serveur dit "Token Expiré", l'App doit le renvoyer à l'accueil.*

**Dans le Fichier Global (`app.js`) :**
```javascript
onLaunch() {
  Bus.on('DECONNEXION_GLOBALE', () => {
    wx.reLaunch({ url: '/pages/login/index' });
  });
}
```
**Dans le Fichier API (`utils/apis/http.js`) :**
```javascript
if (erreurServeur === 401) {
  Bus.emit('DECONNEXION_GLOBALE');
}
```

### 🎯 Contexte 3 : Appliquer des Filtres depuis une Page Séparée
*Page A = Résultats de recherche. Page B = Page pleine de filtres (Prix, Dates). Je valide sur Page B, Page A applique les filtres.*

**Page A (Résultats) :**
```javascript
onLoad() { Bus.on('NOUVEAUX_FILTRES', this.appliquerFiltres, this); },
onUnload() { Bus.off('NOUVEAUX_FILTRES', this.appliquerFiltres, this); },
appliquerFiltres(data) {
  console.log("Prix max :", data.prixMax);
}
```
**Page B (Filtres) :**
```javascript
validerFiltres() {
  Bus.emit('NOUVEAUX_FILTRES', { prixMax: 50000 });
  wx.navigateBack();
}
```

---

## 🌍 OUTIL 3 : `Bus.setState` / `Bus.onState` (Le Tableau d'Affichage)
*Règle : Pour partager de la DONNÉE vivante à travers toute l'application.*

### 🎯 Contexte 1 : Le Compteur du Panier
*Une petite pastille rouge sur la NavBar indique combien d'items sont dans le panier. N'importe quel bouton de l'app peut augmenter ce nombre.*

**Composant partagé (`components/navbar/index.js`) :**
```javascript
lifetimes: {
  attached() {
    Bus.onState('compteur_panier', (valeur) => this.setData({ pastille: valeur }), this);
  },
  detached() { Bus.offState('compteur_panier', this); }
}
```
**N'importe quelle Page (`pages/produit/index.js`) :**
```javascript
ajouterAuPanier() {
  // On met à jour le tableau central, la NavBar se mettra à jour toute seule !
  Bus.setState('compteur_panier', 5); 
}
```

### 🎯 Contexte 2 : Les Infos du Profil Utilisateur
*Quand on modifie son avatar dans les paramètres, il doit changer partout (Menu, Accueil, etc).*

**Sur toutes les pages/composants qui affichent l'avatar :**
```javascript
attached() { // ou onLoad()
  Bus.onState('user.profil', (profil) => this.setData({ avatar: profil.image }), this);
}
```
**Sur la page de modification de profil (`pages/parametres/index.js`) :**
```javascript
apresUploadImage(nouvelleImage) {
  // Boom ! Toutes les pages se mettent à jour instantanément
  Bus.setState('user.profil', { image: nouvelleImage });
}
```

### 🎯 Contexte 3 : Thème Sombre / Langue de l'App (i18n)
*Changer de langue en un clic sans recharger l'application.*

**Page ou Composant (qui écoute le changement) :**
```javascript
onLoad() {
  Bus.onState('app.langue', (langue) => {
    // Si la langue change, on force le WXML à se redessiner
    this.setData({ langue_actuelle: langue }); 
  }, this);
}
```
**Page Paramètres (qui change la langue) :**
```javascript
clicPasserEnAnglais() {
  Bus.setState('app.langue', 'en');
}
```

