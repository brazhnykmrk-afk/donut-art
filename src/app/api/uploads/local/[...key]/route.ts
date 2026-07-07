import { promises as fs } from "node:fs";
import path from "node:path";

import { NextResponse } from "next/server";

import { handleApiError, jsonError } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { storageDriver } from "@/lib/storage";
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/validation/upload";
import { LOCAL_UPLOADS_DIR } from "@/services/storage-service";

/**
 * Local-driver upload target (development only). Mirrors the guarantees a
 * signed R2 URL gives us: authenticated, own folder only, allowed image
 * types, size limit. The key shape is fixed, which also rules out path
 * traversal.
 */
const KEY_PATTERN =
  /^(artwork|avatar)\/[a-z0-9]+\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

export async function PUT(
  request: Request,
  { params }: { params: { key: string[] } },
) {
  try {
    if (storageDriver !== "local") {
      return jsonError("NOT_FOUND", "Local storage is disabled.", 404);
    }

    const session = await requireSession();

    const key = params.key.join("/");
    if (!KEY_PATTERN.test(key)) {
      return jsonError("INVALID_KEY", "Invalid upload key.", 400);
    }
    if (params.key[1] !== session.user.id) {
      return jsonError("FORBIDDEN", "You can only upload to your own folder.", 403);
    }

    const contentType = request.headers.get("content-type") ?? "";
    if (!ALLOWED_IMAGE_TYPES[contentType]) {
      return jsonError(
        "UNSUPPORTED_TYPE",
        "Only JPEG, PNG and WebP images are allowed.",
        415,
      );
    }

    const bytes = Buffer.from(await request.arrayBuffer());
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return jsonError("INVALID_SIZE", "Image must be 1 byte – 8 MB.", 413);
    }

    const filePath = path.join(LOCAL_UPLOADS_DIR, key);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, bytes);

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
