import type { Metadata } from "next";
import Link from "next/link";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign in",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md border-slate-800 bg-slate-900/60">
        <CardHeader>
          <CardTitle>Customer portal</CardTitle>
          <CardDescription>
            We&apos;ll email you a magic link. Use the same email you used on your quote.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <MagicLinkForm />
          <p className="text-center text-sm text-slate-500">
            <Link href="/" className="text-emerald-400 hover:underline">
              Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
