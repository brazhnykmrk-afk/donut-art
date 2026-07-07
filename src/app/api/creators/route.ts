import { NextResponse } from "next/server";
import { z } from "zod";

import { handleApiError } from "@/lib/api";
import { listCreators } from "@/services/creator-service";

// Search results must never be statically cached.
export const dynamic = "force-dynamic";

const searchSchema = z.object({
  q: z.string().trim().max(100).optional().default(""),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = searchSchema.parse({ q: searchParams.get("q") ?? undefined });
    const creators = await listCreators(params.q);
    return NextResponse.json({ items: creators });
  } catch (error) {
    return handleApiError(error);
  }
}
