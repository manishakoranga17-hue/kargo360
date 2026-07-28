"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";

export default function StatCounter({
  value,
  suffix = "",
  className,
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `${value}${suffix}`;
      return;
    }

    const obj = { n: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        n: value,
        duration: 1.8,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.n)}${suffix}`;
        },
      });
    }, el);
    return () => ctx.revert();
  }, [value, suffix]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
