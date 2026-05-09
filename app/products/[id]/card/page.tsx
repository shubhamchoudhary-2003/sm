import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import QRCode from "qrcode";
import CardPreview from "@/components/CardPreview";
import PrintButton from "@/components/PrintButton";
import Link from "next/link";

export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const productUrl = `${baseUrl}/product/${product.articleNo}`;

  const qrSvg = await QRCode.toString(productUrl, {
    type: "svg",
    margin: 0,
    color: { dark: "#000000", light: "#ffffff" },
    width: 83, // ~22mm at 96dpi
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-[#6b1a2a] text-white px-6 py-3 flex items-center gap-4 shadow-lg print:hidden">
        <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center text-xs font-bold text-[#6b1a2a]">SM</div>
        <Link href="/dashboard" className="text-sm text-red-200 hover:text-white">← Dashboard</Link>
        <span className="text-sm text-white font-semibold">Print Card</span>
      </nav>

      {/* Screen view */}
      <div className="print:hidden p-8 flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 font-playfair">{product.name}</h1>
          <p className="text-sm text-gray-500">{product.articleNo}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-xs text-gray-400 text-center mb-3 uppercase tracking-widest">Card Preview (White Zone — 54mm × 65mm)</p>
          {/* Visual scale: 1mm = 3.78px at 96dpi. We show at ~3x for readability */}
          <div style={{ transform: "scale(2.5)", transformOrigin: "top center", marginBottom: "calc(65mm * 1.5)" }}>
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

        <div className="flex gap-4">
          <PrintButton />
          <Link
            href={`/products/${product.id}/edit`}
            className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-200 transition"
          >
            Edit Product
          </Link>
        </div>

        <p className="text-xs text-gray-400 max-w-sm text-center">
          Place the pre-printed card in your printer. Click Print — only the white zone content will be printed at exact 54mm × 65mm size.
        </p>
      </div>

      {/* Print-only output — exact mm dimensions */}
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
          @page {
            size: 54mm 65mm;
            margin: 0;
          }
          body * {
            visibility: hidden;
          }
          #card-print-zone,
          #card-print-zone * {
            visibility: visible;
          }
          #card-print-zone {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
