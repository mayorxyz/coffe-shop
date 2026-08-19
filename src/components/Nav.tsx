import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function Nav() {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 h-16 bg-ink transition-[border-color,box-shadow] duration-300 ${
        scrolled
          ? "border-b border-char shadow-[0_8px_24px_-16px_rgba(0,0,0,0.8)]"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="font-display text-xl font-bold tracking-tight text-parchment"
          aria-label="Roast & Row — back to top"
        >
          Roast <em className="font-display italic font-semibold text-parchment/80">&amp;</em> Row
        </a>

        <button
          onClick={openCart}
          className="group relative flex h-10 items-center gap-2 border border-char px-3 text-parchment transition-colors duration-200 hover:border-smoke hover:bg-ink-deep"
          aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 7h12l1.5 13.5a1 1 0 0 1-1 1.1H5.5a1 1 0 0 1-1-1.1L6 7Z" />
            <path d="M8.5 10V6.5a3.5 3.5 0 0 1 7 0V10" />
          </svg>
          <span className="hidden text-sm font-medium sm:inline">Cart</span>
          {count > 0 && (
            <span
              key={count}
              className="badge-pop absolute -right-2 -top-2 grid h-[18px] min-w-[18px] place-items-center bg-cascara px-1 font-mono text-[10px] font-medium leading-none text-parchment"
            >
              {count}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}
