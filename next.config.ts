import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  eslint: {
    // ❗ Skips ESLint during `next build`, even if there are errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ⚠️ Skip type errors during production builds
    ignoreBuildErrors: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  httpAgentOptions: {
    keepAlive: true,
  },
  modularizeImports: {
    "lucide-react": {
      transform: "lucide-react/icons/{{member}}",
    },
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
    optimizePackageImports: [
      "lucide-react",
    ],
  },
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/fonts/:all*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
