import { useState } from 'react';
import { useCatalog } from './hooks/useCatalog';
import Icon from './components/Icon';
import FilterSidebar from './components/FilterSidebar';
import CatalogToolbar from './components/CatalogToolbar';
import CatalogResults from './components/CatalogResults';

export default function App() {
  const { filters, setFilters, metadata, result, loading, error, reset, retry } = useCatalog();
  const [mobileOpen, setMobileOpen] = useState(false);
  return <>
    <a href="#products" className="sr-only focus:not-sr-only focus:fixed focus:z-50 focus:bg-white focus:p-3">Skip to products</a>
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-[#fcfcfa]/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-[1440px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
        <a href="/" aria-label="Forma marketplace home" className="flex items-center gap-2.5 text-xl font-bold tracking-tight"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-900 text-white"><Icon name="bag" className="h-5 w-5"/></span>forma<span className="text-teal-700">.</span></a>
        <span className="text-xs font-medium tracking-wide text-slate-500 sm:text-sm">Everyday finds. Thoughtfully chosen.</span>
      </div>
    </header>
    <main className="mx-auto max-w-[1440px] px-5 pb-16 pt-7 sm:px-8 lg:px-12">
      <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-xs text-slate-400"><a href="/" className="hover:text-teal-800">Home</a><Icon name="arrow" className="h-3 w-3"/><span className="text-slate-600">All products</span></nav>
      <section className="hero-panel relative mb-9 overflow-hidden rounded-2xl border border-[#dce5dd] bg-[#e9f0e9] px-6 py-9 sm:px-10 sm:py-11">
        <div className="relative z-10 max-w-xl"><p className="mb-3 text-[10px] font-bold uppercase tracking-[.22em] text-teal-800">THE EVERYDAY COLLECTION</p><h1 className="text-3xl font-semibold tracking-tight text-[#193f34] sm:text-4xl">Good things for<br/>your everyday.</h1><p className="mt-4 max-w-sm text-sm leading-relaxed text-[#597166]">From small upgrades to new favorites. Discover the things that make life a little better.</p></div>
        <div aria-hidden="true" className="hero-orbit hidden sm:block"><div className="hero-square"/><div className="hero-disc"/><div className="hero-pill"/></div>
      </section>
      <div className="mb-6 flex items-center justify-between gap-3"><h2 id="products" className="scroll-mt-24 text-xl font-bold tracking-tight">Explore the collection</h2><span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Find your everyday</span></div>
      <div className="grid items-start gap-7 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-8">
        {metadata && <FilterSidebar metadata={metadata} filters={filters} onChange={setFilters} onReset={reset} mobileOpen={mobileOpen}/>}
        <section aria-label="Product catalog" aria-busy={loading} className="min-w-0">
          <CatalogToolbar total={error ? 0 : result?.total} loading={loading} sort={filters.sort} onSort={sort => setFilters(previous => ({...previous, sort}))} mobileOpen={mobileOpen} toggleMobile={() => setMobileOpen(open => !open)}/>
          <CatalogResults loading={loading} error={error} result={result} onReset={reset} onRetry={retry}/>
        </section>
      </div>
    </main>
    <footer className="border-t border-slate-200 px-5 py-6 text-center text-xs text-slate-400">forma. · Thoughtful finds for everyday living · Prices in INR</footer>
  </>;
}
