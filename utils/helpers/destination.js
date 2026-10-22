function uniqueImages(images = []) {
  const seen = {};
  return images.filter((image) => {
    if (!image || seen[image]) return false;
    seen[image] = true;
    return true;
  });
}

function buildGallery(destination) {
  const gallery = Array.isArray(destination.gallery) && destination.gallery.length
    ? destination.gallery
    : [destination.image];
  return uniqueImages(gallery);
}

function getGalleryMode(count) {
  if (count <= 1) return 'single';
  if (count === 2) return 'double';
  return 'mosaic';
}

function normalizeRating(value) {
  const rating = Number(value);
  return Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 0;
}

function buildStars(rating) {
  const roundedRating = Math.round(rating);
  return [1, 2, 3, 4, 5].map((value) => ({ value, icon: '★', active: value <= roundedRating }));
}

function buildRemainingGalleryItems(images) {
  const hasSingleLastImage = images.length % 2 === 1;
  return images.map((src, index) => ({ src, index: index + 1, fullWidth: hasSingleLastImage && index === images.length - 1 }));
}

export function toDestinationDetailView(destination) {
  const gallery = buildGallery(destination);
  const reviewCount = Number(destination.reviewCount || 0);
  const rating = normalizeRating(destination.rating);
  const remainingGalleryImages = gallery.slice(1);
  return {
    id: destination.id,
    title: destination.title,
    price: destination.price,
    currency: destination.currency,
    subtitle: destination.subtitle,
    duration: destination.duration || '',
    category: destination.category || destination.subtitle || '',
    description: destination.description || '',
    ratingLabel: Number.isInteger(rating) ? String(rating) : rating.toFixed(1),
    stars: buildStars(rating),
    reviewLabel: `(${reviewCount} avis)`,
    heroImage: destination.image || '',
    like: Boolean(destination.like),
    minDays: destination.minDays,
    pricing: destination.pricing,
    gallery,
    galleryMode: getGalleryMode(gallery.length),
    mainGalleryImage: gallery[0] || '',
    remainingGalleryImages,
    remainingGalleryItems: buildRemainingGalleryItems(remainingGalleryImages),
  };
}
