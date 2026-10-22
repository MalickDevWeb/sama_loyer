export function normalizeText(value = '') {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeKey(value = '') {
  return normalizeText(value).replace(/\s+/g, '-');
}

export function filterDestinations(destinations = [], query = '', activeFilter = 'all') {
  const queryText = normalizeText(query);
  const filterKey = normalizeKey(activeFilter);

  return (destinations || []).filter((destination = {}) => {
    const tags = Array.isArray(destination.tags) ? destination.tags : [];
    const searchableText = normalizeText([
      destination.title,
      destination.subtitle,
      destination.category,
      destination.duration,
      destination.price,
      ...tags,
    ].join(' '));

    const destinationKeys = [
      destination.title,
      destination.subtitle,
      destination.category,
      ...tags,
    ].map(normalizeKey).filter(Boolean);

    const matchesQuery = !queryText || searchableText.includes(queryText);
    const matchesFilter = !filterKey || filterKey === 'all'
      || destinationKeys.some((key) => key === filterKey || key.includes(filterKey));

    return matchesQuery && matchesFilter;
  });
}
