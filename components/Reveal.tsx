"use client";

import { useRef, useEffect } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import clsx from "clsx";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** stagger direct children instead of the element itself */
  stagger?: boolean;
};

/** Generic fade + rise on scroll-in. */
export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  stagger = false,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const targets = stagger ? Array.from(el.children) : [el];

    if (prefersReducedMotion()) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          delay,
          stagger: stagger ? 0.09 : 0,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, stagger]);

  return (
    <div ref={ref} className={clsx(stagger && "reveal-group", className)}>
      {children}
    </div>
  );
}
