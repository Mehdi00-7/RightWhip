import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Listing } from "@/lib/types";
import LogoutButton from "@/app/components/LogoutButton";
import DeleteListingButton from "@/app/components/DeleteListingButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token");

  if (!token) {
    redirect("/login");
  }

  const res = await fetch(`${API_URL}/listings/mine`, {
    headers: { Cookie: `access_token=${token.value}` },
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/login");
  }

  const listings: Listing[] = await res.json();

  return (
    <main className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My listings</h1>
        <LogoutButton />
      </div>

      {listings.length === 0 ? (
        <p className="text-gray-500">You haven&apos;t posted any listings yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Car</th>
              <th className="py-2">Price</th>
              <th className="py-2">Status</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {listings.map((listing) => (
              <tr key={listing.id} className="border-b">
                <td className="py-2">
                  {listing.year} {listing.make} {listing.model}
                </td>
                <td className="py-2">{formatPrice(listing.price)}</td>
                <td className="py-2 capitalize">{listing.status}</td>
                <td className="py-2">
                  <DeleteListingButton listingId={listing.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
