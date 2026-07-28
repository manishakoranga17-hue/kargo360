"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { footer, brand } from "@/lib/content";
import { registerGsap, gsap, prefersReducedMotion } from "@/lib/gsap";
import RevealText from "./RevealText";
import Magnetic from "./Magnetic";
import HexFloor from "./HexFloor";
import { withBase } from "@/lib/asset";

/**
 * Closer + footer — giant centered call-to-action over a glowing 3D hex-tile
 * floor, with the footer as a rounded card floating on the same floor.
 */
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsap();
    const el = root.current;
    if (!el) return;

    const fade = el.querySelectorAll("[data-bfade]");
    const card = el.querySelector("[data-bcard]");

    if (prefersReducedMotion()) {
      gsap.set([fade, card], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        fade,
        { opacity: 0, y: 22 },
        {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 70%", once: true },
        }
      );
      gsap.fromTo(
        card,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 88%", once: true },
        }
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <footer ref={root} id="contact" className="relative overflow-hidden bg-ink-950">
      {/* ===== 3D floating hex-tile floor (spans CTA + footer card) ===== */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[72%] overflow-hidden">
        <HexFloor />
        {/* the floor emerges out of darkness */}
        <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-ink-950 via-ink-950/70 to-transparent" />
      </div>

      {/* ===== CTA ===== */}
      <div className="shell relative z-10 pb-16 pt-24 text-center md:pb-24 md:pt-32">
        <div data-bfade className="mb-5 text-sm font-medium text-mist opacity-0">
          The next gen system for faster, smarter logistics
        </div>
        <h2 className="text-5xl leading-[1.02] sm:text-6xl md:text-7xl">
          <RevealText text="See Kargo360" by="word" />{" "}
          <span className="text-signal">
            <RevealText text="in Action" by="word" delay={0.12} />
          </span>
        </h2>
        <div data-bfade className="mt-10 opacity-0">
          <Magnetic strength={0.45}>
            <a
              href={`mailto:${footer.contact.email}`}
              data-cursor
              className="group inline-flex items-center gap-2.5 rounded-full border border-signal-red/60 bg-ink-900/80 px-9 py-4 text-lg font-medium text-white shadow-[0_0_44px_-8px_rgba(255,10,34,0.6)] backdrop-blur-sm transition-colors duration-300 hover:bg-signal-red"
            >
              Get In Touch
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </Magnetic>
        </div>
      </div>

      {/* ===== footer card floating on the floor ===== */}
      <div className="shell relative z-10 pb-8 md:pb-10">
        <div
          data-bcard
          className="rounded-3xl border border-mist-line bg-ink-900/90 p-8 opacity-0 backdrop-blur-xl md:p-12"
        >
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* brand */}
            <div>
              <Link href="/" className="inline-flex items-center" aria-label="Kargo360 home">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={withBase("/logo.webp")} alt="Kargo360" className="h-8 w-auto" />
              </Link>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-mist">
                {footer.contact.address}
              </p>
              <a
                href={`mailto:${footer.contact.email}`}
                className="mt-4 inline-block text-sm font-medium text-signal-crimson transition-colors hover:text-white"
              >
                Contact Us
              </a>
            </div>

            {/* products */}
            <div>
              <div className="mb-4 text-sm text-mist-dim">Products</div>
              <ul className="space-y-2.5">
                {footer.productLinks.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-mist-bright transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* company */}
            <div>
              <div className="mb-4 text-sm text-mist-dim">Company</div>
              <ul className="space-y-2.5">
                {footer.companyLinks.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-sm text-mist-bright transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* connect */}
            <div>
              <div className="mb-4 text-sm text-mist-dim">Connect</div>
              <ul className="space-y-2.5">
                <li>
                  <a
                    href={`mailto:${footer.contact.email}`}
                    className="break-all text-sm text-mist-bright transition-colors hover:text-white"
                  >
                    {footer.contact.email}
                  </a>
                </li>
                <li>
                  <Link
                    href={footer.contact.linkedin}
                    className="text-sm text-mist-bright transition-colors hover:text-white"
                  >
                    LinkedIn ↗
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-mist-line pt-6 text-xs text-mist-dim sm:flex-row sm:items-center">
            <span>© {footer.copyright}</span>
            <span>{brand.domain}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
