"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FavouriteButton({
  listingId,
  initialFavourited,
}: {
  listingId: number;
  initialFavourited: boolean;
}) {
  const router = useRouter();
  const [favourited, setFavourited] = useState(initialFavourited);
  const [pending, setPending] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault(); // stop the card's own <Link> from navigating
    e.stopPropagation();
    if (pending) return;

    const next = !favourited;
    setFavourited(next); // optimistic — flip immediately
    setPending(true);

    const res = await fetch(`/api/listings/${listingId}/favourite`, {
      method: next ? "POST" : "DELETE",
    });

    setPending(false);

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (!res.ok) {
      setFavourited(!next); // revert on failure
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={favourited ? "Remove from favourites" : "Add to favourites"}
      className={`text-xl ${favourited ? "text-red-600" : "text-gray-400"}`}
    >
      {favourited ? "♥" : "♡"}
    </button>
  );
}
