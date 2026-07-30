"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

/**
 * Slim circuit-trace bundle for the hero's side gutters — faint right-angle
 * lines with small red pulses traveling through them. viewBox 260×700.
 */

const RED = "#ff2f45";

const PATHS = [
  "M40 -20 V 180 Q40 192 52 192 H 120 Q132 192 132 204 V 330",
  "M90 40 V 260 Q90 272 102 272 H 190 Q202 272 202 284 V 420",
  "M20 240 V 430 Q20 442 32 442 H 110 Q122 442 122 454 V 580",
  "M150 720 V 620 Q150 608 138 608 H 60 Q48 608 48 596 V 500",
];

/* endpoint pads */
const DOTS: [number, number][] = [
  [132, 334],
  [202, 424],
  [122, 584],
  [48, 496],
];

const PADS: [number, number][] = [
  [64, 120],
  [160, 250],
  [36, 380],
  [180, 540],
  [90, 640],
];

export default function HeroSideTraces({ seed = 0 }: { seed?: number }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: gsap.core.Tween[] = [];
      const routes = el.querySelectorAll<SVGPathElement>("[data-trace]");

      el.querySelectorAll<SVGGElement>("[data-tpulse]").forEach((dot, i) => {
        const path = routes[i % routes.length];
        if (!path) return;
        const len = path.getTotalLength();
        const trip = { t: 0 };
        loops.push(
          gsap.to(trip, {
            t: 1,
            duration: 5.5 + (i % 3) * 1.8,
            repeat: -1,
            repeatDelay: 1.2 + (i % 2) * 1.4,
            delay: seed + i * 1.3,
            ease: "none",
            onUpdate: () => {
              const p = path.getPointAtLength(trip.t * len);
              // fade in/out at the ends of the run
              const o = Math.sin(Math.PI * trip.t);
              gsap.set(dot, { attr: { transform: `translate(${p.x},${p.y})` }, opacity: o });
            },
          })
        );
      });

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, [seed]);

  return (
    <svg
      ref={root}
      viewBox="0 0 260 700"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      fill="none"
      aria-hidden
    >
      {PATHS.map((d) => (
        <path key={d} data-trace d={d} stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
      ))}

      {DOTS.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill="rgba(255,255,255,0.14)" />
      ))}

      {PADS.map(([x, y], i) =>
        i % 2 === 0 ? (
          <rect key={`${x}-${y}`} x={x} y={y} width={5} height={5} fill="rgba(255,255,255,0.09)" />
        ) : (
          <g key={`${x}-${y}`} fill="rgba(255,255,255,0.09)">
            <rect x={x} y={y} width={2.4} height={2.4} />
            <rect x={x + 6} y={y} width={2.4} height={2.4} />
            <rect x={x + 12} y={y} width={2.4} height={2.4} />
          </g>
        )
      )}

      {/* red pulses — one per path, plus an extra on the first two */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i} data-tpulse opacity="0">
          <circle r="5.5" fill={RED} opacity="0.22" />
          <circle r="2.4" fill={RED} />
        </g>
      ))}
    </svg>
  );
}
