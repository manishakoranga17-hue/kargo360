"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { Solution } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import GsaDashboard from "@/components/GsaDashboard";
import GsaModelGraphic from "@/components/GsaModelGraphic";
import GsaStory from "@/components/GsaStory";
import TelemetryTicker from "@/components/TelemetryTicker";

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

/** left-aligned technical section header: index rail + asymmetric title/intro */
function SectionHead({
  index,
  label,
  title,
  intro,
  accent = false,
}: {
  index: string;
  label: string;
  title: string;
  intro: string;
  accent?: boolean;
}) {
  return (
    <div className="relative mb-12 md:mb-16">
      <div className="mb-8 flex items-center gap-4 font-mono text-[0.65rem] uppercase tracking-widest">
        <span className="text-signal-crimson">[ {index} ]</span>
        <span className="text-mist-dim">// {label}</span>
        <span aria-hidden className="h-px flex-1 bg-mist-line" />
        <span aria-hidden className="hidden text-mist-dim/60 sm:block">
          SYS.OK
        </span>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr] lg:items-end lg:gap-16">
        <h2
          className={clsx(
            "text-3xl leading-[1.06] sm:text-4xl md:text-5xl",
            accent ? "text-signal-glow" : "heading-glow"
          )}
        >
          <span className={accent ? "text-signal" : "heading-shine"}>{title}</span>
        </h2>
        <p className="max-w-lg text-lg leading-relaxed text-mist lg:justify-self-end lg:pb-1.5">
          {intro}
        </p>
      </div>
    </div>
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
      <section className="relative overflow-hidden bg-ink-900 pt-40 pb-20 md:pt-48 md:pb-28 noise">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
        <div aria-hidden className="hero-beam pointer-events-none absolute inset-x-0 top-0 h-[560px]" />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full blur-[120px] will-change-transform"
          style={{ background: "rgba(255,10,34,0.13)" }}
        />
        <div className="shell relative flex flex-col items-center text-center">
          <div data-pfade className="mb-6">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-mist-line bg-ink-950/50 px-3.5 py-1.5 font-mono text-[0.65rem] uppercase tracking-widest text-mist">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
              Solution · {solution.scope}
            </span>
          </div>

          <p data-pfade className="mb-5 max-w-xl text-lg font-medium text-mist-bright md:text-xl">
            {solution.heroKicker}
          </p>

          <div className="relative inline-block px-4">
            <Ticks />
            <h1 className="heading-glow mx-auto max-w-[18ch] text-[clamp(2.4rem,6.6vw,5.4rem)] font-semibold leading-[0.98]">
              <span data-pline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
                <span className="block will-change-transform">
                  <span className="heading-shine">{headLead}</span>
                </span>
              </span>
              <span data-pline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
                <span className="block will-change-transform">
                  <span className="text-signal">{headAccent}</span>
                </span>
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

          {/* the film — HUD console frame */}
          {solution.video && (
            <div data-pfade className="relative mt-16 w-full max-w-4xl">
              <Ticks />
              <div className="panel group relative overflow-hidden !rounded-2xl">
                {/* chrome bar */}
                <div className="relative flex items-center justify-between border-b border-white/10 bg-ink-950/60 px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    <span className="h-2.5 w-2.5 rounded-full bg-signal-red/70" />
                  </div>
                  <span className="absolute left-1/2 -translate-x-1/2 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                    gsa-reimagined.film
                  </span>
                  <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
                    REC {solution.video.duration && <span>· {solution.video.duration}</span>}
                  </span>
                </div>
                {/* screen */}
                <div className="relative aspect-video">
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
                        <div className="text-sm text-mist">{solution.video.title}</div>
                      </div>
                      <div className="absolute bottom-4 left-5 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                        Film · coming soon
                      </div>
                      <div className="absolute bottom-4 right-5 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                        00:00:00
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* live-ops telemetry strip */}
      <TelemetryTicker />

      {/* [01] the story — before / after Kargo360 */}
      {solution.pains && solution.fixes && (
        <section className="relative overflow-hidden bg-ink-950 py-24 md:py-32 noise">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
          />
          <div className="shell relative">
            <SectionHead
              index="01"
              label="The story"
              title={solution.pains.heading}
              intro="One desk, two realities. Flip between how the day runs before Kargo360 — and after."
            />
            <Reveal>
              <GsaStory
                beforeCaption={solution.pains.intro}
                afterCaption={solution.fixes.intro}
              />
            </Reveal>
          </div>
        </section>
      )}

      {/* [03] mission control — dashboard showcase */}
      {solution.dashboard && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-32 noise">
          <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
          />
          <div className="shell relative">
            <SectionHead
              index="02"
              label="Mission control"
              title={solution.dashboard.heading}
              intro={solution.dashboard.intro}
            />
            <Reveal>
              <GsaDashboard />
            </Reveal>
          </div>
        </section>
      )}

      {/* [04] the GSA model — circuit board */}
      {solution.model && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-32 noise">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.07),transparent_70%)]"
          />
          <div className="shell relative">
            <SectionHead
              index="03"
              label="The GSA model"
              title={solution.model.heading}
              intro={solution.model.intro}
            />
            <Reveal>
              <div className="relative mx-auto max-w-6xl">
                <GsaModelGraphic />
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* closing transmission */}
      <section className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-32 noise">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,10,34,0.10),transparent_72%)]"
        />
        <div className="shell relative flex flex-col items-center text-center">
          <div className="eyebrow eyebrow-lines mb-6">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
            // Begin transmission
          </div>
          <h2 className="heading-glow max-w-[16ch] text-3xl leading-[1.06] sm:text-4xl md:text-5xl">
            <span className="heading-shine">Ready to Reimagine</span>{" "}
            <span className="text-signal">Your GSA?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-mist">
            Bring your airline onto the 360 platform — sales, operations and settlement in one
            live system, run by a GSA built on its own technology.
          </p>
          <div className="mt-9">
            <Magnetic>
              <Link href="/#contact" className="btn-signal" data-cursor>
                Talk to us <span aria-hidden>→</span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
