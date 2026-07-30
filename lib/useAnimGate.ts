"use client";

import { useEffect, type RefObject } from "react";

/**
 * Pauses all CSS animations inside `ref` while it is off-screen by toggling
 * the `anims-paused` class (see globals.css). Keeps offscreen sections from
 * repainting on every frame.
 */
export function useAnimGate(ref: RefObject<HTMLElement>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      el.classList.toggle("anims-paused", !entry.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
}
