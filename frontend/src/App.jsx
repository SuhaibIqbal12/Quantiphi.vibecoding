import { useEffect, useState } from 'react';

// Stage one: verify the real API integration. Sidebar controls follow next.
export default function App() {
  const [catalog, setCatalog] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/products', { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('The catalog could not be loaded.');
        return response.json();
      })
      .then(setCatalog)
      .catch(error => { if (error.name !== 'AbortError') setError(error.message); });
    return () => controller.abort();
  }, []);
  return <main className="mx-auto max-w-7xl p-6 md:p-10">
    <p className="mb-2 text-sm font-bold tracking-widest text-indigo-600">QUANTIPHI MARKETPLACE</p>
    <h1 className="text-3xl font-bold">Discover your everyday essentials</h1>
    <p className="mt-3 text-slate-600">Catalog foundation · Filters and sorting controls are next.</p>
    {error && <p role="alert" className="mt-6 text-red-700">{error}</p>}
    {!catalog && !error && <p role="status" className="mt-6">Loading catalog…</p>}
    {catalog && <>
      <p role="status" className="my-6">{catalog.total} products</p>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {catalog.products.map(product => <article key={product.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <img src={product.image} alt={product.name} loading="lazy" className="h-48 w-full object-cover" />
          <div className="p-4">
            <p className="text-xs text-slate-500">{product.category}</p>
            <h2 className="mt-1 font-semibold">{product.name}</h2>
            <p className="mt-3 font-bold">₹{product.price}</p>
            <p className="mt-1 text-sm text-amber-700" aria-label={`${product.rating} out of 5 stars`}>★ {product.rating} / 5</p>
          </div>
        </article>)}
      </div>
    </>}
  </main>;
}
