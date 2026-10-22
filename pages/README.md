# SAMA LOYER — Pages Architecture

This directory contains all screens for the WeChat Mini-Program **SAMA LOYER**, organized into two sealed and symmetric modules: **Client (Tenant)** and **Bailleur (Landlord)**.

---

## 📁 Directory Structure

Every screen has its dedicated directory containing the standard WeChat quadruplet (`.js`, `.json`, `.wxml`, `.wxss`):

```
pages/
├── client/                      # Tenant module (Client)
│   ├── home/                    # Home: written & AI voice search (Wolof/FR), 3 recommendations
│   ├── search/                  # Search results with filters & map view
│   ├── logement-detail/         # Property detail sheet (photos, deposit, visits)
│   ├── loyers/                  # My Rent: rent summary, certified receipt, OM/Wave payment
│   ├── visites/                 # Visit tracking (confirmed, past, canceled)
│   ├── demande-visite/          # Book visit schedule slot
│   ├── messages/                # Inbox conversations
│   ├── chat/                    # Real-time chat & WhatsApp action
│   ├── favoris/                 # Saved favorite listings
│   └── profile/                 # Tenant profile & switcher to Landlord mode
│
└── bailleur/                    # Landlord module (Bailleur)
    ├── home/                    # Landlord dashboard: KPIs, alerts, quick actions
    ├── annonces/                # Property management (rented & available)
    ├── ajouter/                 # Add property form with photo uploads
    ├── demandes/                # Visit requests & applications
    ├── locataires/              # My Tenants: rent received, arrears, reported issues
    └── premium/                 # Boost listing, visibility options & billing
```

---

## 🧭 Navigation & TabBar

### 1. Client Mode (Native Custom TabBar)
Declared in `app.json` under `tabBar.list` (5 native tabs):
1. **Chercher** (`pages/client/home/home`) — Navigated via `wx.switchTab`
2. **Mon loyer** (`pages/client/loyers/loyers`) — Due rent badge (`2`)
3. **Visites** (`pages/client/visites/visites`) — Visit management
4. **Messages** (`pages/client/messages/messages`) — Unread message badge (`3`)
5. **Profil** (`pages/client/profile/profile`) — Profile & mode switch

### 2. Landlord Mode (Virtual Custom TabBar)
Embedded using `<app-custom-tab-bar activeTab="..." />`:
1. **Accueil** (`pages/bailleur/home/home`)
2. **Annonces** (`pages/bailleur/annonces/annonces`)
3. **Ajouter (+)** (`pages/bailleur/ajouter/ajouter`) — Raised central pink action button
4. **Locataires** (`pages/bailleur/locataires/locataires`) — Arrears/alerts badge (`2`)
5. **Messages** (`pages/bailleur/demandes/demandes`) — Applications badge (`4`)
