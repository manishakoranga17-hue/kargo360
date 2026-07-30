// All copy sourced from the existing kargo360.ai site, restructured for the redesign.

export const brand = {
  name: "Kargo360",
  tagline: "Revolutionizing Air Cargo",
  domain: "kargo360.ai",
};

export const hero = {
  eyebrow: "// Real-time visibility · Air cargo value chain",
  headlineLead: "Revolutionizing",
  headlineSignal: "Air Cargo",
  headlineTail: "End to End.",
  sub: "Manage and gain real-time visibility into your complete cargo value chain — the next-gen SaaS platform for faster, smarter logistics.",
  primaryCta: { label: "Get in touch", href: "#contact" },
  secondaryCta: { label: "Explore the suite", href: "#products" },
  stats: [
    { value: 85, suffix: "%", label: "Support effort reduced" },
    { value: 8, suffix: "", label: "Stakeholder categories" },
    { value: 5, suffix: "-step", label: "Onboarding" },
  ],
};

export type Product = {
  slug: string;
  key: string; // the K-word
  name: string; // full "360 K—"
  scope: string;
  short: string;
  long: string;
  points: string[];
  accent: "crimson" | "amber";
};

export const products: Product[] = [
  {
    slug: "kargoscape",
    key: "Kargoscape",
    name: "360 Kargoscape",
    scope: "Airport-to-Airport",
    short:
      "Cloud-based logistics services tailored for airport-to-airport air cargo operations.",
    long: "Cloud-based solution providing comprehensive logistics services tailored for Airport to Airport.",
    points: [
      "Airport-to-airport operational visibility",
      "Airline & ground-handler coordination",
      "Real-time shipment status",
      "Cloud-native, always available",
    ],
    accent: "crimson",
  },
  {
    slug: "kommerce",
    key: "Kommerce",
    name: "360 Kommerce",
    scope: "Door-to-Door",
    short:
      "Cloud-based logistics services tailored for door-to-door delivery across the value chain.",
    long: "Cloud-based solution providing comprehensive logistics services tailored for Door to Door.",
    points: [
      "Door-to-door orchestration",
      "First-mile & last-mile partners",
      "Unified booking to delivery",
      "Pay-as-you-go economics",
    ],
    accent: "amber",
  },
  {
    slug: "kontrol",
    key: "Kontrol",
    name: "360 Kontrol",
    scope: "Customer Portal",
    short:
      "An advanced portal that lets your customers manage their accounts conveniently.",
    long: "Advanced portal allowing your customers to manage their accounts conveniently.",
    points: [
      "Self-service customer accounts",
      "Live shipment & document access",
      "Cuts support effort by up to 85%",
      "Branded, secure experience",
    ],
    accent: "crimson",
  },
  {
    slug: "konnect",
    key: "Konnect",
    name: "360 Konnect",
    scope: "API Suite",
    short:
      "A range of API services to search, book and track shipments programmatically.",
    long: "Range of API services enables customers to search, book, and track shipments.",
    points: [
      "Search, book & track via API",
      "Partner & system integrations",
      "Developer-first documentation",
      "Scales with your volume",
    ],
    accent: "amber",
  },
];

export type Solution = {
  slug: string;
  name: string;
  scope: string;
  heroKicker: string;
  heroTitle: [string, string]; // two headline lines; second gets the red accent
  short: string;
  long: string;
  points: string[];
  pillars: { title: string; blurb: string }[];
  /** "the old way" problem section, rendered right below the hero */
  pains?: {
    heading: string;
    intro: string;
    items: {
      title: string;
      blurb: string;
      /** mono technical label shown on the card's diagram */
      tag: string;
      graphic: "manual" | "lag" | "silo" | "versions" | "leak" | "tickets";
    }[];
  };
  /** "how we fix it" section, mirrors pains one-for-one */
  fixes?: {
    heading: string;
    intro: string;
    items: {
      title: string;
      blurb: string;
      replaces: string;
      /** mono technical label shown on the card's diagram */
      tag: string;
      graphic: "booking" | "dashboard" | "network" | "rates" | "settlement" | "portal";
    }[];
  };
  /** live dashboard showcase section (GSA cockpit) */
  dashboard?: {
    heading: string;
    intro: string;
  };
  /** circuit-board "how the GSA model works" section */
  model?: {
    heading: string;
    intro: string;
  };
  /** hero video — set `src` (and optionally `poster`) when the film is ready */
  video?: {
    title: string;
    duration?: string;
    src?: string;
    poster?: string;
  };
};

export const solutions: Solution[] = [
  {
    slug: "gsa-services",
    name: "GSA Services",
    scope: "General Sales Agent",
    heroKicker: "The time to transform is now with Kargo360.",
    heroTitle: ["The GSA business,", "Reimagined."],
    short:
      "End-to-end cargo General Sales Agent services for airlines — sales, operations and settlement, powered by the 360 platform.",
    long: "Kargo360 represents airlines in the market as their cargo General Sales Agent — selling capacity, managing reservations and customer relationships, and running day-to-day cargo operations, all backed by our own real-time technology suite.",
    points: [
      "Cargo capacity sales & marketing for airlines",
      "Reservations, bookings & rate management",
      "Market representation & customer relationships",
      "Operations coordination with ground handlers",
      "Revenue accounting & settlement support",
    ],
    pains: {
      heading: "Is Your GSA Still Working This Way?",
      intro:
        "Most GSA operations still run the way they did twenty years ago — manual, opaque, and expensive to scale.",
      items: [
        {
          title: "Bookings over phone & email",
          blurb:
            "Every booking chases a phone call or an email thread — then gets re-typed into a spreadsheet anyway.",
          tag: "Manual intake",
          graphic: "manual",
        },
        {
          title: "Month-end visibility",
          blurb:
            "Airlines see how their capacity performed when the monthly report lands — weeks after the freight has flown.",
          tag: "Reporting lag",
          graphic: "lag",
        },
        {
          title: "Disconnected systems",
          blurb:
            "Sales in one tool, operations in another, accounting in a third. Nothing talks to anything.",
          tag: "Siloed stack",
          graphic: "silo",
        },
        {
          title: "Rates buried in inboxes",
          blurb:
            "Pricing lives in PDFs and email chains, so quoting is slow and inconsistent across the market.",
          tag: "Version chaos",
          graphic: "versions",
        },
        {
          title: "Revenue leakage",
          blurb:
            "Un-reconciled AWBs, missed CASS deadlines and billing disputes quietly eat into margin.",
          tag: "Silent leakage",
          graphic: "leak",
        },
        {
          title: "Support-heavy service",
          blurb:
            "Every status check is a call your team has to answer — again and again, shipment after shipment.",
          tag: "Ticket treadmill",
          graphic: "tickets",
        },
      ],
    },
    fixes: {
      heading: "The Kargo360 Way.",
      intro:
        "We rebuilt the GSA model on our own technology — so every one of those problems has a systematic answer.",
      items: [
        {
          title: "Book on the platform",
          blurb:
            "Search, quote and book on the 360 platform — every booking captured once, instantly, with nothing re-typed.",
          replaces: "Bookings over phone & email",
          tag: "Booking engine",
          graphic: "booking",
        },
        {
          title: "Live performance dashboards",
          blurb:
            "Airlines watch capacity, volumes and yields in real time on the 360 dashboard — not weeks later in a report.",
          replaces: "Month-end visibility",
          tag: "Live telemetry",
          graphic: "dashboard",
        },
        {
          title: "One connected system",
          blurb:
            "Sales, operations and accounting run on a single platform, so every stakeholder works from the same truth.",
          replaces: "Disconnected systems",
          tag: "Unified data layer",
          graphic: "network",
        },
        {
          title: "Centralised rate management",
          blurb:
            "Rates are managed centrally and quoted consistently — everyone prices from the same live source.",
          replaces: "Rates buried in inboxes",
          tag: "Rate engine",
          graphic: "rates",
        },
        {
          title: "Airtight settlement",
          blurb:
            "Every AWB is tracked from booking to billing with automated reconciliation — no more silent margin loss.",
          replaces: "Revenue leakage",
          tag: "Auto-reconciliation",
          graphic: "settlement",
        },
        {
          title: "Self-service for customers",
          blurb:
            "360 Kontrol gives customers live tracking and documents on their own — cutting support effort by up to 85%.",
          replaces: "Support-heavy service",
          tag: "360 Kontrol",
          graphic: "portal",
        },
      ],
    },
    dashboard: {
      heading: "Every Process. One Screen.",
      intro:
        "Quotes, bookings, capacity and settlement — the whole GSA operation runs live in the 360 cockpit, visible to you and your airlines at every moment.",
    },
    video: {
      title: "Watch: The GSA business, reimagined",
      duration: "2:30",
    },
    model: {
      heading: "Your airline. Our network. One platform.",
      intro:
        "As your General Sales Agent, Kargo360 plugs your airline into the entire cargo market — bookings, operations and settlement all flow through one live system.",
    },
    pillars: [
      {
        title: "Tech-Native GSA",
        blurb:
          "Unlike traditional agents, every booking, shipment and settlement runs on the 360 platform — giving airlines live visibility instead of end-of-month reports.",
      },
      {
        title: "Full Value-Chain Reach",
        blurb:
          "From forwarders to ground handlers to last-mile partners, we already connect the stakeholders your cargo touches.",
      },
      {
        title: "Revenue, Managed",
        blurb:
          "Pricing, capacity and settlement handled end-to-end, so your cargo revenue grows without growing your overhead.",
      },
    ],
  },
];

export const stakeholders = [
  "Airlines",
  "Ground Handlers",
  "Sales Agents",
  "Truck Operators",
  "First-Mile Partners",
  "Last-Mile Partners",
  "End Customers",
  "Service Providers",
];

export type Feature = { title: string; blurb: string };

export const features: Feature[] = [
  {
    title: "Effortless Integration",
    blurb: "Slot into your existing stack and partner network without friction.",
  },
  {
    title: "Limitless Scalability",
    blurb: "From a single route to a global network — capacity grows with you.",
  },
  {
    title: "Reliable Performance",
    blurb: "Cloud-native architecture engineered for always-on operations.",
  },
  {
    title: "Simplified Transactions",
    blurb: "Booking to settlement, streamlined across every stakeholder.",
  },
  {
    title: "Seamless Mobility",
    blurb: "Full operational visibility from any device, anywhere.",
  },
  {
    title: "Enhanced Security",
    blurb: "Enterprise-grade protection for your data and your customers'.",
  },
  {
    title: "Tailored for Success",
    blurb: "Configured to the way your cargo business actually runs.",
  },
  {
    title: "Easy to Use",
    blurb: "Powerful underneath, effortless on the surface.",
  },
];

export const valueChain = {
  eyebrow: "// 360° value chain",
  title: "One platform. Every stakeholder.",
  body: "Kargo360 connects all eight categories of the air cargo value chain into a single real-time operating picture — so everyone works from the same truth.",
};

export const closingCta = {
  eyebrow: "Get started with 360",
  title: ["Start Your Journey To", "Streamlined Logistics Now"],
  body: "Unlock efficiency with Kargo360's cutting-edge platform today!",
  cta: { label: "Get In Touch", href: "#contact" },
  steps: [
    "Get in touch and start your journey",
    "Provide your business details and operational requirements",
    "Receive a prompt response from our dedicated team",
    "Collaborate to tailor a solution aligned with your objectives",
    "Unlock efficiency with Kargo360's cutting-edge platform",
  ],
};

export const nav = {
  products: products.map((p) => ({
    label: p.name,
    href: `/products/${p.slug}`,
    scope: p.scope,
  })),
  solutions: solutions.map((s) => ({
    label: s.name,
    href: `/solutions/${s.slug}`,
    scope: s.scope,
  })),
  links: [{ label: "Get in touch", href: "#contact" }],
};

export const footer = {
  productLinks: products.map((p) => ({
    label: p.name,
    href: `/products/${p.slug}`,
  })),
  companyLinks: [
    { label: "About Us", href: "#" },
    { label: "Get in touch", href: "#contact" },
    { label: "Terms & Conditions", href: "#" },
    { label: "Privacy Policy", href: "#" },
  ],
  contact: {
    address: "B-1 Kalindi Colony, East of Kailash, Phase-1, Delhi 110065",
    email: "naveen.shandilya@kargo360tech.com",
    linkedin: "#",
  },
  copyright: "2024 Kargo360. All rights reserved.",
};
