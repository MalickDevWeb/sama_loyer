> 🧭 **Navigation :** [UI](DOC_UI_POUR_DEVELOPPEURS.md) | [API](DOC_API_POUR_DEVELOPPEURS.md) | [Paiement & Résilience](DOC_PAIEMENT_NATIVE_MAXIT_ET_RESILIENCE.md) | [Responsive & TabBar](DOC_RESPONSIVE_IPHONE_ET_CUSTOM_TABBAR.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Debug](DOC_DEBUG_ET_NOUVELLES_RECETTES.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 💳 Guide Complet : Paiement Marchand Natif (Max It / TCMPP) & Résilience Réseau

> **Origine & Éprouvé en Production :** Architecture extraite de l'application ATS Explore (`mp-ats-app`), validée pour garantir **0 % de double débit** et **0 % de perte financière** sur réseau mobile 4G instable.

---

## 🎯 Problématique Fondamentale du Paiement Mobile

Dans un conteneur WeChat / TCMPP / Max It, le flux de paiement implique **deux systèmes asynchrones distincts** :
1. **Le conteneur natif (Orange Money / Max It)** : Débite le solde bancaire de l'utilisateur via le plugin natif `merchantPay`.
2. **Le serveur applicatif (Backend)** : Enregistre la commande, émet le billet / reçu via une requête HTTP POST.

```
       [ Client Mobile ]
          /           \
  (1) Débit        (2) Enregistrement
   Bancaire          Billet / Commande
        /               \
[ Orange Money ]     [ Backend Applicatif ]
```

⚠️ **Le Danger Critique :** Si une coupure réseau 4G intervient entre l'étape 1 et l'étape 2 :
* L'utilisateur est **débité de son argent**.
* Mais l'application n'a pas encore reçu la confirmation de son billet.
* Si le développeur déverrouille le bouton "Payer" sans précaution, l'utilisateur réappuie et subit un **double débit** !

---

## 🛡️ Les 3 Piliers de l'Architecture de Paiement Résiliente

### Pilier 1 : Le Bouclier Bancaire (`_confirmedTxnid` & Idempotence)
Dès que le plugin natif retourne `code: 'SUCCEED'`, la référence de transaction bancaire (`txnid`) est **immédiatement scellée** dans l'instance de la page :

```javascript
this._confirmedTxnid = String(payment.txnid);
```

Toute tentative ultérieure d'exécution de la méthode de réservation vérifie en premier lieu `this._confirmedTxnid` :
* Si `_confirmedTxnid` existe déjà : **l'appel natif Orange Money est TOTALEMENT sauté (0 Franc prélevé)**.
* Seul l'appel d'enregistrement backend est rejoué avec la preuve d'achat déjà obtenue.

---

### Pilier 2 : Le Smart Polling (Résilience 4G à 3 Tentatives)
Au lieu de renvoyer une erreur brute au premier paquet 4G perdu, l'application exécute un **Smart Polling silencieux avec backoff progressif** (ex: immédiat, +2s, +4s).

* **Tentative 1 (immédiate) :** Requête POST avec `txnid`. Si timeout 4G ➔ passage silencieux à l'essai 2.
* **Tentative 2 (+2s) :** Seconde tentative. Si rétabli ➔ succès transparent, l'utilisateur ne s'est rendu compte de rien.
* **Tentative 3 (+4s) :** Troisième tentative. Si échec persistant ➔ affichage d'un dialogue clair invitant à "Réessayer". Comme `_confirmedTxnid` est scellé, le clic "Réessayer" ne rouvre jamais le paiement bancaire.

---

### Pilier 3 : Suppression du Timeout Artificiel (Anti-Ghost Debit)
❌ **Erreur classique :** Placer un `Promise.race` avec un `setTimeout` de 30 secondes sur l'appel natif.
* Si l'utilisateur prend 35 secondes pour taper son code secret Orange Money, le JavaScript déclenche un timeout et affiche "Échec", alors que le SDK natif finalise le débit 5 secondes plus tard dans son dos !
✅ **Règle absolue :** Ne jamais imposer de timeout artificiel côté JavaScript sur l'appel du plugin natif `merchantPay`. Laisser le SDK natif gérer sa propre politique d'expiration de session PIN.

---

## 🏗️ Implémentation de Référence

### 1. Le Service Natif (`utils/apis/native.js`)

```javascript
/**
 * Déclenche le paiement via le plugin natif TCMPP / Max It
 * @param {Object} options
 * @param {string} options.merchantId - Identifiant marchand officiel
 * @param {number} options.amount - Montant exact
 * @param {string} options.orderId - Référence de commande interne
 * @param {string} [options.serviceType='MERCHANT_PAY']
 * @returns {Promise<{ success: boolean, txnid: string, raw: Object }>}
 */
export async function invokeMerchantPayment({ merchantId, amount, orderId, serviceType = 'MERCHANT_PAY' }) {
  return new Promise((resolve, reject) => {
    // Vérification de la disponibilité de l'API native
    if (typeof wx.invokeNativePlugin !== 'function') {
      return reject(new Error('Le plugin natif de paiement n\'est pas supporté sur cette plateforme.'));
    }

    wx.invokeNativePlugin({
      plugin: 'merchantPay',
      param: {
        merchantId,
        amount: Math.round(Number(amount)), // Toujours des entiers si requis
        orderId,
        serviceType
      },
      success(res) {
        // Selon la plateforme, le code de succès peut être 'SUCCEED', 'SUCCESS' ou '00'
        const code = String(res?.code || res?.resultCode || '').toUpperCase();
        if (code === 'SUCCEED' || code === 'SUCCESS' || code === '00') {
          resolve({
            success: true,
            txnid: String(res.txnid || res.transactionId || res.data?.txnid || ''),
            raw: res
          });
        } else if (code === 'CANCEL' || code === 'USER_CANCEL') {
          reject(new Error('Paiement annulé par l\'utilisateur.'));
        } else {
          reject(new Error(res?.message || res?.msg || 'Échec du paiement marchand.'));
        }
      },
      fail(err) {
        reject(new Error(err?.errMsg || 'Impossible de joindre le service de paiement.'));
      }
    });
  });
}
```

---

### 2. Le Contrôleur de Page Idempotent (`pages/booking/booking.js`)

```javascript
import { invokeMerchantPayment } from '../../utils/apis/native.js';
import { BackendAPI } from '../../utils/apis/index.js';

Page({
  data: {
    isSubmitting: false,
    order: {
      id: 'ORD-2026-9981',
      totalAmount: 15000
    }
  },

  // 🛡️ Le Bouclier Bancaire est rattaché à l'instance (non réinitialisé par setData)
  _confirmedTxnid: null,

  async handlePayment() {
    if (this.data.isSubmitting) return; // Anti-rebond UI immédiat

    this.setData({ isSubmitting: true });

    try {
      let txnid = this._confirmedTxnid;

      // ÉTAPE 1 : Débit Bancaire (uniquement si aucun reçu préalable n'est scellé)
      if (!txnid) {
        wx.showLoading({ title: 'Paiement en cours...', mask: true });
        
        const paymentResult = await invokeMerchantPayment({
          merchantId: 'MARCHAND_ATS_OFFICIEL',
          amount: this.data.order.totalAmount,
          orderId: this.data.order.id
        });

        // 🔒 SCELLAGE IMMÉDIAT DU REÇU BANCAIRE
        txnid = paymentResult.txnid;
        this._confirmedTxnid = txnid;
        
        // Optionnel mais recommandé : persister temporairement sur disque
        wx.setStorageSync('PENDING_TXNID', {
          orderId: this.data.order.id,
          txnid: txnid,
          timestamp: Date.now()
        });
      }

      // ÉTAPE 2 : Enregistrement Backend avec Smart Polling (3 tentatives)
      wx.showLoading({ title: 'Confirmation billet...', mask: true });
      const confirmation = await this._executeSmartPolling(txnid);

      // Succès total : on libère le bouclier et nettoie le stockage
      this._confirmedTxnid = null;
      wx.removeStorageSync('PENDING_TXNID');
      wx.hideLoading();

      wx.redirectTo({
        url: `/pages/booking-confirmation/booking-confirmation?ref=${confirmation.booking_ref}`
      });

    } catch (err) {
      wx.hideLoading();
      this.setData({ isSubmitting: false });

      // Si l'argent a déjà été prélevé, on rassure immédiatement l'utilisateur
      if (this._confirmedTxnid) {
        wx.showModal({
          title: 'Paiement effectué',
          content: 'Votre compte a bien été débité, mais la confirmation a rencontré une lenteur réseau. Cliquez sur Réessayer pour obtenir votre billet sans repayer.',
          confirmText: 'Réessayer',
          cancelText: 'Fermer',
          success: (res) => {
            if (res.confirm) {
              this.handlePayment(); // Relance immédiatement l'étape 2 sans repayer !
            }
          }
        });
      } else {
        // Échec normal avant tout débit
        wx.showToast({
          title: err.message || 'Paiement non abouti',
          icon: 'none',
          duration: 3000
        });
      }
    }
  },

  /**
   * Smart Polling à 3 essais avec backoff progressif (0s, 2s, 4s)
   */
  async _executeSmartPolling(txnid, maxRetries = 3) {
    const delays = [0, 2000, 4000];

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      if (delays[attempt] > 0) {
        await new Promise((resolve) => setTimeout(resolve, delays[attempt]));
      }

      try {
        const response = await BackendAPI.confirmBooking({
          orderId: this.data.order.id,
          txnid: txnid
        });
        return response; // Réservation confirmée avec succès
      } catch (apiError) {
        // En cas d'erreur métier bloquante (ex: 400 mauvaise requête), pas la peine de boucler
        if (apiError.status === 400) throw apiError;
        
        // Si c'était la dernière tentative, on propage l'erreur pour afficher le dialogue de retry
        if (attempt === maxRetries - 1) {
          throw apiError;
        }
      }
    }
  }
});
```

---

## 🔄 Récupération Hors-Ligne (Offline Recovery Pattern)

Que se passe-t-il si le smartphone s'éteint ou si l'utilisateur quitte brusquement l'application après le débit bancaire ?

### Procédure de reprise dans `app.js` ou sur l'écran d'accueil :
1. Au lancement de l'application (`onLaunch`), vérifier s'il existe une transaction en cours non confirmée :
   ```javascript
   const pendingTx = wx.getStorageSync('PENDING_TXNID');
   if (pendingTx && (Date.now() - pendingTx.timestamp < 24 * 3600 * 1000)) {
     // Avertir l'utilisateur ou rediriger vers un écran de vérification
     wx.showModal({
       title: 'Paiement en attente de validation',
       content: `Un paiement pour la commande ${pendingTx.orderId} a été détecté. Voulez-vous vérifier le statut de votre billet ?`,
       confirmText: 'Vérifier',
       success: (res) => {
         if (res.confirm) {
           wx.navigateTo({
             url: `/pages/booking/booking?orderId=${pendingTx.orderId}&resumeTxnid=${pendingTx.txnid}`
           });
         }
       }
     });
   }
   ```
2. La page cible reprend directement l'étape 2 (enregistrement backend) avec le `txnid` retrouvé.

---

## ✅ Checklist d'Audit Avant Mise en Production

- [ ] **Bouclier actif :** `this._confirmedTxnid` est bien stocké hors du `data` pour éviter tout reset par réassignation globale.
- [ ] **Zéro timeout sur l'API native :** Aucun `Promise.race` ou minuteur n'interrompt le plugin natif pendant que le client tape son code PIN.
- [ ] **Smart Polling configuré :** 3 tentatives avec backoff (0s, 2s, 4s) avant tout abandon.
- [ ] **Dialogue de secours explicite :** Si le réseau meurt après débit, le bouton "Réessayer" appelle la validation backend sans repasser par Orange Money.
- [ ] **Persistance locale :** Enregistrement de `PENDING_TXNID` dès l'obtention du `txnid` et suppression après succès backend.
- [ ] **Montants entiers :** Vérifier que les montants envoyés au plugin natif sont des entiers (pas de centimes flottants comme `1500.500000002`).

