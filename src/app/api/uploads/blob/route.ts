import { NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

import { jsonError } from "@/lib/api";
import { auth } from "@/lib/auth";
import { storageDriver } from "@/lib/storage";
import { MAX_IMAGE_SIZE_BYTES } from "@/lib/validation/upload";

/**
 * Vercel Blob client-upload handler. Issues a short-lived upload token after
 * the same checks the other drivers enforce: signed-in user, image types
 * only, 8 MB limit, and a pathname inside artwork/ or avatar/.
 */
export async function POST(request: Request) {
  if (storageDriver !== "blob") {
    return jsonError("NOT_FOUND", "Blob storage is disabled.", 404);
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth();
        if (!session?.user?.id) {
          throw new Error("You must be signed in to upload.");
        }
        if (!/^(artwork|avatar)\//.test(pathname)) {
          throw new Error("Invalid upload path.");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: MAX_IMAGE_SIZE_BYTES,
          addRandomSuffix: true,
        };
      },
      // Fired by Vercel Blob after the upload finishes; metadata is saved by
      // the client via POST /api/artworks, so nothing to do here.
      onUploadCompleted: async () => {},
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return jsonError(
      "UPLOAD_REJECTED",
      error instanceof Error ? error.message : "Upload was rejected.",
      400,
    );
  }
}
