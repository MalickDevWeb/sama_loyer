// utils/helpers/zip.js
// ============================================================================
// LIGHTWEIGHT PKZIP BUILDER (WeChat Mini-Program & Browser compatible)
// Archive les fichiers binaires (PNG, PDF, TXT) en format ZIP standard (Store method 0).
// Les PNG étant déjà compressés Deflate, Store 0 évite toute surcharge CPU tout
// en restant 100% compatible avec l'explorateur Windows, Mac, Android, iOS et WeChat.
// ============================================================================

function makeCrcTable() {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

export function crc32(uint8Array) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < uint8Array.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ uint8Array[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function stringToUtf8Bytes(str) {
  const utf8 = [];
  for (let i = 0; i < str.length; i++) {
    let charcode = str.charCodeAt(i);
    if (charcode < 0x80) {
      utf8.push(charcode);
    } else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }
  return new Uint8Array(utf8);
}

/**
 * Construit une archive ZIP (format PKZIP) à partir d'une liste de fichiers.
 * @param {Array<{ name: string, data: ArrayBuffer | Uint8Array }>} files
 * @returns {ArrayBuffer} Le buffer complet de l'archive .zip
 */
export function createZipArchive(files) {
  const entries = [];
  let currentOffset = 0;

  for (const f of files) {
    const nameBytes = stringToUtf8Bytes(f.name);
    const dataBytes = f.data instanceof Uint8Array ? f.data : new Uint8Array(f.data);
    const fileCrc = crc32(dataBytes);
    const size = dataBytes.length;

    // Header local (30 octets) + nom du fichier
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const view = new DataView(localHeader.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true);          // Version minimum requise
    view.setUint16(6, 0, true);           // Flags
    view.setUint16(8, 0, true);           // Compression 0 = Store (non compressé)
    view.setUint16(10, 0, true);          // Mod time
    view.setUint16(12, 0, true);          // Mod date
    view.setUint32(14, fileCrc, true);    // CRC-32
    view.setUint32(18, size, true);       // Taille compressée
    view.setUint32(22, size, true);       // Taille décompressée
    view.setUint16(26, nameBytes.length, true); // Longueur du nom
    view.setUint16(28, 0, true);          // Champs supplémentaires (0)
    localHeader.set(nameBytes, 30);

    entries.push({
      nameBytes,
      dataBytes,
      localHeader,
      crc: fileCrc,
      size,
      offset: currentOffset
    });

    currentOffset += localHeader.length + dataBytes.length;
  }

  // Construction du répertoire central (Central Directory)
  const cdOffset = currentOffset;
  const cdHeaders = [];
  let cdTotalSize = 0;

  for (const entry of entries) {
    const cdHeader = new Uint8Array(46 + entry.nameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Signature CD
    view.setUint16(4, 20, true);          // Version
    view.setUint16(6, 20, true);          // Version extract
    view.setUint16(8, 0, true);           // Flags
    view.setUint16(10, 0, true);          // Compression 0
    view.setUint16(12, 0, true);          // Mod time
    view.setUint16(14, 0, true);          // Mod date
    view.setUint32(16, entry.crc, true);  // CRC-32
    view.setUint32(20, entry.size, true); // Taille compressée
    view.setUint32(24, entry.size, true); // Taille décompressée
    view.setUint16(28, entry.nameBytes.length, true);
    view.setUint16(30, 0, true);          // Extra field length
    view.setUint16(32, 0, true);          // File comment length
    view.setUint16(34, 0, true);          // Disk number start
    view.setUint16(36, 0, true);          // Internal attributes
    view.setUint32(38, 0, true);          // External attributes
    view.setUint32(42, entry.offset, true);// Offset local
    cdHeader.set(entry.nameBytes, 46);

    cdHeaders.push(cdHeader);
    cdTotalSize += cdHeader.length;
  }

  // Fin du répertoire central (EOCD - 22 octets)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);  // Signature EOCD
  eocdView.setUint16(4, 0, true);           // Disque courant
  eocdView.setUint16(6, 0, true);           // Disque CD
  eocdView.setUint16(8, files.length, true); // Entrées disque
  eocdView.setUint16(10, files.length, true);// Total entrées
  eocdView.setUint32(12, cdTotalSize, true); // Taille CD
  eocdView.setUint32(16, cdOffset, true);   // Offset CD
  eocdView.setUint16(20, 0, true);          // Comment length

  // Assemblage final en un ArrayBuffer continu
  const finalSize = cdOffset + cdTotalSize + eocd.length;
  const result = new Uint8Array(finalSize);
  let pos = 0;

  for (const entry of entries) {
    result.set(entry.localHeader, pos);
    pos += entry.localHeader.length;
    result.set(entry.dataBytes, pos);
    pos += entry.dataBytes.length;
  }
  for (const cd of cdHeaders) {
    result.set(cd, pos);
    pos += cd.length;
  }
  result.set(eocd, pos);

  return result.buffer;
}

