"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteListingButton({ listingId }: { listingId: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this listing?")) return;
    await fetch(`/api/listings/${listingId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Delete listing"
      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:underline"
    >
      <Trash2 size={14} />
      Delete
    </button>
  );
}
