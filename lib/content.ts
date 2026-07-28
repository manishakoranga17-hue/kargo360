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
