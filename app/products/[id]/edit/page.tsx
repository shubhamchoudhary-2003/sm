import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-[#6b1a2a] text-white px-6 py-3 flex items-center gap-4 shadow-lg">
        <div className="w-8 h-8 bg-[#c9a84c] rounded-full flex items-center justify-center text-xs font-bold text-[#6b1a2a]">SM</div>
        <Link href="/dashboard" className="text-sm text-red-200 hover:text-white">← Dashboard</Link>
        <span className="text-sm text-white font-semibold">Edit Product</span>
      </nav>
      <main className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 font-playfair">Edit Product</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <ProductForm product={product} />
        </div>
      </main>
    </div>
  );
}
