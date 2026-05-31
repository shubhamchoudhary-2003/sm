import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ articleNo: string }>;
}): Promise<Metadata> {
  const { articleNo } = await params;
  const product = await prisma.product.findUnique({ where: { articleNo } });
  return {
    title: product ? `${product.name} — Sri Alankar Mandir` : "Product Not Found",
    description: product
      ? `${product.name} · ${product.weightMg}mg · ${product.karat} Gold · Article ${product.articleNo}`
      : undefined,
    viewport: "width=device-width, initial-scale=1",
  };
}

export default async function ProductPublicPage({
  params,
}: {
  params: Promise<{ articleNo: string }>;
}) {
  const { articleNo } = await params;
  const product = await prisma.product.findUnique({ where: { articleNo } });
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-[#0d0608] flex flex-col items-center pb-14"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #2a0d14 0%, #0d0608 60%)" }}
    >
      {/* Brand bar */}
      <div className="w-full flex items-center justify-center gap-3 px-6 pt-5">
        <div className="flex-1 max-w-[80px] h-px" style={{ background: "linear-gradient(to right, transparent, #c9a84c44)" }} />
        <div className="flex items-center gap-2.5 rounded-full px-4 py-2 border"
          style={{ background: "rgba(201,168,76,0.08)", borderColor: "rgba(201,168,76,0.25)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-[#3a0a14] font-bold text-sm font-playfair shrink-0"
            style={{ background: "linear-gradient(135deg,#c9a84c,#f0d080,#a07830)" }}
          >SM</div>
          <div>
            <div className="text-[13px] font-semibold text-[#f5e6c8] font-playfair">Sri Alankar Mandir</div>
            <div className="text-[9px] text-[#c9a84c] tracking-[2px] uppercase">Fine Jewellery · Est. 1963</div>
          </div>
        </div>
        <div className="flex-1 max-w-[80px] h-px" style={{ background: "linear-gradient(to left, transparent, #c9a84c44)" }} />
      </div>

      {/* Hero image */}
      <div className="w-full max-w-sm mx-auto mt-7 px-5">
        <div className="relative w-full aspect-square rounded-3xl overflow-hidden border flex items-center justify-center p-7"
          style={{
            background: "radial-gradient(ellipse at 50% 30%, #1e1218, #0d0608)",
            borderColor: "rgba(201,168,76,0.2)",
          }}
        >
          {/* top shine */}
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: "linear-gradient(to right, transparent, #c9a84c88, transparent)" }} />
          {/* corner accents */}
          {[["top-3 left-3 border-t border-l rounded-tl", "border-t-[#c9a84c] border-l-[#c9a84c]"],
            ["top-3 right-3 border-t border-r rounded-tr", "border-t-[#c9a84c] border-r-[#c9a84c]"],
            ["bottom-3 left-3 border-b border-l rounded-bl", "border-b-[#c9a84c] border-l-[#c9a84c]"],
            ["bottom-3 right-3 border-b border-r rounded-br", "border-b-[#c9a84c] border-r-[#c9a84c]"],
          ].map(([pos, border], i) => (
            <div key={i} className={`absolute w-4 h-4 opacity-50 ${pos} ${border}`} />
          ))}
          {/* glow */}
          <div className="absolute inset-5 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)" }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.photoUrl}
            alt={product.name}
            className="w-full h-full object-contain relative z-10"
            style={{ filter: "drop-shadow(0 8px 32px rgba(201,168,76,0.3))" }}
            loading="eager"
            fetchPriority="high"
          />
        </div>
      </div>

      {/* Info card */}
      <div className="w-full max-w-sm mx-auto mt-5 px-5">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          {/* Name */}
          <div className="px-6 py-5 border-b text-center" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <h1 className="font-playfair text-xl font-bold leading-snug"
              style={{
                background: "linear-gradient(90deg,#f5e6c8 30%,#c9a84c 50%,#f5e6c8 70%)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                animation: "shimmer 4s linear infinite",
              }}
            >{product.name}</h1>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c]" />
              <span className="font-mono text-[11px] font-medium text-[#c9a84c] tracking-[1.5px] uppercase">
                {product.articleNo}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-white/10" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label: "Weight", value: product.weightMg, unit: "mg" },
              { label: "Purity", value: product.karat.replace("K", ""), unit: "kt" },
            ].map((s) => (
              <div key={s.label} className="py-5 text-center px-4" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <div className="text-[9px] font-medium tracking-[2px] uppercase mb-1.5" style={{ color: "rgba(255,255,255,0.35)" }}>{s.label}</div>
                <div className="font-playfair text-xl font-bold text-[#f5e6c8]">
                  {s.value}<span className="text-sm font-normal text-[#c9a84c] ml-0.5">{s.unit}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Purity badge */}
          <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
            <div className="flex items-center justify-center gap-2 rounded-xl py-3 px-5"
              style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.06))", border: "1px solid rgba(201,168,76,0.3)" }}
            >
              <span className="text-lg">✦</span>
              <span className="text-xs text-white/50">Certified</span>
              <span className="font-playfair text-base font-bold text-[#c9a84c]">{product.karat} Gold</span>
              <span className="text-xs text-white/50">· Hallmarked</span>
            </div>
          </div>

          {/* Contact */}
          <div className="px-5 py-3.5 flex items-center justify-center gap-2">
            <span className="text-sm opacity-40">✉</span>
            <span className="text-[11px] tracking-wide" style={{ color: "rgba(255,255,255,0.3)" }}>
              srialankarmandir.muz@gmail.com
            </span>
          </div>
        </div>
      </div>

      {/* Quality seal */}
      <div className="w-full max-w-sm mx-auto mt-4 px-5">
        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5"
          style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)" }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-base shrink-0"
            style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.05))", border: "1px solid rgba(201,168,76,0.2)" }}
          >🛡️</div>
          <div>
            <div className="text-[11px] font-semibold text-[#c9a84c] tracking-[0.5px]">Quality Guaranteed</div>
            <div className="text-[10px] mt-0.5 leading-snug" style={{ color: "rgba(255,255,255,0.3)" }}>
              Packed after rigid quality check on weight, purity &amp; workmanship
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}
