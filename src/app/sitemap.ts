import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  const now = new Date();
  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/menu`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/track`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];
}
