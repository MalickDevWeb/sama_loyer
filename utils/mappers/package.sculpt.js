/** Package projection shared by Home, Explorer, Favorites and package cards. */
import { formatPackagePrice } from '../formatters/index.js';

const mapPrice = (data) => (
  data && data.price != null ? formatPackagePrice(Number(data.price), data.currency) : ''
);

function mapPricing(data) {
  if (!data.pricing) return null;
  return {
    adult: {
      t1_2: data.pricing.adult && data.pricing.adult.t1_2,
      t3_4: data.pricing.adult && data.pricing.adult.t3_4,
      t5plus: data.pricing.adult && data.pricing.adult.t5plus,
    },
    child: {
      t1_2: data.pricing.child && data.pricing.child.t1_2,
      t3_4: data.pricing.child && data.pricing.child.t3_4,
      t5plus: data.pricing.child && data.pricing.child.t5plus,
    },
  };
}

export const PackageCardSchema = {
  id: '@link.id',
  title: '@link.title',
  price: mapPrice,
  subtitle: '@link.location',
  duration: '@link.duration',
  image: '@link.image',
  category: (data) => (Array.isArray(data?.categories) && data.categories[0]) || '',
  tags: '@link.categories',
};

/** Detail projection includes the fields needed by the detail view and booking Bus. */
export const PackageDetailSchema = {
  id: '@link.id',
  title: '@link.title',
  price: mapPrice,
  currency: '@link.currency',
  subtitle: '@link.location',
  duration: '@link.duration',
  image: '@link.image',
  rating: '@link.rating',
  reviewCount: '@link.review_count',
  category: (data) => (Array.isArray(data?.categories) && data.categories[0]) || '',
  minDays: (data) => (data.min_days == null ? null : Number(data.min_days)),
  pricing: mapPricing,
  description: '@link.description',
  gallery: '@link.gallery',
};
