import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getLeadDetail } from "@/actions/dashboard";
import { LeadNoteForm } from "@/components/dashboard/lead-note-form";
import { PipelineStatusForm } from "@/components/dashboard/pipeline-status-form";
import { ProjectUploadForm } from "@/components/dashboard/project-upload-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { bucketForLeadImageKind } from "@/lib/storage/bucket-for-kind";
import { getSignedUrl } from "@/lib/storage/signed-url";
import type { LeadImageKind, LeadTemperature, PipelineStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Lead detail",
};

function tempVariant(t: LeadTemperature): "hot" | "warm" | "cold" {
  if (t === "HOT") return "hot";
  if (t === "WARM") return "warm";
  return "cold";
}

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let bundle;
  try {
    bundle = await getLeadDetail(id);
  } catch {
    notFound();
  }

  const { lead, proposal, notes, images, projectId } = bundle;

  const imageRows = await Promise.all(
    images.map(async (img) => {
      const bucket = bucketForLeadImageKind(img.kind as LeadImageKind);
      const url = await getSignedUrl(bucket, img.storage_path);
      return { ...img, url };
    }),
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <Link href="/dashboard" className="text-sm text-emerald-400 hover:underline">
          ← Leads
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-semibold">{lead.full_name}</h1>
        <p className="text-sm text-slate-400">
          Created {format(new Date(lead.created_at), "PPpp")}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant={tempVariant(lead.temperature as LeadTemperature)}>
            {lead.temperature}
          </Badge>
          <Badge variant="default">Score {lead.score}</Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-300">
            <p>{lead.contact_email}</p>
            <p>{lead.phone}</p>
            {lead.line_id ? <p>LINE: {lead.line_id}</p> : null}
            {lead.facebook_profile ? (
              <a
                href={lead.facebook_profile}
                className="text-emerald-400 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            ) : null}
            <p className="pt-2">{lead.address}</p>
            {lead.lat != null && lead.lng != null ? (
              <p className="text-slate-500">
                {lead.lat.toFixed(5)}, {lead.lng.toFixed(5)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Property & bill</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-slate-300">
            <p>Roof: {lead.roof_type}</p>
            <p>Property: {lead.property_type}</p>
            <p>Budget: {lead.budget_range}</p>
            <p>Monthly bill: ฿{Number(lead.monthly_bill_thb).toLocaleString()}</p>
            {lead.notes ? <p className="pt-2 text-slate-400">{lead.notes}</p> : null}
          </CardContent>
        </Card>
      </div>

      {proposal ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Auto proposal</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <p>System size: {proposal.system_kw} kW</p>
            <p>Est. price: ฿{Number(proposal.price_thb).toLocaleString()}</p>
            <p>Monthly savings: ฿{Number(proposal.monthly_savings_thb).toLocaleString()}</p>
            <p>Annual savings: ฿{Number(proposal.annual_savings_thb).toLocaleString()}</p>
            <p>ROI (years): {proposal.roi_years}</p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <PipelineStatusForm
            leadId={lead.id}
            current={lead.status as PipelineStatus}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            {imageRows.map((img) => (
              <div key={img.id} className="space-y-1 text-xs text-slate-500">
                <p className="capitalize">{img.kind}</p>
                {img.url ? (
                  <a
                    href={img.url}
                    className="block text-emerald-400 hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>
                ) : null}
                {img.url && (img.kind === "roof" || img.kind === "project") ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img.url}
                    alt=""
                    className="mt-1 h-28 w-40 rounded-md border border-slate-800 object-cover"
                  />
                ) : null}
              </div>
            ))}
          </div>
          <Separator />
          {projectId ? (
            <ProjectUploadForm leadId={lead.id} />
          ) : (
            <p className="text-sm text-slate-500">Project not linked.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LeadNoteForm leadId={lead.id} />
          <ul className="space-y-3">
            {notes.map((n) => (
              <li key={n.id} className="rounded-md border border-slate-800 p-3 text-sm">
                <p className="text-slate-300">{n.body}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {format(new Date(n.created_at), "PPpp")}
                </p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
