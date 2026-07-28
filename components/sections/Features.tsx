"use client";

import { useState } from "react";
import { features } from "@/lib/content";
import Reveal from "@/components/Reveal";
import StatCounter from "@/components/StatCounter";
import RevealText from "@/components/RevealText";
import IsoMotif from "@/components/IsoMotif";

/**
 * Feature index — sticky proof panel on the left, interactive expanding
 * list on the right. Hover/tap a row to open it; the red rail tracks the
 * active feature.
 */
export default function Features() {
  const [active, setActive] = useState(0);

  return (
    <section id="features" className="relative bg-ink-900 py-24 md:py-36 noise">
      <div className="shell">
        {/* header */}
        <div className="mb-14 flex flex-col justify-between gap-6 md:mb-20 md:flex-row md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <IsoMotif variant="cube" />
              <div className="eyebrow">// Built for enterprise cargo</div>
            </div>
            <h2 className="max-w-2xl text-4xl leading-[0.98] sm:text-5xl md:text-6xl">
              <RevealText text="Powerful Underneath." by="word" />
              <br />
              <span className="text-mist">
                <RevealText text="Effortless on Top." by="word" delay={0.08} />
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-lg leading-relaxed text-mist md:pb-2 md:text-right">
            Eight reasons enterprise cargo teams run on Kargo360.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.35fr] lg:gap-16">
          {/* LEFT — sticky proof panel */}
          <div>
            <Reveal className="lg:sticky lg:top-28">
              <div className="panel relative overflow-hidden p-8 md:p-10">
                <div className="pointer-events-none absolute inset-0 grid-lines opacity-40" />
                <div
                  className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[100px]"
                  style={{ background: "rgba(255,10,34,0.16)" }}
                />
                <span className="eyebrow relative">// Proven impact</span>

                <div className="relative mt-10 font-display text-[clamp(4.5rem,9vw,8rem)] leading-none text-signal">
                  <StatCounter value={85} suffix="%" />
                </div>
                <p className="relative mt-4 max-w-xs text-lg leading-relaxed text-mist">
                  Reduction in support effort with 360 Kontrol&apos;s self-service portal.
                </p>

                {/* secondary stats */}
                <div className="relative mt-10 grid grid-cols-2 gap-6 border-t border-mist-line pt-7">
                  <div>
                    <div className="font-display text-3xl text-white">
                      <StatCounter value={8} />
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-mist">
                      Stakeholder categories
                    </div>
                  </div>
                  <div>
                    <div className="font-display text-3xl text-white">
                      <StatCounter value={5} suffix="-step" />
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-widest text-mist">
                      Onboarding
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* RIGHT — interactive feature index */}
          <Reveal>
            <div className="relative border-t border-mist-line">
              {features.map((f, i) => {
                const isActive = i === active;
                return (
                  <button
                    key={f.title}
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    data-cursor
                    className="group relative block w-full border-b border-mist-line text-left"
                  >
                    {/* sliding red rail */}
                    <span
                      className={`absolute left-0 top-0 h-full w-[2px] origin-top bg-signal-gradient transition-transform duration-500 ${
                        isActive ? "scale-y-100" : "scale-y-0"
                      }`}
                    />

                    <div className="flex items-baseline gap-5 py-6 pl-6 pr-2 md:gap-8 md:py-7">
                      <span
                        className={`text-xs font-medium transition-colors duration-300 ${
                          isActive ? "text-signal-red" : "text-mist-dim"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-4">
                          <h3
                            className={`text-2xl transition-all duration-300 md:text-3xl ${
                              isActive
                                ? "translate-x-1 text-white"
                                : "text-mist group-hover:text-mist-bright"
                            }`}
                          >
                            {f.title}
                          </h3>
                          {/* plus → minus indicator */}
                          <span className="relative h-4 w-4 shrink-0" aria-hidden>
                            <span
                              className={`absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 transition-colors duration-300 ${
                                isActive ? "bg-signal-red" : "bg-mist-dim"
                              }`}
                            />
                            <span
                              className={`absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 bg-mist-dim transition-all duration-300 ${
                                isActive ? "rotate-90 opacity-0" : "opacity-100"
                              }`}
                            />
                          </span>
                        </div>

                        {/* expandable blurb */}
                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${
                            isActive ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                          }`}
                        >
                          <div className="overflow-hidden">
                            <p className="max-w-md pt-3 leading-relaxed text-mist">{f.blurb}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
