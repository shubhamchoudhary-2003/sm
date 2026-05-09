import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteS3Object, keyFromUrl } from "@/lib/s3";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(product);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { articleNo, name, weightMg, karat, photoUrl } = body;

  const product = await prisma.product.update({
    where: { id },
    data: { articleNo, name, weightMg: parseInt(weightMg), karat, photoUrl },
  });
  return Response.json(product);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });

  try {
    await deleteS3Object(keyFromUrl(product.photoUrl));
  } catch {
    // ignore S3 errors on delete
  }

  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true });
}
