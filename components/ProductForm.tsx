"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ImagePlus, Loader2, CheckCircle2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id?: string;
  articleNo: string;
  name: string;
  weightMg: number;
  karat: string;
  photoUrl: string;
}

const KARATS = ["14K", "18K", "22K", "24K", "26K", "28K"];

export default function ProductForm({ product, suggestedArticleNo }: { product?: Product; suggestedArticleNo?: string }) {
  const router = useRouter();
  const isEdit = !!product?.id;
  const fileRef = useRef<HTMLInputElement>(null);

  const [weightUnit, setWeightUnit] = useState<"mg" | "g">("mg");

  const [form, setForm] = useState({
    articleNo: product?.articleNo ?? suggestedArticleNo ?? "",
    name: product?.name ?? "",
    weightDisplay: product?.weightMg ? String(product.weightMg) : "",
    karat: product?.karat ?? "18K",
    photoUrl: product?.photoUrl ?? "",
  });
  const [preview, setPreview] = useState(product?.photoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function switchUnit(newUnit: "mg" | "g") {
    const v = parseFloat(form.weightDisplay);
    if (!isNaN(v) && form.weightDisplay !== "") {
      let converted = weightUnit === "mg" && newUnit === "g" ? v / 1000 : v * 1000;
      const str = converted % 1 === 0 ? String(converted) : parseFloat(converted.toFixed(4)).toString();
      setForm((f) => ({ ...f, weightDisplay: str }));
    }
    setWeightUnit(newUnit);
  }

  function getWeightMg(): number {
    const v = parseFloat(form.weightDisplay);
    if (isNaN(v) || v <= 0) return 0;
    return weightUnit === "g" ? Math.round(v * 1000) : Math.round(v);
  }

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
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      setForm((f) => ({ ...f, photoUrl: publicUrl }));
      setPreview(URL.createObjectURL(file));
    } catch {
      setError("Photo upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.photoUrl) { setError("Please upload a photo first"); return; }
    const weightMg = getWeightMg();
    if (!weightMg) { setError("Please enter a valid weight"); return; }
    setSaving(true);
    setError("");
    try {
      const url = isEdit ? `/api/products/${product!.id}` : "/api/products";
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleNo: form.articleNo, name: form.name, karat: form.karat, photoUrl: form.photoUrl, weightMg }),
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

  const conversionHint = (() => {
    const v = parseFloat(form.weightDisplay);
    if (isNaN(v) || !form.weightDisplay) return null;
    if (weightUnit === "mg") return `${parseFloat((v / 1000).toFixed(4))}g`;
    return `${Math.round(v * 1000)}mg`;
  })();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Photo */}
      <div className="space-y-2">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Product Photo</Label>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border border-dashed border-border rounded-lg bg-muted/30 hover:bg-muted/50 hover:border-[#6b1a2a]/50 transition-colors overflow-hidden"
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="preview" className="w-full h-56 object-contain p-6" />
              <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
                Tap to change
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <ImagePlus className="w-5 h-5" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">Upload product photo</p>
                <p className="text-xs text-muted-foreground mt-0.5">PNG, JPG, WebP — click to browse</p>
              </div>
            </div>
          )}
          {uploading && (
            <div className="border-t border-border py-2.5 flex items-center justify-center gap-2 text-[#6b1a2a] text-xs font-medium bg-[#6b1a2a]/5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading photo…
            </div>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>

      <Separator />

      {/* Article No */}
      <div className="space-y-2">
        <Label htmlFor="articleNo" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Article Number
        </Label>
        <Input
          id="articleNo"
          required
          value={form.articleNo}
          onChange={(e) => setForm((f) => ({ ...f, articleNo: e.target.value }))}
          placeholder="e.g. NK1824375"
          className="h-10"
        />
      </div>

      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Product Name
        </Label>
        <Input
          id="name"
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="e.g. Bombay Fancy Nose Pin"
          className="h-10"
        />
      </div>

      {/* Weight + Karat */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="weight" className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Weight
            </Label>
            {/* Unit toggle */}
            <div className="flex items-center border border-border rounded-md overflow-hidden text-xs">
              {(["mg", "g"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => switchUnit(u)}
                  className={cn(
                    "px-2.5 py-0.5 font-medium transition-colors",
                    weightUnit === u ? "bg-[#6b1a2a] text-white" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          <div className="relative">
            <Input
              id="weight"
              required
              type="number"
              min="0.001"
              step="any"
              inputMode="decimal"
              value={form.weightDisplay}
              onChange={(e) => setForm((f) => ({ ...f, weightDisplay: e.target.value }))}
              placeholder={weightUnit === "mg" ? "e.g. 327" : "e.g. 0.327"}
              className="h-10 pr-9"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
              {weightUnit}
            </span>
          </div>
          {conversionHint && (
            <p className="text-xs text-muted-foreground">= {conversionHint}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Karat</Label>
          <Select value={form.karat} onValueChange={(v) => setForm((f) => ({ ...f, karat: v ?? f.karat }))}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {KARATS.map((k) => (
                <SelectItem key={k} value={k}>{k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
          {error}
        </p>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={saving || uploading}
          className="flex-1 bg-[#6b1a2a] hover:bg-[#5a1522] text-white"
        >
          {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving…</> : <><Upload className="w-4 h-4 mr-2" />{isEdit ? "Save Changes" : "Add Product"}</>}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
