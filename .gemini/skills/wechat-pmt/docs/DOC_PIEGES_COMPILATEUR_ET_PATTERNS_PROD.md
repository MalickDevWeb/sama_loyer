> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [SDK Max It Sonatel](DOC_MAXIT_MINI_SDK_SONATEL.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Navigation & Behaviors](DOC_NAVIGATION_BEHAVIORS_ET_METIER.md) | [Pièges Compilateur & Prod](DOC_PIEGES_COMPILATEUR_ET_PATTERNS_PROD.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 🛠️ Guide Ultime : Pièges du Compilateur TCMPP, Robustesse & Collaboration d'Équipe

> **Origine & Éprouvé en Production :** Synthèse exhaustive des audits techniques et des résolutions de bugs menées sur l'ensemble des projets ATS Explore (`ats-app`, `mp-ats-app`).  
> Ce document résout les pires pièges de compilation TCMPP/WeChat et formalise l'organisation d'une équipe de développeurs sans conflit Git.

---

## 🚫 1. Le Piège Fatal du BOM UTF-8 (`\uFEFF`)

### Le Problème
Sous Windows, certains éditeurs (Visual Studio, Notepad, certains plugins) enregistrent les fichiers avec un **BOM UTF-8 (Byte Order Mark)** invisible au début du fichier (`\uFEFF`).
* **Symptômes dans TCMPP / WeChat DevTools :**
  * `SyntaxError: Unexpected token ILLEGAL`
  * Erreur d'analyse JSON incompréhensible sur `app.json` ou `page.json` alors que la syntaxe est parfaite.
  * Page blanche au démarrage sans aucun message d'erreur clair.

### La Solution
Veiller à ce que l'éditeur sauvegarde en **UTF-8 sans BOM** (UTF-8 Plain). En cas de doute, nettoyer les fichiers suspects avec ce script :

```javascript
import fs from 'fs';

export function stripBOM(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`BOM supprimé avec succès de : ${filePath}`);
  }
}
```

---

## 🚫 2. Le Piège des Polices Locales `@font-face` (Erreur 404 `-do-not-use-local-path-`)

### Le Problème
Dans un fichier `.wxss`, vouloir charger une police locale comme ceci :
```css
/* ❌ INTERDIT DANS WECHAT / TCMPP */
@font-face {
  font-family: 'Inter';
  src: url('/assets/fonts/Inter-Regular.ttf');
}
```
Le compilateur WeChat/TCMPP bloque strictement les polices locales et renomme l'URL en injectant `-do-not-use-local-path-`. Résultat : **Erreur 404 permanente dans la console à chaque démarrage**.

### La Règle de Production
1. **Bannir les `@font-face` locaux.**
2. Utiliser la stack de polices système native du terminal mobile :
```css
/* ✅ RECOMMANDÉ POUR DES PERFORMANCES MAXIMALES (0 requête réseau) */
page {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
```
3. Si une typographie spécifique est contractuellement obligatoire, la charger depuis un **CDN HTTPS externe autorisé** ou l'encoder en **base64** directement dans le WXSS.

---

## 🏛️ 3. Organisation Architecture : `components/ui/` vs `components/ux/`

Pour garder un projet propre à grande échelle, ATS sépare strictement la présentation pure de l'expérience d'état :

| Dossier | Rôle | Exemples |
|---|---|---|
| `components/ui/` | **Composants de présentation purs.** Reçoivent des données via `properties`, émettent des événements via `triggerEvent`. Zéro état réseau. | `button`, `card`, `input`, `destination-card`, `chip-group`. |
| `components/ux/` | **Composants d'état et d'expérience utilisateur.** Gèrent les états transitoires, les attentes et les erreurs. | `destination-card-skeleton`, `empty-state`, `network-error-banner`. |

---

## 🛡️ 4. Clauses de Garde d'Arguments (`onLoad(options)`)

Ne laissez JAMAIS une page se charger si un paramètre obligatoire est absent ou corrompu dans l'URL.

### Le Pattern de Garde Systématique :
```javascript
Page({
  onLoad(options = {}) {
    const rawId = options.id || options.destinationId;
    const id = rawId ? Number(rawId) : null;

    // 1. Contrôle de validité du paramètre
    if (!id || Number.isNaN(id)) {
      wx.showToast({
        title: 'Paramètre manquant ou invalide',
        icon: 'none',
        duration: 2000
      });
      // 🔙 Retour automatique de sécurité
      setTimeout(() => wx.navigateBack({ delta: 1 }), 1500);
      return;
    }

    // 2. Chargement des données...
    this.chargerDonnees(id);
  }
});
```

---

## 🔄 5. Bouton "Retour" Intelligent (Protection Deep Link)

### Le Problème
Quand un utilisateur clique sur le bouton retour personnalisé d'une page :
* Si l'utilisateur vient de l'accueil, `wx.navigateBack({ delta: 1 })` fonctionne.
* Mais si l'utilisateur est arrivé **directement sur cette page** via un SMS, un QR code ou un lien externe, `getCurrentPages().length === 1`. `navigateBack()` ne fait strictement rien et l'utilisateur est piégé sur l'écran !

### La Solution : Le Retour Intelligent
```javascript
handleBack() {
  const pages = getCurrentPages();
  if (pages.length > 1) {
    // Il y a un historique -> retour normal
    wx.navigateBack({ delta: 1 });
  } else {
    // Aucun historique (accès direct) -> repli sécurisé sur l'accueil
    wx.switchTab({
      url: '/pages/home/home'
    });
  }
}
```

---

## 🚫 6. Élimination du Flash "0 élément" au Chargement

### Le Problème
Quand une page de liste charge ses données depuis le serveur, l'utilisateur voit souvent pendant 300ms :
`"0 réservation"` ou `"Aucun résultat"`, puis soudainement la liste de 5 réservations apparaît. Ce clignotement fait douter de la fiabilité de l'application.

### La Règle d'Or
1. **Initialiser avec une chaîne vide** : `resultsLabel: ''` (jamais `'0 résultat'`).
2. **Ne rien afficher tant que `loading` est vrai** :
```xml
<!-- ✅ Le compteur n'apparaît QUE lorsque les données sont chargées et non vides -->
<view class="list-header" wx:if="{{ !loading && items.length > 0 }}">
  <text>{{ resultsLabel }}</text>
</view>
```
3. **Pluralisation soignée** :
```javascript
function formatCount(total) {
  if (!total) return '';
  return `${total} réservation${total > 1 ? 's' : ''}`;
}
```

---

## ⚡ 7. Anti-Clic Réutilisable Universel (`withLock`)

Au lieu d'ajouter des variables `isLocked` et des `setTimeout` dans toutes vos fonctions, utilisez une fonction d'ordre supérieur :

```javascript
/**
 * Empêche les clics répétés (anti-rebond / throttling)
 * @param {Function} fn - Fonction à exécuter
 * @param {number} [delay=500] - Délai de verrouillage en ms
 */
export function withLock(fn, delay = 500) {
  let isLocked = false;
  return function (...args) {
    if (isLocked) return;
    isLocked = true;
    setTimeout(() => {
      isLocked = false;
    }, delay);
    return fn.apply(this, args);
  };
}
```

---

## 🤝 8. Matrice d'Isolation Multi-Développeurs (Zéro Conflit Git)

Comment faire travailler **7 développeurs en même temps** sur le même mini-programme sans aucun blocage ?

1. **Chaque développeur est propriétaire d'un domaine exclusif :**
   * Dev 1 : UX & Skeletons (`components/ux/**`).
   * Dev 2 : Cartes & Listes (`components/ui/**`).
   * Dev 3 : Tunnel Réservation (`pages/booking/**`).
   * Dev 4 : Détail & Annulation (`pages/reservation-detail/**`).
   * Dev 5 : Listing Voyages (`pages/voyage/**`).
   * Dev 6 : Favoris & Navigation (`pages/favoris/**`).
   * Dev 7 : Core & Mappers (`utils/mappers/**`, `utils/helpers/**`).
2. **Protocole de fusion :**
   * Les branches core ou structurelles sont mergées en premier.
   * Tous les autres développeurs rebasent (`git pull origin develop`).
   * Le merge final s'effectue avec **zéro conflit**.

