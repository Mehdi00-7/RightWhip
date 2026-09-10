import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
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
    <main className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Saved searches</h1>

      {!searches || searches.length === 0 ? (
        <p className="text-gray-500">
          No saved searches yet — apply filters on the listings page and click &quot;Save this search&quot;.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {searches.map((search) => (
            <li key={search.id} className="border rounded-lg p-4 flex justify-between items-center">
              <div>
                <Link href={buildListingsLink(search.filters)} className="font-semibold underline">
                  {search.name || describeFilters(search.filters)}
                </Link>
                <p className="text-sm text-gray-500">{describeFilters(search.filters)}</p>
              </div>
              <DeleteSavedSearchButton searchId={search.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
