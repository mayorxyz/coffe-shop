import { useEffect, useRef, useState } from "react";
import type { Product } from "../lib/types";
import { ROAST_LABEL } from "../lib/types";
import { useCart } from "../context/CartContext";
import RoastDial from "./RoastDial";

function Star({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2.6l2.83 5.9 6.47.86-4.75 4.5 1.2 6.4L12 17.2l-5.75 3.06 1.2-6.4-4.75-4.5 6.47-.86L12 2.6z" />
    </svg>
  );
}

interface ProductCardProps {
  product: Product;
  enterDelay?: number;
  entering?: boolean;
}

export default function ProductCard({ product, enterDelay = 0, entering = false }: ProductCardProps) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleAdd = () => {
    add(product.id);
    setAdded(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(false), 1100);
  };

  return (
    <article
      className={`group flex h-full flex-col border border-char/60 bg-parchment transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_-18px_rgba(27,23,18,0.5)] motion-reduce:hover:translate-y-0 motion-reduce:hover:shadow-none ${
        entering ? "card-in" : ""
      }`}
      style={entering ? { animationDelay: `${enterDelay}ms` } : undefined}
    >
      {/* image */}
      <div className="relative aspect-square overflow-hidden border-b border-char/40 bg-ink/5">
        <img
          src={product.image}
          alt={`${product.name} — ${product.roast} roast coffee from ${product.origin}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
        />
        <span className="absolute left-2 top-2 bg-ink/85 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.12em] text-parchment">
          {product.sku}
        </span>
      </div>

      {/* body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-semibold leading-snug text-ink">
            {product.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 font-mono text-xs text-ink">
            <Star className="h-3 w-3 text-ink" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-smoke">
          {product.origin} · {product.process} · {product.elevation}
        </p>

        <p className="mt-2 line-clamp-2 text-[13px] leading-snug text-smoke">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div className="flex items-center gap-2.5">
            <RoastDial
              value={product.roastDeg}
              size={44}
              tone="parchment"
              title={`Roast dial at ${product.roastDeg} degrees`}
            />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink">
                {ROAST_LABEL[product.roast]}
              </p>
              <p className="font-mono text-[11px] text-smoke">{product.roastDeg}°</p>
            </div>
          </div>
          <p className="font-mono text-base font-medium text-cascara">
            ${product.price.toFixed(2)}
          </p>
        </div>

        <button
          onClick={handleAdd}
          className={`mt-4 w-full border py-2 text-[13px] font-medium transition-all duration-200 active:scale-[0.98] motion-reduce:active:scale-100 ${
            added
              ? "border-leaf bg-leaf text-parchment"
              : "border-char text-ink hover:border-cascara hover:bg-cascara hover:text-parchment"
          }`}
        >
          {added ? "Added to cart ✓" : "Add to cart"}
        </button>
      </div>
    </article>
  );
}
