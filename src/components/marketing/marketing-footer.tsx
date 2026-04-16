import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function MarketingFooter() {
  const t = await getTranslations("Footer");
  const th = await getTranslations("Header");
  const links = [
    { href: "/quote", label: th("order") },
    { href: "/projects", label: th("projects") },
    { href: "/login", label: th("account") },
  ];
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-10">
        <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[15px] font-medium tracking-wide text-white">{th("brand")}</p>
            <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-[#737373]">{t("tagline")}</p>
          </div>
          <nav className="flex flex-wrap gap-x-10 gap-y-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-[12px] tracking-[0.06em] text-[#737373] uppercase hover:text-white"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-14 text-center text-[11px] text-[#5c5c5c] sm:text-left">
          {t("copyright", { year })}
        </p>
      </div>
    </footer>
  );
}
