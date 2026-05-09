import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(products);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { articleNo, name, weightMg, karat, photoUrl } = body;

  if (!articleNo || !name || !weightMg || !karat || !photoUrl) {
    return Response.json({ error: "All fields required" }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: { articleNo, name, weightMg: parseInt(weightMg), karat, photoUrl },
  });
  return Response.json(product, { status: 201 });
}
