"use client";

import { useState, useMemo, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Printer, Settings2, CheckSquare, Square, LayoutGrid,
  ChevronDown, ChevronUp, RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Product {
  id: string;
  articleNo: string;
  name: string;
  weightMg: number;
  karat: string;
  photoUrl: string;
  qrSvg: string;
}

const PAPER_SIZES: Record<string, { label: string; w: number; h: number }> = {
  A3:     { label: "A3  —  297 × 420 mm", w: 297, h: 420 },
  A4:     { label: "A4  —  210 × 297 mm", w: 210, h: 297 },
  A5:     { label: "A5  —  148 × 210 mm", w: 148, h: 210 },
  Letter: { label: "Letter  —  216 × 279 mm", w: 216, h: 279 },
  Legal:  { label: "Legal  —  216 × 356 mm", w: 216, h: 356 },
};

const DEFAULTS = {
  paperSize: "A4",
  orientation: "portrait" as "portrait" | "landscape",
  marginMm: 5,
  gapMm: 2,
  cardW: 54,
  cardH: 85,          // full CR80-style card height (header+white+footer)
  copies: 1,
  showCutGuide: true,
  fontStyle: "serif" as "serif" | "sans",
  qrPosition: "bottom-right" as "bottom-right" | "bottom-left" | "top-right" | "top-left",
  sortOrder: "selected" as "selected" | "name" | "articleNo" | "karat" | "weight",
  fillEmpty: "blank" as "blank" | "repeat",
  // Pre-printed zone offsets (mm from card top/bottom to avoid)
  topReservedMm: 14,   // pre-printed header height
  bottomReservedMm: 8, // pre-printed footer height
  // Content toggles
  showPhoto: true,
  showQr: true,
  showArticleNo: true,
  showName: true,
  showWeightKarat: true,
};

type Settings = typeof DEFAULTS;

function formatWeight(mg: number) {
  if (mg >= 1000) return `${parseFloat((mg / 1000).toFixed(3))}g`;
  return `${mg}mg`;
}

function getFont(style: "serif" | "sans") {
  return style === "serif" ? "Georgia,'Times New Roman',serif" : "Arial,Helvetica,sans-serif";
}

// ── Card cell — single source of truth for both preview and print ─────────────
// isPreview=true renders coloured band guides; false renders transparent bands for print
function CardCell({ p, s, isPreview = false, scale = 1 }: { p: Product; s: Settings; isPreview?: boolean; scale?: number }) {
  const font = getFont(s.fontStyle);
  const whiteH = s.cardH - s.topReservedMm - s.bottomReservedMm;

  // img/QR size: fit within white zone height, cap at 40% of card width
  const maxByHeight = (whiteH * 0.45);
  const maxByWidth  = (s.cardW * 0.40);
  const imgSize     = Math.min(maxByHeight, maxByWidth);

  const photoEl = s.showPhoto ? (
    <div style={{ width: `${imgSize}mm`, height: `${imgSize}mm`, border: "0.3mm solid #ddd", borderRadius: "1mm", overflow: "hidden", backgroundColor: "#fafafa", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "0.8mm" }} />
    </div>
  ) : null;

  const qrEl = s.showQr ? (
    <div style={{ width: `${imgSize}mm`, height: `${imgSize}mm`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }} dangerouslySetInnerHTML={{ __html: p.qrSvg }} />
  ) : null;

  const isQrLeft = s.qrPosition === "bottom-left" || s.qrPosition === "top-left";
  const isTop    = s.qrPosition === "top-right"   || s.qrPosition === "top-left";
  const hasMedia = s.showPhoto || s.showQr;

  const mediaRow = hasMedia ? (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "2mm", flexShrink: 0 }}>
      {isQrLeft ? (qrEl ?? photoEl) : (photoEl ?? qrEl)}
      {isQrLeft ? (photoEl ?? qrEl) : (qrEl ?? photoEl)}
    </div>
  ) : null;

  const infoRows = [
    s.showArticleNo   && ["Article No.", p.articleNo,                              "8.5pt"],
    s.showName        && ["Name",         p.name,                                   "7.5pt"],
    s.showWeightKarat && ["Weight & Karat", `${formatWeight(p.weightMg)} – ${p.karat}`, "7.5pt"],
  ].filter(Boolean) as [string, string, string][];

  return (
    <div style={{
      width: `${s.cardW}mm`,
      height: `${s.cardH}mm`,
      boxSizing: "border-box",
      overflow: "hidden",
      outline: s.showCutGuide ? "0.2mm dashed #aaa" : "none",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top reserved band */}
      <div style={{
        height: `${s.topReservedMm}mm`,
        flexShrink: 0,
        background: isPreview ? "rgba(107,26,42,0.07)" : "transparent",
        borderBottom: isPreview ? "0.3mm dashed rgba(107,26,42,0.3)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {isPreview && <span style={{ fontSize: `${6 / scale}pt`, color: "rgba(107,26,42,0.5)" }}>pre-printed header</span>}
      </div>

      {/* White print zone */}
      <div style={{
        flex: 1,
        minHeight: 0,
        backgroundColor: "#fff",
        padding: "2.5mm 3mm",
        boxSizing: "border-box",
        fontFamily: font,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        overflow: "hidden",
      }}>
        {isTop && mediaRow}
        <div style={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          {infoRows.map(([lbl, val, sz], i) => (
            <div key={i} style={{ marginBottom: i < infoRows.length - 1 ? "1.5mm" : 0 }}>
              <div style={{ fontSize: "4.5pt", color: "#666", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.4pt", fontFamily: "Arial,sans-serif" }}>{lbl}</div>
              <div style={{ fontSize: sz, fontWeight: "bold", color: "#111", lineHeight: 1.2, fontFamily: font }}>{val}</div>
            </div>
          ))}
        </div>
        {!isTop && mediaRow}
      </div>

      {/* Bottom reserved band */}
      <div style={{
        height: `${s.bottomReservedMm}mm`,
        flexShrink: 0,
        background: isPreview ? "rgba(201,168,76,0.12)" : "transparent",
        borderTop: isPreview ? "0.3mm dashed rgba(201,168,76,0.5)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {isPreview && <span style={{ fontSize: `${6 / scale}pt`, color: "rgba(150,110,20,0.6)" }}>pre-printed footer</span>}
      </div>
    </div>
  );
}

// ── Print content ─────────────────────────────────────────────────────────────
function PrintContent({
  slots, pages, perSheet, cols, rows, s, paper,
}: {
  slots: (Product | null)[];
  pages: number; perSheet: number; cols: number; rows: number;
  s: Settings;
  paper: { w: number; h: number };
}) {
  return (
    <>
      {Array.from({ length: pages }, (_, pageIdx) => {
        const pageSlots = slots.slice(pageIdx * perSheet, (pageIdx + 1) * perSheet);
        return (
          <div key={pageIdx} style={{
            position: "relative",
            width: `${paper.w}mm`,
            height: `${paper.h}mm`,
            overflow: "hidden",
            pageBreakAfter: pageIdx < pages - 1 ? "always" : "auto",
            breakAfter: pageIdx < pages - 1 ? "page" : "auto",
          }}>
            {Array.from({ length: rows }, (_, row) =>
              Array.from({ length: cols }, (_, col) => {
                const product = pageSlots[row * cols + col] ?? null;
                if (!product) return null;
                return (
                  <div key={`${row}-${col}`} style={{ position: "absolute", left: `${s.marginMm + col * (s.cardW + s.gapMm)}mm`, top: `${s.marginMm + row * (s.cardH + s.gapMm)}mm` }}>
                    <CardCell p={product} s={s} />
                  </div>
                );
              })
            )}
          </div>
        );
      })}
    </>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{children}</p>;
}

function ToggleRow<T extends string>({
  label, value, options, onChange,
}: {
  label: string; value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <div className="flex items-center border border-border rounded overflow-hidden text-[11px]">
        {options.map((o) => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
            className={cn("px-2.5 py-1 font-medium transition-colors", value === o.value ? "bg-[#6b1a2a] text-white" : "text-muted-foreground hover:bg-muted")}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center justify-between w-full py-1 group"
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className={cn("w-8 h-4 rounded-full transition-colors relative", checked ? "bg-[#6b1a2a]" : "bg-gray-200")}>
        <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform", checked ? "translate-x-4" : "translate-x-0.5")} />
      </div>
    </button>
  );
}

function MmInput({ label, value, onChange, min = 0, max = 50 }: { label: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className="h-9 pr-8 text-sm" />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">mm</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SheetPrintView({ products }: { products: Product[] }) {
  const printRef = useRef<HTMLDivElement>(null);
  const [s, setS] = useState<Settings>({ ...DEFAULTS });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [searchQ, setSearchQ] = useState("");

  function update<K extends keyof Settings>(key: K, val: Settings[K]) {
    setS((prev) => ({ ...prev, [key]: val }));
  }

  const rawPaper = PAPER_SIZES[s.paperSize];
  const paper = s.orientation === "landscape" ? { w: rawPaper.h, h: rawPaper.w } : { w: rawPaper.w, h: rawPaper.h };

  const cols = Math.max(1, Math.floor((paper.w - 2 * s.marginMm + s.gapMm) / (s.cardW + s.gapMm)));
  const rows = Math.max(1, Math.floor((paper.h - 2 * s.marginMm + s.gapMm) / (s.cardH + s.gapMm)));
  const perSheet = cols * rows;

  const baseQueue = useMemo(() => {
    const sel = products.filter((p) => selected.has(p.id));
    const sorted = [...sel].sort((a, b) => {
      if (s.sortOrder === "name") return a.name.localeCompare(b.name);
      if (s.sortOrder === "articleNo") return a.articleNo.localeCompare(b.articleNo);
      if (s.sortOrder === "karat") return a.karat.localeCompare(b.karat);
      if (s.sortOrder === "weight") return a.weightMg - b.weightMg;
      return 0;
    });
    const withCopies: Product[] = [];
    sorted.forEach((p) => { for (let i = 0; i < s.copies; i++) withCopies.push(p); });
    return withCopies;
  }, [products, selected, s.sortOrder, s.copies]);

  const slots = useMemo(() => {
    if (!baseQueue.length) return [];
    const total = Math.ceil(baseQueue.length / perSheet) * perSheet;
    return Array.from({ length: total }, (_, i) => {
      if (i < baseQueue.length) return baseQueue[i];
      return s.fillEmpty === "repeat" ? baseQueue[baseQueue.length - 1] : null;
    });
  }, [baseQueue, perSheet, s.fillEmpty]);

  const pages = Math.max(1, Math.ceil(slots.length / perSheet));

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `SAM-Cards-${s.paperSize}-${s.orientation}`,
    pageStyle: `
      @page { size: ${paper.w}mm ${paper.h}mm; margin: 0; }
      @media print { html, body { margin: 0; padding: 0; } }
    `,
  });

  function toggleProduct(id: string) {
    setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  const filteredProducts = useMemo(() => {
    const q = searchQ.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q) || p.articleNo.toLowerCase().includes(q) || p.karat.toLowerCase().includes(q));
  }, [products, searchQ]);

  const previewW = 340;
  const scale = previewW / paper.w;
  const previewH = paper.h * scale;
  const firstPageSlots = slots.slice(0, perSheet);
  const isChanged = JSON.stringify(s) !== JSON.stringify(DEFAULTS);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-playfair">Sheet Print</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {cols} col × {rows} row = <strong>{perSheet}</strong> cards per {s.paperSize}{s.orientation === "landscape" ? " landscape" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isChanged && (
            <button onClick={() => setS({ ...DEFAULTS })} className="flex items-center gap-1.5 px-3 h-9 rounded-md border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
          <button onClick={() => handlePrint()} disabled={baseQueue.length === 0}
            className="flex items-center gap-2 px-5 h-10 rounded-md bg-[#6b1a2a] text-white text-sm font-semibold hover:bg-[#5a1522] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <Printer className="w-4 h-4" />
            Print{pages > 0 && baseQueue.length > 0 ? ` · ${pages} page${pages > 1 ? "s" : ""}` : ""}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 items-start">

        {/* ── Left panel ── */}
        <div className="space-y-4">

          {/* Settings */}
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <button onClick={() => setSettingsOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/30 transition-colors">
              <span className="flex items-center gap-2"><Settings2 className="w-4 h-4 text-muted-foreground" />Sheet Settings</span>
              {settingsOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            {settingsOpen && (
              <div className="border-t border-border px-4 pb-4 pt-3 space-y-5">

                {/* Paper */}
                <div className="space-y-2">
                  <SectionLabel>Paper</SectionLabel>
                  <Select value={s.paperSize} onValueChange={(v) => v && update("paperSize", v)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PAPER_SIZES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <ToggleRow label="Orientation" value={s.orientation}
                    options={[{ value: "portrait", label: "Portrait" }, { value: "landscape", label: "Landscape" }]}
                    onChange={(v) => update("orientation", v)} />
                </div>

                <Separator />

                {/* Card dimensions */}
                <div className="space-y-2">
                  <SectionLabel>Card Size</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <MmInput label="Width" value={s.cardW} onChange={(v) => update("cardW", v)} min={20} max={200} />
                    <MmInput label="Height" value={s.cardH} onChange={(v) => update("cardH", v)} min={20} max={200} />
                  </div>
                </div>

                <Separator />

                {/* Pre-printed zones */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <SectionLabel>Pre-printed Zones</SectionLabel>
                    <span className="text-[10px] text-muted-foreground bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">skip these bands</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    The card&apos;s header and footer are already printed. Set how many mm to skip at the top and bottom so your content lands only in the white zone.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <MmInput label="Top (header)" value={s.topReservedMm} onChange={(v) => update("topReservedMm", v)} min={0} max={40} />
                    <MmInput label="Bottom (footer)" value={s.bottomReservedMm} onChange={(v) => update("bottomReservedMm", v)} min={0} max={40} />
                  </div>
                  <div className="rounded bg-muted/30 px-2.5 py-1.5 text-[11px] text-muted-foreground flex justify-between">
                    <span>White zone height</span>
                    <span className="font-semibold">{Math.max(0, s.cardH - s.topReservedMm - s.bottomReservedMm)} mm</span>
                  </div>
                </div>

                <Separator />

                {/* Spacing */}
                <div className="space-y-2">
                  <SectionLabel>Spacing</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <MmInput label="Margin" value={s.marginMm} onChange={(v) => update("marginMm", v)} min={0} max={30} />
                    <MmInput label="Gap" value={s.gapMm} onChange={(v) => update("gapMm", v)} min={0} max={20} />
                  </div>
                </div>

                <Separator />

                {/* Content visibility */}
                <div className="space-y-1">
                  <SectionLabel>Show / Hide Elements</SectionLabel>
                  <CheckRow label="Product photo" checked={s.showPhoto} onChange={(v) => update("showPhoto", v)} />
                  <CheckRow label="QR code" checked={s.showQr} onChange={(v) => update("showQr", v)} />
                  <CheckRow label="Article number" checked={s.showArticleNo} onChange={(v) => update("showArticleNo", v)} />
                  <CheckRow label="Product name" checked={s.showName} onChange={(v) => update("showName", v)} />
                  <CheckRow label="Weight & karat" checked={s.showWeightKarat} onChange={(v) => update("showWeightKarat", v)} />
                </div>

                <Separator />

                {/* QR / photo position */}
                <div className="space-y-2">
                  <SectionLabel>Photo & QR Position</SectionLabel>
                  <Select value={s.qrPosition} onValueChange={(v) => v && update("qrPosition", v as Settings["qrPosition"])}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Photo left · QR right (bottom)</SelectItem>
                      <SelectItem value="bottom-left">QR left · Photo right (bottom)</SelectItem>
                      <SelectItem value="top-right">Photo left · QR right (top)</SelectItem>
                      <SelectItem value="top-left">QR left · Photo right (top)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Copies & sort */}
                <div className="space-y-2">
                  <SectionLabel>Cards</SectionLabel>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Copies per product</span>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => update("copies", Math.max(1, s.copies - 1))} className="w-7 h-7 rounded border border-border text-sm font-bold hover:bg-muted transition-colors flex items-center justify-center">−</button>
                      <span className="w-7 text-center text-sm font-semibold">{s.copies}</span>
                      <button type="button" onClick={() => update("copies", Math.min(20, s.copies + 1))} className="w-7 h-7 rounded border border-border text-sm font-bold hover:bg-muted transition-colors flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Sort order</Label>
                    <Select value={s.sortOrder} onValueChange={(v) => v && update("sortOrder", v as Settings["sortOrder"])}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="selected">As selected</SelectItem>
                        <SelectItem value="name">By name (A–Z)</SelectItem>
                        <SelectItem value="articleNo">By article no.</SelectItem>
                        <SelectItem value="karat">By karat</SelectItem>
                        <SelectItem value="weight">By weight (light → heavy)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <ToggleRow label="Empty slots" value={s.fillEmpty}
                    options={[{ value: "blank", label: "Blank" }, { value: "repeat", label: "Repeat last" }]}
                    onChange={(v) => update("fillEmpty", v)} />
                </div>

                <Separator />

                {/* Appearance */}
                <div className="space-y-2">
                  <SectionLabel>Appearance</SectionLabel>
                  <ToggleRow label="Font style" value={s.fontStyle}
                    options={[{ value: "serif", label: "Serif" }, { value: "sans", label: "Sans" }]}
                    onChange={(v) => update("fontStyle", v)} />
                  <CheckRow label="Cut guide (dashed border)" checked={s.showCutGuide} onChange={(v) => update("showCutGuide", v)} />
                </div>

                <Separator />

                {/* Stats */}
                <div className="rounded-md bg-muted/40 p-3 text-xs space-y-1.5">
                  {[
                    ["Paper", `${paper.w} × ${paper.h} mm`],
                    ["Grid", `${cols} × ${rows}`],
                    ["Cards / sheet", perSheet],
                    ["White zone", `${Math.max(0, s.cardH - s.topReservedMm - s.bottomReservedMm)} mm tall`],
                    ["Selected", selected.size],
                    ["Total (×copies)", baseQueue.length],
                    ["Sheets needed", baseQueue.length ? pages : "—"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!settingsOpen && (
              <div className="border-t border-border px-4 py-2.5 flex flex-wrap gap-1.5">
                {[
                  `${s.paperSize} ${s.orientation === "landscape" ? "⟷" : "⟨⟩"}`,
                  `${s.cardW}×${s.cardH}mm`,
                  `${cols}×${rows} grid`,
                  `${Math.max(0, s.cardH - s.topReservedMm - s.bottomReservedMm)}mm white`,
                  s.copies > 1 ? `×${s.copies}` : null,
                  !s.showPhoto ? "no photo" : null,
                  !s.showQr ? "no QR" : null,
                ].filter(Boolean).map((t) => (
                  <Badge key={t as string} variant="secondary" className="text-xs">{t}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Product selector */}
          <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                Products
                {selected.size > 0 && <Badge className="bg-[#6b1a2a] text-white text-[10px] h-4 px-1.5">{selected.size}</Badge>}
              </span>
              <div className="flex gap-3 text-xs font-medium">
                <button onClick={() => setSelected(new Set(products.map((p) => p.id)))} className="text-[#6b1a2a] hover:underline">All</button>
                <button onClick={() => setSelected(new Set())} className="text-muted-foreground hover:underline">None</button>
              </div>
            </div>
            <div className="px-3 py-2 border-b border-border">
              <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search products…" className="h-8 text-xs" />
            </div>
            <div className="divide-y divide-border max-h-72 overflow-y-auto">
              {filteredProducts.length === 0 && <p className="text-xs text-muted-foreground text-center py-8">No products found.</p>}
              {filteredProducts.map((p) => {
                const checked = selected.has(p.id);
                return (
                  <button key={p.id} onClick={() => toggleProduct(p.id)}
                    className={cn("w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors", checked ? "bg-[#6b1a2a]/5" : "hover:bg-muted/30")}>
                    {checked ? <CheckSquare className="w-4 h-4 text-[#6b1a2a] shrink-0" /> : <Square className="w-4 h-4 text-muted-foreground/50 shrink-0" />}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.photoUrl} alt="" className="w-8 h-8 object-contain bg-gray-50 rounded shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{p.name}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{p.articleNo} · {p.karat}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Right: live preview ── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Live Preview — Page 1{pages > 1 ? ` of ${pages}` : ""}
            </h2>
            {baseQueue.length > 0 && (
              <span className="text-xs text-muted-foreground">{baseQueue.length} card{baseQueue.length !== 1 ? "s" : ""} total</span>
            )}
          </div>

          {/* Zone legend */}
          <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-[#6b1a2a]/10 border border-dashed border-[#6b1a2a]/30" />Pre-printed header</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-white border border-gray-300" />White print zone</span>
            <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-2 rounded-sm bg-amber-50 border border-dashed border-amber-300" />Pre-printed footer</span>
          </div>

          <div className="bg-white rounded-lg border border-border shadow-sm p-5 flex justify-center overflow-auto">
            {baseQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <LayoutGrid className="w-10 h-10 text-muted-foreground/20 mb-3" />
                <p className="text-sm font-medium text-muted-foreground">Select products to preview</p>
                <p className="text-xs text-muted-foreground mt-1 opacity-70">Configure the layout on the left, then pick products</p>
              </div>
            ) : (
              <div>
                <div style={{ width: previewW, height: previewH, background: "#f0ece8", border: "1px solid #e5e7eb", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", position: "relative", overflow: "hidden" }}>
                  {/* Margin guide */}
                  <div style={{ position: "absolute", top: s.marginMm * scale, left: s.marginMm * scale, right: s.marginMm * scale, bottom: s.marginMm * scale, border: "1px dashed #ccc", pointerEvents: "none" }} />

                  {Array.from({ length: rows }, (_, row) =>
                    Array.from({ length: cols }, (_, col) => {
                      const product = firstPageSlots[row * cols + col] ?? null;
                      const x = (s.marginMm + col * (s.cardW + s.gapMm)) * scale;
                      const y = (s.marginMm + row * (s.cardH + s.gapMm)) * scale;
                      const w = s.cardW * scale;
                      const h = s.cardH * scale;
                      // CardCell renders in mm; scale it down to pixels for the preview
                      const mmToPx = 3.7795;
                      const cellScale = w / (s.cardW * mmToPx);

                      return (
                        <div key={`${row}-${col}`} style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", border: "0.5px solid #d1d5db" }}>
                          {product ? (
                            <div style={{ transform: `scale(${cellScale})`, transformOrigin: "top left" }}>
                              <CardCell p={product} s={s} isPreview scale={cellScale} />
                            </div>
                          ) : (
                            <div style={{ width: "100%", height: "100%", background: "#f9fafb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 9, color: "#ccc" }}>empty</span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {pages > 1 && (
                  <p className="text-xs text-muted-foreground text-center mt-3">Page 1 of {pages} shown · all {pages} pages will print</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Print target — hidden off-screen so react-to-print can measure it */}
      <div ref={printRef} style={{ position: "fixed", top: "-9999px", left: "-9999px", pointerEvents: "none" }}>
        <PrintContent slots={slots} pages={pages} perSheet={perSheet} cols={cols} rows={rows} s={s} paper={paper} />
      </div>
    </div>
  );
}
