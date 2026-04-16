"use client";

import { useCallback, useMemo, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const defaultCenter = { lat: 13.7563, lng: 100.5018 };

type LocationPickerProps = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  /** Tesla / marketing dark form — pass same class as other inputs on /quote */
  inputClassName?: string;
};

function LocationPickerManual({ lat, lng, onChange, inputClassName }: LocationPickerProps) {
  const [manualLat, setManualLat] = useState(lat != null ? String(lat) : "");
  const [manualLng, setManualLng] = useState(lng != null ? String(lng) : "");

  const applyManual = () => {
    const la = Number.parseFloat(manualLat);
    const ln = Number.parseFloat(manualLng);
    if (Number.isFinite(la) && Number.isFinite(ln)) {
      onChange(la, ln);
    } else {
      onChange(null, null);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#a2a3a5]">
        Add{" "}
        <code className="rounded bg-white/10 px-1 py-0.5 text-xs text-white/90">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
        </code>{" "}
        for the interactive map, or enter coordinates manually.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat-manual">Latitude</Label>
          <Input
            id="lat-manual"
            value={manualLat}
            onChange={(e) => setManualLat(e.target.value)}
            onBlur={applyManual}
            inputMode="decimal"
            placeholder="13.7563"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng-manual">Longitude</Label>
          <Input
            id="lng-manual"
            value={manualLng}
            onChange={(e) => setManualLng(e.target.value)}
            onBlur={applyManual}
            inputMode="decimal"
            placeholder="100.5018"
          />
        </div>
      </div>
    </div>
  );
}

function LocationPickerGoogle({ lat, lng, onChange, inputClassName }: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;

  const { isLoaded } = useJsApiLoader({
    id: "georgeo-solar-map",
    googleMapsApiKey: apiKey,
  });

  const center = useMemo(() => {
    if (lat != null && lng != null) return { lat, lng };
    return defaultCenter;
  }, [lat, lng]);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const nextLat = e.latLng.lat();
        const nextLng = e.latLng.lng();
        onChange(nextLat, nextLng);
      }
    },
    [onChange],
  );

  if (!isLoaded) {
    return <p className="text-sm text-[#a2a3a5]">Loading map…</p>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-[#a2a3a5]">
        Click the map to drop your roof location (helps us plan site access).
      </p>
      <div className="overflow-hidden rounded-lg border border-white/10">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "280px" }}
          center={center}
          zoom={lat != null && lng != null ? 16 : 10}
          onClick={onMapClick}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: false,
          }}
        >
          {lat != null && lng != null ? <Marker position={{ lat, lng }} /> : null}
        </GoogleMap>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat-sync">Latitude</Label>
          <Input
            id="lat-sync"
            value={lat != null ? String(lat) : ""}
            readOnly
            placeholder="Click map"
            className={inputClassName}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng-sync">Longitude</Label>
          <Input
            id="lng-sync"
            value={lng != null ? String(lng) : ""}
            readOnly
            placeholder="Click map"
            className={inputClassName}
          />
        </div>
      </div>
    </div>
  );
}

export function LocationPicker(props: LocationPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return <LocationPickerManual {...props} />;
  }
  return <LocationPickerGoogle {...props} />;
}
