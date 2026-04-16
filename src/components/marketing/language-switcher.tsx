"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Props = {
  labelTh: string;
  labelEn: string;
};

export function LanguageSwitcher({ labelTh, labelEn }: Props) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-2 text-[12px] font-medium tracking-[0.06em]">
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "th" })}
        className={cn(
          "uppercase transition-colors",
          locale === "th" ? "text-white" : "text-white/45 hover:text-white/80",
        )}
      >
        {labelTh}
      </button>
      <span className="text-white/25" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: "en" })}
        className={cn(
          "uppercase transition-colors",
          locale === "en" ? "text-white" : "text-white/45 hover:text-white/80",
        )}
      >
        {labelEn}
      </button>
    </div>
  );
}
