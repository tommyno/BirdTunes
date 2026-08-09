import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  experimental: {
    scrollRestoration: true,
  },
  // The url carries a ?v= param that changes when the data is regenerated,
  // so the browser can cache it indefinitely
  async headers() {
    return [
      {
        source: "/data/stations.json",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
