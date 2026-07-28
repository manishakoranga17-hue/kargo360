"use client";

import { useRef, useEffect, ElementType } from "react";
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";
import clsx from "clsx";

type Props = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
  /** split into words (default) or characters */
  by?: "word" | "char";
};

/**
 * Masked line/word reveal on scroll — each unit rises from behind a clip mask.
 */
export default function RevealText({
  text,
  as: Tag = "span",
  className,
  delay = 0,
  by = "word",
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return;

    const units = Array.from(el.querySelectorAll<HTMLElement>("[data-unit] > span"));
    if (!units.length) return;

    if (prefersReducedMotion()) {
      gsap.set(units, { yPercent: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        units,
        { yPercent: 115 },
        {
          yPercent: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.055,
          delay,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  const units = by === "word" ? text.split(" ") : text.split("");

  return (
    <Tag ref={ref as never} className={clsx("inline", className)}>
      {units.map((u, i) => (
        <span
          key={i}
          data-unit
          className="inline-block overflow-hidden align-bottom"
          style={{ paddingBottom: "0.15em", marginBottom: "-0.15em" }}
        >
          <span className="inline-block will-change-transform">
            {u}
            {by === "word" && i < units.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </Tag>
  );
}
