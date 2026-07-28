"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { registerGsap, gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/gsap";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerGsap();

    if (prefersReducedMotion()) {
      ScrollTrigger.refresh();
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // let late-mounting ScrollTriggers settle
    const t = setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      clearTimeout(t);
      gsap.ticker.remove(raf);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
