> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 🐛 Le Guide du Débogage & Comment Ajouter une Recette

Ce guide répond à deux questions essentielles :
1. **Comment déboguer proprement** quand quelque chose ne fonctionne pas.
2. **Comment ajouter une nouvelle recette** au Kit quand vous rencontrez un nouveau cas.

---

## 🔍 PARTIE 1 : Déboguer Proprement

### La Règle d'Or du Débogage
Déboguer, c'est répondre à UNE question : **"À quel endroit ma donnée n'est plus correcte ?"**

Il y a 3 niveaux dans cette architecture :
```
Serveur → [API] → [Mappeur] → [Page .js] → [WXML]
```
On remonte la chaîne, étape par étape, jusqu'à trouver le maillon cassé.

---

### 🧰 Outil 1 : Les 4 Types de `console` (À connaître par cœur)

Dans le WeChat DevTools, ouvrez l'onglet **Console**. Chaque type a une couleur différente.

```javascript
// 🔵 Info normale - pour suivre le déroulement
console.log('[MaPage] Les données reçues du serveur :', data);

// 🟡 Avertissement - quand quelque chose est bizarre mais pas cassé
console.warn('[MaPage] Le prix est null, valeur par défaut utilisée.');

// 🔴 Erreur - quand quelque chose est vraiment cassé
console.error('[MaPage] Impossible de charger la liste :', error);

// 📊 Pour inspecter un objet complexe (mieux que log pour les objets)
console.dir(monObjet);
```

**La Convention de Nommage (OBLIGATOIRE pour les équipes)**
Toujours commencer votre message par `[NomDuFichier]` pour savoir d'où vient le log.
```javascript
console.log('[user.api.js] Réponse brute du serveur :', res);
console.log('[pages/accueil] Données après Mappeur :', userPropre);
console.log('[components/navbar] Valeur du Bus :', val);
```

---

### 🛑 Outil 2 : Le `dd()` (L'Équivalent du `die()` de PHP)

En PHP, `die(var_dump($data))` arrête tout et affiche la donnée. En WeChat JavaScript, il n'existe pas nativement, mais on peut le recréer.

**Créez ce fichier une seule fois : `utils/helpers/debug.js`**
```javascript
/**
 * dd() = Dump & Die
 * Affiche la donnée dans la console et BLOQUE l'exécution.
 * À utiliser uniquement en développement, JAMAIS en production.
 */
var dd = function() {
  var args = Array.prototype.slice.call(arguments);
  console.error('=== DD() STOP ===');
  args.forEach(function(arg, index) {
    console.error('Argument ' + (index + 1) + ' :', arg);
    // Affiche en JSON pour les objets complexes
    try { console.error(JSON.stringify(arg, null, 2)); } catch(e) {}
  });
  // 🔒 STOPPE l'exécution comme un die() PHP
  throw new Error('=== DD() : Exécution stoppée volontairement. Retirez dd() avant de livrer. ===');
};

module.exports = { dd: dd };
```

**Comment l'utiliser dans votre code :**
```javascript
const { dd } = require('../../utils/helpers/debug.js');

async chargerProfil() {
  const res = await httpClient.get('/api/users/me');
  
  // 🔒 STOP ! Je veux voir exactement ce que le serveur m'envoie AVANT le mappeur
  dd(res);  // L'exécution s'arrête ici. Inspectez la console.

  const profil = sculpt.data({ data: res.data, to: UserSchema });
  this.setData({ profil }); // Cette ligne ne sera jamais atteinte tant que dd() est là
}
```

**Dans la console WeChat DevTools, vous verrez :**
```
=== DD() STOP ===
Argument 1 : { success: true, data: { user_id: 42, first_name: "Malick" } }
Error: === DD() : Exécution stoppée volontairement ===
```

---

### 🗺️ Outil 3 : La Méthode "Remontée de Chaîne" (Où est le bug ?)

Quand une donnée est incorrecte à l'écran, suivez ce protocole :

```javascript
async chargerDonnees() {
  // ─── ÉTAPE 1 : Inspecter la réponse BRUTE du serveur
  const res = await httpClient.get('/api/ma-route');
  dd(res); // ← METTEZ dd() ICI D'ABORD. Est-ce que res.data est correct ?

  // ─── ÉTAPE 2 : Si res.data est OK, déplacez dd() APRÈS le mappeur
  const donneesPropres = sculpt.data({ data: res.data, to: MonSchema });
  dd(donneesPropres); // ← EST-CE QUE LE MAPPING EST CORRECT ?

  // ─── ÉTAPE 3 : Si donneesPropres est OK, déplacez dd() DANS setData
  this.setData({ donnees: donneesPropres });
  dd(this.data.donnees); // ← EST-CE QUE setData A BIEN ENREGISTRÉ ?

  // Si tout est OK jusqu'ici, le problème est dans le WXML (le HTML).
}
```

> 💡 **Le principe :** On commence toujours depuis le début de la chaîne et on avance. Dès que `dd()` affiche quelque chose d'incorrect, on a trouvé le maillon cassé.

---

### ⚠️ Outil 4 : Le Filet de Sécurité Global (Capturer les erreurs inattendues)

Ajoutez ce code dans `app.js` pour ne jamais rater une erreur silencieuse :

```javascript
// app.js
App({
  onLaunch() {
    // 🔒 Capture TOUTES les erreurs JavaScript non gérées
    wx.onError((error) => {
      console.error('[app.js] ERREUR GLOBALE CAPTURÉE :', error);
      // En production, envoyez cette erreur à votre serveur de logs
      // errorAPI.log({ message: error, timestamp: Date.now() });
    });

    // 🔒 Capture les échecs de requêtes réseau
    wx.onUnhandledRejection((res) => {
      console.error('[app.js] PROMESSE REJETÉE (async/await sans try/catch) :', res.reason);
    });
  }
});
```

---

## 📝 PARTIE 2 : Ajouter une Nouvelle Recette au Kit

Vous rencontrez un nouveau cas qui n'est pas dans les 13 recettes ? Ajoutez-le vous-même ! Suivez ce modèle exact pour que tout le monde puisse l'utiliser.

### Le Modèle à Copier-Coller dans `DOC_RECETTES_COPIER_COLLER.md`

```markdown
## 🟢 Recette [NUMERO] : [NOM DE VOTRE SITUATION]

**Quand l'utiliser ?** [Décrivez en 1 phrase simple QUAND ce code est nécessaire.]

### [Étape 1/X] — [Nom de cette étape]
\`\`\`javascript
// ✏️ [Indiquez ce que le développeur doit changer]
// 🔒 [Indiquez ce qu'il ne faut PAS toucher]
[Votre code ici]
\`\`\`

### [Étape 2/X] — [Nom de cette étape]
\`\`\`xml
[Votre code WXML ici]
\`\`\`

### [Étape 3/X - Optionnel] — [Le CSS si nécessaire]
\`\`\`css
[Votre CSS ici]
\`\`\`
```

### Le Processus en 3 Étapes (La "Cuisine")

```
1. TESTEZ D'ABORD dans votre projet avec du vrai code.
2. Une fois que ça marche à 100%, copiez le code dans le modèle ci-dessus.
3. Ajoutez votre nouvelle recette dans le Sommaire du fichier DOC_RECETTES_COPIER_COLLER.md.
4. Faites un "git push" pour que toute l'équipe en bénéficie.
```

### 🚫 Les Règles pour une Bonne Recette (Qualité Garantie)
- ✅ Chaque recette est **complète** : elle contient tout ce dont on a besoin (JS + WXML + CSS si nécessaire).
- ✅ Les variables à changer sont **entre `[CROCHETS]`** ou précédées de `// ✏️`.
- ✅ Les lignes à **NE PAS toucher** sont précédées de `// 🔒`.
- ✅ La recette commence par **"Quand l'utiliser ?"** en une phrase simple.
- ❌ Pas de code incomplet ou qui dépend de 10 autres fichiers non expliqués.
- ❌ Pas de théorie longue. La recette parle d'elle-même.

