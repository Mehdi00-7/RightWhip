import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, PackageOpen, Plus } from "lucide-react";
import { apiGetAuthed } from "@/lib/api";
import { Listing } from "@/lib/types";
import DeleteListingButton from "@/app/components/DeleteListingButton";
import PublishListingButton from "@/app/components/PublishListingButton";

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

  const { data: listings, status } = await apiGetAuthed<Listing[]>("/listings/mine", token.value);

  if (status === 401) {
    redirect("/login");
  }

  return (
    <main className="max-w-4xl w-full mx-auto p-4 sm:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <LayoutDashboard size={22} className="text-brand" />
          <h1 className="text-2xl font-bold text-slate-900">My listings</h1>
        </div>
        <Link
          href="/dashboard/new"
          className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Post a listing
        </Link>
      </div>

      {!listings || listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center bg-white border border-slate-200 rounded-xl py-16 px-4">
          <PackageOpen size={32} className="text-slate-300 mb-3" />
          <p className="text-slate-600 font-medium">You haven&apos;t posted any listings yet</p>
          <p className="text-slate-400 text-sm mt-1 mb-4">Post your first listing to see it here.</p>
          <Link
            href="/dashboard/new"
            className="flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Post a listing
          </Link>
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
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-4">
                      {listing.status === "draft" && (
                        <PublishListingButton listingId={listing.id} />
                      )}
                      <DeleteListingButton listingId={listing.id} />
                    </div>
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
