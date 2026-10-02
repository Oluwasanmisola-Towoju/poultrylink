import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary: { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted: { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        card: { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        egg: "hsl(var(--egg))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        head: ["var(--font-head)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      keyframes: {
        peck: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "35%": { transform: "translateY(6px) rotate(-4deg)" },
          "55%": { transform: "translateY(0) rotate(0deg)" },
        },
        lookup: { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(-14deg)" } },
        popin: {
          "0%": { opacity: "0", transform: "scale(.85) translateY(10px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        crackshake: {
          "0%,100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-3deg)" },
          "75%": { transform: "rotate(3deg)" },
        },
        floatslow: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
      },
      animation: {
        peck: "peck 1.4s ease-in-out infinite",
        popin: "popin .5s ease-out both",
        crackshake: "crackshake .5s ease-in-out 2",
        floatslow: "floatslow 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;