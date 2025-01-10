import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        hostname: "earnest-bass-31.convex.cloud",
        protocol: "https"
      }
    ]
  }
};

export default nextConfig;
