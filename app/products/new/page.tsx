import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProductForm from "@/components/ProductForm";
import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/db";

async function getNextArticleNo(): Promise<string> {
  const products = await prisma.product.findMany({
    select: { articleNo: true },
    where: { articleNo: { startsWith: "NK" } },
  });
  let max = 0;
  for (const { articleNo } of products) {
    const num = parseInt(articleNo.slice(2), 10);
    if (!isNaN(num) && num > max) max = num;
  }
  return `NK${String(max + 1).padStart(4, "0")}`;
}

export default async function NewProductPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const suggestedArticleNo = await getNextArticleNo();

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1.5 text-muted-foreground -ml-2")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight font-playfair">Add Product</h1>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6">
        <ProductForm suggestedArticleNo={suggestedArticleNo} />
      </div>
    </div>
  );
}
