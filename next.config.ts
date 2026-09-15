import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: "export",
  basePath: "/hhx-resume-site",
  assetPrefix: "/hhx-resume-site/",
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "cdn.dribbble.com" },
    ],
  },
};
export default nextConfig;
