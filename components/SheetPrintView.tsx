"use client";

import { useState, useMemo, useCallback } from "react";
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
  marginHMm: 17,
  marginVMm: 16,
  gapHMm: 4,
  gapVMm: 3,
  cardW: 54,
  cardH: 86,
  copies: 1,
  showCutGuide: true,
  fontStyle: "sans" as "serif" | "sans",
  sortOrder: "selected" as "selected" | "name" | "articleNo" | "karat" | "weight",
  fillEmpty: "blank" as "blank" | "repeat",
  topReservedMm: 18,
  bottomReservedMm: 9,
  showPhoto: true,
  showQr: true,
  showArticleNo: true,
  showName: true,
  showWeightKarat: true,
  // Right column sizing (% of card width)
  rightColPct: 42,
  // QR size (% of right column width)
  qrSizePct: 90,
  // Photo size (% of right column width)
  photoSizePct: 90,
};

type Settings = typeof DEFAULTS;

function formatWeight(mg: number) {
  if (mg >= 1000) return `${parseFloat((mg / 1000).toFixed(3))}g`;
  return `${mg}mg`;
}

function getFont(style: "serif" | "sans") {
  return style === "serif" ? "Georgia,'Times New Roman',serif" : "Arial,Helvetica,sans-serif";
}

// ── Builds the inner HTML string for one card (used in print iframe) ──────────
function cardHtml(p: Product, s: Settings): string {
  const font = getFont(s.fontStyle);
  const whiteH = s.cardH - s.topReservedMm - s.bottomReservedMm;
  const rightColW = s.cardW * (s.rightColPct / 100);
  const leftColW = s.cardW - rightColW - 3; // 3mm gap between cols
  const qrSize = rightColW * (s.qrSizePct / 100);
  const photoSize = rightColW * (s.photoSizePct / 100);

  const infoRows = [
    s.showArticleNo   ? `<div style="margin-bottom:1.5mm"><div style="font-size:4pt;color:#999;font-weight:bold;text-transform:uppercase;letter-spacing:0.4pt;font-family:Arial,sans-serif">Article No.</div><div style="font-size:9.5pt;font-weight:700;color:#000;line-height:1.2;font-family:${font}">${p.articleNo}</div></div>` : "",
    s.showName        ? `<div style="margin-bottom:1.5mm"><div style="font-size:4pt;color:#999;font-weight:bold;text-transform:uppercase;letter-spacing:0.4pt;font-family:Arial,sans-serif">Name</div><div style="font-size:9pt;font-weight:700;color:#000;line-height:1.25;font-family:${font}">${p.name}</div></div>` : "",
    s.showWeightKarat ? `<div><div style="font-size:4pt;color:#999;font-weight:bold;text-transform:uppercase;letter-spacing:0.4pt;font-family:Arial,sans-serif">Weight &amp; Karat</div><div style="font-size:9pt;font-weight:700;color:#000;font-family:${font}">${formatWeight(p.weightMg)} &#8211; ${p.karat}</div></div>` : "",
  ].join("");

  // Strip width/height attrs from the SVG so it fills our container
  const qrSvgFixed = p.qrSvg
    .replace(/\s+width="[^"]*"/, "")
    .replace(/\s+height="[^"]*"/, "");

  const qrCol = s.showQr
    ? `<div style="width:${qrSize}mm;height:${qrSize}mm;margin:0 auto;overflow:hidden;flex-shrink:0">${qrSvgFixed}</div>`
    : "";

  const photoCol = s.showPhoto
    ? `<div style="width:${photoSize}mm;height:${photoSize}mm;margin:0 auto;overflow:hidden;background:transparent;display:flex;align-items:center;justify-content:center"><img src="${p.photoUrl}" style="width:100%;height:100%;object-fit:contain;filter:brightness(1.12) contrast(0.92)" /></div>`
    : "";

  const scanLabel = s.showQr ? `<div style="font-size:4.5pt;font-weight:bold;color:#333;text-align:center;margin-bottom:0.5mm;font-family:Arial,sans-serif">Scan Here</div>` : "";

  const cutOutline = s.showCutGuide ? "border:0.2mm dashed #bbb;" : "border:none;";

  return `
    <div style="width:${s.cardW}mm;height:${s.cardH}mm;box-sizing:border-box;overflow:hidden;${cutOutline}display:flex;flex-direction:column;">
      <div style="height:${s.topReservedMm}mm;flex-shrink:0"></div>
      <div style="flex:1;min-height:0;background:#fff;padding:2mm 1.5mm 2mm 3mm;box-sizing:border-box;display:flex;flex-direction:row;gap:1mm;overflow:hidden;">
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden;">
          <div>${infoRows}</div>
          ${photoCol}
        </div>
        <div style="width:${rightColW}mm;flex-shrink:0;display:flex;flex-direction:column;justify-content:flex-start;align-items:center;">
          <div style="width:100%">
            ${scanLabel}
            ${qrCol}
          </div>
        </div>
      </div>
      <div style="height:${s.bottomReservedMm}mm;flex-shrink:0"></div>
    </div>
  `;
}

// ── React card for preview (same layout, React elements) ──────────────────────
function CardCell({ p, s, isPreview = false, scale = 1 }: { p: Product; s: Settings; isPreview?: boolean; scale?: number }) {
  const font = getFont(s.fontStyle);
  const whiteH = s.cardH - s.topReservedMm - s.bottomReservedMm;
  const rightColW = s.cardW * (s.rightColPct / 100);
  const qrSize = rightColW * (s.qrSizePct / 100);
  const photoSize = rightColW * (s.photoSizePct / 100);

  const infoRows = [
    s.showArticleNo   && { lbl: "Article No.",     val: p.articleNo,                              sz: "9.5pt" },
    s.showName        && { lbl: "Name",             val: p.name,                                   sz: "9pt" },
    s.showWeightKarat && { lbl: "Weight & Karat",   val: `${formatWeight(p.weightMg)} – ${p.karat}`, sz: "9pt" },
  ].filter(Boolean) as { lbl: string; val: string; sz: string }[];

  return (
    <div style={{
      width: `${s.cardW}mm`, height: `${s.cardH}mm`,
      boxSizing: "border-box", overflow: "hidden",
      border: s.showCutGuide ? "0.2mm dashed #bbb" : "none",
      display: "flex", flexDirection: "column",
    }}>
      {/* Top reserved band */}
      <div style={{
        height: `${s.topReservedMm}mm`, flexShrink: 0,
        background: isPreview ? "rgba(107,26,42,0.07)" : "transparent",
        borderBottom: isPreview ? "0.3mm dashed rgba(107,26,42,0.35)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isPreview && <span style={{ fontSize: `${5.5 / scale}pt`, color: "rgba(107,26,42,0.45)" }}>pre-printed header</span>}
      </div>

      {/* White zone: left info col + right QR/photo col */}
      <div style={{
        flex: 1, minHeight: 0, backgroundColor: "#fff",
        padding: "2mm 1.5mm 2mm 0.5mm", boxSizing: "border-box",
        display: "flex", flexDirection: "row", gap: "1mm", overflow: "hidden",
      }}>
        {/* Left: text info top, photo bottom-left */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
          <div>
            {infoRows.map(({ lbl, val, sz }, i) => (
              <div key={i} style={{ marginBottom: i < infoRows.length - 1 ? "2mm" : 0 }}>
                <div style={{ fontSize: "4pt", color: "#999", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.4pt", fontFamily: "Arial,sans-serif" }}>{lbl}</div>
                <div style={{ fontSize: sz, fontWeight: 700, color: "#000", lineHeight: 1.25, fontFamily: font }}>{val}</div>
              </div>
            ))}
          </div>
          {s.showPhoto && (
            <div style={{ width: `${photoSize}mm`, height: `${photoSize}mm`, overflow: "hidden", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.photoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(1.12) contrast(0.92)" }} />
            </div>
          )}
        </div>

        {/* Right: QR top-right only */}
        <div style={{ width: `${rightColW}mm`, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "center" }}>
          {s.showQr && (
            <div style={{ width: "100%" }}>
              <div style={{ fontSize: "4.5pt", fontWeight: "bold", color: "#333", textAlign: "center", marginBottom: "0.5mm", fontFamily: "Arial,sans-serif" }}>Scan Here</div>
              <div style={{ width: `${qrSize}mm`, height: `${qrSize}mm`, margin: "0 auto", overflow: "hidden", flexShrink: 0 }}
                dangerouslySetInnerHTML={{ __html: p.qrSvg.replace(/\s+width="[^"]*"/, "").replace(/\s+height="[^"]*"/, "") }} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom reserved band */}
      <div style={{
        height: `${s.bottomReservedMm}mm`, flexShrink: 0,
        background: isPreview ? "rgba(201,168,76,0.12)" : "transparent",
        borderTop: isPreview ? "0.3mm dashed rgba(201,168,76,0.5)" : "none",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {isPreview && <span style={{ fontSize: `${5.5 / scale}pt`, color: "rgba(150,110,20,0.6)" }}>pre-printed footer</span>}
      </div>
    </div>
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

function PctInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <Input type="number" min={20} max={80} value={value} onChange={(e) => onChange(Math.min(80, Math.max(20, Number(e.target.value))))} className="h-9 pr-6 text-sm" />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">%</span>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function SheetPrintView({ products }: { products: Product[] }) {
  const [s, setS] = useState<Settings>({ ...DEFAULTS });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settingsOpen, setSettingsOpen] = useState(true);
  const [searchQ, setSearchQ] = useState("");
  const [showPrintTip, setShowPrintTip] = useState(false);

  function update<K extends keyof Settings>(key: K, val: Settings[K]) {
    setS((prev) => ({ ...prev, [key]: val }));
  }

  const rawPaper = PAPER_SIZES[s.paperSize];
  const paper = s.orientation === "landscape" ? { w: rawPaper.h, h: rawPaper.w } : { w: rawPaper.w, h: rawPaper.h };

  const cols = Math.max(1, Math.floor((paper.w - 2 * s.marginHMm + s.gapHMm) / (s.cardW + s.gapHMm)));
  const rows = Math.max(1, Math.floor((paper.h - 2 * s.marginVMm + s.gapVMm) / (s.cardH + s.gapVMm)));
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
    const out: Product[] = [];
    sorted.forEach((p) => { for (let i = 0; i < s.copies; i++) out.push(p); });
    return out;
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

  // ── Print via iframe ────────────────────────────────────────────────────────
  function triggerPrint() {
    if (!baseQueue.length) return;
    setShowPrintTip(true);
  }

  const handlePrint = useCallback(() => {
    setShowPrintTip(false);
    if (!baseQueue.length) return;

    // Build all pages as raw HTML
    const pagesHtml = Array.from({ length: pages }, (_, pageIdx) => {
      const pageSlots = slots.slice(pageIdx * perSheet, (pageIdx + 1) * perSheet);
      const cards = Array.from({ length: rows }, (_, row) =>
        Array.from({ length: cols }, (_, col) => {
          const product = pageSlots[row * cols + col] ?? null;
          const left = s.marginHMm + col * (s.cardW + s.gapHMm);
          const top  = s.marginVMm + row * (s.cardH + s.gapVMm);
          if (!product) return "";
          return `<div style="position:absolute;left:${left}mm;top:${top}mm">${cardHtml(product, s)}</div>`;
        }).join("")
      ).join("");

      const pageBreak = pageIdx < pages - 1 ? "page-break-after:always;break-after:page;" : "";
      return `<div style="position:relative;width:${paper.w}mm;height:${paper.h}mm;overflow:hidden;${pageBreak}">${cards}</div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>
        *{box-sizing:border-box;margin:0;padding:0}
        @page{size:${paper.w}mm ${paper.h}mm;margin:0}
        html,body{width:${paper.w}mm;margin:0;padding:0;background:#fff}
        img{display:block;image-rendering:high-quality}
        svg{display:block!important;width:100%!important;height:100%!important}
      </style>
    </head><body>${pagesHtml}</body></html>`;

    const iframe = document.createElement("iframe");
    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none";
    document.body.appendChild(iframe);

    // Use onload to ensure the iframe has fully parsed the HTML before
    // querying for images — doc.querySelectorAll right after doc.write()
    // runs before the parser finishes and returns 0 elements, causing an
    // immediate blank print.
    iframe.onload = () => {
      const doc = iframe.contentDocument!;
      const imgs = Array.from(doc.querySelectorAll("img"));
      const loadAll = imgs.map((img) => new Promise<void>((res) => {
        if (img.complete) { res(); return; }
        img.onload = () => res();
        img.onerror = () => res();
      }));
      Promise.all(loadAll).then(() => {
        iframe.contentWindow!.focus();
        iframe.contentWindow!.print();
        setTimeout(() => document.body.removeChild(iframe), 2000);
      });
    };

    const doc = iframe.contentDocument!;
    doc.open();
    doc.write(html);
    doc.close();
  }, [baseQueue, slots, pages, perSheet, cols, rows, s, paper]);

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

      {/* Print quality reminder modal */}
      {showPrintTip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#6b1a2a]/10 flex items-center justify-center shrink-0">
                <Printer className="w-5 h-5 text-[#6b1a2a]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Set printer to high quality</h2>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  In the print dialog, make sure to:
                </p>
              </div>
            </div>

            <ol className="space-y-2.5 text-sm">
              {[
                { n: 1, t: "Print Quality", d: 'Set to "Best" or "High" in your printer dialog' },
                { n: 2, t: "Media Type", d: 'Choose "Photo Paper" or "Glossy" if available' },
                { n: 3, t: "Page Sizing", d: 'Set to "Actual Size" — never "Fit to Page"' },
                { n: 4, t: "Colour", d: 'Keep "Colour" selected, not Grayscale' },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#6b1a2a] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{n}</span>
                  <span><span className="font-semibold text-gray-800">{t}:</span> <span className="text-muted-foreground">{d}</span></span>
                </li>
              ))}
            </ol>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setShowPrintTip(false)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 py-2.5 rounded-lg bg-[#6b1a2a] text-white text-sm font-semibold hover:bg-[#5a1522] transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" /> Print now
              </button>
            </div>
          </div>
        </div>
      )}

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
          <button onClick={triggerPrint} disabled={baseQueue.length === 0}
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
                    <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5">skip these bands</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Header &amp; footer already printed — set mm to skip so content lands in the white zone only.
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

                {/* Layout sizing */}
                <div className="space-y-2">
                  <SectionLabel>Layout Sizing</SectionLabel>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    Right column (QR + photo) width as % of card. QR &amp; photo size as % of that column.
                  </p>
                  <PctInput label="Right column width %" value={s.rightColPct} onChange={(v) => update("rightColPct", v)} />
                  <div className="grid grid-cols-2 gap-2">
                    <PctInput label="QR size %" value={s.qrSizePct} onChange={(v) => update("qrSizePct", v)} />
                    <PctInput label="Photo size %" value={s.photoSizePct} onChange={(v) => update("photoSizePct", v)} />
                  </div>
                </div>

                <Separator />

                {/* Spacing */}
                <div className="space-y-2">
                  <SectionLabel>Spacing</SectionLabel>
                  <div className="grid grid-cols-2 gap-2">
                    <MmInput label="Margin L/R" value={s.marginHMm} onChange={(v) => update("marginHMm", v)} min={0} max={50} />
                    <MmInput label="Margin T/B" value={s.marginVMm} onChange={(v) => update("marginVMm", v)} min={0} max={50} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MmInput label="Gap H" value={s.gapHMm} onChange={(v) => update("gapHMm", v)} min={0} max={20} />
                    <MmInput label="Gap V" value={s.gapVMm} onChange={(v) => update("gapVMm", v)} min={0} max={20} />
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
                  <div style={{ position: "absolute", top: s.marginVMm * scale, left: s.marginHMm * scale, right: s.marginHMm * scale, bottom: s.marginVMm * scale, border: "1px dashed #ccc", pointerEvents: "none" }} />

                  {Array.from({ length: rows }, (_, row) =>
                    Array.from({ length: cols }, (_, col) => {
                      const product = firstPageSlots[row * cols + col] ?? null;
                      const x = (s.marginHMm + col * (s.cardW + s.gapHMm)) * scale;
                      const y = (s.marginVMm + row * (s.cardH + s.gapVMm)) * scale;
                      const w = s.cardW * scale;
                      const h = s.cardH * scale;
                      const cellScale = w / (s.cardW * 3.7795);

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
    </div>
  );
}
