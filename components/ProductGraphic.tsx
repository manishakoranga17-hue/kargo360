"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

/**
 * Distinct animated isometric graphic per product (red/black), swapped by the
 * sticky product rail. type: scape | kommerce | kontrol | konnect.
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

function IsoBox({
  b, accent = false, sw = 1.3,
}: { b: { top: string; left: string; right: string }; accent?: boolean; sw?: number }) {
  const stroke = accent ? "#ff2f45" : "rgba(255,255,255,0.38)";
  return (
    <g strokeWidth={sw} strokeLinejoin="round">
      <polygon points={b.left} fill={accent ? "rgba(255,10,34,0.18)" : "rgba(255,255,255,0.03)"} stroke={stroke} />
      <polygon points={b.right} fill={accent ? "rgba(200,0,27,0.3)" : "rgba(0,0,0,0.28)"} stroke={stroke} />
      <polygon points={b.top} fill={accent ? "url(#pg-red)" : "rgba(255,255,255,0.06)"} stroke={stroke} />
    </g>
  );
}

export default function ProductGraphic({ type }: { type: "scape" | "kommerce" | "kontrol" | "konnect" }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // entrance
      gsap.from(el.querySelectorAll("[data-in]"), {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 80%", once: true },
      });
      const loops: gsap.core.Tween[] = [];

      // float
      loops.push(
        gsap.to(el.querySelectorAll("[data-float]"), {
          y: "-=8",
          duration: 3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: { each: 0.4, from: "random" },
        })
      );
      // traveling pulses along paths
      el.querySelectorAll<SVGPathElement>("[data-route]").forEach((path, i) => {
        const dot = el.querySelector<SVGGElement>(`[data-pulse="${i}"]`);
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          duration: 1.4,
          ease: "power2.inOut",
          scrollTrigger: { trigger: el, start: "top 80%", once: true },
        });
        if (dot) {
          const trip = { t: 0 };
          loops.push(
            gsap.to(trip, {
              t: 1, duration: 4, ease: "power1.inOut", repeat: -1, repeatDelay: 0.4, delay: 1 + i * 0.3,
              onUpdate: () => {
                const p = path.getPointAtLength(trip.t * len);
                gsap.set(dot, { attr: { transform: `translate(${p.x},${p.y})` } });
              },
            })
          );
        }
      });
      // spinning / pulsing accents
      loops.push(
        gsap.to(el.querySelectorAll("[data-spin]"), { rotate: 360, transformOrigin: "center", duration: 16, repeat: -1, ease: "none" }),
        gsap.to(el.querySelectorAll("[data-bar]"), {
          scaleY: (i) => 0.4 + ((i % 3) * 0.25),
          transformOrigin: "bottom",
          duration: 1.1, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.12,
        })
      );

      pauseOffscreen(el, loops);
    }, el);
    return () => ctx.revert();
  }, [type]);

  return (
    <svg ref={root} viewBox="0 0 560 440" className="h-full w-full" fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pg-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2f45" />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
        <radialGradient id="pg-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff0a22" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff0a22" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* scaled up so the scene fills the card edge-to-edge (doss-style) */}
      <g transform="translate(280 220) scale(1.2) translate(-280 -220)">
        {type === "scape" && <Scape />}
        {type === "kommerce" && <Kommerce />}
        {type === "kontrol" && <Kontrol />}
        {type === "konnect" && <Konnect />}
      </g>
    </svg>
  );
}

/* ---- Airport-to-Airport: two pads + flight arc + moving plane ---- */
function Scape() {
  const iso = makeIso(280, 250, 30);
  const grid: [string, string][] = [];
  for (let i = -2; i <= 6; i++) {
    grid.push([iso(i, -2, 0).join(","), iso(i, 6, 0).join(",")]);
    grid.push([iso(-2, i, 0).join(","), iso(6, i, 0).join(",")]);
  }
  const origin = iso(0.8, 3.2, 0);
  const dest = iso(3.2, 0.8, 0);
  return (
    <g>
      <g stroke="#ffffff" strokeOpacity="0.06">
        {grid.map(([a, b], i) => {
          const [ax, ay] = a.split(","), [bx, by] = b.split(",");
          return <line key={i} x1={ax} y1={ay} x2={bx} y2={by} />;
        })}
      </g>
      <IsoBox b={box(iso, 0.2, 2.6, 1.2, 1.2, 0, 0.35)} />
      <IsoBox b={box(iso, 2.6, 0.2, 1.2, 1.2, 0, 0.35)} accent />
      <g data-in>
        <circle cx={origin[0]} cy={origin[1]} r="26" fill="url(#pg-glow)" />
        <circle cx={origin[0]} cy={origin[1]} r="4" fill="#fff" />
        <circle data-spin cx={origin[0]} cy={origin[1]} r="14" stroke="#ff2f45" strokeOpacity="0.5" fill="none" style={{ transformBox: "fill-box" }} />
      </g>
      <g data-in>
        <circle cx={dest[0]} cy={dest[1]} r="26" fill="url(#pg-glow)" />
        <circle cx={dest[0]} cy={dest[1]} r="4" fill="#ff2f45" />
      </g>
      <path data-route d={`M ${origin[0]} ${origin[1]} Q ${(origin[0] + dest[0]) / 2} ${Math.min(origin[1], dest[1]) - 150} ${dest[0]} ${dest[1]}`} stroke="url(#pg-red)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <g data-pulse="0"><rect x="-5" y="-5" width="10" height="10" fill="#fff" transform="rotate(45)" /></g>
      <text data-in x={origin[0] - 10} y={origin[1] + 34} fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Switzer">DEL</text>
      <text data-in x={dest[0] - 8} y={dest[1] - 24} fill="rgba(255,255,255,0.5)" fontSize="12" fontFamily="Switzer">HUB</text>
    </g>
  );
}

/* ---- Door-to-Door: chain of nodes with moving pulse ---- */
function Kommerce() {
  const iso = makeIso(120, 250, 30);
  const nodes = [0, 1.6, 3.2, 4.8].map((x) => iso(x, x * 0.15, 0));
  const heights = [0.9, 0.6, 1.1, 0.7];
  return (
    <g>
      <path data-route d={`M ${nodes.map((n) => `${n[0]} ${n[1] - 6}`).join(" L ")}`} stroke="url(#pg-red)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <g data-pulse="0"><circle r="6" fill="#fff" /><circle r="12" fill="url(#pg-glow)" /></g>
      {[0, 1.6, 3.2, 4.8].map((x, i) => (
        <g key={i} data-in data-float>
          <IsoBox b={box(iso, x - 0.35, x * 0.15 - 0.35, 0.7, 0.7, 0, heights[i])} accent={i === 2} />
        </g>
      ))}
      {nodes.map((n, i) => (
        <text key={i} data-in x={n[0] - 6} y={n[1] + 26} fill="rgba(255,255,255,0.4)" fontSize="10" fontFamily="Switzer">
          {String(i + 1).padStart(2, "0")}
        </text>
      ))}
    </g>
  );
}

/* ---- Customer Portal: floating dashboard card + 85% ring ---- */
function Kontrol() {
  const iso = makeIso(230, 210, 34);
  const card = box(iso, 0, 0, 4, 3, 0, 0.15);
  // rows on the card top face
  const rows = [0.6, 1.2, 1.8, 2.4].map((yy) => [iso(0.4, yy, 0.16), iso(3.4, yy, 0.16)]);
  const ring = iso(2, 1.5, 1.3);
  return (
    <g>
      <g data-in data-float>
        <IsoBox b={card} sw={1.4} />
        {rows.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={i === 1 ? "#ff2f45" : "rgba(255,255,255,0.25)"} strokeWidth={i === 1 ? 3 : 2} strokeLinecap="round" />
        ))}
      </g>
      {/* floating 85% ring */}
      <g data-in data-float>
        <circle cx={ring[0]} cy={ring[1]} r="46" fill="url(#pg-glow)" />
        <circle cx={ring[0]} cy={ring[1]} r="30" stroke="rgba(255,255,255,0.15)" strokeWidth="5" fill="none" />
        <circle data-spin cx={ring[0]} cy={ring[1]} r="30" stroke="url(#pg-red)" strokeWidth="5" fill="none" strokeLinecap="round" strokeDasharray="160 100" style={{ transformBox: "fill-box" }} />
        <text x={ring[0]} y={ring[1] + 5} textAnchor="middle" fill="#fff" fontSize="20" fontWeight="600" fontFamily="Switzer">85%</text>
      </g>
    </g>
  );
}

/* ---- API Suite: central hub + endpoints + inbound packets ---- */
function Konnect() {
  const cx = 280, cy = 220;
  const hub = makeIso(cx, cy, 34);
  const endpoints = Array.from({ length: 6 }, (_, i) => {
    const a = (i / 6) * Math.PI * 2;
    return { x: r2(cx + Math.cos(a) * 170), y: r2(cy + Math.sin(a) * 110) };
  });
  return (
    <g>
      {endpoints.map((e, i) => (
        <g key={i}>
          <path data-route d={`M ${e.x} ${e.y} L ${cx} ${cy}`} stroke="url(#pg-red)" strokeWidth="1.6" strokeOpacity="0.7" fill="none" />
          <g data-pulse={i}><rect x="-3.5" y="-3.5" width="7" height="7" fill="#ff2f45" /></g>
          <g data-in data-float transform={`translate(${e.x - cx},${e.y - cy})`}>
            <IsoBox b={box(hub, -0.35, -0.35, 0.7, 0.7, 0, 0.7)} />
          </g>
        </g>
      ))}
      <g data-in>
        <circle cx={cx} cy={cy} r="40" fill="url(#pg-glow)" />
        <IsoBox b={box(hub, -0.7, -0.7, 1.4, 1.4, 0, 1.2)} accent sw={1.6} />
      </g>
    </g>
  );
}
