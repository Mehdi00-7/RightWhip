"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

export default function PublishListingButton({ listingId }: { listingId: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handlePublish() {
    setPending(true);
    await fetch(`/api/listings/${listingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "published" }),
    });
    setPending(false);
    router.refresh();
  }

  return (
    <button
      onClick={handlePublish}
      disabled={pending}
      className="flex items-center gap-1 text-sm text-brand hover:underline disabled:opacity-60"
    >
      <Upload size={14} />
      {pending ? "Publishing..." : "Publish"}
    </button>
  );
}
