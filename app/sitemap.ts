import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/metadata";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteConfig.url, lastModified: "2026-09-15", changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/games`, lastModified: "2026-09-15", changeFrequency: "weekly", priority: 0.8 },
  ];
}
