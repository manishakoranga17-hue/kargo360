"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";

/**
 * Hero centerpiece — a dark globe with a burning red core, orbital rings
 * carrying live pulses (shipments in motion), hovering over a ringed
 * pedestal. viewBox 600×440.
 */

const RED = "#ff2f45";

// ellipse as a path so pulses can travel it (getPointAtLength-safe everywhere)
const orbit = (cx: number, cy: number, rx: number, ry: number) =>
  `M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${rx * 2} 0 a ${rx} ${ry} 0 1 0 ${-rx * 2} 0`;

export default function EnergyCore() {
  const root = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const loops: gsap.core.Tween[] = [];

      // sphere hovers
      loops.push(
        gsap.to(el.querySelectorAll("[data-sphere]"), {
          y: -9,
          duration: 4.2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        })
      );

      // core glow breathes
      loops.push(
        gsap.to(el.querySelectorAll("[data-glow]"), {
          opacity: 0.75,
          scale: 1.1,
          transformOrigin: "center",
          duration: 2.8,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        })
      );

      // pulses orbit the rings
      el.querySelectorAll<SVGGElement>("[data-opulse]").forEach((dot) => {
        const path = el.querySelector<SVGPathElement>(`[data-orbit="${dot.dataset.opulse}"]`);
        if (!path) return;
        const len = path.getTotalLength();
        const trip = { t: Number(dot.dataset.start ?? 0) };
        loops.push(
          gsap.to(trip, {
            t: `+=1`,
            duration: 9 + Number(dot.dataset.opulse) * 3,
            repeat: -1,
            ease: "none",
            onUpdate: () => {
              const p = path.getPointAtLength((trip.t % 1) * len);
              gsap.set(dot, { attr: { transform: `translate(${p.x},${p.y})` } });
            },
          })
        );
      });

      // dust particles drift
      el.querySelectorAll<SVGCircleElement>("[data-particle]").forEach((p, i) => {
        loops.push(
          gsap.to(p, {
            y: -14 - (i % 3) * 6,
            opacity: 0.15,
            duration: 3.5 + (i % 4),
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: i * 0.6,
          })
        );
      });

      pauseOffscreen(el, loops);
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <svg ref={root} viewBox="0 0 600 440" className="h-auto w-full" fill="none" aria-hidden>
      <defs>
        <radialGradient id="ec-sphere" cx="36%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#1e1e25" />
          <stop offset="55%" stopColor="#101014" />
          <stop offset="100%" stopColor="#0a0a0c" />
        </radialGradient>
        <radialGradient id="ec-hot" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffc9cf" />
          <stop offset="30%" stopColor="#ff5063" />
          <stop offset="70%" stopColor="rgba(255,10,34,0.5)" />
          <stop offset="100%" stopColor="rgba(255,10,34,0)" />
        </radialGradient>
        <radialGradient id="ec-aura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,10,34,0.32)" />
          <stop offset="60%" stopColor="rgba(255,10,34,0.10)" />
          <stop offset="100%" stopColor="rgba(255,10,34,0)" />
        </radialGradient>
        <linearGradient id="ec-ring" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(255,47,69,0)" />
          <stop offset="35%" stopColor="#ff2f45" />
          <stop offset="65%" stopColor="#c8001b" />
          <stop offset="100%" stopColor="rgba(200,0,27,0)" />
        </linearGradient>
      </defs>

      {/* ambient aura */}
      <circle data-glow cx="300" cy="205" r="180" fill="url(#ec-aura)" opacity="0.55" />

      {/* ===== pedestal ===== */}
      <g>
        <ellipse cx="300" cy="386" rx="252" ry="30" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <ellipse cx="300" cy="386" rx="196" ry="23" stroke="rgba(255,255,255,0.09)" strokeWidth="1" strokeDasharray="3 6" />
        {/* glowing ring */}
        <ellipse cx="300" cy="386" rx="146" ry="17" stroke="rgba(255,10,34,0.16)" strokeWidth="10" />
        <ellipse cx="300" cy="386" rx="146" ry="17" stroke="rgba(255,47,69,0.65)" strokeWidth="1.6" />
        <ellipse cx="300" cy="386" rx="96" ry="11" stroke="rgba(255,255,255,0.10)" strokeWidth="1" />
        {/* light column between core and pedestal */}
        <rect x="270" y="290" width="60" height="92" fill="url(#ec-hot)" opacity="0.10" />
      </g>

      {/* ===== sphere + rings (hover together) ===== */}
      <g data-sphere>
        {/* back half of outer ring */}
        <g transform="rotate(-14 300 205)">
          <path d={orbit(300, 205, 172, 56)} data-orbit="1" stroke="rgba(255,255,255,0.08)" strokeWidth="1.2" />
        </g>

        {/* globe */}
        <circle cx="300" cy="205" r="92" fill="url(#ec-sphere)" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
        {/* meridians, clipped to the globe */}
        <clipPath id="ec-clip">
          <circle cx="300" cy="205" r="91" />
        </clipPath>
        <g clipPath="url(#ec-clip)" stroke="rgba(255,255,255,0.10)" strokeWidth="1">
          <ellipse cx="300" cy="205" rx="38" ry="91" />
          <ellipse cx="300" cy="205" rx="70" ry="91" />
          <ellipse cx="300" cy="205" rx="91" ry="34" />
          <ellipse cx="300" cy="205" rx="91" ry="64" />
        </g>
        {/* rim light */}
        <circle cx="300" cy="205" r="92" stroke="rgba(255,47,69,0.28)" strokeWidth="1.6" opacity="0.9" />

        {/* burning core ring */}
        <circle cx="300" cy="205" r="47" stroke="rgba(255,10,34,0.22)" strokeWidth="20" />
        <circle cx="300" cy="205" r="47" stroke={RED} strokeWidth="5" opacity="0.9" />
        <circle data-glow cx="299" cy="207" r="30" fill="url(#ec-hot)" />

        {/* inner ring (front), tilted */}
        <g transform="rotate(-14 300 205)">
          <path d={orbit(300, 205, 138, 42)} data-orbit="0" stroke="url(#ec-ring)" strokeWidth="1.8" opacity="0.85" />
          <g data-opulse="0" data-start="0.1">
            <circle r="3.4" fill={RED} />
            <circle r="9" fill={RED} opacity="0.25" />
          </g>
          <g data-opulse="0" data-start="0.6">
            <circle r="2.6" fill="#ff8b96" />
            <circle r="7" fill={RED} opacity="0.18" />
          </g>
        </g>
        <g transform="rotate(-14 300 205)">
          <g data-opulse="1" data-start="0.35">
            <circle r="2.8" fill={RED} />
            <circle r="7" fill={RED} opacity="0.2" />
          </g>
        </g>
      </g>

      {/* drifting sparks */}
      {(
        [
          [132, 150], [95, 250], [176, 96], [430, 120], [498, 214], [462, 300],
          [210, 330], [388, 330], [540, 150], [70, 180],
        ] as [number, number][]
      ).map(([x, y], i) => (
        <circle key={i} data-particle cx={x} cy={y} r={i % 3 === 0 ? 2.2 : 1.4} fill={RED} opacity={0.5} />
      ))}
    </svg>
  );
}
