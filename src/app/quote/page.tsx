import type { Metadata } from "next";
import { LeadQuoteForm } from "@/components/quote/lead-form";
import { PublicFooter } from "@/components/site/public-footer";
import { PublicHeader } from "@/components/site/public-header";

export const metadata: Metadata = {
  title: "Get Solar Quote",
  description: "Submit your bill, roof photos, and site details for a Duck4 Solar quote.",
};

export default function QuotePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        <LeadQuoteForm />
      </main>
      <PublicFooter />
    </div>
  );
}
