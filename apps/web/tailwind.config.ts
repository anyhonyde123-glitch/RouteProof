import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0a0f1a",
          900: "#0f1729",
          800: "#152238",
          700: "#1e3050",
        },
        slate: {
          brand: "#1a2332",
          muted: "#8896ab",
        },
        amber: {
          brand: "#f59e0b",
          glow: "#fb923c",
          deep: "#d97706",
        },
      },
      fontFamily: {
        display: ["var(--font-outfit)", "sans-serif"],
        body: ["var(--font-source-sans)", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)",
        "hero-radial":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(245,158,11,0.12), transparent 60%), radial-gradient(ellipse 50% 40% at 90% 20%, rgba(30,48,80,0.5), transparent 50%)",
      },
      backgroundSize: {
        grid: "48px 48px",
      },
      boxShadow: {
        glow: "0 0 40px rgba(245,158,11,0.15)",
        card: "0 4px 24px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
