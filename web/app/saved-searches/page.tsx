import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, ChevronRight } from "lucide-react";
import { apiGetAuthed } from "@/lib/api";
import { SavedSearch } from "@/lib/types";
import DeleteSavedSearchButton from "@/app/components/DeleteSavedSearchButton";

// Saved filters store price_max in pence (matches the API); the /listings
// page reads price_max from the URL in pounds, so convert back here.
function buildListingsLink(filters: SavedSearch["filters"]) {
  const p = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (key === "price_max") {
      p.set(key, String(Number(value) / 100));
    } else {
      p.set(key, String(value));
    }
  });
  return `/listings?${p.toString()}`;
}

function describeFilters(filters: SavedSearch["filters"]) {
  const parts: string[] = [];
  if (filters.make) parts.push(String(filters.make));
  if (filters.price_max) parts.push(`under £${(Number(filters.price_max) / 100).toLocaleString("en-GB")}`);
  if (filters.year_min) parts.push(`${filters.year_min}+`);
  if (filters.fuel_type) parts.push(String(filters.fuel_type));
  return parts.join(" · ") || "All listings";
}

export default async function SavedSearchesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const { data: searches, status } = await apiGetAuthed<SavedSearch[]>("/saved-searches", token);

  if (status === 401) {
    redirect("/login");
  }

  return (
    <main className="max-w-2xl w-full mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bookmark size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900">Saved searches</h1>
      </div>

      {!searches || searches.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl py-16 px-4">
          <Bookmark size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No saved searches yet</p>
          <p className="text-slate-400 text-sm mt-1">
            Apply filters on the listings page and click &quot;Save this search&quot;.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {searches.map((search) => (
            <li
              key={search.id}
              className="bg-white border border-slate-200 rounded-xl p-4 flex justify-between items-center hover:border-brand transition-colors"
            >
              <Link href={buildListingsLink(search.filters)} className="flex items-center gap-2 min-w-0 flex-1">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {search.name || describeFilters(search.filters)}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{describeFilters(search.filters)}</p>
                </div>
                <ChevronRight size={16} className="text-slate-300 shrink-0" />
              </Link>
              <DeleteSavedSearchButton searchId={search.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
