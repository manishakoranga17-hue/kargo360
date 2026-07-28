"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { hero, products } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import IsometricScene from "@/components/IsometricScene";
import Magnetic from "@/components/Magnetic";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const lines = el.querySelectorAll<HTMLElement>("[data-hline] > span");
    const fade = el.querySelectorAll<HTMLElement>("[data-hfade]");

    if (prefersReducedMotion()) {
      gsap.set(lines, { yPercent: 0 });
      gsap.set(fade, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15 })
        .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 0.95, ease: "power4.out", stagger: 0.08 })
        .fromTo(fade, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.1 }, "-=0.55");
    }, el);

    return () => ctx.revert();
  }, []);

  const Line = ({ children }: { children: React.ReactNode }) => (
    <span data-hline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
      <span className="block will-change-transform">{children}</span>
    </span>
  );

  return (
    <section ref={root} className="relative min-h-[100svh] overflow-hidden bg-ink-950 pt-28 noise">
      {/* background: same grid, depth via light/dark variation only */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* base — uniform dark-grey lines */}
        <div className="absolute inset-0 grid-lines grid-drift opacity-25" />
        {/* light-grey pocket around the isometric scene */}
        <div className="absolute inset-0 grid-lines grid-drift opacity-95 [mask-image:radial-gradient(ellipse_58%_52%_at_68%_38%,#000_10%,transparent_72%)]" />
        {/* softer mid-grey pocket near the headline/CTA */}
        <div className="absolute inset-0 grid-lines grid-drift opacity-60 [mask-image:radial-gradient(ellipse_48%_45%_at_16%_68%,#000_10%,transparent_72%)]" />
        {/* corner falloff — lines sink into the dark at the edges */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_105%_at_50%_45%,transparent_55%,rgba(10,10,12,0.85)_100%)]" />
      </div>

      <div className="shell relative grid min-h-[calc(100svh-7rem)] grid-cols-1 items-center gap-8 lg:grid-cols-[1.02fr_1.1fr]">
        {/* copy */}
        <div className="relative z-10 pt-10 lg:pt-0">
          <div data-hfade className="eyebrow mb-7 flex items-center gap-2.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
            Real-time visibility · Air cargo value chain
          </div>

          <h1 className="max-w-[15ch] text-[clamp(2.6rem,6.4vw,5.6rem)] font-medium leading-[0.98] tracking-tightest">
            <Line>Revolutionizing</Line>
            <Line>
              <span className="text-signal">Air Cargo</span>,
            </Line>
            <Line>End to End.</Line>
          </h1>

          <p data-hfade className="mt-7 max-w-lg text-lg leading-relaxed text-mist">
            {hero.sub}
          </p>

          <div data-hfade className="mt-9 flex flex-wrap items-center gap-3.5">
            <Magnetic>
              <Link href={hero.primaryCta.href} className="btn-signal" data-cursor>
                {hero.primaryCta.label} <span aria-hidden>→</span>
              </Link>
            </Magnetic>
            <Link href={hero.secondaryCta.href} className="btn-ghost" data-cursor>
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        {/* isometric graphic */}
        <div data-hfade className="relative h-[46vh] w-full lg:h-[78vh]">
          <div className="absolute inset-0 lg:scale-[1.22]">
            <IsometricScene />
          </div>
        </div>
      </div>

      {/* capability row (doss-style bottom nav) */}
      <div className="absolute inset-x-0 bottom-0 hidden border-t border-mist-line md:block">
        <div className="shell grid grid-cols-4 divide-x divide-mist-line">
          {products.map((p) => (
            <Link
              key={p.slug}
              href={`/products/${p.slug}`}
              data-hfade
              className="group flex flex-col gap-1 px-5 py-5 transition-colors hover:bg-ink-800"
            >
              <span className="text-sm font-medium text-white">
                360 {p.key}
              </span>
              <span className="text-xs text-mist">{p.scope}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
