"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this product?")) return;
    setLoading(true);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="bg-red-50 text-red-600 text-xs py-1.5 px-2 rounded font-semibold hover:bg-red-100 transition disabled:opacity-50"
    >
      {loading ? "…" : "Del"}
    </button>
  );
}
