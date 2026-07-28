"use client";

import { valueChain, stakeholders } from "@/lib/content";
import RevealText from "@/components/RevealText";
import IsoMotif from "@/components/IsoMotif";
import StakeholderAtom from "@/components/StakeholderAtom";

export default function ValueChain() {
  return (
    <section
      id="value"
      className="relative overflow-hidden border-t border-mist-line bg-ink-800 py-24 md:py-36"
    >
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />
      <div className="shell relative grid items-center gap-16 lg:grid-cols-[0.95fr_1.05fr]">
        {/* copy */}
        <div>
          <div className="mb-5 flex items-center gap-3">
            <IsoMotif variant="ring" />
            <div className="eyebrow">{valueChain.eyebrow}</div>
          </div>
          <h2 className="text-4xl leading-[0.98] sm:text-5xl md:text-6xl">
            <RevealText text="One Platform." by="word" />
            <br />
            <span className="text-signal">
              <RevealText text="Every Stakeholder." by="word" delay={0.08} />
            </span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-mist">{valueChain.body}</p>

          <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-3 md:max-w-md">
            {stakeholders.map((s, i) => (
              <div key={s} className="flex items-center gap-3 text-sm text-mist-bright">
                <span className="text-[0.7rem] font-medium text-signal-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* atom diagram */}
        <StakeholderAtom />
      </div>
    </section>
  );
}
