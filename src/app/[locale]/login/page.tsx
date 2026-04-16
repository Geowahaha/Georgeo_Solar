import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { MagicLinkForm } from "@/components/auth/magic-link-form";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { sanitizeInternalPath } from "@/lib/sanitize-internal-path";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Login" });
  return { title: t("title") };
}

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Login");
  const q = await searchParams;
  const fallbackPortal = locale === "en" ? "/en/portal" : "/portal";
  const redirectAfterLogin = sanitizeInternalPath(q.next, fallbackPortal);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <MarketingHeader />
      <div className="flex flex-1 flex-col items-center justify-center px-4 pt-24 pb-16">
        <Card className="w-full max-w-md border border-white/10 bg-transparent">
          <CardHeader>
            <CardTitle className="text-[24px] font-medium tracking-tight">{t("title")}</CardTitle>
            <CardDescription className="text-[15px] text-[#a2a3a5]">{t("description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MagicLinkForm redirectAfterLogin={redirectAfterLogin} />
            <p className="text-center text-[13px] text-[#737373]">
              <Link href="/" className="text-white underline-offset-4 hover:underline">
                {t("backHome")}
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
      <MarketingFooter />
    </div>
  );
}
