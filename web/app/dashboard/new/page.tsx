"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, LocateFixed } from "lucide-react";

const inputClass =
  "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-shadow";
const labelClass = "text-xs font-medium text-slate-500 mb-1 block";

export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => setLocating(false)
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const get = (key: string) => (form.get(key) as string) || undefined;

    const payload = {
      make: get("make"),
      model: get("model"),
      variant: get("variant") || null,
      year: get("year") ? Number(get("year")) : null,
      price: Math.round(Number(get("price")) * 100), // pounds -> pence
      mileage: Number(get("mileage")),
      fuel_type: get("fuel_type"),
      transmission: get("transmission"),
      body_type: get("body_type"),
      colour: get("colour"),
      engine_size: get("engine_size") ? Number(get("engine_size")) : null,
      description: get("description") || null,
      postcode: get("postcode"),
      latitude: coords?.lat ?? null,
      longitude: coords?.lng ?? null,
    };

    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmitting(false);

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(body?.detail ?? "Couldn't create the listing — check the fields and try again.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="max-w-2xl w-full mx-auto p-4 sm:p-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand mb-4 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to my listings
      </Link>

      <div className="flex items-center gap-2 mb-1">
        <Car size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900">Post a listing</h1>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        Saved as a draft first — publish it from your dashboard once you&apos;re happy with it.
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Make *</label>
            <input name="make" required className={inputClass} placeholder="Ford" />
          </div>
          <div>
            <label className={labelClass}>Model *</label>
            <input name="model" required className={inputClass} placeholder="Fiesta" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Variant</label>
            <input name="variant" className={inputClass} placeholder="ST-Line" />
          </div>
          <div>
            <label className={labelClass}>Year</label>
            <input name="year" type="number" className={inputClass} placeholder="2020" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Price (£) *</label>
            <input name="price" type="number" step="1" required className={inputClass} placeholder="12000" />
          </div>
          <div>
            <label className={labelClass}>Mileage *</label>
            <input name="mileage" type="number" required className={inputClass} placeholder="35000" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Fuel type *</label>
            <select name="fuel_type" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select...</option>
              <option value="petrol">Petrol</option>
              <option value="diesel">Diesel</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Transmission *</label>
            <select name="transmission" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select...</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automatic</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Body type *</label>
            <select name="body_type" required defaultValue="" className={inputClass}>
              <option value="" disabled>Select...</option>
              <option value="hatchback">Hatchback</option>
              <option value="estate">Estate</option>
              <option value="saloon">Saloon</option>
              <option value="suv">SUV</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Colour *</label>
            <input name="colour" required className={inputClass} placeholder="Blue" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Engine size (L)</label>
            <input name="engine_size" type="number" step="0.1" className={inputClass} placeholder="1.6" />
          </div>
          <div>
            <label className={labelClass}>Postcode *</label>
            <input name="postcode" required className={inputClass} placeholder="M1 1AA" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea name="description" rows={3} className={inputClass} placeholder="Full service history, one owner..." />
        </div>

        <div>
          <label className={labelClass}>Location on map (optional)</label>
          <button
            type="button"
            onClick={useMyLocation}
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-brand border border-slate-200 rounded-lg px-3 py-2 transition-colors"
          >
            <LocateFixed size={15} />
            {locating ? "Locating..." : coords ? "Location set ✓" : "Use my current location"}
          </button>
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-brand hover:bg-brand-dark text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors disabled:opacity-60"
        >
          {submitting ? "Posting..." : "Post listing"}
        </button>
      </form>
    </main>
  );
}
