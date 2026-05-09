import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 font-playfair">Products</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} items</p>
        </div>
        <Link
          href="/products/new"
          className="bg-[#6b1a2a] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#5a1522] transition"
        >
          + Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">💎</div>
          <p className="text-lg">No products yet</p>
          <Link href="/products/new" className="text-[#6b1a2a] underline mt-2 inline-block text-sm">Add your first product</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="aspect-square bg-gray-50 relative">
                <img
                  src={p.photoUrl}
                  alt={p.name}
                  className="w-full h-full object-contain p-4"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-gray-400 font-mono">{p.articleNo}</p>
                <p className="font-semibold text-gray-800 text-sm mt-0.5 leading-tight">{p.name}</p>
                <p className="text-xs text-gray-500 mt-1">{p.weightMg}Mg · {p.karat}</p>
                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/products/${p.id}/card`}
                    className="flex-1 bg-[#6b1a2a] text-white text-xs py-1.5 rounded text-center font-semibold hover:bg-[#5a1522] transition"
                  >
                    Print Card
                  </Link>
                  <Link
                    href={`/products/${p.id}/edit`}
                    className="flex-1 bg-gray-100 text-gray-700 text-xs py-1.5 rounded text-center font-semibold hover:bg-gray-200 transition"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={p.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
