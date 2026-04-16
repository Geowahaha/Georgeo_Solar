import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import { getDashboardStats, getLeadsForTable } from "@/actions/dashboard";
import { LeadsFilters } from "@/components/dashboard/leads-filters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LeadTemperature } from "@/types/database";

export const metadata: Metadata = {
  title: "Dashboard",
};

function tempVariant(t: LeadTemperature): "hot" | "warm" | "cold" {
  if (t === "HOT") return "hot";
  if (t === "WARM") return "warm";
  return "cold";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ temperature?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.temperature as LeadTemperature | "ALL" | undefined) ?? "ALL";
  const q = sp.q ?? "";
  const stats = await getDashboardStats();
  const leads = await getLeadsForTable(
    filter === "ALL" || !filter ? "ALL" : filter,
    q,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="text-sm text-slate-400">
          Pipeline: New → Contacted → Site visit → Quote → Closed → Install → Support
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.total}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-300">HOT</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.hot}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-200">WARM</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.warm}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-sky-200">COLD</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.cold}</CardContent>
        </Card>
      </div>

      <Suspense fallback={<p className="text-sm text-slate-500">Loading filters…</p>}>
        <LeadsFilters initialQ={q} />
      </Suspense>

      <div className="rounded-xl border border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Temp</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500">
                  No leads match your filters.
                </TableCell>
              </TableRow>
            ) : (
              leads.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/leads/${row.id}`}
                      className="font-medium text-emerald-400 hover:underline"
                    >
                      {row.full_name}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate">{row.contact_email}</TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.score}</TableCell>
                  <TableCell>
                    <Badge variant={tempVariant(row.temperature as LeadTemperature)}>
                      {row.temperature}
                    </Badge>
                  </TableCell>
                  <TableCell className="capitalize">{row.status.replace("_", " ")}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
