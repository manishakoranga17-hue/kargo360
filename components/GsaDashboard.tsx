"use client";

import { useEffect, useRef, useState } from "react";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import { withBase } from "@/lib/asset";
import clsx from "clsx";

const VIEWS = ["bookings", "capacity", "settlement"] as const;
type View = (typeof VIEWS)[number];

const TAB_LABEL: Record<View, string> = {
  bookings: "Bookings",
  capacity: "Capacity",
  settlement: "Settlement",
};

const SIDEBAR = ["Overview", "Bookings", "Capacity", "Rates", "Settlement", "Reports"];
const SIDEBAR_ACTIVE: Record<View, string> = {
  bookings: "Bookings",
  capacity: "Capacity",
  settlement: "Settlement",
};

const KPIS: Record<View, { label: string; value: string; trend: string }[]> = {
  bookings: [
    { label: "Quotes today", value: "128", trend: "+22" },
    { label: "Conversion", value: "68%", trend: "+4.1%" },
    { label: "Quote → AWB", value: "38s", trend: "−12s" },
    { label: "Active forwarders", value: "241", trend: "+9" },
  ],
  capacity: [
    { label: "Flights this week", value: "46", trend: "+3" },
    { label: "Sold tonnage", value: "312t", trend: "+18t" },
    { label: "Avg load factor", value: "84%", trend: "+2.6%" },
    { label: "Spot uplift", value: "+9%", trend: "vs contract" },
  ],
  settlement: [
    { label: "Invoices raised", value: "1,204", trend: "+86" },
    { label: "Reconciled", value: "96%", trend: "+1.8%" },
    { label: "Open disputes", value: "3", trend: "−5" },
    { label: "Days to settle", value: "4.2", trend: "−0.8" },
  ],
};

const BOOKINGS = [
  { who: "Global Freight Co", lane: "DEL → DXB", kg: "2,400 kg", status: "Quoted" },
  { who: "AirBridge Logistics", lane: "BOM → FRA", kg: "860 kg", status: "Confirmed" },
  { who: "Nippon Kargo", lane: "DEL → NRT", kg: "5,120 kg", status: "AWB issued" },
  { who: "TransCargo GmbH", lane: "MAA → CDG", kg: "1,250 kg", status: "Quoted" },
  { who: "Skyline Freight", lane: "DEL → JFK", kg: "3,600 kg", status: "Confirmed" },
];

const FLIGHTS = [
  { flt: "KX 402", lane: "DEL → DXB", day: "Today", pct: 84 },
  { flt: "KX 118", lane: "BOM → FRA", day: "Tomorrow", pct: 76 },
  { flt: "KX 233", lane: "DEL → NRT", day: "Wed", pct: 91 },
  { flt: "KX 077", lane: "MAA → CDG", day: "Thu", pct: 62 },
  { flt: "KX 512", lane: "DEL → JFK", day: "Fri", pct: 88 },
];

const INVOICES = [
  { awb: "176-4820 1943", amt: "USD 4,120", ok: true },
  { awb: "176-4818 2210", amt: "USD 1,865", ok: true },
  { awb: "098-1142 8830", amt: "USD 7,340", ok: false },
  { awb: "176-4795 0027", amt: "USD 2,410", ok: true },
  { awb: "020-3301 5518", amt: "USD 3,015", ok: true },
];

function Chip({ label, tone }: { label: string; tone: "red" | "dim" | "bright" }) {
  return (
    <span
      className={clsx(
        "rounded-full px-2 py-0.5 text-[0.6rem] font-medium",
        tone === "red" && "text-signal-crimson",
        tone === "bright" && "bg-white/10 text-mist-bright",
        tone === "dim" && "bg-white/5 text-mist"
      )}
      style={tone === "red" ? { backgroundColor: "rgba(255,10,34,0.15)" } : undefined}
    >
      {label}
    </span>
  );
}

/** GSA "mission control" — browser-framed dashboard with cycling views. */
export default function GsaDashboard() {
  const root = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>("bookings");
  const visible = useRef(false);
  const lastClick = useRef(0);

  // auto-cycle views while on screen (pauses after a manual click for 12s)
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting));
    io.observe(el);
    const id = setInterval(() => {
      if (!visible.current) return;
      if (Date.now() - lastClick.current < 12000) return;
      setView((v) => VIEWS[(VIEWS.indexOf(v) + 1) % VIEWS.length]);
    }, 5000);
    return () => {
      io.disconnect();
      clearInterval(id);
    };
  }, []);

  // animate view content in on switch
  useEffect(() => {
    registerGsap();
    const el = content.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-dv]",
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: "power2.out" }
      );
    }, el);
    return () => ctx.revert();
  }, [view]);

  const pick = (v: View) => {
    lastClick.current = Date.now();
    setView(v);
  };

  return (
    <div ref={root} className="relative mx-auto max-w-5xl">
      {/* blueprint corner marks */}
      <span aria-hidden className="tick -left-2 -top-2" />
      <span aria-hidden className="tick -right-2 -top-2" />
      <span aria-hidden className="tick -bottom-2 -left-2" />
      <span aria-hidden className="tick -bottom-2 -right-2" />
      {/* browser frame — frosted glass, elevated */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-white/10 bg-ink-800/70 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.4),0_48px_120px_-30px_rgba(0,0,0,0.85),0_40px_120px_-30px_rgba(255,10,34,0.12)]">
        {/* window bar */}
        <div className="flex items-center gap-3 border-b border-mist-line bg-ink-700/60 px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-signal-red/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-mist-dim/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-mist-dim/60" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-full bg-ink-900/80 px-4 py-1 text-[0.65rem] text-mist">
            <span className="h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" />
            gsa.kargo360.ai
          </div>
          {/* view tabs */}
          <div className="hidden items-center gap-1 rounded-full bg-ink-900/80 p-1 sm:flex">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => pick(v)}
                className={clsx(
                  "rounded-full px-3 py-1 text-[0.65rem] font-medium transition-colors",
                  view === v ? "bg-signal-red text-white" : "text-mist hover:text-white"
                )}
              >
                {TAB_LABEL[v]}
              </button>
            ))}
          </div>
        </div>

        <div className="flex">
          {/* sidebar */}
          <div className="hidden w-40 shrink-0 border-r border-mist-line p-4 md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/logo.webp")} alt="" className="mb-6 h-5 w-auto" />
            {SIDEBAR.map((item) => {
              const active = SIDEBAR_ACTIVE[view] === item;
              return (
                <div
                  key={item}
                  className={clsx(
                    "mb-1 rounded-md px-3 py-2 text-xs transition-colors duration-300",
                    active ? "font-medium text-white" : "text-mist"
                  )}
                  style={active ? { backgroundColor: "rgba(255,10,34,0.12)" } : undefined}
                >
                  {item}
                </div>
              );
            })}
          </div>

          {/* content */}
          <div ref={content} className="min-w-0 flex-1 p-4 md:p-5">
            {/* KPI row */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {KPIS[view].map((k) => (
                <div key={k.label} data-dv className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-[0.6rem] uppercase tracking-wider text-mist">{k.label}</div>
                  <div className="mt-1.5 font-display text-xl text-white md:text-2xl">{k.value}</div>
                  <div className="mt-0.5 text-[0.62rem] text-signal-crimson">{k.trend}</div>
                </div>
              ))}
            </div>

            {/* view body */}
            <div data-dv className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-4">
              {view === "bookings" && (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-mist-bright">Booking queue</span>
                    <span className="flex items-center gap-1.5 text-[0.6rem] text-mist">
                      <span className="h-1.5 w-1.5 rounded-full bg-signal-red animate-blink" /> Live
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {BOOKINGS.map((b) => (
                      <div key={b.who} className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[0.7rem] font-medium text-mist-bright">{b.who}</div>
                          <div className="text-[0.62rem] text-mist-dim">{b.lane}</div>
                        </div>
                        <span className="hidden text-[0.65rem] text-mist sm:block">{b.kg}</span>
                        <Chip
                          label={b.status}
                          tone={b.status === "AWB issued" ? "bright" : b.status === "Confirmed" ? "red" : "dim"}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === "capacity" && (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-mist-bright">Flight capacity · next 7 days</span>
                    <span className="text-[0.6rem] text-mist">load factor</span>
                  </div>
                  <div className="space-y-3">
                    {FLIGHTS.map((f) => (
                      <div key={f.flt} className="flex items-center gap-3">
                        <span className="w-14 text-[0.68rem] font-medium text-mist-bright">{f.flt}</span>
                        <span className="hidden w-24 text-[0.62rem] text-mist-dim sm:block">{f.lane}</span>
                        <span className="w-16 text-[0.62rem] text-mist">{f.day}</span>
                        <div
                          className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full"
                          style={{ backgroundColor: "rgba(255,255,255,0.08)" }}
                        >
                          <div
                            className={clsx("h-full rounded-full", f.pct >= 85 ? "bg-signal-gradient" : "bg-white/30")}
                            style={{ width: `${f.pct}%`, backgroundColor: f.pct >= 85 ? undefined : "rgba(255,255,255,0.3)" }}
                          />
                        </div>
                        <span className={clsx("w-9 text-right text-[0.65rem]", f.pct >= 85 ? "text-signal-crimson" : "text-mist")}>
                          {f.pct}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {view === "settlement" && (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-mist-bright">CASS cycle 2 · closes in 6 days</span>
                    <span className="text-[0.6rem] text-signal-crimson">96% reconciled</span>
                  </div>
                  <div className="space-y-2.5">
                    {INVOICES.map((r) => (
                      <div key={r.awb} className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[0.7rem] font-medium text-mist-bright">{r.awb}</div>
                        </div>
                        <span className="text-[0.65rem] text-mist">{r.amt}</span>
                        <Chip label={r.ok ? "Reconciled" : "In review"} tone={r.ok ? "red" : "dim"} />
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.08)" }}>
                    <div className="h-full w-[96%] rounded-full bg-signal-gradient" />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* soft red floor glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 h-28 w-[70%] -translate-x-1/2 rounded-full blur-[80px] will-change-transform"
        style={{ background: "rgba(255,10,34,0.12)" }}
      />
    </div>
  );
}
