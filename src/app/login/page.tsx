import type { Metadata } from "next";
import Link from "next/link";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Account",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <MarketingHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-16">
        <Card className="w-full max-w-md border border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-[24px] font-medium tracking-tight">Account</CardTitle>
            <CardDescription className="text-[15px] text-[#a2a3a5]">
              We&apos;ll email you a magic link. Use the same email you used on your order.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MagicLinkForm />
            <p className="text-center text-[13px] text-[#737373]">
              <Link href="/" className="text-white underline-offset-4 hover:underline">
                Back to home
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <MarketingFooter />
    </div>
  );
}
