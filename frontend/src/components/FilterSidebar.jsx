import PriceRange from './PriceRange';
import Icon from './Icon';

export default function FilterSidebar({ metadata, filters, onChange, onReset, mobileOpen }) {
  function toggleCategory(category) {
    onChange(previous => ({ ...previous, categories: previous.categories.includes(category)
      ? previous.categories.filter(value => value !== category)
      : [...previous.categories, category] }));
  }
  return <aside id="catalog-filters" aria-label="Product filters"
    className={`${mobileOpen ? 'block' : 'hidden'} self-start rounded-2xl border border-slate-200/80 bg-white lg:sticky lg:top-24 lg:block lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto`}>
    <div className="flex items-center justify-between border-b border-slate-100 p-5">
      <h2 className="flex items-center gap-2 text-base font-bold"><Icon name="filter" className="h-4 w-4"/> Filters</h2>
      <button onClick={onReset} className="text-xs font-semibold text-teal-800 hover:underline">Reset all</button>
    </div>
    <div className="divide-y divide-slate-100 px-5">
      <fieldset className="py-6">
        <legend className="float-left mb-4 w-full text-xs font-bold uppercase tracking-widest text-slate-500">Category</legend>
        <div className="clear-both space-y-3.5">
          {metadata.categories.map(category => <label key={category} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600 hover:text-teal-900">
            <input type="checkbox" checked={filters.categories.includes(category)} onChange={() => toggleCategory(category)} className="h-4 w-4 rounded accent-teal-800" />
            {category}
          </label>)}
        </div>
      </fieldset>
      <fieldset className="py-6">
        <legend className="float-left mb-4 w-full text-xs font-bold uppercase tracking-widest text-slate-500">Price range</legend>
        <div className="clear-both"><PriceRange bounds={metadata} minimum={filters.min_price} maximum={filters.max_price}
          onChange={([min_price, max_price]) => onChange(previous => ({ ...previous, min_price, max_price }))}/></div>
      </fieldset>
      <fieldset className="py-6">
        <legend className="float-left mb-4 w-full text-xs font-bold uppercase tracking-widest text-slate-500">Minimum rating</legend>
        <div className="clear-both space-y-3">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
            <input type="radio" name="rating" checked={filters.min_rating === null} onChange={() => onChange(previous => ({...previous, min_rating: null}))} className="h-4 w-4 accent-teal-800"/> Any rating
          </label>
          {[5, 4, 3, 2, 1].map(rating => <label key={rating} className="flex cursor-pointer items-center gap-3 text-sm">
            <input type="radio" name="rating" aria-label={`${rating} stars and above`} checked={filters.min_rating === rating}
              onChange={() => onChange(previous => ({...previous, min_rating: rating}))} className="h-4 w-4 accent-teal-800"/>
            <span aria-hidden="true" className="tracking-wider"><span className="text-amber-500">{'★'.repeat(rating)}</span><span className="text-slate-200">{'★'.repeat(5-rating)}</span></span>
            <span aria-hidden="true" className="text-xs text-slate-500">& up</span>
          </label>)}
        </div>
      </fieldset>
    </div>
    <div className="mx-5 mb-5 rounded-xl bg-[#f3f7f5] p-4 text-xs leading-relaxed text-teal-900">A little more you.<br/><span className="text-slate-500">Find the right fit for your everyday.</span></div>
  </aside>;
}
