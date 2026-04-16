import { format } from "date-fns";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getLeadDetail } from "@/actions/dashboard";
import { LeadNoteForm } from "@/components/dashboard/lead-note-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { getSignedUrl } from "@/lib/storage/signed-url";
import type { LeadImageKind, LeadTemperature } from "@/types/database";

function bucketForKind(kind: LeadImageKind): "bills" | "roofs" | "projects" {
  if (kind === "bill") return "bills";
  if (kind === "roof") return "roofs";
  return "projects";
}

function tempVariant(t: LeadTemperature): "hot" | "warm" | "cold" {
  if (t === "HOT") return "hot";
  if (t === "WARM") return "warm";
  return "cold";
}

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function LeadDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  let data: Awaited<ReturnType<typeof getLeadDetail>>;
  try {
    data = await getLeadDetail(id);
  } catch {
    notFound();
  }

  const { lead, proposal, notes, images, projectId } = data;

  const imageUrls = await Promise.all(
    images.map(async (img) => ({
      ...img,
      url: await getSignedUrl(bucketForKind(img.kind), img.storage_path),
    })),
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/dashboard" className="text-sm text-emerald-400 hover:underline">
          ← Back to leads
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{lead.full_name}</h1>
            <p className="text-sm text-slate-400">
              {format(new Date(lead.created_at), "PPpp")}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={tempVariant(lead.temperature as LeadTemperature)}>
              {lead.temperature}
            </Badge>
            <Badge variant="default" className="capitalize">
              {(lead.status as string).replace("_", " ")}
            </Badge>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact & site</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
          <p>Email: {lead.contact_email}</p>
          <p>Phone: {lead.phone}</p>
          {lead.line_id ? <p>LINE: {lead.line_id}</p> : null}
          {lead.facebook_profile ? <p>Facebook: {lead.facebook_profile}</p> : null}
          <p className="sm:col-span-2">Address: {lead.address}</p>
          {lead.lat != null && lead.lng != null ? (
            <p className="sm:col-span-2">
              Coordinates: {lead.lat.toFixed(5)}, {lead.lng.toFixed(5)}
            </p>
          ) : null}
          <p>Monthly bill: ฿{Number(lead.monthly_bill_thb).toLocaleString()}</p>
          <p>
            Roof: {lead.roof_type} · Property: {lead.property_type}
          </p>
          <p>Budget: {lead.budget_range}</p>
          <p>Score: {lead.score}</p>
          {lead.notes ? (
            <p className="sm:col-span-2 whitespace-pre-wrap">Notes: {lead.notes}</p>
          ) : null}
        </CardContent>
      </Card>

      {proposal ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Proposal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>System: {proposal.system_kw} kW</p>
            <p>Price: ฿{Number(proposal.price_thb).toLocaleString()}</p>
            <p>Monthly savings: ฿{Number(proposal.monthly_savings_thb).toLocaleString()}</p>
            <p>Annual savings: ฿{Number(proposal.annual_savings_thb).toLocaleString()}</p>
            <p>ROI (years): {proposal.roi_years}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Images</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          {imageUrls.length === 0 ? (
            <p className="text-sm text-slate-500">No images.</p>
          ) : (
            imageUrls.map((img) =>
              img.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={img.id}
                  src={img.url}
                  alt={img.kind}
                  className="h-32 w-auto rounded border border-slate-800 object-cover"
                />
              ) : (
                <p key={img.id} className="text-sm text-slate-500">
                  ({img.kind} — unavailable)
                </p>
              ),
            )
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internal notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3 text-sm text-slate-300">
            {notes.map((n) => (
              <li key={n.id} className="border-b border-slate-800 pb-3">
                <p className="text-xs text-slate-500">{format(new Date(n.created_at), "PPpp")}</p>
                <p className="mt-1 whitespace-pre-wrap">{n.body}</p>
              </li>
            ))}
          </ul>
          <LeadNoteForm leadId={lead.id} />
        </CardContent>
      </Card>

      {projectId ? (
        <p className="text-sm text-slate-500">Linked project: {projectId}</p>
      ) : null}
    </div>
  );
}
