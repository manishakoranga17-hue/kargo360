"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { faq } from "@/lib/content";
import Reveal from "@/components/Reveal";

export default function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative overflow-hidden border-t border-mist-line bg-ink-950 py-24 md:py-36 noise">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(ellipse_42%_75%_at_28%_0%,rgba(255,255,255,0.055),transparent_70%)]"
      />
      <div className="shell relative grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        {/* header */}
        <div>
          <div className="lg:sticky lg:top-32">
            <div className="eyebrow mb-5">{faq.eyebrow}</div>
            <h2 className="heading-glow text-4xl leading-[0.98] sm:text-5xl">
              <span className="heading-shine">{faq.title}</span>
            </h2>
            <p className="mt-5 max-w-sm text-lg leading-relaxed text-mist">{faq.body}</p>
            <p className="mt-8 text-sm text-mist">
              Something else on your mind?{" "}
              <Link href="#contact" className="text-signal-crimson underline-offset-4 hover:underline" data-cursor>
                Get in touch →
              </Link>
            </p>
          </div>
        </div>

        {/* accordion */}
        <Reveal stagger className="divide-y divide-mist-line border-y border-mist-line">
          {faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  data-cursor
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                >
                  <span
                    className={clsx(
                      "text-lg transition-colors duration-300 md:text-xl",
                      isOpen ? "text-white" : "text-mist-bright group-hover:text-white"
                    )}
                  >
                    {item.q}
                  </span>
                  <span
                    className={clsx(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                      isOpen
                        ? "rotate-45 border-signal-red/50 text-signal-crimson"
                        : "border-mist-line text-mist group-hover:border-mist-dim group-hover:text-white"
                    )}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                      <path d="M6 1v10M1 6h10" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-xl pb-7 leading-relaxed text-mist">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
