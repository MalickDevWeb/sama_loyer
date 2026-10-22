const PRICE_TIERS = [
  { max: 2, key: 't1_2' },
  { max: 4, key: 't3_4' },
  { max: Infinity, key: 't5plus' },
];

function getUnitPrice(pricing, type, count) {
  if (count === 0) return 0;
  const tier = PRICE_TIERS.find(({ max }) => count <= max);
  const value = pricing && pricing[type] && pricing[type][tier.key];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new Error(`Tarif ${type === 'adult' ? 'adulte' : 'enfant'} indisponible pour ce nombre de voyageurs`);
  }
  return value;
}

export function calculatePackagePrice(pricing, adults, children) {
  if (!Number.isInteger(adults) || adults < 0 || !Number.isInteger(children) || children < 0) {
    throw new Error('Le nombre de voyageurs est invalide');
  }
  if (!pricing || typeof pricing !== 'object') {
    throw new Error('Le barème de prix est indisponible');
  }
  const adultUnitPrice = getUnitPrice(pricing, 'adult', adults);
  const childUnitPrice = getUnitPrice(pricing, 'child', children);
  const adultSubtotal = adults * adultUnitPrice;
  const childrenSubtotal = children * childUnitPrice;
  return { adultUnitPrice, childUnitPrice, adultSubtotal, childrenSubtotal, total: adultSubtotal + childrenSubtotal };
}
