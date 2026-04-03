import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#070707",
        panel: "#121212",
        panelSoft: "#171717",
        gold: "#d4af37",
        goldSoft: "#a8872f",
        text: "#f4f4f5",
        muted: "#9ca3af",
        danger: "#ef4444",
      },
      boxShadow: {
        luxe: "0 8px 30px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        xl2: "1.1rem",
      },
    },
  },
  plugins: [],
};

export default config;
