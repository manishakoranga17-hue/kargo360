import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // near-black charcoal base (doss-like, tuned to Kargo black)
        ink: {
          DEFAULT: "#0c0c0e",
          950: "#0a0a0c",
          900: "#0c0c0e",
          800: "#111114",
          700: "#16161a",
          600: "#1d1d22",
          500: "#26262d",
        },
        // brand red — sampled from the Kargo360 logo. No orange, ever.
        signal: {
          DEFAULT: "#ff0a22",
          red: "#ff0a22",
          crimson: "#ff2f45", // lighter red for secondary accents (was amber)
          deep: "#c8001b",
          dark: "#7a0012",
        },
        paper: "#ece7df", // warm off-white for light pill buttons (doss-style)
        mist: {
          DEFAULT: "#8a8a94",
          bright: "#c9c9d2",
          dim: "#5a5a64",
          line: "#232329",
        },
      },
      fontFamily: {
        // single clean grotesque, used everywhere (doss uses PP Neue Montreal)
        sans: ['"Switzer"', "system-ui", "-apple-system", "sans-serif"],
        display: ['"Switzer"', "system-ui", "sans-serif"],
        mono: ['"Switzer"', "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.03em",
        tighter2: "-0.02em",
        widest2: "0.24em",
      },
      maxWidth: {
        shell: "1440px",
      },
      backgroundImage: {
        // red-only gradients
        "signal-gradient": "linear-gradient(120deg, #ff2f45 0%, #ff0a22 45%, #c8001b 100%)",
        "signal-deep": "linear-gradient(150deg, #ff1a30 0%, #b00016 55%, #2a0208 100%)",
        "signal-soft": "linear-gradient(120deg, rgba(255,10,34,0.16) 0%, rgba(200,0,27,0.05) 100%)",
      },
      keyframes: {
        "marquee-x": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
        "radar-spin": {
          from: { transform: "rotate(0deg)" },
          to: { transform: "rotate(360deg)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.25" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        marquee: "marquee-x 34s linear infinite",
        "marquee-slow": "marquee-x 60s linear infinite",
        radar: "radar-spin 10s linear infinite",
        blink: "blink 1.6s steps(2) infinite",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
