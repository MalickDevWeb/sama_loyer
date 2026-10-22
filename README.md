# 🏠 SAMA LOGEMENT — Real Estate Mini-App for Maxit (Orange Senegal)

> **Orange Hackathon Project** — Smart real-estate platform integrated into Orange's **Maxit** Super-App, digitizing property search, rentals, lease agreements, and certified rent payments in Senegal.

---

## 📑 Summary

1. [Vision & Maxit Positioning](#-1-vision--maxit-positioning)
2. [Dual-Profile Architecture (Tenant & Landlord)](#-2-dual-profile-architecture-tenant--landlord)
3. [Business Model, Paywall & Orange Money Monetization](#-3-business-model-paywall--orange-money-monetization)
4. [Technical Mini-Program Structure](#-4-technical-mini-program-structure)
5. [WeChat / TCMPP Navigation Rules](#-5-wechat--tcmpp-navigation-rules)
6. [Design System & UI Components](#-6-design-system--ui-components)
7. [Administration Back-Office](#-7-administration-back-office)

---

## 🎯 1. Vision & Maxit Positioning

**SAMA LOGEMENT** is built to run natively inside Orange's **Maxit** Super-App via TCMPP (Tencent Cloud Mini Program Platform):

* **Single Sign-On (Maxit SSO)**: Automatic authentication via the user's Orange phone number (`+221 77...`).
* **KYC Certified Trust**: Orange Money KYC certification guarantees verified landlords and tenants, eliminating Dakar rental scams.
* **Direct In-App Payments**: Rent and security deposit transfers directly from the tenant's Orange Money wallet to the landlord's account.
* **Legal Compliance**: Full compliance with Senegal's March 2023 rent regulation decree (official numbered receipts, legal 1-2 month deposit limits, 1-month legal notice).

---

## 👥 2. Dual-Profile Architecture (Tenant & Landlord)

A single Maxit account can wear both hats seamlessly without requiring separate accounts:

* **Tenant Mode (Client)**: AI-powered search (written & voice in Wolof/French), "My Rent" screen, certified official receipts (PDF export), visit schedule tracking, chat.
* **Landlord Mode (Bailleur)**: Real-time dashboard, "My Tenants" screen (rent tracking, payment validations, Wolof/SMS reminders), property listing manager, Orange Money visibility packs.
* **1-Click Role Switch**: As on Airbnb or Uber, users switch instantly between Tenant and Landlord modes from their profile or avatar.

---

## 💰 3. Business Model, Paywall & Orange Money Monetization

### A. Freemium ➔ Paywall Conversion Strategy

1. **Phase 1: Launch Promo**: 1st listing (or initial 30 days) is free to rapidly onboard property supply in Dakar.
2. **Phase 2: Paywall after promo expires**: When the landlord wants to list beyond the free quota:
   > *"Your promotional offer has expired. To continue listing and connecting with qualified tenants, activate your Landlord Pack directly via Orange Money."*

### B. Instant Publishing (Verified Landlord) vs Manual Review

| Landlord Status | Publishing Process | Admin Review | Live Delay |
|---|---|---|---|
| **🟢 Verified Pro (Active Orange Money Pack)** | **Instant** (Auto-approved) | None (post-moderation upon dispute) | **Immediate (1 second)** |
| **🟡 Standard Landlord (No active pack / unverified)** | Pending review | Manual check by Super Admin | 24 h to 48 h |

---

## 🏛️ 4. Technical Mini-Program Structure

Symmetric directory layout under `pages/`:

```
pages/
├── client/                      # Tenant module (10 dedicated directories)
│   ├── home/                    # AI search (text & Wolof/FR voice), 3 smart recommendations
│   ├── search/                  # Filterable listings, map toggle, category chips
│   ├── logement-detail/         # Detailed property view, slides, booking, deposit
│   ├── loyers/                  # "My Rent" : 125 000 F overview, receipts, Wave/OM payments
│   ├── visites/                 # Visit tracking (confirmed, past, canceled)
│   ├── demande-visite/          # Book visit schedule slot
│   ├── messages/                # Inbox conversations
│   ├── chat/                    # Instant chat & WhatsApp copy helper
│   ├── favoris/                 # Saved favorite listings
│   └── profile/                 # Tenant profile & landlord mode toggle
│
└── bailleur/                    # Landlord module (6 dedicated directories)
    ├── home/                    # Landlord dashboard: KPIs, alerts, quick links
    ├── annonces/                # Listed properties (rented vs available)
    ├── ajouter/                 # 5-step property addition form
    ├── demandes/                # Tenant visit requests & applications
    ├── locataires/              # "My Tenants": tricolor status bar, action buttons
    └── premium/                 # Listing boosts & certified invoices
```

---

## ⚡ 5. WeChat / TCMPP Navigation Rules

To eliminate native WeChat `fail can not redirectTo a tabbar page` runtime errors:

1. **Client Tabs (`tabBar.list` in `app.json`)**:
   `home`, `loyers` (badge 2), `visites`, `messages` (badge 3), `profile`  
   👉 **Must use `wx.switchTab({ url })`**.
2. **Landlord Tabs (Outside `tabBar.list`)**:
   `b-home`, `b-annonces`, `b-ajouter`, `b-locataires`, `b-demandes`  
   👉 **Must use `wx.redirectTo({ url })`**.
3. **Modal Overlay Handling**:
   `wx.hideTabBar({ animation: true })` on modal open, and `wx.showTabBar({ animation: true })` on close with `padding-bottom: calc(150rpx + env(safe-area-inset-bottom))` to prevent bottom-sheet button clipping.

---

## 🖥️ 6. Administration Back-Office

Located in [`back_office/`](back_office/):
* Built with **React + TypeScript + Vite**.
* Responsive on Mobile, Tablet, and Desktop with collapsible mobile navigation.
* Manages tenant dispute tickets, verified landlords, and Orange Money transactions.
* Verified build passing with zero errors: `npm run build` (`tsc -b && vite build`).

---

*Active project branch: `sama-logement`*
