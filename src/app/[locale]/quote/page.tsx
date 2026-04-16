import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LeadQuoteForm } from "@/components/quote/lead-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Quote" });
  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function QuotePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-24 pb-16 sm:pt-28">
        <LeadQuoteForm key={locale} />
      </main>
      <MarketingFooter />
    </div>
  );
}
