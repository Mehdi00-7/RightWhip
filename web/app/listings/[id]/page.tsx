import { apiGet } from "@/lib/api";
import { Listing } from "@/lib/types";
import { notFound } from "next/navigation";

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let listing: Listing;
  try {
    listing = await apiGet<Listing>(`/listings/${id}`);
  } catch {
    notFound();
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <div className="h-64 bg-gray-200 rounded mb-4" />

      <h1 className="text-2xl font-bold">
        {listing.year} {listing.make} {listing.model}
        {listing.variant ? ` ${listing.variant}` : ""}
      </h1>
      <p className="text-2xl font-bold text-blue-700 my-2">
        {formatPrice(listing.price)}
      </p>

      <dl className="grid grid-cols-2 gap-2 text-sm my-4">
        <dt className="text-gray-500">Mileage</dt>
        <dd>{listing.mileage.toLocaleString("en-GB")} miles</dd>

        <dt className="text-gray-500">Fuel type</dt>
        <dd className="capitalize">{listing.fuel_type}</dd>

        <dt className="text-gray-500">Transmission</dt>
        <dd className="capitalize">{listing.transmission}</dd>

        <dt className="text-gray-500">Body type</dt>
        <dd className="capitalize">{listing.body_type}</dd>

        <dt className="text-gray-500">Location</dt>
        <dd>{listing.postcode}</dd>
      </dl>

      {listing.description && (
        <p className="text-gray-700">{listing.description}</p>
      )}
    </main>
  );
}
