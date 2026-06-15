import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#0B0B0F", soft: "#1a1a22" },
        brand: { DEFAULT: "#FF3D5A", dark: "#D62742", light: "#FFE5EA" },
        accent: { DEFAULT: "#FFD60A" },
        muted: { DEFAULT: "#6B7280", soft: "#F3F4F6" }
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Inter"]
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "marquee": "marquee 30s linear infinite",
        "slide-up": "slideUp 0.4s ease-out"
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
