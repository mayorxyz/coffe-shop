import { useEffect, useState } from "react";
import productsData from "../data/products.json";
import type { Product } from "../lib/types";
import { usePrefersReducedMotion } from "../lib/hooks";
import RoastDial from "./RoastDial";

const products = productsData as Product[];

const DEMO_DEG = 62; // lot RR-044, just past first crack

/** Roast-curve annotations: (x, y on the 1440×300 curve, label) */
const CURVE_POINTS: {
  x: number;
  y: number;
  label: string;
  anchor: "start" | "middle" | "end";
  dy: number;
}[] = [
  { x: 14, y: 62, label: "CHARGE 197°", anchor: "start", dy: -12 },
  { x: 262, y: 246, label: "TURNING POINT 96°", anchor: "start", dy: 22 },
  { x: 1052, y: 70, label: "FIRST CRACK 9:42", anchor: "middle", dy: -14 },
  { x: 1428, y: 24, label: "DROP 211°", anchor: "end", dy: 24 },
];

function useCountUp(target: number, duration = 800) {
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (reduced) {
      setN(target);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const e = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * e));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);
  return n;
}

export default function Hero() {
  const reduced = usePrefersReducedMotion();
  const readout = useCountUp(DEMO_DEG, 800);

  const origins = new Set(products.map((p) => p.origin.split("·")[0].trim())).size;
  const avgCup = (
    products.reduce((s, p) => s + p.rating, 0) / products.length
  ).toFixed(1);

  const scrollToLog = () => {
    document.getElementById("log")?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const tickerItems = products.map(
    (p) => `${p.sku} ${p.name.toUpperCase()} — ${p.origin.toUpperCase()} — CUP ${p.rating.toFixed(1)}`
  );

  return (
    <section className="noise grid-paper relative overflow-hidden bg-ink" id="top">
      {/* ambient roast curve, drawing itself behind the copy */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-12 z-0 h-56 w-full opacity-60 sm:h-72"
        viewBox="0 0 1440 300"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          x1="1052"
          y1="0"
          x2="1052"
          y2="300"
          stroke="#8C8275"
          strokeOpacity="0.14"
          strokeDasharray="3 6"
        />
        <path
          className="curve-path"
          d="M 0 62 C 60 122, 130 224, 262 246 C 430 274, 700 168, 950 96 C 1150 40, 1300 30, 1440 24"
          fill="none"
          stroke="#8C8275"
          strokeOpacity="0.45"
          strokeWidth="1.5"
        />
        <g className="curve-fade">
          {CURVE_POINTS.map((p) => (
            <g key={p.label}>
              <circle
                cx={p.x}
                cy={p.y}
                r="3.5"
                fill={p.label.startsWith("FIRST") ? "#B23A2E" : "#8C8275"}
              />
              <text
                x={p.x}
                y={p.y + p.dy}
                textAnchor={p.anchor}
                fill="#8C8275"
                style={{ font: "500 11px 'IBM Plex Mono', monospace", letterSpacing: "0.08em" }}
              >
                {p.label}
              </text>
            </g>
          ))}
        </g>
      </svg>

      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:pb-32 lg:pt-20">
        {/* copy — 7/12 */}
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-smoke">
            Roast log — Spring ’25 · Drum № 2 · 12 kg
          </p>

          <h1 className="mt-5 font-display text-[44px] font-black leading-[1.02] tracking-[-0.015em] text-parchment sm:text-6xl lg:text-[72px]">
            Roasted to the{" "}
            <em className="font-display italic font-bold text-parchment">degree,</em>
            <br />
            not the guess.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-parchment/70 sm:text-lg">
            Every lot we drop ships with its roast curve and cupping score
            published next to the beans. Pick your next bag by the numbers —
            brightness, body, and exactly where the needle lands.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <button
              onClick={scrollToLog}
              className="group inline-flex items-center gap-3 bg-cascara px-6 py-3.5 text-[15px] font-semibold text-parchment transition-all duration-200 hover:bg-cascara-deep active:translate-y-px"
            >
              Browse the roast log
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-200 group-hover:translate-y-0.5"
                aria-hidden="true"
              >
                <path d="M12 4v16m0 0 6-6m-6 6-6-6" />
              </svg>
            </button>
            <span className="font-mono text-xs text-smoke">
              {products.length} lots on the log ↓
            </span>
          </div>

          {/* data strip — the lab-results footer of the hero */}
          <dl className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-char border-y border-char">
            {[
              { n: String(products.length), l: "lots logged" },
              { n: String(origins), l: "origins" },
              { n: avgCup, l: "avg cup score" },
            ].map((s) => (
              <div key={s.l} className="px-4 py-4 first:pl-0">
                <dd className="font-mono text-2xl font-medium text-parchment sm:text-3xl">
                  {s.n}
                </dd>
                <dt className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-smoke">
                  {s.l}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* the signature dial — 5/12 */}
        <div className="lg:col-span-5">
          <div className="mx-auto w-full max-w-[420px]">
            <RoastDial
              value={DEMO_DEG}
              animate
              fluid
              tone="ink"
              showScale
              className="mx-auto w-full max-w-[380px]"
              title="Roast dial showing lot RR-044 at 62 degrees"
            />
            <div className="-mt-3 text-center">
              <p className="font-mono text-5xl font-medium tabular-nums text-parchment">
                {readout}
                <span className="text-2xl text-smoke">°</span>
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.2em] text-smoke">
                Lot RR-044 · first crack 9:42
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* lot ticker */}
      <div className="ticker relative z-10 overflow-hidden border-t border-char py-3" aria-hidden="true">
        <div className="ticker-track">
          {[0, 1].map((half) => (
            <div key={half} className="flex shrink-0 items-center">
              {tickerItems.map((t) => (
                <span
                  key={`${half}-${t}`}
                  className="flex items-center whitespace-nowrap font-mono text-[11px] tracking-[0.14em] text-smoke"
                >
                  <span className="px-6">{t}</span>
                  <span className="text-cascara">◆</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
