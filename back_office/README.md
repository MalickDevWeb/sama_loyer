# 🏢 SAMA LOYER — Portail d'Administration Back-Office

Portail Web d'administration et de modération de la plateforme **SAMA LOYER**, intégré à l'écosystème Orange Max it au Sénégal.

---

## 🎯 Fonctionnalités Clés

1. **Dashboard & KPIs en temps réel :**
   - Volume d'annonces en ligne vs en attente de modération.
   - Suivi des loyers perçus via Max it et alertes de retards.
   - Statistiques des abonnements bailleurs (Packs Essai & Pro).

2. **Validation des Annonces (Modération KYC) :**
   - Contrôle de conformité au décret sénégalais de mars 2023 sur les loyers.
   - Vérification des photos, des montants et des pièces justificatives du bien.
   - Approbation ou rejet avec motif notifié par SMS au propriétaire.

3. **Gestion des Bailleurs & Locataires :**
   - Fiches profils certifiées Orange Money / Max it.
   - Historique des baux numériques et des quittances générées.

4. **Transactions & Abonnements Premium :**
   - Suivi des flux financiers et des commissions Orange Money.
   - Gestion des packs de visibilité et relances automatiques.

5. **Sécurité, 2FA & Journal d'Audit :**
   - Authentification administrateur avec double facteur (code SMS/OTP).
   - Traçabilité complète de chaque action de modération (`lib/audit.ts`).

---

## 🚀 Démarrage Rapide

```bash
# Installation des dépendances
cd back_office
npm install

# Lancement du serveur de développement local
npm run dev

# Build de production
npm run build
```

---

## 🛠️ Stack Technique

- **Framework :** React 18 + TypeScript + Vite
- **Routage :** Client-side SPA
- **Styles :** CSS Modules & Variables de thème cohérentes avec la Mini-App (Framboise `#C8235F` & Marine `#0F1E3D`)
