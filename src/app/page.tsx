import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SolarLanding } from "@/components/marketing/solar-landing";
import { getPublicLeadCount } from "@/lib/leads/public-stats";

/** Refresh customer count periodically (submissions update after revalidation). */
export const revalidate = 60;

export default async function HomePage() {
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
