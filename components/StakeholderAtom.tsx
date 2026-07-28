"use client";

import { useEffect, useRef } from "react";
import { stakeholders } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * "Atom" diagram — central Kargo360 cube with three intersecting orbit
 * ellipses; stakeholder pills sit on the orbit lobes (doss ARP-style, in red).
 * Entrance: orbits draw in → cube pops → pills stagger in. Continuous: small
 * nodes travel the orbits, cube floats gently.
 */

const CX = 400;
const CY = 400;
const RX = 330;
const RY = 118;
const ROTS = [90, 32, -32]; // vertical + two diagonals

const r2 = (n: number) => Math.round(n * 100) / 100;
const orbitPoint = (t: number, rotDeg: number): [number, number] => {
  const rot = (rotDeg * Math.PI) / 180;
  const x = RX * Math.cos(t);
  const y = RY * Math.sin(t);
  return [r2(CX + x * Math.cos(rot) - y * Math.sin(rot)), r2(CY + x * Math.sin(rot) + y * Math.cos(rot))];
};

// cube silhouette: hexagon vertices, V0 = top, clockwise
const R = 128;
const HEX = Array.from({ length: 6 }, (_, k) => {
  const a = ((k * 60 - 90) * Math.PI) / 180;
  return [r2(CX + R * Math.cos(a)), r2(CY + R * Math.sin(a))] as const;
});
const hexPts = HEX.map((p) => p.join(",")).join(" ");
const INNER = HEX.map(([x, y]) => [r2(CX + (x - CX) * 0.52), r2(CY + (y - CY) * 0.52)] as const);

type IconKind =
  | "plane" | "boxes" | "briefcase" | "truck"
  | "dispatch" | "house" | "user" | "headset";

// pill positions (percent of the square container) + per-stakeholder icon
const PILLS: { label: string; x: number; y: number; icon: IconKind }[] = [
  { label: stakeholders[0], x: 50, y: 3, icon: "plane" },     // Airlines — top
  { label: stakeholders[1], x: 16, y: 21, icon: "boxes" },    // Ground Handlers — upper left
  { label: stakeholders[2], x: 84, y: 21, icon: "briefcase" },// Sales Agents — upper right
  { label: stakeholders[3], x: 8, y: 50, icon: "truck" },     // Truck Operators — mid left
  { label: stakeholders[4], x: 92, y: 50, icon: "dispatch" }, // First-Mile — mid right
  { label: stakeholders[5], x: 16, y: 79, icon: "house" },    // Last-Mile — lower left
  { label: stakeholders[6], x: 84, y: 79, icon: "user" },     // End Customers — lower right
  { label: stakeholders[7], x: 50, y: 97, icon: "headset" },  // Service Providers — bottom
];

/** Red-disc icon with a white glyph per stakeholder role. */
function PillIcon({ kind }: { kind: IconKind }) {
  const stroke = { stroke: "#fff", strokeWidth: 1.3, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 md:h-5 md:w-5" aria-hidden>
      <circle cx="10" cy="10" r="9" fill="#ff0a22" />
      {kind === "plane" && (
        // airliner, nose up
        <path
          d="M10 3.6c.4 0 .75.35.75.9v3.6l4.85 2.8v1.4l-4.85-1.5v2.6l1.5 1.15v1.25L10 15l-2.25.8v-1.25l1.5-1.15v-2.6l-4.85 1.5v-1.4l4.85-2.8V4.5c0-.55.35-.9.75-.9Z"
          fill="#fff"
        />
      )}
      {kind === "boxes" && (
        // stacked cargo crates
        <g {...stroke}>
          <rect x="5.2" y="10" width="9.6" height="4.6" />
          <rect x="7.4" y="5.8" width="5.2" height="4.2" />
          <line x1="10" y1="10" x2="10" y2="14.6" />
        </g>
      )}
      {kind === "briefcase" && (
        <g {...stroke}>
          <rect x="4.8" y="7.8" width="10.4" height="7" rx="1" />
          <path d="M8.3 7.8V6.6a1 1 0 0 1 1-1h1.4a1 1 0 0 1 1 1v1.2" />
          <line x1="4.8" y1="10.8" x2="15.2" y2="10.8" />
        </g>
      )}
      {kind === "truck" && (
        <g {...stroke}>
          <rect x="4" y="7.4" width="7.4" height="5" />
          <path d="M11.4 9h2.6l1.9 2.1v1.3h-4.5" />
          <circle cx="7" cy="13.8" r="1.15" />
          <circle cx="13.4" cy="13.8" r="1.15" />
        </g>
      )}
      {kind === "dispatch" && (
        // parcel leaving — first mile
        <g {...stroke}>
          <rect x="5.6" y="9.6" width="6.8" height="5" />
          <path d="M12.2 7.6h3.4M15.6 7.6l-1.7-1.7M15.6 7.6l-1.7 1.7" />
        </g>
      )}
      {kind === "house" && (
        <g {...stroke}>
          <path d="M4.8 10.4 10 5.8l5.2 4.6v4.8H4.8Z" />
          <rect x="8.9" y="11.6" width="2.2" height="3.6" />
        </g>
      )}
      {kind === "user" && (
        <g {...stroke}>
          <circle cx="10" cy="7.5" r="2.3" />
          <path d="M5.4 15.2c.5-2.3 2.4-3.5 4.6-3.5s4.1 1.2 4.6 3.5" />
        </g>
      )}
      {kind === "headset" && (
        <g {...stroke}>
          <path d="M5.8 12v-1.6a4.2 4.2 0 0 1 8.4 0V12" />
          <rect x="4.9" y="11.2" width="1.9" height="3.4" rx="0.9" />
          <rect x="13.2" y="11.2" width="1.9" height="3.4" rx="0.9" />
          <path d="M14.1 14.6c0 1-1.6 1.6-3 1.6" />
        </g>
      )}
    </svg>
  );
}

export default function StakeholderAtom({ light = false }: { light?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const line = light ? "rgba(12,12,14,0.32)" : "rgba(255,255,255,0.45)";
  const dropLine = light ? "rgba(12,12,14,0.28)" : "rgba(255,255,255,0.22)";

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const orbits = el.querySelectorAll<SVGEllipseElement>("[data-orbit-line]");
    const cube = el.querySelector("[data-cube]");
    const pills = el.querySelectorAll("[data-pill]");
    const drops = el.querySelectorAll("[data-drop]");
    const dots = el.querySelectorAll<SVGCircleElement>("[data-orbit-dot]");

    if (prefersReducedMotion()) {
      gsap.set([cube, pills, drops], { opacity: 1 });
      orbits.forEach((o) => (o.style.strokeDashoffset = "0"));
      return;
    }

    const ctx = gsap.context(() => {
      // entrance — doss-style staggered build
      gsap.set(orbits, { strokeDasharray: 100, strokeDashoffset: 100 });
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 72%", once: true },
      });
      tl.to(orbits, { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut", stagger: 0.18 })
        .fromTo(cube, { opacity: 0, scale: 0.82, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, "-=0.9")
        .fromTo(drops, { opacity: 0 }, { opacity: 1, duration: 0.5 }, "-=0.3")
        .fromTo(
          pills,
          { opacity: 0, y: 14, scale: 0.92 },
          { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: "back.out(1.7)", stagger: 0.08 },
          "-=0.5"
        )
        .fromTo(dots, { opacity: 0 }, { opacity: 1, duration: 0.4 }, "-=0.2");

      // continuous — nodes traveling each orbit
      dots.forEach((dot, i) => {
        const state = { t: (i * Math.PI * 2) / 3 };
        gsap.to(state, {
          t: `+=${Math.PI * 2}`,
          duration: 16 + i * 3,
          repeat: -1,
          ease: "none",
          onUpdate: () => {
            const [x, y] = orbitPoint(state.t, ROTS[i]);
            dot.setAttribute("cx", String(x));
            dot.setAttribute("cy", String(y));
          },
        });
      });

      // gentle cube float
      gsap.to(cube, { y: -8, duration: 3.4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative mx-auto aspect-square w-full max-w-[620px]">
      <svg viewBox="0 0 800 800" className="h-full w-full" fill="none" aria-hidden>
        <defs>
          <linearGradient id="atom-red" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff2f45" />
            <stop offset="55%" stopColor="#ff0a22" />
            <stop offset="100%" stopColor="#c8001b" />
          </linearGradient>
          <radialGradient id="atom-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff0a22" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ff0a22" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* orbit ellipses */}
        {ROTS.map((rot, i) => (
          <ellipse
            key={i}
            data-orbit-line
            cx={CX}
            cy={CY}
            rx={RX}
            ry={RY}
            pathLength={100}
            transform={`rotate(${rot} ${CX} ${CY})`}
            stroke={line}
            strokeWidth="1.4"
          />
        ))}

        {/* traveling nodes */}
        {ROTS.map((_, i) => (
          <circle key={i} data-orbit-dot r="4" fill="#ff2f45" opacity="0" />
        ))}

        {/* dashed drop lines below the cube */}
        <g data-drop stroke={dropLine} strokeWidth="1.4" strokeDasharray="3 9" opacity="0">
          <line x1={CX - 66} y1={CY + 96} x2={CX - 66} y2={790} />
          <line x1={CX} y1={CY + R} x2={CX} y2={800} />
          <line x1={CX + 66} y1={CY + 96} x2={CX + 66} y2={790} />
        </g>

        {/* central cube */}
        <g data-cube opacity="0">
          <circle cx={CX} cy={CY} r={210} fill="url(#atom-glow)" />
          <polygon points={hexPts} fill="url(#atom-red)" />
          {/* face seams: center → alternating vertices */}
          {[1, 3, 5].map((k) => (
            <line key={k} x1={CX} y1={CY} x2={HEX[k][0]} y2={HEX[k][1]} stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" />
          ))}
          {/* dashed mid-seams */}
          {[0, 2, 4].map((k) => (
            <line key={k} x1={CX} y1={CY} x2={HEX[k][0]} y2={HEX[k][1]} stroke="rgba(255,255,255,0.28)" strokeWidth="1.2" strokeDasharray="4 7" />
          ))}
          {/* inner wireframe cube */}
          <polygon
            points={INNER.map((p) => p.join(",")).join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.75)"
            strokeWidth="1.6"
          />
          {[1, 3, 5].map((k) => (
            <line key={k} x1={CX} y1={CY} x2={INNER[k][0]} y2={INNER[k][1]} stroke="rgba(255,255,255,0.75)" strokeWidth="1.6" />
          ))}
          {/* 360° label on the top face */}
          <text
            x={CX + 34}
            y={CY - 26}
            fill="#fff"
            fontSize="30"
            fontWeight="700"
            fontFamily="Switzer, sans-serif"
            transform={`rotate(-28 ${CX + 34} ${CY - 26})`}
          >
            360°
          </text>
        </g>
      </svg>

      {/* stakeholder pills (HTML for crisp text) */}
      {PILLS.map((p) => (
        <div
          key={p.label}
          data-pill
          className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-full border py-1.5 pl-2 pr-3 opacity-0 backdrop-blur-sm md:gap-2.5 md:py-2 md:pl-2.5 md:pr-4 ${
            light
              ? "border-ink-900/15 bg-white/85 shadow-[0_6px_24px_-10px_rgba(12,12,14,0.25)]"
              : "border-mist-line bg-ink-700/95"
          }`}
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <PillIcon kind={p.icon} />
          <span className={`text-[0.68rem] font-medium md:text-sm ${light ? "text-ink-900/85" : "text-mist-bright"}`}>
            {p.label}
          </span>
        </div>
      ))}
    </div>
  );
}
