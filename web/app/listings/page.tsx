import { cookies } from "next/headers";
import { apiGet, apiGetAuthed } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/app/components/ListingCard";
import FilterSidebar from "@/app/components/FilterSidebar";
import SaveSearchButton from "@/app/components/SaveSearchButton";
import NLSearchBar from "@/app/components/NLSearchBar";
import Link from "next/link";
import { ArrowLeft, ArrowRight, SearchX } from "lucide-react";

const PAGE_SIZE = 24;

type Params = {
  page?: string;
  make?: string;
  price_min?: string;
  price_max?: string;
  year_min?: string;
  mileage_max?: string;
  fuel_type?: string;
  body_type?: string;
};
function buildPageLink(params: Params, page: number) {
  const p = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && k !== "page") p.set(k, v);
  });
  p.set("page", String(page));
  return `/listings?${p.toString()}`;
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;
  const currentPage = Number(params.page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;

  const apiParams = new URLSearchParams();
  apiParams.set("limit", String(PAGE_SIZE));
  apiParams.set("offset", String(offset));
  if (params.make) apiParams.set("make", params.make);
  if (params.price_min) apiParams.set("price_min", String(Number(params.price_min) * 100));
  if (params.price_max) apiParams.set("price_max", String(Number(params.price_max) * 100));
  if (params.year_min) apiParams.set("year_min", params.year_min);
  if (params.mileage_max) apiParams.set("mileage_max", params.mileage_max);
  if (params.fuel_type) apiParams.set("fuel_type", params.fuel_type);
  if (params.body_type) apiParams.set("body_type", params.body_type);

  const listings = await apiGet<Listing[]>(`/listings?${apiParams.toString()}`);

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const favouritesResult = token
    ? await apiGetAuthed<number[]>("/favourites/ids", token)
    : { data: null, status: 401 };
  const favouriteIds = new Set(favouritesResult.data ?? []);

  const activeFilters: Record<string, string | number> = {};
  if (params.make) activeFilters.make = params.make;
  if (params.price_min) activeFilters.price_min = Number(params.price_min) * 100;
  if (params.price_max) activeFilters.price_max = Number(params.price_max) * 100;
  if (params.year_min) activeFilters.year_min = Number(params.year_min);
  if (params.mileage_max) activeFilters.mileage_max = Number(params.mileage_max);
  if (params.fuel_type) activeFilters.fuel_type = params.fuel_type;
  if (params.body_type) activeFilters.body_type = params.body_type;

  return (
    <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
      <FilterSidebar searchParams={params} />

      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <NLSearchBar />
        </div>

        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Used cars</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {listings.length} listing{listings.length === 1 ? "" : "s"}
              {currentPage > 1 ? ` — page ${currentPage}` : ""}
            </p>
          </div>
          {Object.keys(activeFilters).length > 0 && (
            <SaveSearchButton filters={activeFilters} />
          )}
        </div>

        {listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl py-16 px-4">
            <SearchX size={32} className="text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No listings found</p>
            <p className="text-slate-400 text-sm mt-1">Try widening your filters.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  favourited={favouriteIds.has(listing.id)}
                />
              ))}
            </div>

            <div className="flex justify-between items-center mt-8">
              {currentPage > 1 ? (
                <Link
                  href={buildPageLink(params, currentPage - 1)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand transition-colors"
                >
                  <ArrowLeft size={16} />
                  Previous
                </Link>
              ) : (
                <span />
              )}
              {listings.length === PAGE_SIZE && (
                <Link
                  href={buildPageLink(params, currentPage + 1)}
                  className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand transition-colors"
                >
                  Next
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
