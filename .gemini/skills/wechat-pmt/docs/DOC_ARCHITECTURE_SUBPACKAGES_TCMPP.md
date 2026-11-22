> 🔗 **Navigation :** [Guide UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 📦 Architecture en Sous-Paquets (Subpackages TCMPP & WeChat)

Le compilateur WeChat et la plateforme TCMPP (Max It) imposent une limite stricte et non négociable : **le paquet principal (`root`) ne doit jamais dépasser 2 Mo**.  
Dès qu'une application dépasse 5 à 6 écrans, des images haute résolution ou des formulaires complexes, le déploiement échoue avec l'erreur fatale : `Main package size exceeds 2MB limit`.

Ce guide détaille l'architecture industrielle pour découper votre mini-programme en sous-paquets jusqu'à **20 Mo au total**, avec préchargement intelligent en arrière-plan.

---

## 🏛️ 1. La Règle des 2 Mo et les Limites TCMPP

| Paquet | Rôle | Taille Maximale | Que doit-il contenir ? |
|---|---|---|---|
| **Paquet Principal (`root`)** | Démarrage instantané | **2 Mo strict** | Écran d'accueil (`pages/home`), TabBar, assets globaux (`app.wxss`), helpers universels (`utils/`). |
| **Sous-Paquet A (`booking`)** | Tunnel de réservation | **2 Mo par sous-paquet** | Écrans de réservation, sélection de date, passagers, devis. |
| **Sous-Paquet B (`payment`)** | Paiement & Confirmation | **2 Mo par sous-paquet** | Écran de validation Orange Money, billet QR, reçu PDF. |
| **Sous-Paquet C (`account`)** | Espace client & Historique | **2 Mo par sous-paquet** | Liste des commandes, réclamations, profil détaillé. |
| **TOTAL APPLICATION** | Cumul de tous les paquets | **20 Mo maximum** | Permet de construire des applications riches et complexes sans contrainte. |

---

## 📐 2. Arborescence Standard d'un Projet Découpé

```text
mon-projet/
├── app.js
├── app.json                                 ← Déclare les subpackages et le preload
├── app.wxss
│
├── pages/                                   ← PAQUET PRINCIPAL (Root <= 2 Mo)
│   ├── home/                                ← Écran d'accueil obligatoire au root
│   └── explorer/                            ← Écran principal de recherche
│
├── components/                              ← COMPOSANTS PARTAGÉS (Dans le root)
│   ├── ui/
│   └── ux/
│
├── utils/                                   ← OUTILS & SERVICES (Dans le root)
│   ├── apis/
│   ├── mappers/
│   └── helpers/
│
└── subpackages/                             ← SOUS-PAQUETS INDÉPENDANTS
    ├── booking/                             ← Sous-paquet Réservation
    │   └── pages/
    │       ├── flight-detail/
    │       └── passenger-form/
    │
    ├── payment/                             ← Sous-paquet Paiement & Billet
    │   └── pages/
    │       ├── om-checkout/
    │       └── ticket-view/
    │
    └── account/                             ← Sous-paquet Espace Client
        └── pages/
            ├── history/
            └── profile/
```

---

## ⚙️ 3. Configuration dans `app.json`

### 3.1 Déclaration des `subpackages`
Dans votre fichier `app.json`, la clé `subpackages` déclare chaque sous-dossier et ses pages internes :

```json
{
  "pages": [
    "pages/home/index",
    "pages/explorer/index"
  ],
  "subpackages": [
    {
      "root": "subpackages/booking",
      "name": "booking",
      "pages": [
        "pages/flight-detail/index",
        "pages/passenger-form/index"
      ]
    },
    {
      "root": "subpackages/payment",
      "name": "payment",
      "pages": [
        "pages/om-checkout/index",
        "pages/ticket-view/index"
      ]
    },
    {
      "root": "subpackages/account",
      "name": "account",
      "pages": [
        "pages/history/index",
        "pages/profile/index"
      ]
    }
  ]
}
```

---

## ⚡ 4. Préchargement Intelligent en Arrière-Plan (`preloadRule`)

Pour que l'utilisateur ne subisse **aucun temps de chargement** lorsqu'il clique pour réserver, configurez `preloadRule` dans `app.json`.  
Dès que la page d'accueil est chargée, WeChat télécharge silencieusement le sous-paquet en tâche de fond :

```json
{
  "preloadRule": {
    "pages/home/index": {
      "network": "all",
      "packages": ["booking"]
    },
    "subpackages/booking/pages/flight-detail/index": {
      "network": "all",
      "packages": ["payment"]
    }
  }
}
```

* **`network: "all"`** : Précharge en 4G, 5G et Wi-Fi (idéal pour les parcours critiques).
* **`network: "wifi"`** : Précharge uniquement sous Wi-Fi pour économiser le forfait data de l'utilisateur.

---

## 🚫 5. Les Règles Strictes d'Isolation (Interdictions Compilateur)

1. **Un sous-paquet PEUT importer le paquet principal :**
   * ✅ `import { backendAPI } from '../../../../utils/apis/index.js';`
   * ✅ `<app-button />` déclaré depuis le paquet principal.
2. **Un sous-paquet NE PEUT PAS importer un autre sous-paquet :**
   * ❌ Interdit : La page `payment` ne peut pas importer un fichier situé dans `booking`.
   * **Solution :** Si deux sous-paquets ont besoin de la même fonction ou du même composant, déplacez-le dans `utils/` ou `components/` (paquet principal).
3. **La page d'accueil doit TOUJOURS être dans le paquet principal :**
   * ❌ Ne jamais placer la première page de démarrage dans un `subpackage`.

---

## 🧭 6. Navigation vers une Page de Sous-Paquet

La navigation vers une page de sous-paquet utilise les méthodes WeChat habituelles, en fournissant le chemin complet depuis la racine :

```javascript
import { navigateWithLock } from '../../utils/helpers/navigation.js';

// Navigation standard avec verrouillage anti-double tap
navigateWithLock(this, () => {
  wx.navigateTo({
    url: '/subpackages/booking/pages/flight-detail/index?id=450',
  });
});
```

---

## ⚡ 7. Génération Automatique via la CLI

Pour générer immédiatement une page dans un sous-paquet sans créer les dossiers à la main :

```bash
# Génère les 4 fichiers directement dans subpackages/booking/pages/flight-detail/
npm run create:page -- flight-detail --subpackage booking

# Avec pré-câblage API :
npm run create:page -- flight-detail --subpackage booking --with-api
```

---

## 🛡️ 8. Le Piège des Sous-Paquets Indépendants (`independent: true`) & Deep Links

### 8.1 Qu'est-ce qu'un Sous-Paquet Indépendant ?
WeChat permet de marquer un sous-paquet avec `"independent": true` dans `app.json` :
```json
{
  "root": "subpackages/booking",
  "name": "booking",
  "independent": true,
  "pages": [
    "pages/ticket/index"
  ]
}
```
Ce mode permet au sous-paquet de s'ouvrir en **0,2 seconde chrono** sans télécharger le paquet principal lors du scan d'un QR code physique.

### 8.2 Le Piège Fatal : `app.js` N'EST PAS EXÉCUTÉ !
En mode indépendant ou lors d'une arrivée directe par lien profond :
* **`app.js` est complètement zappé par WeChat.**
* `getApp()` ne contient ni token, ni configuration `miniSDK`, ni `Bus`.
* Tout appel à `getApp().globalData` lève un `TypeError` fatal entraînant un **écran blanc total**.

### 8.3 La Solution : Le Bootstrapper Universel (`subpackageGuard.js`)
Toute page de sous-paquet susceptible d'être ouverte directement doit être enveloppée par `createSubpackagePage` :

```javascript
// subpackages/booking/pages/ticket/index.js
import { createSubpackagePage } from '../../../../utils/helpers/subpackageGuard.js';

Page(createSubpackagePage({
  data: {
    ticketData: null
  },

  async onLoad(options) {
    // Exécuté UNIQUEMENT quand l'application globale est 100% prête
    const ticketId = options.id;
    console.log('[Billet] Chargement garanti avec token valide :', ticketId);
  }
}));
```

### 8.4 Comment Simuler et Tester dans WeChat DevTools
Pour tester la robustesse de vos sous-paquets avant la mise en production :
1. Dans WeChat DevTools, cliquez sur le menu déroulant **« Mode de compilation ordinaire »** en haut à côté du bouton Aperçu.
2. Cliquez sur **« Ajouter une condition de compilation personnalisée »** (*Add Custom Compilation*).
3. Renseignez :
   * **Chemin de démarrage :** `subpackages/booking/pages/ticket/index`
   * **Paramètres de démarrage :** `id=TK9921`
   * **Scène d'entrée :** `1011 (Scan de QR Code d'événement)` ou `1007 (Message de discussion partagé)`
4. Validez et lancez : si votre page s'affiche sans planter et récupère son token, votre sous-paquet est **100 % Production Ready**.

---

## 📋 9. Check-list de Validation Avant Homologation
- [ ] Le paquet principal (`root`) fait strictement **moins de 2 Mo**.
- [ ] Chaque sous-paquet fait individuellement **moins de 2 Mo**.
- [ ] Aucun sous-paquet n'importe de fichier depuis un autre sous-paquet (isolation stricte).
- [ ] Les pages de sous-paquet ouvertes par QR code utilisent `createSubpackagePage`.
- [ ] La règle de préchargement `preloadRule` est active sur les pages d'entrée.


