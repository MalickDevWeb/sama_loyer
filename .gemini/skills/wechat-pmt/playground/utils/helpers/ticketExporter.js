/**
 * ============================================================================
 * TICKET & RECEIPT CANVAS 2D EXPORTER (Générateur & Exportateur Billets / Reçus)
 * ============================================================================
 * 
 * Génère des billets d'embarquement, factures et reçus de paiement en haute
 * résolution directement sur le client mobile via l'API Canvas 2D WeChat,
 * sans passer par un serveur tiers et sans dépendances lourdes.
 * 
 * Garanties industrielles :
 * 1. Timeout Guard (`withTicketTimeout`) : Évite les blocages permanents si le
 *    moteur natif WeChat / TCMPP n'exécute pas le callback de rendu.
 * 2. Contrôle de cycle de vie (`isDisposed`) : Neutralise les écritures zombies
 *    si l'utilisateur quitte la page pendant la génération graphique.
 * 3. Pagination sécurisée : Limite la hauteur du Canvas pour respecter la mémoire
 *    GPU des smartphones d'entrée de gamme (anti-crash mémoire out-of-memory).
 * 4. Gestion des permissions d'enregistrement dans l'album photo (`saveImageToPhotosAlbum`).
 */

/**
 * Encadre une promesse d'export d'un délai d'expiration strict.
 * @param {Promise} operation
 * @param {string} stage Nom de l'étape pour le diagnostic
 * @param {number} [timeoutMs=10000]
 * @returns {Promise}
 */
export function withTicketTimeout(operation, stage, timeoutMs = 10000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const error = new Error(`Export ${stage} a expiré après ${timeoutMs}ms`);
      error.code = 'TICKET_TIMEOUT';
      error.stage = stage;
      reject(error);
    }, timeoutMs);

    Promise.resolve(operation).then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      }
    );
  });
}

/**
 * Découpe un modèle de billet complexe (vols multiples, groupe de passagers)
 * en pages indépendantes pour éviter de dépasser la hauteur maximale Canvas 2D.
 * 
 * @param {Object} model Données complètes du reçu/billet
 * @param {number} [itemsPerPage=3] Nombre max de segments/lignes par page
 * @returns {Array<Object>} Liste de modèles paginés avec dimensions calculées
 */
export function paginateTicketModel(model, itemsPerPage = 3) {
  const pages = [];
  const flights = Array.isArray(model.flights) ? model.flights : [];
  const passengers = Array.isArray(model.passengers) ? model.passengers : [];

  const pageCount = Math.max(
    1,
    Math.ceil(flights.length / itemsPerPage),
    Math.ceil(passengers.length / 8)
  );

  const baseWidth = 750; // Largeur standard rpx/px WeChat

  for (let index = 0; index < pageCount; index++) {
    const pageFlights = flights.slice(index * itemsPerPage, (index + 1) * itemsPerPage);
    const pagePassengers = passengers.slice(index * 8, (index + 1) * 8);

    // Hauteur dynamique calculée selon le contenu
    const calculatedHeight = 450 + pageFlights.length * 280 + pagePassengers.length * 50;

    pages.push({
      ...model,
      flights: pageFlights,
      passengers: pagePassengers,
      page: index + 1,
      pageCount,
      width: baseWidth,
      height: calculatedHeight
    });
  }

  return pages;
}

/**
 * Dessine et exporte une image temporaire à partir d'un nœud Canvas 2D WeChat.
 * 
 * @param {Object} pageInstance Instance de Page (this)
 * @param {string} canvasId Identifiant sélecteur du Canvas (ex: 'ticketCanvas')
 * @param {Object} options
 * @param {number} options.width Largeur en pixels réels
 * @param {number} options.height Hauteur en pixels réels
 * @param {Function} options.drawRoutine Fonction synchrone (ctx, width, height) => void
 * @param {string} [options.fileType='png'] 'png' ou 'jpg'
 * @param {number} [options.quality=1] Qualité de compression (0 à 1)
 * @returns {Promise<string|null>} Chemin de fichier temporaire tempFilePath
 */
export async function exportCanvasToImage(
  pageInstance,
  canvasId,
  { width, height, drawRoutine, fileType = 'png', quality = 1 }
) {
  if (typeof wx.createSelectorQuery !== 'function') {
    throw Object.assign(new Error('Canvas SelectorQuery non disponible'), {
      code: 'CANVAS_UNSUPPORTED'
    });
  }

  if (pageInstance.isDisposed) return null;

  // 1. Récupération du nœud Canvas 2D
  const canvasNode = await withTicketTimeout(
    new Promise((resolve, reject) => {
      let query = wx.createSelectorQuery();
      if (typeof query.in === 'function') {
        query = query.in(pageInstance);
      }

      query
        .select(`#${canvasId}`)
        .fields({ node: true, size: true })
        .exec((res) => {
          const node = res?.[0]?.node;
          if (node && typeof node.getContext === 'function') {
            resolve(node);
          } else {
            reject(
              Object.assign(new Error('Nœud Canvas 2D introuvable'), {
                code: 'CANVAS_NODE_NOT_FOUND'
              })
            );
          }
        });
    }),
    'select_node'
  );

  if (pageInstance.isDisposed) return null;

  // 2. Configuration des dimensions physiques
  canvasNode.width = width;
  canvasNode.height = height;

  const ctx = canvasNode.getContext('2d');
  if (!ctx) {
    throw new Error('Impossible d obtenir le contexte de rendu 2D');
  }

  // 3. Exécution de la routine de tracé
  if (typeof drawRoutine === 'function') {
    drawRoutine(ctx, width, height);
  }

  if (pageInstance.isDisposed) return null;

  // 4. Conversion vers fichier temporaire
  const tempFilePath = await withTicketTimeout(
    new Promise((resolve, reject) => {
      wx.canvasToTempFilePath(
        {
          canvas: canvasNode,
          x: 0,
          y: 0,
          width,
          height,
          destWidth: width,
          destHeight: height,
          fileType,
          quality,
          success: (res) => resolve(res.tempFilePath),
          fail: (err) => reject(err)
        },
        pageInstance
      );
    }),
    'export_temp_file'
  );

  return tempFilePath;
}

/**
 * Enregistre le fichier image du reçu dans l'album photo de l'utilisateur avec gestion du refus d'autorisation.
 * 
 * @param {string} tempFilePath Chemin temporaire du fichier
 * @returns {Promise<boolean>} True si enregistré avec succès
 */
export async function saveTicketToPhotosAlbum(tempFilePath) {
  if (!tempFilePath) throw new Error('Chemin de fichier manquant');

  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({
      filePath: tempFilePath,
      success() {
        wx.showToast({
          title: 'Billet enregistré !',
          icon: 'success',
          duration: 2000
        });
        resolve(true);
      },
      fail(err) {
        // L'utilisateur a refusé l'autorisation d'accès aux photos
        if (err.errMsg && err.errMsg.includes('auth deny')) {
          wx.showModal({
            title: 'Autorisation requise',
            content: 'Veuillez autoriser l accès à vos photos pour sauvegarder votre billet.',
            confirmText: 'Paramètres',
            cancelText: 'Annuler',
            success(modalRes) {
              if (modalRes.confirm) {
                wx.openSetting();
              }
              resolve(false);
            }
          });
        } else {
          reject(err);
        }
      }
    });
  });
}

