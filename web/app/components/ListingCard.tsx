import { Listing } from "@/lib/types";

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

export default function ListingCard({ listing }: { listing: Listing }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="h-40 bg-gray-200 rounded mb-3" />
      <h2 className="font-semibold">
        {listing.year} {listing.make} {listing.model}
        {listing.variant ? ` ${listing.variant}` : ""}
      </h2>
      <p className="text-xl font-bold">{formatPrice(listing.price)}</p>
      <p className="text-sm text-gray-600">
        {listing.mileage.toLocaleString("en-GB")} miles · {listing.transmission} · {listing.fuel_type}
      </p>
      <p className="text-sm text-gray-500">{listing.postcode}</p>
    </div>
  );
}