import type { Metadata } from "next";
import { LeadQuoteForm } from "@/components/quote/lead-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export const metadata: Metadata = {
  title: "Order",
  description: "Submit your bill, roof photos, and site details for a Duck4 Solar quote.",
};

export default function QuotePage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <MarketingHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-24 pb-16 sm:pt-28">
        <LeadQuoteForm />
      </main>
      <MarketingFooter />
    </div>
  );
}
