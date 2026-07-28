"use client";

import { useEffect, useRef } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import RevealText from "@/components/RevealText";
import Magnetic from "@/components/Magnetic";

/**
 * Dashboard showcase — the Kargo360 ERP in one glance. Center browser frame
 * with a live-looking ops dashboard, two dimmed side screens behind it
 * (reference-style), and a demo-video hook.
 */

const KPIS = [
  { label: "Shipments in transit", value: "128", trend: "+12", up: true },
  { label: "On-time performance", value: "94.2%", trend: "+1.8%", up: true },
  { label: "AWBs this week", value: "1,204", trend: "+86", up: true },
  { label: "Support effort", value: "−85%", trend: "360 Kontrol", up: false },
];

const ROWS = [
  { awb: "176-4820 1943", route: "DEL → HUB", stage: "In Transit", pct: 64 },
  { awb: "176-4818 2210", route: "DEL → BLR", stage: "At Origin", pct: 22 },
  { awb: "098-1142 8830", route: "HUB → CDG", stage: "In Transit", pct: 71 },
  { awb: "176-4795 0027", route: "BOM → DEL", stage: "Delivered", pct: 100 },
  { awb: "020-3301 5518", route: "DEL → DXB", stage: "Customs", pct: 48 },
];

const BARS = [42, 58, 36, 66, 50, 74, 61, 82, 57, 90, 70, 96];

function StatusChip({ stage }: { stage: string }) {
  const cls =
    stage === "Delivered"
      ? "bg-white/10 text-mist-bright"
      : stage === "In Transit"
        ? "bg-signal-red/15 text-signal-crimson"
        : "bg-white/5 text-mist";
  return <span className={`rounded-full px-2 py-0.5 text-[0.6rem] font-medium ${cls}`}>{stage}</span>;
}

/** Simplified dimmed side screen */
function SideScreen({ side }: { side: "left" | "right" }) {
  return (
    <div
      data-p-side={side}
      className={`absolute top-10 hidden h-[78%] w-[34%] overflow-hidden rounded-xl border border-mist-line bg-ink-800/80 opacity-0 lg:block ${
        side === "left" ? "left-0" : "right-0"
      }`}
    >
      <div className="flex items-center gap-1.5 border-b border-mist-line px-4 py-2.5">
        <span className="h-2 w-2 rounded-full bg-mist-dim/50" />
        <span className="h-2 w-2 rounded-full bg-mist-dim/50" />
        <span className="h-2 w-2 rounded-full bg-mist-dim/50" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-2.5 w-2/5 rounded bg-white/10" />
        <div className="h-2 w-4/5 rounded bg-white/5" />
        <div className="h-2 w-3/5 rounded bg-white/5" />
        <div className="mt-4 flex h-24 items-end gap-1.5">
          {[30, 55, 40, 70, 48, 62, 35, 78].map((h, i) => (
            <div key={i} className={`w-full rounded-sm ${i === 5 ? "bg-signal-red/50" : "bg-white/8"}`} style={{ height: `${h}%`, backgroundColor: i === 5 ? undefined : "rgba(255,255,255,0.07)" }} />
          ))}
        </div>
        {[1, 2, 3, 4].map((r) => (
          <div key={r} className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-signal-red/40" />
            <div className="h-2 w-full rounded bg-white/5" />
          </div>
        ))}
      </div>
      {/* dim veil */}
      <div className="absolute inset-0 bg-ink-950/55" />
    </div>
  );
}

export default function Platform() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const main = el.querySelector("[data-p-main]");
    const sides = el.querySelectorAll("[data-p-side]");

    if (prefersReducedMotion()) {
      gsap.set([main, sides], { opacity: 1, y: 0, x: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top 70%", once: true },
      });
      tl.fromTo(main, { y: 56, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" })
        .fromTo(
          el.querySelector('[data-p-side="left"]'),
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.5"
        )
        .fromTo(
          el.querySelector('[data-p-side="right"]'),
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power3.out" },
          "-=0.55"
        );

      // live wiggle on the chart bars
      gsap.to(el.querySelectorAll("[data-p-bar]"), {
        scaleY: () => 0.85 + Math.random() * 0.3,
        transformOrigin: "bottom",
        duration: 2.2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        stagger: 0.15,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section id="platform" className="relative overflow-hidden bg-ink-950 py-24 md:py-32 noise">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-30" />

      <div className="shell relative">
        {/* centered header */}
        <div className="mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <div className="eyebrow mb-5 flex items-center justify-center gap-2.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
            // The system behind it all
          </div>
          <h2 className="text-4xl leading-[1.02] sm:text-5xl md:text-6xl">
            <RevealText text="The Entire Operation," by="word" />
            <br />
            <span className="text-signal">
              <RevealText text="One Dashboard." by="word" delay={0.08} />
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-mist">
            From booking to delivery, every shipment and stakeholder runs through one
            real-time system — clarity, control, and insight at a glance.
          </p>
        </div>

        {/* showcase */}
        <div ref={root} className="relative mx-auto max-w-5xl">
          <SideScreen side="left" />
          <SideScreen side="right" />

          {/* main browser frame */}
          <div
            data-p-main
            className="relative z-10 mx-auto w-full overflow-hidden rounded-2xl border border-mist-line bg-ink-800 opacity-0 shadow-[0_40px_120px_-30px_rgba(255,10,34,0.15),0_30px_80px_-40px_rgba(0,0,0,0.8)] lg:w-[78%]"
          >
            {/* window bar */}
            <div className="flex items-center gap-3 border-b border-mist-line bg-ink-700/60 px-4 py-2.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-signal-red/70" />
                <span className="h-2.5 w-2.5 rounded-full bg-mist-dim/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-mist-dim/60" />
              </div>
              <div className="mx-auto flex items-center gap-2 rounded-full bg-ink-900/80 px-4 py-1 text-[0.65rem] text-mist">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
                app.kargo360.ai
              </div>
              <div className="w-14" />
            </div>

            <div className="flex">
              {/* sidebar */}
              <div className="hidden w-40 shrink-0 border-r border-mist-line p-4 md:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.webp" alt="" className="mb-6 h-5 w-auto" />
                {["Dashboard", "Shipments", "Bookings", "Tracking", "Rates", "Reports"].map((item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-md px-3 py-2 text-xs ${
                      i === 0 ? "bg-signal-red/12 font-medium text-white" : "text-mist"
                    }`}
                    style={i === 0 ? { backgroundColor: "rgba(255,10,34,0.12)" } : undefined}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* content */}
              <div className="min-w-0 flex-1 p-4 md:p-5">
                {/* KPI row */}
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {KPIS.map((k) => (
                    <div key={k.label} className="rounded-lg border border-mist-line bg-ink-900/60 p-3">
                      <div className="text-[0.6rem] uppercase tracking-wider text-mist">{k.label}</div>
                      <div className="mt-1.5 font-display text-xl text-white md:text-2xl">{k.value}</div>
                      <div className={`mt-0.5 text-[0.62rem] ${k.up ? "text-signal-crimson" : "text-mist"}`}>
                        {k.trend}
                      </div>
                    </div>
                  ))}
                </div>

                {/* chart + table */}
                <div className="mt-3 grid gap-3 lg:grid-cols-[1.15fr_1fr]">
                  {/* volume chart */}
                  <div className="rounded-lg border border-mist-line bg-ink-900/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-mist-bright">Shipment volume</span>
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-[0.6rem] text-mist">Last 12 weeks</span>
                    </div>
                    <div className="flex h-32 items-end gap-1.5 md:h-36">
                      {BARS.map((h, i) => (
                        <div
                          key={i}
                          data-p-bar
                          className="w-full rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: i >= 9 ? "linear-gradient(180deg,#ff2f45,#c8001b)" : "rgba(255,255,255,0.08)",
                          }}
                        />
                      ))}
                    </div>
                    <div className="mt-2 flex justify-between text-[0.55rem] text-mist-dim">
                      <span>W1</span><span>W4</span><span>W8</span><span>W12</span>
                    </div>
                  </div>

                  {/* live shipments table */}
                  <div className="rounded-lg border border-mist-line bg-ink-900/60 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-xs font-medium text-mist-bright">Live shipments</span>
                      <span className="flex items-center gap-1.5 text-[0.6rem] text-mist">
                        <span className="h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" /> Live
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {ROWS.map((r) => (
                        <div key={r.awb} className="flex items-center gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[0.68rem] font-medium text-mist-bright">{r.awb}</div>
                            <div className="text-[0.6rem] text-mist-dim">{r.route}</div>
                          </div>
                          <div className="hidden h-1 w-16 overflow-hidden rounded-full bg-white/8 sm:block" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                            <div className="h-full rounded-full bg-signal-gradient" style={{ width: `${r.pct}%` }} />
                          </div>
                          <StatusChip stage={r.stage} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* soft red floor glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-10 left-1/2 h-28 w-[70%] -translate-x-1/2 rounded-full blur-[80px]"
            style={{ background: "rgba(255,10,34,0.12)" }}
          />
        </div>

        {/* demo video hook */}
        <div className="mt-12 flex justify-center">
          <Magnetic>
            <button type="button" className="btn-ghost group" data-cursor>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-red transition-transform duration-300 group-hover:scale-110">
                <svg viewBox="0 0 12 12" className="ml-0.5 h-3 w-3" fill="#fff" aria-hidden>
                  <path d="M2 1.5v9l8-4.5-8-4.5Z" />
                </svg>
              </span>
              Watch the platform in action
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}
