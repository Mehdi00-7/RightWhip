import { apiGet } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/app/components/ListingCard";
import Link from "next/link";

const PAGE_SIZE = 24;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Number(page ?? "1");
  const offset = (currentPage - 1) * PAGE_SIZE;

  const listings = await apiGet<Listing[]>(
    `/listings?limit=${PAGE_SIZE}&offset=${offset}`
  );

  return (
    <main className="p-6">
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
              <Link href={`/listings?page=${currentPage - 1}`} className="underline">
                ← Previous
              </Link>
            ) : (
              <span />
            )}
            {listings.length === PAGE_SIZE && (
              <Link href={`/listings?page=${currentPage + 1}`} className="underline">
                Next →
              </Link>
            )}
          </div>
        </>
      )}
    </main>
  );
}
