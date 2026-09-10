"use client";

import dynamic from "next/dynamic";
import { Listing } from "@/lib/types";

const MapView = dynamic(() => import("@/app/components/MapView"), {
  ssr: false,
  loading: () => <p className="p-6">Loading map...</p>,
});

export default function MapViewClient({ listings }: { listings: Listing[] }) {
  return <MapView listings={listings} />;
}
