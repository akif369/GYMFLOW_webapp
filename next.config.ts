import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    '192.168.1.35'
  ],
};

export default nextConfig;