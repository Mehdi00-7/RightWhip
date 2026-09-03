import { apiGet } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/app/components/ListingCard";

export default async function ListingsPage() {
  const listings = await apiGet<Listing[]>("/listings?limit=24");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Used cars</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </main>
  );
}
