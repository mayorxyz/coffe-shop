import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import type { RoastFilter, RoastLevel } from "../lib/types";
import { usePrefersReducedMotion } from "../lib/hooks";

/* ————————————————————————————————————————————————
   The roast dial: a 270° gauge running 0 (green)
   through char to near-black, with a cascara needle.
   Used at three scales — hero sweep, card marker,
   and the interactive filter control.
   ———————————————————————————————————————————————— */

const C = 70; // viewBox center
const R = 46; // arc radius
const SW = 9; // arc stroke

interface Segment {
  key: RoastLevel;
  from: number;
  to: number;
  color: string;
}

const SEGMENTS: Segment[] = [
  { key: "light", from: 0, to: 32.4, color: "#6B7A4F" }, // green coffee
  { key: "medium", from: 34.2, to: 65.8, color: "#4A3F36" }, // char
  { key: "dark", from: 67.6, to: 100, color: "#221C15" }, // near-black
];

const SEG_MID: Record<RoastLevel, number> = { light: 16, medium: 50, dark: 84 };

function rad(v: number) {
  return ((135 + v * 2.7) * Math.PI) / 180;
}
function pt(v: number, r: number) {
  const a = rad(v);
  return { x: C + r * Math.cos(a), y: C + r * Math.sin(a) };
}
function arcPath(v1: number, v2: number, r: number = R) {
  const a = pt(v1, r);
  const b = pt(v2, r);
  const large = (v2 - v1) * 2.7 > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

interface RoastDialProps {
  /** Needle position 0–100, or null to hide the needle */
  value: number | null;
  /** Fixed pixel size (ignored when fluid) */
  size?: number;
  fluid?: boolean;
  tone?: "ink" | "parchment";
  /** One-shot 800 ms sweep on mount (hero) */
  animate?: boolean;
  /** Tween between value changes (sidebar) */
  glide?: boolean;
  showScale?: boolean;
  interactive?: boolean;
  activeSeg?: RoastFilter;
  onSelect?: (r: RoastFilter) => void;
  className?: string;
  title?: string;
}

export default function RoastDial({
  value,
  size = 64,
  fluid = false,
  tone = "parchment",
  animate = false,
  glide = false,
  showScale = false,
  interactive = false,
  activeSeg = "all",
  onSelect,
  className,
  title,
}: RoastDialProps) {
  const reduced = usePrefersReducedMotion();
  const [disp, setDisp] = useState<number>(() =>
    animate && !reduced ? 0 : (value ?? 0)
  );
  const dispRef = useRef(disp);
  dispRef.current = disp;
  const lastVal = useRef<number>(value ?? 0);
  if (value != null) lastVal.current = value;
  const first = useRef(true);
  const [hoverSeg, setHoverSeg] = useState<RoastLevel | null>(null);

  useEffect(() => {
    const to = value ?? lastVal.current;
    if (reduced) {
      setDisp(to);
      first.current = false;
      return;
    }
    const from = dispRef.current;
    const isFirst = first.current;
    first.current = false;
    const dur = animate && isFirst ? 800 : glide ? 300 : 0;
    if (dur === 0 || from === to) {
      setDisp(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setDisp(from + (to - from) * e);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, animate, glide, reduced]);

  const tickColor =
    tone === "ink" ? "rgba(239,230,214,0.32)" : "rgba(27,23,18,0.32)";
  const labelColor = tone === "ink" ? "#8C8275" : "#4A3F36";

  const ticks = [];
  for (let v = 0; v <= 100; v += 5) {
    const major = v % 25 === 0;
    const p1 = pt(v, R + SW / 2 + 2.5);
    const p2 = pt(v, R + SW / 2 + 2.5 + (major ? 5.5 : 2.75));
    ticks.push(
      <line
        key={v}
        x1={p1.x}
        y1={p1.y}
        x2={p2.x}
        y2={p2.y}
        stroke={tickColor}
        strokeWidth={major ? 1.6 : 1}
      />
    );
  }

  const scaleLabels = [0, 50, 100].map((v) => {
    const p = pt(v, R + SW / 2 + 15);
    return (
      <text
        key={v}
        x={p.x}
        y={p.y}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={labelColor}
        style={{ font: "500 8.5px 'IBM Plex Mono', monospace" }}
      >
        {v}
      </text>
    );
  });

  const needleAngle = disp;
  const n1 = pt(needleAngle, 11);
  const n2 = pt(needleAngle, 36);
  const needleVisible = value != null;

  const pick = (r: RoastFilter) => onSelect?.(r);
  const onKey = (r: RoastFilter) => (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      pick(r);
    }
  };

  return (
    <div
      className={className}
      style={fluid ? undefined : { width: size, height: size }}
      role={title ? "img" : undefined}
      aria-label={title}
    >
      <svg viewBox="0 0 140 140" className="block h-full w-full overflow-visible">
        {/* scale ticks + numerals */}
        {ticks}
        {showScale && scaleLabels}

        {/* roast segments */}
        {SEGMENTS.map((seg) => {
          const active = interactive && activeSeg === seg.key;
          const dimmed = interactive && activeSeg !== "all" && !active;
          const hovered = interactive && hoverSeg === seg.key;
          const width = active ? SW + 2.5 : hovered ? SW + 1.5 : SW;
          return (
            <g key={seg.key}>
              <path
                d={arcPath(seg.from, seg.to)}
                fill="none"
                stroke={seg.color}
                strokeWidth={width}
                strokeLinecap="butt"
                opacity={dimmed ? 0.28 : 1}
                style={{ transition: "opacity .2s ease, stroke-width .2s ease" }}
              />
              {interactive && (
                <>
                  <path
                    d={arcPath(seg.from, seg.to)}
                    fill="none"
                    stroke="transparent"
                    strokeWidth={SW + 14}
                    style={{ cursor: "pointer", pointerEvents: "stroke" }}
                    onClick={() =>
                      pick(activeSeg === seg.key ? "all" : seg.key)
                    }
                    onMouseEnter={() => setHoverSeg(seg.key)}
                    onMouseLeave={() => setHoverSeg(null)}
                    tabIndex={0}
                    role="button"
                    aria-pressed={active}
                    aria-label={`Filter ${seg.key} roasts`}
                    onKeyDown={onKey(activeSeg === seg.key ? "all" : seg.key)}
                    className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cascara"
                  />
                </>
              )}
            </g>
          );
        })}

        {/* needle */}
        <g
          style={{
            opacity: needleVisible ? 1 : 0,
            transition: "opacity .25s ease",
          }}
        >
          <line
            x1={n1.x}
            y1={n1.y}
            x2={n2.x}
            y2={n2.y}
            stroke="#B23A2E"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </g>

        {/* hub — doubles as "show all" when interactive */}
        <circle
          cx={C}
          cy={C}
          r={5.5}
          fill="#1B1712"
          stroke="#B23A2E"
          strokeWidth={2}
        />
        {interactive && (
          <circle
            cx={C}
            cy={C}
            r={13}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onClick={() => pick("all")}
            tabIndex={0}
            role="button"
            aria-pressed={activeSeg === "all"}
            aria-label="Show all roasts"
            onKeyDown={onKey("all")}
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-cascara"
          />
        )}
      </svg>
    </div>
  );
}

export { SEG_MID, SEGMENTS };
