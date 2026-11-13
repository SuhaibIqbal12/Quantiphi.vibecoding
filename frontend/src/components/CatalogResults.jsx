import ProductCard from './ProductCard';
import Icon from './Icon';

export default function CatalogResults({ loading, error, result, onReset, onRetry }) {
  if (error) return <div role="alert" className="rounded-2xl border border-red-100 bg-white px-6 py-16 text-center"><h2 className="text-lg font-bold">Something went wrong</h2><p className="mx-auto mt-3 max-w-md text-sm text-slate-500">{error}</p><button onClick={onRetry} className="primary-button mt-6">Try again</button></div>;
  if (loading) return <div aria-label="Loading products" role="status" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white" aria-hidden="true"><div className="aspect-[4/3] bg-slate-200"/><div className="space-y-3 p-5"><div className="h-3 w-1/3 rounded bg-slate-100"/><div className="h-4 w-4/5 rounded bg-slate-200"/><div className="h-5 w-1/2 rounded bg-slate-100"/></div></div>)}
  </div>;
  if (!result || result.total === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-800"><Icon name="box" className="h-7 w-7"/></div>
    <h2 className="mt-6 text-xl font-bold">No items match your criteria.</h2><p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-slate-500">Try a wider price range or a different category. Your next find is out there.</p>
    <button onClick={onReset} className="primary-button mx-auto mt-7 flex items-center gap-2"><Icon name="reset" className="h-4 w-4"/> Reset Filters</button>
  </div>;
  return <div aria-label="Products" className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">{result.products.map(product => <ProductCard key={product.id} product={product}/>)}</div>;
}
