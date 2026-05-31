import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import SheetPrintView from "@/components/SheetPrintView";

export default async function PrintSheetPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  // Generate QR SVGs server-side
  const QRCode = (await import("qrcode")).default;
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  const productsWithQr = await Promise.all(
    products.map(async (p) => {
      const qrSvg = await QRCode.toString(`${baseUrl}/product/${p.articleNo}`, {
        type: "svg",
        margin: 1,
        color: { dark: "#000000", light: "#ffffff" },
        width: 200,
      });
      return { ...p, qrSvg };
    })
  );

  return <SheetPrintView products={productsWithQr} />;
}
