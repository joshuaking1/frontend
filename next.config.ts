import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ❗ Skips ESLint during `next build`, even if there are errors
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
