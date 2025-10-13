import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ✅ Explicitly set the workspace root to the app’s folder
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
};

export default nextConfig;
