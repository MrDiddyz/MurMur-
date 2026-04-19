/** @type {import('next').NextConfig} */
const path = require("node:path");

const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@core": path.resolve(__dirname, "../../../core"),
    };
    return config;
  },
};

module.exports = nextConfig;
