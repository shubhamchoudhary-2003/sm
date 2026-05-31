import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Find all articleNo values matching NK followed by digits
  const products = await prisma.product.findMany({
    select: { articleNo: true },
    where: { articleNo: { startsWith: "NK" } },
  });

  let max = 0;
  for (const { articleNo } of products) {
    const num = parseInt(articleNo.slice(2), 10);
    if (!isNaN(num) && num > max) max = num;
  }

  const next = `NK${String(max + 1).padStart(4, "0")}`;
  return Response.json({ articleNo: next });
}
