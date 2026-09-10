import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiGetAuthed } from "@/lib/api";
import { Listing } from "@/lib/types";
import ListingCard from "@/app/components/ListingCard";

export default async function FavouritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const { data: listings, status } = await apiGetAuthed<Listing[]>("/favourites", token);

  if (status === 401) {
    redirect("/login");
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">My favourites</h1>

      {!listings || listings.length === 0 ? (
        <p className="text-gray-500">
          You haven&apos;t favourited anything yet — click the heart on a listing to save it.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} favourited />
          ))}
        </div>
      )}
    </main>
  );
}
