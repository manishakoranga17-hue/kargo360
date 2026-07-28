"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { nav } from "@/lib/content";
import Magnetic from "./Magnetic";
import { withBase } from "@/lib/asset";
import clsx from "clsx";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false); // products dropdown
  const [mobile, setMobile] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hover = (v: boolean) => {
    clearTimeout(closeTimer.current);
    if (v) setOpen(true);
    else closeTimer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <header
      className={clsx(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-3" : "py-5"
      )}
    >
      <div
        className={clsx(
          "shell flex items-center justify-between rounded-full border transition-all duration-500",
          scrolled
            ? "border-mist-line bg-ink-900/90 py-2.5 backdrop-blur-xl"
            : "border-transparent"
        )}
        style={scrolled ? { maxWidth: 1180 } : undefined}
      >
        <Link href="/" className="group flex items-center" aria-label="Kargo360 home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={withBase("/logo.webp")} alt="Kargo360" className="h-7 w-auto md:h-8" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <div
            className="relative"
            onMouseEnter={() => hover(true)}
            onMouseLeave={() => hover(false)}
          >
            <button className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm text-mist-bright transition-colors hover:text-white">
              Products
              <svg width="10" height="10" viewBox="0 0 10 10" className={clsx("transition-transform", open && "rotate-180")}>
                <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" />
              </svg>
            </button>
            <div
              className={clsx(
                "absolute left-1/2 top-full w-[440px] -translate-x-1/2 pt-3 transition-all duration-300",
                open ? "visible opacity-100" : "invisible -translate-y-1 opacity-0"
              )}
            >
              <div className="grid grid-cols-2 gap-1 rounded-2xl border border-mist-line bg-ink-800/95 p-2 backdrop-blur-xl">
                {nav.products.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className="group rounded-xl p-3 transition-colors hover:bg-ink-600"
                  >
                    <div className="font-display text-[0.95rem] text-white">{p.label}</div>
                    <div className="mt-0.5 font-mono text-[0.65rem] uppercase tracking-widest text-mist">
                      {p.scope}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {nav.links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 text-sm text-mist-bright transition-colors hover:text-white"
            >
              {l.label}
            </Link>
          ))}

          <Magnetic>
            <Link href="#contact" className="btn-signal ml-2 text-sm" data-cursor>
              Get started
              <span aria-hidden>→</span>
            </Link>
          </Magnetic>
        </nav>

        {/* mobile toggle */}
        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          onClick={() => setMobile((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobile}
        >
          <span className={clsx("h-px w-6 bg-white transition-transform", mobile && "translate-y-[3.5px] rotate-45")} />
          <span className={clsx("h-px w-6 bg-white transition-transform", mobile && "-translate-y-[3.5px] -rotate-45")} />
        </button>
      </div>

      {/* mobile sheet */}
      <div
        className={clsx(
          "shell overflow-hidden transition-all duration-500 md:hidden",
          mobile ? "mt-3 max-h-[520px]" : "max-h-0"
        )}
      >
        <div className="rounded-2xl border border-mist-line bg-ink-800/95 p-4 backdrop-blur-xl">
          <div className="eyebrow mb-2">Products</div>
          {nav.products.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              onClick={() => setMobile(false)}
              className="flex items-center justify-between border-b border-mist-line py-3 last:border-0"
            >
              <span className="font-display text-white">{p.label}</span>
              <span className="font-mono text-[0.6rem] uppercase tracking-widest text-mist">{p.scope}</span>
            </Link>
          ))}
          <Link href="#contact" onClick={() => setMobile(false)} className="btn-signal mt-4 w-full justify-center">
            Get in touch <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
