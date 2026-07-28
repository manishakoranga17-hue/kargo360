"use client";

import { useEffect, useMemo, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Hero visual — the end-to-end air cargo journey, tracked live:
 * first mile → origin airport → flight → destination airport → last mile,
 * with a glowing shipment pulse traveling the whole route and status pings
 * at every checkpoint. Literally backs "Air Cargo, End to End" +
 * "real-time visibility into your complete cargo value chain".
 */

const r2 = (n: number) => Math.round(n * 100) / 100;
function makeIso(ox: number, oy: number, u: number) {
  return (x: number, y: number, z: number): [number, number] => [
    r2(ox + (x - y) * 0.866 * u),
    r2(oy + (x + y) * 0.5 * u - z * u),
  ];
}
const P = (a: [number, number][]) => a.map((p) => p.join(",")).join(" ");

function box(
  iso: (x: number, y: number, z: number) => [number, number],
  x0: number, y0: number, w: number, d: number, z0: number, h: number
) {
  const A = iso(x0, y0, z0), B = iso(x0 + w, y0, z0), C = iso(x0 + w, y0 + d, z0);
  const E = iso(x0, y0, z0 + h), F = iso(x0 + w, y0, z0 + h), G = iso(x0 + w, y0 + d, z0 + h), H = iso(x0, y0 + d, z0 + h);
  return { top: P([E, F, G, H]), left: P([A, B, F, E]), right: P([B, C, G, F]) };
}

function IsoBox({ b, accent = false }: { b: { top: string; left: string; right: string }; accent?: boolean }) {
  const stroke = accent ? "#ff2f45" : "rgba(255,255,255,0.4)";
  return (
    <g strokeWidth="1.3" strokeLinejoin="round">
      <polygon points={b.left} fill={accent ? "rgba(255,10,34,0.18)" : "rgba(255,255,255,0.03)"} stroke={stroke} />
      <polygon points={b.right} fill={accent ? "rgba(200,0,27,0.3)" : "rgba(0,0,0,0.28)"} stroke={stroke} />
      <polygon points={b.top} fill={accent ? "url(#j-red)" : "rgba(255,255,255,0.06)"} stroke={stroke} />
    </g>
  );
}

// journey anchors (screen space, lower-left → upper-right)
const A: [number, number] = [150, 480];  // first mile
const C: [number, number] = [370, 402];  // origin airport
const E: [number, number] = [700, 330];  // destination airport
const G: [number, number] = [892, 258];  // last mile
const ARC_CTRL: [number, number] = [535, 36];
const APEX: [number, number] = [535, 196];

const FULL_PATH = `M ${A[0]} ${A[1]} L ${C[0]} ${C[1]} Q ${ARC_CTRL[0]} ${ARC_CTRL[1]} ${E[0]} ${E[1]} L ${G[0]} ${G[1]}`;

export default function IsometricScene() {
  const root = useRef<SVGSVGElement>(null);

  const grid = useMemo(() => {
    const iso = makeIso(500, 350, 27);
    const lines: [string, string][] = [];
    for (let i = -8; i <= 8; i++) {
      lines.push([iso(i, -8, 0).join(","), iso(i, 8, 0).join(",")]);
      lines.push([iso(-8, i, 0).join(","), iso(8, i, 0).join(",")]);
    }
    return lines;
  }, []);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const gridEls = el.querySelectorAll("[data-j-grid] line");
    const structures = el.querySelectorAll("[data-j-node]");
    const ground = el.querySelectorAll<SVGPathElement>("[data-j-ground]");
    const arc = el.querySelector<SVGPathElement>("[data-j-arc]");
    const labels = el.querySelectorAll("[data-j-label]");
    const plane = el.querySelector("[data-j-plane]");
    const pulse = el.querySelector<SVGGElement>("[data-j-pulse]");
    const measure = el.querySelector<SVGPathElement>("[data-j-measure]");
    const pings = el.querySelectorAll<SVGCircleElement>("[data-j-ping]");

    if (prefersReducedMotion()) {
      gsap.set([gridEls, structures, labels, plane, pulse], { opacity: 1 });
      if (arc) gsap.set(arc, { strokeDashoffset: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // entrance
      gsap.set([structures, labels, plane], { opacity: 0 });
      gsap.set(gridEls, { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.4 });
      tl.to(gridEls, { opacity: 1, duration: 0.5, stagger: 0.012 });

      ground.forEach((g) => {
        const len = g.getTotalLength();
        gsap.set(g, { strokeDasharray: `${len}`, strokeDashoffset: len });
      });
      if (arc) {
        const len = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
      }

      tl.fromTo(structures, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.12, ease: "power3.out" }, "-=0.2")
        .to(ground[0], { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, "-=0.3")
        .to(arc, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut" }, ">-0.05")
        .to(ground[1], { strokeDashoffset: 0, duration: 0.5, ease: "power1.inOut" }, ">-0.05")
        .to(plane, { opacity: 1, duration: 0.5, ease: "power2.out" }, "-=0.8")
        .to(labels, { opacity: 1, duration: 0.5, stagger: 0.08 }, "-=0.6");

      // live shipment pulse traveling the entire route, forever
      if (pulse && measure) {
        const len = measure.getTotalLength();
        const trip = { t: 0 };
        gsap.set(pulse, { opacity: 0 });
        tl.to(pulse, { opacity: 1, duration: 0.3 });
        gsap.to(trip, {
          t: 1,
          duration: 8,
          ease: "power1.inOut",
          repeat: -1,
          repeatDelay: 0.5,
          delay: 2.4,
          onUpdate: () => {
            const p = measure.getPointAtLength(trip.t * len);
            gsap.set(pulse, { attr: { transform: `translate(${p.x},${p.y})` } });
          },
        });
      }

      // checkpoint pings — expanding rings, staggered (radius-based: stays anchored)
      pings.forEach((ring, i) => {
        gsap.fromTo(
          ring,
          { attr: { r: 4 }, opacity: 0.6 },
          { attr: { r: 26 }, opacity: 0, duration: 1.8, repeat: -1, repeatDelay: 1.2, ease: "power1.out", delay: 2 + i * 0.5 }
        );
      });

      // gentle drift as the hero scrolls out
      gsap.to("[data-j-world]", {
        y: 70,
        opacity: 0.5,
        ease: "none",
        scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: 0.6 },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  // structures
  const isoA = makeIso(A[0], A[1], 22);
  const isoC = makeIso(C[0], C[1], 24);
  const isoE = makeIso(E[0], E[1], 24);
  const isoG = makeIso(G[0], G[1], 22);

  return (
    <svg
      ref={root}
      viewBox="110 60 880 560"
      className="h-full w-full"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="j-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2f45" />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
        <linearGradient id="j-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ff2f45" />
          <stop offset="55%" stopColor="#ff0a22" />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
        <radialGradient id="j-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff0a22" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff0a22" stopOpacity="0" />
        </radialGradient>
      </defs>

      <g data-j-world>
        {/* iso ground grid */}
        <g data-j-grid stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1">
          {grid.map(([a, b], i) => {
            const [ax, ay] = a.split(",");
            const [bx, by] = b.split(",");
            return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
          })}
        </g>

        {/* invisible measurement path (full journey) */}
        <path data-j-measure d={FULL_PATH} stroke="none" />

        {/* ground legs */}
        <path data-j-ground d={`M ${A[0]} ${A[1]} L ${C[0]} ${C[1]}`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeDasharray="3 7" strokeLinecap="round" />
        <path data-j-ground d={`M ${E[0]} ${E[1]} L ${G[0]} ${G[1]}`} stroke="rgba(255,255,255,0.35)" strokeWidth="1.6" strokeDasharray="3 7" strokeLinecap="round" />

        {/* flight arc */}
        <path data-j-arc d={`M ${C[0]} ${C[1]} Q ${ARC_CTRL[0]} ${ARC_CTRL[1]} ${E[0]} ${E[1]}`} stroke="url(#j-arc)" strokeWidth="2.5" strokeLinecap="round" />

        {/* plane at the arc apex */}
        <g data-j-plane transform={`translate(${APEX[0]}, ${APEX[1] - 10}) rotate(14) scale(1.9)`}>
          <path
            d="M0 -8.5c.55 0 1 .5 1 1.2v4.8l6.4 3.7v1.9l-6.4-2v3.4l2 1.5v1.7L0 6.6l-3 1.1V6l2-1.5V1.1l-6.4 2V1.2L-1 -2.5v-4.8c0-.7.45-1.2 1-1.2Z"
            fill="#fff"
          />
        </g>

        {/* IN TRANSIT tag near the apex */}
        <g data-j-label>
          <rect x={APEX[0] - 62} y={APEX[1] - 64} width="124" height="26" rx="13" fill="rgba(12,12,14,0.75)" stroke="rgba(255,255,255,0.18)" />
          <circle cx={APEX[0] - 44} cy={APEX[1] - 51} r="3" fill="#ff0a22" className="animate-blink" />
          <text x={APEX[0] - 33} y={APEX[1] - 47} fill="rgba(255,255,255,0.75)" fontSize="11.5" fontFamily="Switzer, sans-serif" fontWeight="500" letterSpacing="1.5">
            IN TRANSIT
          </text>
        </g>

        {/* first mile — pickup */}
        <g data-j-node>
          <IsoBox b={box(isoA, -0.6, -0.6, 1.2, 1.2, 0, 0.9)} />
        </g>
        {/* origin airport — pad + control tower */}
        <g data-j-node>
          <circle cx={C[0]} cy={C[1]} r="34" fill="url(#j-glow)" opacity="0.5" />
          <IsoBox b={box(isoC, -1.2, -1.2, 2.4, 2.4, 0, 0.3)} accent />
          <IsoBox b={box(isoC, 1.35, -0.7, 0.55, 0.55, 0, 1.5)} />
          <circle cx={isoC(1.62, -0.42, 1.55)[0]} cy={isoC(1.62, -0.42, 1.55)[1]} r="2.4" fill="#ff0a22" className="animate-blink" />
        </g>
        {/* destination airport — pad + control tower */}
        <g data-j-node>
          <circle cx={E[0]} cy={E[1]} r="34" fill="url(#j-glow)" opacity="0.5" />
          <IsoBox b={box(isoE, -1.2, -1.2, 2.4, 2.4, 0, 0.3)} accent />
          <IsoBox b={box(isoE, -1.9, 0.7, 0.55, 0.55, 0, 1.5)} />
          <circle cx={isoE(-1.62, 0.97, 1.55)[0]} cy={isoE(-1.62, 0.97, 1.55)[1]} r="2.4" fill="#ff0a22" className="animate-blink" />
        </g>
        {/* last mile — delivery */}
        <g data-j-node>
          <IsoBox b={box(isoG, -0.6, -0.6, 1.2, 1.2, 0, 0.9)} />
        </g>

        {/* checkpoint dots + pings */}
        {[A, C, E, G].map((p, i) => (
          <g key={i}>
            <circle data-j-ping cx={p[0]} cy={p[1]} r="10" stroke="#ff2f45" strokeWidth="1.5" opacity="0" />
            <circle cx={p[0]} cy={p[1]} r="3.2" fill={i === 0 || i === 3 ? "#fff" : "#ff2f45"} />
          </g>
        ))}

        {/* checkpoint labels */}
        <g fontFamily="Switzer, sans-serif" fontSize="11.5" fontWeight="500" letterSpacing="1.5" fill="rgba(255,255,255,0.5)">
          <text data-j-label x={A[0] - 32} y={A[1] + 52} opacity="0">FIRST MILE</text>
          <text data-j-label x={C[0] - 42} y={C[1] + 62} opacity="0">ORIGIN AIRPORT</text>
          <text data-j-label x={E[0] - 58} y={E[1] + 62} opacity="0">DESTINATION AIRPORT</text>
          <text data-j-label x={G[0] - 30} y={G[1] + 52} opacity="0">LAST MILE</text>
        </g>

        {/* the live shipment */}
        <g data-j-pulse opacity="0">
          <circle r="13" fill="url(#j-glow)" />
          <rect x="-4.5" y="-4.5" width="9" height="9" fill="#fff" transform="rotate(45)" />
        </g>
      </g>
    </svg>
  );
}
