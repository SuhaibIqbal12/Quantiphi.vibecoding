import { useState } from 'react';
import StarRating from './StarRating';
import Icon from './Icon';
import { formatPrice } from '../lib/format';

export default function ProductCard({ product }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <article className="group overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60">
    <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#eef0ef]">
      {imageFailed ? <div role="img" aria-label={product.name} className="flex flex-col items-center gap-2 text-slate-400"><Icon name="box" className="h-10 w-10"/><span className="text-xs">Image unavailable</span></div>
        : <img src={product.image} alt={product.name} loading="lazy" onError={() => setImageFailed(true)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/>}
    </div>
    <div className="p-4 sm:p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-slate-500">{product.category}</p>
      <h3 className="mt-2 min-h-11 text-sm font-semibold leading-snug text-slate-800">{product.name}</h3>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <p className="text-base font-bold tracking-tight">{formatPrice(product.price)}</p>
        <StarRating value={product.rating}/>
      </div>
    </div>
  </article>;
}
