import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const lastModified = new Date();
  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/quote`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/projects`, lastModified, changeFrequency: "weekly", priority: 0.85 },
    { url: `${base}/login`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];
}
