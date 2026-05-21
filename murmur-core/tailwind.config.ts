import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        murmur: {
          black: "#070707",
          graphite: "#151515",
          gold: "#b38a3d",
          copper: "#8e6732"
        }
      }
    }
  },
  plugins: []
};

export default config;
