import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/marketing/language-switcher";

export async function MarketingHeader() {
  const t = await getTranslations("Header");
  const nav = [
    { href: "/projects", label: t("projects") },
    { href: "/quote", label: t("order") },
    { href: "/login", label: t("account") },
  ];

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center justify-between gap-4 px-5 sm:h-16 sm:px-8">
        <Link
          href="/"
          className="text-[15px] font-medium tracking-[0.02em] text-white hover:text-white/80"
        >
          {t("brand")}
        </Link>
        <div className="flex items-center gap-6 sm:gap-10">
          <nav className="flex items-center gap-6 sm:gap-10">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-[13px] font-medium tracking-[0.04em] text-white/90 uppercase hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher labelTh={t("langTh")} labelEn={t("langEn")} />
        </div>
      </div>
    </header>
  );
}
