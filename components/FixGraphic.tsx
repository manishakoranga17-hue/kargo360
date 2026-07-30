"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

export type FixGraphicType =
  | "booking"
  | "dashboard"
  | "network"
  | "rates"
  | "settlement"
  | "portal";

const LINE = "rgba(255,255,255,0.16)";
const MIST = "rgba(255,255,255,0.45)";
const DIM = "rgba(255,255,255,0.28)";
const RED = "#ff2f45";
const INK = "#101014";

function Mono({
  x,
  y,
  children,
  size = 7,
  fill = MIST,
  anchor = "start",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  size?: number;
  fill?: string;
  anchor?: "start" | "middle" | "end";
}) {
  return (
    <text
      x={x}
      y={y}
      fontSize={size}
      fill={fill}
      textAnchor={anchor}
      style={{ letterSpacing: "0.14em", textTransform: "uppercase" }}
    >
      {children}
    </text>
  );
}

/** Small animated technical diagram for each "fix" card. viewBox 300×150. */
export default function FixGraphic({ type }: { type: FixGraphicType }) {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: gsap.core.Tween[] = [];
      const once = { trigger: el, start: "top 90%", once: true } as const;

      gsap.from(el.querySelectorAll("[data-in]"), {
        opacity: 0,
        y: 8,
        duration: 0.55,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: once,
      });

      const routes = el.querySelectorAll<SVGPathElement>("[data-route]");
      routes.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, { strokeDashoffset: 0, duration: 1.1, ease: "power2.inOut", scrollTrigger: once });
      });

      // dots traveling along their route (data-pulse = route index)
      el.querySelectorAll<SVGGElement>("[data-pulse]").forEach((dot, i) => {
        const path = routes[Number(dot.dataset.pulse ?? i)];
        if (!path) return;
        const len = path.getTotalLength();
        const trip = { t: 0 };
        loops.push(
          gsap.to(trip, {
            t: 1,
            duration: 3.2,
            ease: "power1.inOut",
            repeat: -1,
            repeatDelay: 0.5,
            delay: 1 + i * 0.6,
            onUpdate: () => {
              const p = path.getPointAtLength(trip.t * len);
              gsap.set(dot, { attr: { transform: `translate(${p.x},${p.y})` } });
            },
          })
        );
      });

      const bars = el.querySelectorAll("[data-bar]");
      if (bars.length)
        loops.push(
          gsap.to(bars, {
            scaleY: (i: number) => 0.75 + ((i % 4) * 0.12),
            transformOrigin: "bottom",
            duration: 1.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: 0.18,
          })
        );

      const spins = el.querySelectorAll("[data-spin]");
      if (spins.length)
        loops.push(gsap.to(spins, { rotate: 360, transformOrigin: "center", duration: 14, repeat: -1, ease: "none" }));

      const checks = el.querySelectorAll("[data-check]");
      if (checks.length)
        loops.push(
          gsap.fromTo(
            checks,
            { scale: 0, transformOrigin: "center" },
            { scale: 1, duration: 0.35, ease: "back.out(2.2)", stagger: 0.4, repeat: -1, repeatDelay: 1.8, delay: 0.6 }
          )
        );

      const progress = el.querySelectorAll("[data-progress]");
      if (progress.length)
        loops.push(
          gsap.fromTo(
            progress,
            { scaleX: 0.12, transformOrigin: "left center" },
            { scaleX: 1, duration: 3.4, ease: "power1.inOut", repeat: -1, repeatDelay: 0.9 }
          )
        );

      const blinks = el.querySelectorAll("[data-blink]");
      if (blinks.length)
        loops.push(gsap.to(blinks, { opacity: 0.2, duration: 0.8, yoyo: true, repeat: -1, ease: "steps(1)" }));

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, [type]);

  const node = (cx: number, cy: number, label: string, sub?: string) => (
    <g data-in>
      <circle cx={cx} cy={cy} r="5.5" fill={INK} stroke={MIST} strokeWidth="1.2" />
      <circle cx={cx} cy={cy} r="1.8" fill={RED} />
      <Mono x={cx} y={cy - 14} anchor="middle" fill="rgba(255,255,255,0.7)">
        {label}
      </Mono>
      {sub && (
        <Mono x={cx} y={cy + 20} anchor="middle" size={5.8} fill={DIM}>
          {sub}
        </Mono>
      )}
    </g>
  );

  return (
    <svg ref={root} viewBox="0 0 300 150" className="h-full w-full" fill="none" aria-hidden preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="fx-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={RED} />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
      </defs>

      {type === "booking" && (
        <>
          <path data-route d="M45 84 H 255" stroke={LINE} strokeWidth="1.2" />
          {node(45, 84, "Search", "spot + contract")}
          {node(150, 84, "Quote", "auto-rated")}
          {node(255, 84, "Book", "AWB issued")}
          <g data-in>
            <rect x="112" y="26" width="76" height="18" rx="4" fill={INK} stroke={LINE} />
            <Mono x={150} y={38} anchor="middle" size={6.5} fill="rgba(255,255,255,0.7)">
              AWB 176-4820
            </Mono>
            <path d="M150 44 V 66" stroke={LINE} strokeDasharray="2 3" />
          </g>
          <g data-pulse="0">
            <circle r="3.2" fill={RED} />
            <circle r="7" fill={RED} opacity="0.25" />
          </g>
          <Mono x={45} y={128} size={6} fill={DIM}>
            0 re-keyed fields
          </Mono>
          <Mono x={255} y={128} size={6} fill={DIM} anchor="end">
            t &lt; 60s
          </Mono>
        </>
      )}

      {type === "dashboard" && (
        <>
          <g data-in>
            <path d="M36 22 V 118 H 268" stroke={LINE} strokeWidth="1.2" />
            <Mono x={30} y={28} anchor="end" size={5.8} fill={DIM}>
              vol
            </Mono>
          </g>
          {[52, 76, 100, 124, 148, 172, 196, 220].map((x, i) => (
            <rect
              key={x}
              data-bar
              x={x}
              y={118 - (34 + (i % 4) * 14)}
              width="14"
              height={34 + (i % 4) * 14}
              rx="2"
              fill={i >= 6 ? "url(#fx-red)" : "rgba(255,255,255,0.10)"}
            />
          ))}
          <path data-route d="M52 96 L 90 88 L 128 92 L 166 72 L 204 62 L 246 40" stroke={RED} strokeWidth="1.4" />
          <g data-in>
            <circle data-blink cx="246" cy="40" r="3" fill={RED} />
            <Mono x={256} y={43} size={6.2} fill="rgba(255,255,255,0.7)">
              live
            </Mono>
          </g>
          <Mono x={268} y={132} anchor="end" size={6} fill={DIM}>
            refresh 0.5s · not monthly
          </Mono>
        </>
      )}

      {type === "network" && (
        <>
          {(
            [
              [60, 38, "Airline"],
              [240, 38, "Agent"],
              [34, 100, "GHA"],
              [266, 100, "Customs"],
              [92, 130, "Trucker"],
              [208, 130, "Customer"],
            ] as [number, number, string][]
          ).map(([x, y, l]) => (
            <g key={l}>
              <path data-route d={`M150 78 L ${x} ${y}`} stroke={LINE} strokeWidth="1" />
              <g data-in>
                <circle cx={x} cy={y} r="4.5" fill={INK} stroke={MIST} strokeWidth="1.1" />
                <Mono x={x} y={y - 10} anchor="middle" size={5.8}>
                  {l}
                </Mono>
              </g>
            </g>
          ))}
          <g data-spin>
            <ellipse cx="150" cy="78" rx="26" ry="11" stroke={DIM} strokeWidth="1" />
            <circle cx="176" cy="78" r="2.2" fill={RED} />
          </g>
          <g data-in>
            <circle cx="150" cy="78" r="11" fill="url(#fx-red)" />
            <Mono x={150} y={81} anchor="middle" size={5.5} fill="#fff">
              360
            </Mono>
          </g>
          <g data-pulse="0">
            <circle r="2.6" fill={RED} />
          </g>
          <g data-pulse="3">
            <circle r="2.6" fill={RED} />
          </g>
          <Mono x={150} y={20} anchor="middle" size={6} fill={DIM}>
            one event stream · 8 stakeholders
          </Mono>
        </>
      )}

      {type === "rates" && (
        <>
          <g data-in>
            <ellipse cx="62" cy="52" rx="26" ry="8" fill={INK} stroke={MIST} strokeWidth="1.1" />
            <path d="M36 52 V 88 A 26 8 0 0 0 88 88 V 52" fill={INK} stroke={MIST} strokeWidth="1.1" />
            <ellipse cx="62" cy="52" rx="26" ry="8" fill="rgba(255,10,34,0.18)" />
            <Mono x={62} y={74} anchor="middle" size={5.8} fill="rgba(255,255,255,0.7)">
              rate db
            </Mono>
          </g>
          <path data-route d="M92 62 C 140 40, 180 34, 232 34" stroke={LINE} strokeWidth="1.2" />
          <path data-route d="M92 72 C 150 72, 180 72, 232 72" stroke={LINE} strokeWidth="1.2" />
          <path data-route d="M92 82 C 140 104, 180 110, 232 110" stroke={LINE} strokeWidth="1.2" />
          {(
            [
              [252, 34, "Sales"],
              [252, 72, "API"],
              [252, 110, "Portal"],
            ] as [number, number, string][]
          ).map(([x, y, l]) => (
            <g key={l} data-in>
              <rect x={x - 20} y={y - 9} width="44" height="18" rx="4" fill={INK} stroke={LINE} />
              <Mono x={x + 2} y={y + 3} anchor="middle" size={6}>
                {l}
              </Mono>
            </g>
          ))}
          {[0, 1, 2].map((i) => (
            <g key={i} data-pulse={i}>
              <circle r="2.6" fill={RED} />
            </g>
          ))}
          <Mono x={62} y={118} anchor="middle" size={6} fill={DIM}>
            one source
          </Mono>
          <Mono x={150} y={140} anchor="middle" size={6} fill={DIM}>
            same price on every channel
          </Mono>
        </>
      )}

      {type === "settlement" && (
        <>
          {(
            [
              ["176-4820 1943", "USD 4,120", 34],
              ["176-4818 2210", "USD 1,865", 60],
              ["098-1142 8830", "USD 7,340", 86],
              ["020-3301 5518", "USD 2,410", 112],
            ] as [string, string, number][]
          ).map(([awb, amt, y]) => (
            <g key={awb} data-in>
              <rect x="34" y={y - 12} width="232" height="22" rx="4" fill={INK} stroke={LINE} />
              <Mono x={44} y={y + 2} size={6.4} fill="rgba(255,255,255,0.65)">
                {awb}
              </Mono>
              <Mono x={196} y={y + 2} size={6.4} anchor="end" fill={MIST}>
                {amt}
              </Mono>
              <g data-check>
                <circle cx="244" cy={y - 1} r="7" fill="rgba(255,10,34,0.15)" stroke={RED} strokeWidth="1.1" />
                <path d={`M240.5 ${y - 1} l 2.5 2.5 l 4.5 -5`} stroke={RED} strokeWidth="1.4" strokeLinecap="round" />
              </g>
            </g>
          ))}
          <Mono x={34} y={140} size={6} fill={DIM}>
            CASS-ready
          </Mono>
          <Mono x={266} y={140} size={6} anchor="end" fill={RED}>
            4/4 reconciled
          </Mono>
        </>
      )}

      {type === "portal" && (
        <>
          <g data-in>
            <rect x="34" y="22" width="232" height="106" rx="8" fill={INK} stroke={LINE} />
            <path d="M34 44 H 266" stroke={LINE} />
            <circle cx="48" cy="33" r="2.5" fill={RED} opacity="0.8" />
            <circle cx="58" cy="33" r="2.5" fill={DIM} />
            <circle cx="68" cy="33" r="2.5" fill={DIM} />
            <rect x="96" y="27" width="108" height="12" rx="6" fill="rgba(255,255,255,0.05)" />
            <Mono x={150} y={35.5} anchor="middle" size={5.6} fill={DIM}>
              kontrol.kargo360.ai
            </Mono>
          </g>
          <g data-in>
            <Mono x={48} y={62} size={6.2} fill="rgba(255,255,255,0.7)">
              176-4820 1943 · DEL → CDG
            </Mono>
            <rect x="48" y="70" width="204" height="4" rx="2" fill="rgba(255,255,255,0.08)" />
            <rect data-progress x="48" y="70" width="204" height="4" rx="2" fill="url(#fx-red)" />
            <Mono x={48} y={90} size={5.8} fill={DIM}>
              booked
            </Mono>
            <Mono x={150} y={90} size={5.8} fill={DIM} anchor="middle">
              in transit
            </Mono>
            <Mono x={252} y={90} size={5.8} fill={DIM} anchor="end">
              delivered
            </Mono>
          </g>
          <g data-in>
            <rect x="48" y="100" width="86" height="16" rx="8" fill="rgba(255,10,34,0.12)" />
            <Mono x={91} y={110.5} anchor="middle" size={5.8} fill={RED}>
              docs · invoices
            </Mono>
            <Mono x={252} y={111} anchor="end" size={6.2} fill={RED}>
              −85% support calls
            </Mono>
          </g>
        </>
      )}
    </svg>
  );
}
