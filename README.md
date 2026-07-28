# Kargo360 — Redesign

A modern, animation-rich redesign of [kargo360.ai](https://kargo360.ai) — the next-gen SaaS platform for air cargo logistics.

Content is carried over 1:1 from the existing site; the design, motion, and front-end stack are entirely new.

## Design direction — "Control Tower"

The visual language borrows from flight telemetry and cargo-tracking control rooms — the brand's **"360°"** becomes a literal orbital flight-path visualization with a live cargo pulse and radar sweep.

- **Palette** (derived from the current site): `#0a0b0f` ink base · crimson `#ff0033` → amber `#ffa800` "signal" gradient, reserved for live/active elements only.
- **Type:** Clash Display (headlines) · Satoshi (body) · Space Mono (telemetry labels & data).
- **Motion:** Lenis smooth scroll, GSAP ScrollTrigger — masked text reveals, a pinned horizontal product scroll, an orbiting value-chain, an animated 85% counter, magnetic buttons, and a custom telemetry cursor. All motion respects `prefers-reduced-motion`.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling (design tokens in `tailwind.config.ts`)
- **GSAP** + **ScrollTrigger** for animation
- **Lenis** for smooth scroll

## Getting started

Requires **Node.js 18.18+** (or 20+). If you don't have Node:

```bash
# install nvm, then Node LTS
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
nvm install --lts
```

Then, from the project root:

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Build for production

```bash
npm run build
npm start
```

## Project structure

```
app/
  layout.tsx              Root layout — fonts, cursor, smooth scroll, nav
  page.tsx                Landing page (assembles the sections)
  globals.css             Design tokens, base styles, utilities
  products/[slug]/        Statically-generated product pages (x4)
components/
  sections/               Hero, Marquee, Products, ValueChain, Features
  FlightPath.tsx          Signature orbital flight-path visual
  SmoothScroll.tsx        Lenis + GSAP integration
  Nav.tsx / Footer.tsx
  Cursor.tsx / Magnetic.tsx / Reveal.tsx / RevealText.tsx / StatCounter.tsx
  ProductTemplate.tsx     Shared product-page template
lib/
  content.ts              All copy, sourced from the existing kargo360.ai
  gsap.ts                 GSAP + plugin registration
```

## Content

All product names, descriptions, stakeholder categories, feature benefits, stats,
and contact details live in `lib/content.ts` and are lifted from the current site:
the four products (**360 Kargoscape · Kommerce · Kontrol · Konnect**), the 8 value-chain
stakeholders, the 8 feature benefits, and the "85% support reduction" stat.

## Optional: 21st.dev Magic MCP

`.mcp.json` registers the [21st.dev Magic](https://21st.dev/magic) MCP server for
AI-assisted component generation. It reads your key from the `MAGIC_API_KEY`
environment variable — set it before starting Claude Code:

```bash
export MAGIC_API_KEY="your-21st-dev-api-key"
```

## Notes

- Fonts load from Fontshare (Clash Display, Satoshi) and Google Fonts (Space Mono) at runtime.
- The horizontal product scroll and orbit rotation are desktop-only; mobile falls back to a clean vertical stack.
