"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";

export default function SaveSearchButton({
  filters,
}: {
  filters: Record<string, string | number>;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const name = prompt("Name this search (optional):") ?? "";

    const res = await fetch("/api/saved-searches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || null, filters }),
    });

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (res.ok) setSaved(true);
  }

  if (saved) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-medium">
        <BookmarkCheck size={15} />
        Saved
      </span>
    );
  }

  return (
    <button
      onClick={handleSave}
      className="flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-brand transition-colors"
    >
      <Bookmark size={15} />
      Save this search
    </button>
  );
}
