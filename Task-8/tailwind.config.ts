import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ground: "#0a1020",
        surface: "#141d30",
        raised: "#0f1829",
        border: "#26334d",
        rule: "#22304a",
        ink: "#e7edf7",
        muted: "#a6b4c9",
        faint: "#8a9ab3",
        primary: "#e7edf7",
        "primary-hover": "#cbd6e8",
        accent: "#7b93ff",
        positive: "#3fcf8e",
        "positive-bg": "#12352a",
        "positive-ink": "#86efc0",
        negative: "#f7798a",
        "negative-bg": "#3a1822",
        "negative-ink": "#fda4b0",
        notice: "#a78bfa",
        "notice-bg": "#2a2252",
        "notice-border": "#4a3d8f",
        "info": "#7b93ff",
        "info-bg": "#1b2650",
        "info-ink": "#b4c2ff",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.35), 0 1px 1px rgba(0,0,0,0.25)",
        lift: "0 14px 30px -10px rgba(0,0,0,0.6), 0 2px 6px rgba(0,0,0,0.35)",
        panel: "0 8px 24px -14px rgba(0,0,0,0.6)",
      },
      fontFamily: {
        sans: ["Figtree", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "Figtree", "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        control: "8px",
        chip: "999px",
      },
    },
  },
  plugins: [],
} satisfies Config;
