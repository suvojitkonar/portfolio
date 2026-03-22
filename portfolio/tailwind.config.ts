import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        muted: "hsl(var(--muted) / <alpha-value>)",
        accent: "hsl(var(--accent) / <alpha-value>)",
        card: "hsl(var(--card) / <alpha-value>)",
      },
      boxShadow: {
        neo: "4px 4px 0px 0px hsl(var(--border))",
        "neo-sm": "2px 2px 0px 0px hsl(var(--border))",
        "neo-lg": "6px 6px 0px 0px hsl(var(--border))",
      },
    },
  },
  plugins: [],
};

export default config;
