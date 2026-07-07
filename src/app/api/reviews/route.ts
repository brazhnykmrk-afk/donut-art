import { NextResponse } from "next/server";

import { handleApiError, tooManyRequests } from "@/lib/api";
import { requireSession } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createReviewSchema } from "@/lib/validation/review";
import { submitReview } from "@/services/review-service";

export async function POST(request: Request) {
  try {
    const session = await requireSession();

    const limit = rateLimit(`review:${session.user.id}`, 20, 60 * 60 * 1000);
    if (!limit.ok) return tooManyRequests(limit.retryAfterSeconds);

    const body = await request.json();
    const input = createReviewSchema.parse(body);
    const review = await submitReview(session.user.id, input);

    return NextResponse.json({ id: review.id }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
