"use client";

import { useRef } from "react";
import { useAnimGate } from "@/lib/useAnimGate";

/** live-ops data feed strip — scrolls under the GSA hero */
const FEED = [
  "AWB 176-4821 3094 · DXB → FRA · Booked",
  "Quote → Booking · 38s",
  "CASS Reconciliation · 100% Matched",
  "Capacity Update · +2.4t · Live",
  "e-AWB Issued · 618-7743 9921",
  "Rate Sync · 214 Lanes · 0 Conflicts",
  "Airline Dashboard · Yield +6.2%",
  "Kontrol Portal · 85% Self-Serve",
];

export default function TelemetryTicker() {
  const root = useRef<HTMLDivElement>(null);
  useAnimGate(root);
  const row = [...FEED, ...FEED];

  return (
    <div
      ref={root}
      className="relative overflow-hidden border-y border-mist-line bg-ink-950 py-3.5"
      aria-hidden
    >
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <ul className="flex shrink-0 animate-marquee-slow items-center gap-8 pr-8">
          {row.map((item, i) => (
            <li
              key={i}
              className="flex items-center gap-8 whitespace-nowrap font-mono text-[0.62rem] uppercase tracking-[0.18em] text-mist-dim"
            >
              <span className="flex items-center gap-2.5">
                <span className="inline-block h-1 w-1 rounded-full bg-signal-red/70" />
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
