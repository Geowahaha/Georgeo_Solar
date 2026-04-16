import Link from "next/link";
import { ArrowRight, Leaf, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicFooter } from "@/components/site/public-footer";
import { PublicHeader } from "@/components/site/public-header";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-800">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-slate-950 to-slate-950" />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-20 md:flex-row md:items-center md:py-28">
            <div className="flex-1 space-y-6">
              <p className="text-sm font-medium uppercase tracking-widest text-emerald-400/90">
                Georgeo_Solar · Production CRM
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-50 md:text-5xl">
                Solar that pays for itself — engineered for Thailand.
              </h1>
              <p className="max-w-xl text-lg text-slate-400">
                Duck4 Solar designs, installs, and supports rooftop solar for homes and factories.
                Lower bills, predictable savings, and a clear path from lead to install.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/quote">
                    Get Solar Quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Track my request</Link>
                </Button>
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 shadow-xl backdrop-blur">
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex gap-3">
                  <Zap className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                  <span>Fast quotes with bill + roof photos and automatic system sizing.</span>
                </li>
                <li className="flex gap-3">
                  <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  <span>Transparent savings, ROI, and pipeline status in one place.</span>
                </li>
                <li className="flex gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" />
                  <span>Built on Supabase with row-level security and audit-friendly history.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  );
}
