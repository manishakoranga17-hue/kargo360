"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion, pauseOffscreen } from "@/lib/gsap";
import clsx from "clsx";

/**
 * Small isometric accent that ties section headers to the hero's visual language.
 * variant "stack" = 3 layered slabs, "cube" = single accented cube, "ring" = orbit node.
 */
export default function IsoMotif({
  variant = "stack",
  className,
  light = false,
}: {
  variant?: "stack" | "cube" | "ring";
  className?: string;
  light?: boolean;
}) {
  const neutral = light ? "rgba(12,12,14,0.45)" : "rgba(255,255,255,0.4)";
  const faceTop = light ? "rgba(12,12,14,0.08)" : "rgba(255,255,255,0.06)";
  const faceL = light ? "rgba(12,12,14,0.04)" : "rgba(255,255,255,0.03)";
  const faceR = light ? "rgba(12,12,14,0.14)" : "rgba(0,0,0,0.25)";
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const parts = el.querySelectorAll("[data-part]");
    const ctx = gsap.context(() => {
      gsap.from(parts, {
        y: 14,
        opacity: 0,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.1,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
      if (variant === "ring") {
        pauseOffscreen(el, [
          gsap.to("[data-spin]", { rotate: 360, transformOrigin: "center", duration: 14, repeat: -1, ease: "none" }),
        ]);
      }
    }, el);
    return () => ctx.revert();
  }, [variant]);

  // isometric helper
  const U = 11;
  const cx = 27;
  const cy = 30;
  const iso = (x: number, y: number, z: number) =>
    [cx + (x - y) * 0.866 * U, cy + (x + y) * 0.5 * U - z * U] as const;
  const poly = (p: (readonly [number, number])[]) => p.map((q) => q.join(",")).join(" ");

  const slab = (z: number, accent: boolean) => {
    const A = iso(0, 0, z), B = iso(1.6, 0, z), C = iso(1.6, 1.6, z);
    const E = iso(0, 0, z + 0.5), F = iso(1.6, 0, z + 0.5), G = iso(1.6, 1.6, z + 0.5), H = iso(0, 1.6, z + 0.5);
    const stroke = accent ? "#ff2f45" : neutral;
    return (
      <g data-part strokeWidth="1.3" strokeLinejoin="round">
        <polygon points={poly([A, B, F, E])} fill={accent ? "rgba(255,10,34,0.2)" : faceL} stroke={stroke} />
        <polygon points={poly([B, C, G, F])} fill={accent ? "rgba(200,0,27,0.32)" : faceR} stroke={stroke} />
        <polygon points={poly([E, F, G, H])} fill={accent ? "url(#im-red)" : faceTop} stroke={stroke} />
      </g>
    );
  };

  return (
    <svg ref={ref} viewBox="0 0 54 54" className={clsx("h-12 w-12", className)} fill="none" aria-hidden>
      <defs>
        <linearGradient id="im-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff2f45" />
          <stop offset="100%" stopColor="#c8001b" />
        </linearGradient>
      </defs>
      {variant === "stack" && (
        <>
          {slab(0, false)}
          {slab(0.75, false)}
          {slab(1.5, true)}
        </>
      )}
      {variant === "cube" && slab(0.6, true)}
      {variant === "ring" && (
        <g data-part>
          <g data-spin>
            <ellipse cx="27" cy="27" rx="18" ry="8" stroke={light ? "rgba(12,12,14,0.4)" : "rgba(255,255,255,0.35)"} strokeWidth="1.3" />
            <circle cx="45" cy="27" r="2.5" fill="#ff2f45" />
          </g>
          <circle cx="27" cy="27" r="4" fill="url(#im-red)" />
        </g>
      )}
    </svg>
  );
}
