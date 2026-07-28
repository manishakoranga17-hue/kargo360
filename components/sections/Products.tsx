"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { products } from "@/lib/content";
import IsoMotif from "@/components/IsoMotif";
import ProductGraphic from "@/components/ProductGraphic";
import Magnetic from "@/components/Magnetic";

const GRAPHIC = { kargoscape: "scape", kommerce: "kommerce", kontrol: "kontrol", konnect: "konnect" } as const;

export default function Products() {
  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      blockRefs.current.forEach((b, i) => {
        if (!b) return;
        const r = b.getBoundingClientRect(); // viewport-relative → robust vs offsetParent
        const center = r.top + r.height / 2;
        const d = Math.abs(center - mid);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      setActive(best);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const jump = (i: number) => {
    blockRefs.current[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="products" className="relative bg-ink-900 py-24 md:py-32 noise">
      <div className="shell">
        {/* intro */}
        <div className="mb-16 grid gap-8 md:mb-24 md:grid-cols-2 md:items-end">
          <div>
            <div className="mb-5 flex items-center gap-3">
              <IsoMotif variant="stack" />
              <div className="eyebrow">// The suite · four K&apos;s, one platform</div>
            </div>
            <h2 className="max-w-xl text-4xl leading-[1.02] sm:text-5xl md:text-6xl">
              Streamline Your Cargo Operations
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-mist md:pb-2">
            Aggregate, track, and orchestrate your entire air cargo value chain — every stakeholder,
            every shipment — on one real-time platform.
          </p>
        </div>

        {/* sticky rail + scrolling content */}
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.55fr] lg:gap-16">
          {/* LEFT — sticky product rail */}
          <div className="hidden lg:block">
            <div className="sticky top-28 flex flex-col border-l border-mist-line">
              {products.map((p, i) => (
                <button
                  key={p.slug}
                  onClick={() => jump(i)}
                  data-cursor
                  className="group relative py-7 pl-7 pr-4 text-left"
                >
                  <span
                    className={`absolute left-[-1.5px] top-0 h-full w-[2px] origin-top transition-transform duration-500 ${
                      i === active ? "scale-y-100 bg-signal-gradient" : "scale-y-0 bg-signal-red"
                    }`}
                  />
                  <div
                    className={`font-display text-2xl transition-colors duration-300 md:text-3xl ${
                      i === active ? "text-white" : "text-mist-dim group-hover:text-mist"
                    }`}
                  >
                    360 <span className={i === active ? "text-signal" : ""}>{p.key}</span>
                  </div>
                  <div
                    className={`mt-1 text-xs uppercase tracking-widest transition-colors duration-300 ${
                      i === active ? "text-mist" : "text-mist-dim/60"
                    }`}
                  >
                    {p.scope}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — one self-contained card per product (doss-style) */}
          <div className="flex flex-col gap-8">
            {products.map((p, i) => (
              <div
                key={p.slug}
                data-index={i}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className="relative flex min-h-[84vh] flex-col justify-between overflow-hidden rounded-2xl border border-mist-line bg-ink-800/50 p-7 md:p-10"
              >
                {/* full-bleed graphic behind the content */}
                <div className="pointer-events-none absolute inset-0 grid-lines opacity-35" />
                <div className="pointer-events-none absolute inset-0">
                  <ProductGraphic type={GRAPHIC[p.slug as keyof typeof GRAPHIC]} />
                </div>
                {/* legibility scrim behind the copy */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-ink-900/85 via-ink-900/30 to-transparent" />

                {/* top: copy — exactly the old site's content */}
                <div className="relative z-10">
                  <span className="text-xs uppercase tracking-widest text-mist">{p.scope}</span>
                  <h3 className="mt-3 max-w-md text-3xl leading-[1.05] md:text-4xl">
                    360 <span className="text-signal">{p.key}</span>
                  </h3>
                  <p className="mt-5 max-w-md text-lg leading-relaxed text-mist">{p.long}</p>
                </div>

                {/* bottom: CTA pinned inside the card */}
                <div className="relative z-10 mt-10">
                  <Magnetic>
                    <Link href={`/products/${p.slug}`} className="btn-ghost bg-ink-900/70 backdrop-blur-sm" data-cursor>
                      Know more <span aria-hidden>→</span>
                    </Link>
                  </Magnetic>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
