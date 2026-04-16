"use client";

import { Link, useRouter } from "@/i18n/navigation";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { LeadTemperature } from "@/types/database";

type Pin = {
  id: string;
  full_name: string;
  lat: number;
  lng: number;
  temperature: LeadTemperature;
};

const center = { lat: 13.7563, lng: 100.5018 };

function colorForTemp(t: LeadTemperature): string {
  if (t === "HOT") return "#f97316";
  if (t === "WARM") return "#fbbf24";
  return "#38bdf8";
}

export function LeadsMapClient({ pins }: { pins: Pin[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return (
      <p className="text-sm text-slate-400">
        Set <code className="rounded bg-slate-800 px-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to
        enable the map.
      </p>
    );
  }
  return <LeadsMapInner pins={pins} apiKey={apiKey} />;
}

function LeadsMapInner({ pins, apiKey }: { pins: Pin[]; apiKey: string }) {
  const router = useRouter();
  const { isLoaded } = useJsApiLoader({
    id: "georgeo-dashboard-map",
    googleMapsApiKey: apiKey,
  });

  if (!isLoaded) {
    return <p className="text-sm text-slate-400">Loading map…</p>;
  }

  if (pins.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No leads with saved coordinates yet. Collect locations on the quote form.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-800">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "420px" }}
        center={center}
        zoom={6}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        {pins.map((p) => (
          <Marker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={p.full_name}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: colorForTemp(p.temperature),
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#0f172a",
              scale: 10,
            }}
            onClick={() => {
              router.push(`/dashboard/leads/${p.id}`);
            }}
          />
        ))}
      </GoogleMap>
      <ul className="divide-y divide-slate-800 border-t border-slate-800 p-3 text-sm">
        {pins.map((p) => (
          <li key={p.id} className="py-2">
            <Link href={`/dashboard/leads/${p.id}`} className="text-emerald-400 hover:underline">
              {p.full_name}
            </Link>
            <span className="ml-2 text-slate-500">({p.temperature})</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
