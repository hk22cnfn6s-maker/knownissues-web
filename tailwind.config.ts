import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./emails/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        "text-primary": "var(--color-text-primary)",
        "text-secondary": "var(--color-text-secondary)",
        "text-muted": "var(--color-text-muted)",
        accent: "var(--color-accent)",
        "accent-hover": "var(--color-accent-hover)",
        border: "var(--color-border)",
        "dark-surface": "var(--color-dark-surface)",
      },
      fontFamily: {
        heading: ["var(--font-playfair)", "Georgia", "serif"],
        body: ["var(--font-inter)", "Arial", "Helvetica", "sans-serif"],
      },
      fontSize: {
        h1: ["56px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h2: ["36px", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        h3: ["24px", { lineHeight: "1.25", letterSpacing: "-0.02em" }],
        h4: ["20px", { lineHeight: "1.3", letterSpacing: "-0.02em" }],
      },
      borderRadius: {
        sm: "4px",
      },
    },
  },
  plugins: [],
};
export default config;
