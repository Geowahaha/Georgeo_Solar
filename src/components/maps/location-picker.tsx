"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultCenter = { lat: 13.7563, lng: 100.5018 };

const OsmLocationPicker = dynamic(
  () => import("./osm-location-picker").then((m) => m.OsmLocationPicker),
  {
    ssr: false,
    loading: () => <p className="text-sm text-[#a2a3a5]">Loading map…</p>,
  },
);

type LocationPickerProps = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  /** When user picks a place from search, fills the address field */
  onPlaceResolved?: (formattedAddress: string) => void;
  /** Tesla / marketing dark form — pass same class as other inputs on /quote */
  inputClassName?: string;
};

function LocationPickerManual({ lat, lng, onChange, inputClassName }: LocationPickerProps) {
  const [manualLat, setManualLat] = useState(lat != null ? String(lat) : "");
  const [manualLng, setManualLng] = useState(lng != null ? String(lng) : "");

  const pushIfPair = (latStr: string, lngStr: string) => {
    const la = Number.parseFloat(latStr);
    const ln = Number.parseFloat(lngStr);
    if (Number.isFinite(la) && Number.isFinite(ln)) {
      onChange(la, ln);
    } else {
      onChange(null, null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#a2a3a5]">
        Enter coordinates manually (decimal degrees). For a map picker, reload with JavaScript
        enabled.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat-manual">Latitude *</Label>
          <Input
            id="lat-manual"
            value={manualLat}
            onChange={(e) => {
              const v = e.target.value;
              setManualLat(v);
              pushIfPair(v, manualLng);
            }}
            onBlur={() => pushIfPair(manualLat, manualLng)}
            inputMode="decimal"
            placeholder="13.7563"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng-manual">Longitude *</Label>
          <Input
            id="lng-manual"
            value={manualLng}
            onChange={(e) => {
              const v = e.target.value;
              setManualLng(v);
              pushIfPair(manualLat, v);
            }}
            onBlur={() => pushIfPair(manualLat, manualLng)}
            inputMode="decimal"
            placeholder="100.5018"
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}

function LocationPickerGoogle({
  lat,
  lng,
  onChange,
  onPlaceResolved,
  inputClassName,
}: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  const { isLoaded } = useJsApiLoader({
    id: "georgeo-solar-map",
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceResolvedRef = useRef(onPlaceResolved);
  onChangeRef.current = onChange;
  onPlaceResolvedRef.current = onPlaceResolved;

  const center = useMemo(() => {
    if (lat != null && lng != null) return { lat, lng };
    return defaultCenter;
  }, [lat, lng]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onChange],
  );

  const onMarkerDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        onChange(e.latLng.lat(), e.latLng.lng());
      }
    },
    [onChange],
  );

  useEffect(() => {
    if (!isLoaded || !searchInputRef.current) return;

    const ac = new google.maps.places.Autocomplete(searchInputRef.current, {
      componentRestrictions: { country: "th" },
      fields: ["formatted_address", "geometry", "name"],
    });
    const listener = ac.addListener("place_changed", () => {
      const place = ac.getPlace();
      const loc = place.geometry?.location;
      if (!loc) return;
      onChangeRef.current(loc.lat(), loc.lng());
      const addr = place.formatted_address;
      if (addr) onPlaceResolvedRef.current?.(addr);
    });

    return () => {
      listener.remove();
      google.maps.event.clearInstanceListeners(ac);
    };
  }, [isLoaded]);

  if (!isLoaded) {
    return <p className="text-sm text-[#a2a3a5]">Loading map…</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#a2a3a5]">
        Google Maps — search, click the map, or drag the pin.
      </p>
      <div className="space-y-2">
        <Label htmlFor="map-search">Find address (Thailand)</Label>
        <Input
          id="map-search"
          ref={searchInputRef}
          type="text"
          autoComplete="off"
          placeholder="Start typing street or place…"
          className={inputClassName}
        />
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "280px" }}
          center={center}
          zoom={lat != null && lng != null ? 17 : 10}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {lat != null && lng != null ? (
            <Marker position={{ lat, lng }} draggable onDragEnd={onMarkerDragEnd} />
          ) : null}
        </GoogleMap>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat-sync">Latitude</Label>
          <Input
            id="lat-sync"
            value={lat != null ? String(lat) : ""}
            readOnly
            placeholder="Search or click map"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng-sync">Longitude</Label>
          <Input
            id="lng-sync"
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

/**
 * Default: free OpenStreetMap + Leaflet (no API key).
 * If `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set, uses Google Maps instead.
 */
export function LocationPicker(props: LocationPickerProps) {
  const googleKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (googleKey) {
    return <LocationPickerGoogle {...props} />;
  }
  return <OsmLocationPicker {...props} />;
}

/** Manual coordinates only — exported for rare fallbacks */
export { LocationPickerManual };
