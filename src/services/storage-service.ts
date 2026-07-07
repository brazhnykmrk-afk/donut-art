import "server-only";

import crypto from "node:crypto";

import { promises as fs } from "node:fs";
import path from "node:path";

import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import {
  getStorageClient,
  publicImageUrl,
  storageConfig,
  storageDriver,
} from "@/lib/storage";
import { ALLOWED_IMAGE_TYPES } from "@/lib/validation/upload";

const SIGNED_URL_TTL_SECONDS = 300;

/** Root folder for the "local" storage driver (development). */
export const LOCAL_UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Creates a short-lived signed PUT URL so the browser uploads directly to
 * object storage — image bytes never pass through the Next.js server.
 * The signature pins content type and length, so the client cannot upload
 * a different file than what was validated.
 */
export async function createSignedUpload(params: {
  userId: string;
  fileType: string;
  fileSize: number;
  kind: "artwork" | "avatar";
}) {
  // Vercel Blob uses its own client-upload protocol — the browser talks to
  // /api/uploads/blob instead of PUTting to a signed URL.
  if (storageDriver === "blob") {
    return { driver: "blob" as const };
  }

  const extension = ALLOWED_IMAGE_TYPES[params.fileType];
  const key = `${params.kind}/${params.userId}/${crypto.randomUUID()}.${extension}`;

  if (storageDriver === "local") {
    // Local driver: the "signed URL" is our own PUT endpoint, which performs
    // the same auth + validation checks the R2 signature would enforce.
    return {
      uploadUrl: `/api/uploads/local/${key}`,
      key,
      publicUrl: publicImageUrl(key),
    };
  }

  const command = new PutObjectCommand({
    Bucket: storageConfig.bucket,
    Key: key,
    ContentType: params.fileType,
    ContentLength: params.fileSize,
  });

  const uploadUrl = await getSignedUrl(getStorageClient(), command, {
    expiresIn: SIGNED_URL_TTL_SECONDS,
  });

  return { uploadUrl, key, publicUrl: publicImageUrl(key) };
}

/** Best-effort delete — a leaked orphan object must never fail a user action. */
export async function deleteStoredObject(key: string): Promise<void> {
  try {
    // Vercel Blob keys are absolute URLs.
    if (key.startsWith("https://")) {
      const { del } = await import("@vercel/blob");
      await del(key);
      return;
    }
    if (storageDriver === "local") {
      await fs.unlink(path.join(LOCAL_UPLOADS_DIR, key));
      return;
    }
    await getStorageClient().send(
      new DeleteObjectCommand({ Bucket: storageConfig.bucket, Key: key }),
    );
  } catch (error) {
    console.error(`[storage] failed to delete object "${key}":`, error);
  }
}
