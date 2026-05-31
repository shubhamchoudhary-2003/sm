import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import CardPreview from "@/components/CardPreview";
import PrintButton from "@/components/PrintButton";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function CardPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const productUrl = `${baseUrl}/product/${product.articleNo}`;
  const qrSvg = await QRCode.toString(productUrl, {
    type: "svg",
    margin: 1,
    color: { dark: "#000000", light: "#ffffff" },
    width: 200,
  });

  // 54mm × 65mm at 96dpi = 204px × 246px. We display at 2.5× = 510px × 615px
  const SCALE = 2.5;
  const CARD_W_PX = 204;
  const CARD_H_PX = 246;

  return (
    <div>
      <div className="print:hidden space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground -ml-2")}>
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight font-playfair truncate">{product.name}</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground font-mono">{product.articleNo}</span>
              <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">{product.karat}</Badge>
              <span className="text-xs text-muted-foreground">{product.weightMg} mg</span>
            </div>
          </div>
          <Link href={`/products/${product.id}/edit`} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5 shrink-0")}>
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>

        {/* Two-column on desktop, stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5 items-start">

          {/* Card preview */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-5 text-center">
              Card Preview — 54mm × 65mm
            </p>
            {/*
              Container is exactly CARD_W_PX * SCALE wide and CARD_H_PX * SCALE tall.
              The inner div is the natural card size; CSS scale doubles it from top-left.
            */}
            <div className="flex justify-center">
              <div
                style={{
                  width: CARD_W_PX * SCALE,
                  height: CARD_H_PX * SCALE,
                  position: "relative",
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ position: "absolute", top: 0, left: 0, transform: `scale(${SCALE})`, transformOrigin: "top left" }}>
                  <CardPreview
                    articleNo={product.articleNo}
                    name={product.name}
                    weightMg={product.weightMg}
                    karat={product.karat}
                    photoUrl={product.photoUrl}
                    qrSvg={qrSvg}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel — actions + instructions */}
          <div className="space-y-4">
            {/* Print action */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <h2 className="text-sm font-semibold">Print this card</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Place the pre-printed CR80 card in your printer with the white zone facing up, then click Print.
              </p>
              <PrintButton />
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Specs</h2>
              <div className="space-y-2 text-sm">
                {[
                  ["Print zone", "54mm × 65mm"],
                  ["Full card (CR80)", "54mm × 86mm"],
                  ["Page margin", "0mm"],
                  ["QR links to", `/product/${product.articleNo}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-right font-mono text-xs">{v}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <ol className="space-y-2 text-xs text-muted-foreground">
                {[
                  "Load CR80 card — white zone up.",
                  "Click Print Card above.",
                  "Set size 54×65mm, margins 0.",
                  "Confirm and print.",
                ].map((s, i) => (
                  <li key={i} className="flex gap-2.5 items-start">
                    <span className="w-4 h-4 rounded-full bg-[#6b1a2a] text-white text-[9px] flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Print-only output */}
      <div className="hidden print:block">
        <CardPreview
          articleNo={product.articleNo}
          name={product.name}
          weightMg={product.weightMg}
          karat={product.karat}
          photoUrl={product.photoUrl}
          qrSvg={qrSvg}
        />
      </div>

      <style>{`
        @media print {
          @page { size: 54mm 65mm; margin: 0; }
          body * { visibility: hidden; }
          #card-print-zone, #card-print-zone * { visibility: visible; }
          #card-print-zone { position: fixed !important; top: 0 !important; left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
