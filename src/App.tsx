import { useCallback, useState } from "react";
import productsData from "./data/products.json";
import { CartProvider } from "./context/CartContext";
import type { Filters, Product } from "./lib/types";
import { DEFAULT_FILTERS } from "./lib/types";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import FilterSidebar from "./components/FilterSidebar";
import ProductGrid from "./components/ProductGrid";
import CartDrawer from "./components/CartDrawer";
import Footer from "./components/Footer";
import Reveal from "./components/Reveal";

const products = productsData as Product[];

export default function App() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [resultCount, setResultCount] = useState(products.length);

  const patch = useCallback(
    (p: Partial<Filters>) => setFilters((f) => ({ ...f, ...p })),
    []
  );
  const reset = useCallback(() => setFilters(DEFAULT_FILTERS), []);
  const onVisible = useCallback((n: number) => setResultCount(n), []);

  return (
    <CartProvider>
      <div className="min-h-screen bg-ink font-sans text-parchment">
        <Nav />
        <main>
          <Hero />

          {/* ——— the roast log: filter rail + grid ——— */}
          <section id="log" className="scroll-mt-16 border-t border-char bg-parchment text-ink">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <Reveal className="flex flex-wrap items-end justify-between gap-4 border-b border-char py-10 lg:py-14">
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-smoke">
                    Shop — spring releases
                  </p>
                  <h2 className="mt-2 font-display text-4xl font-black tracking-[-0.01em] text-ink sm:text-5xl">
                    The roast log
                  </h2>
                </div>
                <p className="max-w-xs pb-1 text-sm leading-relaxed text-smoke">
                  Ten lots, dial readings published. Filter by where the needle
                  lands and what you want to pay.
                </p>
              </Reveal>

              <div className="grid lg:grid-cols-[292px_1fr]">
                <FilterSidebar
                  filters={filters}
                  onChange={patch}
                  onReset={reset}
                  resultCount={resultCount}
                  totalCount={products.length}
                />
                <div className="py-8 lg:py-12 lg:pl-10">
                  <ProductGrid filters={filters} onReset={reset} onVisibleChange={onVisible} />
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
        <CartDrawer />
      </div>
    </CartProvider>
  );
}
