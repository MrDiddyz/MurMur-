/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ["@murmur/db"]
  }
};

export default nextConfig;
