/**
 * 📡 Module de Téléversement par Morceaux (Resumable Chunked Uploader)
 * Zéro dépendance npm - Compatible pur WeChat Mini-Program & TCMPP
 */

const fs = wx.getFileSystemManager();
const CHUNK_SIZE_DEFAULT = 1024 * 1024; // 1 Mo par morceau (taille optimale 3G/4G)
const MAX_RETRIES_PER_CHUNK = 3;

/**
 * Récupère la taille exacte d'un fichier local
 * @param {string} filePath 
 * @returns {Promise<number>} Taille en octets
 */
export function getLocalFileSize(filePath) {
  return new Promise((resolve, reject) => {
    fs.getFileInfo({
      filePath,
      success: (res) => resolve(res.size),
      fail: (err) => reject(new Error(`[ChunkedUploader] Fichier introuvable ou illisible : ${err.errMsg || err}`))
    });
  });
}

/**
 * Lit une tranche binaire (ArrayBuffer) d'un fichier local
 * @param {string} filePath Chemin temporaire WeChat (wxfile:// ou tmp)
 * @param {number} position Offset de départ en octets
 * @param {number} length Nombre d'octets à lire
 * @returns {Promise<ArrayBuffer>} Données binaires du morceau
 */
export function readChunkBuffer(filePath, position, length) {
  return new Promise((resolve, reject) => {
    fs.readFile({
      filePath,
      position,
      length,
      success: (res) => resolve(res.data),
      fail: (err) => reject(new Error(`[ChunkedUploader] Erreur de lecture à l'offset ${position} : ${err.errMsg || err}`))
    });
  });
}

/**
 * Envoie un morceau binaire individuel avec gestion d'en-têtes HTTP
 */
function sendChunkRequest({ uploadUrl, chunkBuffer, uploadId, chunkIndex, totalChunks, fileName, headers = {} }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: uploadUrl,
      method: 'POST',
      data: chunkBuffer,
      header: {
        'Content-Type': 'application/octet-stream',
        'X-Upload-Id': uploadId,
        'X-Chunk-Index': String(chunkIndex),
        'X-Total-Chunks': String(totalChunks),
        'X-File-Name': encodeURIComponent(fileName || 'upload.bin'),
        ...headers
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`[ChunkedUploader] Erreur HTTP ${res.statusCode} sur le chunk ${chunkIndex + 1}/${totalChunks}`));
        }
      },
      fail: (err) => reject(new Error(`[ChunkedUploader] Réseau inaccessible sur chunk ${chunkIndex + 1} : ${err.errMsg || err}`))
    });
  });
}

/**
 * Téléverse un fichier complet par morceaux avec reprise automatique
 * @param {Object} options Configuration d'upload
 * @param {string} options.filePath Chemin du fichier local
 * @param {string} options.uploadUrl URL de réception des morceaux (/api/upload/chunk)
 * @param {string} options.completeUrl URL d'assemblage final (/api/upload/complete)
 * @param {string} [options.fileName] Nom d'origine du fichier
 * @param {number} [options.chunkSize] Taille en octets (défaut: 1 Mo)
 * @param {Object} [options.headers] En-têtes HTTP additionnels (Authorization: Bearer...)
 * @param {Function} [options.onProgress] Callback de progression ({ percent, currentChunk, totalChunks, uploadedBytes, totalBytes })
 * @returns {Promise<Object>} Réponse finale du serveur après assemblage
 */
export async function uploadFileInChunks({
  filePath,
  uploadUrl,
  completeUrl,
  fileName = 'fichier.bin',
  chunkSize = CHUNK_SIZE_DEFAULT,
  headers = {},
  onProgress = null
}) {
  if (!filePath) throw new Error('[ChunkedUploader] filePath obligatoire.');
  if (!uploadUrl) throw new Error('[ChunkedUploader] uploadUrl obligatoire.');

  const totalBytes = await getLocalFileSize(filePath);
  const totalChunks = Math.max(1, Math.ceil(totalBytes / chunkSize));
  const uploadId = `UP_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

  let uploadedBytes = 0;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const position = chunkIndex * chunkSize;
    const currentLength = Math.min(chunkSize, totalBytes - position);

    const chunkBuffer = await readChunkBuffer(filePath, position, currentLength);

    let attempt = 0;
    let chunkSuccess = false;
    let lastError = null;

    while (attempt < MAX_RETRIES_PER_CHUNK && !chunkSuccess) {
      attempt++;
      try {
        await sendChunkRequest({
          uploadUrl,
          chunkBuffer,
          uploadId,
          chunkIndex,
          totalChunks,
          fileName,
          headers
        });
        chunkSuccess = true;
      } catch (err) {
        lastError = err;
        console.warn(`[ChunkedUploader] Échec chunk ${chunkIndex + 1}/${totalChunks} (tentative ${attempt}/${MAX_RETRIES_PER_CHUNK}). Attente...`);
        if (attempt < MAX_RETRIES_PER_CHUNK) {
          await new Promise((r) => setTimeout(r, attempt * 1000));
        }
      }
    }

    if (!chunkSuccess) {
      throw new Error(`[ChunkedUploader] Abandon après ${MAX_RETRIES_PER_CHUNK} échecs sur le morceau ${chunkIndex + 1}/${totalChunks} : ${lastError?.message || lastError}`);
    }

    uploadedBytes += currentLength;
    const percent = Math.min(100, Math.round((uploadedBytes / totalBytes) * 100));

    if (typeof onProgress === 'function') {
      onProgress({
        percent,
        currentChunk: chunkIndex + 1,
        totalChunks,
        uploadedBytes,
        totalBytes
      });
    }
  }

  if (completeUrl) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: completeUrl,
        method: 'POST',
        data: {
          uploadId,
          totalChunks,
          totalBytes,
          fileName
        },
        header: {
          'Content-Type': 'application/json',
          ...headers
        },
        success: (res) => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            reject(new Error(`[ChunkedUploader] Erreur finalisation HTTP ${res.statusCode} : ${JSON.stringify(res.data)}`));
          }
        },
        fail: (err) => reject(new Error(`[ChunkedUploader] Échec requête d'assemblage final : ${err.errMsg || err}`))
      });
    });
  }

  return { uploadId, totalChunks, totalBytes, status: 'completed' };
}

