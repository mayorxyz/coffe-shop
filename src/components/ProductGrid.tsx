import { useEffect, useMemo, useRef, useState } from "react";
import productsData from "../data/products.json";
import type { Filters, Product } from "../lib/types";
import { DEFAULT_FILTERS } from "../lib/types";
import { usePrefersReducedMotion } from "../lib/hooks";
import ProductCard from "./ProductCard";

const products = productsData as Product[];

function applyFilters(filters: Filters): Product[] {
  const out = products.filter(
    (p) =>
      (filters.roast === "all" || p.roast === filters.roast) &&
      p.price >= filters.priceMin &&
      p.price <= filters.priceMax
  );
  switch (filters.sort) {
    case "price-asc":
      out.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      out.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      out.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break; // featured = log order
  }
  return out;
}

function SkeletonCard() {
  return (
    <div className="border border-char/40 bg-parchment" aria-hidden="true">
      <div className="skel aspect-square" />
      <div className="space-y-2.5 p-4">
        <div className="skel h-4 w-2/3" />
        <div className="skel h-3 w-1/2" />
        <div className="skel h-3 w-full" />
        <div className="skel h-3 w-5/6" />
        <div className="flex items-center justify-between pt-2">
          <div className="skel h-10 w-10 rounded-full" />
          <div className="skel h-4 w-14" />
        </div>
        <div className="skel h-9 w-full" />
      </div>
    </div>
  );
}

interface ProductGridProps {
  filters: Filters;
  onReset: () => void;
  onVisibleChange: (n: number) => void;
}

export default function ProductGrid({ filters, onReset, onVisibleChange }: ProductGridProps) {
  const reduced = usePrefersReducedMotion();
  const [booting, setBooting] = useState(true);
  const [rendered, setRendered] = useState<Product[]>([]);
  const [exiting, setExiting] = useState<Set<string>>(new Set());
  const [entering, setEntering] = useState<Set<string>>(new Set());
  const prevIds = useRef<Set<string>>(new Set());

  const visible = useMemo(() => applyFilters(filters), [filters]);
  const visibleKey = visible.map((p) => p.id).join("|");

  // simulated fetch so the skeleton reads honestly
  useEffect(() => {
    const t = window.setTimeout(() => setBooting(false), 700);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    onVisibleChange(visible.length);
  }, [visible.length, onVisibleChange]);

  useEffect(() => {
    if (booting) return;
    const nextIds = new Set(visible.map((p) => p.id));
    const gone = [...prevIds.current].filter((id) => !nextIds.has(id));

    if (gone.length === 0) {
      const fresh = new Set([...nextIds].filter((id) => !prevIds.current.has(id)));
      setEntering(fresh);
      setRendered(visible);
      prevIds.current = nextIds;
      return;
    }
    if (reduced) {
      setEntering(nextIds);
      setRendered(visible);
      setExiting(new Set());
      prevIds.current = nextIds;
      return;
    }
    // fade + collapse out, then swap
    setExiting(new Set(gone));
    const t = window.setTimeout(() => {
      const fresh = new Set([...nextIds].filter((id) => !prevIds.current.has(id)));
      setEntering(fresh);
      setRendered(visible);
      setExiting(new Set());
      prevIds.current = nextIds;
    }, 200);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey, booting, reduced]);

  if (booting) {
    return (
      <div
        className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        role="status"
        aria-label="Loading the roast log"
      >
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (rendered.length === 0) {
    return (
      <div className="card-in flex flex-col items-center border border-dashed border-char px-6 py-20 text-center">
        <p className="font-display text-2xl font-bold italic text-ink">
          No lots match that cut of the log.
        </p>
        <p className="mt-2 max-w-sm text-sm text-smoke">
          Widen the price range or clear the roast dial — every bean on the log
          is one adjustment away.
        </p>
        <button
          onClick={onReset}
          className="mt-6 border border-char px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:border-cascara hover:bg-cascara hover:text-parchment"
        >
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {rendered.map((p, i) => {
        const isExiting = exiting.has(p.id);
        return (
          <div
            key={p.id}
            className={`transition-all duration-200 ease-out ${
              isExiting ? "pointer-events-none scale-[0.97] opacity-0" : "opacity-100"
            }`}
          >
            <ProductCard
              product={p}
              entering={entering.has(p.id)}
              enterDelay={Math.min(i, 8) * 45}
            />
          </div>
        );
      })}
    </div>
  );
}
