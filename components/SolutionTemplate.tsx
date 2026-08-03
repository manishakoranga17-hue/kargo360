"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { Solution } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";
import FixGraphic from "@/components/FixGraphic";
import PainGraphic from "@/components/PainGraphic";
import GsaDashboard from "@/components/GsaDashboard";
import GsaModelGraphic from "@/components/GsaModelGraphic";
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
  const [activeStep, setActiveStep] = useState(0);
  const [headLead, headAccent] = solution.heroTitle;
  const stepCount = solution.fixes?.items.length ?? 0;

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

  // track which fix step is in view → drives the sticky patch-sequence index
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const steps = Array.from(el.querySelectorAll<HTMLElement>("[data-step]"));
    if (!steps.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveStep(Number((e.target as HTMLElement).dataset.step));
        });
      },
      { rootMargin: "-42% 0px -48% 0px" }
    );
    steps.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  const jumpToStep = (i: number) => {
    root.current
      ?.querySelector(`[data-step="${i}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

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

      {/* [01] diagnostic — the old way, presented as a system audit */}
      {solution.pains && (
        <section className="relative overflow-hidden bg-ink-950 py-24 md:py-32 noise">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,255,255,0.06),transparent_70%)]"
          />
          <div className="shell relative">
            <SectionHead
              index="01"
              label="System diagnostic"
              title={solution.pains.heading}
              intro={solution.pains.intro}
            />
            <Reveal>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.85)]">
                {/* console title bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.03] px-5 py-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                      <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                    </div>
                    <span className="font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                      legacy-gsa-audit.log
                    </span>
                  </div>
                  <span className="flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest text-signal-crimson">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
                    {String(solution.pains.items.length).padStart(2, "0")} Faults Detected
                  </span>
                </div>
                {/* scan body — hairline cell grid */}
                <div className="relative overflow-hidden">
                  <span aria-hidden className="scan-beam z-10" />
                  <div className="relative grid gap-px bg-white/[0.07] md:grid-cols-2 lg:grid-cols-3">
                    {solution.pains.items.map((item, i) => (
                      <div
                        key={item.title}
                        className="group relative flex flex-col bg-ink-950 transition-colors duration-500 hover:bg-[#101014]"
                      >
                        <div className="relative h-44 overflow-hidden">
                          <div className="absolute inset-x-3 bottom-0 top-9 opacity-70 saturate-[0.8] transition-all duration-500 group-hover:opacity-100 group-hover:saturate-100">
                            <PainGraphic type={item.graphic} />
                          </div>
                          <div className="absolute left-5 top-4 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-widest">
                            <span className="text-signal-red/80">
                              Fault_{String(i + 1).padStart(2, "0")}
                            </span>
                            <span className="text-mist-dim">{item.tag}</span>
                          </div>
                          <span className="absolute right-4 top-3.5 flex h-5 w-5 items-center justify-center rounded-full border border-signal-red/40 text-[0.6rem] text-signal-red">
                            ✕
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col border-t border-white/[0.06] p-6">
                          <h3 className="text-lg md:text-xl">{item.title}</h3>
                          <p className="mt-2.5 text-sm leading-relaxed text-mist">{item.blurb}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* [02] resolution — sticky patch-sequence index + step cards */}
      {solution.fixes && (
        <section className="relative overflow-hidden border-t border-mist-line bg-ink-900 py-24 md:py-32">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(ellipse_46%_75%_at_50%_0%,rgba(255,10,34,0.12),transparent_72%)]"
          />
          <div className="shell relative">
            <SectionHead
              index="02"
              label="Resolution"
              title={solution.fixes.heading}
              intro={solution.fixes.intro}
              accent
            />
            <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
              {/* sticky index */}
              <div className="hidden lg:block">
                <div className="sticky top-28">
                  <div className="mb-4 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                    Patch Sequence · {String(stepCount).padStart(2, "0")} Modules
                  </div>
                  <div className="space-y-1">
                    {solution.fixes.items.map((item, i) => {
                      const isActive = activeStep === i;
                      const isDone = activeStep > i;
                      return (
                        <button
                          key={item.title}
                          type="button"
                          data-cursor
                          onClick={() => jumpToStep(i)}
                          className={clsx(
                            "group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left transition-all duration-300",
                            isActive
                              ? "border-signal-red/40 bg-white/[0.045]"
                              : "border-transparent hover:bg-white/[0.03]"
                          )}
                        >
                          <span
                            className={clsx(
                              "font-mono text-[0.65rem] tracking-widest transition-colors duration-300",
                              isActive ? "text-signal-crimson" : "text-mist-dim"
                            )}
                          >
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <span
                            className={clsx(
                              "flex-1 text-sm transition-colors duration-300",
                              isActive
                                ? "text-white"
                                : "text-mist group-hover:text-mist-bright"
                            )}
                          >
                            {item.title}
                          </span>
                          <span
                            className={clsx(
                              "flex h-4 w-4 items-center justify-center rounded-full border text-[0.55rem] transition-all duration-300",
                              isDone || isActive
                                ? "border-signal-red/60 bg-signal-red/15 text-signal-crimson"
                                : "border-mist-line text-transparent"
                            )}
                          >
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* progress */}
                  <div className="relative mt-6 h-px bg-mist-line">
                    <span
                      className="absolute inset-y-0 left-0 bg-signal-red transition-all duration-500"
                      style={{ width: `${((activeStep + 1) / Math.max(stepCount, 1)) * 100}%` }}
                    />
                  </div>
                  <div className="mt-3 font-mono text-[0.6rem] uppercase tracking-widest text-mist-dim">
                    {String(activeStep + 1).padStart(2, "0")} /{" "}
                    {String(stepCount).padStart(2, "0")} Resolved
                  </div>
                </div>
              </div>

              {/* step cards */}
              <div className="space-y-6">
                {solution.fixes.items.map((item, i) => (
                  <Reveal key={item.title}>
                    <div data-step={i} className="panel group relative overflow-hidden !rounded-2xl">
                      {/* diagram */}
                      <div className="relative h-56 overflow-hidden border-b border-white/10 md:h-64">
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
                      {/* copy */}
                      <div className="relative p-7 md:p-8">
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -top-2 right-6 font-display text-7xl font-semibold leading-none text-white/[0.04] md:text-8xl"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="font-mono text-[0.65rem] uppercase tracking-widest text-signal-crimson">
                          Step {String(i + 1).padStart(2, "0")} / {String(stepCount).padStart(2, "0")}
                        </div>
                        <h3 className="mt-3 text-2xl md:text-3xl">{item.title}</h3>
                        <p className="mt-4 max-w-lg leading-relaxed text-mist">{item.blurb}</p>
                        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-mist-line px-3.5 py-1.5 text-[0.65rem] uppercase tracking-widest text-mist-dim">
                          <span className="text-signal-red">✕</span>
                          <span className="line-through">{item.replaces}</span>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
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
              index="03"
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
              index="04"
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
