"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

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
    <div>
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-brand transition-shadow"
      >
        <Sparkles size={18} className="text-brand shrink-0 ml-2" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Try "reliable family car under £15k, automatic"'
          className="flex-1 min-w-0 px-1 py-2 text-sm focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Thinking" : "Search"}
        </button>
      </form>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
}
