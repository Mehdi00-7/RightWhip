import Link from "next/link";
import { Gauge, Fuel, Settings2, MapPin } from "lucide-react";
import { Listing } from "@/lib/types";
import FavouriteButton from "@/app/components/FavouriteButton";

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

export default function ListingCard({
  listing,
  favourited = false,
}: {
  listing: Listing;
  favourited?: boolean;
}) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all"
    >
      <div className="relative h-40 bg-slate-100">
        {listing.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`http://localhost:8000${listing.images[0].url}`}
            alt={`${listing.make} ${listing.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 text-sm">
            No photo
          </div>
        )}
        <div className="absolute top-2 right-2">
          <FavouriteButton listingId={listing.id} initialFavourited={favourited} />
        </div>
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-slate-900 group-hover:text-brand transition-colors">
          {listing.year} {listing.make} {listing.model}
          {listing.variant ? ` ${listing.variant}` : ""}
        </h2>
        <p className="text-xl font-bold text-slate-900 mt-1">{formatPrice(listing.price)}</p>

        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Gauge size={13} />
            {listing.mileage.toLocaleString("en-GB")} mi
          </span>
          <span className="flex items-center gap-1 capitalize">
            <Settings2 size={13} />
            {listing.transmission}
          </span>
          <span className="flex items-center gap-1 capitalize">
            <Fuel size={13} />
            {listing.fuel_type}
          </span>
        </div>

        <p className="flex items-center gap-1 text-xs text-slate-400 mt-2">
          <MapPin size={13} />
          {listing.postcode}
        </p>
      </div>
    </Link>
  );
}
