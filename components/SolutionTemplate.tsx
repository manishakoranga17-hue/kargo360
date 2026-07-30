"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Solution } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import FixGraphic from "@/components/FixGraphic";
import PainGraphic from "@/components/PainGraphic";
import GsaDashboard from "@/components/GsaDashboard";
import GsaModelGraphic from "@/components/GsaModelGraphic";

/** blueprint corner marks — place inside a `relative` container */
function Ticks() {
  return (
    <>
      <span aria-hidden className="tick -left-1 -top-1" />
      <span aria-hidden className="tick -right-1 -top-1" />
      <span aria-hidden className="tick -bottom-1 -left-1" />
      <span aria-hidden className="tick -bottom-1 -right-1" />
    </>
  );
}

export default function SolutionTemplate({ solution }: { solution: Solution }) {
  const root = useRef<HTMLDivElement>(null);
  const [headLead, headAccent] = solution.heroTitle;

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const lines = el.querySelectorAll<HTMLElement>("[data-pline] > span");
    const fade = el.querySelectorAll<HTMLElement>("[data-pfade]");

    if (prefersReducedMotion()) {
      gsap.set(lines, { yPercent: 0 });
      gsap.set(fade, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap
        .timeline({ delay: 0.15 })
        .fromTo(lines, { yPercent: 118 }, { yPercent: 0, duration: 1, ease: "power4.out", stagger: 0.1 })
        .fromTo(fade, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.1, ease: "power3.out" }, "-=0.5");
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root}>
      {/* hero */}
      <section className="relative overflow-hidden bg-ink-900 pt-40 pb-24 md:pt-48 md:pb-32 noise">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full blur-[120px] will-change-transform"
          style={{ background: "rgba(255,10,34,0.13)" }}
        />
        <div className="shell relative flex flex-col items-center text-center">
          <Link
            href="/"
            data-pfade
            className="eyebrow mb-8 inline-flex items-center gap-2 hover:text-white"
            data-cursor
          >
            ← Home
          </Link>

          <div data-pfade className="mb-6">
            <span className="rounded-full border border-mist-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-mist">
              Solution · {solution.scope}
            </span>
          </div>

          <p data-pfade className="mb-5 max-w-xl text-lg font-medium text-mist-bright md:text-xl">
            {solution.heroKicker}
          </p>

          <div className="relative inline-block px-4">
            <Ticks />
            <h1 className="mx-auto max-w-[18ch] text-[clamp(2.4rem,6.6vw,5.4rem)] font-semibold leading-[0.98]">
              <span data-pline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
                <span className="heading-shine block will-change-transform">{headLead}</span>
              </span>
              <span data-pline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
                <span className="block will-change-transform text-signal">{headAccent}</span>
              </span>
            </h1>
          </div>

          <p data-pfade className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-mist md:text-xl">
            {solution.long}
          </p>

          <div data-pfade className="mt-9">
            <Magnetic>
              <Link href="/#contact" className="btn-signal" data-cursor>
                Get in touch <span aria-hidden>→</span>
              </Link>
            </Magnetic>
          </div>

          {/* the film */}
          {solution.video && (
            <div data-pfade className="relative mt-16 w-full max-w-4xl">
              <Ticks />
              <div className="panel group relative aspect-video overflow-hidden !rounded-3xl">
                {solution.video.src ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    className="h-full w-full object-cover"
                    src={solution.video.src}
                    poster={solution.video.poster}
                    controls
                    playsInline
                  />
                ) : (
                  <>
                    <div className="pointer-events-none absolute inset-0 grid-lines opacity-25" />
                    <div
                      className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[110px] will-change-transform"
                      style={{ background: "rgba(255,10,34,0.14)" }}
                    />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
                      <button
                        type="button"
                        aria-label="Play video"
                        data-cursor
                        className="relative flex h-20 w-20 items-center justify-center rounded-full bg-signal-red shadow-[0_0_70px_-12px_rgba(255,10,34,0.8)] transition-transform duration-300 group-hover:scale-110"
                      >
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal-red opacity-25 [animation-duration:2.6s]" />
                        <svg viewBox="0 0 16 16" className="relative ml-1 h-5 w-5" fill="#fff" aria-hidden>
                          <path d="M3 2v12l10.5-6L3 2Z" />
                        </svg>
                      </button>
                      <div className="text-sm text-mist">
                        {solution.video.title}
                        {solution.video.duration && (
                          <span className="text-mist-dim"> · {solution.video.duration}</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-5 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                      Film · coming soon
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* the old way — pain points */}
      {solution.pains && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-36 noise">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]"
          />
          <div className="shell relative">
            <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
              <div className="eyebrow eyebrow-lines mb-6">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red" />
                // The old way
              </div>
              <h2 className="heading-shine text-3xl leading-[1.08] sm:text-4xl md:text-5xl">
                {solution.pains.heading}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-mist">
                {solution.pains.intro}
              </p>
            </div>
            <Reveal stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {solution.pains.items.map((item, i) => (
                <div key={item.title} className="panel group flex flex-col overflow-hidden">
                  {/* legacy-workflow diagram */}
                  <div className="relative h-44 border-b border-white/10 bg-ink-950/40">
                    <div className="pointer-events-none absolute inset-0 grid-lines opacity-20" />
                    <div className="absolute inset-x-3 bottom-0 top-8 opacity-80 saturate-[0.85] transition-opacity duration-500 group-hover:opacity-100">
                      <PainGraphic type={item.graphic} />
                    </div>
                    <div className="absolute left-4 top-3 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                      <span className="text-signal-red/70">ERR {String(i + 1).padStart(2, "0")}</span>
                      {item.tag}
                    </div>
                    <span className="absolute right-4 top-3 flex h-5 w-5 items-center justify-center rounded-full border border-signal-red/40 text-[0.6rem] text-signal-red">
                      ✕
                    </span>
                  </div>
                  {/* copy */}
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-xl md:text-2xl">{item.title}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{item.blurb}</p>
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* the fix — how we solve it */}
      {solution.fixes && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-900 py-24 md:py-36">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,10,34,0.12),transparent_72%)]"
          />
          <div className="shell relative">
            <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
              <div className="eyebrow eyebrow-lines mb-6">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
                // How we solve it
              </div>
              <h2 className="text-3xl leading-[1.05] sm:text-4xl md:text-5xl">
                <span className="text-signal">{solution.fixes.heading}</span>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-mist">
                {solution.fixes.intro}
              </p>
            </div>
            <div className="divide-y divide-mist-line border-y border-mist-line">
              {solution.fixes.items.map((item, i) => (
                <Reveal
                  key={item.title}
                  className="grid items-center gap-8 py-10 md:py-12 lg:grid-cols-[1fr_1.1fr] lg:gap-14"
                >
                  {/* diagram — left */}
                  <div className="relative">
                    <Ticks />
                    <div className="panel relative h-52 overflow-hidden md:h-60">
                    <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
                    <div
                      className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full blur-[80px] will-change-transform"
                      style={{ background: "rgba(255,10,34,0.08)" }}
                    />
                    <div className="absolute inset-x-4 bottom-0 top-9">
                      <FixGraphic type={item.graphic} />
                    </div>
                    <div className="absolute left-5 top-4 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-mist">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red" />
                      {item.tag}
                    </div>
                    <span className="absolute right-5 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-signal-red text-[0.6rem] text-white">
                      ✓
                    </span>
                    </div>
                  </div>

                  {/* copy — right */}
                  <div className="relative lg:pr-8">
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -top-7 right-0 font-display text-7xl font-semibold leading-none text-white/[0.04] md:text-8xl"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="font-mono text-[0.65rem] uppercase tracking-widest text-signal-crimson">
                      Step {String(i + 1).padStart(2, "0")} / 06
                    </div>
                    <h3 className="mt-3 text-2xl md:text-3xl">{item.title}</h3>
                    <p className="mt-4 max-w-lg leading-relaxed text-mist">{item.blurb}</p>
                    <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-mist-line px-3.5 py-1.5 text-[0.65rem] uppercase tracking-widest text-mist-dim">
                      <span className="text-signal-red">✕</span>
                      <span className="line-through">{item.replaces}</span>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* dashboard showcase — where it all runs */}
      {solution.dashboard && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-36 noise">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
          />
          <div className="shell relative">
            <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
              <div className="eyebrow eyebrow-lines mb-6">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
                // Mission control
              </div>
              <h2 className="heading-shine text-3xl leading-[1.08] sm:text-4xl md:text-5xl">
                {solution.dashboard.heading}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-mist">
                {solution.dashboard.intro}
              </p>
            </div>
            <Reveal>
              <GsaDashboard />
            </Reveal>
          </div>
        </section>
      )}

      {/* the GSA model — circuit board */}
      {solution.model && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-36 noise">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]"
          />
          <div className="shell relative">
            <div className="mx-auto mb-10 max-w-2xl text-center md:mb-14">
              <div className="eyebrow eyebrow-lines mb-6">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red" />
                // The GSA model
              </div>
              <h2 className="heading-shine text-3xl leading-[1.08] sm:text-4xl md:text-5xl">
                {solution.model.heading}
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-mist">
                {solution.model.intro}
              </p>
            </div>
            <Reveal>
              <div className="relative mx-auto max-w-6xl">
                <GsaModelGraphic />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* why kargo360 */}
      <section className="relative overflow-hidden border-t border-mist-line bg-ink-900 py-24 md:py-36 noise">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 top-0 h-[420px] w-[420px] rounded-full blur-[110px] will-change-transform"
          style={{ background: "rgba(255,10,34,0.07)" }}
        />
        <div className="shell relative">
          <div className="eyebrow mb-8">// Why Kargo360</div>
          <Reveal stagger className="grid gap-4 md:grid-cols-3">
            {solution.pillars.map((pl, i) => (
              <div key={pl.title} className="panel p-7">
                <span className="text-xs font-medium text-signal-red">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 text-2xl">{pl.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-mist">{pl.blurb}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  );
}
