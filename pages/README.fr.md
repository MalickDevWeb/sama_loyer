# SAMA LOGEMENT — Architecture des Pages

Ce dossier regroupe l'ensemble des écrans du Mini-Programme WeChat **SAMA LOGEMENT**, structuré en deux modules étanches et symétriques : **Client (Locataire)** et **Bailleur (Propriétaire)**.

---

## 📁 Structure Générale

Chaque écran dispose de son propre sous-dossier dédié contenant son quadruplet WeChat standard (`.js`, `.json`, `.wxml`, `.wxss`) :

```
pages/
├── client/                      # Module Locataire (Client)
│   ├── home/                    # Accueil : Recherche écrite & vocale IA (Wolof/FR), 3 recs
│   ├── search/                  # Résultats de recherche filtrables & carte
│   ├── logement-detail/         # Fiche détaillée logement (photos, caution, visite)
│   ├── loyers/                  # Mon loyer : synthèse, quittance certifiée, paiement
│   ├── visites/                 # Suivi des visites confirmées, passées, annulées
│   ├── demande-visite/          # Prise de rendez-vous avec choix de créneau
│   ├── messages/                # Boîte de réception messagerie
│   ├── chat/                    # Messagerie instantanée & lien WhatsApp
│   ├── favoris/                 # Logements enregistrés en favoris
│   └── profile/                 # Profil locataire & bascule vers Espace Bailleur
│
└── bailleur/                    # Module Propriétaire (Bailleur)
    ├── home/                    # Dashboard bailleur : KPIs, actions rapides, alertes
    ├── annonces/                # Gestion des logements loués & disponibles
    ├── ajouter/                 # Formulaire d'ajout de logement avec upload photos
    ├── demandes/                # Demandes de visite & candidatures reçues
    ├── locataires/              # Mes locataires : loyers reçus, retards, problèmes
    └── premium/                 # Boosts d'annonces, options visibilité & facturation
```

---

## 🧭 Navigation & TabBar

### 1. Mode Client (`tabBar` natif personnalisé)
Déclaré dans `app.json` sous `tabBar.list` (5 onglets max WeChat) :
1. **Chercher** (`pages/client/home/home`) — Navigation via `wx.switchTab`
2. **Mon loyer** (`pages/client/loyers/loyers`) — Badge notifications loyers dus (`2`)
3. **Visites** (`pages/client/visites/visites`) — Gestion des visites
4. **Messages** (`pages/client/messages/messages`) — Badge messages non lus (`3`)
5. **Profil** (`pages/client/profile/profile`) — Profil & switch rôle

> [!IMPORTANT]
> Les onglets clients déclarés dans `app.json` **doivent impérativement** être ouverts avec `wx.switchTab({ url })`. Les appels `wx.navigateTo` ou `wx.redirectTo` vers ces pages sont bloqués par le runtime WeChat.

### 2. Mode Bailleur (`custom-tab-bar` virtuel)
Intégré via le composant `<app-custom-tab-bar activeTab="..." />` :
1. **Accueil** (`pages/bailleur/home/home`)
2. **Annonces** (`pages/bailleur/annonces/annonces`)
3. **Ajouter (+)** (`pages/bailleur/ajouter/ajouter`) — Bouton d'action central rose surélevé
4. **Locataires** (`pages/bailleur/locataires/locataires`) — Badge retards/alertes (`2`)
5. **Messages** (`pages/bailleur/demandes/demandes`) — Badge candidatures (`4`)

> [!NOTE]
> Les pages bailleur hors `tabBar.list` sont ouvertes automatiquement par le routeur intelligent de `components/ui/tab-bar/index.js` via `wx.redirectTo({ url })`.

---

## 🎨 Design System & Couleurs de Marque

| Nom | Hex | Rôle |
|---|---|---|
| **Berry (Rose framboise)** | `#C8235F` | Couleur primaire d'action, accents, badges |
| **Deep Navy (Bleu nuit)** | `#0F1E3D` | Textes principaux, titres, fonds sombres KPIs |
| **Mint Green (Vert menthe)** | `#007C3D` / `#E2F0EA` | Succès, statuts payés, validation officielle |
| **Warning Amber (Jaune)** | `#D97706` / `#FEF9C3` | Alertes, à confirmer, signalements |
| **Soft Red (Rouge)** | `#DC2626` / `#FEE2E2` | Retards de loyer, actions de contestation |
