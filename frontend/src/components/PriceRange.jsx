import * as Slider from '@radix-ui/react-slider';
import { formatPrice } from '../lib/format';

export default function PriceRange({ bounds, minimum, maximum, onChange }) {
  const values = [minimum ?? bounds.min_price, maximum ?? bounds.max_price];
  return <div>
    <div className="mb-5 flex items-center justify-between gap-2 text-sm font-semibold tabular-nums">
      <output aria-label="Selected minimum price">{formatPrice(values[0])}</output>
      <span className="text-slate-300" aria-hidden="true">—</span>
      <output aria-label="Selected maximum price">{formatPrice(values[1])}</output>
    </div>
    <Slider.Root className="relative flex h-6 w-full touch-none select-none items-center"
      min={bounds.min_price} max={bounds.max_price} step={1} value={values}
      minStepsBetweenThumbs={0} onValueChange={onChange}>
      <Slider.Track className="relative h-1.5 grow rounded-full bg-slate-200">
        <Slider.Range className="absolute h-full rounded-full bg-teal-800" />
      </Slider.Track>
      <Slider.Thumb aria-label="Minimum price" className="slider-thumb" />
      <Slider.Thumb aria-label="Maximum price" className="slider-thumb" />
    </Slider.Root>
    <p className="mt-3 text-xs leading-relaxed text-slate-500">Drag either handle to set your budget.</p>
  </div>;
}
