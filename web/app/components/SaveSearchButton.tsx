"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    return <span className="text-sm text-gray-500">Search saved ✓</span>;
  }

  return (
    <button onClick={handleSave} className="text-sm underline">
      Save this search
    </button>
  );
}
