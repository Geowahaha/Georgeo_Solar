import { getLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Button } from "@/components/ui/button";

async function signOutAction() {
  "use server";
  const locale = await getLocale();
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect({ href: "/login", locale });
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <DashboardShell>
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 px-4 py-3">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-slate-300 hover:text-white md:hidden">
            Leads
          </Link>
          <Link href="/dashboard/map" className="text-slate-300 hover:text-white md:hidden">
            Map
          </Link>
          <p className="truncate text-slate-400">Admin · {user?.email ?? "—"}</p>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </form>
      </header>
      <div className="p-4 md:p-8">{children}</div>
    </DashboardShell>
  );
}
