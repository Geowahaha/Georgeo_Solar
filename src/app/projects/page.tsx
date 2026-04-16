import type { Metadata } from "next";
import Link from "next/link";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { ProjectImageGrid } from "@/components/projects/project-image-grid";
import { getStaticProjectGallery } from "@/lib/project-gallery";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "GeorGeo Duck4 Solar — installation gallery. Images from your configured project image feed.",
};

const FB_PAGE = "https://www.facebook.com/profile.php?id=100064946531847";

export default function ProjectsPage() {
  const items = getStaticProjectGallery();
  const hasCustomEnv =
    Boolean(process.env.NEXT_PUBLIC_PROJECT_GALLERY_JSON?.trim()) ||
    Boolean(process.env.NEXT_PUBLIC_PROJECT_IMAGE_URLS?.trim());

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-16 sm:pt-28">
        <div className="mb-10 space-y-2">
          <h1 className="text-[32px] font-medium tracking-tight text-white sm:text-[40px]">
            Gallery
          </h1>
          <p className="max-w-2xl text-[15px] leading-relaxed text-[#a2a3a5]">
            Photo gallery — feed image URLs from Vercel environment variables.
          </p>
          <p className="text-[13px] text-[#737373]">
            Facebook:{" "}
            <a
              href={FB_PAGE}
              className="text-white underline-offset-4 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              บริษัท ดั๊กโฟร์โซล่าเอ็นเนอร์จี จำกัด
            </a>
          </p>
        </div>

        {!hasCustomEnv ? (
          <p className="mb-6 border border-white/10 bg-white/[0.03] p-4 text-[13px] leading-relaxed text-[#a2a3a5]">
            Showing <span className="text-white">demo</span> images. In Vercel → Environment
            Variables, add{" "}
            <code className="text-[12px] text-white/70">NEXT_PUBLIC_PROJECT_GALLERY_JSON</code> or{" "}
            <code className="text-[12px] text-white/70">NEXT_PUBLIC_PROJECT_IMAGE_URLS</code>.{" "}
            <Link href="/" className="text-white underline-offset-4 hover:underline">
              Home
            </Link>
          </p>
        ) : null}

        <ProjectImageGrid items={items} />
      </main>
      <MarketingFooter />
    </div>
  );
}
