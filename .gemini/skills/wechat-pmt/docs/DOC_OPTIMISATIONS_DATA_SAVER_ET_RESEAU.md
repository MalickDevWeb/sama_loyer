> 🔗 **Navigation :** [Guide UI](DOC_UI_POUR_DEVELOPPEURS.md) | [Guide API](DOC_API_POUR_DEVELOPPEURS.md) | [Animations](DOC_FLUX_COMPLEXES_ANIMATIONS.md) | [Communication](DOC_COMMUNICATION_EVENEMENTS.md) | [Données](DOC_DONNEES_MAPPERS_HELPERS.md) | [Recettes](DOC_RECETTES_COPIER_COLLER.md) | [Checklist](DOC_CHECKLIST_AVANT_DE_CODER.md) | [FAQ](DOC_FAQ_ERREURS_FREQUENTES.md)

---

# 🌍 Optimisations Data-Saver & Réseau Afrique de l'Ouest

En Afrique de l'Ouest (Sénégal, Côte d'Ivoire, Mali, Guinée...), les applications déployées dans **Max It** font face à deux réalités majeures :
1. **La valeur du forfait data :** Chaque mégaoctet compte pour l'utilisateur. Une application qui consomme 20 Mo de forfait à chaque session sera rapidement abandonnée.
2. **L'instabilité des réseaux mobiles :** Passage fréquent de la 4G à la 3G ou 2G (Edge), zones blanches temporaires et micro-coupures de transmission.

Ce guide définit les standards d'optimisation pour offrir une expérience fluide, économique en data et ultra-résiliente.

---

## 📸 1. Compression Obligatoire des Images Avant Envoi

Lorsqu'un utilisateur prend une photo avec un smartphone récent (pièce d'identité, justificatif, photo de profil), le fichier brut pèse entre **5 Mo et 12 Mo**.  
Envoyer ce fichier brut sur un réseau 3G prend plus de 45 secondes, risque un timeout serveur et consomme inutilement le forfait du client.

### Standard Sonatel : `compressImageSafe`
Toute image sélectionnée via `wx.chooseMedia` ou `wx.chooseImage` **DOIT être compressée côté client** avant l'appel à `wx.uploadFile` :

```javascript
/**
 * Compresse une image locale avant upload pour réduire son poids de 80% à 95%
 * @param {string} tempFilePath Chemin temporaire de l'image
 * @param {number} quality Taux de compression JPEG (0-100, recommandé: 75)
 * @returns {Promise<string>} Chemin temporaire de l'image allégée
 */
export async function compressImageSafe(tempFilePath, quality = 75) {
  return new Promise((resolve) => {
    wx.compressImage({
      src: tempFilePath,
      quality,
      success(res) {
        console.log('[DataSaver] Image compressée avec succès :', res.tempFilePath);
        resolve(res.tempFilePath);
      },
      fail(err) {
        // En cas d'échec de compression, on replie sur l'original sans bloquer l'utilisateur
        console.warn('[DataSaver] Échec de compression, envoi de l\'original :', err);
        resolve(tempFilePath);
      },
    });
  });
}
```

**Résultats concrets en production :**
* Photo brute appareil : **8,4 Mo** (temps d'envoi 3G : ~40s).
* Photo après `compressImageSafe(path, 75)` : **320 Ko** (temps d'envoi 3G : ~1,5s).
* **Gain data utilisateur : 96 % d'économie.**

---

## 📡 2. Détecteur de Qualité Réseau (`NetworkMonitor`)

Pour éviter les chargements infinis silencieux, le mini-programme doit écouter l'état du réseau et adapter dynamiquement l'interface utilisateur.

### Le Service Réseau (`utils/helpers/network.js`)
```javascript
class NetworkService {
  #networkType = 'unknown';
  #isConnected = true;
  #listeners = new Set();

  init() {
    // 1. Statut initial au démarrage
    wx.getNetworkType({
      success: (res) => {
        this.#networkType = res.networkType;
        this.#isConnected = res.networkType !== 'none';
        this.#notify();
      },
    });

    // 2. Écoute dynamique des changements (bascule 4G -> 3G -> 2G)
    wx.onNetworkStatusChange((res) => {
      this.#isConnected = res.isConnected;
      this.#networkType = res.networkType;
      this.#notify();
    });
  }

  isLowBandwidth() {
    return ['2g', '3g', 'unknown'].includes(this.#networkType);
  }

  isOffline() {
    return !this.#isConnected || this.#networkType === 'none';
  }

  getNetworkType() {
    return this.#networkType;
  }

  subscribe(callback) {
    this.#listeners.add(callback);
    callback({ isConnected: this.#isConnected, networkType: this.#networkType, isLow: this.isLowBandwidth() });
    return () => this.#listeners.delete(callback);
  }

  #notify() {
    const state = {
      isConnected: this.#isConnected,
      networkType: this.#networkType,
      isLow: this.isLowBandwidth(),
    };
    this.#listeners.forEach(cb => cb(state));
  }
}

export const NetworkMonitor = new NetworkService();
```

---

## 🟡 3. Le Bandeau Dégradé Non-Bloquant

Quand le réseau bascule en 2G/3G ou se coupe, afficher un bandeau discret en haut de l'écran sans masquer le contenu déjà chargé en cache :

**WXML :**
```xml
<!-- Bandeau de statut réseau discret -->
<view wx:if="{{ isOffline }}" class="network-banner network-banner--offline animate-slide-up">
  <text class="network-banner__text">Connexion perdue. Affichage des données hors-ligne.</text>
</view>
<view wx:elif="{{ isLowBandwidth }}" class="network-banner network-banner--warning animate-slide-up">
  <text class="network-banner__text">Réseau ralenti (3G). Chargement optimisé.</text>
</view>
```

**WXSS :**
```css
.network-banner {
  width: 100%;
  padding: 12rpx 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.network-banner--offline {
  background-color: #FEE2E2;
  border-bottom: 1rpx solid #FCA5A5;
}

.network-banner--warning {
  background-color: #FEF3C7;
  border-bottom: 1rpx solid #FCD34D;
}

.network-banner__text {
  font-size: 22rpx;
  color: #1F2937;
  font-weight: 500;
}
```

---

## 📦 4. Budget Poids des Assets Locaux (Zéro Image Lourde)

Pour respecter le plafond de 2 Mo du paquet principal :

| Type d'Asset | Règle Stricte | Alternative Recommandée |
|---|---|---|
| **Images de fond / Hero banners** | ❌ Interdit en local (`assets/`) | Héberger sur CDN Sonatel / AWS S3 et charger avec `<app-image>` résilient. |
| **Icônes de menu / TabBar** | Poids maximum : **15 Ko par icône** | Privilégier les SVG vectoriels ou WXML inline. |
| **Polices personnalisées (.ttf)** | ❌ Interdiction absolue en local | Utiliser les polices système `-apple-system, Roboto, sans-serif`. |
| **Fichiers audio / vidéo** | ❌ Interdiction totale dans le repo | Streaming distant uniquement. |

---

## ⚡ 5. Upload avec Barre de Progression

Sur réseau mobile, un upload sans retour visuel donne l'impression que l'application est figée. Toujours utiliser l'écouteur `onProgressUpdate` :

```javascript
export function uploadWithProgress(url, filePath, onProgress) {
  return new Promise((resolve, reject) => {
    const uploadTask = wx.uploadFile({
      url,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${getValidToken()}`,
      },
      success: (res) => {
        try {
          resolve(JSON.parse(res.data));
        } catch {
          resolve(res.data);
        }
      },
      fail: reject,
    });

    uploadTask.onProgressUpdate((res) => {
      // res.progress = pourcentage (0 à 100)
      if (typeof onProgress === 'function') {
        onProgress(res.progress);
      }
    });
  });
}
```

---

## 📡 6. Téléversement par Morceaux (Chunking 1 Mo) & Reprise Résiliente

Pour les fichiers volumineux (> 1 Mo : pièces d'identité recto/verso, passeports, justificatifs PDF, constats vidéo), `wx.uploadFile` monolithique présente un risque critique d'abandon : toute micro-coupure réseau au-delà de 90% annule l'intégralité du transfert et oblige l'utilisateur à renvoyer 100% du fichier.

**Standard Sonatel & TCMPP :**
* Découpage binaire en tranches de 1 Mo (`fs.readFile({ position, length })`).
* Envoi séquentiel avec headers de réconciliation (`X-Upload-Id`, `X-Chunk-Index`, `X-Total-Chunks`).
* Reprise automatique (jusqu'à 3 tentatives avec backoff progressif) sur le morceau précis qui a échoué, sans réémettre les morceaux déjà enregistrés.

> 💡 **Implémentation prête à l'emploi :** Voir [Recette 59 : Téléversement par Morceaux (Chunking 1 Mo) avec Reprise Automatique 3G/4G](DOC_RECETTES_COPIER_COLLER.md#-recette-59--téléversement-par-morceaux-chunking-1-mo-avec-reprise-automatique-3g4g).


