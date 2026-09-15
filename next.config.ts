import type { NextConfig } from "next";
const nextConfig: NextConfig = { output: "export", productionBrowserSourceMaps: false, images: { unoptimized: true, remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }, { protocol: "https", hostname: "cdn.dribbble.com" }] } };
export default nextConfig;
