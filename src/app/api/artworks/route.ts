import { NextResponse } from "next/server";

import { handleApiError, tooManyRequests } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import {
  createArtworkSchema,
  gallerySearchSchema,
} from "@/lib/validation/artwork";
import { createArtwork, listGallery } from "@/services/artwork-service";

// Search results must never be statically cached.
export const dynamic = "force-dynamic";

/** Public gallery listing with search + pagination. */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = gallerySearchSchema.parse({
      q: searchParams.get("q") ?? undefined,
      page: searchParams.get("page") ?? undefined,
    });
    const result = await listGallery({ query: params.q, page: params.page });
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    const limit = rateLimit(`artwork:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const body = await request.json();
    const input = createArtworkSchema.parse(body);
    const artwork = await createArtwork(session.user.id, input);

    return NextResponse.json({ id: artwork.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
