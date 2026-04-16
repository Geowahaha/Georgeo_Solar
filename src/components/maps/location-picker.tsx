"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

function MapLoading() {
  const t = useTranslations("Map");
  return <p className="text-sm text-[#a2a3a5]">{t("loading")}</p>;
}

const OsmLocationPicker = dynamic(
  () => import("./osm-location-picker").then((m) => m.OsmLocationPicker),
  {
    ssr: false,
    loading: MapLoading,
  },
);

export type LocationPickerProps = {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  /** When user picks a place from search, fills the address field */
  onPlaceResolved?: (formattedAddress: string) => void;
  /** Tesla / marketing dark form — pass same class as other inputs on /quote */
  inputClassName?: string;
};

/**
 * Quote form location: OpenStreetMap tiles + Leaflet (free, no API key).
 * Geocoding uses `/api/geocode` (Nominatim). Admin dashboard map may still use Google separately.
 */
export function LocationPicker(props: LocationPickerProps) {
  return <OsmLocationPicker {...props} />;
}
