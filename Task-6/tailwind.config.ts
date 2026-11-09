import type { Config } from "tailwindcss";
import { palette } from "./src/lib/palette";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ...palette },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
      },
      keyframes: {
        "menu-in": {
          from: { opacity: "0", transform: "translateY(-6px) scale(0.98)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "menu-in": "menu-in 160ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
