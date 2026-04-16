/**
 * Marketing landing — GeorGeo Duck4 Solar.
 */
"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { HeroYoutubeBackground } from "@/components/marketing/hero-youtube-background";
import { TeslaButton } from "@/components/marketing/tesla-button";

const IMG_SPLIT_A =
  "https://images.unsplash.com/photo-1613665813444-6a85c8876f5f?auto=format&fit=crop&w=1600&q=80";
const IMG_SPLIT_B =
  "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1600&q=80";
const IMG_FULLBLEED =
  "https://images.unsplash.com/photo-1613665813444-6a85c8876f5f?auto=format&fit=crop&w=2400&q=80";

type SolarLandingProps = {
  /** Total quote requests stored in Supabase (leads table). */
  customerCount?: number;
};

export function SolarLanding({ customerCount = 0 }: SolarLandingProps) {
  const t = useTranslations("Home");

  return (
    <>
      <section className="relative min-h-[100dvh] w-full">
        <HeroYoutubeBackground />
        <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-between px-4 pt-28 pb-16 text-center sm:pt-32">
          <div className="max-w-4xl pt-8 sm:pt-16">
            <h1 className="text-[40px] font-medium leading-[1.05] tracking-[-0.02em] text-white sm:text-[52px] md:text-[60px]">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-[34rem] text-[17px] font-normal leading-relaxed text-white/90 sm:text-[20px]">
              {t("heroSubtitle")}
            </p>
            <p className="mt-5 text-[14px] font-medium tracking-wide text-white/70 sm:text-[15px]">
              {customerCount > 0 ? (
                <>{t("trustWithCount", { count: customerCount })}</>
              ) : (
                <>{t("trustEmpty")}</>
              )}
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
            <TeslaButton href="/quote" variant="primary">
              {t("ctaOrder")}
            </TeslaButton>
            <TeslaButton href="/projects" variant="outline">
              {t("ctaLearn")}
            </TeslaButton>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-24 sm:py-32">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="text-[28px] font-medium leading-snug tracking-tight text-white sm:text-[36px]">
            {t("sectionPoweredTitle")}
          </h2>
          <p className="mt-6 text-[17px] leading-[1.6] text-[#a2a3a5] sm:text-[18px]">{t("sectionPoweredBody")}</p>
        </div>
      </section>

      <section className="grid bg-black md:grid-cols-2">
        <div className="relative min-h-[320px] md:min-h-[560px]">
          <Image
            src={IMG_SPLIT_A}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center px-8 py-16 md:px-16 md:py-24">
          <h3 className="text-[24px] font-medium tracking-tight text-white sm:text-[32px]">
            {t("durabilityTitle")}
          </h3>
          <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-[#a2a3a5] sm:text-[16px]">{t("durabilityBody")}</p>
        </div>
      </section>

      <section className="grid bg-black md:grid-cols-2">
        <div className="order-2 flex flex-col justify-center px-8 py-16 md:order-1 md:px-16 md:py-24">
          <h3 className="text-[24px] font-medium tracking-tight text-white sm:text-[32px]">
            {t("efficiencyTitle")}
          </h3>
          <p className="mt-5 max-w-md text-[15px] leading-[1.65] text-[#a2a3a5] sm:text-[16px]">{t("efficiencyBody")}</p>
        </div>
        <div className="relative order-1 min-h-[320px] md:order-2 md:min-h-[560px]">
          <Image
            src={IMG_SPLIT_B}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </section>

      <section className="relative min-h-[70dvh] w-full">
        <div className="absolute inset-0">
          <Image src={IMG_FULLBLEED} alt="" fill className="object-cover" sizes="100vw" />
          <div className="absolute inset-0 bg-black/35" />
        </div>
        <div className="relative flex min-h-[70dvh] flex-col justify-end px-6 pb-16 md:px-16 md:pb-24">
          <div className="max-w-xl">
            <h3 className="text-[28px] font-medium text-white sm:text-[36px]">{t("systemTitle")}</h3>
            <p className="mt-4 text-[15px] leading-relaxed text-white/90 sm:text-[16px]">{t("systemBody")}</p>
          </div>
        </div>
      </section>

      <section className="bg-black px-6 py-20 text-center sm:py-28">
        <h2 className="text-[24px] font-medium text-white sm:text-[32px]">{t("bottomCtaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-lg text-[15px] text-[#a2a3a5]">{t("bottomCtaBody")}</p>
        <div className="mt-10 flex justify-center">
          <TeslaButton href="/quote" variant="primary">
            {t("ctaOrder")}
          </TeslaButton>
        </div>
      </section>
    </>
  );
}
