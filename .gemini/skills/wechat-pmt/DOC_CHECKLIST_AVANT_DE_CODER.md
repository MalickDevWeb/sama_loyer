> 🔗 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# ✅ La Checklist : Les Questions à Se Poser AVANT de Coder

Avant d'écrire **une seule ligne de code**, répondez à ces 8 questions dans l'ordre.
Chaque réponse vous dit exactement quoi faire et quel guide ouvrir.

> **Le principe :** Un pilote d'avion ne décolle jamais sans vérifier sa checklist. Vous non plus.

---

## ❓ Question 1 : Est-ce une PAGE ou un COMPOSANT ?

| Je crée... | Réponse | Fichier à créer dans... |
|---|---|---|
| Un écran complet (Accueil, Profil, Panier...) | 📄 **Page** | `pages/[mon-ecran]/` |
| Un élément réutilisable (Bouton, Carte, Modal...) | 🧩 **Composant** | `components/[mon-element]/` |

**➡️ Guide à ouvrir :** [`DOC_UI_POUR_DEVELOPPEURS.md`](DOC_UI_POUR_DEVELOPPEURS.md) → Option A (Page) ou Option B (Composant)

---

## ❓ Question 2 : Quels sont les ÉTATS possibles de mon écran ?

Listez tous les états que l'utilisateur peut voir. **Minimum requis : 3 états.**

| État | Quand ? |
|---|---|
| `loading` | Pendant le chargement des données |
| `content` | Quand les données sont affichées |
| `empty` | Quand il n'y a aucune donnée |
| `error` | Quand le réseau ou le serveur a un problème |
| `success` | Après une action réussie (formulaire soumis) |

**➡️ Action :** Dans votre `.js`, définissez `uiState: 'loading'` et un `wx:if/wx:elif` par état.

---

## ❓ Question 3 : Y a-t-il des données qui viennent du SERVEUR ?

```
OUI → Je dois créer un Mappeur + une méthode API
NON → Je travaille avec des données Mock (fausses données locales)
```

**Si OUI :**
1. Le fichier API de ce domaine existe ? (`utils/apis/user.api.js`...)
   - **OUI** → J'ajoute ma méthode dans ce fichier existant.
   - **NON** → Je crée `utils/apis/[mondomaine].api.js`.
2. Le mappeur de ce domaine existe ? (`utils/mappers/user.js`...)
   - **OUI** → J'ajoute mon schéma dans ce fichier existant.
   - **NON** → Je crée `utils/mappers/[mondomaine].js`.

**➡️ Guide à ouvrir :** [`DOC_API_POUR_DEVELOPPEURS.md`](DOC_API_POUR_DEVELOPPEURS.md)

---

## ❓ Question 4 : Est-ce que ma SITUATION ressemble à une Recette existante ?

| Si mon besoin ressemble à... | Recette à utiliser |
|---|---|
| Afficher une liste depuis le serveur | Recette 1 (Liste + Scroll Infini) |
| Soumettre un formulaire | Recette 2 (Formulaire + Validation) |
| Afficher le détail d'un élément | Recette 3 (Page de Détail) |
| Choisir et envoyer une photo | Recette 4 (Upload Photo) |
| Filtrer depuis une page séparée | Recette 5 (Filtres) |
| Un compteur visible partout | Recette 6 (Compteur Partagé) |
| Page de connexion | Recette 7 (Login) |
| Tirer vers le bas pour recharger | Recette 8 (Pull-to-Refresh) |
| Barre de recherche intelligente | Recette 9 (Recherche Debounce) |
| Bouton Favori / Like | Recette 10 (Favori Toggle) |
| Bouton "Envoyer à un ami" | Recette 11 (Partage WeChat) |
| Menu à onglets | Recette 12 (Tabs) |
| Afficher sans réseau | Recette 13 (Cache Local) |

**➡️ Guide à ouvrir :** [`DOC_RECETTES_COPIER_COLLER.md`](DOC_RECETTES_COPIER_COLLER.md)

---

## ❓ Question 5 : Est-ce que mon composant doit COMMUNIQUER avec quelqu'un ?

**Posez-vous UNE seule question et suivez la flèche :**

```
Est-ce que mon composant <xxx> est directement dans le HTML de ma page ?
        │
        ├── OUI ──► 🎯 triggerEvent
        │           L'enfant "crie" un événement à sa page parent.
        │           Ex: <ma-carte bind:supprime="onSupprime">
        │
        └── NON ──► Est-ce que je partage une DONNÉE que tout le monde doit voir ?
                    (Panier, Profil, Thème, Langue...)
                        │
                        ├── OUI ──► 🌍 Bus.setState / Bus.onState
                        │           Tableau d'affichage global.
                        │           Ex: Compteur panier sur toutes les pages.
                        │
                        └── NON ──► 📻 Bus.emit / Bus.on
                                    Talkie-walkie entre deux pages.
                                    Ex: Page B dit à Page A de se recharger.
```

**Le test rapide en 3 secondes :**

| Je me demande... | L'outil |
|---|---|
| *"Mon composant `<carte>` est dans mon HTML, je veux envoyer un ID à ma page"* | `triggerEvent` |
| *"La Page Détail doit dire à la Page Liste de se recharger"* | `Bus.emit` |
| *"Le compteur du panier doit changer sur TOUTES les pages"* | `Bus.setState` |

**➡️ Exemples prêts à copier :** [`DOC_COMMUNICATION_EVENEMENTS.md`](DOC_COMMUNICATION_EVENEMENTS.md)

---

## ❓ Question 6 : Y a-t-il des données à FORMATER pour l'affichage ?

```
Prix, devises → WXS formatPrix()
Dates         → WXS formatDate()
Statuts 0/1/2 → WXS formatStatut()
Calculs (TVA) → Helper JS dans utils/helpers/
```

**⚠️ Règle absolue :** Jamais `setData({ prixFormate: "15 000 FCFA" })` dans le `.js`.
Toujours `{{ f.formatPrix(item.prix) }}` dans le `.wxml`.

**➡️ Guide à ouvrir :** [`DOC_DONNEES_MAPPERS_HELPERS.md`](DOC_DONNEES_MAPPERS_HELPERS.md)

---

## ❓ Question 7 : Est-ce que je dois ajouter une ANIMATION ?

**Décrivez ce qui se passe visuellement, la classe se trouve dans la flèche :**

```
Quelque chose APPARAÎT ?
    ├── Depuis le bas (tiroir, pop-up)   ──► .animate-slide-up
    ├── Depuis la droite (étape wizard)  ──► .animate-slide-left
    ├── Victoire / Confirmation          ──► .animate-bounce-in
    └── Apparition normale               ──► .animate-fade-in

Quelque chose ATTEND (chargement) ?
    └── Blocs gris clignotants           ──► .skeleton-box + .animate-pulse
```

**Table des classes (à mettre dans `app.wxss`) :**

| Classe | Effet | Situation |
|---|---|---|
| `.animate-fade-in` | Fondu | Contenu chargé, liste affichée |
| `.animate-slide-up` | Monte du bas | Tiroir, Bottom Sheet, pop-up |
| `.animate-slide-left` | Vient de droite | Étape suivante (Wizard) |
| `.animate-bounce-in` | Rebond | Écran de succès |
| `.skeleton-box` | Bloc gris clignotant | Chargement initial |

**➡️ CSS Complet à copier :** [`DOC_FLUX_COMPLEXES_ANIMATIONS.md`](DOC_FLUX_COMPLEXES_ANIMATIONS.md)

---

## ❓ Question 8 : Ai-je vérifié les RÈGLES ANTI-CONFLIT ?

```
☐ Je travaille UNIQUEMENT dans le dossier de MA page / MON composant
☐ Je ne modifie PAS app.js, app.wxss sans autorisation explicite
☐ Je ne touche PAS aux fichiers des autres développeurs
☐ Mon nouveau endpoint est UNIQUEMENT dans mon fichier .api.js
☐ Mon nouveau schema est UNIQUEMENT dans mon fichier utils/mappers/
☐ J'ai exporté ma classe API dans utils/apis/index.js
```

---

## 🚀 Le Parcours Complet d'un Développeur

```
1. ANALYSER   → Répondre aux 8 questions (5 minutes)
2. TROUVER    → Copier la recette qui correspond
3. CRÉER      → Créer les 4 fichiers (.js .wxml .wxss .json)
4. MOCKER     → Fausses données + tous les uiState définis
5. CONSTRUIRE → WXML + CSS + animations
6. CONNECTER  → Brancher l'API quand le design est validé
7. TESTER     → dd() + Remontée de Chaîne si bug
8. LIVRER     → git add / commit / push
```

---

## 🤖 Le Prompt IA Magique (Obtenez un Plan Parfait en 30 Secondes)

**Comment ça marche :** Répondez aux questions ci-dessous, copiez-collez dans votre chat avec l'IA, et elle génère le code parfait en respectant toute l'architecture.

```
Je veux coder une nouvelle fonctionnalité.
Lis le .cursorrules de ce projet et génère-moi le code. Voici mes réponses :

1. TYPE : [Page / Composant]
   Dossier : [pages/mon-ecran/ OU components/mon-element/]

2. ÉTATS : [loading, content, empty, error, success - indiquez lesquels]
   État initial : [loading / content]

3. DONNÉES DU SERVEUR : [OUI / NON]
   Si OUI :
   - URL : [GET /api/v1/ma-route]
   - Méthode HTTP : [GET / POST / PUT / DELETE]
   - Fichier API à utiliser : [utils/apis/xxx.api.js - existant OU nouveau]

4. RECETTE : [Recette N° ... / Aucune]

5. COMMUNICATION : [triggerEvent / Bus.emit / Bus.setState / Aucune]
   Détail : [Décrivez en 1 phrase ce qui doit se passer]

6. FORMATAGE : [OUI / NON]
   Si OUI : [prix FCFA / dates / statuts 0-1-2]

7. ANIMATIONS : [fade-in / slide-up / slide-left / bounce-in / skeleton / aucune]

8. FICHIERS AUTORISÉS :
   - Autorisation : [listez les dossiers que vous pouvez modifier]
   - Interdit : [listez les fichiers partagés à ne PAS toucher]

@UI-MOCK [OU @API-CONNECT OU @FULL-FEATURE]
```

**Exemple concret prêt à copier et adapter :**

```
Je veux coder une nouvelle fonctionnalité.
Lis le .cursorrules et génère le code.

1. TYPE : Page
   Dossier : pages/mes-vols/

2. ÉTATS : loading, content, empty, error
   État initial : loading

3. DONNÉES DU SERVEUR : OUI
   URL : GET /api/v1/flights/my-bookings
   Méthode : GET
   Fichier API : utils/apis/flight.api.js (existant, ajouter UNE méthode)

4. RECETTE : Recette 1 (Liste + Scroll Infini)

5. COMMUNICATION : Bus.emit
   Détail : Si l'utilisateur annule un vol, la liste se recharge

6. FORMATAGE : OUI — prix en FCFA, dates en français

7. ANIMATIONS : skeleton pendant le chargement, fade-in pour la liste

8. FICHIERS AUTORISÉS :
   - Autorisés : pages/mes-vols/, utils/apis/flight.api.js, utils/mappers/flight.js
   - Interdit : app.js, pages/accueil/, components/navbar/

@UI-MOCK
```
