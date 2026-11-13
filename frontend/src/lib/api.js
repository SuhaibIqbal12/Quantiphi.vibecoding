export function productQuery(filters) {
  const query = new URLSearchParams();
  for (const category of filters.categories) query.append('categories', category);
  for (const key of ['min_price', 'max_price', 'min_rating']) {
    if (filters[key] !== null) query.set(key, String(filters[key]));
  }
  query.set('sort', filters.sort);
  return query.toString();
}

export async function getJson(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(response.status === 422
      ? 'These filter values are not valid. Reset filters and try again.'
      : 'We could not load the catalog. Check your connection and try again.');
  }
  return response.json();
}
