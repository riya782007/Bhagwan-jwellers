import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm near-black, drawn from the Bhagwan "BJ" monogram
        ink: { DEFAULT: "#14110E", soft: "#3A332B" },
        // Champagne gold — the heritage accent
        gold: { DEFAULT: "#C5A150", dark: "#A8842F", light: "#EADCAA" },
        // Ivory / cream backgrounds
        ivory: { DEFAULT: "#FAF6EF", soft: "#F2ECE1" },
        // Bridal accent (deep wine, from Polki settings)
        wine: { DEFAULT: "#6E2433", dark: "#511826" },
        muted: { DEFAULT: "#8A8175", soft: "#F2ECE1" },
        // Back-compat aliases so legacy admin/cart classes stay on-palette
        brand: { DEFAULT: "#6E2433", dark: "#511826", light: "#F3E7E9" },
        accent: { DEFAULT: "#C5A150" }
      },
      fontFamily: {
        serif: ["var(--font-cormorant)", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"]
      },
      letterSpacing: { luxe: "0.18em" },
      animation: {
        "marquee": "marquee 32s linear infinite",
        "slide-up": "slideUp 0.5s ease-out"
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        slideUp: { "0%": { transform: "translateY(20px)", opacity: "0" }, "100%": { transform: "translateY(0)", opacity: "1" } }
      }
    }
  },
  plugins: []
};

export default config;
