import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground -ml-2")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight font-playfair truncate">Edit Product</h1>
          <p className="text-xs text-muted-foreground truncate">{product.articleNo} · {product.name}</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
