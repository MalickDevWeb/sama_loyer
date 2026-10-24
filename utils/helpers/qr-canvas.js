// ============================================================================
// DESSIN DES QR CODES ET DE L'AFFICHE À IMPRIMER (Canvas 2D)
// - drawQr : un QR code net (modules alignés sur le pixel) avec sa marge blanche
// - drawPoster : l'affiche SAMA LOYER d'un logement, à imprimer et coller
// - exportCanvas / saveToAlbum : image PNG pour l'enregistrer ou l'imprimer
// ============================================================================

import { qrMatrix } from './sama-links.js';

const NAVY = '#0F1E3D';
const BERRY = '#C8235F';
const BERRY_SOFT = '#FDE8EE';
const MUTED = '#5B6475';

/**
 * Prépare un <canvas type="2d"> à la bonne densité de pixels.
 * Le canvas est un calque natif qui ne suit pas toujours le défilement de la page :
 * on le place hors écran, on dessine, puis on AFFICHE l'image exportée (<image>).
 * @param {Object} scope - page ou composant
 * @param {string} selector
 * @param {number} [scale] - densité forcée (ex. 2 pour une image imprimable) ; défaut : écran
 * @returns {Promise<{ canvas, ctx, width, height }>} dimensions en px CSS
 */
export function getCanvas(scope, selector, scale) {
  return new Promise((resolve, reject) => {
    // Sans réponse de l'hôte, on abandonne au lieu d'attendre indéfiniment
    const timer = setTimeout(() => reject(new Error('CANVAS_TIMEOUT')), 3000);
    scope.createSelectorQuery()
      .select(selector)
      .fields({ node: true, size: true })
      .exec((res) => {
        clearTimeout(timer);
        const info = res && res[0];
        if (!info || !info.node || !info.width) {
          reject(new Error('CANVAS_UNAVAILABLE'));
          return;
        }
        let dpr = scale || 2;
        if (!scale) {
          try { dpr = wx.getSystemInfoSync().pixelRatio || 2; } catch (e) {}
        }
        const canvas = info.node;
        canvas.width = Math.round(info.width * dpr);
        canvas.height = Math.round(info.height * dpr);
        const ctx = canvas.getContext('2d');
        ctx.scale(dpr, dpr);
        resolve({ canvas, ctx, width: info.width, height: info.height });
      });
  });
}

/**
 * Dessine un QR code carré, marge blanche (« quiet zone ») de 2 modules comprise.
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} size - côté total en px CSS
 * @param {string} [color]
 */
export function drawQr(ctx, text, x, y, size, color = NAVY) {
  const m = qrMatrix(text);
  const n = m.length;
  const quiet = 2;
  const cell = size / (n + quiet * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = color;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!m[r][c]) continue;
      // +0.5 px de recouvrement : pas de fines lignes blanches entre les modules
      ctx.fillRect(x + (c + quiet) * cell, y + (r + quiet) * cell, cell + 0.5, cell + 0.5);
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Texte coupé avec « … » s'il dépasse la largeur
function fitText(ctx, text, maxWidth) {
  let t = String(text || '');
  if (ctx.measureText(t).width <= maxWidth) return t;
  while (t.length > 1 && ctx.measureText(`${t}…`).width > maxWidth) t = t.slice(0, -1);
  return `${t}…`;
}

// Texte sur 2 lignes maximum (coupé au mot), centré sur cx
function drawWrapped(ctx, text, cx, y, maxWidth, lineHeight) {
  const words = String(text || '').split(' ');
  const lines = [''];
  words.forEach((w) => {
    const cur = lines[lines.length - 1];
    const next = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(next).width <= maxWidth || !cur) lines[lines.length - 1] = next;
    else lines.push(w);
  });
  if (lines.length > 2) lines.splice(2, lines.length - 2, fitText(ctx, lines.slice(1).join(' '), maxWidth));
  lines.forEach((l, i) => ctx.fillText(l, cx, y + i * lineHeight));
}

// Maison du logo SAMA LOYER (même pictogramme que la barre de marque)
function drawHouse(ctx, cx, cy, s) {
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = s * 0.12;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.42, cy - s * 0.02);
  ctx.lineTo(cx, cy - s * 0.4);
  ctx.lineTo(cx + s * 0.42, cy - s * 0.02);
  ctx.moveTo(cx - s * 0.3, cy - s * 0.12);
  ctx.lineTo(cx - s * 0.3, cy + s * 0.36);
  ctx.lineTo(cx + s * 0.3, cy + s * 0.36);
  ctx.lineTo(cx + s * 0.3, cy - s * 0.12);
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(cx - s * 0.08, cy + s * 0.1, s * 0.16, s * 0.26);
}

/**
 * Affiche A6 portrait (ratio 1 : 1,414) d'un logement.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W - largeur en px CSS (hauteur = W × 1,414)
 * @param {{ link: string, title: string, place: string, priceText: string, code: string, rented: boolean }} p
 */
export function drawPoster(ctx, W, p) {
  const H = Math.round(W * 1.414);
  const u = W / 100; // unité relative : l'affiche garde ses proportions à toute taille

  // Fond
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // Bandeau de marque
  const bandH = 26 * u;
  const grad = ctx.createLinearGradient(0, 0, W, bandH);
  grad.addColorStop(0, '#E6007A');
  grad.addColorStop(1, BERRY);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, bandH);

  // Logo : carré arrondi + maison + SAMA LOYER
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, 7 * u, 6 * u, 12 * u, 12 * u, 3.2 * u);
  ctx.fill();
  drawHouse(ctx, 13 * u, 12.4 * u, 8 * u);
  ctx.fillStyle = '#FFFFFF';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `800 ${6.4 * u}px sans-serif`;
  ctx.fillText('SAMA', 22 * u, 12.2 * u);
  ctx.font = `700 ${3.6 * u}px sans-serif`;
  ctx.fillText('L O Y E R', 22.3 * u, 17 * u);

  // Accroche selon la situation du logement
  ctx.textAlign = 'right';
  ctx.font = `700 ${3.4 * u}px sans-serif`;
  ctx.fillText(p.rented ? 'Paiement du loyer' : 'Logement à louer', 93 * u, 12.6 * u);
  ctx.font = `500 ${2.8 * u}px sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.fillText('avec Max it', 93 * u, 16.6 * u);
  ctx.textAlign = 'left';

  // Carte blanche qui chevauche le bandeau
  const cardX = 7 * u;
  const cardY = 21 * u;
  const cardW = 86 * u;
  const cardH = 94 * u;
  ctx.save();
  ctx.shadowColor = 'rgba(15, 30, 61, 0.16)';
  ctx.shadowBlur = 4 * u;
  ctx.shadowOffsetY = 1.2 * u;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, cardX, cardY, cardW, cardH, 4.5 * u);
  ctx.fill();
  ctx.restore();

  // Titre, lieu, prix
  ctx.fillStyle = NAVY;
  ctx.font = `800 ${5.2 * u}px sans-serif`;
  ctx.fillText(fitText(ctx, p.title, cardW - 10 * u), cardX + 5 * u, cardY + 10 * u);
  ctx.fillStyle = MUTED;
  ctx.font = `500 ${3.4 * u}px sans-serif`;
  ctx.fillText(fitText(ctx, p.place, cardW - 10 * u), cardX + 5 * u, cardY + 15.5 * u);

  ctx.fillStyle = BERRY_SOFT;
  roundRect(ctx, cardX + 5 * u, cardY + 19 * u, 34 * u, 7.4 * u, 3.7 * u);
  ctx.fill();
  ctx.fillStyle = BERRY;
  ctx.font = `800 ${3.6 * u}px sans-serif`;
  ctx.fillText(fitText(ctx, p.priceText, 30 * u), cardX + 8 * u, cardY + 24 * u);

  // QR code centré dans un cadre
  const qrSize = 54 * u;
  const qrX = (W - qrSize) / 2;
  const qrY = cardY + 31 * u;
  ctx.strokeStyle = '#E4E7EE';
  ctx.lineWidth = 0.5 * u;
  roundRect(ctx, qrX - 2.5 * u, qrY - 2.5 * u, qrSize + 5 * u, qrSize + 5 * u, 3.5 * u);
  ctx.stroke();
  drawQr(ctx, p.link, qrX, qrY, qrSize, NAVY);

  // Petit logo au centre du QR (le niveau de correction Q le tolère)
  const badge = 10 * u;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, W / 2 - badge / 2 - 1 * u, qrY + qrSize / 2 - badge / 2 - 1 * u, badge + 2 * u, badge + 2 * u, 2.4 * u);
  ctx.fill();
  ctx.fillStyle = BERRY;
  roundRect(ctx, W / 2 - badge / 2, qrY + qrSize / 2 - badge / 2, badge, badge, 2 * u);
  ctx.fill();
  drawHouse(ctx, W / 2, qrY + qrSize / 2 + 0.4 * u, badge * 0.62);

  // Code de secours
  ctx.textAlign = 'center';
  ctx.fillStyle = MUTED;
  ctx.font = `600 ${3 * u}px sans-serif`;
  ctx.fillText(`Code ${p.code}`, W / 2, qrY + qrSize + 7.5 * u);
  ctx.textAlign = 'left';

  // Les 3 étapes
  const steps = p.rented
    ? ['Ouvre Max it et scanne', 'Ton loyer s’affiche', 'Paie, reçois ta quittance']
    : ['Ouvre Max it et scanne', 'Vois photos et prix', 'Demande une visite'];
  const stepY = cardY + cardH + 6 * u;
  const colW = 86 * u / 3;
  steps.forEach((s, i) => {
    const cx = 7 * u + colW * i + colW / 2;
    ctx.fillStyle = NAVY;
    ctx.beginPath();
    ctx.arc(cx, stepY, 3.4 * u, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.font = `800 ${3.4 * u}px sans-serif`;
    ctx.fillText(String(i + 1), cx, stepY + 1.2 * u);
    ctx.fillStyle = NAVY;
    ctx.font = `600 ${2.7 * u}px sans-serif`;
    drawWrapped(ctx, s, cx, stepY + 8 * u, colW - 3 * u, 3.4 * u);
  });

  // Pied de page
  ctx.fillStyle = MUTED;
  ctx.font = `500 ${2.5 * u}px sans-serif`;
  ctx.fillText('Paiements sécurisés Max it · samaloyer.sn', W / 2, H - 3 * u);
  ctx.textAlign = 'left';
  return H;
}

// Écrit une image base64 dans un fichier local (requis pour l'enregistrer dans la galerie)
function writeDataUrl(dataUrl) {
  return new Promise((resolve, reject) => {
    const fs = wx.getFileSystemManager ? wx.getFileSystemManager() : null;
    const dir = wx.env && wx.env.USER_DATA_PATH;
    if (!fs || !dir) {
      reject(new Error('FS_UNAVAILABLE'));
      return;
    }
    const filePath = `${dir}/sama-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.png`;
    fs.writeFile({
      filePath,
      data: dataUrl.replace(/^data:image\/\w+;base64,/, ''),
      encoding: 'base64',
      success: () => resolve(filePath),
      fail: reject
    });
  });
}

/**
 * Image PNG du canvas (pour l'afficher, l'enregistrer ou l'imprimer).
 * Certains hôtes ne rappellent jamais wx.canvasToTempFilePath : on lit d'abord
 * l'image avec canvas.toDataURL(), et un délai maximal évite l'attente infinie.
 * @returns {Promise<string>} chemin du fichier (ou data URL si l'écriture est impossible)
 */
export function exportCanvas(canvas, timeout = 3000) {
  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn, value) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn(value);
    };
    const timer = setTimeout(() => finish(reject, new Error('EXPORT_TIMEOUT')), timeout);

    // 1) Lecture directe Canvas 2D via toDataURL
    let dataUrl = '';
    try {
      if (typeof canvas.toDataURL === 'function') {
        dataUrl = canvas.toDataURL('image/png');
      }
    } catch (e) {}

    if (dataUrl && dataUrl.indexOf('data:image') === 0) {
      writeDataUrl(dataUrl)
        .then((path) => finish(resolve, path))
        .catch(() => finish(resolve, dataUrl));
      return;
    }

    // 2) Fallback wx.canvasToTempFilePath
    if (typeof wx !== 'undefined' && typeof wx.canvasToTempFilePath === 'function') {
      try {
        wx.canvasToTempFilePath({
          canvas,
          fileType: 'png',
          success: (res) => finish(resolve, res.tempFilePath),
          fail: (err) => finish(reject, err)
        });
        return;
      } catch (e) {
        finish(reject, e);
        return;
      }
    }

    finish(reject, new Error('EXPORT_FAILED'));
  });
}

/** Enregistre l'image dans la galerie (l'utilisateur l'imprime ou l'envoie ensuite) */
export function saveToAlbum(filePath) {
  return new Promise((resolve, reject) => {
    wx.saveImageToPhotosAlbum({ filePath, success: resolve, fail: reject });
  });
}
