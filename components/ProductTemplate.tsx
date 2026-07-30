"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { Product } from "@/lib/content";
import { products } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import Footer from "@/components/Footer";
import Reveal from "@/components/Reveal";
import Magnetic from "@/components/Magnetic";

export default function ProductTemplate({ product }: { product: Product }) {
  const root = useRef<HTMLDivElement>(null);
  const others = products.filter((p) => p.slug !== product.slug);

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
      <section className="relative overflow-hidden bg-ink-900 pt-40 pb-24 md:pt-48 md:pb-32 noise">
        <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" />
        <div
          className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full blur-[120px] will-change-transform"
          style={{ background: "rgba(255,10,34,0.13)" }}
        />
        <div className="shell relative">
          <Link href="/#products" className="eyebrow mb-8 inline-flex items-center gap-2 hover:text-white" data-cursor>
            ← All products
          </Link>

          <div data-pfade className="mb-6 flex items-center gap-3">
            <span className="rounded-full border border-mist-line px-3 py-1 font-mono text-[0.65rem] uppercase tracking-widest text-mist">
              {product.scope}
            </span>
          </div>

          <h1 className="max-w-[14ch] text-[clamp(2.75rem,9vw,7rem)] font-semibold leading-[0.9]">
            <span data-pline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
              <span className="block will-change-transform">360</span>
            </span>
            <span data-pline className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
              <span className="block will-change-transform text-signal">
                {product.key}
              </span>
            </span>
          </h1>

          <p data-pfade className="mt-8 max-w-xl text-lg leading-relaxed text-mist md:text-xl">
            {product.long}
          </p>

          <div data-pfade className="mt-10">
            <Magnetic>
              <Link href="#contact" className="btn-signal" data-cursor>
                Get in touch <span aria-hidden>→</span>
              </Link>
            </Magnetic>
          </div>
        </div>
      </section>

      {/* capability list */}
      <section className="border-y border-mist-line bg-ink-800 py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <div className="eyebrow mb-4">// Capabilities</div>
            <h2 className="text-3xl md:text-4xl">What {product.key} Does.</h2>
            <p className="mt-4 max-w-sm text-mist">{product.short}</p>
          </div>
          <Reveal stagger className="divide-y divide-mist-line border-t border-mist-line">
            {product.points.map((pt, i) => (
              <div key={pt} className="group flex items-baseline gap-6 py-6">
                <span className="text-xs font-medium text-signal-red">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-xl text-white transition-transform duration-300 group-hover:translate-x-2 md:text-2xl">
                  {pt}
                </span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* cross-sell */}
      <section className="bg-ink-900 py-20 md:py-28 noise">
        <div className="shell">
          <div className="eyebrow mb-8">// Explore the rest of the suite</div>
          <div className="grid gap-4 md:grid-cols-3">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className="panel group p-7"
                data-cursor
              >
                <span className="font-mono text-[0.65rem] uppercase tracking-widest text-mist">{p.scope}</span>
                <h3 className="mt-6 text-2xl md:text-3xl">
                  360 <span className="text-signal">{p.key}</span>
                </h3>
                <span className="mt-6 inline-flex items-center gap-2 text-sm text-mist-bright">
                  Know more
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
