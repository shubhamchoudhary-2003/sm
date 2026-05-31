"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import DeleteButton from "@/components/DeleteButton";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Printer, Pencil, LayoutGrid, List, Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  articleNo: string;
  name: string;
  weightMg: number;
  karat: string;
  photoUrl: string;
  createdAt: Date;
}

const PAGE_SIZE = 12;

export default function ProductsView({ products }: { products: Product[] }) {
  const [view, setView] = useState<"grid" | "list" | "table">("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.articleNo.toLowerCase().includes(q) ||
        p.karat.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function handleSearch(v: string) {
    setSearch(v);
    setPage(1);
  }

  const karatColor = (k: string) => {
    if (k === "24K") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (k === "22K") return "bg-amber-50 text-amber-700 border-amber-200";
    if (k === "18K") return "bg-orange-50 text-orange-700 border-orange-200";
    return "bg-gray-50 text-gray-600 border-gray-200";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            placeholder="Search by name, article no, karat…"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-[#6b1a2a]/30 focus:border-[#6b1a2a]"
          />
        </div>

        {/* Count + View toggle */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-muted-foreground px-1">
            {filtered.length} {filtered.length === 1 ? "item" : "items"}
          </span>
          <div className="flex bg-white border border-gray-200 rounded-xl overflow-hidden">
            {(["grid", "list", "table"] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 h-9 flex items-center gap-1.5 text-xs font-medium transition-colors",
                  view === v
                    ? "bg-[#6b1a2a] text-white"
                    : "text-muted-foreground hover:bg-gray-50"
                )}
              >
                {v === "grid" && <LayoutGrid className="w-3.5 h-3.5" />}
                {v === "list" && <List className="w-3.5 h-3.5" />}
                {v === "table" && <span className="font-mono text-[11px]">≡</span>}
                <span className="hidden sm:inline capitalize">{v}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-2xl shadow-sm">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
            <Package className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="font-semibold text-sm">No results</p>
          <p className="text-xs text-muted-foreground mt-1">
            {search ? `No products match "${search}"` : "Add your first product"}
          </p>
        </div>
      )}

      {/* ── Grid view ── */}
      {view === "grid" && paginated.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {paginated.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
              <div className="aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 flex flex-col flex-1 gap-2">
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] text-muted-foreground font-mono truncate">{p.articleNo}</span>
                    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", karatColor(p.karat))}>{p.karat}</Badge>
                  </div>
                  <p className="font-semibold text-xs leading-tight line-clamp-2">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{p.weightMg} mg</p>
                </div>
                <div className="flex gap-1.5">
                  <Link href={`/products/${p.id}/card`} className={cn(buttonVariants({ size: "sm" }), "flex-1 bg-[#6b1a2a] hover:bg-[#5a1522] text-white text-[11px] h-7 gap-1 min-w-0 px-2")}>
                    <Printer className="w-3 h-3 shrink-0" />
                    <span className="truncate">Print</span>
                  </Link>
                  <Link href={`/products/${p.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 w-7 p-0 shrink-0")}>
                    <Pencil className="w-3 h-3" />
                  </Link>
                  <DeleteButton id={p.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── List view ── */}
      {view === "list" && paginated.length > 0 && (
        <div className="space-y-2.5">
          {paginated.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm overflow-hidden flex items-center gap-0 hover:shadow-md transition-shadow">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 shrink-0">
                <img src={p.photoUrl} alt={p.name} className="w-full h-full object-contain p-2" />
              </div>
              <div className="flex-1 px-3 py-2 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-muted-foreground truncate">{p.articleNo}</span>
                  <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4 shrink-0", karatColor(p.karat))}>{p.karat}</Badge>
                </div>
                <p className="text-sm font-semibold leading-tight line-clamp-1">{p.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{p.weightMg} mg</p>
              </div>
              <div className="flex gap-1.5 px-3 shrink-0">
                <Link href={`/products/${p.id}/card`} className={cn(buttonVariants({ size: "sm" }), "bg-[#6b1a2a] hover:bg-[#5a1522] text-white text-xs h-8 gap-1 hidden sm:flex")}>
                  <Printer className="w-3 h-3" /> Print
                </Link>
                <Link href={`/products/${p.id}/card`} className={cn(buttonVariants({ size: "sm" }), "bg-[#6b1a2a] hover:bg-[#5a1522] text-white h-8 w-8 p-0 sm:hidden")}>
                  <Printer className="w-3 h-3" />
                </Link>
                <Link href={`/products/${p.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-8 w-8 p-0")}>
                  <Pencil className="w-3 h-3" />
                </Link>
                <DeleteButton id={p.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table view ── */}
      {view === "table" && paginated.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Mobile table — stacked */}
          <div className="md:hidden divide-y divide-gray-100">
            {paginated.map((p) => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <img src={p.photoUrl} alt={p.name} className="w-10 h-10 object-contain bg-gray-50 rounded-lg p-1 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold truncate">{p.name}</span>
                    <Badge variant="secondary" className={cn("text-[9px] px-1 py-0 h-3.5 shrink-0", karatColor(p.karat))}>{p.karat}</Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">{p.articleNo}</span>
                    <span className="text-[10px] text-muted-foreground">{p.weightMg}mg</span>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Link href={`/products/${p.id}/card`} className={cn(buttonVariants({ size: "sm" }), "bg-[#6b1a2a] hover:bg-[#5a1522] text-white h-7 w-7 p-0")}>
                    <Printer className="w-3 h-3" />
                  </Link>
                  <Link href={`/products/${p.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 w-7 p-0")}>
                    <Pencil className="w-3 h-3" />
                  </Link>
                  <DeleteButton id={p.id} />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <table className="hidden md:table w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-14">Photo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Article No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Weight</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Karat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-4 py-2.5">
                    <div className="w-10 h-10 bg-gray-50 rounded-lg overflow-hidden">
                      <img src={p.photoUrl} alt={p.name} className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-muted-foreground">{p.articleNo}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-sm">{p.name}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-sm tabular-nums">{p.weightMg} mg</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant="secondary" className={cn("text-[10px] px-1.5 py-0 h-4", karatColor(p.karat))}>{p.karat}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5 justify-end">
                      <Link href={`/products/${p.id}/card`} className={cn(buttonVariants({ size: "sm" }), "bg-[#6b1a2a] hover:bg-[#5a1522] text-white text-xs h-7 gap-1")}>
                        <Printer className="w-3 h-3" /> Print
                      </Link>
                      <Link href={`/products/${p.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 w-7 p-0")}>
                        <Pencil className="w-3 h-3" />
                      </Link>
                      <DeleteButton id={p.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Page {safePage} of {totalPages} · {filtered.length} results
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                safePage === 1 ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((n) => n === 1 || n === totalPages || Math.abs(n - safePage) <= 1)
              .reduce<(number | "…")[]>((acc, n, i, arr) => {
                if (i > 0 && n - (arr[i - 1] as number) > 1) acc.push("…");
                acc.push(n);
                return acc;
              }, [])
              .map((n, i) =>
                n === "…" ? (
                  <span key={`ellipsis-${i}`} className="w-8 text-center text-xs text-muted-foreground">…</span>
                ) : (
                  <button
                    key={n}
                    onClick={() => setPage(n as number)}
                    className={cn(
                      "h-8 w-8 rounded-lg text-xs font-medium transition-colors",
                      safePage === n
                        ? "bg-[#6b1a2a] text-white"
                        : "hover:bg-gray-100 text-gray-600"
                    )}
                  >
                    {n}
                  </button>
                )
              )}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center transition-colors",
                safePage === totalPages ? "text-gray-300 cursor-not-allowed" : "hover:bg-gray-100 text-gray-600"
              )}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
