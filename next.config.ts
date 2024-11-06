import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enforces best practices during development.
  images: {
    domains: ["example.com"], // Add domains to allow external image optimization.
  },
  webpack: (config) => {
    // You can add custom webpack configuration here if needed.
    return config;
  },
};

export default nextConfig;
