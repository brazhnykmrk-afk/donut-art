import { S3Client } from "@aws-sdk/client-s3";

/**
 * Thin abstraction over S3-compatible object storage (Cloudflare R2).
 * Swapping providers only requires changing environment variables.
 */

export const storageConfig = {
  bucket: process.env.R2_BUCKET_NAME ?? "",
  publicUrl: (process.env.R2_PUBLIC_URL ?? "").replace(/\/+$/, ""),
};

/**
 * Which storage driver to use:
 *   "local" — files on this computer, in public/uploads (development)
 *   "r2"    — Cloudflare R2 / any S3-compatible bucket (production)
 * Set STORAGE_DRIVER explicitly, or it defaults to "r2" when R2 is configured.
 */
export const storageDriver: "r2" | "local" =
  process.env.STORAGE_DRIVER === "local"
    ? "local"
    : process.env.STORAGE_DRIVER === "r2" || process.env.R2_ACCOUNT_ID
      ? "r2"
      : "local";

let client: S3Client | null = null;

export function getStorageClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
      },
    });
  }
  return client;
}

/** Public URL for a stored object key. */
export function publicImageUrl(key: string): string {
  if (storageDriver === "local") {
    // Served straight from public/uploads by Next.js.
    return `/uploads/${key}`;
  }
  return `${storageConfig.publicUrl}/${key}`;
}
