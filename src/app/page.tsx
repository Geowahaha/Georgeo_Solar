import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { SolarLanding } from "@/components/marketing/solar-landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <MarketingHeader />
      <main>
        <SolarLanding />
      </main>
      <MarketingFooter />
    </div>
  );
}
