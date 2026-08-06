"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

const LINE = "rgba(255,255,255,0.16)";
const BRIGHT = "rgba(255,255,255,0.72)";
const MIST = "rgba(255,255,255,0.45)";
const DIM = "rgba(255,255,255,0.28)";
const RED = "#ff2f45";
const INK = "#101014";

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

/** shared stage: floor, desk with front apron, office chair */
function Stage({ apronLabels }: { apronLabels: [string, string, string] }) {
  return (
    <g>
      {/* floor */}
      <line x1={80} y1={548} x2={1120} y2={548} stroke={LINE} />
      {/* desk top */}
      <rect x={250} y={390} width={790} height={12} rx={4} fill={INK} stroke={BRIGHT} strokeWidth={1.5} />
      {/* front apron */}
      <rect x={266} y={402} width={758} height={66} fill={INK} stroke={LINE} />
      {/* legs below apron */}
      <path d="M282,468 L282,546 M1008,468 L1008,546" stroke={BRIGHT} strokeWidth={2} />
      {/* apron spec labels */}
      <Mono x={300} y={456} size={9} fill="rgba(255,255,255,0.35)" anchor="start">
        {apronLabels[0]}
      </Mono>
      <Mono x={745} y={456} size={9} fill="rgba(255,255,255,0.35)">
        {apronLabels[1]}
      </Mono>
      <Mono x={990} y={456} size={9} fill="rgba(255,255,255,0.35)" anchor="end">
        {apronLabels[2]}
      </Mono>
      {/* chair */}
      <rect x={346} y={300} width={16} height={132} rx={8} fill={INK} stroke={BRIGHT} strokeWidth={2} />
      <rect x={352} y={424} width={104} height={16} rx={8} fill={INK} stroke={BRIGHT} strokeWidth={2} />
      <path d="M404,440 L404,488 M404,488 L370,532 M404,488 L438,532" stroke={BRIGHT} strokeWidth={2} fill="none" />
      <circle cx={368} cy={538} r={7} fill={INK} stroke={BRIGHT} strokeWidth={2} />
      <circle cx={440} cy={538} r={7} fill={INK} stroke={BRIGHT} strokeWidth={2} />
      {/* keyboard */}
      <rect x={500} y={381} width={78} height={9} rx={3} fill={INK} stroke={MIST} strokeWidth={1.5} />
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
        .to(q("[data-phone]"), { rotation: 2.5, svgOrigin: "975 375", duration: 0.06, yoyo: true, repeat: 7 })
        .to(q("[data-phone]"), { rotation: 0, duration: 0.06 });
      loops.push(shake);
      // support bubbles drifting up
      loops.push(
        gsap.fromTo(
          q("[data-bubble]"),
          { opacity: 0, y: 8 },
          { opacity: 1, y: -8, duration: 1.8, stagger: 0.5, repeat: -1, yoyo: true, ease: "sine.inOut" }
        )
      );
      // error popup flicker
      loops.push(
        gsap.fromTo(
          q("[data-err]"),
          { opacity: 0.25 },
          { opacity: 1, duration: 0.5, repeat: -1, yoyo: true, ease: "steps(2)" }
        )
      );
      // glitch lines
      loops.push(
        gsap.fromTo(
          q("[data-glitch]"),
          { opacity: 0 },
          { opacity: 0.5, duration: 0.35, stagger: 0.3, repeat: -1, yoyo: true, ease: "steps(1)" }
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
      // floating rate sheets flutter
      q("[data-paper]").forEach((p, i) => {
        loops.push(
          gsap.to(p, {
            y: i % 2 ? -7 : -5,
            rotation: i % 2 ? 4 : -3,
            svgOrigin: "300 310",
            duration: 2.6 + i * 0.4,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
          })
        );
      });
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
      // margin chips leaking down
      loops.push(
        gsap.fromTo(
          q("[data-coin]"),
          { opacity: 1, y: 0 },
          { opacity: 0, y: 55, duration: 2, stagger: 0.55, repeat: -1, ease: "power1.in" }
        )
      );

      pauseOffscreen(el, loops);
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <svg ref={root} viewBox="0 0 1200 620" className="h-full w-full" aria-label="A stressed operator surrounded by ringing phones, error screens and paperwork — the GSA before Kargo360">
      <Stage apronLabels={["Fault · Version chaos", "Fault · Siloed stack", "Fault · Manual intake"]} />

      {/* wall clock + month-end calendar */}
      <g data-in>
        <circle cx={170} cy={130} r={32} fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <path d="M170,104 L170,110 M170,150 L170,156 M144,130 L150,130 M190,130 L196,130" stroke={DIM} strokeWidth={1.5} />
        <line data-clockhand x1={170} y1={130} x2={170} y2={108} stroke={RED} strokeWidth={2} strokeLinecap="round" />
        <line x1={170} y1={130} x2={182} y2={136} stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        <rect x={228} y={100} width={68} height={78} rx={6} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <line x1={228} y1={122} x2={296} y2={122} stroke={LINE} />
        <text x={262} y={158} fontSize={26} fill={BRIGHT} textAnchor="middle" fontWeight={600}>
          30
        </text>
        <Mono x={262} y={114} size={8} fill={RED}>
          Month end
        </Mono>
        <Mono x={230} y={215} size={10} anchor="start">
          Reporting lag
        </Mono>
        <line x1={224} y1={211} x2={206} y2={196} stroke={LINE} />
      </g>

      {/* rate sheets: stack + fluttering loose versions */}
      <g data-in>
        <rect x={258} y={368} width={76} height={8} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <rect x={262} y={358} width={68} height={8} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <rect x={266} y={348} width={60} height={8} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <g data-paper>
          <rect x={262} y={296} width={52} height={38} rx={3} fill={INK} stroke={MIST} strokeWidth={1.5} transform="rotate(-6 288 315)" />
          <Mono x={288} y={319} size={7} fill={DIM}>
            rate_v1
          </Mono>
        </g>
        <g data-paper>
          <rect x={300} y={280} width={52} height={38} rx={3} fill={INK} stroke={MIST} strokeWidth={1.5} transform="rotate(7 326 299)" />
          <Mono x={326} y={303} size={7} fill={RED}>
            rate_v7
          </Mono>
        </g>
        <Mono x={296} y={262} size={10}>
          Version chaos
        </Mono>
      </g>

      {/* the woman — hunched, one hand on her head */}
      <g data-in stroke={BRIGHT} strokeWidth={2.5} strokeLinecap="round" fill="none">
        <circle cx={452} cy={242} r={23} fill={INK} />
        <circle cx={428} cy={220} r={9} fill={INK} />
        {/* worried face */}
        <circle cx={461} cy={238} r={1.8} fill={BRIGHT} stroke="none" />
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
      <path data-sweat d="M492,222 q5,8 0,12 q-5,-4 0,-12" fill={BRIGHT} stroke="none" />
      <path
        data-scribble
        d="M478,178 q8,-10 16,0 q8,10 16,0 q8,-10 16,0"
        stroke={RED}
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
      />

      {/* main monitor — three siloed windows, errors, glitches */}
      <g data-in>
        <rect x={610} y={150} width={260} height={205} rx={10} fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <path d="M740,355 L740,382" stroke={BRIGHT} strokeWidth={2} />
        <path d="M702,384 L778,384" stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        {/* sticky notes on the bezel */}
        <rect x={606} y={196} width={16} height={16} fill="rgba(255,255,255,0.14)" transform="rotate(-5 614 204)" />
        <rect x={604} y={228} width={16} height={16} fill="rgba(255,47,69,0.55)" transform="rotate(6 612 236)" />
        <rect x={607} y={260} width={16} height={16} fill="rgba(255,255,255,0.14)" transform="rotate(-8 615 268)" />
        {/* siloed windows */}
        <g>
          <rect x={628} y={172} width={92} height={62} rx={4} fill={INK} stroke={MIST} strokeWidth={1.5} />
          <line x1={628} y1={186} x2={720} y2={186} stroke={LINE} />
          <Mono x={636} y={182} size={7} anchor="start">
            Sales
          </Mono>
          <path d="M636,200 h60 M636,212 h44 M636,224 h52" stroke={DIM} strokeWidth={1.5} />
        </g>
        <g>
          <rect x={748} y={188} width={104} height={70} rx={4} fill={INK} stroke={MIST} strokeWidth={1.5} />
          <line x1={748} y1={202} x2={852} y2={202} stroke={LINE} />
          <Mono x={756} y={198} size={7} anchor="start">
            Ops
          </Mono>
          <path d="M756,216 h72 M756,228 h56 M756,240 h64" stroke={DIM} strokeWidth={1.5} />
        </g>
        <g>
          <rect x={648} y={262} width={110} height={66} rx={4} fill={INK} stroke={MIST} strokeWidth={1.5} />
          <line x1={648} y1={276} x2={758} y2={276} stroke={LINE} />
          <Mono x={656} y={272} size={7} anchor="start">
            Accounting
          </Mono>
          <path d="M656,290 h76 M656,302 h58 M656,314 h68" stroke={DIM} strokeWidth={1.5} />
        </g>
        {/* broken links between the silos */}
        <g data-broken stroke={RED} strokeWidth={2} fill="none">
          <path d="M722,206 L734,212" />
          <path d="M742,216 L754,222" />
          <path d="M716,240 L708,250" />
          <path d="M702,258 L694,268" />
          <path d="M760,262 L770,256 M770,266 L760,252" strokeWidth={1.8} />
        </g>
        {/* error popup */}
        <g data-err>
          <rect x={782} y={152} width={82} height={44} rx={4} fill={INK} stroke={RED} strokeWidth={1.5} />
          <Mono x={823} y={172} size={8} fill={RED}>
            Error
          </Mono>
          <Mono x={823} y={186} size={7} fill={DIM}>
            Retry?
          </Mono>
        </g>
        {/* glitch lines */}
        <g stroke={RED} strokeWidth={1.5}>
          <line data-glitch x1={620} y1={246} x2={700} y2={246} />
          <line data-glitch x1={760} y1={300} x2={856} y2={300} />
          <line data-glitch x1={640} y1={340} x2={730} y2={340} />
        </g>
      </g>

      {/* desk phone ringing off the hook + ticket bubbles */}
      <g data-in>
        <g data-phone>
          <rect x={945} y={362} width={62} height={28} rx={5} fill={INK} stroke={BRIGHT} strokeWidth={2} />
          <path d="M948,360 q28,-18 56,0" stroke={BRIGHT} strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        <g stroke={RED} strokeWidth={1.8} fill="none">
          <path data-ring d="M1006,344 q10,-8 6,-20" />
          <path data-ring d="M1018,350 q16,-13 10,-32" />
          <path data-ring d="M1030,356 q22,-18 14,-44" />
        </g>
        {/* unanswered call bubbles */}
        <g data-bubble>
          <rect x={1028} y={306} width={46} height={26} rx={13} fill={INK} stroke={MIST} strokeWidth={1.5} />
          <Mono x={1051} y={323} size={9} fill={MIST}>
            ?
          </Mono>
        </g>
        <g data-bubble>
          <rect x={1054} y={266} width={46} height={26} rx={13} fill={INK} stroke={MIST} strokeWidth={1.5} />
          <Mono x={1077} y={283} size={9} fill={RED}>
            !
          </Mono>
        </g>
        <g data-bubble>
          <rect x={1030} y={226} width={46} height={26} rx={13} fill={INK} stroke={MIST} strokeWidth={1.5} />
          <Mono x={1053} y={243} size={9} fill={MIST}>
            ?
          </Mono>
        </g>
        <Mono x={1064} y={205} size={10}>
          Ticket treadmill
        </Mono>
      </g>

      {/* margin leaking through the floorboards */}
      <g data-in>
        <g fill={RED} stroke="none">
          <rect data-coin x={888} y={478} width={14} height={9} rx={2} opacity={0.9} />
          <rect data-coin x={908} y={484} width={14} height={9} rx={2} opacity={0.9} />
          <rect data-coin x={898} y={492} width={14} height={9} rx={2} opacity={0.9} />
        </g>
        <Mono x={905} y={585} size={10}>
          Silent leakage
        </Mono>
      </g>

      {/* tangled cables under the desk */}
      <path
        d="M740,468 C720,500 780,505 760,520 C740,535 830,510 860,530 C880,543 900,520 940,538"
        stroke={DIM}
        strokeWidth={1.5}
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
          { opacity: 0.8, y: -12, duration: 2.2, stagger: 0.7, repeat: -1, ease: "sine.out" }
        )
      );
      // plant sway
      loops.push(
        gsap.to(q("[data-leaf]"), {
          rotation: 3,
          svgOrigin: "296 352",
          duration: 3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        })
      );
      // relaxed breathing
      loops.push(
        gsap.to(q("[data-breathe]"), {
          scaleY: 1.015,
          svgOrigin: "440 420",
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
    <svg ref={root} viewBox="0 0 1200 620" className="h-full w-full" aria-label="The same operator relaxed with a coffee while the Kargo360 dashboard runs the operation on one clean screen">
      <Stage apronLabels={["Fixed · Rate engine", "Fixed · One platform", "Fixed · Self-serve"]} />

      {/* wall clock, now calm + live-reports card */}
      <g data-in>
        <circle cx={170} cy={130} r={32} fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <path d="M170,104 L170,110 M170,150 L170,156 M144,130 L150,130 M190,130 L196,130" stroke={DIM} strokeWidth={1.5} />
        <line data-clockhand x1={170} y1={130} x2={170} y2={108} stroke={RED} strokeWidth={2} strokeLinecap="round" />
        <line x1={170} y1={130} x2={184} y2={124} stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        <rect x={228} y={104} width={110} height={40} rx={6} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <circle cx={244} cy={124} r={5} fill="none" stroke={RED} strokeWidth={1.5} />
        <path d="M241.5,124 l2,2 l3.5,-4" stroke={RED} strokeWidth={1.5} fill="none" />
        <Mono x={256} y={128} size={8} fill={MIST} anchor="start">
          Reports live
        </Mono>
        <Mono x={230} y={215} size={10} anchor="start">
          Live telemetry
        </Mono>
        <line x1={224} y1={211} x2={206} y2={196} stroke={LINE} />
      </g>

      {/* desk plant where the paper pile used to be */}
      <g data-in>
        <path d="M282,390 L310,390 L306,356 L286,356 Z" fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <g data-leaf stroke={BRIGHT} strokeWidth={2} fill="none" strokeLinecap="round">
          <path d="M296,356 C296,330 284,318 276,306" />
          <path d="M296,356 C298,326 310,316 320,308" />
          <path d="M296,356 C294,336 296,322 296,310" />
        </g>
      </g>

      {/* the woman — upright, coffee in hand, smiling */}
      <g data-in>
        <g data-breathe stroke={BRIGHT} strokeWidth={2.5} strokeLinecap="round" fill="none">
          <circle cx={455} cy={235} r={23} fill={INK} />
          <circle cx={434} cy={213} r={9} fill={INK} />
          {/* relaxed face */}
          <circle cx={464} cy={231} r={1.8} fill={BRIGHT} stroke="none" />
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
        <rect x={496} y={288} width={26} height={30} rx={4} fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <path d="M522,294 q12,6 0,16" stroke={BRIGHT} strokeWidth={2} fill="none" />
        <path data-steam d="M503,282 c-4,-8 4,-12 0,-20" stroke={MIST} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        <path data-steam d="M514,280 c4,-8 -4,-12 0,-20" stroke={MIST} strokeWidth={1.5} fill="none" strokeLinecap="round" />
        {/* legs, at ease */}
        <path d="M452,470 L448,532 L470,536" stroke={BRIGHT} strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>

      {/* one clean 360 dashboard */}
      <g data-in>
        <rect x={600} y={140} width={300} height={215} rx={10} fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <path d="M750,355 L750,382" stroke={BRIGHT} strokeWidth={2} />
        <path d="M710,384 L790,384" stroke={BRIGHT} strokeWidth={2} strokeLinecap="round" />
        {/* header */}
        <line x1={600} y1={168} x2={900} y2={168} stroke={LINE} />
        <circle data-live cx={618} cy={154} r={4} fill={RED} />
        <Mono x={634} y={158} size={8} fill={BRIGHT} anchor="start">
          360 · One Platform
        </Mono>
        <Mono x={886} y={158} size={7} fill={DIM} anchor="end">
          All systems live
        </Mono>
        {/* yield chart card */}
        <rect x={614} y={180} width={126} height={76} rx={4} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <Mono x={622} y={194} size={7} anchor="start">
          Yield
        </Mono>
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
        <rect x={752} y={180} width={134} height={76} rx={4} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <Mono x={760} y={194} size={7} anchor="start">
          Settlement
        </Mono>
        {[0, 1, 2].map((i) => (
          <g key={i} data-check>
            <path d={`M762,${206 + i * 16} h74`} stroke={DIM} strokeWidth={1.5} />
            <path
              d={`M846,${202 + i * 16} l3,3 l5,-6`}
              stroke={RED}
              strokeWidth={1.8}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        ))}
        {/* capacity bars */}
        <rect x={614} y={266} width={272} height={76} rx={4} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <Mono x={622} y={280} size={7} anchor="start">
          Rates synced · 214 lanes
        </Mono>
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <rect
            key={i}
            data-bar
            x={630 + i * 32}
            y={334 - (18 + ((i * 7) % 20))}
            width={12}
            height={18 + ((i * 7) % 20)}
            fill={i === 5 ? RED : "rgba(255,255,255,0.22)"}
          />
        ))}
      </g>

      {/* booking toast */}
      <g data-toast>
        <rect x={918} y={150} width={186} height={44} rx={8} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <circle cx={938} cy={172} r={7} fill="none" stroke={RED} strokeWidth={1.8} />
        <path d="M934.5,172 l2.5,2.5 l4.5,-5" stroke={RED} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Mono x={954} y={168} size={8} fill={BRIGHT} anchor="start">
          Booking confirmed
        </Mono>
        <Mono x={954} y={182} size={7} fill={DIM} anchor="start">
          AWB 176-4821 · self-serve
        </Mono>
      </g>

      {/* customer device, self-serving quietly */}
      <g data-in>
        <rect x={950} y={330} width={44} height={60} rx={6} fill={INK} stroke={BRIGHT} strokeWidth={2} />
        <circle cx={972} cy={352} r={8} fill="none" stroke={RED} strokeWidth={1.5} />
        <path d="M968,352 l3,3 l5,-6" stroke={RED} strokeWidth={1.5} fill="none" />
        <Mono x={972} y={376} size={6} fill={DIM}>
          Kontrol
        </Mono>
        <Mono x={1064} y={310} size={10}>
          85% self-serve
        </Mono>
        <line x1={1022} y1={314} x2={1000} y2={330} stroke={LINE} />
      </g>

      {/* settlement sealed where the leak used to be */}
      <g data-in>
        <rect x={856} y={496} width={112} height={26} rx={13} fill={INK} stroke={MIST} strokeWidth={1.5} />
        <path d="M868,509 l3,3 l5,-6" stroke={RED} strokeWidth={1.8} fill="none" strokeLinecap="round" />
        <Mono x={884} y={513} size={7} fill={MIST} anchor="start">
          100% matched
        </Mono>
        <Mono x={905} y={585} size={10}>
          Zero leakage
        </Mono>
      </g>

      {/* one tidy cable */}
      <path d="M750,468 C750,500 820,510 900,514" stroke={DIM} strokeWidth={1.5} fill="none" />
    </svg>
  );
}

/* ============================= TABS ============================= */

export default function GsaStory({
  beforeCaption,
  afterCaption,
}: {
  beforeCaption: string;
  afterCaption: string;
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
