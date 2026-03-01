/** @type {import('next').NextConfig} */
const path = require("path");

const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["@supabase/ssr"] = path.resolve(__dirname, "lib/supabase/ssr.ts");
    return config;
  },
};

module.exports = nextConfig;
