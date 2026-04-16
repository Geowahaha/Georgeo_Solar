import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const lastModified = new Date();
  const th = [
    { url: base, lastModified, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/quote`, lastModified, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/projects`, lastModified, changeFrequency: "weekly" as const, priority: 0.85 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly" as const, priority: 0.3 },
  ];
  const en = [
    { url: `${base}/en`, lastModified, changeFrequency: "weekly" as const, priority: 0.95 },
    { url: `${base}/en/quote`, lastModified, changeFrequency: "weekly" as const, priority: 0.88 },
    { url: `${base}/en/projects`, lastModified, changeFrequency: "weekly" as const, priority: 0.84 },
    { url: `${base}/en/login`, lastModified, changeFrequency: "monthly" as const, priority: 0.3 },
  ];
  return [...th, ...en];
}
