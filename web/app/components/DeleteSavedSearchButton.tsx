"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteSavedSearchButton({ searchId }: { searchId: number }) {
  const router = useRouter();

  async function handleDelete() {
    await fetch(`/api/saved-searches/${searchId}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <button
      onClick={handleDelete}
      aria-label="Delete saved search"
      className="text-slate-400 hover:text-red-600 transition-colors p-2"
    >
      <Trash2 size={16} />
    </button>
  );
}
