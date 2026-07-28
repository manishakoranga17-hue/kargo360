"use client";

import { useRef, useEffect, cloneElement, ReactElement } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";

/** Wraps a single interactive element and gives it a magnetic pull toward the cursor. */
export default function Magnetic({
  children,
  strength = 0.4,
}: {
  children: ReactElement;
  strength?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const mx = e.clientX - (r.left + r.width / 2);
      const my = e.clientY - (r.top + r.height / 2);
      xTo(mx * strength);
      yTo(my * strength);
    };
    const onLeave = () => {
      xTo(0);
      yTo(0);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return cloneElement(children, { ref } as React.Attributes & { ref: typeof ref });
}
