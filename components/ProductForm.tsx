"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id?: string;
  articleNo: string;
  name: string;
  weightMg: number;
  karat: string;
  photoUrl: string;
}

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = !!product?.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    articleNo: product?.articleNo ?? "",
    name: product?.name ?? "",
    weightMg: product?.weightMg?.toString() ?? "",
    karat: product?.karat ?? "18K",
    photoUrl: product?.photoUrl ?? "",
  });
  const [preview, setPreview] = useState(product?.photoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const ext = file.name.split(".").pop() ?? "jpg";
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentType: file.type, extension: ext }),
      });
      const { uploadUrl, publicUrl } = await res.json();
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      setForm((f) => ({ ...f, photoUrl: publicUrl }));
      setPreview(URL.createObjectURL(file));
    } catch {
      setError("Photo upload failed. Check S3 settings.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.photoUrl) { setError("Please upload a photo"); return; }
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const method = isEdit ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, weightMg: parseInt(form.weightMg) }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      router.push("/dashboard");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-5">
      <div>
        <label className="label">Article Number</label>
        <input
          required
          value={form.articleNo}
          onChange={(e) => setForm((f) => ({ ...f, articleNo: e.target.value }))}
          placeholder="e.g. NK1824375"
          className="input"
        />
      </div>

      <div>
        <label className="label">Product Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Bombay Fancy Nose Pin"
          className="input"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="label">Weight (mg)</label>
          <input
            required
            type="number"
            min="1"
            value={form.weightMg}
            onChange={(e) => setForm((f) => ({ ...f, weightMg: e.target.value }))}
            placeholder="e.g. 327"
            className="input"
          />
        </div>
        <div className="flex-1">
          <label className="label">Karat</label>
          <select
            value={form.karat}
            onChange={(e) => setForm((f) => ({ ...f, karat: e.target.value }))}
            className="input"
          >
            <option>14K</option>
            <option>18K</option>
            <option>22K</option>
            <option>24K</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Product Photo</label>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-[#6b1a2a] transition"
        >
          {preview ? (
            <img src={preview} alt="preview" className="h-32 mx-auto object-contain rounded" />
          ) : (
            <div className="text-gray-400 text-sm">
              <div className="text-3xl mb-2">📷</div>
              Click to upload photo
            </div>
          )}
          {uploading && <p className="text-xs text-[#6b1a2a] mt-2">Uploading...</p>}
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving || uploading}
          className="bg-[#6b1a2a] text-white px-8 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#5a1522] transition disabled:opacity-60"
        >
          {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Product"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
