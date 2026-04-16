import { setRequestLocale } from "next-intl/server";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SolarLanding } from "@/components/marketing/solar-landing";
import { getPublicLeadCount } from "@/lib/leads/public-stats";

/** Refresh customer count periodically (submissions update after revalidation). */
export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const customerCount = await getPublicLeadCount();

  return (
    <div className="min-h-screen bg-black text-white">
      <MarketingHeader />
      <main>
        <SolarLanding customerCount={customerCount} />
      </main>
      <MarketingFooter />
    </div>
  );
}
