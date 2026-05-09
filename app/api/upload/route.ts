import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/s3";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { contentType, extension } = await req.json();
  if (!contentType || !extension) {
    return Response.json({ error: "contentType and extension required" }, { status: 400 });
  }

  const key = `products/${randomUUID()}.${extension}`;
  const { uploadUrl, publicUrl } = await getPresignedUploadUrl(key, contentType);
  return Response.json({ uploadUrl, publicUrl });
}
