import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const BUCKET = process.env.AWS_BUCKET_NAME ?? "shubham";
const ENDPOINT = process.env.AWS_ENDPOINT ?? "https://8a245c8aab6033cccfc3829fb5537026.r2.cloudflarestorage.com";
const PUBLIC_URL = process.env.R2_PUBLIC_URL ?? "https://pub-678627176c0f41f793c16e6b1ebb7fba.r2.dev";

export const s3 = new S3Client({
  region: "auto",
  endpoint: ENDPOINT,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
  forcePathStyle: true,
  // R2 doesn't support AWS SDK v3 default CRC32 checksums
  requestChecksumCalculation: "WHEN_REQUIRED" as const,
  responseChecksumValidation: "WHEN_REQUIRED" as const,
});

export async function getPresignedUploadUrl(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  });
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 300 });
  const publicUrl = `${PUBLIC_URL}/${key}`;
  return { uploadUrl, publicUrl };
}

export async function deleteS3Object(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

export function keyFromUrl(url: string): string {
  const base = PUBLIC_URL.endsWith("/") ? PUBLIC_URL : PUBLIC_URL + "/";
  return url.replace(base, "");
}
