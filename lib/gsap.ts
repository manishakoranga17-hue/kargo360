"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pause looping tweens while their section is off-screen so only the visible
 * fold does animation work. Call inside a gsap.context so the trigger is
 * cleaned up with the component.
 */
export function pauseOffscreen(
  el: Element,
  loops: (gsap.core.Tween | gsap.core.Timeline)[]
) {
  const st = ScrollTrigger.create({
    trigger: el,
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) =>
      loops.forEach((t) => (self.isActive ? t.resume() : t.pause())),
  });
  if (!st.isActive) loops.forEach((t) => t.pause());
}

export { gsap, ScrollTrigger };
