"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocateFixed, X } from "lucide-react";

type Params = {
  make?: string;
  price_max?: string;
  year_min?: string;
  fuel_type?: string;
  lat?: string;
  lng?: string;
  radius_km?: string;
};

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow";

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
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-center gap-2 text-slate-900 font-semibold">
        <LocateFixed size={16} />
        Near me
      </div>

      <div>
        <label className="text-xs font-medium text-slate-500 mb-1 block">Radius</label>
        <select value={radius} onChange={(e) => setRadius(e.target.value)} className={inputClass}>
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="25">25 km</option>
          <option value="50">50 km</option>
          <option value="100">100 km</option>
        </select>
      </div>

      <button
        onClick={handleUseLocation}
        className="flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors"
      >
        <LocateFixed size={15} />
        Use my location
      </button>

      {params.lat && (
        <button
          onClick={handleClear}
          className="flex items-center justify-center gap-1 text-sm text-slate-500 hover:text-red-600 transition-colors"
        >
          <X size={14} />
          Clear radius search
        </button>
      )}

      {error && <p className="text-red-600 text-xs">{error}</p>}
    </div>
  );
}
