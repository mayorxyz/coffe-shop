import { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { usePrefersReducedMotion } from "../lib/hooks";

export default function CartDrawer() {
  const { lines, count, subtotal, isOpen, closeCart, setQty, remove, productOf } =
    useCart();
  const reduced = usePrefersReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  // move focus into the drawer each time it opens
  useEffect(() => {
    if (isOpen) closeRef.current?.focus();
  }, [isOpen]);

  // keep the hidden panel out of the tab order
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isOpen) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [isOpen]);

  // Escape to close + scroll lock while open
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  const browse = () => {
    closeCart();
    window.setTimeout(() => {
      document.getElementById("log")?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
      });
    }, reduced ? 0 : 260);
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      {/* scrim */}
      <button
        tabIndex={-1}
        aria-label="Close cart"
        onClick={closeCart}
        className={`absolute inset-0 h-full w-full cursor-default bg-ink/70 transition-opacity duration-[250ms] ease-in-out ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-char bg-ink transition-[transform,opacity] duration-[250ms] ease-in-out ${
          isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }`}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-char px-6 py-5">
          <div>
            <h2 className="font-display text-2xl font-bold text-parchment">Your order</h2>
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.18em] text-smoke">
              {count} item{count === 1 ? "" : "s"} on the ledger
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={closeCart}
            tabIndex={isOpen ? 0 : -1}
            className="grid h-10 w-10 place-items-center border border-char text-parchment transition-colors duration-150 hover:border-cascara hover:text-cascara"
            aria-label="Close cart"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          /* ——— empty state ——— */
          <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 text-center">
            <p className="font-display text-2xl font-semibold italic leading-snug text-parchment">
              Your cart is empty — go find your next favorite roast.
            </p>
            <button
              onClick={browse}
              className="border border-char px-5 py-2.5 text-sm font-medium text-parchment transition-colors duration-200 hover:border-cascara hover:bg-cascara"
            >
              Browse the roast log
            </button>
          </div>
        ) : (
          <>
            {/* line items */}
            <ul className="ledger-scroll flex-1 divide-y divide-char/70 overflow-y-auto px-6">
              {lines.map((line) => {
                const p = productOf(line.id);
                if (!p) return null;
                return (
                  <li key={line.id} className="flex gap-4 py-5">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-16 w-16 shrink-0 border border-char object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-semibold text-parchment">
                          {p.name}
                        </p>
                        <p className="font-mono text-[13px] text-parchment">
                          ${(p.price * line.qty).toFixed(2)}
                        </p>
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-smoke">
                        {p.sku} · ${p.price.toFixed(2)} / 250 g
                      </p>

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center border border-char">
                          <button
                            onClick={() => setQty(line.id, line.qty - 1)}
                            className="grid h-7 w-8 place-items-center text-parchment transition-colors hover:bg-cascara"
                            aria-label={`Decrease quantity of ${p.name}`}
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M1 6h10" />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-mono text-[13px] text-parchment">
                            {line.qty}
                          </span>
                          <button
                            onClick={() => setQty(line.id, line.qty + 1)}
                            className="grid h-7 w-8 place-items-center text-parchment transition-colors hover:bg-cascara"
                            aria-label={`Increase quantity of ${p.name}`}
                          >
                            <svg width="10" height="10" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                              <path d="M1 6h10M6 1v10" />
                            </svg>
                          </button>
                        </div>
                        <button
                          onClick={() => remove(line.id)}
                          className="font-mono text-[10px] uppercase tracking-[0.14em] text-smoke transition-colors hover:text-cascara"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* running total */}
            <div className="border-t border-char px-6 py-5">
              <div className="flex items-baseline justify-between">
                <p className="text-sm text-smoke">Subtotal · 250 g bags</p>
                <p className="font-mono text-sm text-parchment">${subtotal.toFixed(2)}</p>
              </div>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="font-display text-lg font-bold text-parchment">Total</p>
                <p className="font-mono text-3xl font-medium tabular-nums text-parchment">
                  ${subtotal.toFixed(2)}
                </p>
              </div>
              <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-smoke">
                Demo ledger — nothing is charged, nothing ships
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
