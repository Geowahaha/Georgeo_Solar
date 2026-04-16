import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { getMyLeadBundle } from "@/actions/portal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeadTemperature, PipelineStatus } from "@/types/database";

export const metadata: Metadata = {
  title: "Portal",
};

function tempVariant(t: LeadTemperature): "hot" | "warm" | "cold" {
  if (t === "HOT") return "hot";
  if (t === "WARM") return "warm";
  return "cold";
}

export default async function PortalPage() {
  const bundle = await getMyLeadBundle();

  if (!bundle?.lead) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold">No request yet</h1>
        <p className="text-slate-400">
          We couldn&apos;t find a lead for your email. Submit a quote with the same email you used
          to sign in, or contact Duck4 Solar.
        </p>
        <Link href="/quote" className="text-emerald-400 hover:underline">
          Get a solar quote
        </Link>
      </div>
    );
  }

  const { lead, proposal } = bundle;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Hello, {lead.full_name}</h1>
        <p className="text-sm text-slate-400">
          Submitted {format(new Date(lead.created_at), "PPpp")}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant={tempVariant(lead.temperature as LeadTemperature)}>
            {lead.temperature}
          </Badge>
          <Badge variant="default" className="capitalize">
            {lead.status.replace("_", " ")}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your request</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-300">
          <p>{lead.address}</p>
          <p>Monthly bill (reported): ฿{Number(lead.monthly_bill_thb).toLocaleString()}</p>
          <p>
            Pipeline:{" "}
            <span className="capitalize text-slate-100">
              {(lead.status as PipelineStatus).replace("_", " ")}
            </span>
          </p>
        </CardContent>
      </Card>

      {proposal ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Your proposal estimate</CardTitle>
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

      <p className="text-sm text-slate-500">
        Questions? Reply to your confirmation email or message Duck4 Solar on LINE.
      </p>
    </div>
  );
}
