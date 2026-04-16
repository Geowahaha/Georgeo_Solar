import { NextResponse } from "next/server";

/** Identifies this app to OpenStreetMap Nominatim (required by their usage policy). */
const NOMINATIM_UA = "GeorGeoDuck4Solar/1.0 (https://georgeoduck4.vercel.app/quote)";

/**
 * Forward geocode (search) and reverse geocode for the free OSM map picker.
 * Proxied server-side so we can send a proper User-Agent and avoid browser CORS issues.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  if (searchParams.get("reverse") === "1") {
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const la = lat != null ? Number.parseFloat(lat) : NaN;
    const ln = lng != null ? Number.parseFloat(lng) : NaN;
    if (!Number.isFinite(la) || !Number.isFinite(ln)) {
      return NextResponse.json({ label: null }, { status: 400 });
    }
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "json");
    url.searchParams.set("lat", String(la));
    url.searchParams.set("lon", String(ln));
    url.searchParams.set("zoom", "18");
    const res = await fetch(url.toString(), {
      headers: { "User-Agent": NOMINATIM_UA },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ label: null }, { status: 502 });
    }
    const data = (await res.json()) as { display_name?: string };
    return NextResponse.json({ label: data.display_name ?? null });
  }

  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 3) {
    return NextResponse.json({ results: [] });
  }
  if (q.length > 200) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("q", q);
  url.searchParams.set("limit", "5");
  url.searchParams.set("countrycodes", "th");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": NOMINATIM_UA },
    cache: "no-store",
  });
  if (!res.ok) {
    return NextResponse.json({ results: [] }, { status: 502 });
  }
  const raw = (await res.json()) as {
    display_name: string;
    lat: string;
    lon: string;
  }[];
  const results = raw.map((d) => ({
    label: d.display_name,
    lat: Number.parseFloat(d.lat),
    lng: Number.parseFloat(d.lon),
  }));
  return NextResponse.json({ results });
}
