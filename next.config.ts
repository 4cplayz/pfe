import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* your existing config */
  typescript: {
    // This will ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
