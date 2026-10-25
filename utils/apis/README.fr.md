# Couche API — SAMA LOYER

Architecture réseau, authentification OAuth2, gestion du cache et intégration des plugins natifs TCMPP / Max it.

Conforme aux principes **SOLID** et aux standards d'architecture modulaire WeChat Mini-Program (PMT).

---

## Organisation des modules

```text
utils/apis/
├── endpoints/                   # [Contrats de Routage]
│   ├── locataire.js             # Routes espace Locataire & Candidat
│   ├── bailleur.js              # Routes espace Bailleur & Gestion
│   ├── common.js                # Routes partagées (zones, upload, santé)
│   └── index.js                 # Registre unifié des endpoints (Object.freeze)
├── auth.js                      # Authentification OAuth2 Max it (client credentials)
├── http.js                      # Client HTTP unifié avec suivi de session & headers Max it
├── response.js                  # Extraction, déballage { success, data, meta } et normalisation RFC 7807
├── cache.js                     # Cache en mémoire réactif (TTL centralisé, déduplication in-flight)
├── locataire.js                 # Service métier Locataire (mappers json-sculpt, résilience offline)
├── bailleur.js                  # Service métier Bailleur (annonces, locataires, dashboard, KYC)
├── native.js                    # Bridge plugins natifs Orange Max it (wx.invokeNativePlugin)
└── index.js                     # Façade centrale unifiée (BackendAPI / backendAPI)
```

---

## Responsabilités par fichier

| Fichier / Dossier | Export principal | Responsabilité (SOLID / SRP) |
| :--- | :--- | :--- |
| `endpoints/` | `LOCATAIRE_ENDPOINTS`, `BAILLEUR_ENDPOINTS`, `ENDPOINTS` | **Routage pur** : URLs et constructeurs de routes immuables. |
| `auth.js` | `authenticate()`, `setAccessToken()` | **Sécurité** : Échange de jetons OAuth2 et auto-refresh en arrière-plan. |
| `http.js` | `httpClient`, `HttpClient` | **Transport réseau** : Wrappers `wx.request` typés avec tracking de session. |
| `response.js` | `extractApiResponse()`, `unwrapApiResponse()` | **Intégrité des données** : Déballage sécurisé de la charge utile et interception des erreurs applicatives. |
| `cache.js` | `cached()`, `invalidateCache()`, `TTL` | **Performance** : Mise en cache réactive EventBus et déduplication des requêtes concurrentes. |
| `locataire.js` | `locataireAPI`, `LocataireAPI` | **Domaine Locataire** : Logements, loyers Orange Money, visites et favoris. |
| `bailleur.js` | `bailleurAPI`, `BailleurAPI` | **Domaine Bailleur** : Annonces, dashboard KPI, locataires, encaissement espèces et conformité. |
| `native.js` | `invokePlugin()`, `withRetry()` | **Bridge Natif** : Accès aux fonctionnalités natives de la super-app Max it. |
| `index.js` | `backendAPI`, `BackendAPI` | **Façade** : Point d'entrée unique rétrocompatible combinant les deux domaines. |

---

## Exemples d'utilisation

### 1. Utilisation par domaine typé (Recommandé)
```javascript
// Espace Locataire
import { locataireAPI } from 'utils/apis/locataire.js';
const logements = await locataireAPI.getLogements();

// Espace Bailleur
import { bailleurAPI } from 'utils/apis/bailleur.js';
const annonces = await bailleurAPI.getAnnonces();
```

### 2. Utilisation via la façade centrale
```javascript
import { backendAPI } from 'utils/apis/index.js';

// Accès sous-domaines
await backendAPI.locataire.getLogements();
await backendAPI.bailleur.getDashboard();

// Accès direct (rétrocompatibilité totale)
await backendAPI.getLogements();
await backendAPI.getBailleurAnnonces();
```
