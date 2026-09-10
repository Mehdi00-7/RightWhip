import { cookies } from "next/headers";
import Link from "next/link";
import { apiGet, apiGetAuthed } from "@/lib/api";
import { Listing, PriceComparison } from "@/lib/types";
import { notFound } from "next/navigation";
import FavouriteButton from "@/app/components/FavouriteButton";
import {
  ArrowLeft,
  Gauge,
  Fuel,
  Settings2,
  Car,
  MapPin,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// Rendered into an <img> the browser fetches directly — must be the
// public/browser-reachable address, not the internal server-to-server one.
const PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

const specs = (listing: Listing) => [
  { icon: Gauge, label: "Mileage", value: `${listing.mileage.toLocaleString("en-GB")} miles` },
  { icon: Fuel, label: "Fuel type", value: listing.fuel_type, capitalize: true },
  { icon: Settings2, label: "Transmission", value: listing.transmission, capitalize: true },
  { icon: Car, label: "Body type", value: listing.body_type, capitalize: true },
  { icon: MapPin, label: "Location", value: listing.postcode },
];

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

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  const favouritesResult = token
    ? await apiGetAuthed<number[]>("/favourites/ids", token)
    : { data: null };
  const isFavourited = (favouritesResult.data ?? []).includes(listing.id);

  // Public endpoint — no auth needed, and a failure here shouldn't break
  // the whole page, just hide the badge.
  const priceComparison = await apiGet<PriceComparison>(
    `/listings/${listing.id}/price-comparison`
  ).catch(() => null);

  const showBadge =
    priceComparison && priceComparison.sample_size >= 5 && priceComparison.difference_from_median !== null;
  const isBelow = showBadge && priceComparison!.difference_from_median! < 0;

  return (
    <main className="max-w-3xl w-full mx-auto p-4 sm:p-6">
      <Link
        href="/listings"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand mb-4 transition-colors"
      >
        <ArrowLeft size={15} />
        Back to listings
      </Link>

      <div className="relative rounded-xl overflow-hidden mb-6 bg-slate-100">
        {listing.images.length > 0 ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`${PUBLIC_API_URL}${listing.images[0].url}`}
            alt={`${listing.make} ${listing.model}`}
            className="w-full h-72 sm:h-96 object-cover"
          />
        ) : (
          <div className="w-full h-72 sm:h-96 flex items-center justify-center text-slate-300">
            No photo available
          </div>
        )}
        <div className="absolute top-3 right-3">
          <FavouriteButton listingId={listing.id} initialFavourited={isFavourited} />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {listing.year} {listing.make} {listing.model}
          {listing.variant ? ` ${listing.variant}` : ""}
        </h1>

        <div className="flex flex-wrap items-center gap-3 mt-2 mb-5">
          <p className="text-3xl font-bold text-slate-900">{formatPrice(listing.price)}</p>

          {showBadge && (
            <span
              className={`flex items-center gap-1.5 text-sm font-medium rounded-full px-3 py-1 ${
                isBelow ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {isBelow ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
              {priceComparison!.summary ??
                (isBelow
                  ? `${formatPrice(Math.abs(priceComparison!.difference_from_median!))} below similar listings`
                  : `${formatPrice(priceComparison!.difference_from_median!)} above similar listings`)}
            </span>
          )}
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-5 border-y border-slate-100">
          {specs(listing).map(({ icon: Icon, label, value, capitalize }) => (
            <div key={label}>
              <dt className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                <Icon size={13} />
                {label}
              </dt>
              <dd className={`text-sm font-medium text-slate-900 ${capitalize ? "capitalize" : ""}`}>
                {value}
              </dd>
            </div>
          ))}
        </dl>

        {listing.description && (
          <p className="text-slate-600 text-sm leading-relaxed mt-5">{listing.description}</p>
        )}
      </div>
    </main>
  );
}
