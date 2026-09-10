"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NLFilters = {
  make: string | null;
  price_max: number | null;
  price_min: number | null;
  year_min: number | null;
  mileage_max: number | null;
  fuel_type: string | null;
  body_type: string | null;
  transmission: string | null;
};

export default function NLSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");

    const res = await fetch("/api/search/nl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("AI search is unavailable right now — try the filters instead.");
      return;
    }

    const filters: NLFilters = await res.json();

    const p = new URLSearchParams();
    if (filters.make) p.set("make", filters.make);
    // API returns prices in pence; the /listings URL convention is pounds.
    if (filters.price_max !== null) p.set("price_max", String(filters.price_max / 100));
    if (filters.price_min !== null) p.set("price_min", String(filters.price_min / 100));
    if (filters.year_min !== null) p.set("year_min", String(filters.year_min));
    if (filters.mileage_max !== null) p.set("mileage_max", String(filters.mileage_max));
    if (filters.fuel_type) p.set("fuel_type", filters.fuel_type);
    if (filters.body_type) p.set("body_type", filters.body_type);
    if (filters.transmission) p.set("transmission", filters.transmission);

    if ([...p.keys()].length === 0) {
      setError("Couldn't pick out any filters from that — try the sidebar instead, or be more specific.");
      return;
    }

    router.push(`/listings?${p.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Try: "reliable family car under £15k, low mileage, automatic"'
        className="flex-1 border rounded px-3 py-2"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Search"}
      </button>
      {error && <p className="text-red-600 text-sm self-center">{error}</p>}
    </form>
  );
}
