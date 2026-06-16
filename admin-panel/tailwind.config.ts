import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f3f0ff",
          100: "#e9e2ff",
          200: "#d6c9ff",
          300: "#b8a1ff",
          400: "#9a73ff",
          500: "#7c3aed",
          600: "#6d28d9",
          700: "#5b21b6",
        },
        candy: {
          pink: "#ff5db1",
          orange: "#ff9d4d",
          cyan: "#22d3ee",
          lime: "#a3e635",
          yellow: "#ffd84d",
        },
        ink: "#1b1140",
        mist: "#faf7ff",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 10px 40px -12px rgba(124,58,237,0.25)",
        glow: "0 20px 70px -20px rgba(255,93,177,0.45)",
        card: "0 30px 60px -25px rgba(27,17,64,0.35)",
        float: "0 40px 80px -30px rgba(27,17,64,0.45)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(120deg,#7c3aed 0%,#ff5db1 45%,#ff9d4d 100%)",
        "mesh":
          "radial-gradient(at 12% 18%, rgba(124,58,237,0.18) 0px, transparent 50%), radial-gradient(at 85% 12%, rgba(34,211,238,0.18) 0px, transparent 50%), radial-gradient(at 78% 88%, rgba(255,93,177,0.18) 0px, transparent 50%), radial-gradient(at 18% 85%, rgba(163,230,53,0.16) 0px, transparent 50%)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-26px) rotate(2deg)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatSlow: "floatSlow 9s ease-in-out infinite",
        spinSlow: "spinSlow 28s linear infinite",
        shimmer: "shimmer 6s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
