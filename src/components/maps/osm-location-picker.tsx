"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TH_CENTER: [number, number] = [13.7563, 100.5018];

type OsmLocationPickerProps = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  onPlaceResolved?: (formattedAddress: string) => void;
  inputClassName?: string;
};

export function OsmLocationPicker({
  lat,
  lng,
  onChange,
  onPlaceResolved,
  inputClassName,
}: OsmLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceResolvedRef = useRef(onPlaceResolved);
  onChangeRef.current = onChange;
  onPlaceResolvedRef.current = onPlaceResolved;

  const setMarkerRef = useRef<(la: number, ln: number) => void>(() => {});
  const removeMarkerRef = useRef<() => void>(() => {});

  const [mapReady, setMapReady] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { label: string; lat: number; lng: number }[]
  >([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const reverseGeocode = useCallback(async (la: number, ln: number) => {
    try {
      const res = await fetch(
        `/api/geocode?reverse=1&lat=${encodeURIComponent(String(la))}&lng=${encodeURIComponent(String(ln))}`,
      );
      const data = (await res.json()) as { label: string | null };
      if (data.label) onPlaceResolvedRef.current?.(data.label);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    (async () => {
      const L = await import("leaflet");
      if (cancelled || !containerRef.current) return;

      const pinIcon = L.divIcon({
        className: "georgeo-osm-pin",
        html:
          '<div style="width:18px;height:18px;border-radius:50%;background:#fbbf24;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35)"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const map = L.map(containerRef.current, { zoomControl: true }).setView(TH_CENTER, 10);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const removeMarker = () => {
        if (markerRef.current) {
          markerRef.current.remove();
          markerRef.current = null;
        }
      };
      removeMarkerRef.current = removeMarker;

      const setMarker = (la: number, ln: number) => {
        if (markerRef.current) {
          markerRef.current.setLatLng([la, ln]);
        } else {
          markerRef.current = L.marker([la, ln], { icon: pinIcon, draggable: true })
            .addTo(map)
            .on("dragend", () => {
              const p = markerRef.current!.getLatLng();
              onChangeRef.current(p.lat, p.lng);
              void reverseGeocode(p.lat, p.lng);
            });
        }
      };
      setMarkerRef.current = setMarker;

      map.on("click", (e) => {
        const la = e.latlng.lat;
        const ln = e.latlng.lng;
        setMarker(la, ln);
        onChangeRef.current(la, ln);
        void reverseGeocode(la, ln);
      });

      setMapReady(true);
    })();

    return () => {
      cancelled = true;
      removeMarkerRef.current();
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      setMapReady(false);
    };
  }, [reverseGeocode]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    if (lat != null && lng != null) {
      setMarkerRef.current(lat, lng);
      mapRef.current.setView([lat, lng], Math.max(mapRef.current.getZoom(), 16));
    } else {
      removeMarkerRef.current();
    }
  }, [mapReady, lat, lng]);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/geocode?q=${encodeURIComponent(searchQuery.trim())}`,
        );
        const data = (await res.json()) as {
          results?: { label: string; lat: number; lng: number }[];
        };
        setSearchResults(data.results ?? []);
        setSearchOpen(true);
      } catch {
        setSearchResults([]);
      }
    }, 650);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pickResult = (r: { label: string; lat: number; lng: number }) => {
    setMarkerRef.current(r.lat, r.lng);
    onChange(r.lat, r.lng);
    onPlaceResolved?.(r.label);
    mapRef.current?.setView([r.lat, r.lng], 17);
    setSearchQuery("");
    setSearchOpen(false);
    setSearchResults([]);
  };

  const useMyCurrentLocation = () => {
    setGeoError(null);
    if (!mapReady || typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoError("Location is not available in this browser.");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const la = pos.coords.latitude;
        const ln = pos.coords.longitude;
        setMarkerRef.current(la, ln);
        onChange(la, ln);
        mapRef.current?.setView([la, ln], 17);
        void reverseGeocode(la, ln);
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        if (err.code === 1) {
          setGeoError("Location permission denied — allow location for this site in your browser.");
        } else if (err.code === 2) {
          setGeoError("Your position could not be determined.");
        } else if (err.code === 3) {
          setGeoError("Location request timed out — try again.");
        } else {
          setGeoError("Could not read your location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 60_000,
      },
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#a2a3a5]">
        Free map (OpenStreetMap) — use your current location, search, click the map, or drag the
        pin.
      </p>
      <div className="relative z-[1000]" ref={searchWrapRef}>
        <Label htmlFor="osm-search">Find address (Thailand)</Label>
        <Input
          id="osm-search"
          type="search"
          autoComplete="off"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
          placeholder="Street, district, or place…"
          className={inputClassName}
        />
        {searchOpen && searchResults.length > 0 ? (
          <ul className="absolute z-[1001] mt-1 max-h-48 w-full overflow-auto rounded-md border border-white/10 bg-[#1a1a1a] py-1 text-left text-sm text-white shadow-lg">
            {searchResults.map((r, i) => (
              <li key={`${i}-${r.lat}-${r.lng}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-white/10"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pickResult(r)}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!mapReady || geoLoading}
          onClick={useMyCurrentLocation}
          className="border-white/20 bg-black text-white hover:bg-white/10"
        >
          {geoLoading ? (
            "Getting location…"
          ) : (
            <>
              <MapPin className="h-4 w-4" aria-hidden />
              Use my current location
            </>
          )}
        </Button>
        <span className="text-xs text-[#737373]">
          Uses your device GPS (browser will ask permission).
        </span>
      </div>
      {geoError ? <p className="text-sm text-amber-400/90">{geoError}</p> : null}
      <div
        ref={containerRef}
        className="z-0 h-[280px] w-full overflow-hidden rounded-lg border border-white/10 [&_.leaflet-container]:h-full [&_.leaflet-container]:w-full"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="osm-lat">Latitude</Label>
          <Input
            id="osm-lat"
            value={lat != null ? String(lat) : ""}
            readOnly
            placeholder="Search or click map"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="osm-lng">Longitude</Label>
          <Input
            id="osm-lng"
            value={lng != null ? String(lng) : ""}
            readOnly
            placeholder="Search or click map"
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}
