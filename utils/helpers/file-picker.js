// ============================================================================
// SÉLECTION DE PIÈCES (photo et/ou PDF)
// Ouvre le bon sélecteur selon les formats acceptés par le Super Admin :
//   - ['image']        → appareil photo / galerie (wx.chooseMedia)
//   - ['pdf']          → fichiers PDF (wx.chooseMessageFile)
//   - ['image', 'pdf'] → le bailleur choisit : « Prendre une photo » ou « Choisir un PDF »
// ============================================================================

/**
 * @typedef {Object} PickedFile
 * @property {string} path - Chemin temporaire du fichier
 * @property {string} name - Nom affiché
 * @property {'image'|'pdf'} type
 */

const isCancel = (err) => !!(err && err.errMsg && err.errMsg.indexOf('cancel') !== -1);

/** Le sélecteur de fichiers n'existe pas sur toutes les versions de l'hôte */
export function canPickPdf() {
  return typeof wx.chooseMessageFile === 'function';
}

function pickImages(count) {
  return new Promise((resolve, reject) => {
    wx.chooseMedia({
      count,
      mediaType: ['image'],
      sourceType: ['camera', 'album'],
      sizeType: ['compressed'],
      camera: 'back',
      success: (res) => resolve((res.tempFiles || []).map((f, i) => ({
        path: f.tempFilePath,
        name: `Photo ${i + 1}`,
        type: 'image'
      }))),
      fail: (err) => (isCancel(err) ? resolve([]) : reject(err))
    });
  });
}

function pickPdfs(count) {
  if (!canPickPdf()) {
    return Promise.reject(new Error('PDF_UNSUPPORTED'));
  }
  return new Promise((resolve, reject) => {
    wx.chooseMessageFile({
      count,
      type: 'file',
      extension: ['pdf'],
      success: (res) => resolve((res.tempFiles || []).map((f) => ({
        path: f.path,
        name: f.name || 'Document.pdf',
        type: 'pdf'
      }))),
      fail: (err) => (isCancel(err) ? resolve([]) : reject(err))
    });
  });
}

function askSource() {
  return new Promise((resolve) => {
    wx.showActionSheet({
      itemList: ['Prendre une photo', 'Choisir un PDF'],
      success: (res) => resolve(res.tapIndex === 0 ? 'image' : 'pdf'),
      fail: () => resolve(null)
    });
  });
}

/**
 * Ouvre le sélecteur adapté aux formats acceptés.
 * Résout [] si l'utilisateur annule. Rejette 'PDF_UNSUPPORTED' si seul le PDF est
 * accepté et que l'hôte ne sait pas choisir de fichier.
 * @param {{ formats: Array<'image'|'pdf'>, count?: number }} options
 * @returns {Promise<PickedFile[]>}
 */
export async function pickDocumentFiles({ formats = ['image'], count = 1 } = {}) {
  const image = formats.indexOf('image') !== -1;
  const pdf = formats.indexOf('pdf') !== -1 && canPickPdf();

  if (formats.indexOf('pdf') !== -1 && !image && !pdf) {
    throw new Error('PDF_UNSUPPORTED');
  }
  if (image && !pdf) return pickImages(count);
  if (pdf && !image) return pickPdfs(count);

  const source = await askSource();
  if (!source) return [];
  return source === 'image' ? pickImages(count) : pickPdfs(count);
}

/**
 * Ouvre un fichier choisi (aperçu photo ou lecteur PDF).
 * @param {PickedFile} file
 */
export function openPickedFile(file) {
  if (!file) return;
  if (file.type === 'image') {
    wx.previewImage({ urls: [file.path], current: file.path });
    return;
  }
  wx.openDocument({
    filePath: file.path,
    fileType: 'pdf',
    fail: () => wx.showToast({ title: 'Impossible d’ouvrir le PDF ici', icon: 'none' })
  });
}

/** Libellé lisible des formats : « Photo ou PDF », « PDF uniquement »… */
export function formatsLabel(formats = []) {
  const image = formats.indexOf('image') !== -1;
  const pdf = formats.indexOf('pdf') !== -1;
  if (image && pdf) return 'Photo ou PDF';
  if (pdf) return 'PDF uniquement';
  return 'Photo uniquement';
}
