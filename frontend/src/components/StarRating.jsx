export default function StarRating({ value, className = '' }) {
  return <span className={`inline-flex items-center gap-1.5 ${className}`} aria-label={`${value} out of 5 stars`}>
    <span aria-hidden="true" className="text-amber-500">★</span>
    <span className="text-sm font-semibold tabular-nums">{value.toFixed(1)}</span>
    <span aria-hidden="true" className="text-xs text-slate-400">/ 5</span>
  </span>;
}
