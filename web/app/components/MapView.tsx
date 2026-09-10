"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import Link from "next/link";
import { Listing } from "@/lib/types";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

// Leaflet's default marker icons reference image paths that don't survive a
// bundler — without this, markers render as broken images. This resets the
// icon to load from a CDN instead.
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

export default function MapView({ listings }: { listings: Listing[] }) {
  const withCoords = listings.filter(
    (l): l is Listing & { latitude: number; longitude: number } =>
      l.latitude !== null && l.longitude !== null
  );

  const center: [number, number] =
    withCoords.length > 0
      ? [withCoords[0].latitude, withCoords[0].longitude]
      : [54.5, -3]; // roughly the middle of the UK

  return (
    <MapContainer center={center} zoom={6} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MarkerClusterGroup>
        {withCoords.map((listing) => (
          <Marker key={listing.id} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">
                  {listing.year} {listing.make} {listing.model}
                </p>
                <p>{formatPrice(listing.price)}</p>
                <Link href={`/listings/${listing.id}`} className="underline">
                  View listing
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}
