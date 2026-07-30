"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

/**
 * Flowing "energy silk" for the hero — layered glowing ribbons sweeping in
 * from the left and right edges and crashing toward the center, with bright
 * filaments of light flowing along them. viewBox 1600×900, anchored to the
 * bottom of the hero.
 */

const LEFT = [
  "M-100 520 C 180 460, 320 640, 520 700 C 680 748, 760 800, 820 860",
  "M-100 620 C 160 560, 360 720, 560 750 C 700 772, 780 820, 840 880",
  "M-100 430 C 140 420, 300 560, 470 640 C 600 700, 700 760, 780 830",
];

const RIGHT = [
  "M1700 460 C 1440 400, 1290 590, 1110 660 C 970 715, 880 780, 830 850",
  "M1700 580 C 1460 520, 1330 690, 1150 730 C 1020 760, 930 810, 870 880",
  "M1700 350 C 1470 320, 1350 480, 1200 570 C 1080 640, 980 720, 900 810",
];

const FRONT = [
  "M120 880 C 420 800, 640 872, 820 850 C 1020 826, 1220 872, 1480 830",
  "M240 900 C 520 840, 760 900, 980 872 C 1160 850, 1320 890, 1500 860",
];

/** one silk ribbon = glow mass + hot line + flowing filament */
function Silk({ d, w = 46 }: { d: string; w?: number }) {
  return (
    <>
      <path d={d} stroke="#c8001b" strokeWidth={w * 3} strokeLinecap="round" opacity="0.16" filter="url(#hw-lg)" />
      <path d={d} stroke="#ff0a22" strokeWidth={w * 1.35} strokeLinecap="round" opacity="0.3" filter="url(#hw-md)" />
      <path d={d} stroke="#ff5063" strokeWidth={w * 0.32} strokeLinecap="round" opacity="0.55" filter="url(#hw-sm)" />
      <path d={d} stroke="#ffb3ba" strokeWidth="2" strokeLinecap="round" opacity="0.28" />
      <path data-flow d={d} stroke="#ffd7da" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
    </>
  );
}

export default function HeroWaves() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: gsap.core.Tween[] = [];

      // bright filaments stream along the ribbons
      el.querySelectorAll<SVGPathElement>("[data-flow]").forEach((p, i) => {
        const len = p.getTotalLength();
        const dash = 90 + (i % 3) * 60;
        const gap = len / 2;
        gsap.set(p, { strokeDasharray: `${dash} ${gap}`, strokeDashoffset: len });
        loops.push(
          gsap.to(p, {
            strokeDashoffset: `-=${len + dash + gap}`,
            duration: 7 + (i % 4) * 2.5,
            repeat: -1,
            ease: "none",
            delay: i * 0.9,
          })
        );
      });

      // whole banks of silk breathe slowly
      el.querySelectorAll("[data-bank]").forEach((g, i) => {
        loops.push(
          gsap.to(g, {
            opacity: 0.72,
            duration: 5.5 + i * 1.6,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          })
        );
      });

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={root}
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      className="h-full w-full"
      fill="none"
      aria-hidden
    >
      <defs>
        <filter id="hw-lg" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="30" />
        </filter>
        <filter id="hw-md" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="13" />
        </filter>
        <filter id="hw-sm" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <g data-bank>
        {LEFT.map((d, i) => (
          <Silk key={i} d={d} w={i === 2 ? 34 : 48} />
        ))}
      </g>
      <g data-bank>
        {RIGHT.map((d, i) => (
          <Silk key={i} d={d} w={i === 2 ? 36 : 50} />
        ))}
      </g>
      <g data-bank>
        {FRONT.map((d, i) => (
          <Silk key={i} d={d} w={26 - i * 6} />
        ))}
      </g>
    </svg>
  );
}
