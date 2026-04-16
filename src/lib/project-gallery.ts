export type GalleryItem = {
  src: string;
  title?: string;
  caption?: string;
};

/**
 * Parse gallery from Vercel env — no server secrets required.
 *
 * Option A — JSON array (recommended):
 * NEXT_PUBLIC_PROJECT_GALLERY_JSON=[{"src":"https://.../a.jpg","title":"Project 5"}]
 *
 * Option B — comma-separated image URLs:
 * NEXT_PUBLIC_PROJECT_IMAGE_URLS=https://a.com/1.jpg,https://a.com/2.jpg
 */
export function getStaticProjectGallery(): GalleryItem[] {
  const json = process.env.NEXT_PUBLIC_PROJECT_GALLERY_JSON?.trim();
  if (json) {
    try {
      const parsed = JSON.parse(json) as unknown;
      if (!Array.isArray(parsed)) return [];
      const out: GalleryItem[] = [];
      for (const row of parsed) {
        if (row && typeof row === "object" && "src" in row && typeof (row as GalleryItem).src === "string") {
          const item = row as GalleryItem;
          out.push({
            src: item.src.trim(),
            title: typeof item.title === "string" ? item.title : undefined,
            caption: typeof item.caption === "string" ? item.caption : undefined,
          });
        }
      }
      if (out.length > 0) return out;
    } catch {
      // fall through
    }
  }

  const csv = process.env.NEXT_PUBLIC_PROJECT_IMAGE_URLS?.trim();
  if (csv) {
    const urls = csv
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.startsWith("http"));
    if (urls.length > 0) {
      return urls.map((src, i) => ({ src, title: `Project ${i + 1}` }));
    }
  }

  return defaultDemoGallery();
}

/** Shown when no env is set — replace via env on Vercel. */
function defaultDemoGallery(): GalleryItem[] {
  return [
    {
      src: "https://images.unsplash.com/photo-1508514177221-188b1f16e752?w=1200&q=80",
      title: "Residential rooftop PV",
      caption: "Replace with your photos via NEXT_PUBLIC_PROJECT_GALLERY_JSON on Vercel.",
    },
    {
      src: "https://images.unsplash.com/photo-1613665813444-6a85c8876f5f?w=1200&q=80",
      title: "Commercial array",
      caption: "Duck4 Solar — Georgeo_Solar",
    },
    {
      src: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=1200&q=80",
      title: "Sun + savings",
      caption: "Add your real project URLs in project settings.",
    },
  ];
}
