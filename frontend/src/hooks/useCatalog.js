import { useEffect, useRef, useState } from 'react';
import { getJson, productQuery } from '../lib/api';

export const defaultFilters = () => ({
  categories: [], min_price: null, max_price: null, min_rating: null, sort: 'default',
});

export function useCatalog() {
  const [filters, setFilters] = useState(defaultFilters);
  const [metadata, setMetadata] = useState(null);
  const metadataCache = useRef(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError('');
    // The server owns the product count, price bounds, filtering and sorting.
    Promise.all([
      metadataCache.current ? Promise.resolve(metadataCache.current) : getJson('/api/catalog', controller.signal),
      getJson(`/api/products?${productQuery(filters)}`, controller.signal),
    ]).then(([catalog, products]) => {
      if (active) { metadataCache.current = catalog; setMetadata(catalog); setResult(products); }
    }).catch(err => {
      if (active && err.name !== 'AbortError') {
        setError(err instanceof TypeError
          ? 'Unable to reach the catalog. Check your connection and try again.' : err.message);
      }
    }).finally(() => { if (active) setLoading(false); });
    // Both cancellation and the active flag prevent stale responses from winning.
    return () => { active = false; controller.abort(); };
  }, [filters, attempt]);

  return {
    filters, setFilters, metadata, result, loading, error,
    reset: () => setFilters(defaultFilters()),
    retry: () => setAttempt(value => value + 1),
  };
}
