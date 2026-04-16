import type { Metadata } from "next";
import { getLeadsForMap } from "@/actions/dashboard";
import { LeadsMapClient } from "@/components/dashboard/leads-map-client";
import type { LeadTemperature } from "@/types/database";

export const metadata: Metadata = {
  title: "Map",
};

export default async function MapPage() {
  const raw = await getLeadsForMap();
  const pins = raw
    .filter(
      (r): r is typeof r & { lat: number; lng: number } =>
        r.lat != null && r.lng != null,
    )
    .map((r) => ({
      id: r.id,
      full_name: r.full_name,
      lat: r.lat,
      lng: r.lng,
      temperature: r.temperature as LeadTemperature,
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lead map</h1>
        <p className="text-sm text-slate-400">
          Customer locations (from map picker on quotes). Colors: HOT / WARM / COLD.
        </p>
      </div>
      <LeadsMapClient pins={pins} />
    </div>
  );
}
