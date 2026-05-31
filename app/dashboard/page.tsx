import { prisma } from "@/lib/db";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import ProductsView from "@/components/ProductsView";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-playfair">Products</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {products.length} {products.length === 1 ? "item" : "items"} in catalogue
          </p>
        </div>
        <Link href="/products/new" className={cn(buttonVariants(), "bg-[#6b1a2a] hover:bg-[#5a1522] text-white gap-2")}>
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <ProductsView products={products} />
    </div>
  );
}
