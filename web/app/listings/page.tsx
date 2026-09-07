import { apiGet } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/app/components/ListingCard";
import FilterSidebar from "@/app/components/FilterSidebar";
import Link from "next/link";

const PAGE_SIZE = 24;

type Params = {
  page?: string;
  make?: string;
  price_max?: string;
  year_min?: string;
  fuel_type?: string;
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
  if (params.price_max) apiParams.set("price_max", String(Number(params.price_max) * 100));
  if (params.year_min) apiParams.set("year_min", params.year_min);
  if (params.fuel_type) apiParams.set("fuel_type", params.fuel_type);

  const listings = await apiGet<Listing[]>(`/listings?${apiParams.toString()}`);

  return (
    <main className="p-6 flex gap-6">
      <FilterSidebar searchParams={params} />

      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-6">Used cars</h1>

        {listings.length === 0 ? (
          <p className="text-gray-500">No listings found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>

            <div className="flex justify-between mt-6">
              {currentPage > 1 ? (
                <Link href={buildPageLink(params, currentPage - 1)} className="underline">
                  ← Previous
                </Link>
              ) : (
                <span />
              )}
              {listings.length === PAGE_SIZE && (
                <Link href={buildPageLink(params, currentPage + 1)} className="underline">
                  Next →
                </Link>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
