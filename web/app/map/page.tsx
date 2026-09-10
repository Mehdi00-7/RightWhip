import { apiGet } from "@/lib/api";
import { Listing } from "@/lib/types";
import MapViewClient from "@/app/components/MapViewClient";
import FilterSidebar from "@/app/components/FilterSidebar";
import LocationSearch from "@/app/components/LocationSearch";

type Params = {
  make?: string;
  price_max?: string;
  year_min?: string;
  fuel_type?: string;
  lat?: string;
  lng?: string;
  radius_km?: string;
};

export default async function MapPage({
  searchParams,
}: {
  searchParams: Promise<Params>;
}) {
  const params = await searchParams;

  const apiParams = new URLSearchParams();
  apiParams.set("limit", "100"); // GET /listings caps at 100 (Phase 3) — the API's actual max
  if (params.make) apiParams.set("make", params.make);
  if (params.price_max) apiParams.set("price_max", String(Number(params.price_max) * 100));
  if (params.year_min) apiParams.set("year_min", params.year_min);
  if (params.fuel_type) apiParams.set("fuel_type", params.fuel_type);
  if (params.lat && params.lng && params.radius_km) {
    apiParams.set("lat", params.lat);
    apiParams.set("lng", params.lng);
    apiParams.set("radius_km", params.radius_km);
  }

  const listings = await apiGet<Listing[]>(`/listings?${apiParams.toString()}`);

  return (
    <main className="flex-1 flex gap-6 p-6 min-h-0">
      <div className="flex flex-col gap-4">
        <FilterSidebar searchParams={params} />
        <LocationSearch params={params} />
      </div>

      <div className="flex-1 flex flex-col gap-2 min-h-0">
        <p className="text-sm text-gray-500">
          {listings.length} listing{listings.length === 1 ? "" : "s"} on the map
          {params.radius_km && ` — within ${params.radius_km}km`}
        </p>
        <div className="flex-1 rounded-lg overflow-hidden border min-h-[500px]">
          <MapViewClient listings={listings} />
        </div>
      </div>
    </main>
  );
}
