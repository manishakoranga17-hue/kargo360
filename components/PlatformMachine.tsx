"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

/**
 * Hero centerpiece — the Kargo360 platform as a machined control device
 * (authkit-style, with real depth: raised plates, recessed wells, glows).
 * Five compartments each run a tiny loop showing a piece of the cargo
 * workflow being handled. viewBox 1000×650.
 */

const RED = "#ff2f45";
const rnd = (i: number, salt: number) => (((i + 11) * 2654435761 + salt * 97911) % 1000) / 1000;

function Pill({ x, y, label }: { x: number; y: number; label: string }) {
  const w = label.length * 7.6 + 34;
  return (
    <g data-in filter="url(#pm-drop-sm)">
      <rect x={x - w / 2} y={y - 15} width={w} height={30} rx={15} fill="url(#pm-pill)" stroke="rgba(255,255,255,0.12)" />
      <path d={`M${x - w / 2 + 12} ${y - 14} H ${x + w / 2 - 12}`} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <text x={x} y={y + 4.5} textAnchor="middle" fontSize="13.5" fill="rgba(255,255,255,0.85)" style={{ letterSpacing: "0.04em" }}>
        {label}
      </text>
    </g>
  );
}

/* raised compartment shell */
function Comp({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={14} fill="url(#pm-comp)" stroke="rgba(255,255,255,0.10)" filter="url(#pm-drop-sm)" />
      <path d={`M${x + 14} ${y + 1} H ${x + w - 14}`} stroke="rgba(255,255,255,0.13)" strokeWidth="1" />
      <path d={`M${x + 14} ${y + h - 1} H ${x + w - 14}`} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
    </>
  );
}

/* recessed well — dark pit with inner shadow at top, light lip at bottom */
function Well({ x, y, w, h, rx }: { x: number; y: number; w: number; h: number; rx: number }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="#060609" stroke="rgba(0,0,0,0.6)" />
      <rect x={x} y={y} width={w} height={h} rx={rx} fill="url(#pm-well-shade)" />
      <path d={`M${x + rx} ${y + h + 1} H ${x + w - rx}`} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
    </>
  );
}

const BTN_GLYPHS = ["square", "circle", "triangle", "hex", "diamond", "cross"] as const;

function BtnGlyph({ kind, cx, cy, lit }: { kind: (typeof BTN_GLYPHS)[number]; cx: number; cy: number; lit?: boolean }) {
  const s = lit ? RED : "rgba(255,255,255,0.4)";
  switch (kind) {
    case "square":
      return <rect x={cx - 7} y={cy - 7} width={14} height={14} rx={2} stroke={s} strokeWidth="1.6" />;
    case "circle":
      return <circle cx={cx} cy={cy} r={8} stroke={s} strokeWidth="1.6" />;
    case "triangle":
      return <path d={`M${cx} ${cy - 8} L${cx + 8} ${cy + 7} H ${cx - 8} Z`} stroke={s} strokeWidth="1.6" strokeLinejoin="round" />;
    case "hex":
      return (
        <polygon
          points={`${cx},${cy - 9} ${cx + 8},${cy - 4.5} ${cx + 8},${cy + 4.5} ${cx},${cy + 9} ${cx - 8},${cy + 4.5} ${cx - 8},${cy - 4.5}`}
          stroke={s}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      );
    case "diamond":
      return <rect x={cx - 6.5} y={cy - 6.5} width={13} height={13} rx={2} stroke={s} strokeWidth="1.6" transform={`rotate(45 ${cx} ${cy})`} />;
    case "cross":
      return <path d={`M${cx - 7} ${cy} H ${cx + 7} M${cx} ${cy - 7} V ${cy + 7}`} stroke={s} strokeWidth="1.6" strokeLinecap="round" />;
  }
}

export default function PlatformMachine() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: (gsap.core.Tween | gsap.core.Timeline)[] = [];
      const once = { trigger: el, start: "top 85%", once: true } as const;

      gsap.from(el.querySelectorAll("[data-in]"), {
        opacity: 0,
        y: 16,
        duration: 0.8,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: once,
      });

      // — booking console: AWB digits type in, hold, clear —
      el.querySelectorAll<SVGGElement>("[data-well]").forEach((well, wi) => {
        const dots = well.querySelectorAll("[data-dot]");
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6, delay: wi * 1.1 });
        tl.fromTo(
          dots,
          { scale: 0, opacity: 0, transformOrigin: "center" },
          { scale: 1, opacity: 1, duration: 0.18, stagger: 0.16, ease: "back.out(2)" }
        )
          .to({}, { duration: 1.4 })
          .to(dots, { opacity: 0, duration: 0.25 });
        loops.push(tl);
      });
      loops.push(
        gsap.to(el.querySelectorAll("[data-cursor]"), {
          opacity: 0.15,
          duration: 0.6,
          yoyo: true,
          repeat: -1,
          ease: "steps(1)",
        })
      );

      // — control buttons press one after another —
      const btns = el.querySelectorAll("[data-btn]");
      const btl = gsap.timeline({ repeat: -1, repeatDelay: 0.9 });
      btns.forEach((b, i) => {
        btl.to(b, { y: 2, duration: 0.14, yoyo: true, repeat: 1, ease: "power1.inOut" }, i * 0.55);
      });
      loops.push(btl);

      // — capacity LEDs breathe like an equalizer —
      loops.push(
        gsap.fromTo(
          el.querySelectorAll("[data-led]"),
          { scaleY: 0.55, transformOrigin: "center bottom", opacity: 0.55 },
          { scaleY: 1, opacity: 1, duration: 0.9, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 0.14 }
        )
      );

      // — route pulse travels port → node → port —
      const routePath = el.querySelector<SVGPathElement>("[data-routepath]");
      const routeDot = el.querySelector<SVGGElement>("[data-routedot]");
      if (routePath && routeDot) {
        const len = routePath.getTotalLength();
        const trip = { t: 0 };
        loops.push(
          gsap.to(trip, {
            t: 1,
            duration: 2.4,
            repeat: -1,
            repeatDelay: 0.7,
            yoyo: true,
            ease: "power1.inOut",
            onUpdate: () => {
              const p = routePath.getPointAtLength(trip.t * len);
              gsap.set(routeDot, { attr: { transform: `translate(${p.x},${p.y})` } });
            },
          })
        );
      }

      // — stakeholder highlight ring slides between chips —
      const rings = el.querySelectorAll("[data-chipring]");
      if (rings.length) {
        const ctl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 });
        ctl.to(rings, { attr: { cx: 732 }, duration: 0.5, ease: "power2.inOut", delay: 1.2 }).to(rings, {
          attr: { cx: 668 },
          duration: 0.5,
          ease: "power2.inOut",
          delay: 1.2,
        });
        loops.push(ctl);
      }

      // — hex core breathes —
      loops.push(
        gsap.to(el.querySelectorAll("[data-glow]"), {
          opacity: 0.9,
          scale: 1.05,
          transformOrigin: "center",
          duration: 2.6,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        })
      );

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, []);

  // faint PCB debris across the backdrop
  const debris: React.ReactNode[] = [];
  for (let i = 0; i < 70; i++) {
    const x = Math.round(rnd(i * 17 + 3, 1) * 960 + 20);
    const y = Math.round(rnd(i * 31 + 7, 2) * 610 + 20);
    const kind = rnd(i * 7 + 1, 3);
    if (kind < 0.45) {
      const sz = 3 + Math.round(rnd(i, 4) * 4);
      debris.push(<rect key={i} x={x} y={y} width={sz} height={sz} fill="rgba(255,255,255,0.5)" />);
    } else if (kind < 0.78) {
      debris.push(
        <g key={i} fill="rgba(255,255,255,0.5)">
          <rect x={x} y={y} width={2.4} height={2.4} />
          <rect x={x + 6} y={y} width={2.4} height={2.4} />
          <rect x={x + 12} y={y} width={2.4} height={2.4} />
        </g>
      );
    } else {
      debris.push(
        <g key={i} stroke="rgba(255,255,255,0.4)" fill="none">
          <rect x={x} y={y} width={14} height={8} rx={1.5} />
          <path d={`M${x + 3.5} ${y - 3} v 3 M${x + 10.5} ${y - 3} v 3 M${x + 3.5} ${y + 8} v 3 M${x + 10.5} ${y + 8} v 3`} />
        </g>
      );
    }
  }

  const screws: React.ReactNode[] = [];
  for (let x = 192; x <= 808; x += 13) {
    screws.push(<circle key={`t${x}`} cx={x} cy={104} r={1.8} fill="rgba(0,0,0,0.65)" />);
    screws.push(<circle key={`t2${x}`} cx={x} cy={104.8} r={1.8} fill="rgba(255,255,255,0.09)" />);
    screws.push(<circle key={`b${x}`} cx={x} cy={516} r={1.8} fill="rgba(0,0,0,0.65)" />);
    screws.push(<circle key={`b2${x}`} cx={x} cy={516.8} r={1.8} fill="rgba(255,255,255,0.09)" />);
  }

  return (
    <svg ref={root} viewBox="0 0 1000 650" className="h-auto w-full" fill="none" aria-hidden>
      <defs>
        <linearGradient id="pm-plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d1d24" />
          <stop offset="55%" stopColor="#131318" />
          <stop offset="100%" stopColor="#0b0b0e" />
        </linearGradient>
        <linearGradient id="pm-comp" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#191920" />
          <stop offset="100%" stopColor="#0e0e12" />
        </linearGradient>
        <linearGradient id="pm-btn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22222b" />
          <stop offset="100%" stopColor="#12121a" />
        </linearGradient>
        <linearGradient id="pm-pill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b1b22" />
          <stop offset="100%" stopColor="#101015" />
        </linearGradient>
        <linearGradient id="pm-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2f45" />
          <stop offset="55%" stopColor="#ff0a22" />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
        {/* inner shadow for recessed wells */}
        <linearGradient id="pm-well-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.65)" />
          <stop offset="28%" stopColor="rgba(0,0,0,0)" />
          <stop offset="86%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </linearGradient>
        {/* bezel inner shadow */}
        <linearGradient id="pm-bezel-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="7%" stopColor="rgba(0,0,0,0)" />
          <stop offset="93%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
        </linearGradient>
        <radialGradient id="pm-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,10,34,0.26)" />
          <stop offset="60%" stopColor="rgba(255,10,34,0.08)" />
          <stop offset="100%" stopColor="rgba(255,10,34,0)" />
        </radialGradient>
        <filter id="pm-drop" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="18" floodColor="#000000" floodOpacity="0.6" />
        </filter>
        <filter id="pm-drop-sm" x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000000" floodOpacity="0.5" />
        </filter>
        <filter id="pm-glow-red" x="-90%" y="-90%" width="280%" height="280%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
      </defs>

      {/* backdrop */}
      <g opacity="0.08">{debris}</g>
      <g stroke="rgba(255,255,255,0.07)" strokeWidth="1.2">
        <path d="M108 200 H 36" />
        <path d="M108 430 H 60 Q 48 430 48 442 V 520" />
        <path d="M892 180 H 948 Q 960 180 960 192 V 300" />
        <path d="M892 460 H 966" />
        <path d="M500 56 V 12" />
        <path d="M320 594 V 640" opacity="0.7" />
        <path d="M700 594 V 640" opacity="0.7" />
      </g>
      <g fill="rgba(255,255,255,0.14)">
        <circle cx="36" cy="200" r="3" />
        <circle cx="48" cy="520" r="3" />
        <circle cx="960" cy="300" r="3" />
        <circle cx="966" cy="460" r="3" />
        <circle cx="500" cy="12" r="3" />
      </g>

      <circle data-glow cx="500" cy="300" r="290" fill="url(#pm-aura)" opacity="0.7" />

      {/* blueprint outline */}
      <path
        data-in
        d="M160 56 H840 L892 108 V508 L840 560 H160 L108 508 V108 Z"
        stroke="rgba(255,255,255,0.09)"
        strokeWidth="1.2"
      />

      {/* ===== device plate (raised, casts shadow) ===== */}
      <g data-in>
        <rect x="170" y="92" width="660" height="436" rx="26" fill="url(#pm-plate)" stroke="rgba(255,255,255,0.13)" filter="url(#pm-drop)" />
        <path d="M196 93.5 H 804" stroke="rgba(255,255,255,0.20)" strokeWidth="1.2" />
        <path d="M196 526.5 H 804" stroke="rgba(0,0,0,0.6)" strokeWidth="1.2" />
        {screws}
        {/* recessed bezel */}
        <rect x="188" y="118" width="624" height="384" rx="20" fill="#08080b" stroke="rgba(0,0,0,0.7)" />
        <rect x="188" y="118" width="624" height="384" rx="20" fill="url(#pm-bezel-shade)" />
        <path d="M208 501 H 792" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      </g>

      {/* ===== compartments ===== */}
      {/* booking console */}
      <g data-in>
        <Comp x={200} y={130} w={292} h={170} />
        {[168, 222].map((wy, wi) => (
          <g key={wy}>
            <Well x={230} y={wy} w={232} h={32} rx={16} />
            <g data-well>
              <rect data-cursor x={246} y={wy + 8} width={2.5} height={16} rx={1} fill={RED} />
              {Array.from({ length: 8 }, (_, di) => (
                <circle
                  key={di}
                  data-dot
                  cx={264 + di * 22}
                  cy={wy + 16}
                  r={3.6}
                  fill={wi === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)"}
                />
              ))}
            </g>
          </g>
        ))}
      </g>

      {/* control buttons */}
      <g data-in>
        <Comp x={508} y={130} w={292} h={170} />
        {BTN_GLYPHS.map((kind, i) => {
          const cx = 572 + (i % 3) * 68;
          const cy = 182 + Math.floor(i / 3) * 62;
          const lit = i === 2;
          return (
            <g key={kind}>
              <Well x={cx - 23} y={cy - 23} w={46} h={46} rx={11} />
              <g data-btn>
                {lit && (
                  <rect x={cx - 18} y={cy - 18} width={36} height={36} rx={9} fill={RED} opacity="0.5" filter="url(#pm-glow-red)" />
                )}
                <rect
                  x={cx - 18}
                  y={cy - 18}
                  width={36}
                  height={36}
                  rx={9}
                  fill={lit ? "rgba(60,12,17,1)" : "url(#pm-btn)"}
                  stroke={lit ? "rgba(255,47,69,0.65)" : "rgba(255,255,255,0.16)"}
                  filter="url(#pm-drop-sm)"
                />
                <path d={`M${cx - 10} ${cy - 17.2} H ${cx + 10}`} stroke={lit ? "rgba(255,120,134,0.5)" : "rgba(255,255,255,0.2)"} strokeWidth="1" />
                <BtnGlyph kind={kind} cx={cx} cy={cy} lit={lit} />
              </g>
            </g>
          );
        })}
      </g>

      {/* capacity LEDs */}
      <g data-in>
        <Comp x={200} y={312} w={200} h={178} />
        <Well x={225} y={378} w={150} h={46} rx={23} />
        {Array.from({ length: 7 }, (_, i) => {
          const lit = i < 4;
          return (
            <g key={i}>
              {lit && (
                <rect x={240 + i * 19} y={388} width={9} height={26} rx={4.5} fill={RED} opacity="0.55" filter="url(#pm-glow-red)" />
              )}
              <rect
                data-led
                x={240 + i * 19}
                y={388}
                width={9}
                height={26}
                rx={4.5}
                fill={lit ? "url(#pm-red)" : "rgba(255,255,255,0.10)"}
              />
            </g>
          );
        })}
      </g>

      {/* live route */}
      <g data-in>
        <Comp x={412} y={312} w={176} h={178} />
        <Well x={428} y={344} w={36} h={16} rx={8} />
        <Well x={536} y={344} w={36} h={16} rx={8} />
        <path
          data-routepath
          d="M446 360 V 428 Q446 440 458 440 H 542 Q554 440 554 428 V 360"
          stroke="rgba(255,255,255,0.16)"
          strokeWidth="1.4"
        />
        <circle cx="500" cy="440" r="9" fill="#060609" stroke="rgba(255,47,69,0.6)" strokeWidth="1.4" />
        <circle cx="500" cy="440" r="2.6" fill={RED} />
        <g data-routedot>
          <circle r="6" fill={RED} opacity="0.5" filter="url(#pm-glow-red)" />
          <circle r="3" fill={RED} />
        </g>
      </g>

      {/* stakeholder chips */}
      <g data-in>
        <Comp x={600} y={312} w={200} h={178} />
        <Well x={628} y={367} w={144} h={66} rx={33} />
        {[668, 732].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy={400} r={22} fill="url(#pm-btn)" stroke="rgba(255,255,255,0.16)" filter="url(#pm-drop-sm)" />
            <path d={`M${cx - 10} ${400 - 21.2} A 22 22 0 0 1 ${cx + 10} ${400 - 21.2}`} stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <circle cx={cx} cy={394} r={5} stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
            <path d={`M${cx - 8} 411 a 8 8 0 0 1 16 0`} stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" />
          </g>
        ))}
        <circle data-chipring cx="668" cy="400" r="26" stroke={RED} strokeWidth="2.4" opacity="0.5" filter="url(#pm-glow-red)" />
        <circle data-chipring cx="668" cy="400" r="25" stroke={RED} strokeWidth="1.6" opacity="0.9" />
      </g>

      {/* ===== hex core ===== */}
      <g data-in>
        {/* bloom behind the core */}
        <polygon
          data-glow
          points="500,236 556,268 556,332 500,364 444,332 444,268"
          fill={RED}
          opacity="0.4"
          filter="url(#pm-glow-red)"
        />
        {/* socket plate */}
        <polygon
          points="500,232 560,266 560,334 500,368 440,334 440,266"
          fill="#0d0d11"
          stroke="rgba(255,255,255,0.14)"
          strokeWidth="1.4"
          strokeLinejoin="round"
          filter="url(#pm-drop-sm)"
        />
        <path d="M500 232 L560 266" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        <path d="M500 232 L440 266" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2" />
        {/* red core */}
        <polygon
          points="500,254 540,277 540,323 500,346 460,323 460,277"
          fill="url(#pm-red)"
          stroke="rgba(255,140,152,0.8)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* top facet highlight */}
        <path d="M500 254 L540 277 L500 300 L460 277 Z" fill="rgba(255,255,255,0.14)" />
        <text x="500" y="308" textAnchor="middle" fontSize="24" fontWeight="600" fill="#fff">
          360
        </text>
      </g>

      {/* ===== labels ===== */}
      <g stroke="rgba(255,255,255,0.10)">
        <path d="M320 44 V 56" />
        <path d="M680 44 V 56" />
        <path d="M300 560 V 580" />
        <path d="M500 560 V 580" />
        <path d="M700 560 V 580" />
      </g>
      <Pill x={320} y={30} label="Bookings & Quotes" />
      <Pill x={680} y={30} label="Live Tracking" />
      <Pill x={300} y={596} label="Capacity Control" />
      <Pill x={500} y={596} label="Settlement & CASS" />
      <Pill x={700} y={596} label="Stakeholder Portals" />
    </svg>
  );
}
