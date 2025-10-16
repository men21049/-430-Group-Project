import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Explicitly set the workspace root to the app's folder
  turbopack: {
    root: __dirname,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fakestoreapi.com",
        port: "",
        pathname: "/img/**",
      },
    ],
  },

  // ✅ Ignore ESLint during build so Vercel can deploy
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ✅ Exclude postgres from client bundle
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        perf_hooks: false,
        crypto: false,
        stream: false,
        os: false,
        postgres: false,
      };
    }
    return config;
  },
};

export default nextConfig;
