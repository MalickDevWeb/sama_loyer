// ============================================================================
// MÉDIAS DES LOGEMENTS — PROTOTYPE
// Photos (Unsplash) et vidéos de visite (Mixkit) libres de droits, hébergées en
// ligne : rien n'est embarqué dans le paquet du mini-programme.
// Un même logement reçoit toujours les mêmes médias (choix stable par son id).
// À remplacer par les vraies photos / vidéos envoyées par les bailleurs.
// ============================================================================

const photo = (id, w) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format&fit=crop`;

const video = (id) => ({
  src: `https://assets.mixkit.co/videos/${id}/${id}-720.mp4`,
  poster: `https://assets.mixkit.co/videos/${id}/${id}-thumb-360-0.jpg`
});

// Photos classées par pièce
const PHOTOS = {
  salon: [
    '1522708323590-d24dbb6b0267', '1502672260266-1c1ef2d93688', '1560448204-e02f11c3d0e2',
    '1505691938895-1758d7feb511', '1493809842364-78817add7ffb', '1554995207-c18c203602cb',
    '1586023492125-27b2c045efd7', '1513694203232-719a280e022f', '1567767292278-a4f21aa2d36e',
    '1598928506311-c55ded91a20c', '1600210492486-724fe5c67fb0'
  ],
  chambre: [
    '1540518614846-7eded433c457', '1595526114035-0d45ed16cfbf',
    '1531835551805-16d864c8d311', '1631049307264-da0ec9d70304'
  ],
  cuisine: ['1484154218962-a197022b5858', '1556911220-bff31c812dba'],
  douche: ['1552321554-5fefe8c9ef14', '1584622650111-993a426fbf0a'],
  facade: [
    '1512917774080-9991f1c4c750', '1568605114967-8130f3a36994',
    '1600585154340-be6161a56a0c', '1600596542815-ffad4c1539a9'
  ]
};

const VIDEOS = [4029, 3112, 4488, 4197, 4047, 4198].map(video);

// Hash simple et stable d'une chaîne (même id => mêmes médias)
function hashOf(key) {
  const s = String(key || '');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const pick = (list, h, offset = 0) => list[(h + offset) % list.length];

/**
 * Médias d'un logement : photo de couverture, galerie par pièce et vidéo de visite.
 * @param {string} key - id du logement
 * @returns {{ cover: string, gallery: Array<{id, label, url}>, video: {src, poster} }}
 */
export function getMedia(key) {
  const h = hashOf(key);
  const salon = pick(PHOTOS.salon, h);
  const gallery = [
    { id: 'salon', label: 'Salon', url: photo(salon, 900) },
    { id: 'chambre', label: 'Chambre', url: photo(pick(PHOTOS.chambre, h), 900) },
    { id: 'douche', label: 'Douche', url: photo(pick(PHOTOS.douche, h), 900) },
    { id: 'cuisine', label: 'Cuisine', url: photo(pick(PHOTOS.cuisine, h), 900) },
    { id: 'facade', label: 'Extérieur', url: photo(pick(PHOTOS.facade, h), 900) }
  ];
  return {
    cover: photo(salon, 600),
    gallery,
    video: pick(VIDEOS, h)
  };
}

/** Photo de couverture seule (vignettes, cartes). */
export function getCover(key) {
  return getMedia(key).cover;
}

/** Ajoute `cover` à un logement s'il n'en a pas déjà une. */
export function withCover(l) {
  return l && !l.cover ? Object.assign({}, l, { cover: getCover(l.id) }) : l;
}
