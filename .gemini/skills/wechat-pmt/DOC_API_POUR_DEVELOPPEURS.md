> 🔗 **Navigation :** [Guide UI (Pages & Composants)](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API (Réseau)](DOC_API_POUR_DEVELOPPEURS.md) | [Guide Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Guide Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Guide Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes Situations](DOC_RECETTES_COPIER_COLLER.md) & Flux](DOC_FLUX_COMPLEXES_ANIMATIONS.md)

---

# 🚀 Le Guide Ultra-Simple : Ajouter une API (Même pour les non-codeurs)

Si vous lisez ceci, vous avez pour mission d'ajouter une nouvelle connexion au serveur (un "Endpoint"). Pas de panique. Considérez cela comme un jeu de Lego. Il y a 3 pièces à assembler, toujours dans le même ordre.

**La Règle d'or :** 
- 🔒 **Ce qui est écrit normalement** = NE TOUCHEZ PAS (C'est le moteur de l'application).
- ✏️ **Ce qui est entre `[CROCHETS]`** = REMPLACEZ-LE par vos mots.

---

## 🧩 PIÈCE 1 : Le Filtre (Le Mappeur)
**Où aller ?** Ouvrez le dossier `utils/mappers/` et choisissez votre fichier (ex: `vols.js`, `utilisateurs.js`).

**Pourquoi ?** Le serveur nous envoie beaucoup de données inutiles. Le "Mappeur" est un filtre. Il attrape la donnée du serveur (`@link.xyz`) et lui donne un nom propre pour notre application.

**Le code à copier-coller :**
```javascript
// ✏️ Remplacez [NOM_DU_SCHEMA] (ex: ProfilUtilisateurSchema)
export const [NOM_DU_SCHEMA] = {
  
  // ✏️ À GAUCHE : Le nom que vous voulez utiliser dans votre page
  // ✏️ À DROITE : Le chemin exact de la donnée envoyée par le serveur
  [MON_CHAMP_1]: "@link.[CHEMIN_DU_SERVEUR_1]",
  [MON_CHAMP_2]: "@link.[CHEMIN_DU_SERVEUR_2]",
  
  // Exemple concret :
  // prenom: "@link.first_name",
  // prix: "@link.amount::number",   <-- Ajoutez ::number si c'est un prix
  // actif: "@link.is_active::boolean" <-- Ajoutez ::boolean si c'est vrai/faux
};
```
⚠️ *Attention : N'oubliez pas les virgules `,` à la fin de chaque ligne !*

---

## 🧩 PIÈCE 2 : Le Livreur (L'API)
**Où aller ?** Ouvrez le dossier `utils/apis/` et choisissez votre fichier (ex: `user.api.js`).

**Pourquoi ?** C'est le livreur qui va chercher les données sur le serveur (avec la bonne URL) et qui les passe à notre Filtre (Pièce 1) avant de nous les donner.

**Le code à copier-coller :**
```javascript
// 1. Dites où est le serveur (URL)
const ENDPOINTS = {
  // ✏️ Remplacez [NOM_URL] et [LE_CHEMIN_DU_SERVEUR] (ex: GET_PROFIL: '/api/v1/profil')
  [NOM_URL]: '[LE_CHEMIN_DU_SERVEUR]' 
};

class MonApi {
  
  // ✏️ Remplacez [NOM_DE_LA_FONCTION] (ex: chargerProfil)
  async [NOM_DE_LA_FONCTION](parametres) {
    
    // 🔒 NE TOUCHEZ PAS : Ça gère la sécurité tout seul
    await authenticate(); 
    
    // 🔒 NE TOUCHEZ PAS : Le livreur va chercher les données
    const res = await httpClient.get(ENDPOINTS.[NOM_URL], { query: parametres });
    
    // 🔒 NE TOUCHEZ PAS : Gestion des pannes du serveur
    if (!res.success) throw new Error(res.error?.message || "Erreur réseau");
    
    // 🔒 NE TOUCHEZ PAS au sculpt.data
    return sculpt.data({ data: res.data, to: [NOM_DU_SCHEMA] });
  }
}

// 🔒 EXPORT OBLIGATOIRE :
export const monAPI = new MonApi();
```

> ⚠️ **LE HUB CENTRAL (TRES IMPORTANT)**  
> Pour que le reste de l'application puisse utiliser votre API, vous devez l'enregistrer dans le Hub !  
> Ouvrez `utils/apis/index.js` et ajoutez :  
> `export { monAPI } from './votre_fichier.api.js';`

---

## 🧩 PIÈCE 3 : L'Écran (La Page ou le Composant)
**Où aller ?** Ouvrez le dossier de votre page (ex: `pages/mon-profil/index.js`).

**Pourquoi ?** C'est ce que voit l'utilisateur. On affiche un chargement, on appelle le livreur, et on affiche le résultat.

**Le code à copier-coller (dans votre objet Page) :**
```javascript
import { monAPI } from '../../utils/apis/index.js';

Page({
  data: {
    // 🔒 Machine à états
    uiState: 'loading', 
    [MA_VARIABLE_POUR_L_ECRAN]: null 
  },

  async [NOM_DE_L_ACTION]() {
    
    this.setData({ uiState: 'loading' }); 
    
    try {
      // ✏️ On appelle notre Livreur (PIÈCE 2)
      const resultat = await monAPI.[NOM_DE_LA_FONCTION]();
      
      // ✏️ On sauvegarde le résultat pour l'afficher à l'écran
      this.setData({ 
        [MA_VARIABLE_POUR_L_ECRAN]: resultat,
        uiState: 'content'
      });
      
    } catch (erreur) {
      this.setData({ uiState: 'error' });
      wx.showToast({ title: erreur.message, icon: 'none' });
    }
  }
});
```

---

## 💡 Résumé des 3 questions à se poser (Anti-Bug) :
1. **Mon URL est-elle bonne ?** (Vérifiez dans la *PIÈCE 2*)
2. **Ai-je bien enregistré mon API dans le Hub ?** (`utils/apis/index.js`)
3. **Le nom de mes champs correspond-il à ce qu'envoie le serveur ?** (Vérifiez `@link.mon_champ` dans la *PIÈCE 1*)

Si les 3 cases sont cochées, votre code fonctionne ! 🎉
