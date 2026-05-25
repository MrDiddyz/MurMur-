const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Silence the monorepo lockfile warning in Next.js 15
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;
