"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

/**
 * "The GSA model" — authkit-style circuit board. Kargo360 is the central
 * processor; airline, market, portal, settlement and ops are peripheral
 * chips wired to it with PCB traces that carry live pulses.
 * viewBox 1200×700.
 */

const SOCKET = "#0d0d10";
const FACE_STROKE = "rgba(255,255,255,0.12)";
const SOCKET_STROKE = "rgba(255,255,255,0.07)";
const TRACE = "rgba(255,255,255,0.10)";
const TRACE_LIT = "rgba(255,255,255,0.16)";
const MIST = "rgba(255,255,255,0.55)";
const DIM = "rgba(255,255,255,0.3)";
const RED = "#ff2f45";

// deterministic pseudo-random for the PCB debris (stable across SSR/CSR)
const rnd = (i: number, salt: number) => (((i + 11) * 2654435761 + salt * 97911) % 1000) / 1000;

function Pins({ x, y, s }: { x: number; y: number; s: number }) {
  const half = s / 2;
  const offs = [-s * 0.28, -s * 0.1, s * 0.1, s * 0.28];
  return (
    <g stroke="rgba(255,255,255,0.10)" strokeWidth="2">
      {offs.map((o) => (
        <g key={o}>
          <path d={`M${x + o} ${y - half - 8} v 6`} />
          <path d={`M${x + o} ${y + half + 2} v 6`} />
          <path d={`M${x - half - 8} ${y + o} h 6`} />
          <path d={`M${x + half + 2} ${y + o} h 6`} />
        </g>
      ))}
    </g>
  );
}

function Chip({
  x,
  y,
  s,
  label,
  children,
  accent = false,
}: {
  x: number;
  y: number;
  s: number;
  label: string;
  children?: React.ReactNode;
  accent?: boolean;
}) {
  const half = s / 2;
  const inset = s * 0.11;
  const pillW = label.length * 7.4 + 30;
  return (
    <g data-in>
      <Pins x={x} y={y} s={s} />
      {/* socket */}
      <rect x={x - half} y={y - half} width={s} height={s} rx={16} fill={SOCKET} stroke={SOCKET_STROKE} />
      {/* face */}
      <rect
        x={x - half + inset}
        y={y - half + inset}
        width={s - inset * 2}
        height={s - inset * 2}
        rx={11}
        fill="url(#gm-face)"
        stroke={accent ? "rgba(255,47,69,0.45)" : FACE_STROKE}
        strokeWidth={accent ? 1.4 : 1}
      />
      {/* face top edge-light */}
      <path
        d={`M${x - half + inset + 10} ${y - half + inset + 1} H ${x + half - inset - 10}`}
        stroke="rgba(255,255,255,0.14)"
        strokeWidth="1"
      />
      {children}
      {/* label pill */}
      <rect x={x - pillW / 2} y={y + half + 18} width={pillW} height={26} rx={13} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.09)" />
      <text x={x} y={y + half + 35} textAnchor="middle" fontSize="13" fill={MIST} style={{ letterSpacing: "0.06em" }}>
        {label}
      </text>
    </g>
  );
}

export default function GsaModelGraphic() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: gsap.core.Tween[] = [];
      const once = { trigger: el, start: "top 82%", once: true } as const;

      // chips rise in
      gsap.from(el.querySelectorAll("[data-in]"), {
        opacity: 0,
        y: 18,
        duration: 0.8,
        stagger: 0.12,
        ease: "power3.out",
        scrollTrigger: once,
      });
      // debris fades up
      gsap.from(el.querySelectorAll("[data-debris]"), {
        opacity: 0,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: once,
      });

      // traces draw themselves
      const routes = el.querySelectorAll<SVGPathElement>("[data-route]");
      routes.forEach((p, i) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(p, { strokeDashoffset: 0, duration: 1.2, delay: 0.3 + i * 0.12, ease: "power2.inOut", scrollTrigger: once });
      });

      // pulses of current traveling the traces
      el.querySelectorAll<SVGGElement>("[data-pulse]").forEach((dot, i) => {
        const path = routes[Number(dot.dataset.pulse ?? i)];
        if (!path) return;
        const len = path.getTotalLength();
        const trip = { t: 0 };
        loops.push(
          gsap.to(trip, {
            t: 1,
            duration: 2.6,
            ease: "power1.inOut",
            repeat: -1,
            repeatDelay: 1.4,
            delay: 1.6 + i * 0.7,
            onUpdate: () => {
              const p = path.getPointAtLength(trip.t * len);
              gsap.set(dot, { attr: { transform: `translate(${p.x},${p.y})` } });
            },
          })
        );
      });

      // center glow breathes
      loops.push(
        gsap.to(el.querySelectorAll("[data-glow]"), {
          opacity: 0.55,
          scale: 1.12,
          transformOrigin: "center",
          duration: 2.6,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        })
      );

      // radar sweep on the ops chip
      loops.push(
        gsap.to(el.querySelectorAll("[data-radar]"), {
          rotate: 360,
          svgOrigin: "920 516",
          duration: 5,
          repeat: -1,
          ease: "none",
        })
      );

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, []);

  // PCB debris — tiny pads, dots and ICs scattered faintly across the board
  const debris: React.ReactNode[] = [];
  for (let i = 0; i < 90; i++) {
    const x = Math.round(rnd(i * 17 + 3, 1) * 1160 + 20);
    const y = Math.round(rnd(i * 31 + 7, 2) * 660 + 20);
    const kind = rnd(i * 7 + 1, 3);
    if (kind < 0.4) {
      const sz = 3 + Math.round(rnd(i, 4) * 5);
      debris.push(<rect key={i} x={x} y={y} width={sz} height={sz} fill="rgba(255,255,255,0.5)" />);
    } else if (kind < 0.75) {
      debris.push(
        <g key={i} fill="rgba(255,255,255,0.5)">
          <rect x={x} y={y} width={2.5} height={2.5} />
          <rect x={x + 6} y={y} width={2.5} height={2.5} />
          <rect x={x + 12} y={y} width={2.5} height={2.5} />
        </g>
      );
    } else {
      debris.push(
        <g key={i} stroke="rgba(255,255,255,0.45)" fill="none">
          <rect x={x} y={y} width={16} height={9} rx={1.5} />
          <path d={`M${x + 4} ${y - 3} v 3 M${x + 12} ${y - 3} v 3 M${x + 4} ${y + 9} v 3 M${x + 12} ${y + 9} v 3`} />
        </g>
      );
    }
  }

  return (
    <svg ref={root} viewBox="0 0 1200 700" className="h-auto w-full" fill="none" aria-hidden>
      <defs>
        <linearGradient id="gm-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c1c22" />
          <stop offset="100%" stopColor="#0f0f13" />
        </linearGradient>
        <linearGradient id="gm-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2f45" />
          <stop offset="55%" stopColor="#ff0a22" />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
        <radialGradient id="gm-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,10,34,0.30)" />
          <stop offset="55%" stopColor="rgba(255,10,34,0.10)" />
          <stop offset="100%" stopColor="rgba(255,10,34,0)" />
        </radialGradient>
      </defs>

      {/* PCB debris layer */}
      <g data-debris opacity="0.09">
        {debris}
      </g>

      {/* ambient glow behind the processor */}
      <circle data-glow cx="600" cy="250" r="230" fill="url(#gm-glow)" opacity="0.4" />

      {/* ===== traces (authored in pulse-travel direction) ===== */}
      {/* 0: airline → center */}
      <path data-route d="M375 250 H 505" stroke={TRACE_LIT} strokeWidth="1.5" />
      {/* 1: center → market */}
      <path data-route d="M695 250 H 825" stroke={TRACE_LIT} strokeWidth="1.5" />
      {/* 2: portal → center */}
      <path data-route d="M420 464 V 432 Q420 420 432 420 H 548 Q560 420 560 408 V 345" stroke={TRACE_LIT} strokeWidth="1.5" />
      {/* 3: center → settlement */}
      <path data-route d="M640 345 V 418 Q640 430 652 430 H 698 Q710 430 710 442 V 464" stroke={TRACE_LIT} strokeWidth="1.5" />
      {/* 4: center → ops */}
      <path data-route d="M695 300 H 896 Q908 300 908 312 V 450" stroke={TRACE_LIT} strokeWidth="1.5" />

      {/* decorative dead-end traces, PCB style */}
      <g stroke={TRACE} strokeWidth="1.2">
        <path d="M265 250 H 140 Q128 250 128 262 V 380" />
        <path d="M935 250 H 1060 Q1072 250 1072 262 V 360" />
        <path d="M330 195 V 120 Q330 108 342 108 H 470" />
        <path d="M880 195 V 120 Q880 108 868 108 H 740" />
        <path d="M420 596 V 640 Q420 652 432 652 H 560" />
        <path d="M920 572 V 640 Q920 652 908 652 H 780" />
        <path d="M600 155 V 84" />
        <path d="M545 596 V 620" opacity="0.6" />
        <path d="M775 530 H 848" opacity="0.6" />
      </g>
      {/* trace endpoints */}
      <g fill="rgba(255,255,255,0.14)">
        <circle cx="128" cy="380" r="3.5" />
        <circle cx="1072" cy="360" r="3.5" />
        <circle cx="470" cy="108" r="3.5" />
        <circle cx="740" cy="108" r="3.5" />
        <circle cx="560" cy="652" r="3.5" />
        <circle cx="780" cy="652" r="3.5" />
        <circle cx="600" cy="84" r="3.5" />
      </g>

      {/* ===== peripheral chips ===== */}
      <Chip x={320} y={250} s={110} label="Your Airline">
        {/* paper plane */}
        <path
          d="M302 262 L338 250 L302 238 L310 250 Z"
          fill="rgba(255,255,255,0.6)"
          transform="rotate(-18 320 250)"
        />
      </Chip>

      <Chip x={880} y={250} s={110} label="Forwarder Market">
        {/* stacked cartons */}
        <g stroke="rgba(255,255,255,0.55)" strokeWidth="1.6" fill="rgba(255,255,255,0.06)">
          <rect x={856} y={252} width={20} height={20} rx={2} />
          <rect x={884} y={252} width={20} height={20} rx={2} />
          <rect x={870} y={228} width={20} height={20} rx={2} />
        </g>
      </Chip>

      {/* booking portal — browser window */}
      <g data-in>
        <rect x={318} y={464} width={204} height={132} rx={14} fill={SOCKET} stroke={SOCKET_STROKE} />
        <rect x={328} y={474} width={184} height={112} rx={9} fill="url(#gm-face)" stroke={FACE_STROKE} />
        <circle cx={342} cy={488} r={2.8} fill={RED} opacity="0.8" />
        <circle cx={352} cy={488} r={2.8} fill="rgba(255,255,255,0.25)" />
        <circle cx={362} cy={488} r={2.8} fill="rgba(255,255,255,0.25)" />
        <path d="M328 498 H 512" stroke={FACE_STROKE} />
        <rect x={344} y={510} width={152} height={13} rx={6.5} fill="rgba(255,255,255,0.07)" />
        <rect x={344} y={531} width={152} height={13} rx={6.5} fill="rgba(255,255,255,0.07)" />
        <rect x={344} y={556} width={70} height={16} rx={8} fill="url(#gm-red)" />
        <text x={379} y={567.5} textAnchor="middle" fontSize="9" fill="#fff" style={{ letterSpacing: "0.08em" }}>
          BOOK
        </text>
        <rect x={358} y={614} width={124} height={26} rx={13} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.09)" />
        <text x={420} y={631} textAnchor="middle" fontSize="13" fill={MIST} style={{ letterSpacing: "0.06em" }}>
          Booking Portal
        </text>
      </g>

      <Chip x={710} y={516} s={104} label="CASS Settlement">
        {/* reconciliation bars */}
        <g fill="rgba(255,255,255,0.5)">
          <rect x={688} y={526} width={7} height={14} rx={1.5} />
          <rect x={699} y={518} width={7} height={22} rx={1.5} />
          <rect x={710} y={512} width={7} height={28} rx={1.5} />
          <rect x={721} y={506} width={7} height={34} rx={1.5} fill="url(#gm-red)" />
        </g>
        <path d="M688 500 l8 -8 6 5 10 -10" stroke={RED} strokeWidth="1.6" strokeLinecap="round" />
      </Chip>

      <Chip x={920} y={516} s={104} label="Ops & Tracking">
        {/* radar */}
        <circle cx={920} cy={516} r={22} stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" />
        <circle cx={920} cy={516} r={12} stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
        <g data-radar>
          <path d="M920 516 L 920 494" stroke={RED} strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <circle cx={929} cy={508} r={2.6} fill={RED} />
      </Chip>

      {/* ===== central processor — Kargo360 ===== */}
      <g data-in>
        <Pins x={600} y={250} s={190} />
        <rect x={505} y={155} width={190} height={190} rx={22} fill={SOCKET} stroke={SOCKET_STROKE} />
        <rect x={523} y={173} width={154} height={154} rx={14} fill="url(#gm-face)" stroke="rgba(255,47,69,0.4)" strokeWidth="1.4" />
        <path d="M537 174.5 H 663" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
        {/* die pads */}
        <g fill="rgba(255,255,255,0.08)">
          <rect x={534} y={184} width={10} height={10} rx={1.5} />
          <rect x={548} y={184} width={5} height={10} rx={1} />
          <rect x={656} y={184} width={10} height={5} rx={1} />
          <rect x={534} y={310} width={16} height={6} rx={1} />
          <rect x={650} y={306} width={10} height={10} rx={1.5} />
          <rect x={640} y={190} width={5} height={16} rx={1} />
        </g>
        {/* hex core */}
        <polygon
          points="600,196 646,223 646,277 600,304 554,277 554,223"
          fill="url(#gm-red)"
          stroke="rgba(255,120,134,0.55)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <text x={600} y={259} textAnchor="middle" fontSize="26" fontWeight="600" fill="#fff" style={{ letterSpacing: "0.02em" }}>
          360
        </text>
        <rect x={551} y={366} width={98} height={26} rx={13} fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.09)" />
        <text x={600} y={383} textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.75)" style={{ letterSpacing: "0.06em" }}>
          Kargo360
        </text>
      </g>

      {/* ===== pulses ===== */}
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i} data-pulse={i}>
          <circle r="3.2" fill={RED} />
          <circle r="8" fill={RED} opacity="0.22" />
        </g>
      ))}
    </svg>
  );
}
