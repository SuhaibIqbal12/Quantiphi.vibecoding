import Icon from './Icon';

export default function CatalogToolbar({ total, loading, error, sort, onSort, mobileOpen, toggleMobile }) {
  return <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <button aria-controls="catalog-filters" aria-expanded={mobileOpen} onClick={toggleMobile} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold lg:hidden"><Icon name="filter" className="h-4 w-4"/> Filters</button>
      <p role="status" aria-live="polite" className="text-sm text-slate-500">{loading ? 'Finding your products…' : error ? 'Catalog unavailable' : <><strong className="font-semibold text-slate-900">{total ?? 0}</strong> products found</>}</p>
    </div>
    <label className="flex items-center gap-2 text-xs text-slate-500">Sort by
      <select aria-label="Sort by" value={sort} onChange={event => onSort(event.target.value)} className="max-w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
        <option value="default">Featured</option><option value="price_asc">Price: Low to High</option><option value="rating_desc">Top Rated First</option>
      </select>
    </label>
  </div>;
}
