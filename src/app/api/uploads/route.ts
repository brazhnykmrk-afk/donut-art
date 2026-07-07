import { NextResponse } from "next/server";

import { handleApiError, tooManyRequests } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { signedUploadSchema } from "@/lib/validation/upload";
import { createSignedUpload } from "@/services/storage-service";

/** Issues a signed URL for a direct browser → object storage upload. */
export async function POST(request: Request) {
  try {
    const session = await requireSession();

    const limit = rateLimit(`upload:${session.user.id}`, 30, 60 * 60 * 1000);
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const body = await request.json();
    const input = signedUploadSchema.parse(body);

    const upload = await createSignedUpload({
      userId: session.user.id,
      fileType: input.fileType,
      fileSize: input.fileSize,
      kind: input.kind,
    });

    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
