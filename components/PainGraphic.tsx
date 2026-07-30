"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

export type PainGraphicType = "manual" | "lag" | "silo" | "versions" | "leak" | "tickets";

const LINE = "rgba(255,255,255,0.14)";
const MIST = "rgba(255,255,255,0.4)";
const DIM = "rgba(255,255,255,0.25)";
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

function Cross({ x, y }: { x: number; y: number }) {
  return (
    <g data-blink>
      <circle cx={x} cy={y} r="6" fill="rgba(255,10,34,0.12)" stroke={RED} strokeWidth="1" />
      <path d={`M${x - 2.4} ${y - 2.4} l 4.8 4.8 M${x + 2.4} ${y - 2.4} l -4.8 4.8`} stroke={RED} strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

/** Small "broken legacy workflow" diagram for each pain card. viewBox 300×150. */
export default function PainGraphic({ type }: { type: PainGraphicType }) {
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

      // dashed connectors slowly "march" — old processes grinding along
      el.querySelectorAll<SVGPathElement>("[data-march]").forEach((p) => {
        loops.push(
          gsap.to(p, { strokeDashoffset: "-=24", duration: 3, repeat: -1, ease: "none" })
        );
      });

      // failure markers blink
      const blinks = el.querySelectorAll("[data-blink]");
      if (blinks.length)
        loops.push(
          gsap.to(blinks, { opacity: 0.25, duration: 0.9, yoyo: true, repeat: -1, ease: "steps(1)", stagger: 0.3 })
        );

      // stacked items (tickets/docs) pop in one after another, then reset
      const stack = el.querySelectorAll("[data-stack]");
      if (stack.length)
        loops.push(
          gsap.fromTo(
            stack,
            { opacity: 0, y: 6 },
            { opacity: 1, y: 0, duration: 0.4, ease: "power2.out", stagger: 0.5, repeat: -1, repeatDelay: 1.6 }
          )
        );

      // slow decline (leak bars)
      const sink = el.querySelectorAll("[data-sink]");
      if (sink.length)
        loops.push(
          gsap.to(sink, {
            scaleY: 0.82,
            transformOrigin: "bottom",
            duration: 2.4,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            stagger: 0.3,
          })
        );

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, [type]);

  const box = (x: number, y: number, w: number, label: string, sub?: string) => (
    <g data-in>
      <rect x={x - w / 2} y={y - 11} width={w} height="22" rx="4" fill={INK} stroke={LINE} />
      <Mono x={x} y={y + 3} anchor="middle" size={6.2} fill="rgba(255,255,255,0.6)">
        {label}
      </Mono>
      {sub && (
        <Mono x={x} y={y + 22} anchor="middle" size={5.6} fill={DIM}>
          {sub}
        </Mono>
      )}
    </g>
  );

  return (
    <svg ref={root} viewBox="0 0 300 150" className="h-full w-full" fill="none" aria-hidden preserveAspectRatio="xMidYMid meet">
      {type === "manual" && (
        <>
          {box(48, 34, 60, "Phone", "9 calls")}
          {box(48, 76, 60, "Email", "31 threads")}
          {box(48, 118, 60, "WhatsApp", "…scrolling")}
          <path data-march d="M80 34 C 130 34, 150 60, 196 68" stroke={DIM} strokeWidth="1" strokeDasharray="3 4" />
          <path data-march d="M80 76 C 120 76, 150 74, 196 76" stroke={DIM} strokeWidth="1" strokeDasharray="3 4" />
          <path data-march d="M80 118 C 130 118, 150 92, 196 84" stroke={DIM} strokeWidth="1" strokeDasharray="3 4" />
          <g data-in>
            <rect x="196" y="48" width="76" height="56" rx="4" fill={INK} stroke={LINE} />
            {[62, 76, 90].map((y) => (
              <path key={y} d={`M204 ${y} H 264`} stroke={LINE} />
            ))}
            <path d="M224 52 V 100 M 246 52 V 100" stroke={LINE} />
            <Mono x={234} y={116} anchor="middle" size={5.6} fill={DIM}>
              bookings_final_v14.xlsx
            </Mono>
          </g>
          <Cross x={150} y={76} />
          <Mono x={150} y={140} anchor="middle" size={6} fill={DIM}>
            same data typed 3 times
          </Mono>
        </>
      )}

      {type === "lag" && (
        <>
          <g data-in>
            <path d="M34 96 H 266" stroke={LINE} strokeWidth="1.2" />
            {Array.from({ length: 11 }, (_, i) => 34 + i * 23.2).map((x, i) => (
              <g key={x}>
                <path d={`M${x} 96 v 5`} stroke={LINE} />
                {i % 5 === 0 && (
                  <Mono x={x} y={112} anchor="middle" size={5.4} fill={DIM}>
                    d{i * 3}
                  </Mono>
                )}
              </g>
            ))}
          </g>
          <g data-in>
            <circle cx="57" cy="96" r="3.5" fill={MIST} />
            <Mono x={57} y={82} anchor="middle" size={5.8}>
              freight flies
            </Mono>
          </g>
          <path data-march d="M62 96 H 240" stroke={DIM} strokeWidth="1" strokeDasharray="3 5" />
          <g data-in>
            <rect x="230" y="52" width="30" height="36" rx="3" fill={INK} stroke={LINE} />
            <path d="M236 62 H 254 M236 70 H 254 M236 78 H 248" stroke={LINE} />
            <Mono x={245} y={44} anchor="middle" size={5.8} fill={MIST}>
              report lands
            </Mono>
          </g>
          <g data-in>
            <path d="M62 128 H 234" stroke={RED} strokeOpacity="0.5" strokeWidth="1" />
            <path d="M62 124 v 8 M234 124 v 8" stroke={RED} strokeOpacity="0.5" />
            <Mono x={148} y={124} anchor="middle" size={6} fill={RED}>
              30 days blind
            </Mono>
          </g>
        </>
      )}

      {type === "silo" && (
        <>
          {box(60, 62, 64, "Sales", "CRM v9")}
          {box(150, 62, 64, "Ops", "legacy ERP")}
          {box(240, 62, 64, "Finance", "tally + xls")}
          <path d="M94 62 H 116" stroke={DIM} strokeWidth="1" strokeDasharray="3 4" />
          <path d="M184 62 H 206" stroke={DIM} strokeWidth="1" strokeDasharray="3 4" />
          <Cross x={105} y={62} />
          <Cross x={195} y={62} />
          {[60, 150, 240].map((x) => (
            <g key={x} data-in>
              <ellipse cx={x} cy={102} rx="13" ry="4" fill={INK} stroke={DIM} strokeWidth="0.8" />
              <path d={`M${x - 13} 102 v 12 a 13 4 0 0 0 26 0 v -12`} fill={INK} stroke={DIM} strokeWidth="0.8" />
            </g>
          ))}
          <Mono x={150} y={140} anchor="middle" size={6} fill={DIM}>
            3 databases · 0 sync · reconciled by hand
          </Mono>
        </>
      )}

      {type === "versions" && (
        <>
          <g data-in transform="rotate(-4 90 70)">
            <rect x="52" y="38" width="78" height="52" rx="4" fill={INK} stroke={LINE} />
            <Mono x={91} y={56} anchor="middle" size={5.8} fill={DIM}>
              rates_Q3.pdf
            </Mono>
            <Mono x={91} y={74} anchor="middle" size={8} fill={MIST}>
              2.10/kg
            </Mono>
          </g>
          <g data-in transform="rotate(3 150 84)">
            <rect x="112" y="58" width="78" height="52" rx="4" fill={INK} stroke={LINE} />
            <Mono x={151} y={76} anchor="middle" size={5.8} fill={DIM}>
              re: re: fw: rates
            </Mono>
            <Mono x={151} y={94} anchor="middle" size={8} fill={MIST}>
              2.40/kg
            </Mono>
          </g>
          <g data-in transform="rotate(-2 210 62)">
            <rect x="172" y="34" width="78" height="52" rx="4" fill={INK} stroke={LINE} />
            <Mono x={211} y={52} anchor="middle" size={5.8} fill={DIM}>
              rates_NEW_use_this
            </Mono>
            <Mono x={211} y={70} anchor="middle" size={8} fill={MIST}>
              1.95/kg
            </Mono>
          </g>
          <Cross x={258} y={100} />
          <Mono x={150} y={134} anchor="middle" size={6} fill={DIM}>
            3 versions of the truth · quoted differently
          </Mono>
        </>
      )}

      {type === "leak" && (
        <>
          <g data-in>
            <path d="M36 118 H 268" stroke={LINE} strokeWidth="1.2" />
          </g>
          {[
            { x: 52, h: 62 },
            { x: 88, h: 56 },
            { x: 124, h: 48 },
            { x: 160, h: 42 },
            { x: 196, h: 33 },
            { x: 232, h: 26 },
          ].map((b, i) => (
            <rect
              key={b.x}
              data-sink
              x={b.x}
              y={118 - b.h}
              width="20"
              height={b.h}
              rx="2"
              fill={i >= 4 ? "rgba(255,10,34,0.25)" : "rgba(255,255,255,0.09)"}
            />
          ))}
          <path data-march d="M62 50 L 98 58 L 134 66 L 170 74 L 206 84 L 242 92" stroke={RED} strokeOpacity="0.55" strokeWidth="1.2" strokeDasharray="4 3" />
          <g data-in>
            <Mono x={266} y={44} anchor="end" size={6.4} fill={RED}>
              − USD 1,240 / wk
            </Mono>
            <Mono x={266} y={56} anchor="end" size={5.6} fill={DIM}>
              unbilled · undetected
            </Mono>
          </g>
          <Mono x={36} y={140} size={6} fill={DIM}>
            found at month-end — too late
          </Mono>
        </>
      )}

      {type === "tickets" && (
        <>
          {[
            { y: 30, w: 168, t: "where is my shipment?" },
            { y: 62, w: 152, t: "any update on 176-4820?" },
            { y: 94, w: 176, t: "pls send POD + invoice again" },
          ].map((b) => (
            <g key={b.y} data-stack>
              <path
                d={`M40 ${b.y - 12} h ${b.w} a 6 6 0 0 1 6 6 v 12 a 6 6 0 0 1 -6 6 h -${b.w - 14} l -10 9 v -9 a 6 6 0 0 1 -6 -6 v -12 a 6 6 0 0 1 6 -6 z`}
                fill={INK}
                stroke={LINE}
              />
              <Mono x={52} y={b.y + 4} size={6.2} fill="rgba(255,255,255,0.55)">
                {b.t}
              </Mono>
            </g>
          ))}
          <g data-in>
            <circle cx="252" cy="62" r="17" fill={INK} stroke={LINE} />
            <path
              d="M245 55 c 0 -2 2 -3 3.5 -2.5 l 2.5 1.5 c 1 0.8 1 2 0.3 3 l -1.6 2 c 1.2 3 3.6 5.4 6.6 6.6 l 2 -1.6 c 1 -0.7 2.2 -0.7 3 0.3 l 1.5 2.5 c 0.8 1.5 -0.5 3.5 -2.5 3.5 c -8.8 -0.6 -14.7 -6.5 -15.3 -15.3 z"
              fill={MIST}
            />
            <circle data-blink cx="266" cy="48" r="5" fill={RED} />
          </g>
          <Mono x={252} y={94} anchor="middle" size={5.8} fill={RED}>
            call #47 today
          </Mono>
          <Mono x={150} y={138} anchor="middle" size={6} fill={DIM}>
            every AWB · every day · answered by a human
          </Mono>
        </>
      )}
    </svg>
  );
}
