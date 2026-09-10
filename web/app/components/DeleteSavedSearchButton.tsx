"use client";

import { useRouter } from "next/navigation";

export default function DeleteSavedSearchButton({ searchId }: { searchId: number }) {
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/saved-searches/${searchId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button onClick={handleDelete} className="text-red-600 text-sm underline">
      Delete
    </button>
  );
}
