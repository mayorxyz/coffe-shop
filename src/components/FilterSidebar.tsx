import type { Filters, RoastFilter, SortKey } from "../lib/types";
import { DEFAULT_FILTERS, PRICE_CEIL, PRICE_FLOOR } from "../lib/types";
import RoastDial, { SEG_MID } from "./RoastDial";
import Reveal from "./Reveal";

interface FilterSidebarProps {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  resultCount: number;
  totalCount: number;
}

const ROAST_CHIPS: { key: RoastFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "light", label: "Lt" },
  { key: "medium", label: "Md" },
  { key: "dark", label: "Dk" },
];

const RANGE_TEXT: Record<RoastFilter, string> = {
  all: "0–100° · every roast on the log",
  light: "0–33° · light — florals & fruit acid",
  medium: "34–66° · medium — sugar browning",
  dark: "67–100° · dark — smoke & body",
};

export default function FilterSidebar({
  filters,
  onChange,
  onReset,
  resultCount,
  totalCount,
}: FilterSidebarProps) {
  const { roast, priceMin, priceMax, sort } = filters;
  const dirty =
    roast !== "all" ||
    priceMin !== DEFAULT_FILTERS.priceMin ||
    priceMax !== DEFAULT_FILTERS.priceMax ||
    sort !== "featured";

  const pct = (v: number) => ((v - PRICE_FLOOR) / (PRICE_CEIL - PRICE_FLOOR)) * 100;

  return (
    <Reveal>
      <aside
        className="border-b border-char bg-parchment lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto lg:border-b-0 lg:border-r"
        aria-label="Filter the roast log"
      >
        <div className="p-5 lg:p-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Filter the log</h2>
            <span className="font-mono text-[11px] text-smoke">
              {resultCount}/{totalCount}
            </span>
          </div>

          {/* ——— roast dial filter ——— */}
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke">
              Roast level
            </p>
            <p className="mt-1 text-xs leading-snug text-smoke/90">
              Click a band on the dial — or the hub for everything.
            </p>
            <div className="mt-3 flex justify-center">
              <RoastDial
                value={roast === "all" ? null : SEG_MID[roast]}
                size={172}
                tone="parchment"
                showScale
                glide
                interactive
                activeSeg={roast}
                onSelect={(r) => onChange({ roast: r })}
                title="Roast level filter dial"
              />
            </div>
            <p
              className="mt-1 text-center font-mono text-[11px] text-char"
              aria-live="polite"
            >
              {RANGE_TEXT[roast]}
            </p>

            <div className="mt-3 flex justify-center gap-1.5">
              {ROAST_CHIPS.map((c) => {
                const active = roast === c.key;
                return (
                  <button
                    key={c.key}
                    onClick={() => onChange({ roast: c.key })}
                    aria-pressed={active}
                    className={`border px-2.5 py-1 font-mono text-[11px] transition-colors duration-150 ${
                      active
                        ? "border-cascara bg-cascara text-parchment"
                        : "border-char/70 text-char hover:border-cascara hover:text-cascara"
                    }`}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ——— price range ——— */}
          <div className="mt-8">
            <div className="flex items-baseline justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke">
                Price · 250 g
              </p>
              <p className="font-mono text-xs text-ink">
                ${priceMin} – ${priceMax}
              </p>
            </div>
            <div className="relative mt-3 h-5">
              <div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 bg-ink/15" />
              <div
                className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-ink"
                style={{ left: `${pct(priceMin)}%`, right: `${100 - pct(priceMax)}%` }}
              />
              <input
                type="range"
                className="rr-range"
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                step={1}
                value={priceMin}
                aria-label="Minimum price"
                onChange={(e) =>
                  onChange({ priceMin: Math.min(Number(e.target.value), priceMax - 1) })
                }
              />
              <input
                type="range"
                className="rr-range"
                min={PRICE_FLOOR}
                max={PRICE_CEIL}
                step={1}
                value={priceMax}
                aria-label="Maximum price"
                onChange={(e) =>
                  onChange({ priceMax: Math.max(Number(e.target.value), priceMin + 1) })
                }
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[10px] text-smoke">
              <span>${PRICE_FLOOR}</span>
              <span>${PRICE_CEIL}</span>
            </div>
          </div>

          {/* ——— sort ——— */}
          <div className="mt-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-smoke">
              Sort
            </p>
            <div className="relative mt-2">
              <select
                value={sort}
                onChange={(e) => onChange({ sort: e.target.value as SortKey })}
                className="w-full appearance-none border border-char/70 bg-parchment px-3 py-2 pr-9 text-sm text-ink outline-none transition-colors focus:border-cascara"
                aria-label="Sort products"
              >
                <option value="featured">Featured — log order</option>
                <option value="price-asc">Price · low → high</option>
                <option value="price-desc">Price · high → low</option>
                <option value="rating-desc">Cup score · best first</option>
              </select>
              <svg
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-char"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>

          {dirty && (
            <button
              onClick={onReset}
              className="mt-8 w-full border border-char py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-char transition-colors duration-150 hover:border-cascara hover:text-cascara"
            >
              Reset filters
            </button>
          )}
        </div>
      </aside>
    </Reveal>
  );
}
