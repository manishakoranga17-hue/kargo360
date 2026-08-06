"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

const LINE = "rgba(255,255,255,0.14)";
const BRIGHT = "rgba(255,255,255,0.62)";
const MIST = "rgba(255,255,255,0.42)";
const DIM = "rgba(255,255,255,0.24)";
const RED = "#ff2f45";
const RED_DEEP = "#c8001b";
const INK = "#101014";
const SCREEN = "#0c0e13";
const CARD = "#14161d";
const BODY = "#1c1e26";
const FIGURE = "rgba(255,255,255,0.72)";
const HAIR = "#2a2d38";

function Mono({
  x,
  y,
  children,
  size = 10,
  fill = MIST,
  anchor = "middle",
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

/** pinned callout tag: red ✕ fault pill, or ✓ solved pill */
function SceneTag({
  x,
  y,
  w,
  label,
  fixed = false,
}: {
  x: number;
  y: number;
  w: number;
  label: string;
  fixed?: boolean;
}) {
  return (
    <g data-in>
      <rect
        x={x}
        y={y}
        width={w}
        height={24}
        rx={12}
        fill={fixed ? "rgba(255,255,255,0.05)" : "rgba(255,10,34,0.10)"}
        stroke={fixed ? "rgba(255,255,255,0.22)" : "rgba(255,47,69,0.5)"}
        strokeWidth={1.2}
      />
      {fixed ? (
        <path d={`M${x + 12},${y + 12} l3.5,3.5 l6,-7`} stroke={RED} strokeWidth={1.8} fill="none" strokeLinecap="round" />
      ) : (
        <path d={`M${x + 12},${y + 8} l7,7 M${x + 19},${y + 8} l-7,7`} stroke={RED} strokeWidth={1.8} strokeLinecap="round" />
      )}
      <Mono x={x + 30} y={y + 16} size={8.5} fill="rgba(255,255,255,0.8)" anchor="start">
        {label}
      </Mono>
    </g>
  );
}

/** limb drawn as an outlined capsule: bright rim under a body-fill stroke */
function Limb({ d, w = 12 }: { d: string; w?: number }) {
  return (
    <>
      <path d={d} stroke={BRIGHT} strokeWidth={w + 2.5} fill="none" strokeLinecap="round" />
      <path d={d} stroke={BODY} strokeWidth={w} fill="none" strokeLinecap="round" />
    </>
  );
}

/** shared stage: floor, desk with front apron, task chair, ground shadows */
function Stage() {
  return (
    <g>
      {/* floor + soft ground shadows */}
      <line x1={80} y1={550} x2={1120} y2={550} stroke={LINE} />
      <ellipse cx={430} cy={550} rx={150} ry={6} fill="#000" opacity={0.4} />
      <ellipse cx={650} cy={550} rx={330} ry={6} fill="#000" opacity={0.3} />
      {/* desk top */}
      <rect x={250} y={388} width={790} height={10} rx={5} fill={INK} stroke={BRIGHT} strokeWidth={1.5} />
      {/* front apron */}
      <rect x={268} y={398} width={754} height={64} fill={INK} stroke={LINE} />
      <line x1={268} y1={412} x2={1022} y2={412} stroke="rgba(255,255,255,0.05)" />
      {/* legs below apron */}
      <path d="M284,462 L284,548 M1006,462 L1006,548" stroke={BRIGHT} strokeWidth={2} />
      {/* task chair */}
      <rect x={346} y={300} width={16} height={132} rx={8} fill={INK} stroke={FIGURE} strokeWidth={2} />
      <rect x={352} y={424} width={104} height={16} rx={8} fill={INK} stroke={FIGURE} strokeWidth={2} />
      <path d="M404,440 L404,488 M404,488 L370,532 M404,488 L438,532" stroke={FIGURE} strokeWidth={2} fill="none" />
      <circle cx={368} cy={538} r={7} fill={INK} stroke={FIGURE} strokeWidth={2} />
      <circle cx={440} cy={538} r={7} fill={INK} stroke={FIGURE} strokeWidth={2} />
      {/* keyboard */}
      <rect x={502} y={379} width={78} height={8} rx={3} fill={CARD} stroke={MIST} strokeWidth={1.2} />
    </g>
  );
}

/* ============================= BEFORE ============================= */

function SceneBefore() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: (gsap.core.Tween | gsap.core.Timeline)[] = [];
      const q = (s: string) => el.querySelectorAll<SVGElement>(s);

      gsap.from(q("[data-in]"), {
        opacity: 0,
        y: 10,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });

      // clock hand spinning too fast — time runs away
      loops.push(
        gsap.to(q("[data-clockhand]"), {
          rotation: 360,
          svgOrigin: "170 130",
          duration: 3,
          ease: "none",
          repeat: -1,
        })
      );
      // phone ring: arcs ripple + handset shake bursts
      loops.push(
        gsap.fromTo(
          q("[data-ring]"),
          { opacity: 0, scale: 0.7, svgOrigin: "975 352" },
          { opacity: 1, scale: 1.15, duration: 1.4, stagger: 0.35, repeat: -1, ease: "power1.out" }
        )
      );
      const shake = gsap.timeline({ repeat: -1, repeatDelay: 1.3 });
      shake
        .to(q("[data-phone]"), { rotation: 2, svgOrigin: "975 375", duration: 0.06, yoyo: true, repeat: 7 })
        .to(q("[data-phone]"), { rotation: 0, duration: 0.06 });
      loops.push(shake);
      // support bubbles drifting
      loops.push(
        gsap.fromTo(
          q("[data-bubble]"),
          { opacity: 0.35, y: 6 },
          { opacity: 1, y: -6, duration: 1.9, stagger: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" }
        )
      );
      // alert popup + badges flicker
      loops.push(
        gsap.fromTo(
          q("[data-err]"),
          { opacity: 0.4 },
          { opacity: 1, duration: 0.55, repeat: -1, yoyo: true, ease: "steps(2)" }
        )
      );
      loops.push(
        gsap.fromTo(
          q("[data-badge]"),
          { opacity: 0.5 },
          { opacity: 1, duration: 0.8, stagger: 0.3, repeat: -1, yoyo: true, ease: "sine.inOut" }
        )
      );
      // glitch lines
      loops.push(
        gsap.fromTo(
          q("[data-glitch]"),
          { opacity: 0 },
          { opacity: 0.45, duration: 0.35, stagger: 0.3, repeat: -1, yoyo: true, ease: "steps(1)" }
        )
      );
      // broken link pulse
      loops.push(
        gsap.to(q("[data-broken]"), {
          opacity: 0.35,
          duration: 0.9,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
      // loose rate sheets drift
      q("[data-paper]").forEach((p, i) => {
        loops.push(
          gsap.to(p, {
            y: i % 2 ? -6 : -4,
            rotation: i % 2 ? 3 : -2.5,
            svgOrigin: "310 320",
            duration: 2.8 + i * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
        );
      });
      // margin ticks leaking down
      loops.push(
        gsap.fromTo(
          q("[data-coin]"),
          { opacity: 0.9, y: 0 },
          { opacity: 0, y: 48, duration: 2.2, stagger: 0.55, repeat: -1, ease: "power1.in" }
        )
      );
      // sweat drop
      loops.push(
        gsap.fromTo(
          q("[data-sweat]"),
          { opacity: 0, y: 0 },
          { opacity: 1, y: 16, duration: 1.6, repeat: -1, repeatDelay: 0.9, ease: "power1.in" }
        )
      );
      // frustration scribble flicker
      loops.push(
        gsap.fromTo(
          q("[data-scribble]"),
          { opacity: 0.2 },
          { opacity: 0.9, duration: 0.7, repeat: -1, yoyo: true, ease: "steps(3)" }
        )
      );
      // tense breathing — shoulders lift slightly
      loops.push(
        gsap.to(q("[data-figure]"), {
          y: -2.5,
          duration: 1.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );

      pauseOffscreen(el, loops);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      viewBox="0 0 1200 620"
      className="h-full w-full"
      aria-label="An operator hunched at her desk before Kargo360 — ringing phone, siloed error-riddled screens and scattered rate sheets"
    >
      <defs>
        <radialGradient id="gb-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="rgba(255,47,69,0.10)" />
          <stop offset="100%" stopColor="rgba(255,47,69,0)" />
        </radialGradient>
        <linearGradient id="gb-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12141b" />
          <stop offset="100%" stopColor={SCREEN} />
        </linearGradient>
      </defs>

      {/* unrest glow behind the workstation */}
      <ellipse cx={800} cy={280} rx={340} ry={220} fill="url(#gb-glow)" />

      <Stage />

      {/* wall — clock, month-end calendar, leaning shelf */}
      <g data-in>
        <circle cx={170} cy={130} r={32} fill={INK} stroke={BRIGHT} strokeWidth={1.5} />
        <path d="M170,104 L170,110 M170,150 L170,156 M144,130 L150,130 M190,130 L196,130" stroke={DIM} strokeWidth={1.2} />
        <line data-clockhand x1={170} y1={130} x2={170} y2={108} stroke={RED} strokeWidth={2} strokeLinecap="round" />
        <line x1={170} y1={130} x2={182} y2={136} stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        <rect x={228} y={100} width={68} height={78} rx={6} fill={INK} stroke={MIST} strokeWidth={1.2} />
        <line x1={228} y1={122} x2={296} y2={122} stroke={LINE} />
        <text x={262} y={158} fontSize={26} fill={BRIGHT} textAnchor="middle" fontWeight={600}>
          30
        </text>
        <Mono x={262} y={114} size={8} fill={RED}>
          Month end
        </Mono>
        <SceneTag x={170} y={200} w={126} label="Reporting lag" />
        {/* shelf with slumping binders */}
        <line x1={140} y1={276} x2={320} y2={276} stroke={MIST} strokeWidth={1.5} />
        <path d="M152,276 L146,286 M310,276 L316,286" stroke={DIM} strokeWidth={1.2} />
        <rect x={154} y={238} width={15} height={38} fill="rgba(255,255,255,0.10)" stroke={MIST} strokeWidth={1} transform="rotate(-9 161 257)" />
        <rect x={176} y={238} width={15} height={38} fill="rgba(255,47,69,0.30)" stroke={MIST} strokeWidth={1} transform="rotate(-4 183 257)" />
        <rect x={196} y={240} width={15} height={36} fill="rgba(255,255,255,0.10)" stroke={MIST} strokeWidth={1} transform="rotate(8 203 258)" />
        <rect x={222} y={262} width={36} height={13} fill="rgba(255,255,255,0.08)" stroke={MIST} strokeWidth={1} />
      </g>

      {/* rate sheets — stack + loose versions drifting */}
      <g data-in>
        <rect x={262} y={366} width={78} height={8} rx={2} fill={INK} stroke={MIST} strokeWidth={1.2} />
        <rect x={266} y={356} width={70} height={8} rx={2} fill={INK} stroke={MIST} strokeWidth={1.2} />
        <rect x={270} y={346} width={62} height={8} rx={2} fill={INK} stroke={MIST} strokeWidth={1.2} />
        <g data-paper>
          <rect x={268} y={300} width={54} height={40} rx={3} fill={CARD} stroke={MIST} strokeWidth={1.2} transform="rotate(-6 295 320)" />
          <path d="M276,312 h32 M276,320 h24 M276,328 h28" stroke={DIM} strokeWidth={1} transform="rotate(-6 295 320)" />
          <Mono x={295} y={338} size={6.5} fill={DIM}>
            rate_v1
          </Mono>
        </g>
        <g data-paper>
          <rect x={306} y={286} width={54} height={40} rx={3} fill={CARD} stroke={MIST} strokeWidth={1.2} transform="rotate(6 333 306)" />
          <path d="M314,298 h32 M314,306 h24 M314,314 h28" stroke={DIM} strokeWidth={1} transform="rotate(6 333 306)" />
          <Mono x={333} y={324} size={6.5} fill={RED}>
            rate_v7
          </Mono>
        </g>
        <SceneTag x={240} y={244} w={126} label="Version chaos" />
      </g>

      {/* the operator — stroke figure, hunched, one hand on her head */}
      <g data-figure data-in stroke={FIGURE} strokeWidth={2.5} strokeLinecap="round" fill="none">
        <circle cx={452} cy={242} r={23} fill={INK} />
        <circle cx={428} cy={220} r={9} fill={INK} />
        {/* worried face */}
        <circle cx={461} cy={238} r={1.8} fill={FIGURE} stroke="none" />
        <path d="M455,230 L466,233" strokeWidth={1.8} />
        <path d="M456,252 Q462,248 468,252" strokeWidth={1.8} />
        {/* neck + hunched spine */}
        <path d="M448,265 L444,282" />
        <path d="M444,282 C446,320 428,380 408,420" />
        {/* arm slammed on keyboard */}
        <path d="M442,295 C470,330 502,360 538,378" />
        <circle cx={541} cy={380} r={4} fill={INK} />
        {/* hand pressed to head */}
        <path d="M440,292 C468,280 470,252 458,224" />
        {/* shins under the apron */}
        <path d="M452,470 L446,532 L468,536 M478,470 L472,532 L494,536" strokeWidth={2} />
      </g>
      {/* sweat + frustration scribble */}
      <path data-sweat d="M492,222 q5,8 0,12 q-5,-4 0,-12" fill={FIGURE} stroke="none" />
      <path
        data-scribble
        d="M478,178 q8,-10 16,0 q8,10 16,0 q8,-10 16,0"
        stroke={RED}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* main monitor — three siloed windows, alerts, glitches */}
      <g data-in>
        <rect x={610} y={148} width={260} height={206} rx={10} fill="url(#gb-screen)" stroke={BRIGHT} strokeWidth={1.5} />
        <path d="M740,354 L740,380" stroke={BRIGHT} strokeWidth={2} />
        <path d="M702,382 L778,382" stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        {/* sticky notes on the bezel */}
        <rect x={606} y={196} width={15} height={15} fill="rgba(255,255,255,0.12)" transform="rotate(-5 613 203)" />
        <rect x={604} y={228} width={15} height={15} fill="rgba(255,47,69,0.45)" transform="rotate(6 611 235)" />
        <rect x={607} y={260} width={15} height={15} fill="rgba(255,255,255,0.12)" transform="rotate(-8 614 267)" />
        {/* siloed windows */}
        <g>
          <rect x={628} y={170} width={92} height={62} rx={4} fill={CARD} stroke={MIST} strokeWidth={1.2} />
          <line x1={628} y1={184} x2={720} y2={184} stroke={LINE} />
          <circle cx={636} cy={177} r={1.6} fill={DIM} />
          <circle cx={642} cy={177} r={1.6} fill={DIM} />
          <Mono x={652} y={180} size={6.5} anchor="start">
            Sales
          </Mono>
          <path d="M636,198 h60 M636,210 h44 M636,222 h52" stroke={DIM} strokeWidth={1.2} />
          <g data-badge>
            <circle cx={720} cy={170} r={8} fill={RED} />
            <text x={720} y={173} fontSize={8} fill="#fff" textAnchor="middle" fontWeight={600}>
              9
            </text>
          </g>
        </g>
        <g>
          <rect x={748} y={186} width={104} height={70} rx={4} fill={CARD} stroke={MIST} strokeWidth={1.2} />
          <line x1={748} y1={200} x2={852} y2={200} stroke={LINE} />
          <circle cx={756} cy={193} r={1.6} fill={DIM} />
          <circle cx={762} cy={193} r={1.6} fill={DIM} />
          <Mono x={772} y={196} size={6.5} anchor="start">
            Ops
          </Mono>
          <path d="M756,214 h72 M756,226 h56 M756,238 h64" stroke={DIM} strokeWidth={1.2} />
          <g data-badge>
            <circle cx={852} cy={186} r={8} fill={RED} />
            <text x={852} y={189} fontSize={8} fill="#fff" textAnchor="middle" fontWeight={600}>
              4
            </text>
          </g>
        </g>
        <g>
          <rect x={648} y={260} width={110} height={66} rx={4} fill={CARD} stroke={MIST} strokeWidth={1.2} />
          <line x1={648} y1={274} x2={758} y2={274} stroke={LINE} />
          <circle cx={656} cy={267} r={1.6} fill={DIM} />
          <circle cx={662} cy={267} r={1.6} fill={DIM} />
          <Mono x={672} y={270} size={6.5} anchor="start">
            Accounting
          </Mono>
          <path d="M656,288 h76 M656,300 h58 M656,312 h68" stroke={DIM} strokeWidth={1.2} />
        </g>
        {/* broken links between the silos */}
        <g data-broken stroke={RED} strokeWidth={1.8} fill="none">
          <path d="M722,206 L734,212" />
          <path d="M742,216 L754,222" />
          <path d="M716,240 L708,250" />
          <path d="M702,258 L694,268" />
          <path d="M762,262 L772,254 M772,262 L762,254" strokeWidth={1.5} />
        </g>
        {/* alert card */}
        <g data-err>
          <rect x={780} y={152} width={84} height={30} rx={5} fill={CARD} stroke={RED} strokeWidth={1.2} />
          <path d="M792,172 L797,162 L802,172 Z" fill="none" stroke={RED} strokeWidth={1.2} />
          <Mono x={810} y={170} size={7} fill={RED} anchor="start">
            Sync failed
          </Mono>
        </g>
        {/* glitch lines */}
        <g stroke={RED} strokeWidth={1.2}>
          <line data-glitch x1={620} y1={246} x2={700} y2={246} />
          <line data-glitch x1={760} y1={300} x2={856} y2={300} />
          <line data-glitch x1={640} y1={338} x2={730} y2={338} />
        </g>
      </g>

      {/* desk phone ringing + queued call bubbles */}
      <g data-in>
        <g data-phone>
          <rect x={945} y={362} width={62} height={26} rx={5} fill={BODY} stroke={BRIGHT} strokeWidth={1.5} />
          <path d="M948,360 q28,-17 56,0" stroke={BRIGHT} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        <g stroke={RED} strokeWidth={1.6} fill="none">
          <path data-ring d="M1006,344 q10,-8 6,-20" />
          <path data-ring d="M1018,350 q16,-13 10,-32" />
          <path data-ring d="M1030,356 q22,-18 14,-44" />
        </g>
        <g data-bubble>
          <rect x={1028} y={306} width={44} height={24} rx={12} fill={CARD} stroke={MIST} strokeWidth={1.2} />
          <circle cx={1042} cy={318} r={1.5} fill={MIST} />
          <circle cx={1050} cy={318} r={1.5} fill={MIST} />
          <circle cx={1058} cy={318} r={1.5} fill={MIST} />
        </g>
        <g data-bubble>
          <rect x={1054} y={268} width={44} height={24} rx={12} fill={CARD} stroke={RED_DEEP} strokeWidth={1.2} />
          <Mono x={1076} y={284} size={8} fill={RED}>
            !
          </Mono>
        </g>
        <g data-bubble>
          <rect x={1030} y={230} width={44} height={24} rx={12} fill={CARD} stroke={MIST} strokeWidth={1.2} />
          <circle cx={1044} cy={242} r={1.5} fill={MIST} />
          <circle cx={1052} cy={242} r={1.5} fill={MIST} />
          <circle cx={1060} cy={242} r={1.5} fill={MIST} />
        </g>
        <SceneTag x={990} y={196} w={144} label="Ticket treadmill" />
      </g>

      {/* margin leaking away below the desk */}
      <g data-in>
        <g stroke={RED} strokeWidth={2.5} strokeLinecap="round">
          <line data-coin x1={890} y1={478} x2={898} y2={478} />
          <line data-coin x1={912} y1={484} x2={920} y2={484} />
          <line data-coin x1={900} y1={492} x2={908} y2={492} />
        </g>
        <SceneTag x={839} y={566} w={132} label="Silent leakage" />
      </g>
      {/* apron fault tags */}
      <SceneTag x={681} y={420} w={118} label="Siloed stack" />
      <SceneTag x={912} y={420} w={126} label="Manual intake" />

      {/* tangled cables under the desk */}
      <path
        d="M740,462 C720,498 782,502 760,518 C740,534 830,508 860,528 C880,542 900,518 940,536"
        stroke={DIM}
        strokeWidth={1.2}
        fill="none"
      />
    </svg>
  );
}

/* ============================= AFTER ============================= */

function SceneAfter() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: (gsap.core.Tween | gsap.core.Timeline)[] = [];
      const q = (s: string) => el.querySelectorAll<SVGElement>(s);

      gsap.from(q("[data-in]"), {
        opacity: 0,
        y: 10,
        duration: 0.6,
        stagger: 0.06,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });

      // calm clock — one smooth sweep per minute
      loops.push(
        gsap.to(q("[data-clockhand]"), {
          rotation: 360,
          svgOrigin: "170 130",
          duration: 60,
          ease: "none",
          repeat: -1,
        })
      );
      // yield chart draws itself, rests, repeats
      const chart = el.querySelector<SVGPathElement>("[data-chart]");
      if (chart) {
        const len = chart.getTotalLength();
        gsap.set(chart, { strokeDasharray: len, strokeDashoffset: len });
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
        tl.to(chart, { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut" })
          .to(chart, { opacity: 0, duration: 0.5 }, "+=2")
          .set(chart, { strokeDashoffset: len, opacity: 1 });
        loops.push(tl);
      }
      // reconciliation checks pulse in sequence
      loops.push(
        gsap.fromTo(
          q("[data-check]"),
          { opacity: 0.35 },
          { opacity: 1, duration: 0.7, stagger: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" }
        )
      );
      // capacity bars breathe
      q("[data-bar]").forEach((b, i) => {
        loops.push(
          gsap.to(b, {
            scaleY: 0.82 + (i % 3) * 0.09,
            transformOrigin: "bottom",
            duration: 2 + i * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
        );
      });
      // booking toast slides in and out
      const toast = el.querySelector("[data-toast]");
      if (toast) {
        const tl = gsap.timeline({ repeat: -1, repeatDelay: 3 });
        tl.fromTo(toast, { opacity: 0, x: 18 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" })
          .to(toast, { opacity: 0, x: 18, duration: 0.5, ease: "power2.in" }, "+=2.4");
        loops.push(tl);
      }
      // steam curling off the mug
      loops.push(
        gsap.fromTo(
          q("[data-steam]"),
          { opacity: 0, y: 4 },
          { opacity: 0.7, y: -12, duration: 2.2, stagger: 0.7, repeat: -1, ease: "sine.out" }
        )
      );
      // plant sway
      loops.push(
        gsap.to(q("[data-leaf]"), {
          rotation: 3,
          svgOrigin: "300 352",
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
      // relaxed breathing
      loops.push(
        gsap.to(q("[data-figure]"), {
          y: -1.5,
          duration: 2.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
      // header status dot
      loops.push(
        gsap.to(q("[data-live]"), {
          opacity: 0.35,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );

      pauseOffscreen(el, loops);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      viewBox="0 0 1200 620"
      className="h-full w-full"
      aria-label="The same operator at ease after Kargo360 — one live dashboard runs the operation while she enjoys a coffee"
    >
      <defs>
        <radialGradient id="ga-glow" cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>
        <linearGradient id="ga-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12141b" />
          <stop offset="100%" stopColor={SCREEN} />
        </linearGradient>
      </defs>

      {/* calm glow behind the workstation */}
      <ellipse cx={790} cy={270} rx={360} ry={230} fill="url(#ga-glow)" />

      <Stage />

      {/* wall — calm clock, live-reports chip, tidy shelf */}
      <g data-in>
        <circle cx={170} cy={130} r={32} fill={INK} stroke={BRIGHT} strokeWidth={1.5} />
        <path d="M170,104 L170,110 M170,150 L170,156 M144,130 L150,130 M190,130 L196,130" stroke={DIM} strokeWidth={1.2} />
        <line data-clockhand x1={170} y1={130} x2={170} y2={108} stroke={RED} strokeWidth={2} strokeLinecap="round" />
        <line x1={170} y1={130} x2={184} y2={124} stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        <rect x={228} y={104} width={110} height={40} rx={8} fill={INK} stroke={MIST} strokeWidth={1.2} />
        <circle cx={246} cy={124} r={6} fill="none" stroke={RED} strokeWidth={1.5} />
        <path d="M243,124 l2.2,2.2 l4,-4.8" stroke={RED} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <Mono x={260} y={128} size={8} fill={MIST} anchor="start">
          Reports live
        </Mono>
        <SceneTag x={170} y={200} w={132} label="Live telemetry" fixed />
        {/* tidy shelf */}
        <line x1={140} y1={276} x2={320} y2={276} stroke={MIST} strokeWidth={1.5} />
        <path d="M152,276 L146,286 M310,276 L316,286" stroke={DIM} strokeWidth={1.2} />
        <rect x={156} y={240} width={14} height={36} fill="rgba(255,255,255,0.10)" stroke={MIST} strokeWidth={1} />
        <rect x={174} y={240} width={14} height={36} fill="rgba(255,47,69,0.30)" stroke={MIST} strokeWidth={1} />
        <rect x={192} y={240} width={14} height={36} fill="rgba(255,255,255,0.10)" stroke={MIST} strokeWidth={1} />
        <rect x={216} y={244} width={30} height={32} rx={3} fill={CARD} stroke={MIST} strokeWidth={1} />
        <path d="M231,254 l-6,10 h12 Z" fill="none" stroke={RED} strokeWidth={1.2} />
      </g>

      {/* desk plant where the paper pile used to be */}
      <g data-in>
        <path d="M286,388 L318,388 L313,352 L291,352 Z" fill={BODY} stroke={BRIGHT} strokeWidth={1.5} />
        <SceneTag x={254} y={244} w={112} label="Rate engine" fixed />
        <g data-leaf stroke={BRIGHT} strokeWidth={1.8} fill="none" strokeLinecap="round">
          <path d="M302,352 C302,328 290,316 282,304" />
          <path d="M302,352 C304,324 316,314 326,306" />
          <path d="M302,352 C300,332 302,318 302,306" />
          <path d="M282,304 q-8,-2 -10,4 q8,4 10,-4" fill={BODY} />
          <path d="M326,306 q8,-2 10,4 q-8,4 -10,-4" fill={BODY} />
          <path d="M302,306 q-2,-8 4,-10 q4,8 -4,10" fill={BODY} />
        </g>
      </g>

      {/* the operator — stroke figure, upright, coffee in hand */}
      <g data-figure data-in>
        <g stroke={FIGURE} strokeWidth={2.5} strokeLinecap="round" fill="none">
          <circle cx={455} cy={235} r={23} fill={INK} />
          <circle cx={434} cy={213} r={9} fill={INK} />
          {/* relaxed face */}
          <circle cx={464} cy={231} r={1.8} fill={FIGURE} stroke="none" />
          <path d="M459,223 L469,224" strokeWidth={1.8} />
          <path d="M458,246 Q464,252 470,246" strokeWidth={1.8} />
          {/* neck + upright spine */}
          <path d="M451,258 L448,278" />
          <path d="M448,278 C444,320 436,380 426,420" />
          {/* arm resting toward the desk */}
          <path d="M444,292 C476,330 506,364 534,380" />
          <circle cx={537} cy={381} r={4} fill={INK} />
          {/* arm holding the mug */}
          <path d="M442,290 C468,300 488,306 498,303" />
        </g>
        {/* mug + steam */}
        <rect x={496} y={288} width={26} height={30} rx={4} fill={INK} stroke={FIGURE} strokeWidth={2} />
        <rect x={496} y={294} width={26} height={5} fill={RED} />
        <path d="M522,294 q12,6 0,16" stroke={FIGURE} strokeWidth={2} fill="none" />
        <path data-steam d="M503,282 c-4,-8 4,-12 0,-20" stroke={MIST} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path data-steam d="M514,280 c4,-8 -4,-12 0,-20" stroke={MIST} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* legs, at ease */}
        <path d="M452,470 L448,532 L470,536" stroke={FIGURE} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>

      {/* one clean 360 dashboard */}
      <g data-in>
        <rect x={600} y={138} width={300} height={216} rx={10} fill="url(#ga-screen)" stroke={BRIGHT} strokeWidth={1.5} />
        <path d="M750,354 L750,380" stroke={BRIGHT} strokeWidth={2} />
        <path d="M710,382 L790,382" stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        {/* header */}
        <line x1={600} y1={166} x2={900} y2={166} stroke={LINE} />
        <circle data-live cx={618} cy={152} r={4} fill={RED} />
        <Mono x={634} y={156} size={8} fill={BRIGHT} anchor="start">
          360 · One Platform
        </Mono>
        <Mono x={886} y={156} size={7} fill={DIM} anchor="end">
          All systems live
        </Mono>
        {/* yield chart card */}
        <rect x={614} y={178} width={126} height={78} rx={5} fill={CARD} stroke={MIST} strokeWidth={1.2} />
        <Mono x={622} y={192} size={6.5} anchor="start">
          Yield
        </Mono>
        <path d="M622,244 h110 M622,226 h110 M622,208 h110" stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
        <path
          data-chart
          d="M622,244 L646,236 L668,240 L690,222 L712,226 L732,204"
          stroke={RED}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* reconciliation card */}
        <rect x={752} y={178} width={134} height={78} rx={5} fill={CARD} stroke={MIST} strokeWidth={1.2} />
        <Mono x={760} y={192} size={6.5} anchor="start">
          Settlement
        </Mono>
        {[0, 1, 2].map((i) => (
          <g key={i} data-check>
            <path d={`M762,${206 + i * 16} h74`} stroke={DIM} strokeWidth={1.2} />
            <path
              d={`M846,${202 + i * 16} l3,3 l5,-6`}
              stroke={RED}
              strokeWidth={1.6}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* capacity bars */}
        <rect x={614} y={266} width={272} height={76} rx={5} fill={CARD} stroke={MIST} strokeWidth={1.2} />
        <Mono x={622} y={280} size={6.5} anchor="start">
          Rates synced · 214 lanes
        </Mono>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect
            key={i}
            data-bar
            x={630 + i * 32}
            y={334 - (18 + ((i * 7) % 20))}
            width={12}
            rx={2}
            height={18 + ((i * 7) % 20)}
            fill={i === 5 ? RED : "rgba(255,255,255,0.18)"}
          />
        ))}
      </g>

      {/* booking toast */}
      <g data-toast>
        <rect x={918} y={148} width={186} height={44} rx={8} fill={CARD} stroke={MIST} strokeWidth={1.2} />
        <circle cx={938} cy={170} r={7} fill="none" stroke={RED} strokeWidth={1.6} />
        <path d="M934.5,170 l2.5,2.5 l4.5,-5" stroke={RED} strokeWidth={1.6} fill="none" strokeLinecap="round" />
        <Mono x={954} y={166} size={8} fill={BRIGHT} anchor="start">
          Booking confirmed
        </Mono>
        <Mono x={954} y={180} size={7} fill={DIM} anchor="start">
          AWB 176-4821 · self-serve
        </Mono>
      </g>

      {/* customer device, self-serving quietly */}
      <g data-in>
        <rect x={950} y={330} width={44} height={58} rx={7} fill={BODY} stroke={BRIGHT} strokeWidth={1.5} />
        <circle cx={972} cy={352} r={8} fill="none" stroke={RED} strokeWidth={1.4} />
        <path d="M968,352 l3,3 l5,-6" stroke={RED} strokeWidth={1.4} fill="none" />
        <Mono x={972} y={374} size={6} fill={DIM}>
          Kontrol
        </Mono>
        <SceneTag x={916} y={420} w={112} label="360 Kontrol" fixed />
        <SceneTag x={952} y={200} w={132} label="Booking engine" fixed />
      </g>

      {/* settlement sealed where the leak used to be */}
      <g data-in>
        <rect x={850} y={490} width={136} height={32} rx={16} fill={CARD} stroke="rgba(255,255,255,0.4)" strokeWidth={1.2} />
        <path d="M864,506 l3.5,3.5 l6,-7" stroke={RED} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Mono x={882} y={510} size={8} fill="rgba(255,255,255,0.9)" anchor="start">
          100% matched
        </Mono>
        <SceneTag x={846} y={566} w={118} label="Zero leakage" fixed />
      </g>
      {/* apron solved tag */}
      <SceneTag x={681} y={420} w={118} label="One platform" fixed />

      {/* one tidy cable */}
      <path d="M750,462 C750,488 780,498 822,502" stroke={DIM} strokeWidth={1.2} fill="none" />
    </svg>
  );
}

/* ============================= TABS ============================= */

export default function GsaStory({
  beforeCaption,
  afterCaption,
  faults,
  cures,
}: {
  beforeCaption: string;
  afterCaption: string;
  faults: string[];
  cures: string[];
}) {
  const [tab, setTab] = useState<"before" | "after">("before");

  return (
    <div>
      {/* tab switch */}
      <div className="flex flex-col items-center gap-5">
        <div className="inline-flex rounded-full border border-mist-line bg-ink-950/70 p-1.5">
          {(
            [
              ["before", "01", "Before Kargo360"],
              ["after", "02", "After Kargo360"],
            ] as const
          ).map(([key, num, label]) => (
            <button
              key={key}
              type="button"
              data-cursor
              onClick={() => setTab(key)}
              aria-pressed={tab === key}
              className={clsx(
                "flex items-center gap-2.5 rounded-full px-5 py-2.5 text-sm transition-all duration-300",
                tab === key ? "bg-paper text-ink-900" : "text-mist hover:text-white"
              )}
            >
              <span
                className={clsx(
                  "font-mono text-[0.65rem] tracking-widest",
                  tab === key ? "text-signal-red" : "text-mist-dim"
                )}
              >
                {num}
              </span>
              {label}
            </button>
          ))}
        </div>
        <p key={tab} className="mx-auto max-w-xl text-center leading-relaxed text-mist">
          {tab === "before" ? beforeCaption : afterCaption}
        </p>
      </div>

      {/* stage */}
      <div className="panel relative mt-10 overflow-hidden !rounded-3xl">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />
        <div
          aria-hidden
          className={clsx(
            "pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[110px] transition-colors duration-1000 will-change-transform",
            tab === "before" ? "bg-[rgba(255,10,34,0.10)]" : "bg-[rgba(255,255,255,0.06)]"
          )}
        />
        <div className="relative aspect-[1200/620]">
          <div
            className={clsx(
              "absolute inset-0 transition-all duration-700",
              tab === "before" ? "opacity-100" : "invisible opacity-0"
            )}
          >
            <SceneBefore />
          </div>
          <div
            className={clsx(
              "absolute inset-0 transition-all duration-700",
              tab === "after" ? "opacity-100" : "invisible opacity-0"
            )}
          >
            <SceneAfter />
          </div>
        </div>
        {/* fault / solved board */}
        <div className="relative border-t border-white/10 bg-ink-950/40 px-5 py-5">
          <div key={tab} className="flex flex-col items-center gap-3.5">
            <div className="chip-in font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
              {tab === "before"
                ? `${String(faults.length).padStart(2, "0")} problems in this picture`
                : `All ${String(cures.length).padStart(2, "0")} solved on the 360 platform`}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {(tab === "before" ? faults : cures).map((label, i) => (
                <span
                  key={label}
                  className={clsx(
                    "chip-in inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs md:text-sm",
                    tab === "before"
                      ? "border-signal-red/40 bg-signal-red/[0.07] text-mist-bright"
                      : "border-mist-line bg-white/[0.04] text-mist-bright"
                  )}
                  style={{ animationDelay: `${80 + i * 70}ms` }}
                >
                  {tab === "before" ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                      <path d="M1.5,1.5 l7,7 M8.5,1.5 l-7,7" stroke="#ff2f45" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 11 11" aria-hidden>
                      <path d="M1.5,6 l3,3 l5,-6.5" stroke="#ff2f45" strokeWidth="1.6" fill="none" strokeLinecap="round" />
                    </svg>
                  )}
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
        {/* frame footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-ink-950/60 px-5 py-3 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
          <span>{tab === "before" ? "Scene 01 · The old desk" : "Scene 02 · The 360 desk"}</span>
          <span className="flex items-center gap-2">
            <span
              className={clsx(
                "inline-block h-1.5 w-1.5 rounded-full",
                tab === "before" ? "bg-signal-red animate-blink" : "bg-signal-red"
              )}
            />
            {tab === "before" ? "6 faults active" : "All clear"}
          </span>
        </div>
      </div>
    </div>
  );
}
