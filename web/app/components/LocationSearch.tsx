"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Params = {
  make?: string;
  price_max?: string;
  year_min?: string;
  fuel_type?: string;
  lat?: string;
  lng?: string;
  radius_km?: string;
};

export default function LocationSearch({ params }: { params: Params }) {
  const router = useRouter();
  const [radius, setRadius] = useState(params.radius_km ?? "25");
  const [error, setError] = useState("");

  function goToLocation(lat: number, lng: number, radiusKm: string) {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "lat" && k !== "lng" && k !== "radius_km") p.set(k, v);
    });
    p.set("lat", String(lat));
    p.set("lng", String(lng));
    p.set("radius_km", radiusKm);
    router.push(`/map?${p.toString()}`);
  }

  function handleUseLocation() {
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => goToLocation(pos.coords.latitude, pos.coords.longitude, radius),
      () => setError("Couldn't get your location")
    );
  }

  function handleClear() {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && k !== "lat" && k !== "lng" && k !== "radius_km") p.set(k, v);
    });
    router.push(`/map?${p.toString()}`);
  }

  return (
    <div className="w-56 border rounded-lg p-3 flex flex-col gap-2">
      <label className="text-sm text-gray-600">Radius (km)</label>
      <select
        value={radius}
        onChange={(e) => setRadius(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="5">5 km</option>
        <option value="10">10 km</option>
        <option value="25">25 km</option>
        <option value="50">50 km</option>
        <option value="100">100 km</option>
      </select>
      <button onClick={handleUseLocation} className="bg-black text-white rounded px-3 py-2 text-sm">
        Use my location
      </button>
      {params.lat && (
        <button onClick={handleClear} className="text-sm underline text-gray-500">
          Clear radius search
        </button>
      )}
      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
