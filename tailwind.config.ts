import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        murmur: {
          black: "#090909",
          graphite: "#141414",
          gold: "#C7A96B",
          copper: "#A87745"
        }
      }
    }
  },
  plugins: []
};

export default config;
