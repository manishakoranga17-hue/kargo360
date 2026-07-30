"use client";

import { useRef } from "react";
import { stakeholders } from "@/lib/content";
import { useAnimGate } from "@/lib/useAnimGate";

export default function Marquee() {
  const root = useRef<HTMLElement>(null);
  useAnimGate(root);
  const row = [...stakeholders, ...stakeholders];
  return (
    <section ref={root} className="relative overflow-hidden bg-paper py-7 text-ink-900">
      <div className="pointer-events-none absolute inset-0 grid-lines-dark opacity-60" />
      <div className="shell relative mb-5 flex items-center justify-between">
        <span className="eyebrow !text-ink-900/50">// Connecting every stakeholder</span>
        <span className="text-[0.65rem] font-medium uppercase tracking-widest text-ink-900/40">
          08 / Categories
        </span>
      </div>
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
        <ul className="flex shrink-0 animate-marquee items-center gap-10 pr-10">
          {row.map((s, i) => (
            <li key={i} className="flex items-center gap-10">
              <span className="whitespace-nowrap font-display text-2xl font-medium text-ink-900 md:text-4xl">
                {s}
              </span>
              <span className="text-xl text-signal-red">✦</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
