import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Heart } from "lucide-react";
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
    <main className="max-w-6xl w-full mx-auto p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart size={22} className="text-brand" />
        <h1 className="text-2xl font-bold text-slate-900">My favourites</h1>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl py-16 px-4">
          <Heart size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">No favourites yet</p>
          <p className="text-slate-400 text-sm mt-1">Click the heart on a listing to save it here.</p>
        </div>
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
