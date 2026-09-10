"use client";

import { useRouter } from "next/navigation";

export default function DeleteListingButton({ listingId }: { listingId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-red-600 text-sm underline">
      Delete
    </button>
  );
}
