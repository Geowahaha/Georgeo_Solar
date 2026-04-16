import type { GalleryItem } from "@/lib/project-gallery";

export function ProjectImageGrid({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-[14px] text-[#737373]">
        No images configured. Set{" "}
        <code className="text-[12px] text-white/80">NEXT_PUBLIC_PROJECT_GALLERY_JSON</code> or{" "}
        <code className="text-[12px] text-white/80">NEXT_PUBLIC_PROJECT_IMAGE_URLS</code> in Vercel.
      </p>
    );
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, i) => (
        <li
          key={`${item.src}-${i}`}
          className="overflow-hidden border border-white/10 bg-white/[0.02]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={item.title ?? `Project ${i + 1}`}
            className="aspect-[4/3] w-full object-cover"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1 p-4">
            {item.title ? (
              <h2 className="text-[15px] font-medium text-white">{item.title}</h2>
            ) : (
              <h2 className="text-[15px] font-medium text-white">Project {i + 1}</h2>
            )}
            {item.caption ? <p className="text-[13px] text-[#a2a3a5]">{item.caption}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
