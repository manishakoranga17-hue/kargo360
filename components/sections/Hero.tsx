"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { hero } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import PlatformMachine from "@/components/PlatformMachine";
import HeroSideTraces from "@/components/HeroSideTraces";
import Magnetic from "@/components/Magnetic";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

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
        .fromTo(fade, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.08 }, "-=0.55");
    }, el);

    return () => ctx.revert();
  }, []);

  const Line = ({ children }: { children: React.ReactNode }) => (
    <span data-hline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
      <span className="block will-change-transform">{children}</span>
    </span>
  );

  return (
    <section ref={root} className="relative overflow-hidden bg-ink-950 noise">
      {/* background: faint grid, brightened around the machine */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 grid-lines opacity-20" />
        <div className="absolute inset-0 grid-lines opacity-60 [mask-image:radial-gradient(ellipse_52%_46%_at_50%_60%,#000_10%,transparent_75%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_105%_at_50%_45%,transparent_55%,rgba(10,10,12,0.9)_100%)]" />
        {/* spotlight pool behind the headline */}
        <div className="absolute inset-x-0 top-0 h-[460px] bg-[radial-gradient(ellipse_44%_62%_at_50%_40%,rgba(255,255,255,0.07),transparent_70%)]" />
      </div>

      {/* side circuit gutters with traveling red pulses */}
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 hidden w-[230px] lg:block xl:w-[280px]">
        <HeroSideTraces />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[230px] -scale-x-100 lg:block xl:w-[280px]">
        <HeroSideTraces seed={2.6} />
      </div>

      <div className="shell relative z-10 flex flex-col items-center pt-36 pb-10 text-center md:pt-40">
        {/* badge */}
        <div
          data-hfade
          className="eyebrow-lines mb-8 text-[0.8rem] text-mist-bright"
        >
          <span className="flex items-center gap-2.5 rounded-full border border-signal-red/30 px-5 py-2" style={{ backgroundColor: "rgba(255,10,34,0.06)" }}>
            <span className="h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
            Next-gen air cargo platform
          </span>
        </div>

        {/* headline */}
        <h1 className="heading-glow mx-auto max-w-[18ch] text-[clamp(2.7rem,6.6vw,5.8rem)] font-medium leading-[1.02] tracking-tightest">
          <Line>
            <span className="heading-shine">{hero.headlineLead}</span>
          </Line>
          <Line>
            <span className="text-signal">{hero.headlineSignal}</span>
            <span className="heading-shine">, {hero.headlineTail}</span>
          </Line>
        </h1>

        {/* sub */}
        <p data-hfade className="mt-7 max-w-2xl text-lg leading-relaxed text-mist md:text-xl">
          {hero.sub}
        </p>

        {/* CTAs */}
        <div data-hfade className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
          <Magnetic>
            <Link href={hero.primaryCta.href} className="btn-signal" data-cursor>
              {hero.primaryCta.label} <span aria-hidden>→</span>
            </Link>
          </Magnetic>
          <Link href={hero.secondaryCta.href} className="btn-ghost" data-cursor>
            {hero.secondaryCta.label}
          </Link>
        </div>

        {/* the 360 machine */}
        <div data-hfade className="relative mt-8 w-full max-w-5xl md:mt-10">
          <PlatformMachine />
        </div>
      </div>
    </section>
  );
}
