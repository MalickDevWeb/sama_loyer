# Couche API — SAMA LOYER

Architecture réseau, authentification OAuth2, gestion du cache et intégration des plugins natifs TCMPP / Max it.

Conforme aux principes **SOLID** et au découpage modulaire **Domain-Driven Design (DDD)**.

---

## Organisation modulaire

```text
utils/apis/
├── core/                        📁 [Socle Technique & Infrastructure]
│   ├── http.js                  # Client HTTP typé avec suivi de session & headers Max it
│   ├── auth.js                  # Authentification OAuth2 Max it (client credentials)
│   ├── cache.js                 # Cache réactif en mémoire & TTL centralisé
│   ├── response.js              # Déballage { success, data, meta } & RFC 7807
│   ├── native.js                # Bridge plugins natifs Orange Max it (wx.invokeNativePlugin)
│   └── index.js                 # Export du module core
│
├── endpoints/                   📁 [Contrats de Routage Pur]
│   ├── locataire.js             # Routes espace Locataire & Candidat (Object.freeze)
│   ├── bailleur.js              # Routes espace Bailleur & Gestion (Object.freeze)
│   ├── common.js                # Routes partagées (zones, upload, santé)
│   └── index.js                 # Registre unifié des endpoints
│
├── locataire/                   📁 [Module Domaine Locataire]
│   ├── endpoints.js             # Export local des routes locataires
│   ├── service.js               # Service métier (Logements, Loyers OM, Visites, Favoris)
│   └── index.js                 # Export du module locataire
│
├── bailleur/                    📁 [Module Domaine Bailleur]
│   ├── endpoints.js             # Export local des routes bailleurs
│   ├── service.js               # Service métier (Annonces, Dashboard, Locataires, Cash, KYC)
│   └── index.js                 # Export du module bailleur
│
├── locataire.js                 📄 [Proxy rétrocompatible vers locataire/index.js]
├── bailleur.js                  📄 [Proxy rétrocompatible vers bailleur/index.js]
└── index.js                     📄 [Façade d'accès centralisée (BackendAPI / backendAPI)]
```

---

## Responsabilités par module

| Module / Fichier | Responsabilité (SOLID / SRP) |
| :--- | :--- |
| `core/` | **Infrastructure technique** : transport HTTP, auth, cache, parsing réponses et bridge natif. |
| `endpoints/` | **Contrats de routage** : URLs et route builders immuables sans logique applicative. |
| `locataire/` | **Domaine Locataire** : catalogue, loyers Orange Money, visites et favoris. |
| `bailleur/` | **Domaine Bailleur** : annonces, dashboard KPI, gestion des locataires, caution et conformité. |
| `index.js` | **Façade** : Point d'accès centralisé rétrocompatible fédérant tous les domaines. |

---

## Exemples d'utilisation

### 1. Par module de domaine (DDD)
```javascript
// Espace Locataire
import { locataireAPI, LOCATAIRE_ENDPOINTS } from 'utils/apis/locataire/index.js';
const logements = await locataireAPI.getLogements();

// Espace Bailleur
import { bailleurAPI, BAILLEUR_ENDPOINTS } from 'utils/apis/bailleur/index.js';
const dashboard = await bailleurAPI.getDashboard();
```

### 2. Via la façade centralisée
```javascript
import { backendAPI } from 'utils/apis/index.js';

// Accès sous-domaines typés
await backendAPI.locataire.getLogements();
await backendAPI.bailleur.getDashboard();

// Accès direct (rétrocompatibilité totale)
await backendAPI.getLogements();
await backendAPI.getBailleurAnnonces();
```
