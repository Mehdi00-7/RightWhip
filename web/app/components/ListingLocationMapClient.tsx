"use client";

import dynamic from "next/dynamic";

// react-leaflet touches `window` on import, so it can only load client-side.
const ListingLocationMap = dynamic(
  () => import("@/app/components/ListingLocationMap"),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-slate-100 animate-pulse" />,
  }
);

export default function ListingLocationMapClient({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  return <ListingLocationMap latitude={latitude} longitude={longitude} />;
}
