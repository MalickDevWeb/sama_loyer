> 🔗 **Navigation :** [Guide UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API](DOC_API_POUR_DEVELOPPEURS.md) | [Guide Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Guide Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Guide Données (Mappers & Helpers)](DOC_DONNEES_MAPPERS_HELPERS.md)

---

# 🚀 Le Guide Ultra-Simple : Mappers, json-sculpt et Helpers

Pour avoir une application indestructible, on ne donne **JAMAIS** les données brutes du backend directement à notre vue HTML. On les fait passer par une "usine de traitement".

Voici les 3 postes de l'usine :

---

## 🛡️ 1. Le Mappeur & json-sculpt (La Douane Anti-Bug)

**Le problème :** Si le backend change `first_name` en `firstName`, vos 50 pages frontend vont crasher. 
**La solution :** `json-sculpt`. Il prend la donnée sale du backend, et la transforme selon NOTRE propre moule (le Mappeur) défini dans `utils/mappers/`.

### 🎯 Contexte 1 : Le Mapping Simple (Renommer les clés)
*Vous voulez juste changer les noms compliqués du serveur en noms simples pour votre code.*

```javascript
// utils/mappers/produit.js
export const ProduitSchema = {
  // ✏️ [MON_NOM_PROPRE]: "@link.[NOM_DU_SERVEUR]"
  id: "@link.product_uid_v2",
  titre: "@link.designation_text",
};
```

### 🎯 Contexte 2 : Le Mapping Avancé (Forcer le type)
*Le serveur est mal codé, il vous envoie le prix sous forme de texte `"1500"` ou l'état sous forme de `0/1`. Vous voulez forcer de vrais Nombres et Booléens.*

```javascript
// utils/mappers/produit.js
export const ProduitAvanceSchema = {
  id: "@link.product_id",
  // 🔒 Magique : force la conversion !
  prix: "@link.price_string::number", 
  estEnPromo: "@link.is_discount::boolean", 
};
```

### 🎯 Contexte 3 : Le Mapping par Fonction (Combiner)
*Le serveur envoie le prénom et le nom séparés, ou vous voulez rajouter une valeur par défaut.*

```javascript
// utils/mappers/user.js
export const UserSchema = {
  id: "@link.id",
  // ✏️ On utilise une fonction (d = les données brutes du serveur)
  nomComplet: (d) => `${d.first_name || ''} ${d.last_name || ''}`.trim(),
  role: (d) => d.role_id === 1 ? 'Admin' : 'Client'
};
```

**Comment l'appeler dans l'API (`utils/apis/...`) ?**
```javascript
// Si c'est UN SEUL objet :
const userPropre = sculpt.data({ data: res.data, to: UserSchema });

// Si c'est un TABLEAU (une liste) :
const listePropre = sculpt.list({ data: res.data.items, to: UserSchema });
```

---

## 🧰 2. Les Helpers JS (Les Outils Logiques)

**Qu'est-ce que c'est ?** Des fonctions JavaScript pures qui font des calculs ou des vérifications. Elles vivent dans `utils/helpers/` et peuvent être importées partout.

### 🎯 Contexte 1 : Validation de Formulaire
*Vérifier si un email ou un mot de passe est valide avant de l'envoyer.*

```javascript
// utils/helpers/validators.js
export const HelpersValidation = {
  estEmailValide: (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },
  motDePasseFort: (mdp) => {
    return mdp.length >= 8;
  }
};
```

### 🎯 Contexte 2 : Calcul Métier Complexe
*Calculer la réduction totale d'un panier.*

```javascript
// utils/helpers/math.js
export const HelpersMath = {
  calculerTVA: (montantHT, taxe = 0.18) => {
    return montantHT * taxe;
  }
};
```

---

## 💄 3. Les Helpers WXS (Le Maquillage pour l'Écran)

**Règle Vitale :** Dans WeChat, le Javascript et le WXML tournent sur **deux processeurs séparés**. Si vous formatez un prix dans le JS (`this.setData({ prixFormate: "15 000 FCFA" })`), l'application ralentit. 
**La solution :** Les WXS. C'est du code qui s'exécute *directement et instantanément* sur l'écran.

### 🎯 Contexte 1 : Afficher des Prix
*Vous avez `15000` et vous voulez afficher `15 000 FCFA`.*

**Dans `utils/wxs/filters.wxs` (⚠️ Attention : Code en vieux Javascript ES5 obligatoire !)**
```javascript
// 🔒 Pas de 'const', pas de '=>', on utilise 'var' et 'function'
var formatPrix = function(prix) {
  if (!prix) return "0 FCFA";
  // Logique pour ajouter des espaces tous les 3 zéros (ES5)
  return prix.toString().replace(getRegExp('(\\d)(?=(\\d{3})+(?!\\d))', 'g'), '$1 ') + ' FCFA';
};

module.exports = { formatPrix: formatPrix };
```

**Dans votre page (`.wxml`) :**
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />
<!-- C'est ultra rapide ! -->
<text class="prix">{{ f.formatPrix(produit.prix) }}</text>
```

### 🎯 Contexte 2 : Afficher un Statut (Couleurs/Texte)
*Le serveur donne un statut `0, 1, 2`. Vous voulez afficher "En cours", "Validé", "Annulé".*

**Dans `filters.wxs` :**
```javascript
var formatStatutTexte = function(statutId) {
  if (statutId === 1) return "Validé";
  if (statutId === 2) return "Annulé";
  return "En attente";
};

var formatStatutCouleur = function(statutId) {
  if (statutId === 1) return "color-green";
  if (statutId === 2) return "color-red";
  return "color-orange";
};

module.exports = { 
  texte: formatStatutTexte, 
  couleur: formatStatutCouleur 
};
```

**Dans votre page (`.wxml`) :**
```xml
<wxs src="../../utils/wxs/filters.wxs" module="f" />
<text class="{{ f.couleur(commande.status) }}">
  {{ f.texte(commande.status) }}
</text>
```

---

### 🚨 En Résumé (Anti-Spaghetti) :
1. Le **Backend** envoie la donnée.
2. L'**API** utilise `json-sculpt` et son **Mappeur** pour créer une donnée pure.
3. La **Page** stocke cette donnée pure dans son `data`.
4. Le **WXML** utilise le **WXS** pour ajouter la jolie devise ou formater la date pour l'utilisateur.

