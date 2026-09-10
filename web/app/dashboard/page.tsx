import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PackageOpen } from "lucide-react";
import { Listing } from "@/lib/types";
import LogoutButton from "@/app/components/LogoutButton";
import DeleteListingButton from "@/app/components/DeleteListingButton";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function formatPrice(pence: number) {
  return `£${(pence / 100).toLocaleString("en-GB")}`;
}

const statusStyles: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700",
  draft: "bg-slate-100 text-slate-600",
};

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
    <main className="max-w-4xl w-full mx-auto p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={22} className="text-brand" />
          <h1 className="text-2xl font-bold text-slate-900">My listings</h1>
        </div>
        <LogoutButton />
      </div>

      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl py-16 px-4">
          <PackageOpen size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">You haven&apos;t posted any listings yet</p>
          <p className="text-slate-400 text-sm mt-1">Listings you post will show up here.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-100 bg-slate-50/60">
                <th className="py-3 px-4 font-medium text-slate-500">Car</th>
                <th className="py-3 px-4 font-medium text-slate-500">Price</th>
                <th className="py-3 px-4 font-medium text-slate-500">Status</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                  <td className="py-3 px-4">
                    <Link href={`/listings/${listing.id}`} className="font-medium text-slate-900 hover:text-brand">
                      {listing.year} {listing.make} {listing.model}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{formatPrice(listing.price)}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block text-xs font-medium capitalize rounded-full px-2.5 py-1 ${
                        statusStyles[listing.status] ?? "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {listing.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <DeleteListingButton listingId={listing.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
